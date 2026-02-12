
import React, { useState, useEffect } from 'react';
import { ResumeData, CareerMatch, User, PersonalityAnalysis } from '../types';
import { 
  Target, 
  Search, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Brain,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Zap,
  TrendingUp,
  Workflow,
  ArrowRight
} from 'lucide-react';
import { evaluateCareer, assessPersonality, QuotaError } from '../services/geminiService';

const QUESTIONS = [
  "Describe a project or task you enjoyed most and why. What did you do and what part energized you?",
  "When faced with a difficult problem, how do you usually approach it? Give a specific example.",
  "Describe how you prefer to work in a team. What role do you naturally take?",
  "What skills or activities make you lose track of time because you enjoy them?",
  "Tell me about a time you received criticism — how did you respond and what did you learn?",
  "What kind of work environment helps you do your best (pace, structure, autonomy, collaboration)?",
  "How do you prefer to learn new skills — courses, hands-on projects, mentorship, reading?",
  "What are three strengths you (or others) would say about you? Give examples for each.",
  "What kinds of tasks drain your energy or that you actively avoid?",
  "Where do you see yourself in 3–5 years? What would success look like to you?"
];

const Evaluation: React.FC<{ resume: ResumeData | null; user: User }> = ({ resume, user }) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'behavioral'>('skills');
  const [targetRole, setTargetRole] = useState('');
  const [evaluation, setEvaluation] = useState<CareerMatch | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(QUESTIONS.length).fill(''));
  const [personalityAnalysis, setPersonalityAnalysis] = useState<PersonalityAnalysis | null>(null);
  const [behavioralLoading, setBehavioralLoading] = useState(false);
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

  const handleEvaluate = async () => {
    if (!resume || !targetRole || evalLoading) return;
    setEvalLoading(true);
    setQuotaExceeded(false);
    try {
      const result = await evaluateCareer(resume, targetRole);
      setEvaluation(result);
    } catch (err: any) {
      if (err instanceof QuotaError) {
        setQuotaExceeded(true);
        setRetryTimer(60);
      }
    } finally {
      setEvalLoading(false);
    }
  };

  const handleBehavioralSubmit = async () => {
    if (behavioralLoading) return;
    setBehavioralLoading(true);
    setQuotaExceeded(false);
    try {
      const result = await assessPersonality(user.name, answers);
      setPersonalityAnalysis(result);
    } catch (err: any) {
      if (err instanceof QuotaError) {
        setQuotaExceeded(true);
        setRetryTimer(60);
      }
    } finally {
      setBehavioralLoading(false);
    }
  };

  const isBehavioralComplete = answers.every(a => a && a.trim().length > 15);
  const progress = ((currentIdx + 1) / QUESTIONS.length) * 100;

  if (!resume) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] border border-slate-200 text-center space-y-6 shadow-sm">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto">
          <Info size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Profile Data Missing</h2>
        <p className="text-slate-500 font-medium leading-relaxed">Please initialize your profile with a resume to enable the Career Intelligence engine.</p>
        <a href="#/resume" className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Initialize Profile</a>
      </div>
    );
  }

  if (quotaExceeded) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white p-12 rounded-[3rem] shadow-2xl border border-amber-100 animate-in fade-in">
        <Clock size={64} className="text-amber-500 mx-auto mb-8 animate-pulse" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">Neural Capacity Reached</h2>
        <p className="text-slate-500 mb-6 font-medium leading-relaxed">
          The intelligence engine is cooling down. Please wait a moment before refining your assessment.
        </p>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cooling Down</p>
          <p className="text-4xl font-black text-indigo-600">{retryTimer}s</p>
        </div>
        <button 
          disabled={retryTimer > 0}
          onClick={() => activeTab === 'skills' ? handleEvaluate() : handleBehavioralSubmit()} 
          className="w-full bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
        >
          {retryTimer > 0 ? <Loader2 className="animate-spin" size={24} /> : <RefreshCw size={24} />}
          {retryTimer > 0 ? `Please Wait...` : `Retry Operation`}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Career Intelligence Hub</h1>
            <p className="text-slate-500 font-medium">Consolidated technical matching and behavioral DNA analysis.</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-[2rem] gap-1 shrink-0">
            <button 
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'skills' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Target size={18} /> Skill Alignment
            </button>
            <button 
              onClick={() => setActiveTab('behavioral')}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'behavioral' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Brain size={18} /> Behavioral DNA
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'skills' ? (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-800 mb-2">Technical Mapping</h2>
              <p className="text-slate-500 font-medium">Enter your desired role to benchmark your skills against global expectations.</p>
            </div>
            <div className="w-full md:w-auto flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  className="pl-12 pr-6 py-4 rounded-2xl border border-slate-200 w-full min-w-[300px] focus:border-indigo-600 outline-none transition-all font-bold"
                  placeholder="Target Role (e.g. Senior Architect)"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <button
                onClick={handleEvaluate}
                disabled={evalLoading || !targetRole}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
              >
                {evalLoading ? <Loader2 className="animate-spin" /> : <Target size={24} />}
                <span>Benchmark</span>
              </button>
            </div>
          </div>

          {evaluation && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center">
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="84" fill="transparent" stroke="#f1f5f9" strokeWidth="14" />
                    <circle 
                      cx="96" cy="96" r="84" fill="transparent" 
                      stroke={(evaluation.score || 0) > 70 ? "#10b981" : "#f59e0b"} 
                      strokeWidth="14" 
                      strokeDasharray={`${2 * Math.PI * 84}`} 
                      strokeDashoffset={`${2 * Math.PI * 84 * (1 - (evaluation.score || 0) / 100)}`} 
                      strokeLinecap="round" 
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-800">{evaluation.score || 0}%</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Skill Match</span>
                  </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-slate-600 text-sm italic font-medium">"Your technical profile is {(evaluation.score || 0) > 70 ? 'exceptionally aligned' : 'developing'} for the role of {targetRole}."</p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-xs mb-6">
                      <CheckCircle2 size={20} />
                      <span>Technical Strengths</span>
                    </div>
                    <ul className="space-y-4">
                      {(evaluation.strengths || []).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 font-bold">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-rose-600 font-black uppercase tracking-widest text-xs mb-6">
                      <XCircle size={20} />
                      <span>Capability Gaps</span>
                    </div>
                    <ul className="space-y-4">
                      {(evaluation.gaps || []).map((g, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 bg-rose-50/50 p-4 rounded-2xl border border-rose-100 font-bold">
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/10 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-widest text-xs mb-6">
                      <Sparkles size={20} />
                      <span>Evolution Roadmap Recommendations</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(evaluation.recommendations || []).map((r, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/10 text-xs font-bold leading-relaxed">
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          )}

          {!evaluation && !evalLoading && (
            <div 
              onClick={() => setActiveTab('behavioral')}
              className="bg-indigo-600 p-10 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer group hover:scale-[1.01] transition-all shadow-2xl shadow-indigo-200"
            >
              <div className="max-w-xl">
                <h3 className="text-3xl font-black mb-4 tracking-tight">Add Behavioral Intelligence</h3>
                <p className="text-indigo-100 opacity-80 text-lg font-medium">Complete the Behavioral DNA audit to see how your traits influence your career trajectory. 10 deep queries for a holistic A.C.E profile.</p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border border-white/20 group-hover:translate-x-4 transition-transform">
                <ChevronRight size={32} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in duration-500">
          {!personalityAnalysis ? (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-100 group hover:rotate-6 transition-transform">
                  <Brain size={40} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Behavioral DNA Audit</h2>
                <p className="text-slate-500 max-w-xl mx-auto font-medium text-lg leading-relaxed">
                  The 10-Question Deep Audit uses neural reasoning to map your professional personality. Please be specific.
                </p>
              </div>

              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl space-y-10 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Query {currentIdx + 1} of {QUESTIONS.length}</span>
                  <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">
                    {QUESTIONS[currentIdx]}
                  </h3>
                  <textarea
                    className="w-full h-48 p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-8 focus:ring-indigo-50 outline-none resize-none transition-all text-lg font-medium placeholder:text-slate-300"
                    placeholder="Reflect deeply on your experience here..."
                    value={answers[currentIdx] || ''}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[currentIdx] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                  />
                </div>

                <div className="pt-10 flex items-center justify-between border-t border-slate-100">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black uppercase text-xs tracking-widest transition-all disabled:opacity-0"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>

                  {currentIdx === QUESTIONS.length - 1 ? (
                    <button
                      disabled={behavioralLoading || !isBehavioralComplete}
                      onClick={handleBehavioralSubmit}
                      className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                      {behavioralLoading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
                      {behavioralLoading ? 'Synthesizing DNA...' : 'Finalize Audit'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentIdx(prev => prev + 1)}
                      className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black hover:bg-black transition-all flex items-center gap-3"
                    >
                      Next Query
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-700 space-y-12">
              <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-xs tracking-widest mb-2">
                      <ShieldCheck size={18} />
                      <span>Behavioral DNA Analysis</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Audit Complete</h2>
                  </div>
                  <div className="bg-indigo-600 text-white w-28 h-28 rounded-3xl flex flex-col items-center justify-center shadow-2xl">
                    <span className="text-4xl font-black">{personalityAnalysis.confidence || 0}%</span>
                    <span className="text-[10px] font-bold opacity-60 uppercase">Confidence</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                  <div className="space-y-10">
                    <section>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Neural Profile Summary</h4>
                      <div className="space-y-4">
                        {(personalityAnalysis.summary || []).map((s, i) => (
                          <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-4">
                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-indigo-600 shrink-0 shadow-sm"><CheckCircle2 size={14}/></div>
                            <p className="text-sm font-bold text-slate-700">{s}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Core Strengths</h4>
                      <div className="flex flex-wrap gap-2">
                        {(personalityAnalysis.strengths || []).map((s, i) => (
                          <span key={i} className="px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-black border border-emerald-100 shadow-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-10">
                    <section className="bg-slate-900 p-8 rounded-[3rem] border border-white/10 text-white shadow-2xl relative overflow-hidden">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Target size={18} /> Personality-Matched Careers
                      </h4>
                      <div className="space-y-4 relative z-10">
                        {(personalityAnalysis.careers || []).map((c, i) => (
                          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                            <span className="font-bold text-sm">{c}</span>
                            <ArrowRight size={16} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl"></div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-4">Areas for Development</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {(personalityAnalysis.development || []).map((dev, i) => (
                          <div key={i} className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100 text-sm font-black text-amber-900 flex gap-4">
                            <TrendingUp size={18} className="shrink-0" /> {dev}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-16">
                  <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
                    <Workflow className="text-indigo-600" size={32} />
                    Career Evolution Strategy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(personalityAnalysis.steps || []).map((step, i) => (
                      <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative group hover:border-indigo-200 transition-all">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 font-black shadow-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {i + 1}
                        </div>
                        <p className="text-slate-700 font-bold leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Evaluation;
