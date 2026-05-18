import React, { useEffect, useState } from 'react';
import { UserProfile, Itinerary, LanguageCode, ThemeMode } from '../types';
import { generateItinerary } from '../services/aiService';
import { Button } from './Button';
import { TripDayCard } from './TripDayCard';
import { Map, Sparkles, Share2 } from 'lucide-react';

interface ItineraryBuilderProps {
  currentUser: UserProfile;
  language: LanguageCode;
  theme: ThemeMode;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ currentUser, language, theme }) => {
  const isDark = theme === 'dark';
  const t = language === 'en'
    ? {
        title: 'AI Planner',
        subtitle: `Create the perfect trip to ${currentUser.destination} based on your preferences.`,
        duration: 'Duration (days)',
        generating: 'Generating...',
        generate: 'Generate Route',
        yourItinerary: 'Your Itinerary',
        share: 'Share',
        newRoute: 'Generate New Route',
        empty: 'Configure your trip and let AI plan it for you.',
        preferences: 'Trip Preferences',
        localityCountry: 'Locality / Country',
        food: 'Food',
        price: 'Price',
        pace: 'Pace',
        vibe: 'Travel Vibe',
        budgetFriendly: 'Budget friendly',
        balanced: 'Balanced',
        premium: 'Premium',
        relaxed: 'Relaxed',
        explorer: 'Explorer',
        intense: 'Intense',
        cultural: 'Cultural',
        adventure: 'Adventure',
        nightlife: 'Nightlife',
        local: 'Local',
        international: 'International',
        activities: 'activities',
        tapDay: 'Tap a day for map details and place info',
        aboutPlace: 'About this place',
        openMaps: 'Open in Google Maps',
        mapsPreview: 'Map preview',
      }
    : {
        title: 'Planificador IA',
        subtitle: `Crea el viaje perfecto a ${currentUser.destination} basado en tus gustos.`,
        duration: 'Duración (días)',
        generating: 'Generando...',
        generate: 'Generar Ruta',
        yourItinerary: 'Tu Itinerario',
        share: 'Compartir',
        newRoute: 'Generar Nueva Ruta',
        empty: 'Configura tu viaje y deja que la IA planifique por ti.',
        preferences: 'Preferencias del viaje',
        localityCountry: 'Localidad / País',
        food: 'Comida',
        price: 'Precio',
        pace: 'Ritmo',
        vibe: 'Estilo de viaje',
        budgetFriendly: 'Económico',
        balanced: 'Equilibrado',
        premium: 'Premium',
        relaxed: 'Relajado',
        explorer: 'Explorador',
        intense: 'Intenso',
        cultural: 'Cultural',
        adventure: 'Aventura',
        nightlife: 'Vida nocturna',
        local: 'Local',
        international: 'Internacional',
        activities: 'actividades',
        tapDay: 'Toca un día para ver mapas y detalle de cada sitio',
        aboutPlace: 'Sobre el lugar',
        openMaps: 'Abrir en Google Maps',
        mapsPreview: 'Vista del mapa',
      };
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itinerary?.days.length) {
      setExpandedDays(new Set([itinerary.days[0].day]));
    } else {
      setExpandedDays(new Set());
    }
  }, [itinerary?.id]);

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNum)) next.delete(dayNum);
      else next.add(dayNum);
      return next;
    });
  };
  const [duration, setDuration] = useState(3);
  const sliderProgress = 100 * ((duration - 1) / 13);
  const [locality, setLocality] = useState(currentUser.destination);
  const [foodPreference, setFoodPreference] = useState(language === 'en' ? 'Local' : 'Local');
  const [pricePreference, setPricePreference] = useState<'Bajo' | 'Medio' | 'Alto'>(currentUser.budget);
  const [pacePreference, setPacePreference] = useState(language === 'en' ? 'Explorer' : 'Explorador');
  const [vibePreference, setVibePreference] = useState(language === 'en' ? 'Cultural' : 'Cultural');

  const sliderTrackRest = isDark ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.35)';
  const sliderStyle = {
    background: `linear-gradient(90deg, #70a0af ${sliderProgress}%, ${sliderTrackRest} ${sliderProgress}%)`,
  } as React.CSSProperties;

  const removeRepeatedActivities = (data: Itinerary): Itinerary => {
    const globalSeen = new Set<string>();
    return {
      ...data,
      days: data.days.map((day) => {
        const activities = day.activities.filter((act) => {
          const key = `${act.time}-${act.location}-${act.description}`.toLowerCase().trim();
          if (globalSeen.has(key)) return false;
          globalSeen.add(key);
          return true;
        });
        return { ...day, activities };
      }),
    };
  };

  const handleGenerate = async () => {
    setLoading(true);
    const selectedInterests = Array.from(
      new Set([
        ...currentUser.interests,
        foodPreference,
        pacePreference,
        vibePreference,
        locality,
      ])
    );
    const result = await generateItinerary(
      locality,
      duration,
      selectedInterests,
      pricePreference
    );
    setItinerary(removeRepeatedActivities(result));
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto mb-24 lg:mb-8 lg:py-8">
      <div className={`mb-6 bg-gradient-to-r from-travel-primary to-travel-accent p-6 rounded-3xl shadow-xl shadow-travel-primary/25 ring-1 ring-white/15 ${isDark ? 'text-gray-100' : 'text-white'}`}>
        <h2 className={`text-2xl font-bold mb-2 drop-shadow-sm ${isDark ? 'text-white' : ''}`}>{t.title}</h2>
        <p className={`mb-4 text-sm drop-shadow-sm ${isDark ? 'text-gray-100/95' : 'opacity-90'}`}>{t.subtitle}</p>

        {!itinerary && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <label className={`block text-xs font-semibold mb-2 uppercase tracking-wide drop-shadow-sm ${isDark ? 'text-gray-100' : 'text-white'}`}>{t.duration}</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  style={sliderStyle}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-300 ease-out
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#70a0af] [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all
                  [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#70a0af]
                  [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                />
                <span className={`font-bold text-xl w-8 tabular-nums drop-shadow-sm ${isDark ? 'text-gray-100' : 'text-white'}`}>{duration}</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wide">{t.preferences}</h4>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="block opacity-90">{t.localityCountry}</span>
                  <input
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full rounded-lg bg-white/80 text-gray-800 px-2 py-2 outline-none focus:ring-2 focus:ring-travel-secondary"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block opacity-90">{t.food}</span>
                  <select
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value)}
                    className="w-full rounded-lg bg-white/80 text-gray-800 px-2 py-2 outline-none focus:ring-2 focus:ring-travel-secondary"
                  >
                    <option>{t.local}</option>
                    <option>{t.international}</option>
                    <option>Fusion</option>
                    <option>Street food</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block opacity-90">{t.price}</span>
                  <select
                    value={pricePreference}
                    onChange={(e) => setPricePreference(e.target.value as 'Bajo' | 'Medio' | 'Alto')}
                    className="w-full rounded-lg bg-white/80 text-gray-800 px-2 py-2 outline-none focus:ring-2 focus:ring-travel-secondary"
                  >
                    <option value="Bajo">{t.budgetFriendly}</option>
                    <option value="Medio">{t.balanced}</option>
                    <option value="Alto">{t.premium}</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block opacity-90">{t.pace}</span>
                  <select
                    value={pacePreference}
                    onChange={(e) => setPacePreference(e.target.value)}
                    className="w-full rounded-lg bg-white/80 text-gray-800 px-2 py-2 outline-none focus:ring-2 focus:ring-travel-secondary"
                  >
                    <option>{t.relaxed}</option>
                    <option>{t.explorer}</option>
                    <option>{t.intense}</option>
                  </select>
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="block opacity-90">{t.vibe}</span>
                  <select
                    value={vibePreference}
                    onChange={(e) => setVibePreference(e.target.value)}
                    className="w-full rounded-lg bg-white/80 text-gray-800 px-2 py-2 outline-none focus:ring-2 focus:ring-travel-secondary"
                  >
                    <option>{t.cultural}</option>
                    <option>{t.adventure}</option>
                    <option>{t.nightlife}</option>
                  </select>
                </label>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              fullWidth
              disabled={loading}
              className="lg:col-span-2 mt-1 bg-travel-secondary text-travel-dark hover:bg-white border-none shadow-none"
            >
              {loading ? (
                <span className="flex items-center gap-2"><Sparkles className="animate-spin" size={18} /> {t.generating}</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles size={18} /> {t.generate}</span>
              )}
            </Button>
          </div>
        )}
      </div>

      {itinerary && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-bold text-travel-dark">{t.yourItinerary}</h3>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.tapDay}</p>
            </div>
            <button type="button" className="text-travel-accent flex items-center gap-1 text-sm font-medium hover:text-travel-primary">
              <Share2 size={16} /> {t.share}
            </button>
          </div>

          <div className="space-y-3">
            {itinerary.days.map((day) => (
              <TripDayCard
                key={day.day}
                day={day}
                destination={itinerary.destination}
                isDark={isDark}
                isExpanded={expandedDays.has(day.day)}
                onToggle={() => toggleDay(day.day)}
                bannerLocation={day.activities[0]?.location}
                t={t}
              />
            ))}
          </div>

          <Button onClick={() => setItinerary(null)} variant="outline" fullWidth>
            {t.newRoute}
          </Button>
        </div>
      )}

      {!itinerary && !loading && (
        <div className={`text-center p-8 border border-dashed rounded-3xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}`}>
          <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{t.empty}</p>
        </div>
      )}
    </div>
  );
};
