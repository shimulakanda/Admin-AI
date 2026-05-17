
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Globe, Moon, Sun, X, Check } from 'lucide-react';
import { UserProfile, AppNotification } from '../types';

interface TopBarProps {
  user: UserProfile;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  notifications: AppNotification[];
  onMarkRead: () => void;
  onMarkIndividualRead: (id: string) => void;
  setActiveTab: (tab: any) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  user, theme, toggleTheme, notifications, onMarkRead, onMarkIndividualRead, setActiveTab 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGlobe, setShowGlobe] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10 z-10 transition-colors duration-300">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-diu-blue dark:group-focus-within:text-diu-green transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Universal DIU Search..." 
            className="w-full pl-14 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-diu-blue/5 dark:focus:ring-diu-green/5 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-bold placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 relative" ref={notifRef}>
           <button 
             onClick={toggleTheme}
             className="p-3 text-slate-300 dark:text-slate-500 hover:text-diu-blue dark:hover:text-diu-green hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
             title={theme === 'light' ? "Activate Dark Mode" : "Activate Light Mode"}
           >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>
           <button 
             onClick={() => setShowGlobe(!showGlobe)}
             className="p-3 text-slate-300 dark:text-slate-500 hover:text-diu-blue dark:hover:text-diu-green hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
           >
            <Globe size={22} />
          </button>
          
          {showGlobe && (
            <div className="absolute top-16 right-0 w-48 bg-white dark:bg-slate-800 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-700 p-4 animate-fade-in z-[100]">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Regional Settings</h4>
               <button className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">English (University Default)</button>
               <button className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">Bangla (Regional)</button>
            </div>
          )}

           <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 text-slate-300 dark:text-slate-500 hover:text-diu-blue dark:hover:text-diu-green hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all ${showNotifications ? 'bg-slate-50 dark:bg-slate-800 text-diu-blue' : ''}`}
           >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-diu-red rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-16 right-0 w-80 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 animate-fade-in z-[100] max-h-[500px] flex flex-col transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications ({unreadCount})</h4>
                <button 
                  onClick={(e) => { e.stopPropagation(); onMarkRead(); }} 
                  className="text-[9px] font-black text-diu-blue dark:text-diu-green uppercase tracking-widest hover:underline transition-all"
                >
                  Mark all read
                </button>
              </div>
              <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {notifications.length > 0 ? notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => !n.read && onMarkIndividualRead(n.id)}
                    className={`p-4 rounded-[20px] transition-all border cursor-pointer ${n.read ? 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 opacity-60' : 'bg-diu-blue/5 dark:bg-diu-green/5 border-diu-blue/10 dark:border-diu-green/10 hover:bg-diu-blue/10 dark:hover:bg-diu-green/10'}`}
                  >
                    <div className="flex items-start justify-between">
                      <p className={`text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed`}>{n.message}</p>
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${n.read ? 'bg-transparent' : 'bg-diu-blue dark:bg-diu-green'}`}></span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase">{n.author}</span>
                      <span className="text-[8px] font-medium text-slate-300 uppercase">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center opacity-30 italic text-slate-400 text-xs">No notifications yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-10 w-px bg-slate-100 dark:bg-slate-800"></div>
        
        {/* Fixed Profile Navigation */}
        <button 
          onClick={() => setActiveTab('settings')}
          className="flex items-center space-x-4 pl-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-2xl transition-all group"
          title="Profile Settings"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 dark:text-slate-100 leading-none group-hover:text-diu-blue dark:group-hover:text-diu-green transition-colors">{user.name}</p>
            <p className="text-[9px] font-black text-diu-green uppercase tracking-widest mt-1.5">{user.department}</p>
          </div>
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-diu-blue dark:text-diu-green rounded-2xl overflow-hidden flex items-center justify-center font-black text-lg shadow-sm border border-slate-200 dark:border-slate-700 group-hover:border-diu-blue dark:group-hover:border-diu-green transition-all">
            {user.avatar ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
