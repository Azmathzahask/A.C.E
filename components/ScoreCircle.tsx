
import React from 'react';

interface ScoreCircleProps {
  score: number;
}

const ScoreCircle = ({ score }: ScoreCircleProps) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getStrokeColor = () => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 60) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  const getLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            className="stroke-slate-100"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={`${getStrokeColor()} animate-score-fill transition-all duration-1000`}
            strokeDasharray={circumference}
            style={{
              "--score-offset": `${offset}`,
              strokeDashoffset: offset,
            } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black ${getScoreColor()}`}>{score}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-black uppercase tracking-widest ${getScoreColor()}`}>{getLabel()}</span>
    </div>
  );
};

export default ScoreCircle;
