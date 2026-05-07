import React, { useState, useEffect } from 'react';
import { LanguageCode, ThemeMode, UserProfile } from '../types';
import { generatePotentialMatches } from '../services/aiService';
import { Button } from './Button';
import { X, Heart, MessageCircle, MapPin, Calendar, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';

interface MatchFeedProps {
  currentUser: UserProfile;
  onStartChat: (user: UserProfile) => void;
  language: LanguageCode;
  theme: ThemeMode;
}

export const MatchFeed: React.FC<MatchFeedProps> = ({ currentUser, onStartChat, language, theme }) => {
  const isDark = theme === 'dark';
  const t = language === 'en'
    ? {
        loading: 'AI is looking for your ideal travel buddies...',
        seenAll: 'You have seen all profiles!',
        comeBack: `Come back later to see new travelers in ${currentUser.destination}.`,
        reviewAgain: 'Review again',
        yourTrip: 'Your trip',
        lookingFor: 'Looking for profiles similar to:',
        currentProfile: 'Current profile',
        matchInsight: 'Match insight',
        highlighted: 'Top compatibility',
        insightText: 'Destination, style and budget match. Great to build a joint plan quickly.',
        firstMessage: 'Send first message',
        tip: 'Tip: use the center button to break the ice instantly.',
      }
    : {
        loading: 'La IA está buscando a tus compañeros ideales...',
        seenAll: '¡Has visto todos los perfiles!',
        comeBack: `Vuelve más tarde para ver nuevos viajeros en ${currentUser.destination}.`,
        reviewAgain: 'Revisar de nuevo',
        yourTrip: 'Tu viaje',
        lookingFor: 'Buscando perfiles afines a:',
        currentProfile: 'Perfil actual',
        matchInsight: 'Match insight',
        highlighted: 'Compatibilidad destacada',
        insightText: 'Coinciden en destino, estilo y presupuesto. Ideal para armar plan conjunto rápidamente.',
        firstMessage: 'Enviar primer mensaje',
        tip: 'Tip: usa el botón central para romper el hielo al instante.',
      };
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const matches = await generatePotentialMatches(currentUser);
      setCandidates(matches);
      setLoading(false);
    };
    fetchMatches();
  }, [currentUser]);

  const handleAction = (action: 'pass' | 'like') => {
    setSwipeDirection(action === 'pass' ? 'left' : 'right');
    if (action === 'like') {
      // In a real app, this would create a match record
      // Here we just simulate interest
    }
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 180);
  };

  const handlePrev = () => {
    if (currentIndex <= 0) return;
    setSwipeDirection('left');
    setTimeout(() => {
      setCurrentIndex(prev => Math.max(0, prev - 1));
      setSwipeDirection(null);
    }, 150);
  };

  const handleNext = () => {
    if (currentIndex >= candidates.length - 1) return;
    setSwipeDirection('right');
    setTimeout(() => {
      setCurrentIndex(prev => Math.min(candidates.length - 1, prev + 1));
      setSwipeDirection(null);
    }, 150);
  };

  const currentCandidate = candidates[currentIndex];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 lg:h-[70vh]">
        <div className="w-16 h-16 border-4 border-travel-secondary border-t-travel-primary rounded-full animate-spin mb-4"></div>
        <p className="text-travel-dark font-medium">{t.loading}</p>
      </div>
    );
  }

  if (!currentCandidate) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 lg:h-[70vh]">
        <div className="bg-travel-secondary/30 p-6 rounded-full mb-4">
          <Heart className="h-12 w-12 text-travel-primary" />
        </div>
        <h3 className="text-xl font-bold text-travel-dark mb-2">{t.seenAll}</h3>
        <p className="text-gray-500 mb-6">{t.comeBack}</p>
        <Button onClick={() => setCurrentIndex(0)} variant="outline">{t.reviewAgain}</Button>
      </div>
    );
  }

  return (
    <div className="relative h-full px-4 py-4 mb-20 lg:mb-8 lg:px-8">
      <button
        type="button"
        onClick={() => setShowRightPanel((prev) => !prev)}
        className={`hidden lg:flex absolute top-4 right-8 z-20 items-center justify-center w-10 h-10 rounded-full border shadow-sm transition ${
          isDark
            ? 'bg-slate-800 border-slate-600 text-gray-100 hover:bg-slate-700'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
        title={showRightPanel ? 'Ocultar panel derecho' : 'Mostrar panel derecho'}
      >
        {showRightPanel ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
      <div className={`mx-auto w-full max-w-7xl grid gap-6 lg:items-start ${
        showRightPanel
          ? 'lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)_minmax(0,1fr)]'
          : 'lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)]'
      }`}>
        <aside className={`hidden lg:block max-w-[260px] justify-self-end backdrop-blur-md rounded-3xl p-5 shadow-sm ${
          isDark ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/80 border border-white/60'
        }`}>
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">{t.yourTrip}</p>
          <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{currentUser.destination}</h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.dates}</p>
          <div className="space-y-2 mb-4">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.lookingFor}</p>
            <div className="flex flex-wrap gap-2">
              {currentUser.travelStyle.slice(0, 4).map((style) => (
                  <span key={style} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-slate-700 text-gray-100' : 'bg-travel-secondary/50 text-travel-dark'}`}>
                  {style}
                </span>
              ))}
            </div>
          </div>
          <div className={`rounded-2xl p-3 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-100'}`}>
            <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.currentProfile}</p>
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{currentIndex + 1} de {candidates.length}</p>
          </div>
        </aside>

        <div className="flex flex-col">
          <div className={`relative rounded-[2rem] shadow-xl overflow-hidden border flex flex-col h-[74vh] min-h-[560px] ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
          } ${swipeDirection === 'left' ? 'swipe-left' : swipeDirection === 'right' ? 'swipe-right' : ''}`}>
            <div className="relative h-[58%] bg-gray-200">
              <img
                src={currentCandidate.avatarUrl}
                alt={currentCandidate.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/75 to-transparent p-6 pt-20">
                <h2 className="text-3xl font-bold text-white mb-1">
                  {currentCandidate.name}, {currentCandidate.age}
                </h2>
                <div className="flex items-center text-white/90 text-sm gap-2">
                  <MapPin size={14} /> {currentCandidate.country}
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className={`flex flex-wrap gap-3 mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <Calendar size={14} className="text-travel-accent" /> {currentCandidate.dates}
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <Wallet size={14} className="text-travel-accent" /> {currentCandidate.budget}
                </span>
              </div>

              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{currentCandidate.bio}</p>

              <div className="flex flex-wrap gap-2">
                {currentCandidate.travelStyle.map((style) => (
                  <span key={style} className="px-3 py-1 bg-travel-secondary/40 text-travel-dark rounded-full text-xs font-semibold">
                    {style}
                  </span>
                ))}
                {currentCandidate.interests.map((interest) => (
                  <span key={interest} className={`px-3 py-1 rounded-full text-xs ${isDark ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6 items-center">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                currentIndex <= 0
                  ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-300'
                  : 'border-gray-200 bg-white text-gray-500 hover:text-travel-primary hover:border-travel-primary'
              }`}
              title="Anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => handleAction('pass')}
              className="w-14 h-14 rounded-full bg-white shadow-lg text-gray-400 flex items-center justify-center hover:bg-gray-50 hover:text-red-500 transition-colors border border-gray-100"
            >
              <X size={28} />
            </button>

            <button
              onClick={() => onStartChat(currentCandidate)}
              className="w-12 h-12 rounded-full bg-travel-accent shadow-lg text-white flex items-center justify-center hover:bg-opacity-90 transition-colors mt-2"
              title="Send Message directly"
            >
              <MessageCircle size={22} />
            </button>

            <button
              onClick={() => handleAction('like')}
              className="w-14 h-14 rounded-full bg-white shadow-lg text-travel-primary flex items-center justify-center hover:bg-travel-primary hover:text-white transition-colors border border-travel-primary"
            >
              <Heart size={28} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= candidates.length - 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                currentIndex >= candidates.length - 1
                  ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-300'
                  : 'border-gray-200 bg-white text-gray-500 hover:text-travel-primary hover:border-travel-primary'
              }`}
              title="Siguiente"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <aside className={`${showRightPanel ? 'hidden lg:block' : 'hidden'} max-w-[300px] justify-self-start backdrop-blur-md rounded-3xl p-5 shadow-sm ${
          isDark ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/80 border border-white/60'
        }`}>
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">{t.matchInsight}</p>
          <h4 className={`font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{t.highlighted}</h4>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.insightText}
          </p>
          <div className="space-y-2 mb-5">
            {currentCandidate.interests.slice(0, 4).map((interest) => (
              <div key={interest} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <span className="w-2 h-2 rounded-full bg-travel-accent" />
                {interest}
              </div>
            ))}
          </div>
          <Button fullWidth onClick={() => onStartChat(currentCandidate)}>
            {t.firstMessage}
          </Button>
          <p className={`text-[11px] mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.tip}</p>
        </aside>
      </div>
    </div>
  );
};