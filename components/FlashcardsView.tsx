import React, { useState, useEffect } from 'react';
import { UserProfile, LanguageCode, ThemeMode } from '../types';
import { Plus, Trash2, RotateCw, ChevronLeft, ChevronRight, BrainCircuit, Check, X } from 'lucide-react';
import { Button } from './Button';
import { useToast } from './ToastProvider';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  learned: boolean;
}

interface FlashcardsViewProps {
  currentUser: UserProfile;
  language: LanguageCode;
  theme: ThemeMode;
}

const DEFAULT_CARDS: Flashcard[] = [
  { id: '1', front: '¿Qué es el ciclo de Krebs?', back: 'Ruta metabólica que forma parte de la respiración celular en todas las células aerobias.', learned: false },
  { id: '2', front: 'Derivada de e^x', back: 'La derivada de e^x es e^x.', learned: false },
  { id: '3', front: 'Técnica Pomodoro', back: 'Método de gestión de tiempo: 25 min estudio / 5 min descanso.', learned: true },
];

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ currentUser, language, theme }) => {
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const t = language === 'en' ? {
    title: 'Study Flashcards',
    subtitle: `Review key concepts for ${currentUser.destination}`,
    addBtn: 'Add Card',
    flipBtn: 'Flip Card',
    knowIt: 'I know it',
    dontKnowIt: 'Study again',
    frontLabel: 'Concept (Front)',
    backLabel: 'Definition (Back)',
    save: 'Save',
    cancel: 'Cancel',
    empty: 'No flashcards yet. Add some to start studying!',
    progress: 'Progress',
    learned: 'learned',
  } : {
    title: 'Tarjetas de Estudio (Flashcards)',
    subtitle: `Repasa conceptos clave para ${currentUser.destination}`,
    addBtn: 'Nueva Tarjeta',
    flipBtn: 'Voltear Tarjeta',
    knowIt: 'Me lo sé',
    dontKnowIt: 'Repasar',
    frontLabel: 'Concepto / Pregunta (Frente)',
    backLabel: 'Definición / Respuesta (Dorso)',
    save: 'Guardar',
    cancel: 'Cancelar',
    empty: 'No tienes tarjetas. ¡Añade algunas para empezar!',
    progress: 'Progreso',
    learned: 'aprendidas',
  };

  useEffect(() => {
    const saved = localStorage.getItem(`tm_flashcards_${currentUser.id}`);
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch (e) {
        setCards(DEFAULT_CARDS);
      }
    } else {
      setCards(DEFAULT_CARDS);
    }
  }, [currentUser.id]);

  const saveCards = (newCards: Flashcard[]) => {
    setCards(newCards);
    localStorage.setItem(`tm_flashcards_${currentUser.id}`, JSON.stringify(newCards));
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newFront.trim(),
      back: newBack.trim(),
      learned: false,
    };
    
    saveCards([...cards, newCard]);
    setNewFront('');
    setNewBack('');
    setIsAdding(false);
    showToast('Tarjeta añadida correctamente', 'success');
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter(c => c.id !== id);
    saveCards(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
    setIsFlipped(false);
  };

  const markLearned = (learned: boolean) => {
    if (cards.length === 0) return;
    const updated = [...cards];
    updated[currentIndex].learned = learned;
    saveCards(updated);
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(1, cards.length));
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + cards.length) % Math.max(1, cards.length));
    }, 150);
  };

  const learnedCount = cards.filter(c => c.learned).length;
  const progressPercent = cards.length > 0 ? (learnedCount / cards.length) * 100 : 0;

  return (
    <div className="relative h-full px-4 py-6 animate-fade-in-up lg:px-8 max-w-5xl mx-auto mb-20 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>
            <BrainCircuit className={isDark ? 'text-travel-accent' : 'text-travel-primary'} />
            {t.title}
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.subtitle}</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 shrink-0">
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? t.cancel : t.addBtn}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCard} className={`mb-8 p-6 rounded-2xl border shadow-lg transition-all animate-fade-in-up ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-travel-primary/20'}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-travel-dark'}`}>{t.frontLabel}</label>
              <textarea 
                className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-travel-accent focus:outline-none resize-none h-24 ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                placeholder="Ej: ¿Fórmula del teorema de Pitágoras?"
                value={newFront}
                onChange={e => setNewFront(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-travel-dark'}`}>{t.backLabel}</label>
              <textarea 
                className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-travel-accent focus:outline-none resize-none h-24 ${isDark ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                placeholder="Ej: a² + b² = c²"
                value={newBack}
                onChange={e => setNewBack(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit">{t.save}</Button>
          </div>
        </form>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm mb-2 font-semibold">
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t.progress}</span>
          <span className={isDark ? 'text-travel-accent' : 'text-travel-primary'}>{learnedCount} / {cards.length} {t.learned}</span>
        </div>
        <div className={`h-3 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-travel-accent to-travel-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {cards.length === 0 ? (
        <div className={`text-center p-12 rounded-3xl border border-dashed ${isDark ? 'border-slate-700 text-gray-400 bg-slate-900/50' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>
          <BrainCircuit size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t.empty}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Main Flashcard */}
          <div 
            className="relative w-full max-w-xl aspect-[3/2] sm:aspect-[2/1] cursor-pointer group perspective-1000"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`w-full h-full absolute transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
              
              {/* Front */}
              <div className={`absolute w-full h-full backface-hidden rounded-3xl border-2 p-8 shadow-xl flex flex-col items-center justify-center text-center transition-colors
                ${isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-travel-primary/10 hover:border-travel-primary/30'}`}>
                <span className={`absolute top-4 left-6 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-travel-secondary' : 'text-travel-primary'}`}>Pregunta</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCard(cards[currentIndex].id); }}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDark ? 'text-gray-500 hover:bg-slate-700 hover:text-red-400' : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'}`}
                >
                  <Trash2 size={16} />
                </button>
                <h3 className={`text-2xl sm:text-3xl font-bold leading-tight ${isDark ? 'text-white' : 'text-travel-dark'}`}>
                  {cards[currentIndex].front}
                </h3>
                <div className={`absolute bottom-6 flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <RotateCw size={14} className="animate-pulse-glow" />
                  Haz clic para voltear
                </div>
              </div>

              {/* Back */}
              <div className={`absolute w-full h-full backface-hidden rounded-3xl border-2 p-8 shadow-xl flex flex-col items-center justify-center text-center rotate-x-180
                ${isDark ? 'bg-slate-900 border-travel-accent' : 'bg-travel-secondary/30 border-travel-primary'}`}>
                <span className={`absolute top-4 left-6 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-travel-accent' : 'text-travel-primary'}`}>Respuesta</span>
                <p className={`text-xl sm:text-2xl font-medium leading-relaxed ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                  {cards[currentIndex].back}
                </p>
              </div>

            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-8">
            <button 
              onClick={prevCard}
              className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all hover:scale-105 active:scale-95
                ${isDark ? 'border-slate-700 text-gray-300 hover:bg-slate-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => markLearned(false)}
                className={`flex items-center gap-2 border-red-500/50 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400`}
              >
                <X size={18} /> <span className="hidden sm:inline">{t.dontKnowIt}</span>
              </Button>
              <Button 
                onClick={() => markLearned(true)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 border-none"
              >
                <Check size={18} /> <span className="hidden sm:inline">{t.knowIt}</span>
              </Button>
            </div>

            <button 
              onClick={nextCard}
              className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all hover:scale-105 active:scale-95
                ${isDark ? 'border-slate-700 text-gray-300 hover:bg-slate-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className={`mt-4 text-sm font-semibold tracking-widest uppercase ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {currentIndex + 1} / {cards.length}
          </div>
        </div>
      )}

      {/* Adding required 3D CSS classes globally directly in this component to not clutter index.css too much */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-x-180 { transform: rotateX(180deg); }
      `}</style>
    </div>
  );
};
