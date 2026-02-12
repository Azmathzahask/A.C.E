
import React, { useState, useEffect } from 'react';
import { User, ResumeData } from '../types';
import { 
  Trophy, 
  Zap, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Activity,
  Award,
  Video,
  Globe,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { quotaState } from '../services/aiService';

const StatCard = ({ icon: Icon, label, value, trend, color, bgColor }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-4 rounded-2xl ${bgColor} transition-transform group-hover:scale-110`}>
        <Icon className={color} size={24} />
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend}
        </span>
      )}
    </div>
    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</h4>
    <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
  </div>
);

const Dashboard: React.FC<{ user: User; resume: ResumeData | null }> = ({ user, resume }) => {
  const [greeting, setGreeting] = useState('');
  const isPro = quotaState.isProMode;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden ${isPro ? 'bg-gradient-to-br from-slate-900 via-amber-950 to-amber-900' : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900'} rounded-[3rem] p-10 text-white shadow-2xl transition-colors duration-1000`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
               {isPro && <div className="px-3 py-1 bg-amber-500 text-slate-900 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">Ultra Link Enabled</div>}
               <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{greeting}, {user.name}.</h1>
            </div>
            <p className="text-indigo-100 text-lg opacity-90 mb-8">
               {isPro 
                 ? "You are connected via a High-Bandwidth Neural Link. Data scraping and behavioral synthesis are running at peak concurrency." 
                 : "Welcome back to A.C.E. Our proprietary AI is ready to evaluate your career trajectory."
               }
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/interview" className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2 group">
                <Video size={20} className="group-hover:scale-110 transition-transform text-indigo-600" />
                Start Live Interview
              </Link>
              <Link to="/trends" className="bg-white/10 text-white border border-white/20 backdrop-blur-md px-8 py-4 rounded-2xl font-black hover:bg-white/20 transition-all flex items-center gap-2">
                <Globe size={20} />
                Market Pulse
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className={`w-64 h-64 ${isPro ? 'bg-amber-500/10' : 'bg-white/5'} rounded-full border ${isPro ? 'border-amber-500/20' : 'border-white/10'} flex items-center justify-center backdrop-blur-3xl relative transition-all`}>
              <div className={`absolute inset-4 border ${isPro ? 'border-amber-500/20' : 'border-white/10'} rounded-full animate-[spin_15s_linear_infinite]`}></div>
              {isPro ? <Cpu size={80} className="text-amber-500 opacity-80 animate-pulse" /> : <Activity size={80} className="text-indigo-400 opacity-80 animate-pulse" />}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={CheckCircle2} label="Evaluations Done" value="12" trend="+4 new" color="text-indigo-600" bgColor="bg-indigo-50" />
        <StatCard icon={Award} label="A.C.E Score" value="942" trend="+75 pts" color="text-amber-600" bgColor="bg-amber-50" />
        <StatCard icon={Target} label="Role Alignment" value="91%" trend="Peak" color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard icon={TrendingUp} label="Market Health" value="Bullish" trend="Scraping Live" color="text-violet-600" bgColor="bg-violet-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Enterprise Modules</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/evaluation" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-600 transition-all duration-300 shadow-sm hover:shadow-xl">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                <Target size={28} />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-2">Technical Mapping</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Neural alignment of your hard skills against global Tier 1 industry benchmarks.</p>
              <div className="mt-6 flex items-center gap-2 text-indigo-600 font-bold group-hover:translate-x-2 transition-transform">
                Open Unit <ArrowRight size={18} />
              </div>
            </Link>

            <Link to="/trends" className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-amber-600 transition-all duration-300 shadow-sm hover:shadow-xl">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-inner">
                <Globe size={28} />
              </div>
              <h4 className="text-xl font-black text-slate-800 mb-2">Market Pulse</h4>
              <p className="text-slate-500 text-sm leading-relaxed">High-frequency scraping of job market trends, news, and hiring surges.</p>
              <div className="mt-6 flex items-center gap-2 text-amber-600 font-bold group-hover:translate-x-2 transition-transform">
                Sync Neural Pulse <ArrowRight size={18} />
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Throughput Log</h3>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 space-y-6">
            <div className={`flex items-start gap-4 p-4 ${isPro ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'} rounded-2xl border`}>
              <div className={`w-10 h-10 ${isPro ? 'bg-amber-600' : 'bg-indigo-600'} rounded-xl flex items-center justify-center text-white shrink-0`}>
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">System Update</p>
                <p className="text-xs text-slate-500 mt-1">{isPro ? "Parallel Burst Mode engaged. All modules running at zero-lag." : "AI hiring surge detected in your region. Check Market Pulse."}</p>
              </div>
            </div>
            <Link to="/progress" className="block w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all text-center">
              Detailed Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
