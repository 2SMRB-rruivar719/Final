import React, { useState } from 'react';
import { UserProfile, TravelStyle, UserRole, LanguageCode } from '../types';
import { Button } from './Button';
import { Compass, Calendar, DollarSign, MapPin, User, Check, ChevronLeft } from 'lucide-react';
import { registerUser, RegisterPayload } from '../services/api';
import { useToast } from './ToastProvider';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
  language: LanguageCode;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel, language }) => {
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const buildDebugSnapshot = () => ({
    step,
    role,
    language,
    name: formData.name,
    destination: formData.destination,
    dates: formData.dates,
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

    try {
      setLoading(true);
      showToast('Creando tu cuenta...', 'info');
      const payload: RegisterPayload = {
        name: formData.name?.trim() || undefined,
        email,
        password,
        role: role || undefined,
        destination: formData.destination?.trim() || undefined,
        dates: formData.dates?.trim() || undefined,
        age: formData.age,
        country: formData.country?.trim() || undefined,
        bio: formData.bio?.trim() || undefined,
        budget: (formData.budget || 'Medio') as UserProfile['budget'],
        travelStyle: formData.travelStyle || [],
        interests: formData.interests || [],
        avatarUrl: formData.avatarUrl,
        language,
        theme: 'light',
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
    <div className="flex flex-col h-full p-6 max-w-md mx-auto animate-fade-in bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl mt-4 mb-20 border border-white">
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-travel-primary text-left"
      >
        <ChevronLeft size={18} />
        <span>Volver</span>
      </button>
      <div className="flex-1">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
          <div 
            className="bg-travel-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-travel-dark text-center">Cuéntanos sobre ti</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <User size={16} /> Nombre
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
                placeholder="Ej. Ana García"
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MapPin size={16} /> ¿A dónde quieres ir?
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
                placeholder="Ej. Japón, Perú, Italia..."
                value={formData.destination || ''}
                onChange={e => setFormData({...formData, destination: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar size={16} /> ¿Cuándo?
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
                value={formData.dates || ''}
                onChange={e => setFormData({...formData, dates: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                name="register-email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Contraseña</label>
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
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
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
              <label className="text-sm font-medium text-gray-600">Repetir contraseña</label>
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
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
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
              <span className="text-sm font-medium text-gray-600">Tipo de cuenta</span>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('cliente')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    role === 'cliente' ? 'bg-white shadow-sm text-travel-accent' : 'text-gray-500'
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setRole('empresa')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    role === 'empresa' ? 'bg-white shadow-sm text-travel-accent' : 'text-gray-500'
                  }`}
                >
                  Empresa
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-travel-dark text-center">Tu estilo de viaje</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Compass size={16} /> ¿Qué tipo de viajero eres?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(TravelStyle).map(style => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      formData.travelStyle?.includes(style)
                        ? 'bg-travel-secondary border-travel-primary text-travel-dark'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {style} {formData.travelStyle?.includes(style) && '✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign size={16} /> Presupuesto
              </label>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                {['Bajo', 'Medio', 'Alto'].map(b => (
                  <button
                    key={b}
                    onClick={() => setFormData({...formData, budget: b as any})}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.budget === b
                        ? 'bg-white shadow-sm text-travel-accent'
                        : 'text-gray-500'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-travel-dark text-center">Intereses</h2>
            <p className="text-gray-500 text-center text-sm">Escribe tus intereses separados por comas para mejorar el matching con IA.</p>
            
            <textarea
              className="w-full h-32 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none resize-none"
              placeholder="Ej. Gastronomía, Museos, Senderismo, Fotografía..."
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
            Siguiente
          </Button>
        ) : (
          <Button fullWidth onClick={handleComplete} disabled={loading}>
            {loading ? 'Creando cuenta...' : (
              <>
                <Check className="mr-2 h-5 w-5" /> Comenzar Aventura
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};