
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  Map, 
  GraduationCap, 
  Mic, 
  Briefcase, 
  BarChart, 
  LogOut,
  User as UserIcon,
  Bell,
  RefreshCw,
  Cpu,
  Globe,
  ShieldCheck,
  Zap,
  Activity,
  Infinity,
  Database,
  Cpu as CpuIcon
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Resume from './pages/Resume';
import Evaluation from './pages/Evaluation';
import LearningPlan from './pages/LearningPlan';
import Quiz from './pages/Quiz';
import Interview from './pages/Interview';
import Jobs from './pages/Jobs';
import Progress from './pages/Progress';
import IntegrationHub from './pages/IntegrationHub';
import MarketTrends from './pages/MarketTrends';
import Login from './pages/Login';
import { User, ResumeData } from './types';
import { quotaState } from './services/aiService';

const Sidebar = ({ onLogout, onReset }: { onLogout: () => void; onReset: () => void }) => {
  const location = useLocation();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FileText, label: 'Profile Initialization', path: '/resume' },
    { icon: Cpu, label: 'Project Ingest', path: '/integration' },
    { icon: Globe, label: 'Market Intelligence', path: '/trends' },
    { icon: ShieldCheck, label: 'Career Intelligence', path: '/evaluation' },
    { icon: Map, label: 'Growth Plan', path: '/plan' },
    { icon: GraduationCap, label: 'Assessments', path: '/quiz' },
    { icon: Mic, label: 'Live Interview Lab', path: '/interview' },
    { icon: Briefcase, label: 'Job Matching', path: '/jobs' },
    { icon: BarChart, label: 'Analytics', path: '/progress' },
  ];

  return (
    <div className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col sticky top-0 z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <span className="text-2xl font-black">A</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight">A.C.E</h1>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Career Evaluator</span>
          </div>
        </div>
        <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar pr-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} className={location.pathname === item.path ? 'text-white' : 'group-hover:text-indigo-600'} />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-8 border-t border-slate-50 space-y-4">
        <button onClick={onReset} className="flex items-center gap-3 px-5 py-3 w-full text-slate-400 hover:text-indigo-600 transition-colors text-sm font-medium">
          <RefreshCw size={18} />
          <span>Reset Session</span>
        </button>
        <button onClick={onLogout} className="flex items-center gap-3 px-5 py-3 w-full text-slate-400 hover:text-rose-600 transition-colors text-sm font-medium">
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

const Header = ({ user }: { user: User }) => {
  const [isPro, setIsPro] = useState(quotaState.isProMode);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const togglePro = () => {
    const newStatus = !isPro;
    setIsPro(newStatus);
    quotaState.isProMode = newStatus;
    quotaState.isCoolingDown = false;
    localStorage.setItem('ace_pro_mode', newStatus.toString());
  };

  const callsRemaining = 15 - quotaState.callsThisMinute;

  return (
    <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-50 px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <h2 className="text-slate-900 text-xl font-black tracking-tight">A.C.E Control Center</h2>
          {isPro && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded-lg border border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
              <ShieldCheck size={12} /> VERIFIED TIER 1
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${quotaState.isCoolingDown && !isPro ? 'bg-rose-500' : isPro ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-emerald-500'}`}></div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {quotaState.isCoolingDown && !isPro ? `SYSTEM COOLING (${quotaState.cooldownRemaining}s)` : isPro ? "Ultra Bandwidth Mode (Parallel Processing Enabled)" : `Neural Link Active / ${user.name}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={togglePro}
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-500 ${isPro ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-200 scale-105' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200'}`}
        >
          <Zap size={18} className={isPro ? 'animate-bounce' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">{isPro ? 'Turbo Link Engaged' : 'Engage Pro Link'}</span>
        </button>

        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${isPro ? 'bg-slate-900 border-amber-500/50 text-amber-500 shadow-inner' : (callsRemaining < 3 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600')}`}>
          {isPro ? <CpuIcon size={14} className="animate-spin-slow" /> : <Database size={14} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isPro ? "Throughput: 2K RPM" : `Budget: ${Math.max(0, callsRemaining)}/15 RPM`}
          </span>
        </div>
        
        <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all relative group">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Candidate {user.id}</p>
          </div>
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white border-2 border-white shadow-lg overflow-hidden relative group cursor-pointer">
            <UserIcon size={22} />
          </div>
        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('vidya_user');
    const savedResume = localStorage.getItem('vidya_resume');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedResume) setResume(JSON.parse(savedResume));
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('vidya_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vidya_user');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear your local session data?')) {
      localStorage.removeItem('vidya_resume');
      localStorage.removeItem('vidya_plan');
      localStorage.removeItem('ace_pro_mode');
      window.location.reload();
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar onLogout={handleLogout} onReset={handleReset} />
        <div className="flex-1 flex flex-col">
          <Header user={user} />
          <main className="p-10 page-transition">
            <Routes>
              <Route path="/" element={<Dashboard user={user} resume={resume} />} />
              <Route path="/resume" element={<Resume onResumeUpdate={(data) => {
                setResume(data);
                localStorage.setItem('vidya_resume', JSON.stringify(data));
              }} />} />
              <Route path="/integration" element={<IntegrationHub onEnrichProfile={(skills) => {
                if (resume) {
                  const currentSkills = resume.skills || [];
                  const newResume = { ...resume, skills: Array.from(new Set([...currentSkills, ...skills])) };
                  setResume(newResume);
                  localStorage.setItem('vidya_resume', JSON.stringify(newResume));
                }
              }} />} />
              <Route path="/trends" element={<MarketTrends resume={resume} />} />
              <Route path="/evaluation" element={<Evaluation resume={resume} user={user} />} />
              <Route path="/plan" element={<LearningPlan resume={resume} />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/interview" element={<Interview user={user} />} />
              <Route path="/jobs" element={<Jobs resume={resume} />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
