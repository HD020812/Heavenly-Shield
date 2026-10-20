import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, TRANSLATIONS } from './translations';
import { TargetType, WeaponType } from '../types/game';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  getMissionTitle: (id: string, defaultTitle: string) => string;
  getMissionSubtitle: (id: string, defaultSubtitle: string) => string;
  getMissionDescription: (id: string, defaultDesc: string) => string;
  getDifficultyLabel: (diff: string) => string;
  getWeaponName: (type: WeaponType, defaultName: string) => string;
  getWeaponShortName: (type: WeaponType, defaultShort: string) => string;
  getWeaponDescription: (type: WeaponType, defaultDesc: string) => string;
  getSectorName: (id: string, defaultName: string) => string;
  getSectorDescription: (id: string, defaultDesc: string) => string;
  getTargetName: (type: TargetType, defaultName: string) => string;
  getRankTitle: (isVictory: boolean, bossDefeated: boolean, cityPct: number, accPct: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'sky_shield_lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === 'uk' || saved === 'en' || saved === 'ru')) {
        return saved;
      }
    } catch {
      // LocalStorage access fallback
    }
    return 'uk';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const t = TRANSLATIONS[language];

  // Helper mappings
  const getMissionTitle = (id: string, defaultTitle: string): string => {
    switch (id) {
      case 'm1_fpv_gerbera':
        return t.m1Title;
      case 'm2_geran_strike':
        return t.m2Title;
      case 'm3_cruise_kalibr':
        return t.m3Title;
      case 'm4_ballistic_iskander':
        return t.m4Title;
      case 'm5_oreshnik_boss':
        return t.m5Title;
      default:
        return defaultTitle;
    }
  };

  const getMissionSubtitle = (id: string, defaultSubtitle: string): string => {
    switch (id) {
      case 'm1_fpv_gerbera':
        return t.m1Subtitle;
      case 'm2_geran_strike':
        return t.m2Subtitle;
      case 'm3_cruise_kalibr':
        return t.m3Subtitle;
      case 'm4_ballistic_iskander':
        return t.m4Subtitle;
      case 'm5_oreshnik_boss':
        return t.m5Subtitle;
      default:
        return defaultSubtitle;
    }
  };

  const getMissionDescription = (id: string, defaultDesc: string): string => {
    switch (id) {
      case 'm1_fpv_gerbera':
        return t.m1Desc;
      case 'm2_geran_strike':
        return t.m2Desc;
      case 'm3_cruise_kalibr':
        return t.m3Desc;
      case 'm4_ballistic_iskander':
        return t.m4Desc;
      case 'm5_oreshnik_boss':
        return t.m5Desc;
      default:
        return defaultDesc;
    }
  };

  const getDifficultyLabel = (diff: string): string => {
    switch (diff.toLowerCase()) {
      case 'легка':
      case 'easy':
        return t.diffEasy;
      case 'середня':
      case 'medium':
        return t.diffMedium;
      case 'висока':
      case 'hard':
        return t.diffHard;
      case 'екстремальна':
      case 'extreme':
        return t.diffExtreme;
      case 'бос':
      case 'boss':
        return t.diffBoss;
      default:
        return diff;
    }
  };

  const getWeaponName = (type: WeaponType, defaultName: string): string => {
    switch (type) {
      case 'browning':
        return t.weaponBrowningName;
      case 'gepard':
        return t.weaponGepardName;
      case 'stinger':
        return t.weaponStingerName;
      case 'patriot':
        return t.weaponPatriotName;
      default:
        return defaultName;
    }
  };

  const getWeaponShortName = (type: WeaponType, defaultShort: string): string => {
    switch (type) {
      case 'browning':
        return t.weaponBrowningShort;
      case 'gepard':
        return t.weaponGepardShort;
      case 'stinger':
        return t.weaponStingerShort;
      case 'patriot':
        return t.weaponPatriotShort;
      default:
        return defaultShort;
    }
  };

  const getWeaponDescription = (type: WeaponType, defaultDesc: string): string => {
    switch (type) {
      case 'browning':
        return t.weaponBrowningDesc;
      case 'gepard':
        return t.weaponGepardDesc;
      case 'stinger':
        return t.weaponStingerDesc;
      case 'patriot':
        return t.weaponPatriotDesc;
      default:
        return defaultDesc;
    }
  };

  const getSectorName = (id: string, defaultName: string): string => {
    switch (id) {
      case 'power_grid':
        return t.secPower;
      case 'residential':
        return t.secResidential;
      case 'logistics':
        return t.secLogistics;
      case 'fuel_depot':
        return t.secFuel;
      default:
        return defaultName;
    }
  };

  const getSectorDescription = (id: string, defaultDesc: string): string => {
    switch (id) {
      case 'power_grid':
        return t.secPowerDesc;
      case 'residential':
        return t.secResidentialDesc;
      case 'logistics':
        return t.secLogisticsDesc;
      case 'fuel_depot':
        return t.secFuelDesc;
      default:
        return defaultDesc;
    }
  };

  const getTargetName = (type: TargetType, defaultName: string): string => {
    if (language === 'en') {
      switch (type) {
        case 'fpv':
          return 'FPV Kamikaze Drone';
        case 'geran2':
          return 'Shahed-136 / Geran-2';
        case 'gerbera':
          return 'Gerbera Decoy Drone';
        case 'geran4_seeker':
          return 'Jet Geran-4 "Seeker"';
        case 'geran5_seeker':
          return 'Jet Geran-5 "Seeker" (Twin-Engine)';
        case 'kh101_kalibr':
          return 'Kh-101 / Kalibr Cruise';
        case 'kinzhal':
          return 'Kh-47M2 Kinzhal (BALLISTIC)';
        case 'iskander':
          return '9M723 Iskander-M (BALLISTIC)';
        case 'zircon':
          return '3M22 Zircon (HYPERSONIC M8)';
        case 'banderol':
          return 'Banderol (Fast Kamikaze UAV)';
        case 'oreshnik_boss':
          return 'MRBM "ORESHNIK" (FINAL BOSS)';
        default:
          return defaultName;
      }
    }
    if (language === 'ru') {
      switch (type) {
        case 'fpv':
          return 'FPV Дрон-камикадзе';
        case 'geran2':
          return 'Герань-2 (Shahed-136)';
        case 'gerbera':
          return 'Гербера (Дрон-обманка)';
        case 'geran4_seeker':
          return 'Герань-4 «Сикер» (Реактивный)';
        case 'geran5_seeker':
          return 'Герань-5 «Сикер» (Двухдвигательный)';
        case 'kh101_kalibr':
          return 'Х-101 / Калибр (Крылатая)';
        case 'kinzhal':
          return 'Х-47М2 Кинжал (БАЛЛИСТИКА)';
        case 'iskander':
          return '9М723 Искандер-М (БАЛЛИСТИКА)';
        case 'zircon':
          return '3М22 Циркон (ГИПЕРЗВУК Mach 8)';
        case 'banderol':
          return '«Бандероль» (Скоростной дрон)';
        case 'oreshnik_boss':
          return 'БРСД «ОРЕШНИК» (ФИНАЛЬНЫЙ БОСС)';
        default:
          return defaultName;
      }
    }
    switch (type) {
      case 'geran5_seeker':
        return 'Герань-5 «Сикер» (Дводвигунний)';
      case 'zircon':
        return '3М22 Циркон (ГІПЕРЗВУК Mach 8)';
      case 'banderol':
        return '«Бандероль» (Швидкісний дрон)';
      default:
        return defaultName;
    }
  };

  const getRankTitle = (
    isVictory: boolean,
    bossDefeated: boolean,
    cityPct: number,
    accPct: number
  ): string => {
    if (language === 'en') {
      if (isVictory) {
        if (bossDefeated) return 'Oreshnik Slayer — Air Defense Legend';
        if (cityPct >= 95 && accPct > 45) return 'Hero of Air Defense';
        if (cityPct >= 80) return 'Ace of the Sky Shield';
        return 'Interception Master';
      }
      return 'Sector Compromised';
    }
    if (language === 'ru') {
      if (isVictory) {
        if (bossDefeated) return 'Победитель ОРЕШНИКА — Легенда ПВО';
        if (cityPct >= 95 && accPct > 45) return 'Герой Противовоздушной Обороны';
        if (cityPct >= 80) return 'Ас Небесного Щита';
        return 'Мастер Перехвата';
      }
      return 'Сектор Прорван';
    }
    // Ukrainian
    if (isVictory) {
      if (bossDefeated) return 'Переможець ОРЕШНИКА — Легенда ППО';
      if (cityPct >= 95 && accPct > 45) return 'Герой Протиповітряної Оборони';
      if (cityPct >= 80) return 'Ас Небесного Щита';
      return 'Майстер Перехоплення';
    }
    return 'Сектор Прорвано';
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getMissionTitle,
        getMissionSubtitle,
        getMissionDescription,
        getDifficultyLabel,
        getWeaponName,
        getWeaponShortName,
        getWeaponDescription,
        getSectorName,
        getSectorDescription,
        getTargetName,
        getRankTitle,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
