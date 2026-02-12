
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Loader2, 
  PenLine,
  FileSearch,
  Briefcase,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist";
import { initiateProfile, QuotaError } from '../services/geminiService';
import { analyzeResumeLocally } from '../lib/resumeAnalyzer';
import { ResumeData, ATSAnalysis } from '../types';
import AnalysisResults from '../components/AnalysisResults';
import ResumeUpload from '../components/ResumeUpload';
import RewrittenResume from '../components/RewrittenResume';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    textParts.push(pageText);
  }
  return textParts.join("\n\n");
}

const Resume: React.FC<{ onResumeUpdate: (data: ResumeData) => void }> = ({ onResumeUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [rewritten, setRewritten] = useState<string | null>(null);
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

  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setAnalysis(null);
    setRewritten(null);
    setQuotaExceeded(false);

    try {
      const text = await extractTextFromPDF(file);
      setRawText(text);
      
      // SINGLE CONSOLIDATED CALL: halving the quota hit
      const { resumeData, analysis: aiAnalysis, rewritten: aiRewritten } = await initiateProfile(text);
      
      onResumeUpdate(resumeData);
      setAnalysis(aiAnalysis);
      setRewritten(aiRewritten);
    } catch (err) {
      if (err instanceof QuotaError) {
        setQuotaExceeded(true);
        setRetryTimer(60);
        // Fallback to local analysis if quota is hit
        setAnalysis(analyzeResumeLocally(rawText));
      } else {
        setError('Neural extraction encountered an error. Applying local baseline analysis.');
        setAnalysis(analyzeResumeLocally(rawText));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b bg-white sticky top-20 z-30">
        <div className="container max-w-4xl mx-auto flex items-center justify-between gap-3 py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profile Initialization</h1>
              <p className="text-xs text-slate-400 font-medium">ATS Audit + Jake's Format Optimization</p>
            </div>
          </div>
          <Link 
            to="/jobs" 
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Briefcase className="h-4 w-4" />
            Job Board
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {quotaExceeded && (
          <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-center gap-4 animate-in slide-in-from-top-4">
            <Clock size={20} className="text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-slate-900 text-sm">Rate Limit Reached: {retryTimer}s</p>
              <p className="text-xs font-medium text-slate-500">The Free Tier API is cooling down. Local analysis has been applied as a placeholder.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3">
            <RefreshCw size={20} />
            {error}
          </div>
        )}

        {!isProcessing && !analysis && (
          <ResumeUpload onFileSelected={handleFileSelected} isAnalyzing={isProcessing} />
        )}

        {isProcessing && (
          <div className="flex flex-col items-center py-20 gap-4 animate-in fade-in">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 animate-pulse" size={24} />
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-slate-800 tracking-tight">Neural Link Active</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auditing & Rewriting in a single turn...</p>
            </div>
          </div>
        )}

        {analysis && !isProcessing && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="border-t border-slate-100 pt-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Audit & Optimization Report</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setAnalysis(null)} 
                    className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Re-upload
                  </button>
                  <Link to="/jobs" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
                    <Briefcase size={18} />
                    View Job Matches
                  </Link>
                </div>
              </div>
              <AnalysisResults analysis={analysis} />
            </div>

            {rewritten && (
              <div className="pt-10 border-t border-slate-100">
                <RewrittenResume text={rewritten} />
                <div className="mt-12 flex justify-center">
                  <Link 
                    to="/jobs" 
                    className="group flex items-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:bg-black transition-all shadow-2xl shadow-indigo-100/20"
                  >
                    <Briefcase size={28} className="group-hover:scale-110 transition-transform" />
                    Launch Global Job Search
                    <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Resume;
