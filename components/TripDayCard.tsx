import React from 'react';
import { ItineraryDay } from '../types';
import {
  buildPlaceQuery,
  getGoogleMapsEmbedUrl,
  getGoogleMapsUrl,
  getGoogleStaticMapUrl,
} from '../services/googleMaps';
import { getPlaceBannerUrl } from '../services/placePhotos';
import { SafeImage } from './SafeImage';
import { Clock, MapPin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

type TripDayLabels = {
  activities: string;
  aboutPlace: string;
  openMaps: string;
  mapsPreview: string;
};

interface TripDayCardProps {
  day: ItineraryDay;
  destination: string;
  isDark: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  bannerLocation?: string;
  t: TripDayLabels;
}

const MapPlacePreview: React.FC<{
  location: string;
  destination: string;
  mapsPreviewLabel: string;
  openMapsLabel: string;
}> = ({ location, destination, mapsPreviewLabel, openMapsLabel }) => {
  const query = buildPlaceQuery(location, destination);
  const mapsUrl = getGoogleMapsUrl(query);
  const staticUrl = getGoogleStaticMapUrl(query, 640, 240);
  const embedUrl = getGoogleMapsEmbedUrl(query);

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative h-36 sm:h-40 rounded-xl overflow-hidden border border-travel-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent"
      aria-label={openMapsLabel}
    >
      {staticUrl ? (
        <SafeImage
          src={staticUrl}
          alt={mapsPreviewLabel}
          fallbackSeed={query}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          variant="photo"
        />
      ) : (
        <iframe
          title={mapsPreviewLabel}
          src={embedUrl}
          className="w-full h-full border-0 pointer-events-none scale-[1.02]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider bg-white/90 text-gray-800 px-2 py-0.5 rounded-full">
        Google Maps
      </span>
      <span className="absolute bottom-2 right-2 flex items-center gap-1 text-xs font-medium text-white bg-travel-primary/90 px-2.5 py-1 rounded-full group-hover:bg-travel-accent transition-colors">
        <ExternalLink size={12} />
        {openMapsLabel}
      </span>
    </a>
  );
};

export const TripDayCard: React.FC<TripDayCardProps> = ({
  day,
  destination,
  isDark,
  isExpanded,
  onToggle,
  bannerLocation,
  t,
}) => {
  const cardBorder = isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100';

  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border transition-shadow ${cardBorder} ${isExpanded ? 'ring-2 ring-travel-accent/30' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-travel-accent"
        aria-expanded={isExpanded}
      >
        <div className="relative h-28 sm:h-32">
          <SafeImage
            src={getPlaceBannerUrl(destination, day.day, bannerLocation)}
            alt={`${destination} · día ${day.day}`}
            fallbackSeed={`${destination}-day-${day.day}`}
            className="w-full h-full object-cover"
            variant="photo"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="bg-travel-secondary text-travel-dark font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md">
                {day.day}
              </span>
              <div className="min-w-0 text-white">
                <h4 className="font-bold text-base sm:text-lg truncate drop-shadow-sm">{day.title}</h4>
                <p className="text-xs opacity-90 truncate">
                  {day.activities.length} {t.activities} · {destination}
                </p>
              </div>
            </div>
            <span className={`shrink-0 p-1.5 rounded-full ${isDark ? 'bg-slate-800/80' : 'bg-white/90'} text-travel-primary`}>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </div>
        </div>
      </button>

      {!isExpanded && (
        <div className={`px-4 pb-3 flex flex-wrap gap-1.5 ${isDark ? 'border-t border-slate-800' : 'border-t border-gray-50'}`}>
          {day.activities.map((act) => (
            <span
              key={`${day.day}-${act.time}`}
              className={`text-[11px] px-2 py-1 rounded-full ${isDark ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
            >
              {act.time} · {act.location.split('·')[0]?.trim() || act.location}
            </span>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className={`px-4 pb-4 pt-1 space-y-4 ${isDark ? 'bg-slate-900/50' : 'bg-gray-50/80'}`}>
          {day.activities.map((act, idx) => {
            const mapsUrl = getGoogleMapsUrl(buildPlaceQuery(act.location, destination));
            const placeNote =
              act.placeNote ||
              `${act.location} en ${destination}. Pulsa el mapa para ver la ubicación en Google Maps.`;

            return (
              <article
                key={`${day.day}-${idx}`}
                className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}`}
              >
                <div className="p-3 pb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-travel-accent bg-travel-accent/10 px-2 py-1 rounded flex items-center gap-1">
                    <Clock size={10} /> {act.time}
                  </span>
                  <h5 className={`font-semibold text-sm flex-1 min-w-[12rem] ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                    {act.description}
                  </h5>
                </div>

                <div className="px-3 pb-3">
                  <MapPlacePreview
                    location={act.location}
                    destination={destination}
                    mapsPreviewLabel={t.mapsPreview}
                    openMapsLabel={t.openMaps}
                  />
                </div>

                <div className={`px-3 pb-3 space-y-2 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                  <p className={`text-sm font-medium flex items-start gap-1.5 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <MapPin size={14} className="shrink-0 mt-0.5 text-travel-accent" />
                    {act.location}
                  </p>
                  <div className={`text-xs leading-relaxed rounded-lg p-2.5 ${isDark ? 'bg-slate-900/80 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                    <span className={`font-semibold block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t.aboutPlace}
                    </span>
                    {placeNote}
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-travel-primary hover:text-travel-accent transition-colors"
                  >
                    <ExternalLink size={13} />
                    {t.openMaps}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
