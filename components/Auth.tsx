
import React, { useState } from 'react';
import { Mail, Lock, User, Building, ArrowRight, AlertCircle, Camera, Plus, Loader2, ShieldCheck, Database, Info } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
  onRegister: (user: UserProfile) => void;
  authorizedRegistry: string[];
  userDatabase: Record<string, UserProfile>;
  rootAdminEmail: string;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, authorizedRegistry, userDatabase, rootAdminEmail }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Dept. of ICE');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const ALLOWED_DOMAIN = '@daffodilvarsity.edu.bd';

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const lowerEmail = email.toLowerCase().trim();

    if (!lowerEmail) {
      setError("Please enter your official university email.");
      return;
    }

    if (!lowerEmail.endsWith(ALLOWED_DOMAIN)) {
      setError(`Access Denied. Only ${ALLOWED_DOMAIN} accounts are authorized.`);
      return;
    }

    const registryNormalized = authorizedRegistry.map(e => e.toLowerCase().trim());
    if (!registryNormalized.includes(lowerEmail)) {
      setError(`Authorization Failed: Email not found in Registry. Contact ${rootAdminEmail}.`);
      return;
    }

    if (isLogin) {
      const user = userDatabase[lowerEmail];
      if (!user) {
        setError("Account not initialized. Use 'Initialize' tab to register.");
        return;
      }
      if (user.password !== password) {
        setError("Incorrect passcode. Identity verification failed.");
        return;
      }
      
      setIsVerifying(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsVerifying(false);
      onLogin(user);
    } else {
      if (userDatabase[lowerEmail]) {
        setError("This account is already initialized. Please sign in.");
        return;
      }
      if (!name || !password) {
        setError('Required personnel details are missing.');
        return;
      }
      if (password.length < 6) {
        setError('Passcode must be at least 6 characters.');
        return;
      }

      setIsVerifying(true);
      await new Promise(resolve => setTimeout(resolve, 1800));

      const userRole = lowerEmail === rootAdminEmail.toLowerCase() ? UserRole.SUPER_ADMIN : UserRole.DEPT_OFFICER;

      const newUser: UserProfile = {
        id: `u-${Date.now()}`,
        name: name,
        email: lowerEmail,
        role: userRole,
        department: department,
        password: password,
        avatar: avatar
      };

      setIsVerifying(false);
      onRegister(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 flex items-center justify-center p-6 animate-fade-in transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[60px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col relative">
        
        {isVerifying && (
          <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Loader2 size={64} className="text-diu-blue dark:text-diu-green animate-spin" />
              <ShieldCheck size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-diu-blue dark:text-diu-green" />
            </div>
            <div className="text-center px-10">
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Verifying Identity</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">Connecting to Secure Registry Server...</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 px-12 pt-20 pb-12 text-center flex flex-col items-center border-b border-slate-50 dark:border-slate-800">
          <div className="p-10 bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 mb-10 transition-transform hover:scale-[1.02] flex items-center justify-center w-full">
            <span className="text-3xl font-black text-diu-blue dark:text-diu-green text-center leading-[1.1] tracking-tighter uppercase">
              Daffodil <br/> International <br/> University
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-diu-blue tracking-tight uppercase tracking-[0.3em]">Admin AI</h1>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Institutional Access Control System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-12 pb-12 space-y-6 mt-10">
          <div className="flex bg-slate-50 dark:bg-slate-800 p-2 rounded-[28px] mb-4 shadow-inner">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3.5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-diu-blue dark:text-diu-green shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3.5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-diu-blue dark:text-diu-green shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Initialize
            </button>
          </div>

          <div className="space-y-5">
            {!isLogin && (
              <>
                <div className="flex flex-col items-center mb-4">
                  <label className="relative group cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    <div className="w-24 h-24 rounded-[36px] bg-slate-50 dark:bg-slate-800 border-4 border-dashed border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-diu-blue dark:group-hover:border-diu-green transition-all shadow-inner">
                      {avatar ? (
                        <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <Camera size={24} className="text-slate-300 dark:text-slate-600 group-hover:text-diu-blue dark:group-hover:text-diu-green transition-colors" />
                      )}
                    </div>
                    <div className="absolute bottom-[-2px] right-[-2px] bg-diu-blue dark:bg-diu-green text-white p-2 rounded-xl shadow-2xl group-hover:scale-110 transition-transform">
                      <Plus size={12} />
                    </div>
                  </label>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-4">Official Photo ID</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Official Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                    <input
                      type="text"
                      className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-diu-blue/5 dark:focus:ring-diu-green/5 dark:text-white focus:bg-white dark:focus:bg-slate-700 outline-none transition-all shadow-sm"
                      placeholder="Full Name as per Office ID"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">University Email</label>
                <span className="text-[8px] font-black text-diu-blue dark:text-diu-green bg-diu-blue/5 dark:bg-diu-green/10 px-2 py-0.5 rounded uppercase tracking-widest">DIU Secured</span>
              </div>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                <input
                  type="email"
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-diu-blue/5 dark:focus:ring-diu-green/5 dark:text-white focus:bg-white dark:focus:bg-slate-700 outline-none transition-all shadow-sm"
                  placeholder="officer@daffodilvarsity.edu.bd"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Secure Passcode</label>
              <div className="relative">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                <input
                  type="password"
                  className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-diu-blue/5 dark:focus:ring-diu-green/5 dark:text-white focus:bg-white dark:focus:bg-slate-700 outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Assigned Office</label>
                <div className="relative">
                  <Building size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" />
                  <select
                    className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-diu-blue/5 dark:focus:ring-diu-green/5 dark:text-white focus:bg-white dark:focus:bg-slate-700 outline-none transition-all appearance-none cursor-pointer shadow-sm"
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
              </div>
            )}
          </div>

          {error && (
            <div className="flex flex-col space-y-3 text-diu-red bg-diu-red/5 p-5 rounded-[24px] animate-fade-in border border-diu-red/10">
              <div className="flex items-center space-x-3">
                <AlertCircle size={18} />
                <p className="text-[10px] font-black uppercase tracking-widest leading-normal">{error}</p>
              </div>
              {!isLogin && error.includes("Registry") && (
                <div className="pt-2 mt-2 border-t border-diu-red/10">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter italic text-center">
                    Note: Your official DIU email must be pre-authorized by the Super Admin ({rootAdminEmail}).
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-diu-blue text-white py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-diu-blue/20 hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center space-x-4 disabled:opacity-50"
          >
            <Database size={18} />
            <span>{isLogin ? 'Establish Secure Connection' : 'Initialize Personnel Protocol'}</span>
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="px-12 pb-12 text-center border-t border-slate-50 dark:border-slate-800 pt-8 flex flex-col items-center">
          <div className="flex items-center space-x-2 text-slate-300 mb-2">
            <Info size={12} />
            <p className="text-[9px] font-black uppercase tracking-[0.15em]">Institutional Protection Level 4</p>
          </div>
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest leading-relaxed">
            Daffodil International University <br/>
            Personnel Access Control Management
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
