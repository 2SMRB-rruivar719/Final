import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile, LanguageCode, ThemeMode } from '../types';
import {
  Plane,
  Save,
  Camera,
  Globe2,
  ChevronLeft,
  Moon,
  SunMedium,
  Settings,
  User,
  Trash2,
  CalendarClock,
  ImageIcon,
} from 'lucide-react';
import { Button } from './Button';
import { useToast } from './ToastProvider';
import {
  updateUserProfile,
  deleteUserAccount,
  scheduleAccountDeletion,
  cancelScheduledDeletion,
} from '../services/api';

interface ProfileViewProps {
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onLogout: () => void;
  onAccountDeleted?: () => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  theme: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
}

const deriveTripDates = (user: UserProfile) => {
  if (user.tripStartDate && user.tripEndDate) {
    return { start: user.tripStartDate, end: user.tripEndDate };
  }
  const raw = user.dates || '';
  const parts = raw.split(/\s*→\s*|\s*->\s*|,\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0]) && /^\d{4}-\d{2}-\d{2}$/.test(parts[1])) {
    return { start: parts[0], end: parts[1] };
  }
  if (parts.length === 1 && /^\d{4}-\d{2}-\d{2}$/.test(parts[0])) {
    return { start: parts[0], end: '' };
  }
  return { start: '', end: '' };
};

const formatDeletionDate = (iso?: string | null) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
};

