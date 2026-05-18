import React, { useEffect, useState } from 'react';
import { UserProfile, Itinerary, LanguageCode, ThemeMode } from '../types';
import { generateItinerary } from '../services/aiService';
import { Button } from './Button';
import { TripDayCard } from './TripDayCard';
import { Map, Sparkles, Share2, Compass, CalendarDays, Route } from 'lucide-react';

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
        emptyHint: 'Pick duration, tastes and vibe — we map your days.',
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
        tapDay: 'Tap a day to explore maps and hidden gems',
        aboutPlace: 'About this place',
        openMaps: 'Open in Google Maps',
        mapsPreview: 'Map preview',
        dayLabel: 'Day',
        daysCount: 'days planned',
        destination: 'Destination',
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
        emptyHint: 'Elige días, gustos y estilo — nosotros trazamos la ruta.',
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
        tapDay: 'Toca un día para explorar mapas y rincones',
        aboutPlace: 'Sobre el lugar',
        openMaps: 'Abrir en Google Maps',
        mapsPreview: 'Vista del mapa',
        dayLabel: 'Día',
        daysCount: 'días planificados',
        destination: 'Destino',
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

  const pageBg = isDark
    ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
    : 'bg-gradient-to-b from-travel-light via-white to-travel-secondary/20';

  return (
    <div className={`tm-view-surface p-4 sm:p-6 max-w-3xl mx-auto mb-24 lg:mb-8 lg:py-8 min-h-[60vh] ${pageBg}`}>
      {/* Hero planificador */}
      <div
        className={`relative mb-8 overflow-hidden rounded-[1.75rem] p-6 sm:p-8 shadow-2xl
          ${isDark ? 'shadow-black/40' : 'shadow-travel-primary/25'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-travel-primary via-travel-accent to-travel-dark" />
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-travel-secondary/30 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:20px_20px]" aria-hidden />

        <div className="relative z-10">
          <div className="flex items-start gap-3 mb-3">
            <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 text-white shadow-inner">
              <Compass size={22} strokeWidth={2} />
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                {t.title}
              </h2>
              <p className="text-sm text-white/85 mt-1 max-w-md leading-relaxed">{t.subtitle}</p>
            </div>
          </div>

          {!itinerary && (
            <div className="grid gap-4 mt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/12 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/20 shadow-lg">
                  <label className="flex items-center gap-2 text-xs font-bold mb-3 uppercase tracking-widest text-travel-secondary">
                    <CalendarDays size={14} />
                    {t.duration}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                      style={sliderStyle}
                      className="w-full h-2.5 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-travel-secondary
                      [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg
                      [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-travel-secondary [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white"
                    />
                    <span className="font-extrabold text-3xl w-10 tabular-nums text-white drop-shadow-md">
                      {duration}
                    </span>
                  </div>
                </div>

                <div className="bg-white/12 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/20 shadow-lg space-y-3 sm:col-span-2 lg:col-span-1">
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-travel-secondary">
                    <Route size={14} />
                    {t.preferences}
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <label className="space-y-1.5">
                      <span className="block text-[11px] font-medium text-white/80">{t.localityCountry}</span>
                      <input
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full rounded-xl bg-white/95 text-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-travel-secondary font-medium"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="block text-[11px] font-medium text-white/80">{t.food}</span>
                      <select
                        value={foodPreference}
                        onChange={(e) => setFoodPreference(e.target.value)}
                        className="w-full rounded-xl bg-white/95 text-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-travel-secondary"
                      >
                        <option>{t.local}</option>
                        <option>{t.international}</option>
                        <option>Fusion</option>
                        <option>Street food</option>
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="block text-[11px] font-medium text-white/80">{t.price}</span>
                      <select
                        value={pricePreference}
                        onChange={(e) => setPricePreference(e.target.value as 'Bajo' | 'Medio' | 'Alto')}
                        className="w-full rounded-xl bg-white/95 text-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-travel-secondary"
                      >
                        <option value="Bajo">{t.budgetFriendly}</option>
                        <option value="Medio">{t.balanced}</option>
                        <option value="Alto">{t.premium}</option>
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="block text-[11px] font-medium text-white/80">{t.pace}</span>
                      <select
                        value={pacePreference}
                        onChange={(e) => setPacePreference(e.target.value)}
                        className="w-full rounded-xl bg-white/95 text-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-travel-secondary"
                      >
                        <option>{t.relaxed}</option>
                        <option>{t.explorer}</option>
                        <option>{t.intense}</option>
                      </select>
                    </label>
                    <label className="space-y-1.5 sm:col-span-2">
                      <span className="block text-[11px] font-medium text-white/80">{t.vibe}</span>
                      <select
                        value={vibePreference}
                        onChange={(e) => setVibePreference(e.target.value)}
                        className="w-full rounded-xl bg-white/95 text-gray-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-travel-secondary"
                      >
                        <option>{t.cultural}</option>
                        <option>{t.adventure}</option>
                        <option>{t.nightlife}</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                fullWidth
                disabled={loading}
                className="mt-1 !py-4 rounded-2xl bg-travel-secondary !text-travel-dark font-bold text-base
                  hover:!bg-white hover:shadow-xl hover:shadow-black/15 border-none shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="animate-spin" size={20} /> {t.generating}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={20} /> {t.generate}
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {itinerary && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Resumen del viaje */}
          <div
            className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border backdrop-blur-sm
              ${isDark
                ? 'bg-slate-800/60 border-slate-700'
                : 'bg-white/80 border-travel-primary/20 shadow-md shadow-travel-primary/10'
              }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-travel-primary to-travel-accent text-white shadow-md">
                <Map size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-travel-accent">
                  {t.destination}
                </p>
                <h3 className={`text-lg font-bold truncate ${isDark ? 'text-white' : 'text-travel-dark'}`}>
                  {itinerary.destination}
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {itinerary.days.length} {t.daysCount}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors
                ${isDark
                  ? 'bg-travel-accent/20 text-travel-secondary hover:bg-travel-accent hover:text-white'
                  : 'bg-travel-primary/15 text-travel-accent hover:bg-travel-accent hover:text-white'
                }`}
            >
              <Share2 size={16} /> {t.share}
            </button>
          </div>

          <p className={`text-sm text-center px-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {t.tapDay}
          </p>

          <div className="space-y-4">
            {itinerary.days.map((day, index) => (
              <TripDayCard
                key={day.day}
                day={day}
                destination={itinerary.destination}
                isDark={isDark}
                isExpanded={expandedDays.has(day.day)}
                onToggle={() => toggleDay(day.day)}
                bannerLocation={day.activities[0]?.location}
                index={index}
                t={t}
              />
            ))}
          </div>

          <Button
            onClick={() => setItinerary(null)}
            variant="outline"
            fullWidth
            className={`!rounded-2xl !py-3.5 font-semibold transition-all
              ${isDark ? '!border-slate-600 hover:!bg-slate-800' : '!border-travel-primary/30 hover:!bg-travel-secondary/30'}`}
          >
            {t.newRoute}
          </Button>
        </div>
      )}

      {!itinerary && !loading && (
        <div
          className={`relative text-center p-10 sm:p-12 rounded-3xl border overflow-hidden
            ${isDark
              ? 'bg-slate-900/80 border-slate-700'
              : 'bg-white/90 border-travel-primary/20 shadow-lg shadow-travel-primary/10'
            }`}
        >
          <div
            className="absolute inset-0 opacity-40 bg-gradient-to-br from-travel-primary/20 via-transparent to-travel-accent/20"
            aria-hidden
          />
          <div className="relative">
            <span
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto
                ${isDark ? 'bg-slate-800 text-travel-primary' : 'bg-travel-secondary/50 text-travel-accent'}`}
            >
              <Map className="w-8 h-8" strokeWidth={1.5} />
            </span>
            <p className={`font-semibold text-base mb-1 ${isDark ? 'text-gray-200' : 'text-travel-dark'}`}>
              {t.empty}
            </p>
            <p className={`text-sm max-w-xs mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {t.emptyHint}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
