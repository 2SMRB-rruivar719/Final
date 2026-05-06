import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './components/Onboarding';
import { MatchFeed } from './components/MatchFeed';
import { ItineraryBuilder } from './components/ItineraryBuilder';
import { ChatInterface } from './components/ChatInterface';
import { ProfileView } from './components/ProfileView';
import { Login } from './components/Login';
import { LanguageCode, ThemeMode, UserProfile } from './types';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { ToastProvider, useToast } from './components/ToastProvider';
import { updateUserProfile } from './services/api';

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

  // Load user from local storage (mock persistence)
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
          <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center">
            <div className="min-h-screen bg-travel-primary/90 backdrop-blur-sm flex flex-col p-4 overflow-y-auto">
              <Login
                onLoginSuccess={handleLoginSuccess}
                onBackToLanding={() => setAuthView('landing')}
                language={language}
              />
            </div>
          </div>
        );
      }

      if (authView === 'register') {
        return (
          <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center">
            <div className="min-h-screen bg-travel-primary/90 backdrop-blur-sm flex flex-col p-4 overflow-y-auto">
              <div className="flex flex-col items-center justify-center gap-6 mt-10 mb-4 animate-fade-in-up">
                <div className="bg-white/90 p-6 rounded-[2.5rem] backdrop-blur-md border border-white/50 shadow-2xl">
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
        <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center">
          <div className="min-h-screen bg-travel-primary/90 backdrop-blur-sm flex flex-col p-4 overflow-y-auto">
             <div className="flex flex-col items-center justify-center gap-6 mt-16 mb-8 animate-fade-in-up">
                {/* Logo Icon in Glass Bubble */}
                <div className="bg-white/90 p-8 rounded-[2.5rem] backdrop-blur-md border border-white/50 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Logo className="w-32 h-32" variant="icon" />
                </div>
                
                {/* Text Logo with Cream Background (#f4e8c1) - Straight (removed rotation) */}
                <div className="bg-[#f4e8c1] p-5 px-8 rounded-2xl shadow-xl border-4 border-white">
                  <Logo className="w-auto" variant="text" />
                </div>
             </div>
             
             <p className="text-white/95 text-center mb-8 max-w-xs mx-auto text-lg font-medium drop-shadow-md tracking-wide">
               Encuentra compañeros de viaje, planifica con IA y explora el mundo.
             </p>
             <div className="w-full max-w-xs mx-auto space-y-3">
               <Button fullWidth onClick={() => setAuthView('login')}>
                 Iniciar sesión
               </Button>
               <Button
                 fullWidth
                 variant="outline"
                 onClick={() => setAuthView('register')}
                 className="border-white/80 text-white bg-white/10 backdrop-blur-sm shadow-md hover:bg-white hover:text-travel-primary"
               >
                 Crear cuenta
               </Button>
             </div>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'match':
        return <MatchFeed currentUser={currentUser} onStartChat={() => setCurrentView('chat')} language={language} />;
      case 'itinerary':
        return <ItineraryBuilder currentUser={currentUser} language={language} />;
      case 'chat':
        return <ChatInterface currentUser={currentUser} language={language} />;
      case 'profile':
        return (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onLogout={handleLogout}
            onAccountDeleted={handleAccountDeleted}
            language={language}
            onChangeLanguage={handleChangeLanguage}
            theme={theme}
            onChangeTheme={handleChangeTheme}
          />
        );
      default:
        return <MatchFeed currentUser={currentUser} onStartChat={() => setCurrentView('chat')} language={language} />;
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
      {isAuthenticated ? (
        <div className="min-h-screen lg:pl-72">
          <div className="mx-auto w-full lg:max-w-[1360px]">{renderContent()}</div>
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