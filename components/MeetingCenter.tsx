
import React, { useState } from 'react';
import { 
  Calendar, Clock, Plus, Sparkles, Send, Check,
  Mic, FileAudio, FileText as FileTextIcon, 
  Printer, X, MessageSquare, MoreVertical,
  Trash2, Edit, Mail, Users, CheckCircle2,
  AlertCircle, Loader2
} from 'lucide-react';
import { Meeting, UserProfile, AppNotification } from '../types';
import { summarizeMeeting } from '../services/geminiService';
import CustomDateTimePicker from './CustomDateTimePicker';

interface MeetingCenterProps {
  meetings: Meeting[];
  addMeeting: (m: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  removeMeeting: (id: string) => void;
  user: UserProfile;
  onAddNotification: (n: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
}

const MeetingCenter: React.FC<MeetingCenterProps> = ({ meetings, addMeeting, updateMeeting, removeMeeting, user, onAddNotification }) => {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sourceType, setSourceType] = useState<'TEXT' | 'AUDIO' | 'FILE'>('TEXT');
  const [isCommunicating, setIsCommunicating] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString());
  const [formAgenda, setFormAgenda] = useState('');
  const [formParticipants, setFormParticipants] = useState('');
  const [shouldInvite, setShouldInvite] = useState(true);

