
import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, UserPlus, Sparkles, ShieldCheck, Mail, Lock, Loader2, Video } from 'lucide-react';

const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin({
        id: '1',
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email || 'candidate@ace-eval.com'
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10">
        {/* Left Side */}
        <div className="w-full md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black text-3xl mb-8 shadow-2xl">A</div>
            <h1 className="text-5xl font-black mb-4 tracking-tighter">A.C.E</h1>
            <p className="text-indigo-100 text-lg leading-relaxed font-medium">The World's Most Advanced AI Career Evaluator. Proprietary neural analysis for the modern workforce.</p>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4 bg-white/10 p-5 rounded-[2rem] backdrop-blur-2xl border border-white/10 shadow-lg">
              <Video className="text-white" />
              <p className="text-sm font-bold tracking-tight">Real-time Video & Speech Analysis</p>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-5 rounded-[2rem] backdrop-blur-2xl border border-white/10 shadow-lg">
              <ShieldCheck className="text-emerald-300" />
              <p className="text-sm font-bold tracking-tight">Verified Technical Diagnostics</p>
            </div>
          </div>

          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-indigo-500 rounded-full blur-[80px] opacity-60"></div>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-slate-900 rounded-full blur-[80px] opacity-40"></div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">{isLogin ? 'Control Center' : 'Initialize Profile'}</h2>
            <p className="text-slate-500 font-medium">Access your evaluation dashboard and lab modules.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Candidate Identifier</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  className="w-full pl-12 pr-4 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800" 
                  placeholder="e.g. john@neural-mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full pl-12 pr-4 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-slate-800" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
              {loading ? 'Initializing...' : isLogin ? 'Access System' : 'Create Profile'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-sm font-bold">
              {isLogin ? "New candidate?" : "Already registered?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 hover:underline"
              >
                {isLogin ? 'Create profile' : 'Access system'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
