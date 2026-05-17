
import React, { useState, useMemo } from 'react';
import { 
  Ticket as TicketIcon, Search, Plus, Sparkles, X, Trash2, Edit, 
  ChevronDown, CheckCircle2, Circle, MessageSquare, Filter,
  ArrowUpRight, Clock, User, AlertCircle
} from 'lucide-react';
import { Ticket, TicketCategory, Status, UserProfile, AppNotification } from '../types';
import { suggestResolution } from '../services/geminiService';

interface TicketTrackerProps {
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  removeTicket: (id: string) => void;
  user: UserProfile;
  onAddNotification: (n: Omit<AppNotification, 'id' | 'date' | 'read'>) => void;
}

const TicketTracker: React.FC<TicketTrackerProps> = ({ tickets, addTicket, updateTicket, removeTicket, user, onAddNotification }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<TicketCategory | 'ALL'>('ALL');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>(TicketCategory.GENERAL);
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tickets, searchTerm, filterCategory]);

  const handleSave = () => {
    if (!newTitle || !newDesc) return;

    // Check for mentions in description
    const mentionMatch = newDesc.match(/@(\w+)/);
    if (mentionMatch) {
      onAddNotification({
        message: `You were tagged in a support ticket: ${newTitle}`,
        type: 'MENTION',
        author: user.name
      });
    }

    if (editingTicketId) {
      updateTicket(editingTicketId, {
        title: newTitle,
        category: newCategory,
        description: newDesc,
        priority: newPriority
      });
      if(selectedTicket?.id === editingTicketId) {
        setSelectedTicket(prev => prev ? {...prev, title: newTitle, category: newCategory, description: newDesc, priority: newPriority} : null);
      }
      setEditingTicketId(null);
    } else {
      const ticket: Ticket = {
        id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
        title: newTitle,
        category: newCategory,
        description: newDesc,
        status: Status.PENDING,
        assignedTo: 'Admin Office',
        createdAt: new Date().toISOString().split('T')[0],
        priority: newPriority,
        history: [`Ticket initialized by ${user.name}`]
      };
      addTicket(ticket);
    }
    setShowCreate(false);
    resetForm();
  };

  const toggleComplete = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
    const newStatus = ticket.status === Status.APPROVED ? Status.PENDING : Status.APPROVED;
    const historyEntry = `${newStatus === Status.APPROVED ? 'Completed' : 'Re-opened'} by ${user.name} at ${new Date().toLocaleTimeString()}`;
    updateTicket(ticket.id, { 
      status: newStatus,
      history: [...ticket.history, historyEntry]
    });
    if (selectedTicket?.id === ticket.id) {
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus, history: [...prev.history, historyEntry] } : null);
    }
    if (newStatus === Status.APPROVED) {
      onAddNotification({
        message: `Ticket ${ticket.id} has been marked as completed.`,
        type: 'UPDATE',
        author: user.name
      });
    }
  };

  const openEdit = (t: Ticket) => {
    setEditingTicketId(t.id);
    setNewTitle(t.title);
    setNewCategory(t.category);
    setNewDesc(t.description);
    setNewPriority(t.priority);
    setShowCreate(true);
  };

  const resetForm = () => {
    setNewTitle(''); setNewDesc(''); setNewCategory(TicketCategory.GENERAL); setNewPriority('MEDIUM');
    setEditingTicketId(null);
  };

  const getAiHelp = async (ticket: Ticket) => {
    setIsSuggesting(true);
    try {
      const suggestion = await suggestResolution(ticket.category, ticket.description);
      setAiSuggestions(suggestion);
    } catch (e) { alert(e instanceof Error ? e.message : "Error getting suggestions."); }
    finally { setIsSuggesting(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-fade-in transition-colors">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Support Desk</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Manage tickets, issues, and student correspondence</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter support logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64 shadow-sm dark:text-slate-100 transition-all"
            />
          </div>
          <button 
            onClick={() => { resetForm(); setShowCreate(true); }}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all uppercase tracking-widest"
          >
            <Plus size={18} />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        
        {/* Left: Ticket List */}
        <div className="lg:col-span-4 flex flex-col space-y-4 min-h-0">
          <div className="flex items-center space-x-2 px-1">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {Object.values(TicketCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => { setSelectedTicket(ticket); setAiSuggestions(''); }} 
                className={`group relative p-6 rounded-[32px] border-2 transition-all cursor-pointer ${
                  selectedTicket?.id === ticket.id 
                    ? 'bg-emerald-50 dark:bg-slate-800 border-emerald-200 dark:border-emerald-700 shadow-lg scale-[1.02]' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-100'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => toggleComplete(e, ticket)}
                      className={`transition-colors ${ticket.status === Status.APPROVED ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-400'}`}
                      title={ticket.status === Status.APPROVED ? "Mark as Pending" : "Mark as Completed"}
                    >
                      {ticket.status === Status.APPROVED ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full uppercase tracking-widest">{ticket.id}</span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                    ticket.priority === 'HIGH' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 
                    ticket.priority === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                
                <h4 className={`font-black text-slate-900 dark:text-slate-100 truncate text-base leading-snug group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors ${ticket.status === Status.APPROVED ? 'line-through opacity-50' : ''}`}>
                  {ticket.title}
                </h4>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-2 font-medium italic">
                  {ticket.description}
                </p>

                <div className="flex items-center justify-between mt-6 border-t border-slate-50 dark:border-slate-800 pt-4">
                  <div className="flex items-center text-[10px] text-slate-400 dark:text-slate-600 font-bold">
                    <Clock size={12} className="mr-1" /> {ticket.createdAt}
                  </div>
                  <div className="flex items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">
                    {ticket.category.split(' ')[0]}
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-700 bg-slate-50 dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <AlertCircle size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-40">No entries found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed View */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden flex flex-col shadow-sm min-h-0 transition-colors">
          {selectedTicket ? (
            <>
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em] bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full">
                        {selectedTicket.category}
                      </span>
                      {selectedTicket.status === Status.APPROVED && (
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.25em] bg-emerald-600 dark:bg-emerald-500 px-4 py-1.5 rounded-full shadow-sm">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">{selectedTicket.title}</h3>
                    <div className="flex items-center space-x-6 text-slate-400 dark:text-slate-500 text-xs font-bold pt-1">
                      <div className="flex items-center"><User size={14} className="mr-2" /> Assigned to {selectedTicket.assignedTo}</div>
                      <div className="flex items-center"><Clock size={14} className="mr-2" /> Logged on {selectedTicket.createdAt}</div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => getAiHelp(selectedTicket)} 
                      disabled={isSuggesting}
                      className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center space-x-2 shadow-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                      {isSuggesting ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></div> : <Sparkles size={18} />}
                      <span>Ask AI Support</span>
                    </button>
                    <button onClick={() => openEdit(selectedTicket)} className="p-3 text-slate-400 dark:text-slate-500 hover:text-emerald-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-2xl transition-all"><Edit size={22} /></button>
                    <button onClick={() => { removeTicket(selectedTicket.id); setSelectedTicket(null); }} className="p-3 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-2xl transition-all"><Trash2 size={22} /></button>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center">
                    <MessageSquare size={14} className="mr-3 text-emerald-500" /> Support Message / Statement
                  </h4>
                  <div className="bg-white dark:bg-slate-800 p-10 rounded-[32px] text-slate-700 dark:text-slate-200 text-sm font-bold border-2 border-slate-50 dark:border-slate-800 leading-relaxed shadow-inner italic">
                    "{selectedTicket.description}"
                  </div>
                </div>
                
                {aiSuggestions && (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <h4 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                      <Sparkles size={16} className="mr-3" /> AI Proposed Resolution Path
                    </h4>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30 p-10 rounded-[32px] text-emerald-900 dark:text-emerald-100 text-sm font-bold italic whitespace-pre-wrap leading-relaxed shadow-sm">
                      {aiSuggestions}
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6">Interaction Timeline</h4>
                  <div className="space-y-4">
                    {selectedTicket.history.map((h, i) => (
                      <div key={i} className="flex items-center text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-4 group-hover:scale-150 transition-transform"></div>
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button 
                  onClick={(e) => toggleComplete(e, selectedTicket)}
                  className={`px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg transition-all flex items-center space-x-2 ${
                    selectedTicket.status === Status.APPROVED 
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none'
                  }`}
                >
                  {selectedTicket.status === Status.APPROVED ? (
                    <>
                      <Clock size={16} />
                      <span>Mark as Pending</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Complete Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-700 text-center p-20">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
                <TicketIcon size={48} className="opacity-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-2">Support Command Center</h3>
              <p className="max-w-xs text-sm font-medium leading-relaxed opacity-60 uppercase tracking-tighter">
                Select an entry to view full details, use AI assistance, and mark task completion.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create/Edit Ticket */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[48px] w-full max-w-xl p-10 animate-in zoom-in-95 duration-200 border border-emerald-50 dark:border-emerald-900/30 shadow-2xl flex flex-col max-h-[90vh] transition-colors">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {editingTicketId ? "Modify Entry" : "New Support Record"}
              </h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><X size={24} /></button>
            </div>
            
            <div className="space-y-6 overflow-y-auto px-1 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Identity / Subject Header</label>
                <input 
                  autoFocus
                  className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 bg-slate-50 dark:bg-slate-800 text-sm font-black focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-slate-100" 
                  placeholder="Mention someone with @..." 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Support Domain</label>
                  <select className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 bg-slate-50 dark:bg-slate-800 text-sm font-black focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer transition-all dark:text-slate-100" value={newCategory} onChange={(e) => setNewCategory(e.target.value as TicketCategory)}>
                    {Object.values(TicketCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Urgency Index</label>
                  <select className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 bg-slate-50 dark:bg-slate-800 text-sm font-black focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer transition-all dark:text-slate-100" value={newPriority} onChange={(e) => setNewPriority(e.target.value as any)}>
                    <option value="LOW">Routine</option>
                    <option value="MEDIUM">Standard</option>
                    <option value="HIGH">Critical</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Detailed Message / Statement</label>
                <textarea 
                  rows={6} 
                  className="w-full border-2 border-slate-100 dark:border-slate-800 rounded-3xl px-6 py-4 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all dark:text-slate-100" 
                  placeholder="Record full observation or student statement here..." 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                />
              </div>
            </div>

            <div className="flex space-x-6 pt-10">
              <button 
                onClick={() => setShowCreate(false)} 
                className="flex-1 py-4 font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] text-[10px] hover:text-slate-600 transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleSave} 
                className="flex-[2] bg-emerald-600 text-white py-4 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-emerald-700 active:scale-95 transition-all"
              >
                {editingTicketId ? "Save Protocol" : "Authorize Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTracker;
