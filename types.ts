export enum TravelStyle {
  BACKPACKER = 'Mochilero',
  LUXURY = 'Lujo',
  ADVENTURE = 'Aventura',
  CULTURAL = 'Cultural',
  RELAX = 'Relax',
  PARTY = 'Fiesta'
}

export type UserRole = 'cliente' | 'empresa';
export type LanguageCode = 'es' | 'en';
export type ThemeMode = 'light' | 'dark';
export type UserSex = 'hombre' | 'mujer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  sex?: UserSex;
  country: string;
  bio: string;
  budget: 'Bajo' | 'Medio' | 'Alto';
  travelStyle: TravelStyle[];
  interests: string[];
  avatarUrl: string;
  /** Color del borde del avatar (hex, ej. #f97316). Vacío = estilo por defecto de la app. */
  avatarBorderColor?: string;
  /** Estilo del borde: sólido, doble anillo o brillo. */
  avatarRingStyle?: 'solid' | 'double' | 'glow' | '';
  /** Fondo del bloque superior del perfil (preset). */
  profileCoverId?: string;
  /** Un emoji junto al nombre (1 carácter visual aprox.). */
  profileMoodEmoji?: string;
  /** Frase corta bajo el nombre en el perfil (máx. ~48 en UI). */
  profileTagline?: string;
  /** Color de acento global (hex). Vacío = color de marca. */
  uiAccentColor?: string;
  /** Escala de texto en la app: normal o grande. */
  fontScale?: '' | 'large';
  /** Forma de las burbujas de chat (tuyas y recibidas). Vacío = clásico. */
  chatBubbleStyle?: '' | 'pill' | 'minimal';
  destination: string;
  /** Resumen legible (p. ej. ida → vuelta); mantener por compatibilidad */
  dates: string;
  /** Fecha de ida (YYYY-MM-DD) */
  tripStartDate?: string;
  /** Fecha de vuelta (YYYY-MM-DD) */
  tripEndDate?: string;
  role: UserRole;
  language: LanguageCode;
  theme: ThemeMode;
  /** ISO: cuenta programada para borrarse */
  deletionScheduledAt?: string | null;
}

/** Reservado para iteración del planificador IA circular */
export type PlannerPhase = 'gather' | 'plan' | 'refine';

export interface PlannerSessionState {
  phase: PlannerPhase;
  lastPrompt?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: {
    time: string;
    description: string;
    location: string;
  }[];
}

export interface Itinerary {
  id: string;
  destination: string;
  days: ItineraryDay[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  authorId?: string;
  authorName?: string;
  authorAvatarUrl?: string;
}

export interface ChatMember {
  id: string;
  name: string;
  avatarUrl: string;
  age: number;
  sex: UserSex;
  bio: string;
  destination: string;
}

export interface ChatThreadType {
  id: string;
  name: string;
  avatarUrl: string;
  age?: number;
  sex?: UserSex;
  bio?: string;
  destination?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isGroup: boolean;
  leaderId?: string;
  members?: ChatMember[];
  messages: Message[];
}
