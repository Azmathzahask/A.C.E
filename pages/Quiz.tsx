
import React, { useState, useEffect } from 'react';
import { generateQuiz, QuotaError } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { 
  GraduationCap, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  RefreshCcw,
  Trophy,
  LayoutDashboard,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Quiz: React.FC = () => {
  const [topic, setTopic] = useState('JavaScript');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
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

  const startQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setCurrentIdx(0);
    setQuotaExceeded(false);
    try {
      const qs = await generateQuiz(topic, difficulty);
      setQuestions(qs);
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

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [currentIdx]: idx });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  if (quotaExceeded) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 bg-white p-12 rounded-[3rem] shadow-2xl border border-amber-100 animate-in fade-in">
        <Clock size={64} className="text-amber-500 mx-auto mb-8 animate-pulse" />
        <h2 className="text-3xl font-black text-slate-900 mb-4">Neural Capacity Reached</h2>
        <p className="text-slate-500 mb-6 font-medium leading-relaxed">
          The AI system is cooling down. Please wait a moment before trying to generate more assessment questions.
        </p>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cooling Down</p>
          <p className="text-4xl font-black text-indigo-600">{retryTimer}s</p>
        </div>
        <div className="flex flex-col gap-4">
          <button 
            disabled={retryTimer > 0}
            onClick={startQuiz} 
            className="w-full bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            {retryTimer > 0 ? <Loader2 className="animate-spin" size={24} /> : <RefreshCcw size={24} />}
            {retryTimer > 0 ? `Please Wait...` : `Generate Quiz Now`}
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;
    
    return (
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${percentage >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            <Trophy size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-2">Quiz Complete!</h2>
          <p className="text-slate-500 mb-8">Review your performance on <span className="font-bold">{topic}</span> ({difficulty})</p>
          
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-50 p-6 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Score</span>
              <span className="text-3xl font-black text-slate-800">{score} / {questions.length}</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Percentage</span>
              <span className="text-3xl font-black text-slate-800">{percentage}%</span>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="font-bold text-slate-800 px-2">Review Answers</h4>
            {questions.map((q, idx) => (
              <div key={idx} className={`p-6 rounded-2xl border ${answers[idx] === q.correctAnswer ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <p className="font-bold text-slate-800 text-sm mb-3">Q{idx + 1}: {q.question}</p>
                <div className="space-y-2">
                  <p className="text-xs flex items-center gap-2">
                    <span className="font-bold">Your answer:</span>
                    <span className={answers[idx] === q.correctAnswer ? 'text-emerald-600' : 'text-rose-600'}>
                      {q.options[answers[idx]] || 'Unanswered'}
                    </span>
                  </p>
                  {answers[idx] !== q.correctAnswer && (
                    <p className="text-xs text-emerald-600 flex items-center gap-2">
                      <span className="font-bold">Correct answer:</span> {q.options[q.correctAnswer]}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 italic mt-2 bg-white/50 p-2 rounded-lg">{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex gap-4">
            <button onClick={() => setQuestions([])} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">Try Another Topic</button>
            <Link to="/" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <LayoutDashboard size={20} />
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length > 0) {
    const q = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{topic} Quiz</h2>
            <p className="text-slate-500 text-sm">{difficulty} Level</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-indigo-600">Question {currentIdx + 1} of {questions.length}</p>
            <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8">
          <h3 className="text-xl font-bold text-slate-800 leading-relaxed">{q.question}</h3>
          
          <div className="space-y-4">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  answers[currentIdx] === idx 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-50' 
                    : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium">{opt}</span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  answers[currentIdx] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                }`}>
                  {answers[currentIdx] === idx && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-slate-100">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold disabled:opacity-30"
            >
              <ArrowLeft size={18} />
              Previous
            </button>
            {currentIdx === questions.length - 1 ? (
              <button
                disabled={answers[currentIdx] === undefined}
                onClick={() => setSubmitted(true)}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                Submit Quiz
                <CheckCircle2 size={18} />
              </button>
            ) : (
              <button
                disabled={answers[currentIdx] === undefined}
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-900 shadow-lg shadow-slate-100 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                Next Question
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl rotate-12 flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-indigo-100">
          <GraduationCap size={40} className="-rotate-12" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Challenge Your Knowledge</h1>
        <p className="text-slate-500 max-w-lg mx-auto">Take skill-specific assessments generated by AI to measure your professional growth.</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Select Topic</label>
            <div className="grid grid-cols-2 gap-3">
              {['JavaScript', 'React', 'Python', 'Node.js', 'SQL', 'AWS'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`py-4 rounded-2xl border-2 font-bold transition-all ${
                    topic === t ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Difficulty</label>
              <div className="flex gap-2">
                {['Easy', 'Intermediate', 'Hard'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${
                      difficulty === d ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <RefreshCcw size={24} />}
              {loading ? 'Preparing Questions...' : 'Start Assessment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
