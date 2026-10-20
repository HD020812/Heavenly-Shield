export type TargetType = 
  | 'fpv'             // FPV дрон (минимальная угроза, быстрый, маневренный)
  | 'geran2'          // Герань-2 (Shahed-136, ударный БПЛА с поршневым двигателем)
  | 'gerbera'         // Гербера (дрон-обманка / фальш-цель из фанеры/пенопласта)
  | 'geran4_seeker'   // Герань-4 «Сикер» (реактивный ударный БПЛА с оптической ГСН)
  | 'geran5_seeker'   // Герань-5 «Сикер» (двухдвигательный реактивный БПЛА, 2 стадия)
  | 'kh101_kalibr'    // Х-101 / Калибр (крылатая ракета, сверхмалая высота)
  | 'kinzhal'         // Кинжал (БАЛЛИСТИКА: гиперзвуковой аэробаллистический комплекс)
  | 'iskander'        // Искандер (БАЛЛИСТИКА: квазибаллистическая ракета ОТРК)
  | 'zircon'          // Циркон (3М22 ГИПЕРЗВУКОВАЯ прямоточная ракета, 3 стадия)
  | 'banderol'        // Бандероль (быстрый ударный дрон доставки, 3-4 стадия)
  | 'oreshnik_boss';  // ОРЕШНИК (ФИНАЛЬНЫЙ БОСС: БРСД с разделяющимися гиперзвуковыми блоками MIRV)

export interface TargetThreat {
  id: string;
  type: TargetType;
  name: string;
  callsign: string;
  x: number;           // Screen X
  y: number;           // Screen Y
  distance: number;    // Distance from battery in meters
  altitude: number;    // Altitude in meters
  speed: number;       // Speed in km/h
  vx: number;
  vy: number;
  heading: number;
  health: number;
  maxHealth: number;
  size: number;
  illuminated: boolean;
  destroyed: boolean;
  impacted: boolean;
  diveMode?: boolean;
  isBoss?: boolean;
  bossPhase?: number;  // 1: Reentry vehicle, 2: MIRV separation
  subWarheadsLeft?: number;
  trailPoints: { x: number; y: number; alpha: number }[];
  soundPan?: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical' | 'boss';
}

export type WeaponType = 'browning' | 'gepard' | 'stinger' | 'patriot';

export interface WeaponInfo {
  id: WeaponType;
  name: string;
  shortName: string;
  description: string;
  ammo: number;
  maxAmmo: number;
  infiniteAmmo: boolean;
  fireRate: number;
  heatPerShot: number;
  damage: number;
  splashRadius: number;
  projectileSpeed: number;
  effectiveAgainst: TargetType[];
  lockRequired: boolean;
}

export type VisionMode = 'optical' | 'thermal' | 'radar';

export interface Projectile {
  id: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  weapon: WeaponType;
  life: number;
  maxLife: number;
  color: string;
  isFlak?: boolean;
  targetId?: string;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'debris' | 'flare' | 'shockwave' | 'plasma';
}

export interface CitySector {
  id: string;
  name: string;
  health: number;
  description: string;
  underAttack: boolean;
}

export interface Mission {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'легка' | 'середня' | 'висока' | 'екстремальна' | 'БОС';
  targetTypes: TargetType[];
  totalTargets: number;
  citySectors: string[];
  durationSeconds: number;
  unlockedWeapons: WeaponType[];
  hasBoss?: boolean;
  environment: {
    fogDensity: number;
    cloudCover: number;
    ambientLight: number;
  };
}

export interface GameStats {
  score: number;
  shotsFired: number;
  shotsHit: number;
  targetsDestroyed: Record<TargetType, number>;
  cityDamageTaken: number;
  flakExpended: number;
  missilesExpended: number;
  searchlightSpots: number;
  highestStreak: number;
  currentStreak: number;
  bossDefeated: boolean;
}

export type GameState = 
  | 'TITLE_MENU'
  | 'BRIEFING'
  | 'PLAYING'
  | 'PAUSED'
  | 'AFTER_ACTION'
  | 'GAME_OVER';

export interface RadioMessage {
  id: string;
  timestamp: string;
  sender: string;
  text: string;
  type: 'info' | 'warning' | 'alert' | 'success' | 'boss';
}
