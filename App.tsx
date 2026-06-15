import React, { useState } from 'react';
import { Sparkles, Users, BookOpen, Moon, SunMedium } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { Onboarding } from './components/Onboarding';
import { MatchFeed } from './components/MatchFeed';
import { ItineraryBuilder } from './components/ItineraryBuilder';
import { ChatInterface } from './components/ChatInterface';
import { ProfileView } from './components/ProfileView';
import { FlashcardsView } from './components/FlashcardsView';
import { Login } from './components/Login';
import { LanguageCode, ThemeMode, UserProfile } from './types';
import { Logo } from './components/Logo';
import { Button } from './components/Button';
import { ToastProvider, useToast } from './components/ToastProvider';
import { PomodoroTimer } from './components/PomodoroTimer';
import { StickyNotes } from './components/StickyNotes';
import { updateUserProfile } from './services/api';
import { syncPersonalizationRoot } from './utils/personalization';

interface SavedAccountEntry {
  id: string;
  profile: UserProfile;
  savedAt: string;
}

const AUTH_BG_CLASS =
  "min-h-screen bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80')]";

/** Panel de autenticación: oscuro o claro según el tema de la app. */
const authOverlayClass = (isDark: boolean) =>
  isDark
    ? 'min-h-screen bg-gradient-to-b from-slate-900/90 via-[#2c3e50]/88 to-travel-primary/78 backdrop-blur-md flex flex-col p-4 overflow-y-auto relative lg:flex-row lg:items-stretch lg:justify-between lg:gap-0 lg:bg-gradient-to-r lg:from-slate-900/88 lg:via-[#2c3e50]/78 lg:to-slate-900/86 lg:p-0 lg:overflow-x-hidden lg:overflow-y-hidden'
    : 'min-h-screen bg-gradient-to-b from-white/92 via-amber-50/88 to-travel-secondary/45 backdrop-blur-md flex flex-col p-4 overflow-y-auto relative lg:flex-row lg:items-stretch lg:justify-between lg:gap-0 lg:bg-gradient-to-r lg:from-white/94 lg:via-amber-50/85 lg:to-sky-50/50 lg:p-0 lg:overflow-x-hidden lg:overflow-y-hidden';

type AuthHeroVariant = 'landing' | 'login' | 'register';

interface AuthHeroStrings {
  tagline: string;
  featureAi: string;
  featureMatch: string;
  featurePlaces: string;
  beta: string;
}

