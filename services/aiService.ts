import { Itinerary, TravelStyle, UserProfile } from '../types';
import { getAvatarPoolByName, getStableAvatarIndex, inferGenderFromName, getForcedAvatarByName } from './avatarByName';

const countries = ['España', 'Argentina', 'México', 'Chile', 'Portugal', 'Colombia', 'Italia', 'Francia'];
const budgetPool: Array<UserProfile['budget']> = ['Bajo', 'Medio', 'Alto'];

const bios = [
  'Me encanta organizar sesiones de estudio grupales y debatir conceptos complejos.',
  'Estudio mejor con el método Pomodoro, música lofi y buena concentración.',
  'Busco compañeros para resolver dudas de exámenes pasados y compartir apuntes.',
  'Combino el estudio individual intenso con descansos para tomar café y despejarme.',
  'Siempre intento mantener mis apuntes limpios, claros y bien estructurados.',
  'Me considero muy práctico, prefiero resolver problemas antes que memorizar teoría.',
  'Preparando exámenes importantes. Busco constancia y motivación mutua.',
  'Me gusta crear mapas mentales y repasar con flashcards en grupo.',
];

const interestPool = [
  'Matemáticas',
  'Programación',
  'Medicina',
  'Física',
  'Derecho',
  'Historia',
  'Idiomas',
  'Química',
  'Economía',
  'Filosofía',
  'Diseño UI/UX',
  'Biología',
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
      : [TravelStyle.THEORETICAL, TravelStyle.PRACTICAL];

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
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@studymatch.local`,
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
  if (day === 1) return `Introducción y bases de ${destination}`;
  if (day % 3 === 0) return `Resolución de ejercicios prácticos`;
  if (day % 2 === 0) return `Profundización teórica y dudas`;
  return `Simulacro y repaso general`;
};

const LOCATION_TEMPLATES = [
  (d: string) => `Biblioteca Central · ${d}`,
  (d: string) => `Café de estudio · ${d}`,
  (d: string) => `Sala de estudio grupal · ${d}`,
  (d: string) => `Escritorio personal / Online · ${d}`,
  (d: string) => `Biblioteca universitaria · ${d}`,
  (d: string) => `Aula de informática · ${d}`,
  (d: string) => `Zona de co-working · ${d}`,
  (d: string) => `Parque o espacio abierto · ${d}`,
];

const buildPlaceNote = (location: string, destination: string, focus: string): string => {
  const spot = location.replace(` · ${destination}`, '').replace(`Centro de ${destination}`, 'el centro');
  return (
    `El espacio "${spot}" es excelente para enfocarse en ${focus.toLowerCase()}. ` +
    `Consejo de Estudio: Intenta aplicar la técnica Pomodoro (25 min estudio, 5 min descanso). ` +
    `Si estudias en grupo, hagan preguntas y explíquense conceptos difíciles mutuamente.`
  );
};

export const generateItinerary = async (
  destination: string,
  duration: number,
  interests: string[],
  budget: string
): Promise<Itinerary> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const fallbackInterests = interests.length ? interests : ['Matemáticas', 'Programación', 'Historia', 'Física'];

  const days = Array.from({ length: duration }).map((_, idx) => {
    const day = idx + 1;
    const [interestA, interestB, interestC] = pickMany(fallbackInterests, 3, day * 93 + destination.length);
    const locMorning = day === 1
      ? `Escritorio personal · ${destination}`
      : LOCATION_TEMPLATES[(day * 2) % LOCATION_TEMPLATES.length](destination);
    const locAfternoon = LOCATION_TEMPLATES[(day * 3 + 1) % LOCATION_TEMPLATES.length](destination);
    const locEvening = LOCATION_TEMPLATES[(day * 5 + 2) % LOCATION_TEMPLATES.length](destination);
    const focusA = interestA || 'conceptos clave';
    const focusB = interestB || 'práctica intensiva';
    const focusC = interestC || 'resolución de dudas';

    return {
      day,
      title: buildDayTitle(day, destination),
      activities: [
        {
          time: '09:00',
          description: `Bloque 1: Repaso teórico y mapa mental de ${focusA}`,
          location: locMorning,
          placeNote: buildPlaceNote(locMorning, destination, focusA),
        },
        {
          time: '13:00',
          description: `Bloque 2: Resolución de ejercicios y casos prácticos de ${focusB}`,
          location: locAfternoon,
          placeNote: buildPlaceNote(locAfternoon, destination, focusB),
        },
        {
          time: '19:30',
          description: `Bloque 3: Sesión de autoevaluación / flashcards sobre ${focusC} (dificultad ${budget})`,
          location: locEvening,
          placeNote: buildPlaceNote(locEvening, destination, focusC),
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
