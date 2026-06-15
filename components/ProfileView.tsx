import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile, LanguageCode, ThemeMode } from '../types';
import {
  BookOpen,
  Save,
  Globe2,
  ChevronLeft,
  Moon,
  SunMedium,
  Trash2,
  CalendarClock,
  Pencil,
  Ban,
  KeyRound,
  Upload,
  Sparkles,
  Paintbrush,
  SlidersHorizontal,
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
import type { BlockedUserEntry } from '../services/blockedUsers';
import {
  readBlockedUsers,
  removeBlockedUser,
  purgeDirectChatsWithPeer,
  BLOCKLIST_CHANGED_EVENT,
} from '../services/blockedUsers';
import { getProfileAvatarFrame } from '../utils/avatarBorder';
import { PROFILE_COVER_OPTIONS, profileCoverSectionClass } from '../utils/profileCover';
import { UI_ACCENT_PRESETS } from '../utils/personalization';

const AVATAR_RING_PRESETS: { color: string; key: string }[] = [
  { key: 'brand', color: '' },
  { key: 'sunset', color: '#f97316' },
  { key: 'violet', color: '#a855f7' },
  { key: 'lagoon', color: '#06b6d4' },
  { key: 'rose', color: '#ec4899' },
  { key: 'jade', color: '#22c55e' },
  { key: 'gold', color: '#eab308' },
  { key: 'ember', color: '#ef4444' },
  { key: 'slate', color: '#64748b' },
];

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

const takeFirstGrapheme = (raw?: string) => {
  const t = (raw || '').trim();
  if (!t) return '';
  return [...t][0] ?? '';
};

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
  const [avatarSrc, setAvatarSrc] = useState(currentUser.avatarUrl || getFallbackAvatar(currentUser.name));
  const [deletionDateInput, setDeletionDateInput] = useState('');
  const [settingsPanel, setSettingsPanel] = useState<'security' | null>(null);
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [switchAccountOpen, setSwitchAccountOpen] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedAccountEntry[]>([]);
  const [blockedList, setBlockedList] = useState<BlockedUserEntry[]>([]);
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
        nextDestination: 'Subject / Exam',
        budget: 'Difficulty',
        bio: 'Bio',
        interests: 'Interests',
        tripDates: 'Study period',
        outbound: 'Start',
        return: 'End',
        appearanceLanguage: 'Appearance and language',
        language: 'Language',
        darkMode: 'Dark mode',
        activate: 'Enable',
        deactivate: 'Disable',
        accountSecurity: 'Account and security',
        switchAccount: 'Switch profile',
        savedAccounts: 'Saved accounts',
        noSavedAccounts: 'No saved accounts yet.',
        useThisAccount: 'Use this account',
        scheduledDeletion: 'Scheduled deletion',
        pickPhoto: 'Choose photo',
        avatarLookTitle: 'Your look',
        avatarLookSubtitle: 'Upload a photo, frame, and vibe — save when you are ready.',
        ringFrameLabel: 'Frame color',
        ringBrand: 'Brand',
        ringCustom: 'Custom color',
        ringStyleLabel: 'Frame style',
        ringStyleSolid: 'Solid',
        ringStyleDouble: 'Double',
        ringStyleGlow: 'Glow',
        saveAvatarHint: 'Photo, frame, and vibe are saved with “Save changes”.',
        vibeSectionTitle: 'Your profile vibe',
        vibeSectionSubtitle: 'Backdrop, a short line, and a fun emoji next to your name.',
        profileBackdropLabel: 'Header backdrop',
        profileTaglineLabel: 'Tagline under your name',
        profileTaglinePlaceholder: 'e.g. CS Major · coffee & algorithms',
        profileEmojiLabel: 'Emoji badge',
        profileEmojiPlaceholder: '🎓',
        passwordSection: 'Password',
        currentPasswordLabel: 'Current password',
        newPasswordLabel: 'New password',
        confirmPasswordLabel: 'Confirm new password',
        changePasswordBtn: 'Change password',
        pwdNeedCurrent: 'Enter your current password.',
        pwdTooShort: 'New password must be at least 6 characters.',
        pwdMismatch: 'The new passwords do not match.',
        logout: 'Log out',
        blockedAccounts: 'Blocked accounts',
        blockedAccountsHint: 'These students cannot message you. You can unblock them or delete the saved chat only.',
        noBlocked: 'No blocked accounts.',
        unblock: 'Unblock',
        deleteChat: 'Delete chat',
        chatRemoved: 'Chat removed.',
        unblockedOk: 'User unblocked.',
        globalUiTitle: 'Whole app look',
        globalUiSubtitle: 'Accent for buttons and your bubbles, larger text, and bubble shape — saved with your profile.',
        accentLabel: 'Accent color',
        accentCustomHex: 'Custom hex',
        fontScaleLabel: 'Text size',
        fontNormal: 'Normal',
        fontLarge: 'Large',
        bubbleStyleLabel: 'Chat bubble shape',
        bubbleClassic: 'Classic',
        bubblePill: 'Pill',
        bubbleMinimal: 'Minimal',
      }
    : {
        profile: 'Perfil',
        settings: 'Configuración',
        editProfile: 'Editar perfil',
        saveChanges: 'Guardar cambios',
        saving: 'Guardando...',
        nextDestination: 'Asignatura / Examen',
        budget: 'Dificultad',
        bio: 'Bio',
        interests: 'Intereses',
        tripDates: 'Periodo de estudio',
        outbound: 'Inicio',
        return: 'Fin',
        appearanceLanguage: 'Apariencia e idioma',
        language: 'Idioma',
        darkMode: 'Modo oscuro',
        activate: 'Activar',
        deactivate: 'Desactivar',
        accountSecurity: 'Cuenta y seguridad',
        switchAccount: 'Cambiar de perfil',
        savedAccounts: 'Cuentas guardadas',
        noSavedAccounts: 'Aún no tienes cuentas guardadas.',
        useThisAccount: 'Usar esta cuenta',
        scheduledDeletion: 'Borrado programado',
        pickPhoto: 'Elegir foto',
        avatarLookTitle: 'Tu look',
        avatarLookSubtitle: 'Sube foto, marco y estilo; todo se guarda al final.',
        ringFrameLabel: 'Color del marco',
        ringBrand: 'Marca',
        ringCustom: 'Color libre',
        ringStyleLabel: 'Estilo del marco',
        ringStyleSolid: 'Sólido',
        ringStyleDouble: 'Doble',
        ringStyleGlow: 'Brillo',
        saveAvatarHint: 'Foto, marco y vibe se guardan con «Guardar cambios».',
        vibeSectionTitle: 'Tu vibe de perfil',
        vibeSectionSubtitle: 'Fondo del encabezado, una frase corta y un emoji junto al nombre.',
        profileBackdropLabel: 'Fondo del perfil',
        profileTaglineLabel: 'Frase bajo tu nombre',
        profileTaglinePlaceholder: 'ej. Estudiante de Medicina · café y lofi',
        profileEmojiLabel: 'Emoji junto al nombre',
        profileEmojiPlaceholder: '🎓',
        passwordSection: 'Contraseña',
        currentPasswordLabel: 'Contraseña actual',
        newPasswordLabel: 'Nueva contraseña',
        confirmPasswordLabel: 'Repite la nueva contraseña',
        changePasswordBtn: 'Cambiar contraseña',
        pwdNeedCurrent: 'Introduce tu contraseña actual.',
        pwdTooShort: 'La nueva contraseña debe tener al menos 6 caracteres.',
        pwdMismatch: 'Las nuevas contraseñas no coinciden.',
        logout: 'Cerrar sesión',
        blockedAccounts: 'Cuentas bloqueadas',
        blockedAccountsHint: 'Estos estudiantes no pueden escribirte. Puedes desbloquearlos o borrar solo el chat guardado.',
        noBlocked: 'No tienes cuentas bloqueadas.',
        unblock: 'Desbloquear',
        deleteChat: 'Eliminar chat',
        chatRemoved: 'Chat eliminado.',
        unblockedOk: 'Usuario desbloqueado.',
        globalUiTitle: 'Experiencia global',
        globalUiSubtitle: 'Acento en botones y tus burbujas, texto más grande y forma del chat — se guarda con el perfil.',
        accentLabel: 'Color de acento',
        accentCustomHex: 'Hex libre',
        fontScaleLabel: 'Tamaño del texto',
        fontNormal: 'Normal',
        fontLarge: 'Grande',
        bubbleStyleLabel: 'Forma de las burbujas',
        bubbleClassic: 'Clásico',
        bubblePill: 'Pastilla',
        bubbleMinimal: 'Minimal',
      };

  useEffect(() => {
    setFormData(currentUser);
    setAvatarSrc(currentUser.avatarUrl || getFallbackAvatar(currentUser.name));
  }, [currentUser]);

  useEffect(() => {
    if (section !== 'settings') {
      setPasswordCurrent('');
      setPasswordNew('');
      setPasswordConfirm('');
    }
  }, [section]);

  useEffect(() => {
    if (section !== 'settings') return;
    const refresh = () => setBlockedList(readBlockedUsers(currentUser.id));
    refresh();
    window.addEventListener(BLOCKLIST_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(BLOCKLIST_CHANGED_EVENT, refresh);
  }, [section, currentUser.id]);

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
        avatarBorderColor: (formData.avatarBorderColor || '').trim(),
        avatarRingStyle:
          formData.avatarRingStyle === 'double' || formData.avatarRingStyle === 'glow' ? formData.avatarRingStyle : '',
        profileCoverId: (formData.profileCoverId || 'default').trim() || 'default',
        profileMoodEmoji: takeFirstGrapheme(formData.profileMoodEmoji),
        profileTagline: (formData.profileTagline || '').trim().slice(0, 48),
        uiAccentColor: (formData.uiAccentColor || '').trim(),
        fontScale: formData.fontScale === 'large' ? 'large' : '',
        chatBubbleStyle:
          formData.chatBubbleStyle === 'pill' || formData.chatBubbleStyle === 'minimal' ? formData.chatBubbleStyle : '',
        language: formData.language,
        theme: formData.theme,
      });
      onUpdateUser(updated);
      setFormData(updated);
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
    setIsEditing(false);
  };

  const handleEditProfileAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(language === 'en' ? 'Pick a valid image file.' : 'Selecciona un archivo de imagen válido.', 'error');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast(language === 'en' ? 'Image too large (max 4MB).' : 'La imagen es demasiado grande (máximo 4MB).', 'error');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setFormData((prev) => ({ ...prev, avatarUrl: dataUrl }));
      showToast(language === 'en' ? 'Photo updated in the form. Save to keep it.' : 'Foto actualizada en el formulario. Guarda para conservarla.', 'info');
    } catch {
      showToast(language === 'en' ? 'Could not read the file.' : 'No se pudo leer el archivo.', 'error');
    }
    e.target.value = '';
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

  const handleUnblockUser = (userId: string) => {
    removeBlockedUser(currentUser.id, userId);
    setBlockedList(readBlockedUsers(currentUser.id));
    showToast(t.unblockedOk, 'success');
  };

  const handleDeleteChatWithUser = (userId: string) => {
    purgeDirectChatsWithPeer(currentUser.id, userId);
    showToast(t.chatRemoved, 'info');
  };

  const editAvatarFrame = getProfileAvatarFrame(formData.avatarBorderColor, formData.avatarRingStyle);
  const ringCustomValue = formData.avatarBorderColor?.trim() || '#f59e0b';

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
          <div
            className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${
              theme === 'dark'
                ? 'border-slate-600/80 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950'
                : 'border-travel-primary/15 bg-gradient-to-br from-amber-50/90 via-white to-sky-50/80'
            }`}
          >
            <div
              className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl ${
                theme === 'dark' ? 'bg-fuchsia-600/25' : 'bg-travel-primary/25'
              }`}
              aria-hidden
            />
            <div
              className={`pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full blur-3xl ${
                theme === 'dark' ? 'bg-cyan-500/20' : 'bg-sky-300/30'
              }`}
              aria-hidden
            />

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm bg-white/70 text-travel-dark border-travel-primary/20 dark:bg-slate-800/90 dark:text-amber-100/90 dark:border-slate-600">
                <Sparkles size={14} className="text-travel-primary shrink-0" />
                {t.avatarLookTitle}
              </div>
              <p className={`mt-2 max-w-sm text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.avatarLookSubtitle}
              </p>

              <div className="relative mt-6">
                <div
                  className={`absolute inset-0 -m-3 rounded-full blur-xl opacity-70 ${
                    formData.avatarBorderColor?.trim()
                      ? ''
                      : 'bg-gradient-to-tr from-travel-primary/40 to-travel-secondary/50'
                  }`}
                  style={
                    formData.avatarBorderColor?.trim()
                      ? { background: `${formData.avatarBorderColor}55` }
                      : undefined
                  }
                  aria-hidden
                />
                <div className="relative">
                  <img
                    src={formData.avatarUrl}
                    className={`relative z-10 h-32 w-32 rounded-full object-cover shadow-xl ${editAvatarFrame.ringClass}`}
                    style={editAvatarFrame.ringStyle}
                    alt=""
                    onError={() => setFormData((prev) => ({ ...prev, avatarUrl: getFallbackAvatar(prev.name) }))}
                  />
                  <label
                    className={`absolute bottom-0 right-0 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-lg transition hover:scale-105 active:scale-95 ${
                      theme === 'dark' ? 'bg-travel-primary text-white' : 'bg-travel-primary text-white'
                    }`}
                  >
                    <input type="file" accept="image/*" className="sr-only" onChange={handleEditProfileAvatarFile} />
                    <Upload size={18} strokeWidth={2.2} aria-hidden />
                    <span className="sr-only">{t.pickPhoto}</span>
                  </label>
                </div>
              </div>

              <p className={`mt-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t.saveAvatarHint}</p>

              <div className="mt-6 w-full max-w-md">
                <p
                  className={`mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <span className="h-px flex-1 max-w-[4rem] bg-gradient-to-r from-transparent to-current opacity-40" />
                  {t.ringFrameLabel}
                  <span className="h-px flex-1 max-w-[4rem] bg-gradient-to-l from-transparent to-current opacity-40" />
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {AVATAR_RING_PRESETS.map((preset) => {
                    const active =
                      preset.color === ''
                        ? !formData.avatarBorderColor?.trim()
                        : formData.avatarBorderColor?.trim().toLowerCase() === preset.color.toLowerCase();
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        title={preset.color === '' ? t.ringBrand : preset.color}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            avatarBorderColor: preset.color === '' ? '' : preset.color,
                          }))
                        }
                        className={`relative h-10 w-10 rounded-full border-2 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-primary focus-visible:ring-offset-2 ${
                          active
                            ? 'border-travel-dark ring-2 ring-travel-primary ring-offset-2 dark:border-white dark:ring-offset-slate-900'
                            : theme === 'dark'
                              ? 'border-slate-600'
                              : 'border-white shadow-md'
                        }`}
                        style={
                          preset.color
                            ? {
                                background: `linear-gradient(145deg, ${preset.color}, ${preset.color}cc)`,
                                boxShadow: `0 4px 14px -4px ${preset.color}`,
                              }
                            : {
                                background: 'linear-gradient(145deg, #fbbf24, #f97316)',
                              }
                        }
                      >
                        {preset.color === '' && (
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow">
                            TM
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div
                  className={`mt-4 flex items-center justify-center gap-3 rounded-2xl border px-3 py-2 ${
                    theme === 'dark' ? 'border-slate-600 bg-slate-800/60' : 'border-gray-200 bg-white/80'
                  }`}
                >
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.ringCustom}</span>
                  <input
                    type="color"
                    value={ringCustomValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, avatarBorderColor: e.target.value }))}
                    className="h-9 w-14 cursor-pointer overflow-hidden rounded-lg border-0 bg-transparent p-0 shadow-inner"
                    aria-label={t.ringCustom}
                  />
                </div>
                <div className="mt-5 w-full">
                  <p
                    className={`mb-2 text-center text-[10px] font-bold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    {t.ringStyleLabel}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {(
                      [
                        { id: '' as const, label: t.ringStyleSolid },
                        { id: 'double' as const, label: t.ringStyleDouble },
                        { id: 'glow' as const, label: t.ringStyleGlow },
                      ] as const
                    ).map((opt) => {
                      const active =
                        opt.id === ''
                          ? formData.avatarRingStyle !== 'double' && formData.avatarRingStyle !== 'glow'
                          : formData.avatarRingStyle === opt.id;
                      return (
                        <button
                          key={opt.id || 'solid'}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              avatarRingStyle: opt.id,
                            }))
                          }
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                            active
                              ? 'bg-travel-primary text-white shadow-md shadow-travel-primary/30'
                              : theme === 'dark'
                                ? 'bg-slate-800 text-gray-300 ring-1 ring-slate-600 hover:bg-slate-700'
                                : 'bg-white/90 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 sm:p-6 shadow-sm ${
              theme === 'dark' ? 'border-slate-600/80 bg-slate-800/40' : 'border-gray-200/90 bg-white/90'
            }`}
          >
            <div className="mb-4 flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-travel-primary/15 text-travel-primary">
                <Paintbrush size={20} />
              </span>
              <div>
                <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'}`}>{t.vibeSectionTitle}</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t.vibeSectionSubtitle}</p>
              </div>
            </div>

            <p className={`mb-2 text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.profileBackdropLabel}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PROFILE_COVER_OPTIONS.map((opt) => {
                const active = (formData.profileCoverId || 'default') === opt.id;
                const preview = profileCoverSectionClass(opt.id, theme);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, profileCoverId: opt.id }))}
                    className={`group relative overflow-hidden rounded-2xl border-2 p-0 text-left transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-primary ${
                      active
                        ? 'border-travel-primary ring-2 ring-travel-primary/40'
                        : theme === 'dark'
                          ? 'border-slate-600 hover:border-slate-500'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`h-14 w-full ${preview}`} aria-hidden />
                    <span
                      className={`block px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide ${
                        theme === 'dark' ? 'bg-slate-900/85 text-gray-200' : 'bg-white/90 text-gray-700'
                      }`}
                    >
                      {language === 'en' ? opt.labelEn : opt.labelEs}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 space-y-2">
              <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.profileTaglineLabel}</label>
              <input
                type="text"
                value={formData.profileTagline || ''}
                maxLength={48}
                onChange={(e) => setFormData({ ...formData, profileTagline: e.target.value })}
                placeholder={t.profileTaglinePlaceholder}
                className={inputClass}
              />
            </div>

            <div className="mt-3 space-y-2">
              <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.profileEmojiLabel}</label>
              <input
                type="text"
                value={formData.profileMoodEmoji || ''}
                maxLength={8}
                onChange={(e) => setFormData({ ...formData, profileMoodEmoji: e.target.value })}
                placeholder={t.profileEmojiPlaceholder}
                className={`${inputClass} text-center text-2xl tracking-tight`}
              />
            </div>
          </div>

          <div
            className={`rounded-3xl border p-5 sm:p-6 shadow-sm ${
              theme === 'dark' ? 'border-slate-600/80 bg-slate-800/40' : 'border-gray-200/90 bg-white/90'
            }`}
          >
            <div className="mb-4 flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-travel-primary/15 text-travel-primary">
                <SlidersHorizontal size={20} />
              </span>
              <div>
                <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'}`}>{t.globalUiTitle}</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{t.globalUiSubtitle}</p>
              </div>
            </div>

            <p className={`mb-2 text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.accentLabel}</p>
            <div className="flex flex-wrap gap-2">
              {UI_ACCENT_PRESETS.map((preset) => {
                const cur = (formData.uiAccentColor || '').trim();
                const active =
                  preset.hex === '' ? cur === '' : cur.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.key}
                    type="button"
                    title={preset.hex === '' ? t.ringBrand : preset.hex}
                    onClick={() => setFormData((prev) => ({ ...prev, uiAccentColor: preset.hex }))}
                    className={`h-9 min-w-[2.25rem] rounded-full border-2 px-3 text-[10px] font-bold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-travel-primary ${
                      active
                        ? 'border-travel-dark ring-2 ring-travel-primary ring-offset-2 dark:border-white dark:ring-offset-slate-900'
                        : theme === 'dark'
                          ? 'border-slate-600 text-gray-300 hover:bg-slate-700/80'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={
                      preset.hex
                        ? {
                            backgroundColor: `${preset.hex}22`,
                            borderColor: active ? undefined : preset.hex,
                            color: preset.hex,
                          }
                        : undefined
                    }
                  >
                    {preset.hex === '' ? 'TM' : preset.key}
                  </button>
                );
              })}
            </div>
            <div
              className={`mt-3 flex flex-wrap items-center gap-3 rounded-2xl border px-3 py-2 ${
                theme === 'dark' ? 'border-slate-600 bg-slate-800/60' : 'border-gray-200 bg-white/80'
              }`}
            >
              <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.accentCustomHex}</span>
              <input
                type="color"
                value={(formData.uiAccentColor || '').trim() || '#14b8a6'}
                onChange={(e) => setFormData((prev) => ({ ...prev, uiAccentColor: e.target.value }))}
                className="h-9 w-14 cursor-pointer overflow-hidden rounded-lg border-0 bg-transparent p-0 shadow-inner"
                aria-label={t.accentCustomHex}
              />
            </div>

            <p className={`mb-2 mt-5 text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.fontScaleLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: '' as const, label: t.fontNormal },
                  { id: 'large' as const, label: t.fontLarge },
                ] as const
              ).map((opt) => {
                const active = (formData.fontScale === 'large' ? 'large' : '') === opt.id;
                return (
                  <button
                    key={opt.id || 'normal'}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, fontScale: opt.id }))}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? 'bg-travel-primary text-white shadow-md shadow-travel-primary/30'
                        : theme === 'dark'
                          ? 'bg-slate-800 text-gray-300 ring-1 ring-slate-600 hover:bg-slate-700'
                          : 'bg-white/90 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <p className={`mb-2 mt-5 text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.bubbleStyleLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: '' as const, label: t.bubbleClassic },
                  { id: 'pill' as const, label: t.bubblePill },
                  { id: 'minimal' as const, label: t.bubbleMinimal },
                ] as const
              ).map((opt) => {
                const cur = formData.chatBubbleStyle === 'pill' || formData.chatBubbleStyle === 'minimal' ? formData.chatBubbleStyle : '';
                const active = cur === opt.id;
                return (
                  <button
                    key={opt.id || 'classic'}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, chatBubbleStyle: opt.id }))}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? 'bg-travel-primary text-white shadow-md shadow-travel-primary/30'
                        : theme === 'dark'
                          ? 'bg-slate-800 text-gray-300 ring-1 ring-slate-600 hover:bg-slate-700'
                          : 'bg-white/90 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
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
            <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t.nextDestination}</label>
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

  const profileHeaderFrame = getProfileAvatarFrame(currentUser.avatarBorderColor, currentUser.avatarRingStyle);
  const profileCoverClass = profileCoverSectionClass(currentUser.profileCoverId, theme);

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
        <div className={`-mx-6 -mt-2 mb-6 rounded-b-[2rem] px-6 pb-8 pt-8 ${profileCoverClass}`}>
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={avatarSrc}
                className={`w-28 h-28 rounded-full object-cover ${profileHeaderFrame.ringClass}`}
                style={profileHeaderFrame.ringStyle}
                alt="Perfil"
                onError={() => setAvatarSrc(getFallbackAvatar(currentUser.name))}
              />
            </div>
            <h2
              className={`mt-4 flex flex-wrap items-center justify-center gap-2 text-2xl font-bold ${
                theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'
              }`}
            >
              {currentUser.profileMoodEmoji ? (
                <span className="select-none text-3xl leading-none" aria-hidden>
                  {takeFirstGrapheme(currentUser.profileMoodEmoji)}
                </span>
              ) : null}
              <span>
                {currentUser.name}, {currentUser.age}
              </span>
            </h2>
            {currentUser.profileTagline?.trim() ? (
              <p
                className={`mx-auto mt-2 max-w-md text-sm font-medium italic ${
                  theme === 'dark' ? 'text-amber-200/90' : 'text-travel-primary'
                }`}
              >
                {currentUser.profileTagline.trim()}
              </p>
            ) : null}
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{currentUser.country}</p>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1 text-sm`}>{currentUser.email}</p>
          </div>
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
                  profileCoverId: currentUser.profileCoverId || 'default',
                });
                setIsEditing(true);
              }}
              className="px-6"
            >
              <Pencil size={16} /> {t.editProfile}
            </Button>
          </div>
          <div className={`${cardClass} p-4 rounded-xl`}>
            <h3 className={`text-xs font-bold uppercase mb-2 ${headingClass}`}>{t.nextDestination}</h3>
            <div className={`flex items-center gap-2 font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-travel-dark'}`}>
              <BookOpen size={18} className="text-travel-primary shrink-0" />
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
              <Ban size={16} className="text-travel-primary shrink-0" />
              {t.blockedAccounts}
            </h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.blockedAccountsHint}
            </p>
            {blockedList.length === 0 ? (
              <p className={`text-sm ${bodyTextClass}`}>{t.noBlocked}</p>
            ) : (
              <ul className="space-y-2">
                {blockedList.map((entry) => (
                  <li
                    key={entry.userId}
                    className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                      theme === 'dark' ? 'border-slate-700 bg-slate-900/40' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={entry.avatarUrl || getFallbackAvatar(entry.name)}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className={`truncate font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{entry.name}</p>
                        <p className={`truncate text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{entry.userId}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="text-xs py-2"
                        onClick={() => handleDeleteChatWithUser(entry.userId)}
                      >
                        {t.deleteChat}
                      </Button>
                      <Button type="button" className="text-xs py-2" onClick={() => handleUnblockUser(entry.userId)}>
                        {t.unblock}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

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
              <h3 className={`font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{t.accountSecurity}</h3>
              <button
                type="button"
                onClick={() => setSettingsPanel(null)}
                className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
              >
                <ChevronLeft size={18} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            </div>

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
