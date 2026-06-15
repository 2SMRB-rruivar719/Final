import React, { useState } from 'react';
import { UserProfile, TravelStyle, UserRole, LanguageCode, UserSex, ThemeMode } from '../types';
import { Button } from './Button';
import { GraduationCap, Calendar, Award, BookOpen, User, Check, ChevronLeft } from 'lucide-react';
import { registerUser, RegisterPayload } from '../services/api';
import { useToast } from './ToastProvider';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
  language: LanguageCode;
  theme?: ThemeMode;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel, language, theme = 'light' }) => {
  const t = language === 'en'
    ? {
        back: 'Back',
        aboutYou: 'Tell us about you',
        name: 'Name',
        whereTo: 'What subject or exam are you preparing?',
        travelDates: 'Study period',
        outbound: 'Start',
        return: 'End',
        accountType: 'Account type',
        sex: 'Sex',
        male: 'Male',
        female: 'Female',
        client: 'Student',
        company: 'Tutor / Center',
        next: 'Next',
        interests: 'Topics & Subjects',
        travelStyle: 'Your study style',
        begin: 'Start StudyMatch',
        creating: 'Creating account...',
        invalidTripDates: 'End date must be on or after start date. Please enter valid study dates.',
      }
    : {
        back: 'Volver',
        aboutYou: 'Cuéntanos sobre ti',
        name: 'Nombre',
        whereTo: '¿Qué materia o examen estás preparando?',
        travelDates: 'Periodo de estudio',
        outbound: 'Inicio',
        return: 'Fin',
        accountType: 'Tipo de cuenta',
        sex: 'Sexo',
        male: 'Hombre',
        female: 'Mujer',
        client: 'Estudiante',
        company: 'Tutor / Academia',
        next: 'Siguiente',
        interests: 'Temas y Asignaturas',
        travelStyle: 'Tu estilo de estudio',
        begin: 'Comenzar StudyMatch',
        creating: 'Creando cuenta...',
        invalidTripDates: 'La fecha de inicio no puede ser posterior a la de fin. Indica fechas de estudio válidas.',
      };
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    travelStyle: [],
    interests: [],
    budget: 'Medio',
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<UserRole>('cliente');
  const [sex, setSex] = useState<UserSex>('hombre');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const isDark = theme === 'dark';
  const shellClass = isDark
    ? 'mx-auto flex h-full max-w-md animate-fade-in flex-col rounded-2xl border border-white/15 bg-slate-900/75 p-6 shadow-xl backdrop-blur-md mt-4 mb-20 lg:mx-0 lg:mb-10 lg:mt-0 lg:max-h-[min(720px,calc(100vh-7rem))] lg:max-w-xl lg:overflow-y-auto lg:p-8 xl:max-w-2xl'
    : 'mx-auto flex h-full max-w-md animate-fade-in flex-col rounded-2xl border border-slate-200/90 bg-white/90 p-6 shadow-xl backdrop-blur-sm mt-4 mb-20 lg:mx-0 lg:mb-10 lg:mt-0 lg:max-h-[min(720px,calc(100vh-7rem))] lg:max-w-xl lg:overflow-y-auto lg:p-8 xl:max-w-2xl';
  const inputClass = isDark
    ? 'w-full p-3 border border-slate-600 rounded-xl focus:ring-2 focus:ring-travel-secondary focus:outline-none bg-slate-800/90 text-gray-100 placeholder:text-gray-400'
    : 'w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none text-gray-900 placeholder:text-gray-500';
  const labelClass = isDark ? 'text-sm font-medium text-gray-200' : 'text-sm font-medium text-gray-800';
  const backBtnClass = isDark
    ? 'flex items-center gap-1 text-sm text-gray-300 mb-4 hover:text-travel-secondary text-left'
    : 'flex items-center gap-1 text-sm text-gray-700 mb-4 hover:text-travel-primary text-left';
  const progressTrack = isDark ? 'w-full bg-slate-700 h-2 rounded-full mb-8' : 'w-full bg-gray-200 h-2 rounded-full mb-8';
  const stepTitleClass = isDark ? 'text-2xl font-bold text-gray-100 text-center' : 'text-2xl font-bold text-travel-dark text-center';
  const dateHintClass = isDark ? 'text-xs text-gray-400 block mb-1' : 'text-xs text-gray-700 block mb-1';

  const tripDatesAreValid = (): boolean => {
    const start = formData.tripStartDate?.trim();
    const end = formData.tripEndDate?.trim();
    if (!start || !end) return true;
    return start <= end;
  };

  const buildDebugSnapshot = () => ({
    step,
    role,
    sex,
    language,
    name: formData.name,
    destination: formData.destination,
    dates: formData.dates,
    tripStartDate: formData.tripStartDate,
    tripEndDate: formData.tripEndDate,
    email,
    emailLength: email.length,
    passwordLength: password.length,
    passwordConfirmLength: passwordConfirm.length,
    hasAtSymbol: email.includes('@'),
    hasDotSymbol: email.includes('.'),
    travelStyleCount: formData.travelStyle?.length || 0,
    interestsCount: formData.interests?.length || 0,
  });

  const handleNext = () => {
    console.log('[FLOW][REGISTER] Click en Siguiente en onboarding', buildDebugSnapshot());
    // Validar campos del paso 1 antes de avanzar
    if (step === 1) {
      setError(null);
      
      if (!formData.name || formData.name.trim() === '') {
        const msg = language === 'en' ? 'Name is required.' : 'El nombre es obligatorio.';
        console.warn('[VALIDATION][REGISTER] Fallo validación', { msg, snapshot: buildDebugSnapshot() });
        setError(msg);
        return;
      }

      if (!formData.destination || formData.destination.trim() === '') {
        const msg = language === 'en' ? 'Subject or exam is required.' : 'La materia o examen es obligatorio.';
        console.warn('[VALIDATION][REGISTER] Fallo validación', { msg, snapshot: buildDebugSnapshot() });
        setError(msg);
        return;
      }

      if (!email || email.trim() === '') {
        const msg = 'El email es obligatorio.';
        console.warn('[VALIDATION][REGISTER] Fallo validación', { msg, snapshot: buildDebugSnapshot() });
        setError(msg);
        return;
      }
      
      if (!email.includes('@') || !email.includes('.')) {
        const msg = 'El email debe tener un formato válido (ejemplo@dominio.com).';
        console.warn('[VALIDATION][REGISTER] Fallo validación', { msg, snapshot: buildDebugSnapshot() });
        setError(msg);
        return;
      }
      
      if (!password || password.length < 6) {
        const msg = 'La contraseña debe tener al menos 6 caracteres.';
        console.warn('[VALIDATION][REGISTER] Fallo validación', { msg, snapshot: buildDebugSnapshot() });
        setError(msg);
        return;
      }
      
      if (passwordConfirm && password !== passwordConfirm) {
        const msg = 'Las contraseñas no coinciden.';
        console.warn('[VALIDATION][REGISTER] Fallo validación', { msg, snapshot: buildDebugSnapshot() });
        setError(msg);
        return;
      }

      if (!tripDatesAreValid()) {
        const msg = t.invalidTripDates;
        console.warn('[VALIDATION][REGISTER] Fechas de viaje inválidas', { snapshot: buildDebugSnapshot() });
        setError(msg);
        showToast(msg, 'error');
        return;
      }
    }
    
    console.log('[FLOW] Avanzando al siguiente paso de onboarding', { from: step, to: step + 1 });
    setStep(p => p + 1);
  };

  const handleBack = () => {
    console.log('[FLOW] Click en Volver en onboarding', { step });
    setError(null);
    if (step > 1) {
      setStep(p => Math.max(1, p - 1));
    } else if (onCancel) {
      onCancel();
    }
  };
  
  const handleComplete = async () => {
    const startedAt = Date.now();
    let wasSuccessful = false;
    console.log('[FLOW][REGISTER] Click en Comenzar Aventura', buildDebugSnapshot());
    setError(null);
    
    // Validaciones completas antes de enviar
    if (!formData.name || formData.name.trim() === '') {
      const msg = language === 'en' ? 'Name is required.' : 'El nombre es obligatorio.';
      console.warn('[VALIDATION][REGISTER] Fallo validación final', { msg, snapshot: buildDebugSnapshot() });
      setError(msg);
      return;
    }

    if (!formData.destination || formData.destination.trim() === '') {
      const msg = language === 'en' ? 'Subject or exam is required.' : 'La materia o examen es obligatorio.';
      console.warn('[VALIDATION][REGISTER] Fallo validación final', { msg, snapshot: buildDebugSnapshot() });
      setError(msg);
      return;
    }

    if (!email || email.trim() === '') {
      const msg = 'El email es obligatorio.';
      console.warn('[VALIDATION][REGISTER] Fallo validación final', { msg, snapshot: buildDebugSnapshot() });
      setError(msg);
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      const msg = 'El email debe tener un formato válido (ejemplo@dominio.com).';
      console.warn('[VALIDATION][REGISTER] Fallo validación final', { msg, snapshot: buildDebugSnapshot() });
      setError(msg);
      return;
    }
    
    if (!password || password.length < 6) {
      const msg = 'La contraseña debe tener al menos 6 caracteres.';
      console.warn('[VALIDATION][REGISTER] Fallo validación final', { msg, snapshot: buildDebugSnapshot() });
      setError(msg);
      return;
    }
    
    if (passwordConfirm && password !== passwordConfirm) {
      const msg = 'Las contraseñas no coinciden.';
      console.warn('[VALIDATION][REGISTER] Fallo validación final', { msg, snapshot: buildDebugSnapshot() });
      setError(msg);
      return;
    }

    if (!tripDatesAreValid()) {
      const msg = t.invalidTripDates;
      console.warn('[VALIDATION][REGISTER] Fechas inválidas al completar', { snapshot: buildDebugSnapshot() });
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    try {
      setLoading(true);
      showToast('Creando tu cuenta...', 'info');
      const payload: RegisterPayload = {
        name: formData.name?.trim() || undefined,
        email,
        password,
        role: role || undefined,
        sex,
        destination: formData.destination?.trim() || undefined,
        dates: formData.dates?.trim() || undefined,
        tripStartDate: formData.tripStartDate?.trim() || undefined,
        tripEndDate: formData.tripEndDate?.trim() || undefined,
        age: formData.age,
        country: formData.country?.trim() || undefined,
        bio: formData.bio?.trim() || undefined,
        budget: (formData.budget || 'Medio') as UserProfile['budget'],
        travelStyle: formData.travelStyle || [],
        interests: formData.interests || [],
        avatarUrl: formData.avatarUrl,
        language,
        theme,
      };
      console.log('[API][REGISTER] Enviando petición de registro a backend', {
        endpoint: '/api/auth/register',
        payloadPreview: {
          ...payload,
          password: `***hidden***(${password.length})`,
        },
      });
      const created = await registerUser({
        ...payload,
      });
      console.log('[API][REGISTER] Usuario creado correctamente en backend', {
        elapsedMs: Date.now() - startedAt,
        userId: created.id,
        userEmail: created.email,
      });
      wasSuccessful = true;
      showToast('Cuenta creada correctamente.', 'success');
      onComplete(created);
    } catch (err: any) {
      let msg = 'No se pudo completar el registro. Revisa los datos o intenta de nuevo.';
      
      if (err?.message) {
        msg = err.message;
      }
      
      // Manejar errores de red
      if (typeof msg === 'string' && (
        msg.toLowerCase().includes('failed to fetch') ||
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('fetch')
      )) {
        msg = language === 'en'
          ? 'Network error. Please check your connection and make sure the server is running.'
          : 'Error de conexión. Revisa tu conexión y asegúrate de que el servidor esté en ejecución.';
      }
      
      // Manejar errores de base de datos
      if (typeof msg === 'string' && msg.toLowerCase().includes('base de datos')) {
        msg = language === 'en'
          ? 'Database connection error. Please check that MongoDB is running.'
          : 'Error de conexión a la base de datos. Asegúrate de que MongoDB esté en ejecución.';
      }
      
      setError(msg);
      console.error('[ERROR][REGISTER] Error en registro', {
        elapsedMs: Date.now() - startedAt,
        message: err?.message,
        stack: err?.stack,
        rawError: err,
      });
      showToast(msg, 'error');
    } finally {
      console.log('[FLOW][REGISTER] Finaliza intento de registro', {
        elapsedMs: Date.now() - startedAt,
        success: wasSuccessful,
      });
      setLoading(false);
    }
  };

  const toggleStyle = (style: TravelStyle) => {
    setFormData(prev => ({
      ...prev,
      travelStyle: prev.travelStyle?.includes(style)
        ? prev.travelStyle.filter(s => s !== style)
        : [...(prev.travelStyle || []), style]
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(null);
  };

  const handlePasswordConfirmChange = (value: string) => {
    setPasswordConfirm(value);
    if (error) setError(null);
  };

  return (
    <div className={shellClass}>
      <button
        type="button"
        onClick={handleBack}
        className={backBtnClass}
      >
        <ChevronLeft size={18} />
        <span>{t.back}</span>
      </button>
      <div className="flex-1">
        {/* Progress Bar */}
        <div className={progressTrack}>
          <div 
            className="bg-travel-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className={stepTitleClass}>{t.aboutYou}</h2>
            
            <div className="space-y-2">
              <label className={`${labelClass} flex items-center gap-2`}>
                <User size={16} /> {t.name}
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Ej. Ana García"
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className={`${labelClass} flex items-center gap-2`}>
                <BookOpen size={16} /> {t.whereTo}
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder="Ej. Matemáticas, Medicina, Selectividad..."
                value={formData.destination || ''}
                onChange={e => setFormData({...formData, destination: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className={`${labelClass} flex items-center gap-2`}>
                <Calendar size={16} /> {t.travelDates}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className={dateHintClass}>{t.outbound}</span>
                  <input
                    type="date"
                    className={`${inputClass} text-sm`}
                    value={formData.tripStartDate || ''}
                    onChange={e => {
                      setFormData({ ...formData, tripStartDate: e.target.value });
                      if (error) setError(null);
                    }}
                  />
                </div>
                <div>
                  <span className={dateHintClass}>{t.return}</span>
                  <input
                    type="date"
                    className={`${inputClass} text-sm`}
                    value={formData.tripEndDate || ''}
                    onChange={e => {
                      setFormData({ ...formData, tripEndDate: e.target.value });
                      if (error) setError(null);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="register-email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className={inputClass}
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Contraseña</label>
              <input
                type="password"
                name="tm-password"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => handlePasswordChange(e.currentTarget.value)}
                onInput={(e) => handlePasswordChange((e.target as HTMLInputElement).value)}
              />
              {password && password.length > 0 && password.length < 6 && (
                <p className="text-xs text-orange-600">La contraseña debe tener al menos 6 caracteres</p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Repetir contraseña</label>
              <input
                type="password"
                name="tm-password-confirm"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                className={inputClass}
                placeholder="Repite la contraseña"
                value={passwordConfirm}
                onChange={(e) => handlePasswordConfirmChange(e.currentTarget.value)}
                onInput={(e) => handlePasswordConfirmChange((e.target as HTMLInputElement).value)}
              />
              {passwordConfirm && passwordConfirm !== password && password.length >= 6 && (
                <p className="text-xs text-red-600">Las contraseñas no coinciden</p>
              )}
            </div>

            <div className="space-y-2">
              <span className={labelClass}>{t.sex}</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSex('hombre')}
                  className={`relative overflow-hidden py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    sex === 'hombre'
                      ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm ring-2 ring-blue-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200'
                  }`}
                >
                  {t.male}
                </button>
                <button
                  type="button"
                  onClick={() => setSex('mujer')}
                  className={`relative overflow-hidden py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    sex === 'mujer'
                      ? 'bg-pink-100 border-pink-300 text-pink-700 shadow-sm ring-2 ring-pink-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-pink-50 hover:border-pink-200'
                  }`}
                >
                  {t.female}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className={labelClass}>{t.accountType}</span>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('cliente')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    role === 'cliente' ? 'bg-white shadow-sm text-travel-accent' : 'text-gray-700'
                  }`}
                >
                  {t.client}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('empresa')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    role === 'empresa' ? 'bg-white shadow-sm text-travel-accent' : 'text-gray-700'
                  }`}
                >
                  {t.company}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className={stepTitleClass}>{t.travelStyle}</h2>
            
            <div className="space-y-2">
              <label className={`${labelClass} flex items-center gap-2`}>
                <GraduationCap size={16} /> ¿Cuál es tu estilo de estudio?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(TravelStyle).map(style => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.travelStyle?.includes(style)
                        ? 'bg-travel-secondary border-travel-primary text-travel-dark'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {style} {formData.travelStyle?.includes(style) && '✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={`${labelClass} flex items-center gap-2`}>
                <Award size={16} /> Nivel de dificultad
              </label>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                {[{key: 'Bajo', label: 'Inicial'}, {key: 'Medio', label: 'Intermedio'}, {key: 'Alto', label: 'Avanzado'}].map(b => (
                  <button
                    key={b.key}
                    onClick={() => setFormData({...formData, budget: b.key as any})}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.budget === b.key
                        ? 'bg-white shadow-sm text-travel-accent'
                        : 'text-gray-700'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className={stepTitleClass}>{t.interests}</h2>
            <p className="text-gray-700 text-center text-sm">Escribe tus asignaturas o temas separados por comas para mejorar el matching.</p>
            
            <textarea
              className={`${inputClass} h-32 resize-none`}
              placeholder="Ej. Programación, Matemáticas, Física, Idiomas, Algoritmos..."
              value={formData.interests?.join(', ') || ''}
              onChange={e => setFormData({
                ...formData, 
                interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl p-2 mb-3">
            {error}
          </p>
        )}
        {step < 3 ? (
          <Button 
            fullWidth 
            onClick={handleNext}
            disabled={loading}
          >
            {t.next}
          </Button>
        ) : (
          <Button fullWidth onClick={handleComplete} disabled={loading}>
            {loading ? t.creating : (
              <>
                <Check className="mr-2 h-5 w-5" /> {t.begin}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};