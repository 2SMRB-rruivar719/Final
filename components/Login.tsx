import React, { useState } from 'react';
import { Button } from './Button';
import { loginUser, recoverAccount } from '../services/api';
import { LanguageCode, ThemeMode, UserProfile } from '../types';
import { ChevronLeft } from 'lucide-react';
import { useToast } from './ToastProvider';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBackToLanding: () => void;
  language: LanguageCode;
  theme?: ThemeMode;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBackToLanding, language, theme = 'light' }) => {
  const saveAccountForQuickSwitch = (user: UserProfile) => {
    try {
      const raw = localStorage.getItem('tm_saved_accounts');
      const parsed = raw ? (JSON.parse(raw) as Array<{ id: string; profile: UserProfile; savedAt: string }>) : [];
      const next = [
        { id: user.id, profile: user, savedAt: new Date().toISOString() },
        ...parsed.filter((entry) => entry.id !== user.id),
      ].slice(0, 8);
      localStorage.setItem('tm_saved_accounts', JSON.stringify(next));
    } catch {
      // Ignore persistence issues in login flow.
    }
  };
  const t = language === 'en'
    ? {
        back: 'Back', title: 'Sign in', email: 'Email', password: 'Password', login: 'Sign in', loggingIn: 'Signing in...',
        recover: 'Recover account', cancelRecover: 'Cancel recovery', recoverTitle: 'Recover account',
        accountEmail: 'Account email', newPassword: 'New password', repeatPassword: 'Repeat new password',
        updatePassword: 'Update password', updating: 'Updating...', loginToast: 'Signing in...', loginOk: 'Signed in successfully.',
        saveAccountPrompt: 'Do you want to save this account for quick switching later?',
      }
    : {
        back: 'Volver', title: 'Iniciar sesión', email: 'Email', password: 'Contraseña', login: 'Iniciar sesión', loggingIn: 'Entrando...',
        recover: 'Recuperar cuenta', cancelRecover: 'Cancelar recuperación', recoverTitle: 'Recuperar cuenta',
        accountEmail: 'Email de la cuenta', newPassword: 'Nueva contraseña', repeatPassword: 'Repite la nueva contraseña',
        updatePassword: 'Actualizar contraseña', updating: 'Actualizando...', loginToast: 'Iniciando sesión...', loginOk: 'Sesión iniciada correctamente.',
        saveAccountPrompt: '¿Quieres guardar esta cuenta para cambiar rápidamente después?',
      };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRecover, setShowRecover] = useState(false);
  const [recoverEmail, setRecoverEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoverLoading, setRecoverLoading] = useState(false);
  const [recoverMessage, setRecoverMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const isDark = theme === 'dark';
  const inputClass = isDark
    ? 'w-full p-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-travel-secondary focus:outline-none bg-slate-800/90 text-gray-100 placeholder:text-gray-400'
    : 'w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none text-gray-900 placeholder:text-gray-500';
  const labelClass = isDark ? 'text-sm font-medium text-gray-200' : 'text-sm font-medium text-gray-800';
  const cardClass = isDark
    ? 'mx-auto mt-10 mb-20 flex h-full w-full max-w-md animate-fade-in flex-col rounded-2xl border border-white/15 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md lg:mx-0 lg:mt-4 lg:mb-8 lg:max-w-md lg:p-8'
    : 'mx-auto mt-10 mb-20 flex h-full w-full max-w-md animate-fade-in flex-col rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-xl backdrop-blur-sm lg:mx-0 lg:mt-4 lg:mb-8 lg:max-w-md lg:p-8';
  const titleClass = isDark ? 'mb-6 text-center text-2xl font-bold text-gray-100 lg:text-left lg:text-3xl' : 'mb-6 text-center text-2xl font-bold text-travel-dark lg:text-left lg:text-3xl';
  const backBtnClass = isDark
    ? 'flex items-center gap-1 self-start text-left text-sm text-gray-300 hover:text-travel-secondary'
    : 'flex items-center gap-1 self-start text-left text-sm text-gray-700 hover:text-travel-primary';
  const linkBtnClass = isDark
    ? 'mt-3 self-start text-sm text-travel-secondary hover:text-amber-200 hover:underline lg:mt-4'
    : 'mt-3 self-start text-sm text-gray-700 hover:text-travel-accent hover:underline lg:mt-4';
  const recoverTitleClass = isDark ? 'text-sm font-semibold text-gray-100' : 'text-sm font-semibold text-gray-800';
  const dividerClass = isDark ? 'mt-4 space-y-3 border-t border-slate-600 pt-4 lg:mt-6 lg:pt-6' : 'mt-4 space-y-3 border-t border-gray-200 pt-4 lg:mt-6 lg:pt-6';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[FLOW] Click en Iniciar sesión', { email });
    setError(null);

    if (!email || !password) {
      const msg = 'Debes introducir email y contraseña.';
      console.warn('[VALIDATION] Login -', msg);
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (!email.includes('@')) {
      const msg = 'El email debe contener "@".';
      console.warn('[VALIDATION] Login -', msg);
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    try {
      setLoading(true);
      showToast(t.loginToast, 'info');
      console.log('[API] Enviando petición de login a backend');
      const user = await loginUser(email, password);
      console.log('[API] Login correcto, usuario recibido', user);
      showToast(t.loginOk, 'success');
      if (window.confirm(t.saveAccountPrompt)) {
        saveAccountForQuickSwitch(user);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      let msg = err?.message || 'Credenciales incorrectas o error al iniciar sesión.';
      if (typeof msg === 'string' && msg.toLowerCase().includes('failed to fetch')) {
        msg = 'Error de conexión al iniciar sesión. Revisa tu conexión o inténtalo de nuevo.';
      }
      console.error('[ERROR] Error en login', err);
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecoverMessage(null);

    if (!recoverEmail || !recoverEmail.includes('@')) {
      const msg = 'Introduce un email válido para recuperar la cuenta.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      const msg = 'La nueva contraseña debe tener al menos 6 caracteres.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      const msg = 'Las nuevas contraseñas no coinciden.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    try {
      setRecoverLoading(true);
      const response = await recoverAccount(recoverEmail, newPassword);
      setRecoverMessage(response.message);
      showToast(response.message, 'success');
      setEmail(recoverEmail);
      setShowRecover(false);
      setRecoverEmail('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      const msg = err?.message || 'No se pudo recuperar la cuenta.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setRecoverLoading(false);
    }
  };

  return (
    <div className={cardClass}>
      <div className="mb-2 shrink-0">
        <button
          type="button"
          onClick={onBackToLanding}
          className={backBtnClass}
        >
          <ChevronLeft size={18} />
          <span>{t.back}</span>
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <h2 className={titleClass}>
          {t.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className={labelClass} htmlFor="login-email">
              {t.email}
            </label>
            <input
              id="login-email"
              type="email"
              className={inputClass}
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className={labelClass} htmlFor="login-password">
              {t.password}
            </label>
            <input
              id="login-password"
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 p-2 text-sm text-red-500">
              {error}
            </p>
          )}
          <div>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? t.loggingIn : t.login}
            </Button>
          </div>
        </form>

        <button
          type="button"
          className={linkBtnClass}
          onClick={() => {
            setShowRecover((prev) => !prev);
            setError(null);
            setRecoverMessage(null);
            if (!showRecover) {
              setRecoverEmail(email);
            }
          }}
        >
          {showRecover ? t.cancelRecover : t.recover}
        </button>

        {showRecover && (
          <form
            onSubmit={handleRecover}
            className={dividerClass}
          >
            <h3 className={recoverTitleClass}>{t.recoverTitle}</h3>
            <input
              type="email"
              className={inputClass}
              placeholder={t.accountEmail}
              value={recoverEmail}
              onChange={(e) => setRecoverEmail(e.target.value)}
            />
            <input
              type="password"
              className={inputClass}
              placeholder={t.newPassword}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className={inputClass}
              placeholder={t.repeatPassword}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <div>
              <Button type="submit" fullWidth disabled={recoverLoading}>
                {recoverLoading ? t.updating : t.updatePassword}
              </Button>
            </div>
          </form>
        )}

        {recoverMessage && (
          <p className="mt-3 rounded-xl border border-green-100 bg-green-50 p-2 text-sm text-green-700">
            {recoverMessage}
          </p>
        )}
      </div>
    </div>
  );
};

