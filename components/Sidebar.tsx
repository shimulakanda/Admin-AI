
import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Ticket, 
  Calendar, 
  ListChecks,
  Settings, 
  LogOut,
  ExternalLink,
  Phone,
  Globe,
  Mail,
  FolderOpen
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: UserProfile;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'deptFiles', label: 'Dept. Files', icon: FolderOpen },
    { id: 'tickets', label: 'Issue Tracking', icon: Ticket },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'todo', label: 'To-Do List', icon: ListChecks },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  return (
    <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col hidden lg:flex transition-colors duration-300">
      <div className="p-8 pb-4">
        {/* Text-based Branding replacing the Logo Image */}
        <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md min-h-[100px]">
          <span className="text-xl font-black text-diu-blue dark:text-diu-green text-center leading-[1.1] tracking-tighter uppercase">
            Daffodil <br/> International <br/> University
          </span>
        </div>
        <div className="mt-6 px-1 text-center">
          <span className="text-[10px] text-diu-blue dark:text-diu-green font-black uppercase tracking-[0.4em] block leading-none">Management & Coordination</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-diu-blue text-white shadow-xl shadow-diu-blue/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-diu-blue dark:hover:text-diu-green'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-diu-blue dark:group-hover:text-diu-green'} />
              <span className={`font-bold text-[10px] uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Official Departmental Contact Footer */}
      <div className="p-6 mt-auto border-t border-slate-100 dark:border-slate-800 space-y-4">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-inner">
          <h4 className="text-[9px] font-black text-diu-blue dark:text-diu-green uppercase tracking-widest mb-3 flex items-center">
            <Globe size={12} className="mr-2" /> Coordination Desk
          </h4>
          <div className="space-y-2.5">
            <div>
              <p className="text-[10px] font-black text-slate-900 dark:text-slate-100 leading-tight">Md. Shahidul Islam Shimul</p>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Assistant Coordination Officer</p>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500">
                <Phone size={10} className="shrink-0" />
                <span className="text-[9px] font-bold">+8801811 458828 | Ext.: 50111</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500">
                <Mail size={10} className="shrink-0" />
                <span className="text-[9px] font-bold truncate">iceoffice@daffodilvarsity.edu.bd</span>
              </div>
              <a 
                href="https://daffodilvarsity.edu.bd/department/ice" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center space-x-2 text-diu-blue dark:text-diu-green hover:underline decoration-2"
              >
                <ExternalLink size={10} className="shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-tighter">ICE Department Web</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
           <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest leading-none">Daffodil Smart City<br/>Savar, Dhaka-1216</p>
           <button 
            onClick={onLogout}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-diu-red hover:border-diu-red transition-all"
            title="Secure Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
