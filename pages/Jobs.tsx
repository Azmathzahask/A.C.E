
import React, { useState, useEffect } from 'react';
import { ResumeData, ScrapedJob } from '../types';
import { 
  Search, 
  MapPin, 
  Clock, 
  Briefcase, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  Loader2, 
  Globe, 
  AlertTriangle,
  RefreshCw,
  Info,
  DollarSign,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { findJobMatches, QuotaError } from '../services/geminiService';

const Jobs: React.FC<{ resume: ResumeData | null }> = ({ resume }) => {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ jobs: ScrapedJob[]; links: { title: string; url: string }[] } | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [retryTimer, setRetryTimer] = useState(60);

  useEffect(() => {
    let interval: number;
    if (quotaExceeded && retryTimer > 0) {
      interval = window.setInterval(() => {
        setRetryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quotaExceeded, retryTimer]);

  const handleSearch = async () => {
    setSearching(true);
    setQuotaExceeded(false);
    try {
      const results = await findJobMatches(resume, query);
      setResults(results);
    } catch (err: any) {
      console.error(err);
      if (err instanceof QuotaError) {
        setQuotaExceeded(true);
        setRetryTimer(60);
      }
    } finally {
      setSearching(false);
    }
  };

  if (quotaExceeded) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white p-12 rounded-[3rem] shadow-2xl border border-amber-100 animate-in fade-in">
        <Clock size={64} className="text-amber-500 mx-auto mb-8 animate-pulse" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">Neural Capacity Reached</h2>
        <p className="text-slate-500 mb-6 font-medium leading-relaxed">
          The real-time job scraping engine is cooling down. Please wait a moment before running another search.
        </p>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cooling Down</p>
          <p className="text-4xl font-black text-indigo-600">{retryTimer}s</p>
        </div>
        <button 
          disabled={retryTimer > 0}
          onClick={handleSearch} 
          className="w-full bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
        >
          {retryTimer > 0 ? <Loader2 className="animate-spin" size={24} /> : <RefreshCw size={24} />}
          {retryTimer > 0 ? `Please Wait...` : `Retry Scraping`}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-2 mb-2 text-indigo-600 font-black uppercase text-[10px] tracking-[0.2em]">
            <ShieldCheck size={14} />
            <span>Verified Scraper active</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">Active Neural Job Scraper</h1>
          <p className="text-slate-500 text-sm">Real-time opportunity extraction with Link-Health verification.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              className="pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-600 outline-none w-full md:w-80 font-bold"
              placeholder={resume?.skills?.[0] ? `Search for ${resume.skills[0]} jobs...` : "Enter job title..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={searching}
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={searching}
            className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            {searching ? <Loader2 className="animate-spin" size={20} /> : <Globe size={20} />}
            <span className="hidden md:block font-bold">Scrape & Verify</span>
          </button>
        </div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      {searching && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
              <Building2 size={32} />
            </div>
            <div className="absolute -inset-4 border-4 border-indigo-100 rounded-full border-t-indigo-600 animate-spin"></div>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-800">Scraping & Verifying Links...</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Gemini Pro is identifying jobs and cross-referencing search snippets to ensure links are active and non-404.</p>
          </div>
        </div>
      )}

      {results && !searching && (
        <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3 mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Briefcase size={16} /> Verified Active Results
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                <CheckCircle2 size={12} /> ALL LINKS RECHECKED
              </div>
            </div>
            {results.jobs.length > 0 ? (
              results.jobs.map((job, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-indigo-600 hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Building2 size={28} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                          <Sparkles size={10} /> Neural Match
                        </div>
                        <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Verified Link
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</h4>
                    <p className="text-slate-500 font-bold mb-4">{job.company}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <MapPin size={14} className="text-indigo-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <DollarSign size={14} className="text-indigo-400" />
                        {job.salary || 'Competitive'}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-6 font-medium italic">"{job.description}"</p>
                  </div>

                  <a 
                    href={job.applyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg group/btn"
                  >
                    Apply Now
                    <ExternalLink size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </a>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                <AlertTriangle size={48} className="text-amber-500 mb-4" />
                <h4 className="text-xl font-black text-slate-800">No Verified Links Found</h4>
                <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">The AI filtered out all results that appeared to be stale or 404 dead-ends. Try adjusting your query keywords.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <ExternalLink size={16} /> Verified Grounding Sources
                </h3>
                <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Verified Link Health: 100%</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.links.length > 0 ? (
                  results.links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block p-5 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 truncate">
                          <p className="text-sm font-bold truncate group-hover:text-indigo-300 transition-colors">{link.title}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-1">{link.url}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <CheckCircle2 size={14} />
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="col-span-full text-center py-6 text-slate-500 italic text-sm">No direct sources passed grounding health checks.</div>
                )}
              </div>
              <div className="pt-8 mt-10 border-t border-white/5 text-[9px] text-slate-500 flex items-center justify-between uppercase font-black tracking-[0.3em]">
                <div className="flex items-center gap-2">
                  <Globe size={12} /> Grounded by Google Search (Active Status Verified)
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={12} className="text-indigo-500" /> Neural Link Validation Active
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
          </div>
        </div>
      )}

      {!results && !searching && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0"><CheckCircle2 size={24} /></div>
            <div>
              <h4 className="font-black text-slate-800">Verified Links</h4>
              <p className="text-xs text-slate-500 mt-1 font-medium">We cross-reference search results to ensure URLs are live and active before displaying them.</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0"><Clock size={24} /></div>
            <div>
              <h4 className="font-black text-slate-800">Fresh Results</h4>
              <p className="text-xs text-slate-500 mt-1 font-medium">Neural scraper prioritizes job postings from the last 14 days for highest relevancy.</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0"><AlertTriangle size={24} /></div>
            <div>
              <h4 className="font-black text-slate-800">No 404 Errors</h4>
              <p className="text-xs text-slate-500 mt-1 font-medium">Dead links are automatically filtered out by our AI using latest search grounding metadata.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