  const openCreate = () => {
    setIsEditing(false);
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (m: Meeting) => {
    setIsEditing(true);
    setFormTitle(m.title);
    setFormDate(m.date); 
    setFormAgenda(m.agenda);
    setFormParticipants(m.participants.join(', '));
    setShowCreate(true);
  };

  const simulateEmail = async (subject: string, body: string, recipients: string[]) => {
    setIsCommunicating(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`Email Sent: ${subject} to ${recipients.join(', ')}`);
    setIsCommunicating(false);
    return true;
  };

  const handleSaveMeeting = async () => {
    const participantsList = formParticipants.split(',').map(p => p.trim()).filter(p => p);
    const meetingData = {
      title: formTitle,
      date: formDate,
      agenda: formAgenda,
      participants: participantsList,
    };

    if (isEditing && selectedMeeting) {
      updateMeeting(selectedMeeting.id, meetingData);
      setSelectedMeeting({ ...selectedMeeting, ...meetingData });
    } else {
      const meeting: Meeting = {
        id: `DIU-M-${Math.floor(Math.random() * 900) + 100}`,
        ...meetingData,
        status: 'SCHEDULED',
        comments: [`Meeting logged by ${user.name}`]
      };
      
      if (shouldInvite && participantsList.length > 0) {
        await simulateEmail(
          `Meeting Invitation: ${formTitle}`,
          `You are invited to a meeting regarding: ${formAgenda}. Date: ${new Date(formDate).toLocaleString()}`,
          participantsList
        );
        meeting.comments?.push(`Invitations sent to ${participantsList.length} participants.`);
      }
      
      addMeeting(meeting);
    }
    setShowCreate(false);
    resetForm();
  };

  const resetForm = () => {
    setFormTitle(''); setFormDate(new Date().toISOString()); setFormAgenda(''); setFormParticipants(''); setShouldInvite(true);
  };

  const handleSummarize = async () => {
    if (!selectedMeeting || !notes) return;
    setIsSummarizing(true);
    try {
      const summary = await summarizeMeeting(notes);
      const update = { minutes: summary, status: 'COMPLETED' as const };
      updateMeeting(selectedMeeting.id, update);
      setSelectedMeeting({ ...selectedMeeting, ...update });
    } catch (e) { alert("Error generating minutes."); }
    finally { setIsSummarizing(false); }
  };

  const handleFinalizeAndDistribute = async () => {
    if (!selectedMeeting || !selectedMeeting.minutes) return;
    
    const success = await simulateEmail(
      `Meeting Minutes: ${selectedMeeting.title}`,
      `Dear All,\n\nPlease find the minutes for the meeting held on ${new Date(selectedMeeting.date).toLocaleDateString()}:\n\n${selectedMeeting.minutes}`,
      selectedMeeting.participants
    );

    if (success) {
      const historyUpdate = [...(selectedMeeting.comments || []), `Minutes distributed to participants at ${new Date().toLocaleTimeString()}`];
      updateMeeting(selectedMeeting.id, { comments: historyUpdate });
      setSelectedMeeting({ ...selectedMeeting, comments: historyUpdate });
      onAddNotification({
        message: `Minutes distributed for: ${selectedMeeting.title}`,
        type: 'UPDATE',
        author: user.name
      });
    }
  };

  const handlePrintMinutes = () => {
    if (!selectedMeeting || !selectedMeeting.minutes) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Minutes - DIU</title><style>@page { size: A4; margin: 1in; } body { font-family: 'Times New Roman', serif; padding: 20px; line-height: 1.5; } h2 { text-align:center; margin-bottom: 5px; } .meta { border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 20px; }</style></head>
      <body><h2>DAFFODIL INTERNATIONAL UNIVERSITY</h2><div class="meta"><strong>Meeting:</strong> ${selectedMeeting.title}<br/><strong>Participants:</strong> ${selectedMeeting.participants.join(', ')}</div><div style="white-space:pre-wrap;">${selectedMeeting.minutes}</div></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleAddComment = () => {
    if (!selectedMeeting || !newComment.trim()) return;
    
    // Check for mentions like @Name
    const mentionMatch = newComment.match(/@(\w+)/);
    if (mentionMatch) {
      const mentionedName = mentionMatch[1];
      onAddNotification({
        message: `You were mentioned in meeting: ${selectedMeeting.title}`,
        type: 'MENTION',
        author: user.name
      });
    }

    const updated = [...(selectedMeeting.comments || []), `${user.name}: ${newComment}`];
    updateMeeting(selectedMeeting.id, { comments: updated });
    setSelectedMeeting({ ...selectedMeeting, comments: updated });
    setNewComment('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      <div className="lg:col-span-4 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Meeting Desk</h2>
          <button onClick={openCreate} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 shadow-xl hover:bg-indigo-700 transition-all">
            <Plus size={18} /><span>Log Entry</span>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {meetings.map(m => (
            <div key={m.id} onClick={() => { setSelectedMeeting(m); setNotes(m.minutes || ''); }} className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer group relative ${selectedMeeting?.id === m.id ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 shadow-lg scale-[1.02]' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 hover:scale-[1.01]'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-widest">{m.id}</span>
                <select 
                  className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase outline-none cursor-pointer border transition-all ${
                    m.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 
                    m.status === 'SCHEDULED' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  value={m.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateMeeting(m.id, { status: e.target.value as any })}
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <h4 className="font-black text-slate-900 dark:text-slate-100 truncate text-base leading-snug group-hover:text-indigo-800 dark:group-hover:text-indigo-400 transition-colors">{m.title}</h4>
              <div className="flex items-center space-x-4 mt-4 border-t border-slate-50 dark:border-slate-800 pt-4">
                <div className="flex items-center text-[10px] text-slate-400 font-black tracking-widest uppercase">
                  <Calendar size={12} className="mr-2" /> {new Date(m.date).toLocaleDateString('en-GB')}
                </div>
                <div className="flex items-center text-[10px] text-slate-400 font-black tracking-widest uppercase">
                  <Clock size={12} className="mr-2" /> {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {m.participants.length > 0 && (
                <div className="mt-3 flex items-center text-[9px] text-indigo-500 font-bold uppercase tracking-widest">
                  <Users size={12} className="mr-1.5" /> {m.participants.length} Invitees
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden flex flex-col shadow-sm transition-colors">
        {selectedMeeting ? (
          <>
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex justify-between items-start">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight tracking-tight">{selectedMeeting.title}</h2>
                <div className="flex items-center space-x-3">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] truncate max-w-md">
                    <Users size={12} className="inline mr-1" /> {selectedMeeting.participants.join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={handleFinalizeAndDistribute} 
                  disabled={!selectedMeeting.minutes || isCommunicating} 
                  className={`bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50 uppercase tracking-widest ${isCommunicating ? 'animate-pulse' : ''}`}
                >
                  {isCommunicating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  <span>Distribute Minutes</span>
                </button>
                <button onClick={handlePrintMinutes} className="p-3 text-slate-300 dark:text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-2xl transition-all" title="Print A4"><Printer size={22} /></button>
                <button onClick={() => openEdit(selectedMeeting)} className="p-3 text-slate-300 dark:text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-2xl transition-all" title="Edit Meta"><Edit size={22} /></button>
                <button onClick={() => { removeMeeting(selectedMeeting.id); setSelectedMeeting(null); }} className="p-3 text-slate-300 dark:text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-2xl transition-all" title="Delete"><Trash2 size={22} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 xl:grid-cols-2 gap-10 p-10 custom-scrollbar">
              <div className="space-y-8 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Meeting Transcript</h3>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {(['TEXT', 'AUDIO', 'FILE'] as const).map(t => (
                      <button key={t} onClick={() => setSourceType(t)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${sourceType === t ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div className="relative flex-1 min-h-[300px] flex flex-col">
                   <textarea className="w-full flex-1 p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-[32px] text-sm font-bold focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-all resize-none shadow-inner custom-scrollbar outline-none" placeholder="Enter rough meeting notes for AI processing..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                   <button onClick={handleSummarize} disabled={isSummarizing || !notes} className="mt-4 w-full bg-slate-900 dark:bg-slate-950 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-3 shadow-2xl active:scale-95 transition-all">
                    {isSummarizing ? <><Loader2 size={18} className="animate-spin" /><span>AI Finalizing...</span></> : <><Sparkles size={18} /><span>Generate AI Minutes</span></>}
                  </button>
                </div>

                <div className="pt-6 space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Coordination & Distribution Log</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedMeeting.comments?.map((c, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-[11px] font-bold border border-slate-100 dark:border-slate-700 italic flex items-start transition-colors">
                        {c.includes('distributed') || c.includes('sent') ? <CheckCircle2 size={14} className="text-emerald-500 mr-2 mt-0.5 shrink-0" /> : <MessageSquare size={14} className="text-slate-300 dark:text-slate-600 mr-2 mt-0.5 shrink-0" />}
                        <span className="text-slate-700 dark:text-slate-300">"{c}"</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-black focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100 outline-none" placeholder="Mention someone with @..." value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddComment()} />
                    <button onClick={handleAddComment} className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-all"><Send size={18} /></button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center">
                  <FileTextIcon size={16} className="mr-3" /> Official Minutes Registry
                </h3>
                <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-indigo-50 dark:border-indigo-900/30 rounded-[40px] overflow-hidden shadow-2xl min-h-[600px] flex flex-col transition-colors">
                  {selectedMeeting.minutes || isSummarizing ? (
                    <>
                      <textarea 
                        className="flex-1 w-full p-12 font-serif text-[13pt] leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none resize-none bg-white dark:bg-slate-800 custom-scrollbar shadow-inner"
                        value={selectedMeeting.minutes || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateMeeting(selectedMeeting.id, { minutes: val });
                          setSelectedMeeting({...selectedMeeting, minutes: val});
                        }}
                        placeholder="DIU official record..."
                      />
                      {selectedMeeting.minutes && !isCommunicating && (
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                            <AlertCircle size={12} className="mr-1.5" /> Distribution required after manual editing
                          </p>
                          <button onClick={handleFinalizeAndDistribute} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center space-x-2">
                             <Mail size={16} />
                             <span>Send Updated Minutes to All</span>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 italic text-sm p-16 text-center space-y-6">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center">
                        <Sparkles size={36} className="opacity-10" />
                      </div>
                      <p className="max-w-[180px] font-bold leading-relaxed uppercase tracking-tighter">Minutes record will be generated here. Direct manual editing is enabled.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-20">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
              <Calendar size={48} className="opacity-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">Meeting Command Center</h3>
            <p className="max-w-xs text-sm font-medium leading-relaxed opacity-60 uppercase tracking-tighter">Select an entry from the registry to manage transcripts and finalize official minutes.</p>
          </div>}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[48px] w-full max-w-4xl p-12 animate-in zoom-in-95 duration-300 border border-indigo-50 dark:border-indigo-900/30 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors">
            <h3 className="text-3xl font-black mb-10 text-slate-900 dark:text-slate-100 tracking-tight">{isEditing ? "Update Entry Metadata" : "Log Official DIU Meeting"}</h3>
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Official Meeting Header</label>
                    <input className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 bg-slate-50 dark:bg-slate-800 text-sm font-black focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 outline-none transition-all" placeholder="e.g. Academic Council - Fall 2025" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Participants (Emails or Names)</label>
                    <input className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 bg-slate-50 dark:bg-slate-800 text-sm font-black focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 outline-none transition-all" placeholder="Enter emails separated by commas..." value={formParticipants} onChange={(e) => setFormParticipants(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Key Objectives (Agenda)</label>
                    <textarea rows={4} className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-3xl px-6 py-5 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 outline-none resize-none transition-all" placeholder="Record primary agenda items..." value={formAgenda} onChange={(e) => setFormAgenda(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-6">
                  <CustomDateTimePicker
                    label="Meeting Protocol Schedule"
                    value={formDate}
                    onChange={setFormDate}
                    showTime={true}
                  />
                </div>
              </div>
              
              {!isEditing && (
                <div className="flex items-center space-x-3 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[32px] border border-indigo-100 dark:border-indigo-800">
                  <button 
                    onClick={() => setShouldInvite(!shouldInvite)}
                    className={`w-12 h-6 rounded-full transition-all relative ${shouldInvite ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${shouldInvite ? 'left-7' : 'left-1'}`}></div>
                  </button>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest">Auto-Invite Participants</span>
                    <span className="text-[9px] text-indigo-400 dark:text-indigo-600 font-bold uppercase tracking-tighter">Sends official email invitation upon creation</span>
                  </div>
                </div>
              )}

              <div className="pt-8 flex space-x-6">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-5 font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] text-[10px] hover:text-slate-600 transition-colors">Discard</button>
                <button 
                  onClick={handleSaveMeeting} 
                  disabled={isCommunicating}
                  className="flex-[2] bg-indigo-600 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  {isCommunicating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  <span>{isEditing ? "Save Protocol" : "Verify & Send Invites"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCenter;