const getFallbackAvatar = (name?: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0f172a&color=ffffff`;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onAccountDeleted,
  language,
  onChangeLanguage,
  theme,
  onChangeTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(currentUser);
  const [saving, setSaving] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState(currentUser.avatarUrl);
  const [avatarSrc, setAvatarSrc] = useState(currentUser.avatarUrl || getFallbackAvatar(currentUser.name));
  const [deletionDateInput, setDeletionDateInput] = useState('');
  const { showToast } = useToast();
  const inputClass = `w-full p-3 border rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none text-sm ${
    theme === 'dark'
      ? 'bg-slate-800 border-slate-700 text-gray-100 placeholder-gray-400'
      : 'bg-white border-gray-200 text-gray-800'
  }`;
  const cardClass = theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50';
  const headingClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-400';
  const bodyTextClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';
  const t = language === 'en'
    ? {
        profile: 'Profile',
        settings: 'Settings',
        editProfile: 'Edit profile',
        saveChanges: 'Save changes',
        saving: 'Saving...',
        nextDestination: 'Next destination',
        budget: 'Budget',
        bio: 'Bio',
        interests: 'Interests',
        tripDates: 'Travel dates',
        outbound: 'Outbound',
        return: 'Return',
        appearanceLanguage: 'Appearance and language',
        language: 'Language',
        darkMode: 'Dark mode',
        activate: 'Enable',
        deactivate: 'Disable',
        accountSecurity: 'Account and security',
        profilePicture: 'Profile picture',
        uploadFile: 'Upload file',
        applyPhoto: 'Apply photo',
        scheduledDeletion: 'Scheduled deletion',
        logout: 'Log out',
      }
    : {
        profile: 'Perfil',
        settings: 'Configuración',
        editProfile: 'Editar perfil',
        saveChanges: 'Guardar cambios',
        saving: 'Guardando...',
        nextDestination: 'Próximo destino',
        budget: 'Presupuesto',
        bio: 'Bio',
        interests: 'Intereses',
        tripDates: 'Fechas del viaje',
        outbound: 'Ida',
        return: 'Vuelta',
        appearanceLanguage: 'Apariencia e idioma',
        language: 'Idioma',
        darkMode: 'Modo oscuro',
        activate: 'Activar',
        deactivate: 'Desactivar',
        accountSecurity: 'Cuenta y seguridad',
        profilePicture: 'Foto de perfil',
        uploadFile: 'Subir archivo',
        applyPhoto: 'Aplicar foto',
        scheduledDeletion: 'Borrado programado',
        logout: 'Cerrar sesión',
      };

  useEffect(() => {
    setFormData(currentUser);
    setAvatarDraft(currentUser.avatarUrl);
    setAvatarSrc(currentUser.avatarUrl || getFallbackAvatar(currentUser.name));
  }, [currentUser]);

  const trip = useMemo(() => deriveTripDates(currentUser), [currentUser]);

  const handleSave = async () => {
    setSaving(true);
    showToast('Guardando cambios...', 'info');
    try {
      const updated = await updateUserProfile(currentUser.id, {
        name: formData.name,
        email: formData.email,
        age: formData.age,
        country: formData.country,
        bio: formData.bio,
        destination: formData.destination,
        tripStartDate: formData.tripStartDate,
        tripEndDate: formData.tripEndDate,
        budget: formData.budget,
        travelStyle: formData.travelStyle,
        interests: formData.interests,
        avatarUrl: formData.avatarUrl,
        language: formData.language,
        theme: formData.theme,
      });
      onUpdateUser(updated);
      setFormData(updated);
      setAvatarDraft(updated.avatarUrl);
      setIsEditing(false);
      showToast('Perfil actualizado.', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo guardar.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(currentUser);
    setAvatarDraft(currentUser.avatarUrl);
    setIsEditing(false);
  };

  const handleApplyAvatar = async () => {
    if (!avatarDraft.trim()) {
      showToast('Introduce una URL de imagen válida.', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateUserProfile(currentUser.id, { avatarUrl: avatarDraft.trim() });
      onUpdateUser(updated);
      setFormData(updated);
      showToast('Foto de perfil actualizada.', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo actualizar la foto.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Selecciona un archivo de imagen válido.', 'error');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast('La imagen es demasiado grande (máximo 4MB).', 'error');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarDraft(dataUrl);
      setAvatarSrc(dataUrl);
      showToast('Imagen cargada. Pulsa en aplicar para guardar.', 'info');
    } catch {
      showToast('No se pudo leer el archivo.', 'error');
    }
  };

  const handleDeleteNow = async () => {
    if (
      !window.confirm(
        '¿Seguro que quieres borrar tu cuenta? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      await deleteUserAccount(currentUser.id);
      showToast('Cuenta eliminada.', 'info');
      onAccountDeleted?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo borrar la cuenta.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleDeletion = async () => {
    if (!deletionDateInput) {
      showToast('Elige una fecha de borrado.', 'error');
      return;
    }
    const iso = new Date(`${deletionDateInput}T12:00:00`).toISOString();
    if (
      !window.confirm(
        `Se borrará tu cuenta el ${deletionDateInput}. ¿Confirmas?`
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const updated = await scheduleAccountDeletion(currentUser.id, iso);
      onUpdateUser(updated);
      setFormData(updated);
      setDeletionDateInput('');
      showToast('Borrado programado.', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo programar el borrado.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelDeletion = async () => {
    setSaving(true);
    try {
      const updated = await cancelScheduledDeletion(currentUser.id);
      onUpdateUser(updated);
      setFormData(updated);
      showToast('Borrado programado cancelado.', 'success');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo cancelar.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`p-6 max-w-2xl mx-auto min-h-screen pb-24 lg:pb-10 lg:mt-8 lg:rounded-3xl lg:border lg:shadow-sm ${
        theme === 'dark' ? 'bg-slate-900 lg:border-slate-700' : 'bg-white lg:border-gray-100'
      }`}>
        <div className="flex items-center gap-2 mb-6 mt-4">
          <button type="button" onClick={handleCancel} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
            <ChevronLeft size={22} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'}`}>{t.editProfile}</h2>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={formData.avatarUrl}
                className="w-28 h-28 rounded-full object-cover opacity-90 border-4 border-travel-secondary"
                alt="Perfil"
                onError={() => setFormData((prev) => ({ ...prev, avatarUrl: getFallbackAvatar(prev.name) }))}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Camera className="text-gray-800 bg-white/50 p-2 rounded-full w-10 h-10" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>URL de la foto</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Edad</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>País</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className={`${inputClass} h-24 resize-none`}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Próximo destino</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t.tripDates}</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className={`text-xs block mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t.outbound}</span>
                <input
                  type="date"
                  value={formData.tripStartDate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tripStartDate: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <span className={`text-xs block mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t.return}</span>
                <input
                  type="date"
                  value={formData.tripEndDate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tripEndDate: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} fullWidth className="mt-6" disabled={saving}>
            <Save size={18} /> {saving ? t.saving : t.saveChanges}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-3xl mx-auto min-h-screen pb-24 lg:pb-10 lg:mt-8 lg:rounded-3xl lg:border lg:shadow-sm ${
      theme === 'dark'
        ? 'bg-slate-900 text-gray-100 lg:border-slate-700'
        : 'bg-white lg:border-gray-100'
    }`}>
      <div className="text-center mb-6 mt-6">
        <div className="relative inline-block">
          <img
            src={avatarSrc}
            className="w-28 h-28 rounded-full border-4 border-travel-secondary object-cover"
            alt="Perfil"
            onError={() => setAvatarSrc(getFallbackAvatar(currentUser.name))}
          />
          <button
            type="button"
            onClick={() => {
              const { start, end } = deriveTripDates(currentUser);
              setFormData({
                ...currentUser,
                tripStartDate: currentUser.tripStartDate || start || '',
                tripEndDate: currentUser.tripEndDate || end || '',
              });
              setIsEditing(true);
            }}
            className="absolute bottom-0 right-0 bg-travel-accent text-white p-2 rounded-full border-2 border-white hover:bg-opacity-90 transition"
            aria-label="Editar perfil"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
        <h2 className={`text-2xl font-bold mt-4 ${theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'}`}>
          {currentUser.name}, {currentUser.age}
        </h2>
        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{currentUser.country}</p>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>{currentUser.email}</p>
      </div>

      <div className={`flex rounded-2xl p-1 mb-6 max-w-md mx-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'}`}>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'profile'
              ? (theme === 'dark' ? 'bg-slate-700 shadow text-white' : 'bg-white shadow text-travel-dark')
              : (theme === 'dark' ? 'text-gray-300' : 'text-gray-500')
          }`}
        >
          <User size={16} />
          {t.profile}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'settings'
              ? (theme === 'dark' ? 'bg-slate-700 shadow text-white' : 'bg-white shadow text-travel-dark')
              : (theme === 'dark' ? 'text-gray-300' : 'text-gray-500')
          }`}
        >
          <Settings size={16} />
          {t.settings}
        </button>
      </div>

      {currentUser.deletionScheduledAt && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="flex items-center gap-2">
            <CalendarClock size={18} />
            {t.scheduledDeletion}: {formatDeletionDate(currentUser.deletionScheduledAt)}
          </span>
          <Button type="button" variant="outline" className="shrink-0 py-1.5 text-xs" onClick={handleCancelDeletion} disabled={saving}>
            Cancelar borrado
          </Button>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          <div className={`${cardClass} p-4 rounded-xl`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${headingClass}`}>{t.nextDestination}</h3>
            <div className="flex items-center gap-2 text-travel-dark font-semibold">
              <Plane size={18} className="text-travel-primary shrink-0" />
              <span>
                {currentUser.destination}
                {(trip.start || trip.end) && (
                  <span className="block text-sm font-normal text-gray-600 mt-1">
                    {trip.start || '—'} → {trip.end || '—'}
                  </span>
                )}
                {!trip.start && !trip.end && currentUser.dates && (
                  <span className="block text-sm font-normal text-gray-600 mt-1">{currentUser.dates}</span>
                )}
              </span>
            </div>
          </div>

          <div className={`${cardClass} p-4 rounded-xl`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${headingClass}`}>{t.budget}</h3>
            <p className="font-medium text-travel-dark">{currentUser.budget}</p>
          </div>

          <div className={`${cardClass} p-4 rounded-xl lg:col-span-2`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${headingClass}`}>{t.bio}</h3>
            <p className={`${bodyTextClass} text-sm leading-relaxed`}>{currentUser.bio}</p>
          </div>

          <div className={`${cardClass} p-4 rounded-xl lg:col-span-2`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${headingClass}`}>{t.interests}</h3>
            <div className="flex flex-wrap gap-2">
              {(currentUser.interests || []).map((i) => (
                <span key={i} className={`${theme === 'dark' ? 'bg-slate-900 text-gray-200' : 'bg-white text-gray-600'} px-3 py-1 rounded-full text-sm shadow-sm`}>
                  {i}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors mt-2"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl space-y-3 ${cardClass}`}>
            <h3 className={`text-xs font-bold uppercase mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'}`}>{t.appearanceLanguage}</h3>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                <Globe2 size={18} className="text-travel-primary" />
                <span className="font-medium text-sm">{t.language}</span>
              </div>
              <button
                type="button"
                onClick={() => onChangeLanguage(language === 'es' ? 'en' : 'es')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-gray-100 hover:bg-slate-600'
                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100'
                }`}
              >
                {language === 'es' ? 'Español' : 'English'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {theme === 'dark' ? (
                  <Moon size={18} className="text-travel-primary" />
                ) : (
                  <SunMedium size={18} className="text-travel-primary" />
                )}
                <span className="font-medium text-sm">{t.darkMode}</span>
              </div>
              <button
                type="button"
                onClick={() => onChangeTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  theme === 'dark'
                    ? 'bg-slate-700 border-slate-600 text-gray-100 hover:bg-slate-600'
                    : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100'
                }`}
              >
                {theme === 'dark' ? t.deactivate : t.activate}
              </button>
            </div>
          </div>

          <div className={`${cardClass} p-4 rounded-xl space-y-3`}>
            <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-1">
              <ImageIcon size={14} />
              {t.profilePicture}
            </h3>
            <p className="text-xs text-gray-500">Pega una URL de imagen (por ahora sin subida de archivos).</p>
            <input
              type="url"
              value={avatarDraft}
              onChange={(e) => setAvatarDraft(e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className={`${theme === 'dark' ? 'text-gray-200 file:bg-slate-700 file:text-white file:border-slate-600' : 'text-gray-700 file:bg-gray-100 file:text-gray-800 file:border-gray-300'} block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border`}
            />
            <p className={`text-[11px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t.uploadFile}: JPG, PNG, WEBP (max 4MB)
            </p>
            <Button type="button" variant="outline" fullWidth onClick={handleApplyAvatar} disabled={saving}>
              {t.applyPhoto}
            </Button>
          </div>

          <div className={`${cardClass} p-4 rounded-xl space-y-3 border ${theme === 'dark' ? 'border-red-900/40' : 'border-red-100'}`}>
            <h3 className="text-xs font-bold text-red-400 uppercase flex items-center gap-2 mb-1">
              <Trash2 size={14} />
              {t.accountSecurity}
            </h3>
            <p className="text-xs text-gray-600">
              Puedes borrar la cuenta al instante o programar el borrado (mínimo mañana).
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={deletionDateInput}
                onChange={(e) => setDeletionDateInput(e.target.value)}
                className={inputClass}
              />
              <Button type="button" variant="outline" className="sm:w-auto" onClick={handleScheduleDeletion} disabled={saving}>
                Programar borrado
              </Button>
            </div>
            <Button type="button" fullWidth className="bg-red-600 hover:bg-red-700 text-white border-0" onClick={handleDeleteNow} disabled={saving}>
              Borrar cuenta ahora
            </Button>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
          >
            {t.logout}
          </button>
        </div>
      )}
    </div>
  );
};
