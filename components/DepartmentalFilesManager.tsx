import React, { useState } from 'react';
import { DeptFolder, DeptFile, Attachment } from '../types';
import { 
  Folder, FileIcon, Plus, UploadCloud, X, Settings2, Trash2,
  ChevronRight, Calendar as CalendarIcon, FileImage, FileText as FileTextIcon
} from 'lucide-react';

interface DepartmentalFilesManagerProps {
  deptFolders: DeptFolder[];
  deptFiles: DeptFile[];
  addFolder: (folder: DeptFolder) => void;
  removeFolder: (id: string) => void;
  addFile: (file: DeptFile) => void;
  updateFile: (id: string, updates: Partial<DeptFile>) => void;
  removeFile: (id: string) => void;
}

const DepartmentalFilesManager: React.FC<DepartmentalFilesManagerProps> = ({ 
  deptFolders, deptFiles, addFolder, removeFolder, addFile, updateFile, removeFile 
}) => {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formRefNo, setFormRefNo] = useState('');
  const [formAttachments, setFormAttachments] = useState<Attachment[]>([]);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);

  const openFileModal = (file?: DeptFile) => {
    if (file) {
      setEditingFileId(file.id);
      setFormTitle(file.title);
      setFormDate(file.date);
      setFormRefNo(file.refNo);
      setFormAttachments(file.attachments);
    } else {
      setEditingFileId(null);
      setFormTitle('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormRefNo('');
      setFormAttachments([]);
    }
    setShowFileModal(true);
  };

  const handleCreateFolder = () => {
    if (!newFolderName) return;
    addFolder({
      id: `folder-${Date.now()}`,
      name: newFolderName,
      createdAt: new Date().toISOString()
    });
    setNewFolderName('');
    setShowFolderModal(false);
  };

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

  const handleUploadFile = () => {
    if (!activeFolder || !formTitle || formAttachments.length === 0) {
      alert("Folder, Title, and At least one file attachment is required.");
      return;
    }
    
    if (editingFileId) {
      updateFile(editingFileId, {
        title: formTitle,
        date: formDate,
        refNo: formRefNo,
        attachments: formAttachments
      });
    } else {
      addFile({
        id: `dfile-${Date.now()}`,
        folderId: activeFolder,
        title: formTitle,
        date: formDate,
        refNo: formRefNo || `DIU/FILE/${new Date().getFullYear()}/${Math.floor(Math.random() * 900) + 100}`,
        attachments: formAttachments,
        createdAt: new Date().toISOString()
      });
    }
    
    setShowFileModal(false);
    setFormTitle('');
    setFormRefNo('');
    setFormAttachments([]);
    setEditingFileId(null);
  };

  const filesInActiveFolder = deptFiles.filter(f => f.folderId === activeFolder);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-sm">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="p-4 bg-amber-100/50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
            <Folder size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Departmental Files</h1>
            <div className="flex items-center text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              <span>{deptFolders.length} Folders</span>
              <span className="mx-2">•</span>
              <span>{deptFiles.length} Total Files</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={() => setShowFolderModal(true)}
            className="bg-amber-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-500/10 hover:bg-amber-600 transition-all flex items-center space-x-2.5"
          >
            <Plus size={16} />
            <span>Create Folder</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Folders</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {deptFolders.length === 0 ? (
              <div className="text-center p-8 text-slate-400 font-medium text-sm">No folders created yet.</div>
            ) : deptFolders.map(folder => (
              <div 
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${activeFolder === folder.id ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Folder size={18} className="shrink-0" />
                  <span className="font-bold text-sm truncate">{folder.name}</span>
                </div>
                <div className="flex items-center space-x-2 pl-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFolder(folder.id); }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ChevronRight size={14} className={activeFolder === folder.id ? 'opacity-100' : 'opacity-0'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden flex flex-col min-h-[500px]">
          {activeFolder ? (
            <>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Folder size={20} className="text-amber-500" />
                  <h3 className="font-black text-slate-800 dark:text-slate-100">{deptFolders.find(f => f.id === activeFolder)?.name}</h3>
                </div>
                <button 
                  onClick={() => openFileModal()}
                  className="bg-diu-blue text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-diu-blue/10 hover:bg-slate-800 transition-all flex items-center space-x-2"
                >
                  <UploadCloud size={14} />
                  <span>Upload File</span>
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {filesInActiveFolder.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <FileIcon size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm">No files uploaded in this folder.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filesInActiveFolder.map(file => (
                      <div key={file.id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate" title={file.title}>{file.title}</h4>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Ref: {file.refNo}</p>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100">
                            <button 
                              onClick={() => openFileModal(file)}
                              className="p-2 text-slate-300 hover:text-diu-blue hover:bg-diu-blue/5 rounded-xl transition-colors shrink-0"
                            >
                              <Settings2 size={14} />
                            </button>
                            <button 
                              onClick={() => removeFile(file.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-4">
                          <CalendarIcon size={12} className="mr-1.5" />
                          {file.date}
                        </div>
                        <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                          {file.attachments.map((att, i) => (
                            <a 
                              key={i}
                              href={att.data}
                              download={att.name}
                              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center space-x-1.5 hover:border-diu-blue transition-colors max-w-full"
                            >
                              {att.type.startsWith('image/') ? <FileImage size={10} className="text-diu-blue shrink-0" /> : <FileTextIcon size={10} className="text-diu-red shrink-0" />}
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{att.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <Folder size={64} className="mb-6 opacity-10" />
              <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300 mb-2">No Folder Selected</h3>
              <p className="text-sm font-medium">Select a folder from the sidebar to view or upload files.</p>
            </div>
          )}
        </div>
      </div>

      {showFolderModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowFolderModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Create New Folder</h3>
            <input 
              autoFocus
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-amber-500 mb-6"
              placeholder="Enter folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <button 
              onClick={handleCreateFolder}
              className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {showFileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setShowFileModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} /></button>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">{editingFileId ? 'Edit Departmental File' : 'Upload Departmental File'}</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">File Title</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-diu-blue"
                  placeholder="Enter file title..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Date</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-diu-blue"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Reference Number</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-diu-blue"
                    placeholder="Optional auto-generated..."
                    value={formRefNo}
                    onChange={(e) => setFormRefNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Attach Files</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => document.getElementById('dept-file-upload')?.click()}>
                  <UploadCloud size={32} className="text-slate-400 mb-3" />
                  <p className="text-xs font-bold text-slate-500 mb-1">Click to select files</p>
                  <input id="dept-file-upload" type="file" multiple onChange={handleFileUpload} className="hidden" />
                </div>
                {formAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formAttachments.map((att, i) => (
                      <div key={i} className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{att.name}</span>
                        <button onClick={() => setFormAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleUploadFile}
                className="w-full bg-diu-blue text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-colors mt-4"
              >
                {editingFileId ? 'Update File Record' : 'Upload File Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentalFilesManager;
