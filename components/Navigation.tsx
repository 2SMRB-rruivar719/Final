import React from 'react';
import { Home, MessageCircle, Map, User } from 'lucide-react';
import { LanguageCode, ThemeMode, UserProfile } from '../types';
import { Logo } from './Logo';

interface NavigationProps {
  currentView: string;
  onChangeView: (view: string) => void;
  currentUser?: UserProfile | null;
  language: LanguageCode;
  theme: ThemeMode;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView, currentUser, language, theme }) => {
  const isDark = theme === 'dark';
  const t = language === 'en'
    ? { profile: 'Profile', explore: 'Explore', trip: 'Trip', chat: 'Chat', subtitle: 'Find your next travel buddy', desktopTip: 'Desktop mode optimized for quick swipes.' }
    : { profile: 'Perfil', explore: 'Explorar', trip: 'Viaje', chat: 'Chat', subtitle: 'Encuentra tu próximo compañero de viaje', desktopTip: 'Modo desktop optimizado para swipes rápidos.' };
  const navItems = [
    { id: 'profile', icon: User, label: t.profile },
    { id: 'match', icon: Home, label: t.explore },
    { id: 'itinerary', icon: Map, label: t.trip },
    { id: 'chat', icon: MessageCircle, label: t.chat },
  ];

  return (
    <>
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen w-72 backdrop-blur-xl z-50 flex-col px-5 py-6 shadow-xl ${
        isDark ? 'border-r border-slate-700/80 bg-slate-900/90' : 'border-r border-white/60 bg-white/80'
      }`}>
        <div className="mb-8 px-2">
          <Logo className="w-auto" variant="text" />
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.subtitle}</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-travel-primary text-white shadow-md'
                    : (isDark ? 'text-gray-300 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100')
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {currentUser && (
          <div className={`mt-auto p-4 rounded-2xl border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-travel-secondary/50 border-travel-secondary/70'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white"
              />
              <div className="min-w-0">
                <p className={`font-semibold text-sm truncate ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{currentUser.name}</p>
                <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentUser.destination}</p>
              </div>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.desktopTip}</p>
          </div>
        )}
      </aside>

      <nav className={`lg:hidden fixed bottom-0 left-0 w-full px-6 py-3 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 ${
        isDark ? 'bg-slate-900 border-t border-slate-700' : 'bg-white border-t border-gray-200'
      }`}>
        <div className="flex justify-between items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                  isActive ? 'text-travel-accent' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};