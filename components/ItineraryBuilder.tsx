import React, { useState } from 'react';
import { UserProfile, Itinerary, LanguageCode } from '../types';
import { generateItinerary } from '../services/aiService';
import { Button } from './Button';
import { Map, Clock, MapPin, Sparkles, Share2 } from 'lucide-react';

interface ItineraryBuilderProps {
  currentUser: UserProfile;
  language: LanguageCode;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ currentUser, language }) => {
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
      };
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(3);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateItinerary(
      currentUser.destination, 
      duration, 
      currentUser.interests, 
      currentUser.budget
    );
    setItinerary(result);
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto mb-24 lg:mb-8 lg:py-8">
      <div className="mb-6 bg-gradient-to-r from-travel-primary to-travel-accent p-6 rounded-3xl text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="opacity-90 mb-4 text-sm">{t.subtitle}</p>
        
        {!itinerary && (
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
            <label className="block text-xs font-medium mb-2 uppercase tracking-wide">{t.duration}</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" 
                max="14" 
                value={duration} 
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-travel-secondary h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
              <span className="font-bold text-xl w-8">{duration}</span>
            </div>
            <Button 
              onClick={handleGenerate} 
              fullWidth 
              disabled={loading}
              className="mt-4 bg-travel-secondary text-travel-dark hover:bg-white border-none shadow-none"
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
               <div key={day.day} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="bg-travel-primary/20 text-travel-primary font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                     {day.day}
                   </div>
                   <h4 className="font-bold text-lg text-gray-800">{day.title}</h4>
                 </div>
                 
                 <div className="space-y-6 relative pl-5 border-l-2 border-gray-100 ml-5">
                   {day.activities.map((act, idx) => (
                     <div key={idx} className="relative">
                        <div className="absolute -left-[27px] top-1 w-3 h-3 bg-travel-accent rounded-full border-2 border-white ring-2 ring-gray-50"></div>
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                          <span className="text-xs font-bold text-travel-accent bg-travel-accent/10 px-2 py-1 rounded w-fit flex items-center gap-1">
                            <Clock size={10} /> {act.time}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">{act.description}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin size={12} /> {act.location}
                            </p>
                          </div>
                        </div>
                     </div>
                   ))}
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
        <div className="text-center p-8 bg-white border border-dashed border-gray-300 rounded-3xl">
          <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t.empty}</p>
        </div>
      )}
    </div>
  );
};