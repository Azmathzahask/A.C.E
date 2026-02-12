
import React, { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";

interface ResumeUploadProps {
  onFileSelected: (file: File) => void;
  isAnalyzing: boolean;
}

const ResumeUpload = ({ onFileSelected, isAnalyzing }: ResumeUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div
      className={`relative border-4 border-dashed rounded-[3rem] transition-all duration-300 bg-white ${
        dragOver
          ? "border-indigo-600 bg-indigo-50/50 scale-[1.01]"
          : "border-slate-200 hover:border-indigo-400"
      } ${isAnalyzing ? "pointer-events-none opacity-60" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {selectedFile ? (
          <div className="flex items-center gap-4 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 animate-in zoom-in">
            <FileText className="h-10 w-10 text-indigo-600" />
            <div className="text-left">
              <p className="font-black text-slate-800 text-lg">{selectedFile.name}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {!isAnalyzing && (
              <button 
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="p-2 hover:bg-rose-100 text-rose-500 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto group-hover:text-indigo-600 transition-colors">
              <Upload className="h-10 w-10" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 tracking-tight">
                Drop your resume PDF here
              </p>
              <p className="text-slate-400 font-medium">
                or click to browse your local filesystem
              </p>
            </div>
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
