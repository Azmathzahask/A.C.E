
import React from 'react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { TrendingUp, Award, Clock, BookOpen } from 'lucide-react';

const quizData = [
  { name: 'JavaScript', score: 85 },
  { name: 'React', score: 92 },
  { name: 'Python', score: 78 },
  { name: 'AWS', score: 65 },
  { name: 'Node.js', score: 88 },
];

const activityData = [
  { day: 'Mon', hours: 2 },
  { day: 'Tue', hours: 4.5 },
  { day: 'Wed', hours: 3 },
  { day: 'Thu', hours: 5 },
  { day: 'Fri', hours: 2.5 },
  { day: 'Sat', hours: 6 },
  { day: 'Sun', hours: 4 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Progress: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Learning Analytics</h1>
          <p className="text-slate-500">Track your performance trends and study habits over time.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">Last 7 Days</div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp size={24} /></div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Rank</span>
          </div>
          <p className="text-3xl font-black text-slate-800">Top 12%</p>
          <p className="text-xs text-emerald-500 font-bold mt-1">↑ 2% from last week</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Award size={24} /></div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Achievements</span>
          </div>
          <p className="text-3xl font-black text-slate-800">24</p>
          <p className="text-xs text-slate-400 font-bold mt-1">4 more to next level</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Clock size={24} /></div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Study Time</span>
          </div>
          <p className="text-3xl font-black text-slate-800">128 hrs</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Across 14 active skills</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl"><BookOpen size={24} /></div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Lessons</span>
          </div>
          <p className="text-3xl font-black text-slate-800">85%</p>
          <p className="text-xs text-emerald-500 font-bold mt-1">Completion rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[400px]">
          <h3 className="text-xl font-bold text-slate-800 mb-8">Quiz Performance</h3>
          <ResponsiveContainer width="100%" height="80%">
            <ReBarChart data={quizData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                {quizData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-[400px]">
          <h3 className="text-xl font-bold text-slate-800 mb-8">Study Activity (Hours)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Progress;
