
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Copy, Check, Briefcase, Printer, ArrowRight, Download } from 'lucide-react';

interface RewrittenResumeProps {
  text: any;
}

const RewrittenResume = ({ text }: RewrittenResumeProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const payloadText = typeof text === "string" ? text : JSON.stringify(text, null, 2);
    await navigator.clipboard.writeText(payloadText || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    // Ensuring the print dialogue is targeted at the specific resume container
    window.print();
  };

  const resumeString = typeof text === "string" ? text : JSON.stringify(text, null, 2);

  return (
    <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8">
      {/* Enhanced Print-specific Styles for "Jake's Resume" LaTeX Fidelity */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #jakes-resume-print-area, #jakes-resume-print-area * { visibility: visible; }
          #jakes-resume-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0.5in 0.5in !important;
            margin: 0 !important;
            color: black !important;
            background: white !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 11pt !important;
            line-height: 1.15 !important;
          }
          .resume-section { 
            border-bottom: 0.5pt solid black !important; 
            margin-bottom: 4pt !important; 
            margin-top: 10pt !important; 
            font-weight: bold !important; 
            text-transform: uppercase !important; 
            letter-spacing: 0.5pt !important; 
            font-size: 11.5pt !important; 
          }
          .resume-header { text-align: center !important; margin-bottom: 12pt !important; }
          .resume-name { font-size: 26pt !important; font-weight: bold !important; margin-bottom: 1pt !important; letter-spacing: 1pt !important; }
          .resume-contact { font-size: 10pt !important; margin-bottom: 10pt !important; word-spacing: 3pt !important; }
          .flex-between { display: flex !important; justify-content: space-between !important; align-items: baseline !important; font-weight: bold !important; margin-bottom: 0.5pt !important; }
          .flex-between span:last-child { font-weight: normal !important; }
          .sub-role { display: flex !important; justify-content: space-between !important; align-items: baseline !important; font-style: italic !important; font-size: 10.5pt !important; margin-bottom: 1pt !important; }
          .resume-item { margin-bottom: 6pt !important; }
          .resume-bullets { padding-left: 20pt !important; margin-top: 1pt !important; margin-bottom: 4pt !important; }
          .resume-bullets li { margin-bottom: 1pt !important; list-style-type: disc !important; text-align: justify !important; }
          @page { size: auto; margin: 0; }
        }
      `}</style>

      {/* Main UI Header */}
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Neural Optimized Resume</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry standard formatting</p>
          </div>
        </div>

        <div className="flex gap-2">
           <button 
             onClick={handleCopy}
             className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
           >
             {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
             {copied ? "Copied" : "Copy Markdown"}
           </button>
           <button 
             onClick={handlePrint}
             className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
           >
             <Download size={14} />
             Download PDF
           </button>
           <Link 
             to="/jobs"
             className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
           >
             <Briefcase size={14} />
             Find Matches
           </Link>
        </div>
      </div>

      <div className="p-10">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white font-medium leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/50 max-h-[600px] overflow-y-auto custom-scrollbar border border-white/10">
          <code className="text-sm font-mono text-indigo-100">
            {resumeString}
          </code>
        </div>
        
        <div className="mt-10 p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 flex items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-lg font-black text-indigo-950">Jake's Format Export Ready</h4>
            <p className="text-sm font-medium text-indigo-700/80">Click the green "Download PDF" button to export your resume. Choose "Save as PDF" in the printer dialogue.</p>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-lg hover:translate-x-1 transition-all flex items-center gap-2"
          >
            Export Now <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Hidden Print Area - Formatted as "Jake's Resume" */}
      <div id="jakes-resume-print-area" className="hidden print:block">
        <div className="resume-header">
           <div className="resume-name">{resumeString.split('\n')[0].replace(/[#*]/g, '').trim() || 'CANDIDATE NAME'}</div>
           <div className="resume-contact">
             {resumeString.split('\n').find(l => l.includes('@') || l.includes('|'))?.replace(/[#*]/g, '').trim() || 'Phone | Email | LinkedIn | GitHub'}
           </div>
        </div>

        {resumeString.split('###').slice(1).map((section, idx) => {
          const lines = section.trim().split('\n');
          const title = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();

          return (
            <div key={idx} className="resume-item">
              <div className="resume-section">{title}</div>
              {content.split('\n').map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                
                // Experience entries (Bold title on left, Date on right)
                if (trimmed.startsWith('**') && trimmed.includes('|')) {
                   const parts = trimmed.split('|').map(p => p.replace(/\*\*/g, '').trim());
                   return (
                     <div key={lIdx} className="flex-between">
                       <span>{parts[0]}</span>
                       <span>{parts[1] || ''}</span>
                     </div>
                   );
                }

                // Sub-details (Italics)
                if ((trimmed.startsWith('*') || trimmed.startsWith('_')) && trimmed.includes('|')) {
                  const parts = trimmed.split('|').map(p => p.replace(/[*_]/g, '').trim());
                  return (
                    <div key={lIdx} className="sub-role">
                      <span>{parts[0]}</span>
                      <span>{parts[1] || ''}</span>
                    </div>
                  );
               }

                // Bullet points
                if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                   return (
                     <ul key={lIdx} className="resume-bullets">
                        <li>{trimmed.substring(1).trim()}</li>
                     </ul>
                   );
                }

                return <div key={lIdx} className="text-sm mb-1">{trimmed.replace(/\*\*/g, '')}</div>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RewrittenResume;
