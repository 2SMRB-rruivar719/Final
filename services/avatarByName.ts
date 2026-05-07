export type NameGender = 'female' | 'male' | 'unknown';

const femaleFirstNames = new Set([
  'ana', 'maria', 'sofia', 'lucia', 'valeria', 'camila', 'paula', 'laura', 'sarah', 'isabella', 'martina',
  'elena', 'carla', 'daniela', 'alba', 'andrea', 'natalia', 'irene', 'adriana', 'alejandra',
]);

const maleFirstNames = new Set([
  'carlos', 'diego', 'mateo', 'bruno', 'nicolas', 'juan', 'pedro', 'luis', 'javier', 'miguel', 'pablo',
  'marcos', 'sergio', 'adrian', 'alejandro', 'david', 'daniel', 'roberto', 'ricardo', 'fernando',
]);

const femalePortraits = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80',
];

const malePortraits = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=600&q=80',
];

const unknownPortraits = [...femalePortraits, ...malePortraits];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getFirstName = (fullName: string) => normalizeText(fullName).split(/\s+/).filter(Boolean)[0] || '';

const forcedGenderByFirstName: Record<string, NameGender> = {
  mateo: 'male',
  bruno: 'male',
};

const forcedAvatarByFirstName: Record<string, string> = {
  mateo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
};

export const inferGenderFromName = (fullName: string): NameGender => {
  const firstName = getFirstName(fullName);
  if (!firstName) return 'unknown';
  if (forcedGenderByFirstName[firstName]) return forcedGenderByFirstName[firstName];
  if (femaleFirstNames.has(firstName)) return 'female';
  if (maleFirstNames.has(firstName)) return 'male';
  return 'unknown';
};

export const getForcedAvatarByName = (fullName: string) => {
  const firstName = getFirstName(fullName);
  return forcedAvatarByFirstName[firstName] || '';
};

export const getAvatarPoolByName = (fullName: string) => {
  const gender = inferGenderFromName(fullName);
  if (gender === 'female') return femalePortraits;
  if (gender === 'male') return malePortraits;
  return unknownPortraits;
};

export const getStableAvatarIndex = (fullName: string, poolLength: number) => {
  if (poolLength <= 0) return 0;
  return hashString(normalizeText(fullName || 'user')) % poolLength;
};

export const getAvatarByName = (fullName: string) => {
  const forcedAvatar = getForcedAvatarByName(fullName);
  if (forcedAvatar) return forcedAvatar;
  const pool = getAvatarPoolByName(fullName);
  const index = getStableAvatarIndex(fullName, pool.length);
  return pool[index];
};
