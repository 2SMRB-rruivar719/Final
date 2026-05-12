import React from 'react';
import { Home, MessageCircle, Map, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { LanguageCode, ThemeMode, UserProfile } from '../types';
import { Logo } from './Logo';
import { SafeImage } from './SafeImage';

interface NavigationProps {
  currentView: string;
  onChangeView: (view: string) => void;
  currentUser?: UserProfile | null;
  language: LanguageCode;
  theme: ThemeMode;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView, currentUser, language, theme, collapsed, onToggleCollapse }) => {
  const isDark = theme === 'dark';
  const t = language === 'en'
    ? { profile: 'Profile', explore: 'Explore', trip: 'Trip', chat: 'Chat', settings: 'Settings', subtitle: 'Find your next travel buddy', desktopTip: 'Desktop mode optimized for quick swipes.' }
    : { profile: 'Perfil', explore: 'Explorar', trip: 'Viaje', chat: 'Chat', settings: 'Configuración', subtitle: 'Encuentra tu próximo compañero de viaje', desktopTip: 'Modo desktop optimizado para swipes rápidos.' };
  const navItems = [
    { id: 'profile', icon: User, label: t.profile },
    { id: 'match', icon: Home, label: t.explore },
    { id: 'itinerary', icon: Map, label: t.trip },
    { id: 'chat', icon: MessageCircle, label: t.chat },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  return (
    <>
      <aside className={`hidden lg:flex fixed left-0 top-0 h-screen backdrop-blur-xl z-50 flex-col py-6 shadow-xl transition-all duration-200 ${
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

        <nav className="space-y-2">
          {navItems.map((item) => {
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
        </nav>

        {currentUser && !collapsed && (
          <div className={`mt-auto p-4 rounded-2xl border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-travel-secondary/50 border-travel-secondary/70'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <SafeImage
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                fallbackSeed={currentUser.id + currentUser.name}
                variant="avatar"
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
                type="button"
                onClick={() => onChangeView(item.id)}
                className={`flex min-w-[3.25rem] flex-col items-center gap-1 rounded-xl px-1 py-1 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2 ${
                  isDark ? 'focus-visible:ring-offset-slate-900' : 'focus-visible:ring-offset-white'
                } ${
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