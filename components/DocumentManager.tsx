
import React, { useState, useMemo } from 'react';
import { 
  FileText, Megaphone, Mail, ClipboardCheck, Plus, Search, 
  Sparkles, Trash2, Edit, UploadCloud, Info, 
  Check, X, Download, Printer, Send, Loader2,
  Paperclip, Inbox, Archive, File as FileIcon,
  Image as ImageIcon, Clock, User, Filter,
  Eye, ExternalLink, ChevronDown
} from 'lucide-react';
import { UniDocument, DocType, Status, UserProfile, DocCategory, Attachment } from '../types';
import { generateDraft, generateFullDocument } from '../services/geminiService';
import CustomDateTimePicker from './CustomDateTimePicker';

const AttachmentBadge: React.FC<{ att: Attachment, onRemove?: () => void }> = ({ att, onRemove }) => {
  const isImg = att.type.startsWith('image/');
  const isPdf = att.type === 'application/pdf';
  return (
    <div className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl group hover:border-diu-blue transition-all shadow-sm">
      {isImg ? <ImageIcon size={14} className="text-diu-blue" /> : isPdf ? <FileText size={14} className="text-diu-red" /> : <FileIcon size={14} className="text-slate-400" />}
      <span className="text-[10px] font-black text-slate-600 truncate max-w-[120px] uppercase tracking-tighter">{att.name}</span>
      {onRemove && (
        <button onClick={onRemove} className="text-slate-300 hover:text-diu-red transition-colors ml-1">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

interface DocumentManagerProps {
  documents: UniDocument[];
  addDocument: (doc: UniDocument) => void;
  updateDocument: (id: string, updates: Partial<UniDocument>) => void;
  removeDocument: (id: string) => void;
  user: UserProfile;
}

type EmailFolder = 'INBOX' | 'SENT' | 'DRAFTS' | 'TRASH';
type EntryMode = 'CREATE' | 'UPLOAD';

const DocumentManager: React.FC<DocumentManagerProps> = ({ documents, addDocument, updateDocument, removeDocument, user }) => {
  const [activeSection, setActiveSection] = useState<DocType>(DocType.APPLICATION);
  const [emailFolder, setEmailFolder] = useState<EmailFolder>('SENT');
  const [showCompose, setShowCompose] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>('CREATE');
  const [viewingDoc, setViewingDoc] = useState<UniDocument | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formSubject, setFormSubject] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCategory, setFormCategory] = useState<DocCategory>(DocCategory.ACADEMIC);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formRefNo, setFormRefNo] = useState('');
  const [formAttachments, setFormAttachments] = useState<Attachment[]>([]);
  const [formRecipients, setFormRecipients] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const handleAiGenerateAll = async () => {
    if (!aiPrompt) return alert("Please enter instructions for the AI.");
    setIsGeneratingAll(true);
    try {
      const result = await generateFullDocument(activeSection, aiPrompt, "");
      if (result.subject) setFormSubject(result.subject);
      if (result.body) setFormBody(result.body);
    } catch (error) {
      alert(error instanceof Error ? error.message : "AI Service Error: " + String(error));
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const sections = [
    { id: DocType.APPLICATION, label: 'Applications', icon: FileText, color: 'text-diu-blue' },
    { id: DocType.NOTICE, label: 'Notices', icon: Megaphone, color: 'text-diu-green' },
    { id: DocType.RECOMMENDATION, label: 'Recommendations', icon: ClipboardCheck, color: 'text-amber-600' },
    { id: DocType.EMAIL, label: 'Official Emails', icon: Mail, color: 'text-diu-blue' },
  ];

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (doc.type !== activeSection) return false;
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.refNo.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (activeSection === DocType.EMAIL) {
        if (emailFolder === 'TRASH') return doc.status === Status.TRASH;
        if (doc.status === Status.TRASH) return false;
        if (emailFolder === 'SENT') return doc.status === Status.SENT;
        if (emailFolder === 'DRAFTS') return doc.status === Status.PENDING;
        return true;
      }
      return doc.status !== Status.TRASH;
    });
  }, [documents, activeSection, emailFolder, searchTerm]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          data: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAction = async (isSendEmail = false) => {
    if (!formSubject && activeSection !== DocType.RECOMMENDATION) {
      alert("Subject header is mandatory.");
      return;
    }
    
    const recipientList = formRecipients.split(/[,; ]+/).filter(r => r.includes('@'));
    
    if (isSendEmail) {
      if (recipientList.length === 0) {
        alert("Please provide at least one recipient email.");
        return;
      }
      setIsSending(true);
      
      // Real Email Integration: Construction of Gmail link
      const subject = encodeURIComponent(formSubject);
      const body = encodeURIComponent(formBody);
      const recipients = recipientList.join(',');
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipients}&su=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');
      
      // Update local record to show it was sent
      await new Promise(res => setTimeout(res, 800));
    }

    const docData: Partial<UniDocument> = {
      title: formSubject || (formAttachments[0]?.name || 'Uploaded Document'),
      content: formBody,
      category: formCategory,
      date: formDate,
      attachments: formAttachments,
      type: activeSection,
      author: user.name,
      department: user.department,
      recipients: recipientList,
      status: isSendEmail ? Status.SENT : Status.PENDING
    };

    if (editingId) {
      updateDocument(editingId, docData);
    } else {
      addDocument({
        id: `doc-${Date.now()}`,
        refNo: formRefNo || `DIU/${user.department.split(' ').pop()}/${activeSection.slice(0, 3).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`,
        status: isSendEmail ? Status.SENT : Status.PENDING,
        ...docData as UniDocument
      });
    }
    
    setIsSending(false);
    closeCompose();
  };

  const closeCompose = () => {
    setShowCompose(false);
    setEditingId(null);
    setFormSubject(''); setFormBody(''); setFormAttachments([]); setFormRecipients(''); setFormRefNo(''); setFormDate(new Date().toISOString().split('T')[0]);
  };

  const openEdit = (doc: UniDocument) => {
    setEditingId(doc.id);
    setFormSubject(doc.title);
    setFormBody(doc.content);
    setFormCategory(doc.category);
    setFormDate(doc.date);
    setFormRefNo(doc.refNo);
    setFormAttachments(doc.attachments || []);
    setFormRecipients(doc.recipients?.join(', ') || '');
    setEntryMode(doc.content ? 'CREATE' : 'UPLOAD');
    setShowCompose(true);
  };

  const updateDocStatus = (id: string, newStatus: Status) => {
    updateDocument(id, { status: newStatus });
    if (viewingDoc && viewingDoc.id === id) {
      setViewingDoc({ ...viewingDoc, status: newStatus });
    }
  };

  const handlePrint = (doc: UniDocument) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const content = doc.content || `Physical Archive Record: ${doc.title}`;
    const attachmentsList = doc.attachments?.map(a => `<li>${a.name}</li>`).join('') || 'No attachments';
    printWindow.document.write(`
      <html>
        <head>
          <title>DIU Record - ${doc.refNo}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #1e293b; }
            .header { border-bottom: 2px solid #004e98; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { color: #004e98; font-weight: 900; font-size: 24px; margin-bottom: 10px; }
            .ref { float: right; font-weight: bold; }
            .content { white-space: pre-wrap; margin-bottom: 60px; text-align: justify; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 10px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">DAFFODIL INTERNATIONAL UNIVERSITY</div>
            <div class="ref">Ref: ${doc.refNo}</div>
            <div>Date: ${doc.date}</div>
            <div>Department: ${doc.department}</div>
          </div>
          <h3>${doc.title}</h3>
          <div class="content">${content}</div>
          <div class="footer">
            <p>DIU Admin AI Generated Record | Author: ${doc.author}</p>
            <p>Archive Status: ${doc.status}</p>
            <ul>${attachmentsList}</ul>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-[24px] shadow-sm overflow-x-auto no-scrollbar transition-colors">
          {sections.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button 
                key={s.id}
                onClick={() => { setActiveSection(s.id); setViewingDoc(null); setSearchTerm(''); }}
                className={`flex items-center space-x-3 px-6 py-3.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  isActive ? `bg-diu-blue text-white shadow-xl shadow-diu-blue/20` : `text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800`
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : s.color} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {(activeSection === DocType.APPLICATION || activeSection === DocType.NOTICE) ? (
            <>
              <button 
                onClick={() => { closeCompose(); setEntryMode('CREATE'); setShowCompose(true); }}
                className="bg-diu-blue text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-diu-blue/10 hover:bg-slate-900 active:scale-95 transition-all flex items-center space-x-2.5"
              >
                <Plus size={16} />
                <span>Create {activeSection === DocType.APPLICATION ? 'App' : 'Notice'}</span>
              </button>
              <button 
                onClick={() => { closeCompose(); setEntryMode('UPLOAD'); setShowCompose(true); }}
                className="bg-diu-green text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-diu-green/10 hover:bg-[#348e3a] active:scale-95 transition-all flex items-center space-x-2.5"
              >
                <UploadCloud size={16} />
                <span>Upload {activeSection === DocType.APPLICATION ? 'App' : 'Notice'}</span>
              </button>
            </>
          ) : activeSection === DocType.RECOMMENDATION ? (
            <button 
              onClick={() => { closeCompose(); setEntryMode('UPLOAD'); setShowCompose(true); }}
              className="bg-diu-green text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-diu-green/10 hover:bg-[#348e3a] active:scale-95 transition-all flex items-center space-x-3"
            >
              <UploadCloud size={18} />
              <span>Log Recommendation</span>
            </button>
          ) : (
            <button 
              onClick={() => { closeCompose(); setEntryMode('CREATE'); setShowCompose(true); }}
              className="bg-diu-blue text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-diu-blue/10 hover:bg-slate-900 active:scale-95 transition-all flex items-center space-x-3"
            >
              {activeSection === DocType.EMAIL ? <Mail size={18} /> : <Plus size={18} />}
              <span>{activeSection === DocType.EMAIL ? 'Compose Email' : 'Add Record'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm flex overflow-hidden transition-colors">
        {activeSection === DocType.EMAIL && (
          <div className="w-64 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-800/20 p-5">
            <div className="space-y-2">
              {[
                { id: 'SENT', label: 'Transmitted', icon: Send },
                { id: 'DRAFTS', label: 'Protocol Drafts', icon: FileIcon },
                { id: 'TRASH', label: 'Repository Trash', icon: Trash2 },
              ].map(folder => {
                const Icon = folder.icon;
                const isActive = emailFolder === folder.id;
                return (
                  <button 
                    key={folder.id}
                    onClick={() => setEmailFolder(folder.id as EmailFolder)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive ? 'bg-diu-blue text-white shadow-lg' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <Icon size={14} />
                      <span>{folder.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-4 bg-white dark:bg-slate-900 transition-colors">
            <div className="flex-1 relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-diu-blue transition-colors" size={18} />
              <input 
                type="text" 
                placeholder={`Search ${activeSection.toLowerCase()} library...`}
                className="w-full pl-14 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-diu-blue/5 dark:text-slate-100 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 transition-colors">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => setViewingDoc(doc)}
                  className="group flex items-center px-10 py-6 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer relative"
                >
                  <div className="flex items-center space-x-6 shrink-0 w-1/4">
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center text-[11px] font-black text-white shadow-sm ${doc.type === DocType.EMAIL ? 'bg-diu-blue' : doc.type === DocType.APPLICATION ? 'bg-diu-blue' : doc.type === DocType.NOTICE ? 'bg-diu-green' : 'bg-amber-500'}`}>
                      {doc.recipients?.[0]?.charAt(0).toUpperCase() || doc.author.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                        {doc.type === DocType.EMAIL ? (doc.recipients?.join(', ') || 'Global') : doc.author}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{doc.refNo}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 px-8">
                    <div className="flex items-center space-x-3 mb-1">
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">{doc.title}</p>
                      {doc.attachments && doc.attachments.length > 0 && (
                        <Paperclip size={12} className="text-diu-blue shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-medium opacity-80 italic leading-none">
                      {doc.content ? doc.content.substring(0, 100) : `Repository Evidence Log: ${doc.attachments?.[0]?.name || 'Physical Archive'}`}
                    </p>
                  </div>

                  <div className="shrink-0 text-right flex items-center space-x-6">
                    <div className="space-y-1.5 min-w-[100px]">
                      <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{doc.date}</p>
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter block text-center ${
                        doc.status === Status.APPROVED ? 'bg-diu-green/10 text-diu-green border border-diu-green/20' : 
                        doc.status === Status.SENT ? 'bg-diu-blue/10 text-diu-blue border border-diu-blue/20' :
                        doc.status === Status.PENDING ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>

                  <div className="absolute right-24 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-800 p-2 rounded-[20px] shadow-2xl border border-slate-100 dark:border-slate-700 scale-110">
                    <button onClick={(e) => { e.stopPropagation(); setViewingDoc(doc); }} className="p-3 text-slate-400 hover:text-diu-blue hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all" title="View Details"><Eye size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handlePrint(doc); }} className="p-3 text-slate-400 hover:text-diu-blue hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all" title="Print"><Printer size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeDocument(doc.id); }} className="p-3 text-slate-400 hover:text-diu-red hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all" title="Delete"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-200 dark:text-slate-800 py-32 space-y-4">
                <Inbox size={80} className="opacity-10" />
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">No Repository Data</h3>
                  <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest mt-1">Initiate a new protocol to populate this library</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCompose && (
        <div className="fixed inset-0 bg-diu-slate/80 backdrop-blur-md z-[200] flex items-end justify-center md:items-center p-0 md:p-8 animate-fade-in">
          <div className={`bg-white dark:bg-slate-900 rounded-t-[40px] md:rounded-[48px] shadow-2xl flex flex-col max-h-[95vh] w-full overflow-hidden transition-colors ${activeSection === DocType.EMAIL ? 'max-w-2xl' : 'max-w-5xl'}`}>
            <div className="bg-diu-blue text-white px-10 py-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-white/10 shadow-inner">
                   {activeSection === DocType.EMAIL ? <Mail size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.25em]">Registry Management</h3>
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-1">
                    {activeSection === DocType.EMAIL ? 'Compose Official Email' : `New ${activeSection.toLowerCase()}`}
                  </p>
                </div>
              </div>
              <button onClick={closeCompose} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50 p-10">
              <div className="max-w-4xl mx-auto space-y-8">
                {activeSection === DocType.EMAIL && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Recipient Emails (Real Sending)</label>
                    <input 
                      className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[20px] px-6 py-4 text-sm font-black focus:border-diu-blue outline-none transition-all"
                      placeholder="registrar@daffodilvarsity.edu.bd, exam@..."
                      value={formRecipients}
                      onChange={(e) => setFormRecipients(e.target.value)}
                    />
                  </div>
                )}

                {entryMode === 'CREATE' && (
                  <div className="space-y-4 mb-8 bg-diu-blue/5 dark:bg-diu-blue/10 p-6 sm:p-8 rounded-[32px] border border-diu-blue/10 dark:border-diu-blue/20">
                    <div className="flex items-center space-x-2 px-2 text-diu-blue dark:text-blue-400">
                      <Sparkles size={16} />
                      <label className="text-xs font-black uppercase tracking-widest">AI Document Generator</label>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <input 
                        className="flex-1 bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-700 rounded-[20px] px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-diu-blue/10"
                        placeholder="What do you want to write about? (e.g., Application for leave...)"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                      <button
                        onClick={handleAiGenerateAll}
                        disabled={isGeneratingAll || !aiPrompt}
                        className="bg-diu-blue shrink-0 text-white px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {isGeneratingAll ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        <span>Generate Both</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Header / Title</label>
                  </div>
                  <input 
                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[24px] px-8 py-5 text-sm font-black outline-none focus:ring-4 focus:ring-diu-blue/5 dark:focus:ring-diu-green/5 focus:border-diu-blue dark:focus:border-diu-green dark:text-slate-100 transition-all shadow-sm" 
                    placeholder="Enter document subject..." 
                    value={formSubject} 
                    onChange={(e) => setFormSubject(e.target.value)} 
                  />
                </div>

                {entryMode === 'UPLOAD' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                      </div>
                      <input 
                        type="date"
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[24px] px-8 py-5 text-sm font-black outline-none focus:ring-4 focus:ring-diu-blue/5 dark:focus:ring-diu-green/5 focus:border-diu-blue dark:focus:border-diu-green dark:text-slate-100 transition-all shadow-sm"
                        value={formDate} 
                        onChange={(e) => setFormDate(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference Number</label>
                      </div>
                      <input 
                        type="text"
                        placeholder="Leave blank to auto-generate"
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[24px] px-8 py-5 text-sm font-black outline-none focus:ring-4 focus:ring-diu-blue/5 dark:focus:ring-diu-green/5 focus:border-diu-blue dark:focus:border-diu-green dark:text-slate-100 transition-all shadow-sm"
                        value={formRefNo} 
                        onChange={(e) => setFormRefNo(e.target.value)} 
                      />
                    </div>
                  </div>
                )}

                {entryMode === 'UPLOAD' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Evidence / Attachments</label>
                    </div>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[32px] p-10 flex flex-col items-center justify-center bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                      <UploadCloud size={40} className="text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-4 text-center">Click to browse or drag and drop files<br/><span className="text-[10px] font-medium leading-loose opacity-80">(Supports PDF, Images, Word - Max 5MB total)</span></p>
                      <input id="file-upload" type="file" multiple onChange={handleFileUpload} className="hidden" />
                      <button className="bg-diu-green text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-diu-green/20 pointer-events-none">Select Files</button>
                    </div>
                    {formAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {formAttachments.map((att, i) => (
                           <AttachmentBadge key={i} att={att} onRemove={() => setFormAttachments(prev => prev.filter((_, idx) => idx !== i))} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entryMode === 'UPLOAD' ? 'Optional Notes' : 'Core Narrative Content'}</label>
                  </div>
                  <textarea 
                    className="w-full h-80 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[32px] p-8 text-base font-serif leading-[1.8] text-slate-800 dark:text-slate-200 outline-none focus:border-diu-blue transition-all resize-none shadow-sm" 
                    placeholder="DIU official narrative body..." 
                    value={formBody} 
                    onChange={(e) => setFormBody(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div className="px-10 py-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button 
                onClick={() => handleAction(activeSection === DocType.EMAIL)}
                disabled={isSending}
                className="bg-diu-blue text-white px-16 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-diu-blue/20 hover:bg-slate-900 active:scale-95 transition-all flex items-center space-x-3 disabled:opacity-50"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : activeSection === DocType.EMAIL ? <Send size={18} /> : <Check size={18} />}
                <span>{isSending ? 'Transmitting' : activeSection === DocType.EMAIL ? 'Originally Send Email' : 'Authorize Protocol'}</span>
              </button>
              <button onClick={closeCompose} className="p-4 text-slate-300 hover:text-diu-red rounded-2xl transition-all"><Trash2 size={24} /></button>
            </div>
          </div>
        </div>
      )}

      {viewingDoc && (
        <div className="fixed inset-0 bg-diu-slate/95 backdrop-blur-2xl z-[250] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[60px] w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{viewingDoc.title}</h3>
                <p className="text-xs font-bold text-slate-400">{viewingDoc.refNo} • Authorized {viewingDoc.date}</p>
              </div>
              <button onClick={() => setViewingDoc(null)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-white dark:bg-slate-900">
               {viewingDoc.attachments && viewingDoc.attachments.length > 0 && (
                 <div className="mb-10 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Attached Documents</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {viewingDoc.attachments.map((att, i) => (
                       <a
                         key={i}
                         href={att.data}
                         download={att.name}
                         className="flex items-center space-x-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl hover:border-diu-blue transition-colors group"
                       >
                         <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                           {att.type.startsWith('image/') ? <ImageIcon size={18} className="text-diu-blue" /> : att.type === 'application/pdf' ? <FileText size={18} className="text-diu-red" /> : <FileIcon size={18} className="text-slate-400" />}
                         </div>
                         <div className="min-w-0 flex-1">
                           <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{att.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate mt-0.5">Click to download</p>
                         </div>
                       </a>
                     ))}
                   </div>
                 </div>
               )}
               <div className="font-serif text-[14pt] leading-[2] text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                 {viewingDoc.content}
               </div>
            </div>
            <div className="p-10 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button onClick={() => handlePrint(viewingDoc)} className="bg-white dark:bg-slate-900 border border-slate-200 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                <Printer size={18} /> <span>Print Protocol</span>
              </button>
              {viewingDoc.type === DocType.EMAIL && viewingDoc.recipients && (
                <button 
                  onClick={() => {
                    const subject = encodeURIComponent(viewingDoc.title);
                    const body = encodeURIComponent(viewingDoc.content);
                    const recipients = viewingDoc.recipients?.join(',') || '';
                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipients}&su=${subject}&body=${body}`;
                    window.open(gmailUrl, '_blank');
                  }}
                  className="bg-diu-blue text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2"
                >
                  <Send size={18} /> <span>Open in Gmail</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
