// src/components/PomodoroTimer.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  const totalSeconds = isBreak ? 5 * 60 : 25 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progressPercentage = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  // Timer interval handling
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            if (!isBreak) {
              toast.success("Time's up! Take a break! ☕", {
                duration: 5000,
                icon: '☕',
              });
              setIsBreak(true);
              setMinutes(5);
              setSeconds(0);
            } else {
              toast.success("Break is over! Time to focus! 🚀", {
                duration: 5000,
                icon: '🚀',
              });
              setIsBreak(false);
              setMinutes(25);
              setSeconds(0);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (isBreak) {
      setMinutes(5);
    } else {
      setMinutes(25);
    }
    setSeconds(0);
  };

  const switchMode = (toBreak) => {
    setIsActive(false);
    setIsBreak(toBreak);
    setMinutes(toBreak ? 5 : 25);
    setSeconds(0);
  };

  // Format numerals
  const displayMinutes = String(minutes).padStart(2, '0');
  const displaySeconds = String(seconds).padStart(2, '0');

  // SVG Circumference: 2 * PI * r = 2 * 3.14159 * 40 = 251.2
  const strokeDashoffset = 251.2 - (progressPercentage / 100) * 251.2;

  return (
    <div className="bg-white dark:bg-slate-800/40 dark:backdrop-blur-sm p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden transition duration-300">
      {/* Decorative gradient blur */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
        isBreak ? 'bg-emerald-500' : 'bg-indigo-500'
      }`}></div>

      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
        {isBreak ? 'Break Session ☕' : 'Focus Session ⏱️'}
      </h3>

      <div className="relative flex justify-center items-center my-5">
        {/* SVG Circular Progress Ring */}
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="40"
            className="stroke-slate-100 dark:stroke-slate-900/60 fill-none"
            strokeWidth="5"
          />
          <circle
            cx="64"
            cy="64"
            r="40"
            className={`fill-none transition-all duration-300 ${
              isBreak ? 'stroke-emerald-500 dark:stroke-emerald-400' : 'stroke-indigo-600 dark:stroke-indigo-400'
            }`}
            strokeWidth="5"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-2xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {displayMinutes}:{displaySeconds}
        </div>
      </div>

      {/* Quick Mode Toggle Pills */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => switchMode(false)}
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${
            !isBreak
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          Focus Mode
        </button>
        <button
          onClick={() => switchMode(true)}
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${
            isBreak
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 hover:bg-slate-205 dark:hover:bg-slate-800'
          }`}
        >
          Break Time
        </button>
      </div>

      {/* Execution Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={toggleTimer}
          className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer text-white ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-600'
              : isBreak
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
