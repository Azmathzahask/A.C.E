
import React, { useState, useEffect } from 'react';
import { ResumeData, LearningPlan as PlanType } from '../types';
import { generateLearningPlan, QuotaError } from '../services/geminiService';
import { Calendar, CheckSquare, Youtube, ExternalLink, Loader2, Sparkles, Clock, RefreshCw } from 'lucide-react';

const LearningPlan: React.FC<{ resume: ResumeData | null }> = ({ resume }) => {
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
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

  const handleGenerate = async () => {
    setLoading(true);
    setQuotaExceeded(false);
    try {
      const currentSkills = resume?.skills || [];
      const gaps = currentSkills.length > 0 ? currentSkills.slice(0, 3) : ['Cloud Architecture', 'System Design', 'CI/CD'];
      const result = await generateLearningPlan(gaps, selectedRole);
      setPlan(result);
    } catch (err) {
      console.error(err);
      if (err instanceof QuotaError) {
        setQuotaExceeded(true);
        setRetryTimer(60);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPlan = localStorage.getItem('vidya_plan');
    if (savedPlan) setPlan(JSON.parse(savedPlan));
  }, []);

  useEffect(() => {
    if (plan) localStorage.setItem('vidya_plan', JSON.stringify(plan));
  }, [plan]);

  if (quotaExceeded) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white p-12 rounded-[3rem] shadow-2xl border border-amber-100 animate-in fade-in">
        <Clock size={64} className="text-amber-500 mx-auto mb-8 animate-pulse" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">Neural Capacity Reached</h2>
        <p className="text-slate-500 mb-6 font-medium leading-relaxed">
          The curriculum generation engine is cooling down. Please wait a moment before trying to build your roadmap.
        </p>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cooling Down</p>
          <p className="text-4xl font-black text-indigo-600">{retryTimer}s</p>
        </div>
        <div className="flex flex-col gap-4">
          <button 
            disabled={retryTimer > 0}
            onClick={handleGenerate} 
            className="w-full bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            {retryTimer > 0 ? <Loader2 className="animate-spin" size={24} /> : <RefreshCw size={24} />}
            {retryTimer > 0 ? `Please Wait...` : `Regenerate Roadmap`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Career Roadmap</h1>
          <p className="text-slate-500">Accelerate your growth with a precision-engineered 4-week learning path generated specifically for your skill gaps.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? 'Generating...' : 'Regenerate Plan'}
          </button>
        </div>
      </div>

      {!plan && !loading && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
            <Calendar size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-400">No active learning plan</h3>
          <p className="text-slate-400 mt-1 max-w-xs mx-auto">Click regenerate to build a custom schedule based on your current skills.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Curating resources and structuring your 4-week journey...</p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plan.weeks?.map((week) => (
              <div key={week.week} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-600 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">WEEK {week.week}</span>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Calendar size={16} />
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 mb-4 line-clamp-2">{week.topic}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Tasks</span>
                    <span>{week.tasks?.length || 0}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-emerald-500 transition-all duration-1000 group-hover:w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare size={24} className="text-indigo-600" />
              Detailed Weekly Schedule
            </h3>
            <div className="space-y-6">
              {plan.weeks?.map((week) => (
                <div key={week.week} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">W{week.week}</div>
                      <h4 className="font-bold text-slate-800">{week.topic}</h4>
                    </div>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Learning Objectives</p>
                      {week.tasks?.map((task, idx) => (
                        <div key={idx} className="flex items-start gap-3 group cursor-pointer">
                          <div className="w-5 h-5 rounded-md border-2 border-slate-200 mt-0.5 group-hover:border-indigo-600 transition-colors flex items-center justify-center">
                            <div className="w-2 h-2 bg-indigo-600 rounded-sm scale-0 group-hover:scale-100 transition-transform"></div>
                          </div>
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{task}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Curated Resources</p>
                      {week.resources?.map((res, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-indigo-200 hover:bg-white transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                              <Youtube size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{res.title}</p>
                              <p className="text-[10px] text-slate-400">{res.platform}</p>
                            </div>
                          </div>
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                            <ExternalLink size={18} />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlan;
