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
  Trash2,
  CalendarClock,
  ImageIcon,
  Pencil,
  KeyRound,
} from 'lucide-react';
import { Button } from './Button';
import { useToast } from './ToastProvider';
import {
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  scheduleAccountDeletion,
  cancelScheduledDeletion,
} from '../services/api';

interface ProfileViewProps {
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onLogout: () => void;
  onSwitchAccount: (user: UserProfile) => void;
  onAccountDeleted?: () => void;
  section: 'profile' | 'settings';
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

interface SavedAccountEntry {
  id: string;
  profile: UserProfile;
  savedAt: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onLogout,
  onSwitchAccount,
  onAccountDeleted,
  section,
  language,
  onChangeLanguage,
  theme,
  onChangeTheme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(currentUser);
  const [saving, setSaving] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState(currentUser.avatarUrl);
  const [avatarSrc, setAvatarSrc] = useState(currentUser.avatarUrl || getFallbackAvatar(currentUser.name));
  const [deletionDateInput, setDeletionDateInput] = useState('');
  const [settingsPanel, setSettingsPanel] = useState<'photo' | 'security' | null>(null);
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [switchAccountOpen, setSwitchAccountOpen] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccountEntry[]>([]);
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
        switchAccount: 'Switch profile',
        savedAccounts: 'Saved accounts',
        noSavedAccounts: 'No saved accounts yet.',
        useThisAccount: 'Use this account',
        uploadFile: 'Upload file',
        applyPhoto: 'Apply photo',
        scheduledDeletion: 'Scheduled deletion',
        profilePictureHint:
          'Paste an image URL or upload a file (JPG, PNG, WEBP, max 4MB).',
        passwordSection: 'Password',
        currentPasswordLabel: 'Current password',
        newPasswordLabel: 'New password',
        confirmPasswordLabel: 'Confirm new password',
        changePasswordBtn: 'Change password',
        pwdNeedCurrent: 'Enter your current password.',
        pwdTooShort: 'New password must be at least 6 characters.',
        pwdMismatch: 'The new passwords do not match.',
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
        switchAccount: 'Cambiar de perfil',
        savedAccounts: 'Cuentas guardadas',
        noSavedAccounts: 'Aún no tienes cuentas guardadas.',
        useThisAccount: 'Usar esta cuenta',
        uploadFile: 'Subir archivo',
        applyPhoto: 'Aplicar foto',
        scheduledDeletion: 'Borrado programado',
        profilePictureHint:
          'Pega una URL de imagen o sube un archivo (JPG, PNG, WEBP, máx. 4MB).',
        passwordSection: 'Contraseña',
        currentPasswordLabel: 'Contraseña actual',
        newPasswordLabel: 'Nueva contraseña',
        confirmPasswordLabel: 'Repite la nueva contraseña',
        changePasswordBtn: 'Cambiar contraseña',
        pwdNeedCurrent: 'Introduce tu contraseña actual.',
        pwdTooShort: 'La nueva contraseña debe tener al menos 6 caracteres.',
        pwdMismatch: 'Las nuevas contraseñas no coinciden.',
        logout: 'Cerrar sesión',
      };

  useEffect(() => {
    setFormData(currentUser);
    setAvatarDraft(currentUser.avatarUrl);
    setAvatarSrc(currentUser.avatarUrl || getFallbackAvatar(currentUser.name));
  }, [currentUser]);

  useEffect(() => {
    if (section !== 'settings') {
      setPasswordCurrent('');
      setPasswordNew('');
      setPasswordConfirm('');
    }
  }, [section]);

  const trip = useMemo(() => deriveTripDates(currentUser), [currentUser]);

  const loadSavedAccounts = () => {
    try {
      const raw = localStorage.getItem('tm_saved_accounts');
      if (!raw) {
        setSavedAccounts([]);
        return;
      }
      const parsed = JSON.parse(raw) as SavedAccountEntry[];
      const safe = Array.isArray(parsed) ? parsed : [];
      setSavedAccounts(safe.filter((entry) => entry?.profile?.id));
    } catch {
      setSavedAccounts([]);
    }
  };

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

