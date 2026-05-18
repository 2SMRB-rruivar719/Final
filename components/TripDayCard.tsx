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
import {
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Navigation,
  Sparkles,
} from 'lucide-react';

type TripDayLabels = {
  activities: string;
  aboutPlace: string;
  openMaps: string;
  mapsPreview: string;
  dayLabel: string;
};

interface TripDayCardProps {
  day: ItineraryDay;
  destination: string;
  isDark: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  bannerLocation?: string;
  index: number;
  t: TripDayLabels;
}

const MapPlacePreview: React.FC<{
  location: string;
  destination: string;
  mapsPreviewLabel: string;
  openMapsLabel: string;
  isDark: boolean;
}> = ({ location, destination, mapsPreviewLabel, openMapsLabel, isDark }) => {
  const query = buildPlaceQuery(location, destination);
  const mapsUrl = getGoogleMapsUrl(query);
  const staticUrl = getGoogleStaticMapUrl(query, 640, 280);
  const embedUrl = getGoogleMapsEmbedUrl(query);

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`trip-map-preview group block relative h-40 sm:h-44 rounded-2xl overflow-hidden
        shadow-md transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-0.5
        focus:outline-none focus-visible:ring-2 focus-visible:ring-travel-accent focus-visible:ring-offset-2
        ${isDark ? 'focus-visible:ring-offset-slate-900 ring-1 ring-white/10' : 'focus-visible:ring-offset-white ring-1 ring-travel-primary/25'}`}
      aria-label={openMapsLabel}
    >
      {staticUrl ? (
        <SafeImage
          src={staticUrl}
          alt={mapsPreviewLabel}
          fallbackSeed={query}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          variant="photo"
        />
      ) : (
        <iframe
          title={mapsPreviewLabel}
          src={embedUrl}
          className="w-full h-full border-0 pointer-events-none"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-travel-dark/85 via-travel-dark/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/95 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/25">
          <Navigation size={11} className="text-travel-secondary" />
          Google Maps
        </span>
      </div>
      <span className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-travel-dark bg-travel-secondary px-3 py-1.5 rounded-full shadow-lg shadow-black/20 group-hover:bg-white transition-colors">
        <ExternalLink size={13} />
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
  index,
  t,
}) => {
  const cardShell = isDark
    ? 'bg-gradient-to-b from-slate-800/90 to-slate-900 border-slate-700/80 shadow-black/30'
    : 'bg-white border-white/80 shadow-travel-primary/10';
  const staggerMs = Math.min(index * 70, 350);

  return (
    <article
      className={`trip-day-card rounded-3xl overflow-hidden border transition-all duration-300 ease-out ${cardShell}
        ${isExpanded
          ? 'shadow-xl ring-2 ring-travel-accent/35 scale-[1.01]'
          : 'shadow-md hover:shadow-lg hover:border-travel-primary/30'
        }`}
      style={{ animationDelay: `${staggerMs}ms` }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-travel-accent"
        aria-expanded={isExpanded}
      >
        <div className="relative h-32 sm:h-36 overflow-hidden">
          <SafeImage
            src={getPlaceBannerUrl(destination, day.day, bannerLocation)}
            alt={`${destination} · ${t.dayLabel} ${day.day}`}
            fallbackSeed={`${destination}-day-${day.day}`}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${isExpanded ? 'scale-105' : 'group-hover:scale-105'}`}
            variant="photo"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-travel-dark/80 via-travel-dark/45 to-travel-dark/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-travel-dark/50 to-transparent" />

          <div className="absolute inset-0 flex items-end sm:items-center justify-between px-4 sm:px-5 pb-4 sm:pb-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-travel-secondary via-travel-primary to-travel-accent opacity-90 blur-[2px]" />
                <span className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-travel-secondary text-travel-dark font-extrabold text-lg shadow-lg">
                  {day.day}
                </span>
              </div>
              <div className="min-w-0 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-travel-secondary/95 mb-0.5">
                  {t.dayLabel} {day.day}
                </p>
                <h4 className="font-bold text-lg sm:text-xl leading-tight truncate drop-shadow-md">
                  {day.title}
                </h4>
                <p className="text-xs text-white/80 mt-1 flex items-center gap-1 truncate">
                  <Sparkles size={11} className="text-travel-secondary shrink-0" />
                  {day.activities.length} {t.activities} · {destination}
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 ml-2 p-2 rounded-xl backdrop-blur-md border transition-all duration-300
                ${isExpanded
                  ? 'bg-travel-accent text-white border-travel-accent/50 rotate-0'
                  : isDark
                    ? 'bg-slate-900/60 text-travel-secondary border-white/10'
                    : 'bg-white/90 text-travel-accent border-white/50 shadow-sm'
                }`}
            >
              {isExpanded ? <ChevronUp size={20} strokeWidth={2.5} /> : <ChevronDown size={20} strokeWidth={2.5} />}
            </span>
          </div>
        </div>
      </button>

      {!isExpanded && (
        <div
          className={`px-4 py-3 flex flex-wrap gap-2 border-t ${
            isDark ? 'border-slate-700/60 bg-slate-900/40' : 'border-travel-primary/10 bg-travel-light/50'
          }`}
        >
          {day.activities.map((act) => (
            <span
              key={`${day.day}-${act.time}`}
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full border
                ${isDark
                  ? 'bg-slate-800/80 text-gray-300 border-slate-600/50'
                  : 'bg-white text-gray-600 border-travel-primary/15 shadow-sm'
                }`}
            >
              <Clock size={10} className="text-travel-accent shrink-0" />
              <span className="text-travel-accent font-bold tabular-nums">{act.time}</span>
              <span className="opacity-40">·</span>
              <span className="truncate max-w-[9rem]">
                {act.location.split('·')[0]?.trim() || act.location}
              </span>
            </span>
          ))}
        </div>
      )}

      {isExpanded && (
        <div
          className={`trip-day-expanded px-4 sm:px-5 pb-5 pt-2 space-y-0
            ${isDark ? 'bg-slate-900/60' : 'bg-gradient-to-b from-travel-light/80 to-white'}`}
        >
          <div className={`relative pl-6 sm:pl-7 space-y-5 pt-2 pb-1`}>
            <div
              className={`absolute left-[11px] sm:left-[13px] top-3 bottom-3 w-0.5 rounded-full
                ${isDark ? 'bg-gradient-to-b from-travel-accent via-travel-primary/50 to-transparent' : 'bg-gradient-to-b from-travel-accent via-travel-primary/40 to-travel-secondary/30'}`}
              aria-hidden
            />

            {day.activities.map((act, idx) => {
              const mapsUrl = getGoogleMapsUrl(buildPlaceQuery(act.location, destination));
              const placeNote =
                act.placeNote ||
                `${act.location} en ${destination}. Pulsa el mapa para ver la ubicación en Google Maps.`;

              return (
                <div
                  key={`${day.day}-${idx}`}
                  className="relative trip-activity-item"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div
                    className={`absolute -left-6 sm:-left-7 top-5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold z-10
                      ${isDark
                        ? 'bg-travel-accent text-white ring-4 ring-slate-900'
                        : 'bg-travel-accent text-white ring-4 ring-travel-light shadow-md shadow-travel-accent/30'
                      }`}
                  >
                    {idx + 1}
                  </div>

                  <div
                    className={`rounded-2xl border overflow-hidden transition-shadow hover:shadow-md
                      ${isDark
                        ? 'bg-slate-800/90 border-slate-600/60'
                        : 'bg-white border-travel-primary/15 shadow-sm shadow-travel-primary/5'
                      }`}
                  >
                    <div className="p-4 pb-3">
                      <div className="flex flex-wrap items-start gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-travel-accent to-travel-primary px-2.5 py-1 rounded-lg shadow-sm">
                          <Clock size={11} />
                          {act.time}
                        </span>
                        <h5
                          className={`font-semibold text-sm sm:text-base leading-snug flex-1 min-w-[10rem]
                            ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}
                        >
                          {act.description}
                        </h5>
                      </div>

                      <MapPlacePreview
                        location={act.location}
                        destination={destination}
                        mapsPreviewLabel={t.mapsPreview}
                        openMapsLabel={t.openMaps}
                        isDark={isDark}
                      />
                    </div>

                    <div
                      className={`px-4 pb-4 pt-0 space-y-3 border-t ${
                        isDark ? 'border-slate-700/80' : 'border-travel-primary/10'
                      }`}
                    >
                      <p
                        className={`text-sm font-medium flex items-start gap-2 pt-3
                          ${isDark ? 'text-gray-200' : 'text-travel-dark'}`}
                      >
                        <span className="shrink-0 p-1.5 rounded-lg bg-travel-accent/15">
                          <MapPin size={14} className="text-travel-accent" />
                        </span>
                        <span className="leading-relaxed">{act.location}</span>
                      </p>

                      <div
                        className={`text-xs leading-relaxed rounded-xl p-3.5 border-l-[3px] border-travel-accent
                          ${isDark
                            ? 'bg-slate-900/70 text-gray-400 border-travel-primary/50'
                            : 'bg-travel-secondary/25 text-gray-600 border-travel-accent'
                          }`}
                      >
                        <span
                          className={`font-bold text-[11px] uppercase tracking-wider block mb-1.5
                            ${isDark ? 'text-travel-secondary' : 'text-travel-accent'}`}
                        >
                          {t.aboutPlace}
                        </span>
                        {placeNote}
                      </div>

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto text-xs font-bold px-4 py-2.5 rounded-xl transition-all
                          ${isDark
                            ? 'bg-travel-accent/20 text-travel-secondary hover:bg-travel-accent hover:text-white'
                            : 'bg-travel-primary/20 text-travel-dark hover:bg-travel-accent hover:text-white shadow-sm'
                          }`}
                      >
                        <ExternalLink size={14} />
                        {t.openMaps}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};
