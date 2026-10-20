import { TargetType, WeaponType } from '../types/game';

export interface StoryCharacter {
  id: string;
  name: { uk: string; ru: string; en: string };
  callsign: { uk: string; ru: string; en: string };
  role: { uk: string; ru: string; en: string };
  avatarBg: string;
  accentColor: string;
  badge: string;
}

export interface StoryTransmission {
  id: string;
  triggerTimeSec: number;
  characterId: 'titan' | 'sova' | 'iskra' | 'mayak';
  alertType: 'info' | 'warning' | 'alert' | 'critical' | 'boss';
  text: {
    uk: string;
    ru: string;
    en: string;
  };
}

export interface StoryChapter {
  id: string;
  number: number;
  code: string;
  timeLabel: string;
  title: { uk: string; ru: string; en: string };
  subtitle: { uk: string; ru: string; en: string };
  narrativeBriefing: { uk: string; ru: string; en: string };
  tacticalObjective: { uk: string; ru: string; en: string };
  difficulty: 'легка' | 'середня' | 'висока' | 'екстремальна' | 'БОС';
  targetTypes: TargetType[];
  totalTargets: number;
  citySectors: string[];
  durationSeconds: number;
  unlockedWeapons: WeaponType[];
  hasBoss?: boolean;
  transmissions: StoryTransmission[];
  debriefingSuccess: { uk: string; ru: string; en: string };
}

export interface ChapterRecord {
  stars: number;
  score: number;
  rank: string;
  clearedAt: string;
  cityIntegrityRemaining: number;
}

export interface CampaignProgress {
  unlockedChapters: string[];
  chapterRecords: Record<string, ChapterRecord>;
  unlockedMedals: string[];
  lastPlayedChapterId?: string;
}

export interface Medal {
  id: string;
  title: { uk: string; ru: string; en: string };
  description: { uk: string; ru: string; en: string };
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
