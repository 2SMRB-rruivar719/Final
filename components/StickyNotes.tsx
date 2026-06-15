import React, { useState, useEffect } from 'react';
import { ThemeMode } from '../types';
import { X, StickyNote, Minimize2, Maximize2, Save } from 'lucide-react';

interface StickyNotesProps {
  isDark: boolean;
  onClose: () => void;
  userId: string;
}

export const StickyNotes: React.FC<StickyNotesProps> = ({ isDark, onClose, userId }) => {
  const [content, setContent] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    const savedNotes = localStorage.getItem(`tm_notes_${userId}`);
    if (savedNotes) {
      setContent(savedNotes);
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(`tm_notes_${userId}`, content);
    setIsSaved(true);
  };

  // Auto-save every 3 seconds if not saved
  useEffect(() => {
    if (isSaved) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 3000);
    return () => clearTimeout(timer);
  }, [content, isSaved]);

  if (isMinimized) {
    return (
      <div 
        className={`fixed bottom-[140px] right-4 lg:bottom-[88px] lg:right-6 z-[90] rounded-full shadow-lg border backdrop-blur-xl flex items-center justify-center w-14 h-14 animate-fade-in-up cursor-pointer transition-all hover:scale-105 hover:-translate-y-1
          ${isDark ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-amber-100 border-amber-200 text-amber-600'}`}
        onClick={() => setIsMinimized(false)}
        title="Abrir Notas"
      >
        <StickyNote size={24} />
        {!isSaved && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
      </div>
    );
  }

  return (
    <div className={`fixed bottom-[80px] right-4 lg:bottom-[88px] lg:right-[340px] w-72 sm:w-80 h-96 z-[90] rounded-[1.5rem] shadow-2xl border backdrop-blur-2xl flex flex-col overflow-hidden animate-fade-in-up transition-all duration-300
      ${isDark ? 'bg-amber-900/40 border-amber-500/30 shadow-black/60' : 'bg-[#fffdf2]/95 border-amber-200 shadow-amber-900/10'}`}>
      
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isDark ? 'border-amber-500/20 bg-amber-900/50' : 'border-amber-200 bg-amber-100/50'}`}>
        <div className="flex items-center gap-2">
          <StickyNote size={16} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
          <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>Apuntes Rápidos</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] mr-2 font-medium opacity-70 ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
            {isSaved ? 'Guardado' : 'Guardando...'}
          </span>
          <button 
            onClick={() => setIsMinimized(true)}
            className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-amber-800/50 text-amber-300' : 'hover:bg-amber-200/50 text-amber-700'}`}
            title="Minimizar"
          >
            <Minimize2 size={16} />
          </button>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-amber-800/50 text-amber-300 hover:text-red-400' : 'hover:bg-amber-200/50 text-amber-700 hover:text-red-500'}`}
            title="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-0 relative">
        <textarea
          value={content}
          onChange={handleChange}
          onBlur={handleSave}
          placeholder="Escribe tus notas, fórmulas o tareas aquí..."
          className={`w-full h-full p-4 resize-none outline-none text-sm leading-relaxed font-medium transition-colors
            ${isDark 
              ? 'bg-transparent text-amber-100 placeholder-amber-700/50' 
              : 'bg-transparent text-gray-800 placeholder-amber-900/30'}`}
          style={{
            backgroundImage: isDark 
              ? 'linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px)' 
              : 'linear-gradient(rgba(245, 158, 11, 0.15) 1px, transparent 1px)',
            backgroundSize: '100% 1.75rem',
            lineHeight: '1.75rem',
            paddingTop: '0.5rem'
          }}
        />
      </div>
    </div>
  );
};