const AuthDesktopHero: React.FC<{
  variant: AuthHeroVariant;
  language: LanguageCode;
  t: AuthHeroStrings;
  isDark: boolean;
}> = ({ variant, language, t, isDark }) => {
  const features = [
    { Icon: Sparkles, label: t.featureAi },
    { Icon: Users, label: t.featureMatch },
    { Icon: BookOpen, label: t.featurePlaces },
  ] as const;

  const loginTitle = language === 'en' ? 'Welcome back' : 'Bienvenido de nuevo';
  const loginLead =
    language === 'en'
      ? 'Pick up your study schedules, chats and plans where you left them.'
      : 'Retoma tus planes de estudio, chats y cronogramas justo donde los dejaste.';

  const registerTitle = language === 'en' ? 'Create your account' : 'Crea tu cuenta';
  const registerLead =
    language === 'en'
      ? 'Tell us how you study and we will match you with people on your wavelength.'
      : 'Cuéntanos cómo estudias y te conectaremos con estudiantes afines.';

  const asideShell = isDark
    ? 'border-r border-white/10 bg-black/25 shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]'
    : 'border-r border-slate-200/70 bg-white/70 shadow-[inset_-1px_0_0_rgba(15,23,42,0.06)]';
  const logoTile = isDark
    ? 'border-white/25 bg-white/12 ring-1 ring-white/35'
    : 'border-slate-200/90 bg-white ring-1 ring-travel-primary/20';
  const betaBadge = isDark
    ? 'border-white/25 bg-white/10 text-white/95'
    : 'border-slate-300/80 bg-travel-secondary/50 text-travel-dark';
  const heroTitle = isDark ? 'text-white drop-shadow-md' : 'text-slate-900';
  const heroMuted = isDark ? 'text-white/85' : 'text-slate-600';
  const featureCard = isDark
    ? 'border-white/15 bg-white/10 text-white/95'
    : 'border-slate-200/90 bg-white/95 text-slate-800';
  const featureIcon = isDark ? 'bg-white/20 text-white' : 'bg-travel-secondary/50 text-travel-dark';

  return (
    <aside
      className={`relative hidden min-h-0 flex-1 flex-col justify-center gap-8 px-8 py-10 backdrop-blur-md lg:flex xl:max-w-[min(520px,42vw)] xl:px-14 xl:py-14 ${asideShell}`}
      aria-hidden="true"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className={`rounded-[2rem] border p-5 shadow-2xl ${logoTile}`}>
            <Logo className="h-20 w-20 xl:h-24 xl:w-24" variant="icon" />
          </div>
          {variant === 'landing' && (
            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${betaBadge}`}>
              {t.beta}
            </span>
          )}
        </div>

        {variant === 'login' && (
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-travel-secondary">{loginTitle}</p>
        )}
        {variant === 'register' && (
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-travel-secondary">{registerTitle}</p>
        )}

        <h1 className={`max-w-lg text-balance text-2xl font-bold leading-snug lg:text-3xl xl:text-[2.15rem] xl:leading-tight ${heroTitle}`}>
          {variant === 'landing' ? t.tagline : variant === 'login' ? loginLead : registerLead}
        </h1>

        {variant !== 'landing' && (
          <p className={`max-w-md text-sm leading-relaxed ${heroMuted}`}>{t.tagline}</p>
        )}

        <div
          className={`hidden rounded-2xl border p-4 shadow-lg xl:block xl:max-w-sm ${
            isDark ? 'border-white/15 bg-[#f4e8c1]/95 ring-1 ring-travel-accent/25' : 'border-slate-200/80 bg-[#f4e8c1]/95 ring-1 ring-travel-accent/20'
          }`}
        >
          <Logo className="w-auto" variant="text" />
        </div>
      </div>

      <ul className="mt-2 flex flex-col gap-3">
        {features.map(({ Icon, label }) => (
          <li
            key={label}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium backdrop-blur-sm ${featureCard}`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${featureIcon}`}>
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <span className="leading-snug">{label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const authLangToggleClass = (active: boolean, isDark: boolean) =>
  `rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
    active
      ? 'bg-travel-primary text-white shadow'
      : isDark
        ? 'text-white/80 hover:text-white'
        : 'text-slate-600 hover:text-travel-dark'
  }`;

const authLangToggleClassLanding = (active: boolean, isDark: boolean) =>
  `rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
    active
      ? 'bg-travel-primary text-white shadow-md'
      : isDark
        ? 'text-white/80 hover:text-white'
        : 'text-slate-600 hover:text-travel-dark'
  }`;

const authChromeBar = (isDark: boolean) =>
  isDark ? 'border-white/15 bg-black/25' : 'border-slate-300/60 bg-white/70';

const authThemeToggleBtn = (active: boolean, isDark: boolean) =>
  `flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
    active
      ? isDark
        ? 'bg-white text-travel-dark shadow'
        : 'bg-travel-primary text-white shadow'
      : isDark
        ? 'text-white/70 hover:bg-white/10 hover:text-white'
        : 'text-slate-500 hover:bg-slate-100 hover:text-travel-dark'
  }`;

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
  uiAccentColor: (u.uiAccentColor || '').trim(),
  fontScale: u.fontScale === 'large' ? 'large' : '',
  chatBubbleStyle: u.chatBubbleStyle === 'pill' || u.chatBubbleStyle === 'minimal' ? u.chatBubbleStyle : '',
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
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const t = language === 'en'
    ? {
        tagline: 'Find study buddies, plan with AI and ace your exams.',
        login: 'Sign in',
        register: 'Create account',
        beta: 'Preview',
        featureAi: 'AI study plans in seconds',
        featureMatch: 'Match with students like you',
        featurePlaces: 'Subjects tailored to your style',
      }
    : {
        tagline: 'Encuentra compañeros de estudio, planifica con IA y aprueba tus exámenes.',
        login: 'Iniciar sesión',
        register: 'Crear cuenta',
        beta: 'Vista previa',
        featureAi: 'Planes con IA en segundos',
        featureMatch: 'Match con estudiantes afines',
        featurePlaces: 'Materias según tu estilo',
      };

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    try {
      localStorage.setItem('tm_theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  React.useEffect(() => {
    syncPersonalizationRoot(currentUser);
  }, [currentUser]);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('tm_user');
    if (savedUser) {
      const parsedUser = normalizeUser(JSON.parse(savedUser) as UserProfile);
      setCurrentUser(parsedUser);
      setLanguage(parsedUser.language || 'es');
      setTheme(parsedUser.theme || 'light');
    } else {
      try {
        const storedTheme = localStorage.getItem('tm_theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setTheme(storedTheme);
        }
      } catch {
        /* ignore */
      }
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
    showToast('Cuenta creada correctamente. ¡Bienvenido a StudyMatch! 🎓', 'success');
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
      const authDark = theme === 'dark';

      if (authView === 'login') {
        return (
          <div className={AUTH_BG_CLASS}>
            <div className={authOverlayClass(authDark)}>
              <AuthDesktopHero variant="login" language={language} t={t} isDark={authDark} />
              <div
                className={`relative flex min-h-0 flex-1 flex-col lg:max-w-[min(520px,48vw)] lg:shrink-0 lg:overflow-y-auto lg:px-8 lg:py-10 lg:backdrop-blur-md xl:px-12 ${
                  authDark ? 'lg:bg-slate-950/45' : 'lg:bg-white/85'
                }`}
              >
                <div className="absolute right-4 top-4 z-10 flex items-center gap-2 lg:right-8 lg:top-8">
                  <div className={`flex rounded-full border p-0.5 backdrop-blur-md ${authChromeBar(authDark)}`}>
                    <button
                      type="button"
                      aria-pressed={theme === 'light'}
                      onClick={() => setTheme('light')}
                      className={authThemeToggleBtn(theme === 'light', authDark)}
                      title={language === 'en' ? 'Light mode' : 'Modo claro'}
                    >
                      <SunMedium size={17} strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      aria-pressed={theme === 'dark'}
                      onClick={() => setTheme('dark')}
                      className={authThemeToggleBtn(theme === 'dark', authDark)}
                      title={language === 'en' ? 'Dark mode' : 'Modo oscuro'}
                    >
                      <Moon size={17} strokeWidth={2.2} />
                    </button>
                  </div>
                  <div className={`flex rounded-full border p-0.5 backdrop-blur-md ${authChromeBar(authDark)}`}>
                    <button type="button" onClick={() => setLanguage('es')} className={authLangToggleClass(language === 'es', authDark)}>
                      ES
                    </button>
                    <button type="button" onClick={() => setLanguage('en')} className={authLangToggleClass(language === 'en', authDark)}>
                      EN
                    </button>
                  </div>
                </div>
                <div className="flex flex-1 flex-col pt-12 lg:justify-center lg:pt-16 lg:pb-12">
                  <Login
                    onLoginSuccess={handleLoginSuccess}
                    onBackToLanding={() => setAuthView('landing')}
                    language={language}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (authView === 'register') {
        return (
          <div className={AUTH_BG_CLASS}>
            <div className={authOverlayClass(authDark)}>
              <AuthDesktopHero variant="register" language={language} t={t} isDark={authDark} />
              <div
                className={`relative flex min-h-0 flex-1 flex-col lg:max-w-[min(560px,50vw)] lg:shrink-0 lg:overflow-y-auto lg:px-6 lg:py-8 lg:backdrop-blur-md xl:max-w-[min(600px,46vw)] xl:px-10 ${
                  authDark ? 'lg:bg-slate-950/45' : 'lg:bg-white/85'
                }`}
              >
                <div className="absolute right-4 top-4 z-10 flex items-center gap-2 lg:right-8 lg:top-8">
                  <div className={`flex rounded-full border p-0.5 backdrop-blur-md ${authChromeBar(authDark)}`}>
                    <button
                      type="button"
                      aria-pressed={theme === 'light'}
                      onClick={() => setTheme('light')}
                      className={authThemeToggleBtn(theme === 'light', authDark)}
                      title={language === 'en' ? 'Light mode' : 'Modo claro'}
                    >
                      <SunMedium size={17} strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      aria-pressed={theme === 'dark'}
                      onClick={() => setTheme('dark')}
                      className={authThemeToggleBtn(theme === 'dark', authDark)}
                      title={language === 'en' ? 'Dark mode' : 'Modo oscuro'}
                    >
                      <Moon size={17} strokeWidth={2.2} />
                    </button>
                  </div>
                  <div className={`flex rounded-full border p-0.5 backdrop-blur-md ${authChromeBar(authDark)}`}>
                    <button type="button" onClick={() => setLanguage('es')} className={authLangToggleClass(language === 'es', authDark)}>
                      ES
                    </button>
                    <button type="button" onClick={() => setLanguage('en')} className={authLangToggleClass(language === 'en', authDark)}>
                      EN
                    </button>
                  </div>
                </div>
                <div className="mt-10 mb-4 flex flex-col items-center justify-center gap-6 animate-fade-in-up lg:hidden">
                  <div
                    className={`rounded-[2.5rem] border p-6 shadow-2xl ring-1 backdrop-blur-md ${
                      authDark
                        ? 'border-white/50 bg-white/90 ring-white/40'
                        : 'border-slate-200/90 bg-white ring-travel-primary/10'
                    }`}
                  >
                    <Logo className="h-24 w-24" variant="icon" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col pb-8 lg:pb-10">
                  <Onboarding
                    onComplete={handleOnboardingComplete}
                    onCancel={() => setAuthView('landing')}
                    language={language}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Landing inicial con botones de acceso
      return (
        <div className={AUTH_BG_CLASS}>
          <div className={authOverlayClass(authDark)}>
            <AuthDesktopHero variant="landing" language={language} t={t} isDark={authDark} />

            <div
              className={`flex min-h-0 flex-1 flex-col lg:max-w-[min(440px,40vw)] lg:shrink-0 lg:justify-center lg:overflow-y-auto lg:px-10 lg:py-12 lg:backdrop-blur-md xl:px-14 ${
                authDark ? 'lg:bg-slate-950/40' : 'lg:bg-white/82'
              }`}
            >
              <header className="mx-auto mb-2 flex w-full max-w-lg shrink-0 items-center justify-between gap-3 lg:mx-0 lg:mb-8 lg:max-w-none">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] lg:hidden ${
                    authDark
                      ? 'border-white/20 bg-white/10 text-white/90'
                      : 'border-slate-300/80 bg-white/90 text-travel-dark'
                  }`}
                >
                  {t.beta}
                </span>
                <span className="hidden lg:inline" aria-hidden="true" />
                <div className="ml-auto flex items-center gap-2">
                  <div className={`flex rounded-full border p-0.5 backdrop-blur-md ${authChromeBar(authDark)}`}>
                    <button
                      type="button"
                      aria-pressed={theme === 'light'}
                      onClick={() => setTheme('light')}
                      className={authThemeToggleBtn(theme === 'light', authDark)}
                      title={language === 'en' ? 'Light mode' : 'Modo claro'}
                    >
                      <SunMedium size={17} strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      aria-pressed={theme === 'dark'}
                      onClick={() => setTheme('dark')}
                      className={authThemeToggleBtn(theme === 'dark', authDark)}
                      title={language === 'en' ? 'Dark mode' : 'Modo oscuro'}
                    >
                      <Moon size={17} strokeWidth={2.2} />
                    </button>
                  </div>
                  <div className={`flex rounded-full border p-0.5 backdrop-blur-md ${authChromeBar(authDark)}`}>
                    <button type="button" onClick={() => setLanguage('es')} className={authLangToggleClassLanding(language === 'es', authDark)}>
                      ES
                    </button>
                    <button type="button" onClick={() => setLanguage('en')} className={authLangToggleClassLanding(language === 'en', authDark)}>
                      EN
                    </button>
                  </div>
                </div>
              </header>

              <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6 animate-fade-in-up lg:flex-none lg:items-stretch lg:py-0">
                <div className="lg:hidden flex flex-col items-center gap-6">
                  <div
                    className={`rounded-[2.5rem] border p-8 shadow-2xl ring-1 backdrop-blur-md transition-transform duration-300 hover:scale-[1.02] ${
                      authDark
                        ? 'border-white/50 bg-white/90 ring-white/30 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]'
                        : 'border-slate-200/90 bg-white ring-travel-primary/10 hover:shadow-xl'
                    }`}
                  >
                    <Logo className="w-32 h-32" variant="icon" />
                  </div>
                  <div
                    className={`rounded-2xl p-5 px-8 shadow-xl ring-1 ${
                      authDark
                        ? 'border-4 border-white/90 bg-[#f4e8c1] ring-travel-accent/20'
                        : 'border-2 border-slate-200/80 bg-[#f4e8c1] ring-travel-accent/15'
                    }`}
                  >
                    <Logo className="w-auto" variant="text" />
                  </div>
                </div>

                <p
                  className={`mx-auto max-w-md px-4 text-center text-lg font-semibold leading-snug tracking-tight sm:text-xl lg:hidden ${
                    authDark ? 'text-white/95 drop-shadow-md' : 'text-slate-800'
                  }`}
                >
                  {t.tagline}
                </p>

                <div className="mx-auto mt-4 grid w-full max-w-md grid-cols-1 gap-2 px-2 sm:grid-cols-3 sm:gap-3 lg:hidden">
                  {[
                    { Icon: Sparkles, label: t.featureAi },
                    { Icon: Users, label: t.featureMatch },
                    { Icon: MapPin, label: t.featurePlaces },
                  ].map(({ Icon, label }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-xs font-medium backdrop-blur-sm ${
                        authDark
                          ? 'border-white/15 bg-white/10 text-white/95'
                          : 'border-slate-200/90 bg-white/95 text-slate-800'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          authDark ? 'bg-white/20 text-white' : 'bg-travel-secondary/45 text-travel-dark'
                        }`}
                      >
                        <Icon size={16} strokeWidth={2.2} />
                      </span>
                      <span className="leading-tight">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="hidden lg:block">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-travel-secondary">
                    {language === 'en' ? 'Get started' : 'Comienza'}
                  </p>
                  <p
                    className={`mb-8 max-w-sm text-balance text-xl font-semibold leading-snug ${
                      authDark ? 'text-white drop-shadow' : 'text-slate-800'
                    }`}
                  >
                    {language === 'en'
                      ? 'Sign in or create an account to start matching.'
                      : 'Inicia sesión o crea una cuenta para empezar a hacer match.'}
                  </p>
                </div>

                <div className="mx-auto mb-6 mt-8 w-full max-w-xs space-y-3 lg:mx-0 lg:mt-0 lg:max-w-none">
                  <Button
                    fullWidth
                    onClick={() => setAuthView('login')}
                    className={authDark ? 'shadow-lg shadow-black/20 lg:py-3.5 lg:text-base' : 'shadow-md lg:py-3.5 lg:text-base'}
                  >
                    {t.login}
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => setAuthView('register')}
                    className={
                      authDark
                        ? 'border-white/80 bg-white/10 text-white backdrop-blur-sm shadow-md hover:bg-white hover:text-travel-primary lg:py-3.5 lg:text-base'
                        : 'border-travel-primary/50 bg-white/90 text-travel-dark shadow-sm backdrop-blur-sm hover:bg-travel-primary hover:text-white lg:py-3.5 lg:text-base'
                    }
                  >
                    {t.register}
                  </Button>
                </div>
              </div>
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
      case 'flashcards':
        return (
          <FlashcardsView
            currentUser={currentUser}
            language={language}
            theme={theme}
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
        isAuthenticated
          ? isDark
            ? 'bg-slate-900 text-gray-100'
            : 'bg-gradient-to-br from-[#f9f9f9] via-white to-travel-secondary/30 text-gray-800'
          : isDark
            ? 'bg-slate-950 text-gray-100'
            : 'bg-amber-50/40 text-gray-800'
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
          onTogglePomodoro={() => setIsPomodoroOpen((prev) => !prev)}
          onToggleNotes={() => setIsNotesOpen((prev) => !prev)}
        />
      )}
      {isPomodoroOpen && (
        <PomodoroTimer 
          isDark={isDark} 
          onClose={() => setIsPomodoroOpen(false)} 
        />
      )}
      {isNotesOpen && (
        <StickyNotes
          isDark={isDark}
          onClose={() => setIsNotesOpen(false)}
          userId={currentUser?.id || 'guest'}
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