import { Itinerary, TravelStyle, UserProfile } from '../types';

const countries = ['España', 'Argentina', 'México', 'Chile', 'Portugal', 'Colombia', 'Italia', 'Francia'];

const bios = [
  'Me encanta descubrir cafeterías locales y rincones auténticos en cada ciudad.',
  'Viajo ligero y priorizo experiencias culturales y planes espontáneos.',
  'Busco combinar aventura con buena gastronomía y fotografías increíbles.',
  'Prefiero planes bien organizados durante el día y relax por la noche.',
  'Disfruto conectar con viajeros con intereses similares y buen rollo.',
  'Siempre busco el equilibrio entre ahorro y experiencias memorables.',
  'Me gustan las rutas con naturaleza, miradores y caminatas urbanas.',
  'Planifico lo importante y dejo espacio para improvisar sobre la marcha.',
];

const interestPool = [
  'Fotografía',
  'Gastronomía',
  'Historia',
  'Senderismo',
  'Museos',
  'Playas',
  'Vida nocturna',
  'Arte',
  'Café',
  'Naturaleza',
  'Arquitectura',
  'Mercados locales',
];

const pickMany = <T>(list: T[], count: number, seed: number): T[] => {
  const copy = [...list];
  const result: T[] = [];
  let localSeed = seed;
  while (copy.length && result.length < count) {
    localSeed = (localSeed * 9301 + 49297) % 233280;
    const index = Math.floor((localSeed / 233280) * copy.length);
    result.push(copy.splice(index, 1)[0]);
  }
  return result;
};

const firstNameList = ['Lucía', 'Diego', 'Sofía', 'Mateo', 'Valeria', 'Nicolás', 'Camila', 'Bruno'];
const lastNameList = ['Martínez', 'Ruiz', 'Torres', 'Silva', 'López', 'Castro', 'Romero', 'Navarro'];
const realPortraits = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=600&q=80',
];

const buildName = (index: number) => `${firstNameList[index % firstNameList.length]} ${lastNameList[(index * 3) % lastNameList.length]}`;

export const generatePotentialMatches = async (userProfile: UserProfile): Promise<UserProfile[]> => {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const baseStyles =
    userProfile.travelStyle && userProfile.travelStyle.length
      ? userProfile.travelStyle
      : [TravelStyle.CULTURAL, TravelStyle.ADVENTURE];

  return Array.from({ length: 8 }).map((_, index) => {
    const seed = Date.now() + index * 41;
    const styles = pickMany(Object.values(TravelStyle), 2, seed + 9);
    const mergedStyles = Array.from(new Set([...baseStyles.slice(0, 1), ...styles])).slice(0, 3);
    const interests = pickMany(
      Array.from(new Set([...(userProfile.interests || []), ...interestPool])),
      4,
      seed + 17
    );
    const age = Math.max(18, Math.min(45, (userProfile.age || 28) + (index % 5) - 2));
    const name = buildName(index + 1);

    return {
      id: `match-${index}-${Date.now()}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@travelmatch.local`,
      age,
      country: countries[index % countries.length],
      bio: bios[index % bios.length],
      budget: userProfile.budget,
      travelStyle: mergedStyles,
      interests,
      avatarUrl: realPortraits[index % realPortraits.length],
      destination: userProfile.destination,
      dates: userProfile.dates,
      tripStartDate: userProfile.tripStartDate,
      tripEndDate: userProfile.tripEndDate,
      role: 'cliente',
      language: userProfile.language || 'es',
      theme: userProfile.theme || 'light',
    };
  });
};

const buildDayTitle = (day: number, destination: string) => {
  if (day === 1) return `Bienvenida en ${destination}`;
  if (day % 3 === 0) return `Aventura y naturaleza`;
  if (day % 2 === 0) return `Ruta cultural`;
  return `Sabores y barrios locales`;
};

export const generateItinerary = async (
  destination: string,
  duration: number,
  interests: string[],
  budget: string
): Promise<Itinerary> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const fallbackInterests = interests.length ? interests : ['Gastronomía', 'Historia', 'Naturaleza'];

  const days = Array.from({ length: duration }).map((_, idx) => {
    const day = idx + 1;
    const [interestA, interestB, interestC] = pickMany(fallbackInterests, 3, day * 93 + destination.length);
    return {
      day,
      title: buildDayTitle(day, destination),
      activities: [
        {
          time: '09:00',
          description: `Desayuno local y planificación del día (${interestA || 'centro histórico'})`,
          location: `Centro de ${destination}`,
        },
        {
          time: '13:00',
          description: `Actividad principal enfocada en ${interestB || 'cultura local'}`,
          location: `Zona recomendada · ${destination}`,
        },
        {
          time: '19:30',
          description: `Cierre del día con plan de ${interestC || 'gastronomía'} (presupuesto ${budget})`,
          location: `Barrio gastronómico · ${destination}`,
        },
      ],
    };
  });

  return {
    id: `trip-${Date.now()}`,
    destination,
    days,
  };
};
