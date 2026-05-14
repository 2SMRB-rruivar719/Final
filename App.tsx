import React, { useState } from 'react';
import { Sparkles, Users, MapPin } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './components/Onboarding';
import { MatchFeed } from './components/MatchFeed';
import { ItineraryBuilder } from './components/ItineraryBuilder';
import { ChatInterface } from './components/ChatInterface';
import { ProfileView } from './components/ProfileView';
import { LikesView } from './components/LikesView';
import { Login } from './components/Login';
import { LanguageCode, ThemeMode, UserProfile } from './types';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { ToastProvider, useToast } from './components/ToastProvider';
import { updateUserProfile } from './services/api';

interface SavedAccountEntry {
  id: string;
  profile: UserProfile;
  savedAt: string;
}

const AUTH_BG_CLASS =
  "min-h-screen bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80')]";
const AUTH_OVERLAY_CLASS =
  "min-h-screen bg-gradient-to-b from-slate-900/90 via-[#2c3e50]/88 to-travel-primary/78 backdrop-blur-md flex flex-col p-4 overflow-y-auto relative";

const readSavedAccounts = (): SavedAccountEntry[] => {
  try {
    const raw = localStorage.getItem('tm_saved_accounts');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedAccountEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeUser = (u: UserProfile): UserProfile => ({
  ...u,
  interests: Array.isArray(u.interests) ? u.interests : [],
  travelStyle: Array.isArray(u.travelStyle) ? u.travelStyle : [],
  language: u.language === 'en' ? 'en' : 'es',
  theme: u.theme === 'dark' ? 'dark' : 'light',
  tripStartDate: u.tripStartDate || '',
  tripEndDate: u.tripEndDate || '',
  deletionScheduledAt: u.deletionScheduledAt ?? null,
});

const AppInner: React.FC = () => {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState('match');
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');
  const [language, setLanguage] = useState<LanguageCode>('es');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<UserProfile | null>(null);
  const t = language === 'en'
    ? {
        tagline: 'Find travel buddies, plan with AI and explore the world.',
        login: 'Sign in',
        register: 'Create account',
        beta: 'Preview',
        featureAi: 'AI itineraries in seconds',
        featureMatch: 'Match with travelers like you',
        featurePlaces: 'Places tailored to your style',
      }
    : {
        tagline: 'Encuentra compañeros de viaje, planifica con IA y explora el mundo.',
        login: 'Iniciar sesión',
        register: 'Crear cuenta',
        beta: 'Vista previa',
        featureAi: 'Rutas con IA en segundos',
        featureMatch: 'Match con viajeros afines',
        featurePlaces: 'Lugares según tu estilo',
      };

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  }, [theme]);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('tm_user');
    if (savedUser) {
      const parsedUser = normalizeUser(JSON.parse(savedUser) as UserProfile);
      setCurrentUser(parsedUser);
      setLanguage(parsedUser.language || 'es');
      setTheme(parsedUser.theme || 'light');
    }
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    const normalized = normalizeUser(user);
    console.log('[FLOW] Login completado, usuario autenticado', normalized);
    setCurrentUser(normalized);
    setLanguage(normalized.language || 'es');
    setTheme(normalized.theme || 'light');
    setCurrentView('match');
    localStorage.setItem('tm_user', JSON.stringify(normalized));
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    const normalized = normalizeUser(profile);
    console.log('[FLOW] Registro completado, usuario creado', normalized);
    showToast('Cuenta creada correctamente. ¡Bienvenido a TravelMatch! 🌍', 'success');
    setCurrentUser(normalized);
    setLanguage(normalized.language);
    setTheme(normalized.theme || 'light');
    setCurrentView('match');
    localStorage.setItem('tm_user', JSON.stringify(normalized));
  };

  const handleUpdateUser = (updatedProfile: UserProfile) => {
    const normalized = normalizeUser(updatedProfile);
    console.log('[FLOW] Perfil actualizado en cliente', normalized);
    setCurrentUser(normalized);
    localStorage.setItem('tm_user', JSON.stringify(normalized));
  };

  const handleAccountDeleted = () => {
    localStorage.removeItem('tm_user');
    setCurrentUser(null);
    setCurrentView('match');
    setAuthView('landing');
    showToast('Tu cuenta ha sido eliminada.', 'info');
  };

  const handleLogout = () => {
    localStorage.removeItem('tm_user');
    setCurrentUser(null);
    setCurrentView('match');
    setAuthView('landing');
  };

  const handleSwitchAccount = (nextAccount: UserProfile) => {
    const normalized = normalizeUser(nextAccount);
    setCurrentUser(normalized);
    setLanguage(normalized.language || 'es');
    setTheme(normalized.theme || 'light');
    setCurrentView('settings');
    localStorage.setItem('tm_user', JSON.stringify(normalized));
    const existing = readSavedAccounts();
    const merged = [
      { id: normalized.id, profile: normalized, savedAt: new Date().toISOString() },
      ...existing.filter((entry) => entry.id !== normalized.id),
    ].slice(0, 8);
    localStorage.setItem('tm_saved_accounts', JSON.stringify(merged));
  };

  const handleChangeLanguage = async (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    if (!currentUser) return;

    const optimistic = normalizeUser({ ...currentUser, language: nextLanguage });
    setCurrentUser(optimistic);
    localStorage.setItem('tm_user', JSON.stringify(optimistic));
    try {
      const saved = await updateUserProfile(currentUser.id, { language: nextLanguage });
      const normalized = normalizeUser(saved);
      setCurrentUser(normalized);
      localStorage.setItem('tm_user', JSON.stringify(normalized));
    } catch (e) {
      console.error('[API] Error al guardar idioma', e);
      showToast('No se pudo guardar el idioma en el servidor.', 'error');
    }
  };

  const handleChangeTheme = async (nextTheme: ThemeMode) => {
    setTheme(nextTheme);
    if (!currentUser) return;

    const optimistic = normalizeUser({ ...currentUser, theme: nextTheme });
    setCurrentUser(optimistic);
    localStorage.setItem('tm_user', JSON.stringify(optimistic));
    try {
      const saved = await updateUserProfile(currentUser.id, { theme: nextTheme });
      const normalized = normalizeUser(saved);
      setCurrentUser(normalized);
      localStorage.setItem('tm_user', JSON.stringify(normalized));
    } catch (e) {
      console.error('[API] Error al guardar tema', e);
      showToast('No se pudo guardar el tema en el servidor.', 'error');
    }
  };

  const renderContent = () => {
    if (!currentUser) {
      if (authView === 'login') {
        return (
          <div className={AUTH_BG_CLASS}>
            <div className={AUTH_OVERLAY_CLASS}>
              <div className="absolute top-4 right-4 flex rounded-full bg-black/25 p-0.5 backdrop-blur-md border border-white/15">
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    language === 'es' ? 'bg-white text-travel-dark shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    language === 'en' ? 'bg-white text-travel-dark shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
              <div className="flex flex-1 flex-col pt-12 lg:justify-center lg:pt-8 lg:pb-12 lg:px-6 xl:px-10">
                <Login
                  onLoginSuccess={handleLoginSuccess}
                  onBackToLanding={() => setAuthView('landing')}
                  language={language}
                />
              </div>
            </div>
          </div>
        );
      }

      if (authView === 'register') {
        return (
          <div className={AUTH_BG_CLASS}>
            <div className={AUTH_OVERLAY_CLASS}>
              <div className="absolute top-4 right-4 flex rounded-full bg-black/25 p-0.5 backdrop-blur-md border border-white/15">
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    language === 'es' ? 'bg-white text-travel-dark shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    language === 'en' ? 'bg-white text-travel-dark shadow' : 'text-white/80 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
              <div className="flex flex-col items-center justify-center gap-6 mt-10 mb-4 animate-fade-in-up">
                <div className="bg-white/90 p-6 rounded-[2.5rem] backdrop-blur-md border border-white/50 shadow-2xl ring-1 ring-white/40">
                  <Logo className="w-24 h-24" variant="icon" />
                </div>
              </div>
              <Onboarding
                onComplete={handleOnboardingComplete}
                onCancel={() => setAuthView('landing')}
                language={language}
              />
            </div>
          </div>
        );
      }

      // Landing inicial con botones de acceso
      return (
        <div className={AUTH_BG_CLASS}>
          <div className={AUTH_OVERLAY_CLASS}>
            <header className="flex items-center justify-between gap-3 mb-2 max-w-lg mx-auto w-full shrink-0">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
                {t.beta}
              </span>
              <div className="flex rounded-full bg-black/25 p-0.5 backdrop-blur-md border border-white/15">
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    language === 'es' ? 'bg-white text-travel-dark shadow-md' : 'text-white/80 hover:text-white'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    language === 'en' ? 'bg-white text-travel-dark shadow-md' : 'text-white/80 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </header>

            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6 animate-fade-in-up">
              <div className="bg-white/90 p-8 rounded-[2.5rem] backdrop-blur-md border border-white/50 shadow-2xl ring-1 ring-white/30 transition-transform duration-300 hover:scale-[1.02] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]">
                <Logo className="w-32 h-32" variant="icon" />
              </div>

              <div className="bg-[#f4e8c1] p-5 px-8 rounded-2xl shadow-xl border-4 border-white/90 ring-1 ring-travel-accent/20">
                <Logo className="w-auto" variant="text" />
              </div>
            </div>

            <p className="text-center text-white/95 max-w-md mx-auto text-lg sm:text-xl font-semibold drop-shadow-md tracking-tight px-4 leading-snug">
              {t.tagline}
            </p>

            <div className="grid max-w-md mx-auto w-full grid-cols-1 gap-2 px-2 mt-4 sm:grid-cols-3 sm:gap-3">
              {[
                { Icon: Sparkles, label: t.featureAi },
                { Icon: Users, label: t.featureMatch },
                { Icon: MapPin, label: t.featurePlaces },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 text-left text-xs font-medium text-white/95 backdrop-blur-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Icon size={16} strokeWidth={2.2} />
                  </span>
                  <span className="leading-tight">{label}</span>
                </div>
              ))}
            </div>

            <div className="w-full max-w-xs mx-auto space-y-3 mt-8 mb-6">
              <Button fullWidth onClick={() => setAuthView('login')} className="shadow-lg shadow-black/20">
                {t.login}
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={() => setAuthView('register')}
                className="border-white/80 text-white bg-white/10 backdrop-blur-sm shadow-md hover:bg-white hover:text-travel-primary"
              >
                {t.register}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'match':
        return (
          <MatchFeed
            currentUser={currentUser}
            onStartChat={(user) => {
              setChatTargetUser(user);
              setCurrentView('chat');
            }}
            language={language}
            theme={theme}
          />
        );
      case 'itinerary':
        return <ItineraryBuilder currentUser={currentUser} language={language} theme={theme} />;
      case 'chat':
        return <ChatInterface currentUser={currentUser} language={language} theme={theme} initialTargetUser={chatTargetUser} />;
      case 'likes':
        return (
          <LikesView
            language={language}
            theme={theme}
            onStartChat={(user) => {
              setChatTargetUser(user);
              setCurrentView('chat');
            }}
          />
        );
      case 'profile':
        return (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onSwitchAccount={handleSwitchAccount}
            onAccountDeleted={handleAccountDeleted}
            section="profile"
            language={language}
            onChangeLanguage={handleChangeLanguage}
            theme={theme}
            onChangeTheme={handleChangeTheme}
          />
        );
      case 'settings':
        return (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onSwitchAccount={handleSwitchAccount}
            onAccountDeleted={handleAccountDeleted}
            section="settings"
            language={language}
            onChangeLanguage={handleChangeLanguage}
            theme={theme}
            onChangeTheme={handleChangeTheme}
          />
        );
      default:
        return (
          <MatchFeed
            currentUser={currentUser}
            onStartChat={(user) => {
              setChatTargetUser(user);
              setCurrentView('chat');
            }}
            language={language}
            theme={theme}
          />
        );
    }
  };

  const isDark = theme === 'dark';
  const isAuthenticated = !!currentUser;

  return (
    <div
      className={`min-h-screen font-sans ${
        isDark
          ? 'bg-slate-900 text-gray-100'
          : isAuthenticated
            ? 'bg-gradient-to-br from-[#f9f9f9] via-white to-travel-secondary/30 text-gray-800'
            : 'bg-gray-50 text-gray-800'
      }`}
    >
      {isAuthenticated && (
        <a
          href="#main-content"
          className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:m-0 focus:inline-flex focus:h-auto focus:w-auto focus:items-center focus:rounded-xl focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-travel-dark focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-travel-accent dark:focus:bg-slate-800 dark:focus:text-gray-100 dark:focus:ring-offset-0"
        >
          {language === 'en' ? 'Skip to main content' : 'Saltar al contenido principal'}
        </a>
      )}
      {isAuthenticated ? (
        <div className={`min-h-screen transition-[padding] duration-300 ease-out ${isNavCollapsed ? 'lg:pl-24' : 'lg:pl-72'}`}>
          <main
            id="main-content"
            key={currentView}
            className="mx-auto w-full max-w-[1360px] tm-view-surface outline-none"
            tabIndex={-1}
          >
            {renderContent()}
          </main>
        </div>
      ) : (
        renderContent()
      )}
      {currentUser && (
        <Navigation
          currentView={currentView}
          onChangeView={setCurrentView}
          currentUser={currentUser}
          language={language}
          theme={theme}
          collapsed={isNavCollapsed}
          onToggleCollapse={() => setIsNavCollapsed((prev) => !prev)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AppInner />
  </ToastProvider>
);

export default App;