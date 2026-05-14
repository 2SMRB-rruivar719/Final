import React, { useMemo, useState } from 'react';
import { Heart, MessageCircle, MapPin, Trash2 } from 'lucide-react';
import { LanguageCode, ThemeMode, UserProfile } from '../types';
import { Button } from './Button';
import { SafeImage } from './SafeImage';
import { readLikedProfiles, removeLikedProfile } from '../services/likedProfiles';

interface LikesViewProps {
  language: LanguageCode;
  theme: ThemeMode;
  onStartChat: (user: UserProfile) => void;
}

export const LikesView: React.FC<LikesViewProps> = ({ language, theme, onStartChat }) => {
  const isDark = theme === 'dark';
  const [list, setList] = useState<UserProfile[]>(() => readLikedProfiles());

  const t = useMemo(
    () =>
      language === 'en'
        ? {
            title: 'Likes',
            subtitle: 'Travelers you liked from Explore. Chat with them anytime.',
            empty: 'You have not liked anyone yet.',
            emptyHint: 'Open Explore and tap the heart on profiles you are interested in.',
            chat: 'Chat',
            remove: 'Remove',
          }
        : {
            title: 'Me gusta',
            subtitle: 'Viajeros a los que diste me gusta en Explorar. Escríbeles cuando quieras.',
            empty: 'Aún no has dado me gusta a nadie.',
            emptyHint: 'Abre Explorar y pulsa el corazón en los perfiles que te interesen.',
            chat: 'Chat',
            remove: 'Quitar',
          },
    [language]
  );

  const handleRemove = (id: string) => {
    removeLikedProfile(id);
    setList(readLikedProfiles());
  };

  return (
    <div className={`px-4 py-6 mb-20 lg:mb-8 lg:px-8 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isDark ? 'bg-slate-800 text-travel-accent' : 'bg-travel-secondary/50 text-travel-primary'
            }`}
          >
            <Heart className="h-6 w-6" fill="currentColor" strokeWidth={1.5} />
          </span>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{t.title}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.subtitle}</p>
          </div>
        </div>

        {list.length === 0 ? (
          <div
            className={`rounded-3xl border p-10 text-center ${
              isDark ? 'border-slate-700 bg-slate-800/60' : 'border-gray-100 bg-white shadow-sm'
            }`}
          >
            <Heart className={`mx-auto mb-4 h-14 w-14 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className={`mb-2 font-semibold ${isDark ? 'text-gray-200' : 'text-travel-dark'}`}>{t.empty}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.emptyHint}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((person) => (
              <li
                key={person.id}
                className={`flex items-center gap-4 rounded-2xl border p-4 ${
                  isDark ? 'border-slate-700 bg-slate-800/80' : 'border-gray-100 bg-white shadow-sm'
                }`}
              >
                <SafeImage
                  src={person.avatarUrl}
                  alt={person.name}
                  fallbackSeed={person.id + person.name}
                  variant="avatar"
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{person.name}</p>
                  <p className={`flex items-center gap-1 truncate text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {person.destination}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs"
                    onClick={() => onStartChat(person)}
                    aria-label={t.chat}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.chat}</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleRemove(person.id)}
                    className={`rounded-xl p-2 transition-colors ${
                      isDark
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-red-400'
                        : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                    }`}
                    title={t.remove}
                    aria-label={t.remove}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
