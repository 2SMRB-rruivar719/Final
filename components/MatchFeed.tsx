import React, { useState, useEffect, useMemo } from 'react';
import { LanguageCode, ThemeMode, UserProfile } from '../types';
import { generatePotentialMatches } from '../services/aiService';
import { Button } from './Button';
import { X, Heart, MessageCircle, MapPin, Calendar, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';

interface MatchFeedProps {
  currentUser: UserProfile;
  onStartChat: (user: UserProfile) => void;
  language: LanguageCode;
  theme: ThemeMode;
}

interface PublicChannelPost {
  id: string;
  author: string;
  place: string;
  comment: string;
  imageUrl: string;
}

interface PublicChannel {
  id: string;
  name: string;
  destination: string;
  members: number;
  posts: PublicChannelPost[];
}

const PUBLIC_CHANNELS: PublicChannel[] = [
  {
    id: 'pc-1',
    name: 'Foodies en Italia',
    destination: 'Roma',
    members: 128,
    posts: [
      {
        id: 'p1',
        author: 'Lucia',
        place: 'Trastevere',
        comment: 'Pasta increible y ambiente super local. Muy recomendado para cena.',
        imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'p2',
        author: 'Marco',
        place: 'Mercato Centrale',
        comment: 'Perfecto para probar varios puestos en una sola visita.',
        imageUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
  {
    id: 'pc-2',
    name: 'Miradores y fotos',
    destination: 'Lisboa',
    members: 97,
    posts: [
      {
        id: 'p3',
        author: 'Sara',
        place: 'Miradouro da Senhora do Monte',
        comment: 'Atardecer top. Lleva algo de abrigo porque corre viento.',
        imageUrl: 'https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'p4',
        author: 'Joao',
        place: 'Alfama',
        comment: 'Calles preciosas para fotos espontaneas por la mañana.',
        imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
  {
    id: 'pc-3',
    name: 'Aventura urbana',
    destination: 'Tokyo',
    members: 212,
    posts: [
      {
        id: 'p5',
        author: 'Kenji',
        place: 'Shibuya',
        comment: 'Para street photography este punto nunca falla.',
        imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=80',
      },
      {
        id: 'p6',
        author: 'Marta',
        place: 'Asakusa',
        comment: 'Templo precioso y zona llena de tiendas tradicionales.',
        imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
];

export const MatchFeed: React.FC<MatchFeedProps> = ({ currentUser, onStartChat, language, theme }) => {
  const isDark = theme === 'dark';
  const travelStyleFilters = ['Mochilero', 'Lujo', 'Aventura', 'Cultural', 'Relax', 'Fiesta'];
  const budgetFilters = ['Bajo', 'Medio', 'Alto'];
  const t = language === 'en'
    ? {
        loading: 'AI is looking for your ideal travel buddies...',
        seenAll: 'You have seen all profiles!',
        comeBack: `Come back later to see new travelers in ${currentUser.destination}.`,
        reviewAgain: 'Review again',
        yourTrip: 'Your trip',
        lookingFor: 'Looking for profiles similar to:',
        currentProfile: 'Current profile',
        matchInsight: 'Match insight',
        highlighted: 'Top compatibility',
        insightText: 'Destination, style and budget match. Great to build a joint plan quickly.',
        firstMessage: 'Send first message',
        tip: 'Tip: use the center button to break the ice instantly.',
        searchPlaceholder: 'Search travelers...',
        filterBy: 'Filter by',
        filters: 'Filters',
        all: 'All',
        filterDate: 'Date',
        datePlaceholder: 'Any date',
        styleFilter: 'Travel style',
        stylePlaceholder: 'Any style',
        budgetFilter: 'Budget',
        budgetPlaceholder: 'Any budget',
        noResults: 'No profiles match your search.',
        clearSearch: 'Clear filters',
      }
    : {
        loading: 'La IA está buscando a tus compañeros ideales...',
        seenAll: '¡Has visto todos los perfiles!',
        comeBack: `Vuelve más tarde para ver nuevos viajeros en ${currentUser.destination}.`,
        reviewAgain: 'Revisar de nuevo',
        yourTrip: 'Tu viaje',
        lookingFor: 'Buscando perfiles afines a:',
        currentProfile: 'Perfil actual',
        matchInsight: 'Match insight',
        highlighted: 'Compatibilidad destacada',
        insightText: 'Coinciden en destino, estilo y presupuesto. Ideal para armar plan conjunto rápidamente.',
        firstMessage: 'Enviar primer mensaje',
        tip: 'Tip: usa el botón central para romper el hielo al instante.',
        searchPlaceholder: 'Buscar viajeros...',
        filterBy: 'Filtrar por',
        filters: 'Filtrar',
        all: 'Todo',
        filterDate: 'Fecha',
        datePlaceholder: 'Cualquier fecha',
        styleFilter: 'Estilo de viaje',
        stylePlaceholder: 'Cualquier estilo',
        budgetFilter: 'Presupuesto',
        budgetPlaceholder: 'Cualquier presupuesto',
        noResults: 'No hay perfiles que coincidan con tu búsqueda.',
        clearSearch: 'Limpiar filtros',
      };
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [channelStartIndex, setChannelStartIndex] = useState(0);
  const [activeChannel, setActiveChannel] = useState<PublicChannel | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const matches = await generatePotentialMatches(currentUser);
      setCandidates(matches);
      setCurrentIndex(0);
      setLoading(false);
    };
    fetchMatches();
  }, [currentUser]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [searchTerm, filterDate, styleFilter, budgetFilter]);

  const filteredCandidates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const matchesSearch = !query
        || candidate.name.toLowerCase().includes(query)
        || candidate.destination.toLowerCase().includes(query)
        || candidate.travelStyle.some((style) => style.toLowerCase().includes(query))
        || candidate.interests.some((interest) => interest.toLowerCase().includes(query));

      const matchesStyle = !styleFilter || candidate.travelStyle.includes(styleFilter as UserProfile['travelStyle'][number]);
      const matchesBudget = !budgetFilter || candidate.budget === budgetFilter;

      const matchesDate = !filterDate || (() => {
        if (!candidate.tripStartDate || !candidate.tripEndDate) return false;
        return filterDate >= candidate.tripStartDate && filterDate <= candidate.tripEndDate;
      })();

      return matchesSearch && matchesStyle && matchesBudget && matchesDate;
    });
  }, [budgetFilter, candidates, filterDate, searchTerm, styleFilter]);

  const handleAction = (action: 'pass' | 'like') => {
    setSwipeDirection(action === 'pass' ? 'left' : 'right');
    if (action === 'like') {
      // In a real app, this would create a match record
      // Here we just simulate interest
    }
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 180);
  };

  const handlePrev = () => {
    if (currentIndex <= 0) return;
    setSwipeDirection('left');
    setTimeout(() => {
      setCurrentIndex(prev => Math.max(0, prev - 1));
      setSwipeDirection(null);
    }, 150);
  };

  const handleNext = () => {
    if (currentIndex >= filteredCandidates.length - 1) return;
    setSwipeDirection('right');
    setTimeout(() => {
      setCurrentIndex(prev => Math.min(filteredCandidates.length - 1, prev + 1));
      setSwipeDirection(null);
    }, 150);
  };

  const currentCandidate = filteredCandidates[currentIndex];
  const visibleChannels = PUBLIC_CHANNELS.slice(channelStartIndex, channelStartIndex + 2);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 lg:h-[70vh]">
        <div className="w-16 h-16 border-4 border-travel-secondary border-t-travel-primary rounded-full animate-spin mb-4"></div>
        <p className="text-travel-dark font-medium">{t.loading}</p>
      </div>
    );
  }

  if (!currentCandidate) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 lg:h-[70vh]">
        <div className="bg-travel-secondary/30 p-6 rounded-full mb-4">
          <Heart className="h-12 w-12 text-travel-primary" />
        </div>
        <h3 className="text-xl font-bold text-travel-dark mb-2">{t.seenAll}</h3>
        <p className="text-gray-500 mb-6">{searchTerm ? t.noResults : t.comeBack}</p>
        {searchTerm && (
          <Button
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
              setStyleFilter('');
              setBudgetFilter('');
            }}
            variant="outline"
            className="mb-3"
          >
            {t.clearSearch}
          </Button>
        )}
        <Button onClick={() => setCurrentIndex(0)} variant="outline">{t.reviewAgain}</Button>
      </div>
    );
  }

  return (
    <div className="relative h-full px-4 py-4 mb-20 lg:mb-8 lg:px-8">
      <div className="mx-auto w-full max-w-7xl mb-4 relative">
        <div className={`rounded-2xl border p-3 flex flex-col md:flex-row gap-3 ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`flex-1 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-travel-primary/40 ${
              isDark ? 'bg-slate-800 text-gray-100 placeholder-gray-400' : 'bg-gray-50 text-gray-800 placeholder-gray-500'
            }`}
          />
          <div className="flex items-center md:justify-end">
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen((prev) => !prev)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold border focus:outline-none focus:ring-2 focus:ring-travel-primary/40 ${
                isDark ? 'bg-slate-800 border-slate-700 text-gray-100' : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              {t.filters}
            </button>
          </div>
        </div>
        {isFilterPanelOpen && (
          <div className={`absolute top-[72px] right-0 z-40 w-full md:w-[360px] rounded-2xl border p-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="space-y-3">
              <div>
                <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`} htmlFor="filter-date">
                  {t.filterDate}
                </label>
                <input
                  id="filter-date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-travel-primary/40 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-gray-100' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                  title={t.filterDate}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`} htmlFor="filter-style">
                  {t.styleFilter}
                </label>
                <select
                  id="filter-style"
                  value={styleFilter}
                  onChange={(e) => setStyleFilter(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-travel-primary/40 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-gray-100' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="">{t.stylePlaceholder}</option>
                  {travelStyleFilters.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`} htmlFor="filter-budget">
                  {t.budgetFilter}
                </label>
                <select
                  id="filter-budget"
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-travel-primary/40 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-gray-100' : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <option value="">{t.budgetPlaceholder}</option>
                  {budgetFilters.map((budget) => (
                    <option key={budget} value={budget}>{budget}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-7xl grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)_minmax(0,1fr)] lg:items-start">
        <aside className={`hidden lg:block lg:self-center max-w-[260px] justify-self-end backdrop-blur-md rounded-3xl p-5 shadow-sm ${
          isDark ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/80 border border-white/60'
        }`}>
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">{t.yourTrip}</p>
          <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-gray-100' : 'text-travel-dark'}`}>{currentUser.destination}</h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.dates}</p>
          <div className="space-y-2 mb-4">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.lookingFor}</p>
            <div className="flex flex-wrap gap-2">
              {currentUser.travelStyle.slice(0, 4).map((style) => (
                  <span key={style} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-slate-700 text-gray-100' : 'bg-travel-secondary/50 text-travel-dark'}`}>
                  {style}
                </span>
              ))}
            </div>
          </div>
          <div className={`rounded-2xl p-3 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-gray-50 border border-gray-100'}`}>
            <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.currentProfile}</p>
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{currentIndex + 1} de {filteredCandidates.length}</p>
          </div>
        </aside>

        <div className="flex flex-col relative">
          <div className={`relative rounded-[2rem] shadow-xl overflow-hidden border flex flex-col h-[74vh] min-h-[560px] ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
          } ${swipeDirection === 'left' ? 'swipe-left' : swipeDirection === 'right' ? 'swipe-right' : ''}`}>
            <div className="relative h-[58%] bg-gray-200">
              <img
                src={currentCandidate.avatarUrl}
                alt={currentCandidate.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/75 to-transparent p-6 pt-20">
                <h2 className="text-3xl font-bold text-white mb-1">
                  {currentCandidate.name}, {currentCandidate.age}
                </h2>
                <div className="flex items-center text-white/90 text-sm gap-2">
                  <MapPin size={14} /> {currentCandidate.country}
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className={`flex flex-wrap gap-3 mb-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <Calendar size={14} className="text-travel-accent" /> {currentCandidate.dates}
                </span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <Wallet size={14} className="text-travel-accent" /> {currentCandidate.budget}
                </span>
              </div>

              <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{currentCandidate.bio}</p>

              <div className="flex flex-wrap gap-2">
                {currentCandidate.travelStyle.map((style) => (
                  <span key={style} className="px-3 py-1 bg-travel-secondary/40 text-travel-dark rounded-full text-xs font-semibold">
                    {style}
                  </span>
                ))}
                {currentCandidate.interests.map((interest) => (
                  <span key={interest} className={`px-3 py-1 rounded-full text-xs ${isDark ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6 items-center">
            <button
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                currentIndex <= 0
                  ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-300'
                  : 'border-gray-200 bg-white text-gray-500 hover:text-travel-primary hover:border-travel-primary'
              }`}
              title="Anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => handleAction('pass')}
              className="w-14 h-14 rounded-full bg-white shadow-lg text-gray-400 flex items-center justify-center hover:bg-gray-50 hover:text-red-500 transition-colors border border-gray-100"
            >
              <X size={28} />
            </button>

            <button
              onClick={() => onStartChat(currentCandidate)}
              className="w-12 h-12 rounded-full bg-travel-accent shadow-lg text-white flex items-center justify-center hover:bg-opacity-90 transition-colors mt-2"
              title="Send Message directly"
            >
              <MessageCircle size={22} />
            </button>

            <button
              onClick={() => handleAction('like')}
              className="w-14 h-14 rounded-full bg-white shadow-lg text-travel-primary flex items-center justify-center hover:bg-travel-primary hover:text-white transition-colors border border-travel-primary"
            >
              <Heart size={28} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= filteredCandidates.length - 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                currentIndex >= filteredCandidates.length - 1
                  ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-300'
                  : 'border-gray-200 bg-white text-gray-500 hover:text-travel-primary hover:border-travel-primary'
              }`}
              title="Siguiente"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <aside
          className={`hidden lg:block lg:self-center max-w-[300px] justify-self-start backdrop-blur-md rounded-3xl p-5 shadow-sm cursor-pointer ${
          isDark ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/80 border border-white/60'
        }`}
          onClick={() => onStartChat(currentCandidate)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onStartChat(currentCandidate);
            }
          }}
        >
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">{t.matchInsight}</p>
          <h4 className={`font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{t.highlighted}</h4>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.insightText}
          </p>
          <div className="space-y-2 mb-5">
            {currentCandidate.interests.slice(0, 4).map((interest) => (
              <div key={interest} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <span className="w-2 h-2 rounded-full bg-travel-accent" />
                {interest}
              </div>
            ))}
          </div>
          <Button
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onStartChat(currentCandidate);
            }}
          >
            {t.firstMessage}
          </Button>
          <p className={`text-[11px] mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.tip}</p>
        </aside>
      </div>

      <section className={`mt-8 rounded-3xl border p-4 lg:p-5 ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm uppercase tracking-wide font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Canales publicos</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChannelStartIndex((prev) => Math.max(0, prev - 1))}
              disabled={channelStartIndex === 0}
              className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                channelStartIndex === 0
                  ? 'opacity-40 cursor-not-allowed border-gray-400 text-gray-400'
                  : (isDark ? 'border-slate-600 text-gray-200 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50')
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setChannelStartIndex((prev) => Math.min(PUBLIC_CHANNELS.length - 2, prev + 1))}
              disabled={channelStartIndex >= PUBLIC_CHANNELS.length - 2}
              className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                channelStartIndex >= PUBLIC_CHANNELS.length - 2
                  ? 'opacity-40 cursor-not-allowed border-gray-400 text-gray-400'
                  : (isDark ? 'border-slate-600 text-gray-200 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50')
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {visibleChannels.map((channel) => (
            <article key={channel.id} className={`rounded-2xl p-4 border ${
              isDark ? 'border-slate-700 bg-slate-800/80' : 'border-gray-100 bg-gray-50'
            }`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{channel.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{channel.destination} · {channel.members} miembros</p>
                </div>
                <Button type="button" variant="outline" className="py-1.5 px-3 text-xs" onClick={() => setActiveChannel(channel)}>
                  Unirme
                </Button>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Foro de viajeros con fotos compartidas y reseñas reales de lugares.
              </p>
            </article>
          ))}
        </div>
      </section>

      {activeChannel && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <div>
                <h4 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{activeChannel.name}</h4>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Foro publico · {activeChannel.destination}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveChannel(null)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                  isDark ? 'border-slate-600 text-gray-200 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
              {activeChannel.posts.map((post) => (
                <article key={post.id} className={`rounded-2xl overflow-hidden border ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-100 bg-gray-50'
                }`}>
                  <img src={post.imageUrl} alt={post.place} className="w-full h-44 object-cover" />
                  <div className="p-3">
                    <p className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{post.place}</p>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Reseña de {post.author}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{post.comment}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};