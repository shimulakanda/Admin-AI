import React, { useState } from 'react';
import { 
  User, Shield, Bell, Database, HelpCircle, 
  Camera, Check, X, Building, Lock, Mail, 
  Sparkles, LogOut, Save, AlertCircle, Moon, Sun, 
  UserPlus, Trash2, Users, Key, Edit
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface SettingsProps {
  user: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  authorizedRegistry: string[];
  setAuthorizedRegistry: (registry: string[]) => void;
  rootAdminEmail: string;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, onUpdateProfile, onLogout, theme, toggleTheme,
  authorizedRegistry, setAuthorizedRegistry, rootAdminEmail
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [password, setPassword] = useState(user.password || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [success, setSuccess] = useState(false);

  // Registry Management State
  const [newEmail, setNewEmail] = useState('');
  const isSuperAdmin = user.email.toLowerCase() === rootAdminEmail.toLowerCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateProfile({ name, department, password, avatar });
    setSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const addRegistryEmail = () => {
    const email = newEmail.toLowerCase().trim();
    if (!email || !email.endsWith('@daffodilvarsity.edu.bd')) {
      alert("Please provide a valid official DIU email.");
      return;
    }
    if (authorizedRegistry.includes(email)) {
      alert("This email is already registered in the authorized database.");
      return;
    }
    setAuthorizedRegistry([...authorizedRegistry, email]);
    setNewEmail('');
  };

  const removeRegistryEmail = (email: string) => {
    if (email === user.email) {
      alert("You cannot remove your own authorized status.");
      return;
    }
    if (window.confirm(`Revoke access for ${email}?`)) {
      setAuthorizedRegistry(authorizedRegistry.filter(e => e !== email));
    }
  };

  const sections = [
    { id: 'profile', title: 'Personal Profile', icon: User, desc: 'Update your contact information and office details.' },
    { id: 'security', title: 'Security & Access', icon: Shield, desc: 'Manage password, 2FA, and authorized devices.' },
    { id: 'notifications', title: 'Communication Prefs', icon: Bell, desc: 'Choose how you want to be alerted for urgent issues.' },
    { id: 'data', title: 'Data & Archiving', icon: Database, desc: 'Manage document retention policies and bulk exports.' },
    { id: 'help', title: 'System Support', icon: HelpCircle, desc: 'Documentation, API guides, and system status.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Profile Header */}
      <div className="flex flex-col items-stretch justify-between gap-8 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 p-10 opacity-5 text-diu-blue dark:text-diu-green pointer-events-none">
          <Sparkles size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-10 text-center md:text-left z-10">
          <div className="relative group shrink-0">
            <div className="w-40 h-40 bg-diu-blue dark:bg-slate-800 text-white rounded-[40px] flex items-center justify-center text-4xl font-black shadow-2xl shadow-diu-blue/20 overflow-hidden border-8 border-white dark:border-slate-900">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="Avatar" /> : name.charAt(0)}
            </div>
            {isEditing && (
              <label className="absolute bottom-[-10px] right-[-10px] p-4 bg-slate-900 dark:bg-diu-blue text-white rounded-[20px] shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <Camera size={24} />
              </label>
            )}
          </div>
          
          <div className="mt-6 md:mt-0 flex-1 space-y-4">
            {isEditing ? (
              <div className="space-y-4 w-full">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Display Name</label>
                  <input 
                    className="text-2xl font-black text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-3 outline-none focus:ring-4 focus:ring-diu-blue/10 transition-all w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Department</label>
                    <select 
                      className="text-xs font-black text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-3 outline-none focus:ring-4 focus:ring-diu-blue/10 transition-all w-full appearance-none cursor-pointer"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="Dept. of ICE">Dept. of ICE</option>
                      <option value="Dept. of CSE">Dept. of CSE</option>
                      <option value="Dept. of EEE">Dept. of EEE</option>
                      <option value="Registrar Office">Registrar Office</option>
                      <option value="Dean Office">Dean Office</option>
                      <option value="HR Management">HR Management</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Passcode Update</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="password"
                        className="text-xs font-black text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 pr-6 py-3 outline-none focus:ring-4 focus:ring-diu-blue/10 transition-all w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h1 className="text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-1">{user.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${isSuperAdmin ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'}`}>
                    {isSuperAdmin ? 'Root System Controller' : 'Verified Personnel'}
                  </span>
                  <span className="bg-diu-blue/5 dark:bg-diu-blue/10 text-diu-blue dark:text-blue-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-diu-blue/10 dark:border-diu-blue/20 shadow-sm">{user.department}</span>
                  <span className="flex items-center space-x-1.5 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest px-1">
                    <Mail size={12} />
                    <span>{user.email}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="z-10 flex justify-center md:justify-end space-x-3 mt-4">
          {isEditing ? (
            <>
              <button onClick={() => { setIsEditing(false); setName(user.name); setDepartment(user.department); setAvatar(user.avatar); setPassword(user.password || ''); }} className="p-5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-[24px] hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all shadow-sm flex items-center space-x-2">
                <X size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cancel</span>
              </button>
              <button onClick={handleSave} className="bg-diu-blue text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-diu-blue/20 hover:bg-slate-900 transition-all flex items-center space-x-3">
                <Save size={20} />
                <span>Save Profile</span>
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="bg-diu-blue dark:bg-slate-800 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-diu-blue/10 hover:bg-slate-900 transition-all flex items-center space-x-3">
              {/* Corrected: Added missing 'Edit' icon from lucide-react */}
              <Edit size={20} />
              <span>Modify Identity</span>
            </button>
          )}
        </div>
      </div>

      {/* Database Registry Section (Gated specifically to Root Admin Email) */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 animate-in slide-in-from-top-4">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-3xl shadow-inner">
              <Users size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">University Personnel Registry</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Only pre-authorized emails can Register (Initialize) or Log In to Admin AI.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="email" 
                placeholder="Whitelist DIU Email (e.g. name@daffodilvarsity.edu.bd)" 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <button 
              onClick={addRegistryEmail}
              className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest flex items-center space-x-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all"
            >
              <UserPlus size={20} />
              <span>Whitelist Email</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authorizedRegistry.map(email => (
              <div key={email} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 group hover:border-indigo-100 transition-all">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 uppercase border ${email === rootAdminEmail ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white dark:bg-slate-900 text-indigo-600 border-slate-100 dark:border-slate-700'}`}>
                    {email.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate uppercase tracking-tighter">{email}</span>
                    {email === rootAdminEmail && <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Root Admin</span>}
                  </div>
                </div>
                {email !== user.email && (
                  <button onClick={() => removeRegistryEmail(email)} className="p-3 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme Selection Bar */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
            <div className={`p-4 rounded-3xl transition-all ${theme === 'dark' ? 'bg-diu-blue/20 text-diu-blue' : 'bg-amber-50 text-amber-500'}`}>
                {theme === 'dark' ? <Moon size={32} /> : <Sun size={32} />}
            </div>
            <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Display Configuration</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Toggle between light and high-contrast dark modes.</p>
            </div>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-2 rounded-[32px] w-full md:w-auto">
            <button onClick={() => theme === 'dark' && toggleTheme()} className={`flex-1 md:flex-none px-10 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${theme === 'light' ? 'bg-white text-diu-blue shadow-xl' : 'text-slate-400 hover:text-slate-200'}`}><Sun size={14} /><span>Classic Light</span></button>
            <button onClick={() => theme === 'light' && toggleTheme()} className={`flex-1 md:flex-none px-10 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${theme === 'dark' ? 'bg-slate-900 text-diu-green shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}><Moon size={14} /><span>Night Terminal</span></button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-6 rounded-[32px] flex items-center space-x-4 animate-in slide-in-from-top-4 duration-300">
           <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg"><Check size={20} /></div>
           <div>
             <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Update Success</p>
             <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Personnel records synchronized.</p>
           </div>
        </div>
      )}

      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-500">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button key={section.id} className="flex flex-col p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[40px] text-left hover:border-diu-blue dark:hover:border-diu-green hover:shadow-2xl transition-all group">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-[20px] group-hover:bg-diu-blue dark:group-hover:bg-diu-green group-hover:text-white transition-all shadow-sm mb-6 w-fit"><Icon size={28} /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-2 group-hover:text-diu-blue dark:group-hover:text-diu-green transition-colors uppercase tracking-tight">{section.title}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed tracking-tight">{section.desc}</p>
                </div>
              </button>
            );
          })}
          
          <div className="bg-diu-blue dark:bg-slate-800 p-10 rounded-[40px] flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-500">
            <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-diu-green rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="z-10">
              <h3 className="text-2xl font-black text-white mb-2 leading-tight">System Feedback</h3>
              <p className="text-blue-100 dark:text-slate-300 text-[11px] font-medium leading-relaxed">Request administrative features or report technical inconsistencies to the DIU IT Cell.</p>
            </div>
            <button className="z-10 mt-8 bg-white dark:bg-slate-900 text-diu-blue dark:text-diu-green px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">Initiate Ticket</button>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button onClick={onLogout} className="flex items-center space-x-3 text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-rose-100 transition-all shadow-xl shadow-rose-100/50 dark:shadow-none"><LogOut size={20} /><span>Terminate Identity Session</span></button>
        </div>
      )}
    </div>
  );
};

export default Settings;