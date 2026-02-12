
import React, { useState, useRef, useEffect } from 'react';
import { 
  FolderOpen, 
  Cpu, 
  Search, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Code2,
  Boxes,
  CheckCircle2,
  Terminal,
  FileCode,
  Clock
} from 'lucide-react';
import { analyzeProjectCode, QuotaError } from '../services/geminiService';
import { ProjectAnalysis } from '../types';

const IntegrationHub: React.FC<{ onEnrichProfile: (skills: string[]) => void }> = ({ onEnrichProfile }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectorySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);
    setQuotaExceeded(false);
    setAnalysis(null);
    setFileCount(files.length);

    try {
      const processedFiles: { name: string; content: string }[] = [];
      const MAX_FILES = 15; // Sample limit to stay within prompt context
      // Fix: Explicitly cast Array.from(files) as File[] to prevent 'unknown' element types.
      const filteredFiles = (Array.from(files) as File[])
        .filter(f => f.name.match(/\.(ts|tsx|js|jsx|json|html|css|py|java|go)$/i))
        .slice(0, MAX_FILES);

      for (const file of filteredFiles) {
        // Fix: 'file' is now correctly typed as File.
        const content = await file.text();
        processedFiles.push({ name: file.name, content });
      }

      const result = await analyzeProjectCode("Local Project Ingest", processedFiles);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      // Improved error handling to be more specific and robust.
      // This will correctly identify QuotaError and other potential API errors,
      // resolving issues with accessing properties on unknown error types.
      if (err instanceof QuotaError || err?.message?.includes('quota') || err?.status === 429 || JSON.stringify(err).includes('429')) {
        setQuotaExceeded(true);
        setError("Neural capacity reached. Please wait a moment for the system to cool down.");
      } else {
        setError("Failed to digest local project. Ensure code is readable text.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 text-white border border-white/10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-indigo-400 font-black uppercase text-xs tracking-[0.3em] mb-4">
              <Terminal size={18} />
              <span>Project Ingestion Terminal</span>
            </div>
            <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">Integrate Your Local Apps.</h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Import local project directories to benchmark your technical maturity. A.C.E performs a neural scan of your code patterns and architectural choices.
            </p>
          </div>
          <div className="shrink-0">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-64 h-64 border-2 border-dashed border-indigo-500/30 rounded-[3rem] bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-400 transition-all cursor-pointer flex flex-col items-center justify-center group relative overflow-hidden"
            >
              {/* Cast non-standard attributes to any to satisfy TypeScript */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                {...({ webkitdirectory: "", directory: "" } as any)} 
                multiple 
                onChange={handleDirectorySelect} 
              />
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-2xl">
                <FolderOpen size={32} />
              </div>
              <p className="font-bold text-sm text-indigo-200">Select Directory</p>
              <p className="text-[10px] text-indigo-400/60 uppercase font-black mt-1">Local Filesystem Access</p>
              
              {loading && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-indigo-500 mb-3" size={40} />
                  <p className="text-xs font-black uppercase tracking-widest animate-pulse">Scanning...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      {error && (
        <div className={`p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4 border ${quotaExceeded ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
          {quotaExceeded ? <Clock /> : <AlertCircle />}
          <div className="flex-1">
            <p className="font-bold text-sm">{error}</p>
            {quotaExceeded && (
              <p className="text-xs mt-1 font-medium opacity-80">Gemini free tier allows limited requests per minute. System will be ready in ~60s.</p>
            )}
          </div>
          {quotaExceeded && (
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest underline">Billing Info</a>
          )}
        </div>
      )}

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in duration-500">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Cpu size={20} className="text-indigo-600" />
                Technical Specs
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <span>Code Quality</span>
                    <span>{analysis.qualityScore || 0}/10</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000" 
                      style={{ width: `${(analysis.qualityScore || 0) * 10}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    <span>Complexity</span>
                    <span>{analysis.technicalComplexity || 0}/10</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-1000" 
                      style={{ width: `${(analysis.technicalComplexity || 0) * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 text-white shadow-2xl">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-indigo-400">
                <Boxes size={20} />
                Detected Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.detectedSkills || []).map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => onEnrichProfile(analysis.detectedSkills || [])}
                className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Integrate into Profile <CheckCircle2 size={18} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <FileCode size={24} className="text-indigo-600" />
                Architectural Critique
              </h3>
              <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100 text-slate-700 leading-relaxed font-medium italic">
                "{analysis.architecturalCritique || 'No critique available.'}"
              </div>
              
              <div className="mt-10 space-y-6">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Growth Vector Suggestions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(analysis.suggestions || []).map((s, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                        <Zap size={16} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
            <Code2 size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">No project integrated yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Upload a local project folder to receive a technical audit and upgrade your A.C.E profile.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationHub;
