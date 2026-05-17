
import React, { useState, useEffect, useCallback } from 'react';
import { get, set } from 'idb-keyval';
import { 
  UserRole, UniDocument, Ticket, Meeting, UserProfile, 
  DocType, Status, TicketCategory, DocCategory, Todo, AppNotification,
  DeptFolder, DeptFile
} from './types';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import DocumentManager from './components/DocumentManager';
import TicketTracker from './components/TicketTracker';
import MeetingCenter from './components/MeetingCenter';
import TodoManager from './components/TodoManager';
import Settings from './components/Settings';
import Auth from './components/Auth';
import DepartmentalFilesManager from './components/DepartmentalFilesManager';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents' | 'deptFiles' | 'tickets' | 'meetings' | 'todo' | 'settings'>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('diu-theme') as 'light' | 'dark') || 'light';
  });
  
  const ROOT_ADMIN_EMAIL = 'iceoffice@daffodilvarsity.edu.bd';
  const ROOT_ADMIN_PASSWORD = 'Shimul@710003633';

  // Personnel Registry (Authorized emails list)
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(() => {
    const defaultRegistry = [ROOT_ADMIN_EMAIL, 'registrar@daffodilvarsity.edu.bd', 'dean.fe@daffodilvarsity.edu.bd'];
    try {
      const saved = localStorage.getItem('diu-authorized-registry');
      if (!saved) return defaultRegistry;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultRegistry;
    } catch (e) { return defaultRegistry; }
  });

  // User Database (Registered accounts)
  const [userDatabase, setUserDatabase] = useState<Record<string, UserProfile>>(() => {
    const saved = localStorage.getItem('diu-user-db');
    const initialDb = saved ? JSON.parse(saved) : {};
    if (!initialDb[ROOT_ADMIN_EMAIL]) {
      initialDb[ROOT_ADMIN_EMAIL] = {
        id: 'u-root',
        name: 'Root Administrator',
        email: ROOT_ADMIN_EMAIL,
        role: UserRole.SUPER_ADMIN,
        department: 'Dept. of ICE',
        password: ROOT_ADMIN_PASSWORD,
      };
    }
    return initialDb;
  });

  // Persistent user session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('diu-active-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Main Data States with Persistence
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [documents, setDocuments] = useState<UniDocument[]>([]);

  useEffect(() => {
    get('diu-documents-idb').then(val => {
      if (val) {
        setDocuments(val);
      } else {
        const saved = localStorage.getItem('diu-documents');
        if (saved) {
          try {
            setDocuments(JSON.parse(saved));
          } catch(e) {}
        }
      }
      setDocumentsLoaded(true);
    }).catch(() => {
      const saved = localStorage.getItem('diu-documents');
      if (saved) { try { setDocuments(JSON.parse(saved)); } catch(e) {} }
      setDocumentsLoaded(true);
    });
  }, []);

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('diu-tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('diu-meetings');
    return saved ? JSON.parse(saved) : [];
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('diu-todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [deptFolders, setDeptFolders] = useState<DeptFolder[]>(() => {
    const saved = localStorage.getItem('diu-dept-folders');
    return saved ? JSON.parse(saved) : [];
  });

  const [deptFilesLoaded, setDeptFilesLoaded] = useState(false);
  const [deptFiles, setDeptFiles] = useState<DeptFile[]>([]);

  useEffect(() => {
    get('diu-dept-files-idb').then(val => {
      if (val) {
        setDeptFiles(val);
      } else {
        const saved = localStorage.getItem('diu-dept-files');
        if (saved) {
          try {
            setDeptFiles(JSON.parse(saved));
          } catch(e) {}
        }
      }
      setDeptFilesLoaded(true);
    }).catch(() => {
      const saved = localStorage.getItem('diu-dept-files');
      if (saved) { try { setDeptFiles(JSON.parse(saved)); } catch(e) {} }
      setDeptFilesLoaded(true);
    });
  }, []);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('diu-notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'n-1',
        message: 'Secure environment established. Welcome to Admin AI.',
        date: new Date().toISOString(),
        read: false,
        type: 'ALERT',
        author: 'System'
      }
    ];
  });

  // Effects for LocalStorage Syncing
  useEffect(() => { try { localStorage.setItem('diu-authorized-registry', JSON.stringify(authorizedEmails)); } catch(e) {} }, [authorizedEmails]);
  useEffect(() => { try { localStorage.setItem('diu-user-db', JSON.stringify(userDatabase)); } catch(e) {} }, [userDatabase]);
  useEffect(() => {
    if (documentsLoaded) {
      set('diu-documents-idb', documents).catch(e => {
        console.error("IDB save error:", e);
        try { localStorage.setItem('diu-documents', JSON.stringify(documents)); } catch(e2) {}
      });
    }
  }, [documents, documentsLoaded]);
  useEffect(() => { try { localStorage.setItem('diu-tickets', JSON.stringify(tickets)); } catch(e) {} }, [tickets]);
  useEffect(() => { try { localStorage.setItem('diu-meetings', JSON.stringify(meetings)); } catch(e) {} }, [meetings]);
  useEffect(() => { try { localStorage.setItem('diu-todos', JSON.stringify(todos)); } catch(e) {} }, [todos]);
  useEffect(() => { try { localStorage.setItem('diu-dept-folders', JSON.stringify(deptFolders)); } catch(e) {} }, [deptFolders]);
  useEffect(() => {
    if (deptFilesLoaded) {
      set('diu-dept-files-idb', deptFiles).catch(e => {
        console.error("Dept files IDB save error:", e);
        try { localStorage.setItem('diu-dept-files', JSON.stringify(deptFiles)); } catch(e2) {}
      });
    }
  }, [deptFiles, deptFilesLoaded]);
  useEffect(() => { try { localStorage.setItem('diu-notifications', JSON.stringify(notifications)); } catch(e) {} }, [notifications]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('diu-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('diu-active-user', JSON.stringify(user));
  };

  const handleRegister = (user: UserProfile) => {
    setUserDatabase(prev => ({ ...prev, [user.email.toLowerCase()]: user }));
    handleLogin(user);
  };

  const handleLogout = () => {
    if (window.confirm("Confirm secure session termination?")) {
      setCurrentUser(null);
      localStorage.removeItem('diu-active-user');
      setActiveTab('dashboard');
    }
  };

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'date' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `n-${Date.now()}`,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      return [...updated]; // Force new array reference
    });
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updates };
      setUserDatabase(prevDb => ({ ...prevDb, [newUser.email.toLowerCase()]: newUser }));
      localStorage.setItem('diu-active-user', JSON.stringify(newUser));
      return newUser;
    });
  };

  // CRUD HANDLERS
  const addDocument = (doc: UniDocument) => setDocuments(prev => [doc, ...prev]);
  const updateDocument = (id: string, updates: Partial<UniDocument>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };
  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addTicket = (ticket: Ticket) => setTickets(prev => [ticket, ...prev]);
  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const removeTicket = (id: string) => {
    if(window.confirm("Are you sure?")) {
      setTickets(prev => prev.filter(t => t.id !== id));
    }
  };

  const addMeeting = (meeting: Meeting) => setMeetings(prev => [meeting, ...prev]);
  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };
  const removeMeeting = (id: string) => {
    if(window.confirm("Delete meeting record?")) {
      setMeetings(prev => prev.filter(m => m.id !== id));
    }
  };

  const addTodo = (todo: Todo) => setTodos(prev => [todo, ...prev]);
  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };
  const removeTodo = (id: string) => {
    if(window.confirm("Delete this task?")) {
      setTodos(prev => prev.filter(t => t.id !== id));
    }
  };

  const addDeptFolder = (folder: DeptFolder) => setDeptFolders(prev => [folder, ...prev]);
  const removeDeptFolder = (id: string) => {
    if(window.confirm("Delete this folder and all its files?")) {
      setDeptFolders(prev => prev.filter(f => f.id !== id));
      setDeptFiles(prev => prev.filter(f => f.folderId !== id));
    }
  };

  const addDeptFile = (file: DeptFile) => setDeptFiles(prev => [file, ...prev]);
  const updateDeptFile = (id: string, updates: Partial<DeptFile>) => {
    setDeptFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };
  const removeDeptFile = (id: string) => {
    if(window.confirm("Delete this file?")) {
      setDeptFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  if (!currentUser) {
    return (
      <Auth 
        onLogin={handleLogin} 
        onRegister={handleRegister}
        authorizedRegistry={authorizedEmails} 
        userDatabase={userDatabase}
        rootAdminEmail={ROOT_ADMIN_EMAIL} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser} 
        onLogout={handleLogout} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar 
          user={currentUser} 
          theme={theme} 
          toggleTheme={toggleTheme} 
          notifications={notifications} 
          onMarkRead={markAllAsRead}
          onMarkIndividualRead={markAsRead}
          setActiveTab={setActiveTab}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <Dashboard 
                documents={documents} 
                tickets={tickets} 
                meetings={meetings} 
                todos={todos}
                user={currentUser}
              />
            )}
            {activeTab === 'documents' && (
              <DocumentManager 
                documents={documents} 
                addDocument={addDocument} 
                updateDocument={updateDocument}
                removeDocument={removeDocument}
                user={currentUser}
              />
            )}
            {activeTab === 'deptFiles' && (
              <DepartmentalFilesManager 
                deptFolders={deptFolders}
                deptFiles={deptFiles}
                addFolder={addDeptFolder}
                removeFolder={removeDeptFolder}
                addFile={addDeptFile}
                updateFile={updateDeptFile}
                removeFile={removeDeptFile}
              />
            )}
            {activeTab === 'tickets' && (
              <TicketTracker 
                tickets={tickets} 
                addTicket={addTicket} 
                updateTicket={updateTicket} 
                removeTicket={removeTicket}
                user={currentUser}
                onAddNotification={addNotification}
              />
            )}
            {activeTab === 'meetings' && (
              <MeetingCenter 
                meetings={meetings} 
                addMeeting={addMeeting} 
                updateMeeting={updateMeeting} 
                removeMeeting={removeMeeting}
                user={currentUser}
                onAddNotification={addNotification}
              />
            )}
            {activeTab === 'todo' && (
              <TodoManager 
                todos={todos}
                addTodo={addTodo}
                updateTodo={updateTodo}
                removeTodo={removeTodo}
                user={currentUser}
              />
            )}
            {activeTab === 'settings' && (
              <Settings 
                user={currentUser} 
                onUpdateProfile={updateProfile} 
                onLogout={handleLogout} 
                theme={theme} 
                toggleTheme={toggleTheme}
                authorizedRegistry={authorizedEmails}
                setAuthorizedRegistry={setAuthorizedEmails}
                rootAdminEmail={ROOT_ADMIN_EMAIL}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
