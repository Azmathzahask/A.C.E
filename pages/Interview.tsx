
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { User } from '../types';
import { 
  Mic, 
  Video, 
  Loader2, 
  Sparkles, 
  StopCircle,
  Activity,
  Power,
  Zap,
  Briefcase,
  AlertTriangle,
  ShieldCheck,
  Layout,
  Globe,
  Heart,
  Clock,
  CheckCircle2,
  Volume2,
  Info
} from 'lucide-react';
import { analyzePerformance, quotaState } from '../services/geminiService';

const ROLES = [
  { id: 'sw_intern', title: 'Software Intern', icon: Zap },
  { id: 'ai_intern', title: 'AI Intern', icon: Sparkles },
  { id: 'frontend_intern', title: 'Frontend Intern', icon: Layout },
  { id: 'product_intern', title: 'Product Intern', icon: Briefcase },
  { id: 'data_intern', title: 'Data Intern', icon: Activity },
];

type LabState = 'idle' | 'active' | 'feedback' | 'error' | 'analyzing';

const Interview: React.FC<{ user: User }> = ({ user }) => {
  const [labState, setLabState] = useState<LabState>('idle');
  const [role, setRole] = useState(ROLES[0].title);
  const [loading, setLoading] = useState(false);
  const [videoEnabled] = useState(true);
  const [aiStatus, setAiStatus] = useState<'IDLE' | 'LISTENING' | 'SPEAKING'>('IDLE');
  const [lastError, setLastError] = useState<string | null>(null);
  const [analysisReport, setAnalysisReport] = useState<any>(null);
  const [transcription, setTranscription] = useState<{role: 'user'|'assistant', text: string}[]>([]);
  const [activeCaption, setActiveCaption] = useState<string | null>(null);
  
  // Audio & Logic Refs
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const transcriptRef = useRef<{role: 'user'|'assistant', text: string}[]>([]);
  const partialTextRef = useRef<string>('');

  useEffect(() => {
    return () => terminateSession();
  }, []);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const terminateSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    activeSourcesRef.current.forEach(s => s.stop());
    activeSourcesRef.current.clear();
    setActiveCaption(null);
  };

  const startInterview = async () => {
    setLoading(true);
    setLastError(null);
    setTranscription([]);
    transcriptRef.current = [];
    partialTextRef.current = '';
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;

      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setLabState('active');
            setAiStatus('LISTENING');
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const processor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: createBlob(inputData) });
              });
            };
            source.connect(processor);
            processor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextOutRef.current) {
              setAiStatus('SPEAKING');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextOutRef.current.currentTime);
              const buffer = await decodeAudioData(decode(audioData), audioContextOutRef.current, 24000, 1);
              const source = audioContextOutRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextOutRef.current.destination);
              source.onended = () => {
                activeSourcesRef.current.delete(source);
                if (activeSourcesRef.current.size === 0) setAiStatus('LISTENING');
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSourcesRef.add(source);
            }

            if (msg.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // High-Fidelity Captions Logic
            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              if (text) {
                setActiveCaption(text);
                partialTextRef.current += " " + text;
                if (/[.!?]$/.test(text.trim())) {
                  const entry = { role: 'user' as const, text: partialTextRef.current.trim() };
                  transcriptRef.current.push(entry);
                  setTranscription([...transcriptRef.current]);
                  partialTextRef.current = '';
                }
              }
            }
            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              if (text) {
                setActiveCaption(text);
                const entry = { role: 'assistant' as const, text };
                transcriptRef.current.push(entry);
                setTranscription([...transcriptRef.current]);
              }
            }

            if (msg.serverContent?.turnComplete) {
              setTimeout(() => setActiveCaption(null), 1500);
            }
          },
          onerror: (e) => {
            console.error("Live API Error", e);
            setLastError("Neural link saturated. Switching to local recovery.");
            setLabState('error');
          },
          onclose: () => setAiStatus('IDLE')
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are A.C.E, an elite AI technical interviewer. 
          The candidate is applying for the ${role} position. 
          Conduct a high-stakes, professional interview. 
          Ask sharp, insightful questions. Be human-like and responsive. 
          Respond in full sentences and wait for the candidate.
          If you are ready to conclude, say something like "That's all for today, thank you for your time."`
        }
      });

      sessionRef.current = await sessionPromise;
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLastError("Hardware access denied or API initialization failed.");
      setLabState('error');
      setLoading(false);
    }
  };

  const endInterview = async () => {
    setLabState('analyzing');
    setLoading(true);
    
    if (partialTextRef.current.trim()) {
      transcriptRef.current.push({ role: 'user', text: partialTextRef.current.trim() });
    }

    const transcriptText = transcriptRef.current.length > 0
      ? transcriptRef.current.map(m => `${m.role === 'assistant' ? 'A.C.E' : 'Candidate'}: ${m.text}`).join('\n\n')
      : "No interaction recorded. Initial calibration session only.";

    terminateSession();

    try {
      const report = await analyzePerformance(role, transcriptText);
      setAnalysisReport(report);
      setLabState('feedback');
    } catch (err) {
      setLastError("Audit failure. Please ensure the transcript is robust.");
      setLabState('error');
    } finally {
      setLoading(false);
    }
  };

  const videoElementRef = useCallback((node: HTMLVideoElement | null) => {
    if (node && mediaStreamRef.current) {
      node.srcObject = mediaStreamRef.current;
      node.onloadedmetadata = () => node.play().catch(() => {});
    }
  }, [mediaStreamRef.current]);

  const isPro = quotaState.isProMode;

  if (labState === 'analyzing') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in">
        <div className={`w-24 h-24 ${isPro ? 'bg-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.5)]' : 'bg-indigo-600'} rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl`}>
          <Loader2 className="animate-spin" size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Analyzing Performance</h2>
        <p className="text-slate-500 font-medium">Synthesizing signals and professional verdict...</p>
      </div>
    );
  }

  if (labState === 'feedback' && analysisReport) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-700 pb-20">
        <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Performance Audit</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Gemini Live Grounded Assessment</p>
            </div>
            <div className={`${isPro ? 'bg-amber-600 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-200'} text-white w-28 h-28 rounded-3xl flex flex-col items-center justify-center shadow-2xl`}>
              <span className="text-4xl font-black">{analysisReport.score || 0}</span>
              <span className="text-[10px] font-bold opacity-60 uppercase">Score</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <p className={`${isPro ? 'text-amber-600' : 'text-indigo-600'} font-black uppercase text-xs tracking-widest flex items-center gap-2`}><Sparkles size={16}/> Professional Verdict</p>
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                {analysisReport.verdict}
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-rose-600 font-black uppercase text-xs tracking-widest flex items-center gap-2"><AlertTriangle size={16}/> Critical Drawbacks</p>
              <div className="space-y-3">
                {analysisReport.drawbacks?.map((d: string, i: number) => (
                  <div key={i} className="bg-rose-50 p-5 rounded-2xl border border-rose-100 text-rose-900 text-sm font-bold flex gap-3">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" /> {d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-slate-100">
             <div className="space-y-6">
                <p className="text-emerald-600 font-black uppercase text-xs tracking-widest flex items-center gap-2"><CheckCircle2 size={16}/> Recommended Strategy</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisReport.actionableSteps?.map((s: string, i: number) => (
                    <div key={i} className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-emerald-900 text-sm font-bold flex gap-3">
                      <Zap className="shrink-0" size={16} /> {s}
                    </div>
                  ))}
                </div>
             </div>
          </div>
          
          <button onClick={() => setLabState('idle')} className="mt-16 w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:bg-black transition-all">
            Initiate New Session <Power size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[85vh] flex flex-col gap-8 bg-[#f8fafc] p-1">
      {labState === 'idle' || labState === 'error' ? (
        <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl max-w-4xl w-full space-y-12">
            <div className="text-center space-y-4">
              <div className={`w-20 h-20 ${isPro ? 'bg-amber-600' : 'bg-indigo-600'} rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl mb-6 relative group`}>
                <Heart size={40} className="fill-white" />
                {isPro && (
                   <Zap size={24} className="absolute -top-2 -right-2 text-amber-300 animate-pulse" />
                )}
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">Interview Lab v2</h1>
              <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                Neural Audio & Real-time Captions. Benchmarking for the {role} position.
              </p>
              {isPro && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-xs font-black uppercase tracking-widest">
                  <Activity size={14} /> Turbo Link: Unlimited RPM Engaged
                </div>
              )}
              {lastError && <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-sm text-center">{lastError}</div>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {ROLES.map((r) => (
                <button key={r.id} onClick={() => setRole(r.title)} className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${role === r.title ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-lg scale-105' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}><r.icon size={24} /><span className="text-[10px] font-black uppercase tracking-tighter text-center">{r.title}</span></button>
              ))}
            </div>
            <button onClick={startInterview} disabled={loading} className={`w-full ${isPro ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-6 rounded-3xl font-black text-2xl transition-all shadow-xl flex items-center justify-center gap-4 group disabled:opacity-50`}>
              {loading ? <Loader2 className="animate-spin" /> : <Power size={28} />}
              {loading ? 'CALIBRATING...' : isPro ? 'ENGAGE TURBO SESSION' : 'INITIATE LIVE SESSION'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full animate-in zoom-in bg-slate-950 rounded-[4rem] p-4">
          <div className="lg:col-span-3 relative h-full bg-black rounded-[3.5rem] overflow-hidden shadow-2xl">
            <video ref={videoElementRef} autoPlay muted playsInline className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-1000 ${videoEnabled ? 'opacity-100' : 'opacity-20'}`} />
            
            <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between">
              <div className="flex justify-between items-start pointer-events-auto">
                <div className={`${isPro ? 'bg-amber-600 shadow-amber-500/50' : 'bg-rose-600 shadow-rose-600/50'} text-white px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest flex items-center gap-3 shadow-2xl animate-pulse`}>
                  <Globe size={16} /> {isPro ? 'LIVE_TURBO_GROUNDING' : 'LIVE_NEURAL_CAPTIONING'}
                </div>
                <div className="bg-black/50 backdrop-blur-xl text-white/80 px-6 py-2 rounded-2xl text-[10px] font-black tracking-widest flex items-center gap-3 border border-white/10">
                  <Volume2 size={16} /> 24kHz_PCM_HD
                </div>
              </div>

              {/* Real-time Glassmorphism Captions */}
              <div className="flex flex-col items-center justify-center flex-1 pb-10">
                {activeCaption && (
                  <div className="max-w-2xl px-10 py-5 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl text-white text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-4 duration-300">
                    <p className="text-xl font-bold leading-relaxed italic">"{activeCaption}"</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 pointer-events-auto">
                <div className="bg-black/70 backdrop-blur-3xl px-10 py-6 rounded-[3.5rem] border border-white/10 flex items-center gap-6 shadow-2xl">
                  <div className="flex items-center gap-8 text-white/40">
                    <Mic className={aiStatus === 'LISTENING' ? 'text-emerald-500' : ''} />
                    <Video className="text-indigo-400" />
                  </div>
                  <div className="h-8 w-px bg-white/10"></div>
                  <button onClick={endInterview} disabled={loading} className="bg-rose-600 text-white px-10 py-5 rounded-3xl font-black flex items-center gap-3 hover:bg-rose-700 transition-all shadow-xl group">
                    {loading ? <Loader2 className="animate-spin" /> : <StopCircle size={28} className="group-hover:scale-110 transition-transform" />}
                    END SESSION & AUDIT
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white/5 backdrop-blur-md rounded-[3.5rem] border border-white/10 flex flex-col overflow-hidden">
            <div className="p-10 border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="font-black text-white">{isPro ? 'Turbo Transcript' : 'Neural Transcript'}</h4>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Grounding Log</p>
              </div>
              <Activity size={20} className={`${isPro ? 'text-amber-500' : 'text-indigo-500'} animate-pulse`} />
            </div>
            <div className="flex-1 p-8 overflow-y-auto space-y-8 scroll-smooth custom-scrollbar">
              {transcription.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-30 gap-4">
                  <Clock size={40} className="text-white" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Committing signals...</p>
                </div>
              )}
              {transcription.map((msg, idx) => (
                <div key={idx} className={`space-y-2 animate-in slide-in-from-right-2 duration-300`}>
                  <div className={`flex items-center gap-2 mb-1`}>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${msg.role === 'assistant' ? (isPro ? 'text-amber-400' : 'text-indigo-400') : 'text-emerald-400'}`}>
                      {msg.role === 'assistant' ? 'A.C.E' : 'Candidate'}
                    </span>
                  </div>
                  <div className={`p-4 rounded-2xl border ${msg.role === 'assistant' ? 'bg-indigo-600/10 border-indigo-500/20 text-white/80' : 'bg-white/5 border-white/10 text-white/60 italic'}`}>
                    <p className="text-xs font-medium">{msg.text}</p>
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

export default Interview;
