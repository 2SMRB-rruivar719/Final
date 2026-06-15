import React, { useState, useEffect } from 'react';
import { Home, MessageCircle, BookOpen, Settings, BrainCircuit, ChevronLeft, ChevronRight, Timer, StickyNote, Award } from 'lucide-react';
import { LanguageCode, ThemeMode, UserProfile } from '../types';
import { Logo } from './Logo';
import { SafeImage } from './SafeImage';
import { getProfileAvatarFrame } from '../utils/avatarBorder';

interface NavigationProps {
  currentView: string;
  onChangeView: (view: string) => void;
  currentUser?: UserProfile | null;
  language: LanguageCode;
  theme: ThemeMode;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onTogglePomodoro: () => void;
  onToggleNotes: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView, currentUser, language, theme, collapsed, onToggleCollapse, onTogglePomodoro, onToggleNotes }) => {
  const isDark = theme === 'dark';
  
  // Gamification State
  const [xp, setXp] = useState(0);
  
  useEffect(() => {
    if (currentUser) {
      const savedXp = parseInt(localStorage.getItem(`tm_xp_${currentUser.id}`) || '0', 10);
      setXp(savedXp);
      
      const handleXpGain = (e: any) => {
        const amount = e.detail?.amount || 50;
        setXp(prev => {
          const newXp = prev + amount;
          localStorage.setItem(`tm_xp_${currentUser.id}`, newXp.toString());
          return newXp;
        });
      };
      
      window.addEventListener('tm_xp_gain', handleXpGain);
      return () => window.removeEventListener('tm_xp_gain', handleXpGain);
    }
  }, [currentUser]);

  const level = Math.floor(xp / 100) + 1;
  const xpInCurrentLevel = xp % 100;

  const t = language === 'en'
    ? {
        profile: 'Profile',
        explore: 'Explore',
        trip: 'Study Plan',
        chat: 'Chat',
        flashcards: 'Flashcards',
        settings: 'Settings',
        pomodoro: 'Focus Timer',
        notes: 'Study Notes',
        level: 'Level',
        subtitle: 'Find your ideal study buddy',
        desktopTip: 'Desktop mode optimized for quick swipes.',
      }
    : {
        profile: 'Perfil',
        explore: 'Explorar',
        trip: 'Plan IA',
        chat: 'Chat',
        flashcards: 'Flashcards',
        settings: 'Configuración',
        pomodoro: 'Focus Timer',
        notes: 'Notas Rápidas',
        level: 'Nivel',
        subtitle: 'Encuentra tu compañero de estudio ideal',
        desktopTip: 'Modo desktop optimizado para swipes rápidos.',
      };
  /** Explorar primero; Perfil va en el bloque inferior (amarillo), no en esta lista */
  const mainNavItems = [
    { id: 'match', icon: Home, label: t.explore },
    { id: 'itinerary', icon: BookOpen, label: t.trip },
    { id: 'chat', icon: MessageCircle, label: t.chat },
    { id: 'flashcards', icon: BrainCircuit, label: t.flashcards },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  const navAvatarFrame = currentUser
    ? getProfileAvatarFrame(currentUser.avatarBorderColor, currentUser.avatarRingStyle)
    : { ringClass: '', ringStyle: {} };

  const profileCardClass = `mt-auto w-full rounded-2xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
    currentView === 'profile'
      ? isDark
        ? 'ring-2 ring-travel-accent ring-offset-2 ring-offset-slate-900 bg-slate-800 border-slate-600'
        : 'ring-2 ring-travel-primary ring-offset-2 ring-offset-white bg-travel-secondary/60 border-travel-primary/40'
      : isDark
        ? 'bg-slate-800 border-slate-700 hover:bg-slate-700/80'
        : 'bg-travel-secondary/50 border-travel-secondary/70 hover:bg-travel-secondary/70'
  } ${isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'}`;

  return (
    <>
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen backdrop-blur-xl z-50 flex-col py-6 shadow-xl transition-all duration-200 overflow-y-auto ${
        collapsed ? 'w-24 px-3' : 'w-72 px-5'
      } ${
        isDark ? 'border-r border-slate-700/80 bg-slate-900/90' : 'border-r border-white/60 bg-white/80'
      }`}>
        <div className={`mb-8 ${collapsed ? 'px-0' : 'px-2'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {collapsed ? <Logo className="w-9 h-9" variant="icon" /> : <Logo className="w-auto" variant="text" />}
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                isDark
                  ? 'border-slate-600 text-gray-200 hover:bg-slate-800 focus-visible:ring-offset-slate-900'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-100 focus-visible:ring-offset-white'
              }`}
              title={collapsed ? 'Desplegar menu' : 'Ocultar menu'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          {!collapsed && <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.subtitle}</p>}
        </div>

        <nav className="space-y-2 flex-1 min-h-0">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className={`group relative w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-2xl text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                  isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'
                } ${
                  isActive
                    ? 'bg-travel-primary text-white shadow-lg shadow-travel-primary/25 scale-[1.01]'
                    : (isDark ? 'text-gray-300 hover:bg-slate-800/90' : 'text-gray-600 hover:bg-white/90')
                }`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <span
                    className="absolute left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-white/90 shadow-sm"
                    aria-hidden
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={collapsed ? '' : 'ml-1'} />
                {!collapsed && <span className="font-semibold text-sm">{item.label}</span>}
              </button>
            );
          })}
          
          {/* Pomodoro Action Button */}
          <div className="pt-2 mt-2 border-t border-travel-primary/10 dark:border-white/10 space-y-1">
            <button
              type="button"
              onClick={onTogglePomodoro}
              className={`group relative w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-2xl text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                isDark ? 'focus-visible:ring-offset-slate-900 text-travel-accent hover:bg-slate-800/90' : 'focus-visible:ring-offset-white text-travel-primary hover:bg-white/90'
              }`}
              title={collapsed ? t.pomodoro : undefined}
            >
              <Timer size={20} strokeWidth={2.5} className={collapsed ? '' : 'ml-1'} />
              {!collapsed && <span className="font-bold text-sm">{t.pomodoro}</span>}
            </button>
            <button
              type="button"
              onClick={onToggleNotes}
              className={`group relative w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-2xl text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                isDark ? 'focus-visible:ring-offset-slate-900 text-amber-400 hover:bg-slate-800/90' : 'focus-visible:ring-offset-white text-amber-500 hover:bg-amber-50'
              }`}
              title={collapsed ? t.notes : undefined}
            >
              <StickyNote size={20} strokeWidth={2.5} className={collapsed ? '' : 'ml-1'} />
              {!collapsed && <span className="font-bold text-sm">{t.notes}</span>}
            </button>
          </div>
        </nav>

        {currentUser && !collapsed && (
          <div className="mt-auto pt-4 flex flex-col gap-3">
            {/* XP Gamification Bar */}
            <div className={`px-4 py-3 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200/60'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Award size={14} className={isDark ? 'text-travel-accent' : 'text-travel-primary'} />
                  <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-travel-dark'}`}>
                    {t.level} {level}
                  </span>
                </div>
                <span className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {xpInCurrentLevel} / 100 XP
                </span>
              </div>
              <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div 
                  className="h-full bg-gradient-to-r from-travel-accent to-travel-primary transition-all duration-500 ease-out"
                  style={{ width: `${xpInCurrentLevel}%` }}
                />
              </div>
            </div>

            <button type="button" onClick={() => onChangeView('profile')} className={`${profileCardClass} p-4`}>
            <div className="flex items-center gap-3 mb-2">
              <SafeImage
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                fallbackSeed={currentUser.id + currentUser.name}
                variant="avatar"
                className={`w-11 h-11 rounded-full object-cover shrink-0 ${navAvatarFrame.ringClass}`}
                style={navAvatarFrame.ringStyle}
              />
              <div className="min-w-0 text-left">
                <p className={`text-[10px] font-bold uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.profile}</p>
                <p className={`font-semibold text-sm truncate ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{currentUser.name}</p>
                <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentUser.destination}</p>
              </div>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.desktopTip}</p>
          </button>
        )}

        {currentUser && collapsed && (
          <button
            type="button"
            onClick={() => onChangeView('profile')}
            title={t.profile}
            className={`${profileCardClass} p-2 flex justify-center`}
          >
            <SafeImage
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              fallbackSeed={currentUser.id + currentUser.name}
              variant="avatar"
              className={`w-11 h-11 rounded-full object-cover ${navAvatarFrame.ringClass} ${currentView === 'profile' ? 'ring-2 ring-travel-accent ring-offset-2 ring-offset-transparent' : ''}`}
              style={navAvatarFrame.ringStyle}
            />
          </button>
        )}
      </aside>

      <nav className={`lg:hidden fixed bottom-0 left-0 w-full px-2 pt-2 pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 ${
        isDark ? 'bg-slate-900 border-t border-slate-700' : 'bg-white border-t border-gray-200'
      }`}>
        <div className="flex items-end justify-center gap-1 max-w-lg mx-auto">
          {currentUser && (
            <button
              type="button"
              onClick={() => onChangeView('profile')}
              className={`flex min-w-[3.5rem] max-w-[4.25rem] flex-col items-center gap-0.5 rounded-xl px-1.5 py-1 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent ${
                currentView === 'profile'
                  ? isDark
                    ? 'bg-slate-800 ring-1 ring-travel-accent text-travel-accent'
                    : 'bg-travel-secondary/60 ring-1 ring-travel-primary/50 text-travel-primary'
                  : isDark
                    ? 'bg-slate-800/80 text-gray-300'
                    : 'bg-travel-secondary/40 text-travel-dark'
              }`}
            >
              <SafeImage
                src={currentUser.avatarUrl}
                alt=""
                fallbackSeed={currentUser.id + currentUser.name}
                variant="avatar"
                className={`w-9 h-9 rounded-full object-cover ${navAvatarFrame.ringClass}`}
                style={navAvatarFrame.ringStyle}
              />
              <span className="text-[9px] font-semibold leading-tight text-center">{t.profile}</span>
            </button>
          )}
          <div className="flex flex-1 justify-between items-end min-w-0 gap-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeView(item.id)}
                  className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                    isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'
                  } ${isActive ? 'text-travel-accent' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[9px] font-medium text-center leading-tight line-clamp-2">{item.label}</span>
                </button>
              );
            })}
            {/* Mobile Pomodoro Button */}
            <button
              type="button"
              onClick={onTogglePomodoro}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                isDark ? 'focus-visible:ring-offset-slate-900 text-travel-accent hover:text-travel-primary' : 'focus-visible:ring-offset-white text-travel-primary hover:text-travel-dark'
              }`}
            >
              <Timer size={22} strokeWidth={2.5} />
              <span className="text-[9px] font-bold text-center leading-tight line-clamp-2">{t.pomodoro}</span>
            </button>
            {/* Mobile Notes Button */}
            <button
              type="button"
              onClick={onToggleNotes}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                isDark ? 'focus-visible:ring-offset-slate-900 text-amber-400 hover:text-amber-500' : 'focus-visible:ring-offset-white text-amber-500 hover:text-amber-600'
              }`}
            >
              <StickyNote size={22} strokeWidth={2.5} />
              <span className="text-[9px] font-bold text-center leading-tight line-clamp-2">{t.notes}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};