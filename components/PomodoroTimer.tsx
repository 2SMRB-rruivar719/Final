import React, { useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { Play, Pause, RotateCcw, X, Coffee, Brain, ChevronDown } from 'lucide-react';

interface PomodoroTimerProps {
  isDark: boolean;
  onClose: () => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const WORK_TIME = 25 * 60;
const SHORT_BREAK_TIME = 5 * 60;
const LONG_BREAK_TIME = 15 * 60;

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ isDark, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [cycles, setCycles] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  const handleComplete = () => {
    setIsActive(false);
    
    // Reproducir un sonido de notificación sutil si es posible
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      // Ignorar si el navegador bloquea autoplay
    }

    if (mode === 'focus') {
      // Dispatch Gamification XP Event
      window.dispatchEvent(new CustomEvent('tm_xp_gain', { detail: { amount: 50 } }));
      
      const newCycles = cycles + 1;
      setCycles(newCycles);
      if (newCycles % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(LONG_BREAK_TIME);
      } else {
        setMode('shortBreak');
        setTimeLeft(SHORT_BREAK_TIME);
      }
    } else {
      setMode('focus');
      setTimeLeft(WORK_TIME);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'focus') setTimeLeft(WORK_TIME);
    else if (mode === 'shortBreak') setTimeLeft(SHORT_BREAK_TIME);
    else setTimeLeft(LONG_BREAK_TIME);
  };

  const changeMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'focus') setTimeLeft(WORK_TIME);
    else if (newMode === 'shortBreak') setTimeLeft(SHORT_BREAK_TIME);
    else setTimeLeft(LONG_BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 100 - (timeLeft / (mode === 'focus' ? WORK_TIME : mode === 'shortBreak' ? SHORT_BREAK_TIME : LONG_BREAK_TIME)) * 100;

  const modeColors = {
    focus: 'from-travel-accent to-travel-primary',
    shortBreak: 'from-amber-400 to-orange-500',
    longBreak: 'from-emerald-400 to-teal-600',
  };

  const currentGradient = modeColors[mode];

  if (isMinimized) {
    return (
      <div 
        className={`fixed bottom-[80px] right-4 lg:bottom-6 lg:right-6 z-[100] rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 p-3 animate-fade-in-up cursor-pointer transition-all hover:scale-105
          ${isDark ? 'bg-slate-900/90 border-slate-700/80 shadow-black/50' : 'bg-white/95 border-gray-200/80 shadow-travel-primary/20'}`}
        onClick={() => setIsMinimized(false)}
      >
        <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${currentGradient} flex items-center justify-center text-white shadow-inner`}>
          {mode === 'focus' ? <Brain size={18} /> : <Coffee size={18} />}
          {isActive && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          )}
        </div>
        <div className="flex flex-col mr-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {mode === 'focus' ? 'Enfoque' : 'Descanso'}
          </span>
          <span className={`text-lg font-bold tabular-nums leading-none ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'}`}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-[80px] right-4 lg:bottom-6 lg:right-6 w-80 z-[100] rounded-[2rem] shadow-2xl border backdrop-blur-2xl overflow-hidden animate-fade-in-up transition-all duration-300
      ${isDark ? 'bg-slate-900/85 border-slate-700/80 shadow-black/50' : 'bg-white/85 border-white shadow-travel-primary/20'}`}>
      
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-slate-800/80' : 'border-gray-100/80'}`}>
        <div className="flex items-center gap-2">
          <Brain size={16} className={isDark ? 'text-travel-accent' : 'text-travel-primary'} />
          <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Study Focus</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(true)}
            className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
            title="Minimizar"
          >
            <ChevronDown size={16} />
          </button>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-gray-400 hover:text-red-400' : 'hover:bg-gray-200 text-gray-500 hover:text-red-500'}`}
            title="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-5 pb-2 flex justify-center gap-2">
        <button
          onClick={() => changeMode('focus')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            mode === 'focus' 
              ? `bg-gradient-to-r ${modeColors.focus} text-white shadow-md` 
              : isDark ? 'bg-slate-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-500 hover:text-gray-800'
          }`}
        >
          Enfoque
        </button>
        <button
          onClick={() => changeMode('shortBreak')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            mode === 'shortBreak' 
              ? `bg-gradient-to-r ${modeColors.shortBreak} text-white shadow-md` 
              : isDark ? 'bg-slate-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-500 hover:text-gray-800'
          }`}
        >
          Corto
        </button>
        <button
          onClick={() => changeMode('longBreak')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            mode === 'longBreak' 
              ? `bg-gradient-to-r ${modeColors.longBreak} text-white shadow-md` 
              : isDark ? 'bg-slate-800 text-gray-400 hover:text-gray-200' : 'bg-gray-100 text-gray-500 hover:text-gray-800'
          }`}
        >
          Largo
        </button>
      </div>

      {/* Timer Circle */}
      <div className="py-8 flex flex-col items-center justify-center relative">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Background Track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="46" 
              fill="none" 
              stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 
              strokeWidth="4"
            />
            {/* Progress */}
            <circle 
              cx="50" cy="50" r="46" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeDasharray="289.02" // 2 * PI * 46
              strokeDashoffset={289.02 - (progress / 100) * 289.02}
              className={`transition-all duration-1000 ease-linear ${mode === 'shortBreak' ? 'text-amber-400' : mode === 'longBreak' ? 'text-emerald-400' : 'text-travel-accent'}`}
            />
          </svg>
          
          <div className="text-center z-10">
            <span className={`block text-5xl font-black tabular-nums tracking-tighter ${isDark ? 'text-white' : 'text-travel-dark'}`}>
              {formatTime(timeLeft)}
            </span>
            <span className={`block text-xs font-bold uppercase tracking-widest mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {mode === 'focus' ? 'Estudiando' : 'Descansando'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`px-8 pb-8 pt-2 flex items-center justify-center gap-6`}>
        <button 
          onClick={resetTimer}
          className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all hover:scale-105 active:scale-95
            ${isDark ? 'border-slate-700/80 text-gray-300 hover:bg-slate-800' : 'border-gray-200/80 text-gray-500 hover:bg-gray-50'}`}
        >
          <RotateCcw size={20} />
        </button>
        
        <button 
          onClick={toggleTimer}
          className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg shadow-travel-primary/30 transition-all hover:scale-105 active:scale-95 bg-gradient-to-br ${currentGradient} text-white`}
        >
          {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>

        <div className={`w-12 h-12 flex flex-col items-center justify-center rounded-full border-2 border-transparent transition-all`}>
          <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Ciclo
          </span>
          <span className={`text-sm font-black ${isDark ? 'text-travel-accent' : 'text-travel-primary'}`}>
            {cycles}
          </span>
        </div>
      </div>
    </div>
  );
};
