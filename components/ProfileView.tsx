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
  const [deletionDateInput, setDeletionDateInput] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    setFormData(currentUser);
    setAvatarDraft(currentUser.avatarUrl);
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
      <div className="p-6 max-w-2xl mx-auto bg-white min-h-screen pb-24 lg:pb-10 lg:mt-8 lg:rounded-3xl lg:border lg:border-gray-100 lg:shadow-sm">
        <div className="flex items-center gap-2 mb-6 mt-4">
          <button type="button" onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={22} className="text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-travel-dark">Editar perfil</h2>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={formData.avatarUrl}
                className="w-28 h-28 rounded-full object-cover opacity-90 border-4 border-travel-secondary"
                alt="Perfil"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Camera className="text-gray-800 bg-white/50 p-2 rounded-full w-10 h-10" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">URL de la foto</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Nombre</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Edad</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">País</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Próximo destino</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Fechas del viaje</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Ida</span>
                <input
                  type="date"
                  value={formData.tripStartDate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tripStartDate: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none text-sm"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Vuelta</span>
                <input
                  type="date"
                  value={formData.tripEndDate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, tripEndDate: e.target.value })
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-travel-primary focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} fullWidth className="mt-6" disabled={saving}>
            <Save size={18} /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white min-h-screen pb-24 lg:pb-10 lg:mt-8 lg:rounded-3xl lg:border lg:border-gray-100 lg:shadow-sm">
      <div className="text-center mb-6 mt-6">
        <div className="relative inline-block">
          <img
            src={currentUser.avatarUrl}
            className="w-28 h-28 rounded-full border-4 border-travel-secondary object-cover"
            alt="Perfil"
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
        <h2 className="text-2xl font-bold mt-4 text-travel-dark">
          {currentUser.name}, {currentUser.age}
        </h2>
        <p className="text-gray-500">{currentUser.country}</p>
        <p className="text-gray-500 text-sm mt-1">{currentUser.email}</p>
      </div>

      <div className="flex rounded-2xl bg-gray-100 p-1 mb-6 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'profile' ? 'bg-white shadow text-travel-dark' : 'text-gray-500'
          }`}
        >
          <User size={16} />
          Perfil
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
            activeTab === 'settings' ? 'bg-white shadow text-travel-dark' : 'text-gray-500'
          }`}
        >
          <Settings size={16} />
          Configuración
        </button>
      </div>

      {currentUser.deletionScheduledAt && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="flex items-center gap-2">
            <CalendarClock size={18} />
            Borrado programado: {formatDeletionDate(currentUser.deletionScheduledAt)}
          </span>
          <Button type="button" variant="outline" className="shrink-0 py-1.5 text-xs" onClick={handleCancelDeletion} disabled={saving}>
            Cancelar borrado
          </Button>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Próximo destino</h3>
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

          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Presupuesto</h3>
            <p className="font-medium text-travel-dark">{currentUser.budget}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl lg:col-span-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Bio</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{currentUser.bio}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl lg:col-span-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Intereses</h3>
            <div className="flex flex-wrap gap-2">
              {(currentUser.interests || []).map((i) => (
                <span key={i} className="bg-white px-3 py-1 rounded-full text-sm shadow-sm text-gray-600">
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
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Apariencia e idioma</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <Globe2 size={18} className="text-travel-primary" />
                <span className="font-medium text-sm">Idioma</span>
              </div>
              <button
                type="button"
                onClick={() => onChangeLanguage(language === 'es' ? 'en' : 'es')}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-100"
              >
                {language === 'es' ? 'Español' : 'English'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                {theme === 'dark' ? (
                  <Moon size={18} className="text-travel-primary" />
                ) : (
                  <SunMedium size={18} className="text-travel-primary" />
                )}
                <span className="font-medium text-sm">Modo oscuro</span>
              </div>
              <button
                type="button"
                onClick={() => onChangeTheme(theme === 'dark' ? 'light' : 'dark')}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-100"
              >
                {theme === 'dark' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-1">
              <ImageIcon size={14} />
              Foto de perfil
            </h3>
            <p className="text-xs text-gray-500">Pega una URL de imagen (por ahora sin subida de archivos).</p>
            <input
              type="url"
              value={avatarDraft}
              onChange={(e) => setAvatarDraft(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-travel-primary focus:outline-none"
              placeholder="https://..."
            />
            <Button type="button" variant="outline" fullWidth onClick={handleApplyAvatar} disabled={saving}>
              Aplicar foto
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-red-100">
            <h3 className="text-xs font-bold text-red-400 uppercase flex items-center gap-2 mb-1">
              <Trash2 size={14} />
              Cuenta y seguridad
            </h3>
            <p className="text-xs text-gray-600">
              Puedes borrar la cuenta al instante o programar el borrado (mínimo mañana).
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={deletionDateInput}
                onChange={(e) => setDeletionDateInput(e.target.value)}
                className="flex-1 p-2 border border-gray-200 rounded-xl bg-white text-sm"
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
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};
