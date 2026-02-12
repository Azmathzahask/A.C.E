
import React, { useState, useEffect } from 'react';
import { ResumeData, MarketAnalysis, MarketTrend } from '../types';
import { 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  Loader2, 
  Clock, 
  RefreshCw, 
  Sparkles, 
  ExternalLink, 
  Newspaper, 
  Zap,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getMarketTrends, QuotaError } from '../services/geminiService';

// Fix: Explicitly typed as React.FC to prevent 'key' property errors when rendered in lists.
const TrendCard: React.FC<{ trend: MarketTrend }> = ({ trend }) => {
  const getImpactColor = () => {
    switch (trend.impact) {
      case 'positive': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'negative': return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const getImpactIcon = () => {
    switch (trend.impact) {
      case 'positive': return <TrendingUp size={16} />;
      case 'negative': return <TrendingDown size={16} />;
      default: return <RefreshCw size={16} />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">
          {trend.category}
        </span>
        <div className={`p-2 rounded-xl border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${getImpactColor()}`}>
          {getImpactIcon()} {trend.impact}
        </div>
      </div>
      <h4 className="text-lg font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">{trend.title}</h4>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{trend.summary}</p>
    </div>
  );
};

const MarketTrends: React.FC<{ resume: ResumeData | null }> = ({ resume }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [retryTimer, setRetryTimer] = useState(60);

  const fetchTrends = async () => {
    setLoading(true);
    setQuotaExceeded(false);
    try {
      const skills = resume?.skills || ['Software Engineering', 'AI', 'Cloud', 'Remote Work'];
      const data = await getMarketTrends(skills);
      setAnalysis(data);
    } catch (err) {
      if (err instanceof QuotaError) {
        setQuotaExceeded(true);
        setRetryTimer(60);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  useEffect(() => {
    let interval: number;
    if (quotaExceeded && retryTimer > 0) {
      interval = window.setInterval(() => {
        setRetryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quotaExceeded, retryTimer]);

  if (quotaExceeded) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white p-12 rounded-[3rem] shadow-2xl border border-amber-100 animate-in fade-in">
        <Clock size={64} className="text-amber-500 mx-auto mb-8 animate-pulse" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">Neural Capacity Reached</h2>
        <p className="text-slate-500 mb-6 font-medium leading-relaxed">
          The market scraping intelligence is cooling down. Please wait before refreshing the pulse.
        </p>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cooling Down</p>
          <p className="text-4xl font-black text-indigo-600">{retryTimer}s</p>
        </div>
        <button 
          disabled={retryTimer > 0}
          onClick={fetchTrends} 
          className="w-full bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
        >
          {retryTimer > 0 ? <Loader2 className="animate-spin" size={24} /> : <RefreshCw size={24} />}
          {retryTimer > 0 ? `Please Wait...` : `Sync Neural Pulse`}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-indigo-600 font-black uppercase text-[10px] tracking-[0.2em]">
            <Globe size={16} className="animate-pulse" />
            <span>Neural Market Scraper v3</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Market Intelligence Hub</h1>
          <p className="text-slate-500 font-medium max-w-xl">Live scraping and grounding of global job market trends, hiring surges, and news impacts.</p>
        </div>
        <button 
          onClick={fetchTrends}
          disabled={loading}
          className="relative z-10 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all flex items-center gap-3 shadow-xl disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
          {loading ? 'Refreshing Pulse...' : 'Refresh Trends'}
        </button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] opacity-40"></div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
            <Newspaper size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-800">Scraping Global Market Data...</h3>
            <p className="text-slate-500 font-medium">Gemini is cross-referencing news grounding to identify hiring surges.</p>
          </div>
        </div>
      ) : analysis && (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-1000">
          {/* Sentiment Section */}
          <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
            <div className="shrink-0 relative w-48 h-48 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="84" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                <circle 
                  cx="96" cy="96" r="84" fill="transparent" 
                  stroke={analysis.sentimentScore > 60 ? "#10b981" : analysis.sentimentScore > 40 ? "#f59e0b" : "#ef4444"} 
                  strokeWidth="16" 
                  strokeDasharray={`${2 * Math.PI * 84}`} 
                  strokeDashoffset={`${2 * Math.PI * 84 * (1 - (analysis.sentimentScore || 0) / 100)}`} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-slate-800">{analysis.sentimentScore}%</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Market Mood</span>
              </div>
            </div>
            <div className="flex-1 space-y-6">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                  <Zap size={14} /> Neural Sentiment Audit
               </div>
               <h3 className="text-3xl font-black text-slate-900 leading-tight">
                  "{analysis.overallSentiment}"
               </h3>
               <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Verified by Grounding
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Building2 size={16} className="text-indigo-400" />
                    Active Hiring Signals
                  </div>
               </div>
            </div>
          </div>

          {/* Pulse Trends Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="col-span-full flex items-center justify-between">
              <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={18} /> Active Pulse Trends
              </h3>
            </div>
            {analysis.trends.map((trend) => (
              <TrendCard key={trend.title} trend={trend} />
            ))}
          </div>

          {/* News Grounding Sources */}
          <div className="bg-slate-900 p-12 rounded-[4rem] border border-white/10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                   <Newspaper size={28} className="text-indigo-400" />
                   Verified Market News Sources
                </h3>
                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                   <CheckCircle2 size={14} /> Grounding Active
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.sources.length > 0 ? (
                  analysis.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group p-6 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all flex flex-col justify-between h-full"
                    >
                      <div>
                         <p className="text-sm font-black text-indigo-300 mb-2 truncate group-hover:text-white transition-colors">{source.title}</p>
                         <p className="text-[10px] text-slate-400 truncate mb-4">{source.url}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified Source</span>
                        <ExternalLink size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 text-slate-500 italic">No direct grounding snippets found for this specific query.</div>
                )}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grounded by Google Search</p>
                 <div className="flex items-center gap-4">
                    <ShieldCheck size={18} className="text-indigo-500" />
                    <Zap size={18} className="text-indigo-500" />
                 </div>
              </div>
            </div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
             <AlertCircle size={40} />
           </div>
           <div>
             <h3 className="text-xl font-black text-slate-800">Neural link failed to pulse</h3>
             <p className="text-slate-500 max-sm mx-auto mt-2">Try refreshing to re-establish the market news connection.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default MarketTrends;
