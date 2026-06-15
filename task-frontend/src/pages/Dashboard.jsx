// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialOffset, setDialOffset] = useState(314);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      toast.error('Failed to sync dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  // Compute metrics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Animate dial offset on load
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        const strokeDashoffset = 314 - (productivityScore / 100) * 314;
        setDialOffset(strokeDashoffset);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, productivityScore]);

  // Compute Category metrics helper
  const getCategoryMetrics = (categoryName) => {
    const categoryTasks = tasks.filter(t => (t.category || 'General').toLowerCase() === categoryName.toLowerCase());
    const total = categoryTasks.length;
    const completed = categoryTasks.filter(t => t.status === 'completed').length;
    const ratio = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, ratio };
  };

  const workMetrics = getCategoryMetrics('Work');
  const collegeMetrics = getCategoryMetrics('College');
  const personalMetrics = getCategoryMetrics('Personal');
  const generalMetrics = getCategoryMetrics('General');

  // Find tasks due today (local time YYYY-MM-DD comparison)
  const getLocalDateString = (dateObj = new Date()) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();
  const tasksDueToday = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDateStr = task.dueDate.split('T')[0];
    return taskDateStr === todayStr;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6 space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-6 px-2 space-y-8 text-left">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
          Workspace Insights
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Welcome back! Here is a summary of your productivity metrics and items needing attention.
        </p>
      </div>

      {/* Main Grid Layout for Metrics & Dial */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Card 1: Total Tasks */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Total Tasks
            </p>
            <h3 className="text-3xl font-bold text-slate-855 dark:text-slate-100">{totalTasks}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Aggregate tasks list</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-955/40 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/40">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        </div>

        {/* Card 2: Ongoing Tasks */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Ongoing Tasks
            </p>
            <h3 className="text-3xl font-bold text-slate-855 dark:text-slate-100">{pendingTasks}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Active items left</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-955/40 rounded-xl text-amber-600 dark:text-amber-405 border border-amber-100/50 dark:border-amber-900/40">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Completed Items */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition hover:shadow-md">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Completed Items
            </p>
            <h3 className="text-3xl font-bold text-slate-855 dark:text-slate-100">{completedTasks}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Total items finished</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-955/40 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/40">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Card 4 & 5: Productivity Ratio Efficiency Dial Score */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 transition hover:shadow-md lg:col-span-2">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 uppercase tracking-wider">
              Productivity Efficiency Dial
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[210px] leading-relaxed">
              Dynamically measures completion vs aggregate creation ratio. Keep resolving tasks to max the score!
            </p>
          </div>
          
          <div className="relative flex items-center justify-center">
            {/* SVG radial progress score dial */}
            <svg className="w-28 h-28 transform -rotate-90">
              <defs>
                <linearGradient id="efficiencyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <circle
                cx="56"
                cy="56"
                r="50"
                className="stroke-slate-100 dark:stroke-slate-900 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r="50"
                fill="none"
                stroke="url(#efficiencyGrad)"
                strokeWidth="8"
                strokeDasharray="314"
                strokeDashoffset={dialOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{productivityScore}%</span>
              <span className="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Ratio</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid containing Category Progress Tracks vs Due Today Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Progress Tracks Card */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              Category Tracks Completion Rate
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visual breakdown of task progress tracking inside Work vs College tracks.
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Work Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  💼 Work Track
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {workMetrics.completed} / {workMetrics.total} Tasks ({workMetrics.ratio}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/80">
                <div 
                  style={{ width: `${workMetrics.ratio}%` }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-650 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                ></div>
              </div>
            </div>

            {/* College Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  🎓 College Track
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {collegeMetrics.completed} / {collegeMetrics.total} Tasks ({collegeMetrics.ratio}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/80">
                <div 
                  style={{ width: `${collegeMetrics.ratio}%` }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-650 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                ></div>
              </div>
            </div>

            {/* Personal Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                  🏠 Personal Track
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {personalMetrics.completed} / {personalMetrics.total} Tasks ({personalMetrics.ratio}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/80">
                <div 
                  style={{ width: `${personalMetrics.ratio}%` }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                ></div>
              </div>
            </div>

            {/* General Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-450 flex items-center gap-1.5">
                  📁 General Track
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {generalMetrics.completed} / {generalMetrics.total} Tasks ({generalMetrics.ratio}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-200/50 dark:border-slate-800/80">
                <div 
                  style={{ width: `${generalMetrics.ratio}%` }}
                  className="bg-gradient-to-r from-slate-400 to-slate-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Due Today Quick Summary Card */}
        <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-855 dark:text-slate-100 mb-1 flex items-center gap-2">
              ⏰ Due Today Summary
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-105 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {tasksDueToday.length} {tasksDueToday.length === 1 ? 'task' : 'tasks'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Urgent tasks that require resolution by today.
            </p>

            {tasksDueToday.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10">
                <span className="text-3xl">🎉</span>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-350 mt-2">All Caught Up!</h4>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">No tasks due today. Keep up the great pace!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto pr-1">
                {tasksDueToday.map((task) => (
                  <div key={task._id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-semibold text-sm text-slate-800 dark:text-slate-200 ${
                          task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500 font-normal' : ''
                        }`}>
                          {task.title}
                        </h4>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                          {task.category || 'General'}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          task.priority === 'high' ? 'bg-red-105 text-red-800 dark:bg-red-950/60 dark:text-red-400' :
                          task.priority === 'medium' ? 'bg-amber-105 text-amber-850 dark:bg-amber-950/60 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-805 dark:bg-emerald-950/60 dark:text-emerald-405'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-end">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-305 transition"
            >
              Open Tasks Board
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}