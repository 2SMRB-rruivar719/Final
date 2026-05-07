import { Itinerary, TravelStyle, UserProfile } from '../types';
import { getAvatarPoolByName, getStableAvatarIndex, inferGenderFromName, getForcedAvatarByName } from './avatarByName';

const countries = ['España', 'Argentina', 'México', 'Chile', 'Portugal', 'Colombia', 'Italia', 'Francia'];
const budgetPool: Array<UserProfile['budget']> = ['Bajo', 'Medio', 'Alto'];

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

const shuffleWithSeed = <T>(list: T[], seed: number): T[] => {
  const copy = [...list];
  let localSeed = seed;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    localSeed = (localSeed * 9301 + 49297) % 233280;
    const j = Math.floor((localSeed / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const firstNameList = ['Lucía', 'Diego', 'Sofía', 'Mateo', 'Valeria', 'Nicolás', 'Camila', 'Bruno'];
const lastNameList = ['Martínez', 'Ruiz', 'Torres', 'Silva', 'López', 'Castro', 'Romero', 'Navarro'];
const buildName = (index: number) => `${firstNameList[index % firstNameList.length]} ${lastNameList[(index * 3) % lastNameList.length]}`;
const pickBudget = (preferredBudget: UserProfile['budget'], seed: number): UserProfile['budget'] => {
  const normalized = Math.abs(Math.sin(seed * 999)) % 1;
  if (normalized < 0.4) {
    return preferredBudget;
  }
  const index = Math.floor(((normalized - 0.4) / 0.6) * budgetPool.length);
  return budgetPool[Math.min(index, budgetPool.length - 1)];
};

export const generatePotentialMatches = async (userProfile: UserProfile): Promise<UserProfile[]> => {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const baseStyles =
    userProfile.travelStyle && userProfile.travelStyle.length
      ? userProfile.travelStyle
      : [TravelStyle.CULTURAL, TravelStyle.ADVENTURE];

  const usedAvatarUrls = new Set<string>();

  const pickNonRepeatedAvatar = (name: string) => {
    const forcedAvatar = getForcedAvatarByName(name);
    if (forcedAvatar) {
      usedAvatarUrls.add(forcedAvatar);
      return forcedAvatar;
    }
    const pool = getAvatarPoolByName(name);
    if (!pool.length) return '';
    const startIndex = getStableAvatarIndex(name, pool.length);
    for (let offset = 0; offset < pool.length; offset += 1) {
      const candidate = pool[(startIndex + offset) % pool.length];
      if (!usedAvatarUrls.has(candidate)) {
        usedAvatarUrls.add(candidate);
        return candidate;
      }
    }
    const fallback = pool[startIndex];
    usedAvatarUrls.add(fallback);
    return fallback;
  };

  const names = Array.from({ length: 8 }).map((_, index) => buildName(index + 1));
  const shuffledNames = shuffleWithSeed(names, Date.now());

  return shuffledNames.map((name, index) => {
    const seed = Date.now() + index * 41;
    const styles = pickMany(Object.values(TravelStyle), 2, seed + 9);
    const mergedStyles = Array.from(new Set([...baseStyles.slice(0, 1), ...styles])).slice(0, 3);
    const interests = pickMany(
      Array.from(new Set([...(userProfile.interests || []), ...interestPool])),
      4,
      seed + 17
    );
    const age = Math.max(18, Math.min(45, (userProfile.age || 28) + (index % 5) - 2));
    const inferredGender = inferGenderFromName(name);
    const sex = inferredGender === 'female' ? 'mujer' : 'hombre';

    return {
      id: `match-${index}-${Date.now()}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@travelmatch.local`,
      age,
      sex,
      country: countries[index % countries.length],
      bio: bios[index % bios.length],
      budget: pickBudget(userProfile.budget, seed + 23),
      travelStyle: mergedStyles,
      interests,
      avatarUrl: pickNonRepeatedAvatar(name),
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