  const handleChangePassword = async () => {
    if (!passwordCurrent.trim()) {
      showToast(t.pwdNeedCurrent, 'error');
      return;
    }
    if (!passwordNew || passwordNew.length < 6) {
      showToast(t.pwdTooShort, 'error');
      return;
    }
    if (passwordNew !== passwordConfirm) {
      showToast(t.pwdMismatch, 'error');
      return;
    }
    setPasswordBusy(true);
    try {
      const res = await changePassword(currentUser.id, passwordCurrent, passwordNew);
      showToast(res.message, 'success');
      setPasswordCurrent('');
      setPasswordNew('');
      setPasswordConfirm('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No se pudo cambiar la contraseña.';
      showToast(msg, 'error');
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleOpenSwitchAccount = () => {
    loadSavedAccounts();
    setSwitchAccountOpen(true);
  };

  if (isEditing) {
    return (
      <div className={`p-6 max-w-2xl mx-auto min-h-screen pb-24 lg:pb-10 lg:rounded-3xl lg:border lg:shadow-sm ${
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

  const appearanceBlock = (
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
  );

  return (
    <div className={`p-6 max-w-3xl mx-auto min-h-screen pb-24 lg:pb-10 lg:rounded-3xl lg:border lg:shadow-sm ${
      theme === 'dark'
        ? 'bg-slate-900 text-gray-100 lg:border-slate-700'
        : 'bg-white lg:border-gray-100'
    }`}>
      {section === 'profile' && (
        <div className="text-center mb-6 mt-6">
          <div className="relative inline-block">
            <img
              src={avatarSrc}
              className="w-28 h-28 rounded-full border-4 border-travel-secondary object-cover"
              alt="Perfil"
              onError={() => setAvatarSrc(getFallbackAvatar(currentUser.name))}
            />
          </div>
          <h2 className={`text-2xl font-bold mt-4 ${theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'}`}>
            {currentUser.name}, {currentUser.age}
          </h2>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>{currentUser.country}</p>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>{currentUser.email}</p>
        </div>
      )}

      {section === 'settings' && (
        <div className="mb-8 mt-6 text-center">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'}`}>{t.settings}</h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.email}</p>
        </div>
      )}

      {section === 'profile' && (
        <h3 className={`text-sm font-semibold mb-6 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
          {t.profile}
        </h3>
      )}

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

      {section === 'profile' && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          <div className="lg:col-span-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button
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
              className="px-6"
            >
              <Pencil size={16} /> {t.editProfile}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="px-6 border-travel-primary/40 text-travel-dark"
              onClick={() => setSettingsPanel('photo')}
            >
              <ImageIcon size={16} /> {t.profilePicture}
            </Button>
          </div>
          <div className={`${cardClass} p-4 rounded-xl`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${headingClass}`}>{t.nextDestination}</h3>
            <div className={`flex items-center gap-2 font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'}`}>
              <Plane size={18} className="text-travel-primary shrink-0" />
              <span>
                {currentUser.destination}
                {(trip.start || trip.end) && (
                  <span className={`block text-sm font-normal mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {trip.start || '—'} → {trip.end || '—'}
                  </span>
                )}
                {!trip.start && !trip.end && currentUser.dates && (
                  <span className={`block text-sm font-normal mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{currentUser.dates}</span>
                )}
              </span>
            </div>
          </div>

          <div className={`${cardClass} p-4 rounded-xl`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${headingClass}`}>{t.budget}</h3>
            <p className={`font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'}`}>{currentUser.budget}</p>
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

          <div className="lg:col-span-2 mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onLogout}
              className={`w-full rounded-xl py-3 font-medium transition-colors ${
                theme === 'dark'
                  ? 'text-red-400 hover:bg-red-950/40'
                  : 'text-red-500 hover:bg-red-50'
              }`}
            >
              {t.logout}
            </button>
            <button
              type="button"
              onClick={handleOpenSwitchAccount}
              className={`w-full rounded-xl py-3 font-medium transition-colors ${
                theme === 'dark' ? 'text-gray-100 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t.switchAccount}
            </button>
          </div>
        </div>
      )}

      {section === 'settings' && (
        <div className="space-y-4">
          <div>{appearanceBlock}</div>

          <div className={`${cardClass} p-4 rounded-xl space-y-3`}>
            <h3 className={`text-xs font-bold uppercase mb-1 flex items-center gap-2 ${headingClass}`}>
              <KeyRound size={16} className="text-travel-primary shrink-0" />
              {t.passwordSection}
            </h3>
            <div className="space-y-2">
              <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor="pwd-current">
                {t.currentPasswordLabel}
              </label>
              <input
                id="pwd-current"
                type="password"
                autoComplete="current-password"
                value={passwordCurrent}
                onChange={(e) => setPasswordCurrent(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor="pwd-new">
                {t.newPasswordLabel}
              </label>
              <input
                id="pwd-new"
                type="password"
                autoComplete="new-password"
                value={passwordNew}
                onChange={(e) => setPasswordNew(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor="pwd-confirm">
                {t.confirmPasswordLabel}
              </label>
              <input
                id="pwd-confirm"
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={inputClass}
              />
            </div>
            <Button type="button" fullWidth onClick={handleChangePassword} disabled={passwordBusy || saving}>
              {passwordBusy ? t.saving : t.changePasswordBtn}
            </Button>
          </div>

          <div className={`${cardClass} p-4 rounded-xl`}>
            <button
              type="button"
              onClick={() => setSettingsPanel('security')}
              className={`w-full text-left p-3 rounded-xl border flex items-center gap-2 ${
                theme === 'dark' ? 'border-red-900/40 hover:bg-red-900/20 text-red-300' : 'border-red-200 hover:bg-red-50 text-red-500'
              }`}
            >
              <Trash2 size={16} />
              <span className="font-semibold">{t.accountSecurity}</span>
            </button>
          </div>
        </div>
      )}

      {settingsPanel && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-5 space-y-3 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                {settingsPanel === 'photo' ? t.profilePicture : t.accountSecurity}
              </h3>
              <button
                type="button"
                onClick={() => setSettingsPanel(null)}
                className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft size={18} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            </div>

            {settingsPanel === 'photo' && (
              <>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t.profilePictureHint}</p>
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
              </>
            )}

            {settingsPanel === 'security' && (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {switchAccountOpen && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/55 p-4">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-5 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{t.savedAccounts}</h3>
              <button
                type="button"
                onClick={() => setSwitchAccountOpen(false)}
                className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft size={18} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {savedAccounts.length === 0 && (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.noSavedAccounts}</p>
              )}
              {savedAccounts.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-xl border p-3 flex items-center justify-between gap-3 ${
                    theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={entry.profile.avatarUrl || getFallbackAvatar(entry.profile.name)}
                      alt={entry.profile.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{entry.profile.name}</p>
                      <p className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{entry.profile.email}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs py-2 px-3"
                    onClick={() => {
                      onSwitchAccount(entry.profile);
                      setSwitchAccountOpen(false);
                    }}
                  >
                    {t.useThisAccount}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
