
import React from 'react';
import { ATSAnalysis } from '../types';
import ScoreCircle from './ScoreCircle';
import { 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  Zap, 
  FolderOpen,
  ArrowRight
} from 'lucide-react';

interface AnalysisResultsProps {
  analysis: ATSAnalysis;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Score and Overview */}
      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-12">
        <div className="shrink-0">
          <ScoreCircle score={analysis.ats_score || analysis.score} />
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Neural Diagnosis Summary</h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {analysis.skill_gap_analysis || analysis.overallFeedback}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Missing Keywords */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-rose-600 font-black uppercase text-xs tracking-widest">
            <Target size={20} />
            <span>Missing Keywords</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(analysis.missing_keywords || analysis.keywordGaps || []).map((kw, i) => (
              <span key={i} className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-black border border-rose-100">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Action Verbs */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600 font-black uppercase text-xs tracking-widest">
            <Zap size={20} />
            <span>Suggested Action Verbs</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(analysis.action_verbs || []).map((verb, i) => (
              <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black border border-indigo-100">
                {verb}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Improvements */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-amber-600 font-black uppercase text-xs tracking-widest">
            <Lightbulb size={20} />
            <span>Strategic Improvements</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(analysis.section_improvements || []).map((item, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-amber-200 transition-all">
                <p className="text-xs font-black text-amber-600 uppercase mb-2">{item.section}</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.suggestion}</p>
              </div>
            ))}
            {(!analysis.section_improvements && analysis.improvements) && analysis.improvements.map((im, i) => (
               <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                 <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                 <p className="text-sm font-bold text-slate-700">{im}</p>
               </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-3 text-indigo-400 font-black uppercase text-xs tracking-widest">
              <FolderOpen size={20} />
              <span>Expansion Projects</span>
            </div>
            <div className="space-y-4">
              {(analysis.projects_to_add || []).map((project, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all">
                   <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                     <ArrowRight size={16} />
                   </div>
                   <p className="text-sm font-bold leading-relaxed">{project}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Better Wording */}
      {analysis.better_wording && analysis.better_wording.length > 0 && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-emerald-600 font-black uppercase text-xs tracking-widest">
            <CheckCircle2 size={20} />
            <span>Vocal Polish & Better Wording</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.better_wording.map((item, i) => (
              <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Original</span>
                   <span className="text-sm font-bold text-slate-400 line-through">{item.original}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Neural Improved</span>
                   <span className="text-sm font-black text-emerald-700">{item.improved}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
