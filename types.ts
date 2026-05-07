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
  members?: ChatMember[];
  messages: Message[];
}
