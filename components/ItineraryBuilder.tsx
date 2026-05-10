import React, { useState } from 'react';
import { UserProfile, Itinerary, LanguageCode, ThemeMode } from '../types';
import { generateItinerary } from '../services/aiService';
import { Button } from './Button';
import { Map, Clock, MapPin, Sparkles, Share2 } from 'lucide-react';

interface ItineraryBuilderProps {
  currentUser: UserProfile;
  language: LanguageCode;
  theme: ThemeMode;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ currentUser, language, theme }) => {
  const isDark = theme === 'dark';
  const getDayImage = (destination: string, day: number) =>
    `https://source.unsplash.com/1200x800/?${encodeURIComponent(`${destination},travel,landmark`)}&sig=${day}`;
  const getActivityImage = (destination: string, day: number, idx: number, hint: string) =>
    `https://source.unsplash.com/600x420/?${encodeURIComponent(`${destination},${hint},travel`)}&sig=${day * 11 + idx}`;
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
      };
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(3);
  const sliderProgress = 100 * ((duration - 1) / 13);
  const [locality, setLocality] = useState(currentUser.destination);
  const [foodPreference, setFoodPreference] = useState(language === 'en' ? 'Local' : 'Local');
  const [pricePreference, setPricePreference] = useState<'Bajo' | 'Medio' | 'Alto'>(currentUser.budget);
  const [pacePreference, setPacePreference] = useState(language === 'en' ? 'Explorer' : 'Explorador');
  const [vibePreference, setVibePreference] = useState(language === 'en' ? 'Cultural' : 'Cultural');

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
      <div className="mb-6 bg-gradient-to-r from-travel-primary to-travel-accent p-6 rounded-3xl text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="opacity-90 mb-4 text-sm">{t.subtitle}</p>
        
        {!itinerary && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <label className="block text-xs font-medium mb-2 uppercase tracking-wide">{t.duration}</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                  style={{
                    background: `linear-gradient(90deg, #111827 ${sliderProgress}%, rgba(255,255,255,0.3) ${sliderProgress}%)`,
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-300 ease-out
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all
                  [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black
                  [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                />
                <span className="font-bold text-xl w-8">{duration}</span>
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
           <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold text-travel-dark">{t.yourItinerary}</h3>
             <button className="text-travel-accent flex items-center gap-1 text-sm font-medium hover:text-travel-primary">
               <Share2 size={16} /> {t.share}
             </button>
           </div>

          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
             {itinerary.days.map((day) => (
               <div key={day.day} className={`rounded-2xl overflow-hidden shadow-sm border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
                 <div className="relative h-36">
                   <img
                     src={getDayImage(currentUser.destination, day.day)}
                     alt={`${currentUser.destination} day ${day.day}`}
                     className="w-full h-full object-cover"
                     loading="lazy"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                   <div className="absolute bottom-3 left-3 text-white text-xs font-semibold tracking-wide uppercase">
                     {currentUser.destination}
                   </div>
                 </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-travel-primary/20 text-travel-primary font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                      {day.day}
                    </div>
                    <h4 className={`font-bold text-lg ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{day.title}</h4>
                  </div>

                  <div className={`space-y-6 relative pl-5 ml-5 border-l-2 ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                    {day.activities.map((act, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[27px] top-1 w-3 h-3 bg-travel-accent rounded-full border-2 border-white ring-2 ring-gray-50"></div>
                        <div className={`rounded-xl overflow-hidden border ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
                        }`}>
                          <img
                            src={getActivityImage(currentUser.destination, day.day, idx, act.location)}
                            alt={`${currentUser.destination} ${act.location}`}
                            className="w-full h-28 object-cover"
                            loading="lazy"
                          />
                          <div className="p-3">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                              <span className="text-xs font-bold text-travel-accent bg-travel-accent/10 px-2 py-1 rounded w-fit flex items-center gap-1">
                                <Clock size={10} /> {act.time}
                              </span>
                              <div className="flex-1">
                                <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{act.description}</p>
                                <p className={`text-sm flex items-center gap-1 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <MapPin size={12} /> {act.location}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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