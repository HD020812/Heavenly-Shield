import React from 'react';
import { Simulation } from '../game/simulation';
import { VisionMode, WeaponType } from '../types/game';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import {
  Crosshair,
  Eye,
  Radio,
  Flame,
  Lightbulb,
  ShieldAlert,
  Zap,
  Target,
  AlertTriangle,
  RotateCcw,
  Skull,
  Menu,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface HUDProps {
  simulation: Simulation;
  visionMode: VisionMode;
  setVisionMode: (m: VisionMode) => void;
  showLeadAid: boolean;
  setShowLeadAid: (v: boolean | ((prev: boolean) => boolean)) => void;
  onResupply: (w: WeaponType) => void;
  onOpenBriefing: () => void;
  isMuted?: boolean;
  volume?: number;
  onToggleMute?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  simulation,
  visionMode,
  setVisionMode,
  showLeadAid,
  setShowLeadAid,
  onResupply,
  onOpenBriefing,
  isMuted = false,
  volume = 0.7,
  onToggleMute,
}) => {
  const { t, language } = useTranslation();
  const currentWeapon = simulation.currentWeapon;

  // City integrity calculation
  const totalCityHealth = simulation.sectors.reduce((acc, s) => acc + s.health, 0);
  const maxCityHealth = simulation.sectors.length * 100;
  const cityHealthPct = Math.round((totalCityHealth / maxCityHealth) * 100);

  // Active Boss & Sub-munitions
  const activeBoss = simulation.getActiveBoss();
  const submunitions = simulation.getOreshnikSubmunitions();
  const hasSubmunitions = submunitions.length > 0;
  const survivalCountdown = simulation.getSurvivalCountdown();

  // Threat alerts
  const hasBallistic = simulation.targets.some((t) => (t.type === 'kinzhal' || t.type === 'iskander' || t.type === 'zircon') && !t.destroyed);
  const hasCruise = simulation.targets.some((t) => t.type === 'kh101_kalibr' && !t.destroyed);
  const hasGeran = simulation.targets.some((t) => (t.type === 'geran2' || t.type === 'geran4_seeker' || t.type === 'geran5_seeker' || t.type === 'banderol') && !t.destroyed);

  const totalKills =
    (simulation.stats.targetsDestroyed.fpv || 0) +
    (simulation.stats.targetsDestroyed.geran2 || 0) +
    (simulation.stats.targetsDestroyed.gerbera || 0) +
    (simulation.stats.targetsDestroyed.geran4_seeker || 0) +
    (simulation.stats.targetsDestroyed.geran5_seeker || 0) +
    (simulation.stats.targetsDestroyed.banderol || 0) +
    (simulation.stats.targetsDestroyed.kh101_kalibr || 0) +
    (simulation.stats.targetsDestroyed.zircon || 0) +
    (simulation.stats.targetsDestroyed.kinzhal || 0) +
    (simulation.stats.targetsDestroyed.iskander || 0) +
    (simulation.stats.targetsDestroyed.oreshnik_boss || 0);

  // Localized announcement text
  const getAnnouncementText = () => {
    switch (simulation.bossStageAnnouncementKey) {
      case 'SURVIVAL_START':
        return `⏱️ ${t.surviveUntilOreshnik} 180s!`;
      case 'PHASE_2':
        return `⚠️ ${t.survivalPhase2}!`;
      case 'PHASE_3':
        return `🚨 ${t.survivalPhase3}!`;
      case 'PHASE_4':
        return `⚡ ${t.survivalPhase4}!`;
      case 'AIRDROP':
        return t.ammoAirdrop;
      case 'BOSS_ORESHNIK':
        return t.survivalBossArrived;
      default:
        return simulation.bossStageAnnouncement;
    }
  };

  // Localized survival countdown info
  const survivalPhaseTitle = survivalCountdown
    ? survivalCountdown.phaseNumber === 4
      ? t.survivalPhase4
      : survivalCountdown.phaseNumber === 3
      ? t.survivalPhase3
      : survivalCountdown.phaseNumber === 2
      ? t.survivalPhase2
      : t.survivalPhase1
    : '';

  const survivalHint = survivalCountdown
    ? survivalCountdown.phaseNumber === 4
      ? t.survivalHint4
      : survivalCountdown.phaseNumber === 3
      ? t.survivalHint3
      : survivalCountdown.phaseNumber === 2
      ? t.survivalHint2
      : t.survivalHint1
    : '';

  const announcementText = getAnnouncementText();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 font-hud select-none">
      {/* Dramatic Boss Stage Announcement Banner */}
      {announcementText && (
        <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-rose-600/90 border border-rose-400 text-white font-hud font-black text-xs sm:text-sm tracking-wider uppercase shadow-2xl shadow-rose-950 animate-bounce">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse shrink-0" />
          <span>{announcementText}</span>
        </div>
      )}

      {/* Prominent Mute Alert with Quick Unmute Button */}
      {isMuted && (
        <div className="pointer-events-auto absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-rose-950/95 border-2 border-rose-500 text-rose-200 text-xs shadow-2xl shadow-rose-950/80 animate-pulse">
          <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-bold tracking-wide">
            {language === 'en'
              ? 'SOUND MUTED [M]'
              : language === 'ru'
              ? 'ЗВУК ВЫКЛЮЧЕН [M]'
              : 'ЗВУК ВИМКНЕНО [M]'}
          </span>
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className="ml-2 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold font-hud text-[11px] uppercase tracking-wider cursor-pointer shadow transition-all active:scale-95"
            >
              {language === 'en' ? 'UNMUTE' : language === 'ru' ? 'ВКЛЮЧИТЬ' : 'УВІМКНУТИ'}
            </button>
          )}
        </div>
      )}

      {/* --- TOP HUD BAR: Clean, Minimal, Unobtrusive --- */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Minimal City Health Indicator */}
        <div className="pointer-events-auto flex items-center gap-2 bg-neutral-950/70 backdrop-blur-md border border-neutral-800/80 px-3 py-1.5 rounded-xl shadow-lg">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
            {t.cityIntegrity}
          </span>
          <div className="w-16 sm:w-24 h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700">
            <div
              className={`h-full transition-all duration-300 ${
                cityHealthPct > 60
                  ? 'bg-emerald-500'
                  : cityHealthPct > 30
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
              }`}
              style={{ width: `${cityHealthPct}%` }}
            />
          </div>
          <span
            className={`text-xs font-code font-bold tabular-nums ${
              cityHealthPct > 60
                ? 'text-emerald-400'
                : cityHealthPct > 30
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {cityHealthPct}%
          </span>
        </div>

        {/* Center Alert / ORESHNIK BOSS & SUB-MUNITIONS STATUS */}
        <div className="self-center">
          {hasSubmunitions ? (
            /* Phase 2: Oreshnik has split at 50% HP into 6 sub-munitions! */
            <div className="flex flex-col items-center gap-1 bg-neutral-950/95 border-2 border-rose-500 px-4 sm:px-6 py-1.5 rounded-2xl shadow-2xl shadow-rose-950 animate-pulse">
              <div className="flex items-center gap-2 text-rose-400 text-xs sm:text-sm font-black uppercase tracking-widest">
                <Skull className="w-4 h-4 text-rose-500 animate-bounce" />
                <span>{t.bossSplitAlert} ({submunitions.length}/6)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full border transition-all ${
                      idx < submunitions.length
                        ? 'bg-rose-500 border-rose-300 shadow-sm shadow-rose-400 animate-ping'
                        : 'bg-neutral-800 border-neutral-700 opacity-20'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : activeBoss ? (
            /* Phase 1: Oreshnik intact descent, splits at 50% */
            <div className="flex flex-col items-center gap-1 bg-neutral-950/90 border border-rose-600/80 px-4 sm:px-5 py-1.5 rounded-2xl shadow-2xl shadow-rose-950">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
                <Skull className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                <span>{t.bossName}</span>
                <span className="text-[10px] text-amber-300 font-code font-normal">
                  {t.bossSplitNote}
                </span>
              </div>
              <div className="w-40 sm:w-56 h-2.5 bg-neutral-900 rounded-full border border-rose-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-400 transition-all duration-150"
                  style={{
                    width: `${Math.round(
                      (activeBoss.health / activeBoss.maxHealth) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : survivalCountdown ? (
            /* 180-Second Survival Swarm Countdown before Oreshnik Boss */
            <div className="flex flex-col items-center gap-1 bg-neutral-950/95 border-2 border-amber-500/80 px-4 sm:px-6 py-1.5 rounded-2xl shadow-2xl shadow-amber-950/50">
              <div className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-black uppercase tracking-wider">
                <Timer className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{t.surviveUntilOreshnik}</span>
                <span className="font-code text-sm sm:text-base font-black text-rose-400 bg-neutral-900 px-2 py-0.5 rounded-lg border border-neutral-700 tabular-nums">
                  {survivalCountdown.formattedTime}
                </span>
                {hasBallistic && (
                  <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded animate-pulse font-hud font-bold">
                    {t.ballisticAlert.split('!')[0]}!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 w-full min-w-[200px] max-w-xs">
                <div className="flex-1 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-400 transition-all duration-300"
                    style={{ width: `${Math.round(survivalCountdown.progress * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400 font-code tabular-nums">
                  {Math.round(survivalCountdown.progress * 100)}%
                </span>
              </div>
              <div className="text-[10px] text-neutral-300 font-medium tracking-wide">
                <span className="text-amber-400 font-bold">{survivalPhaseTitle}</span>
                <span className="text-neutral-500 mx-1">·</span>
                <span className="text-neutral-400">{survivalHint}</span>
              </div>
            </div>
          ) : hasBallistic ? (
            <div className="animate-bounce bg-rose-600/90 text-white border border-rose-400 px-3.5 py-1 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <AlertTriangle className="w-3.5 h-3.5 text-white animate-spin" />
              <span>{t.ballisticAlert}</span>
            </div>
          ) : hasCruise ? (
            <div className="bg-amber-500/90 text-neutral-950 border border-amber-300 px-3 py-1 rounded-xl shadow-md flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t.cruiseAlert}</span>
            </div>
          ) : hasGeran ? (
            <div className="bg-neutral-900/80 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-xl text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{t.geranGroupAlert}</span>
            </div>
          ) : (
            <div className="hidden sm:flex bg-neutral-900/60 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-xl text-xs items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t.cityClearSky}</span>
            </div>
          )}
        </div>

        {/* Minimal Score, Kills, Language Switcher & Menu Button */}
        <div className="pointer-events-auto flex items-center gap-2 bg-neutral-950/70 backdrop-blur-md border border-neutral-800/80 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-neutral-400 uppercase">{t.killsLabel}</span>
            <span className="font-code font-bold text-emerald-400 tabular-nums">
              {totalKills}
            </span>
          </div>

          <div className="w-[1px] h-4 bg-neutral-800" />

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[10px] text-neutral-400 uppercase">{t.scoreLabel}</span>
            <span className="font-code font-bold text-amber-400 tabular-nums">
              {simulation.stats.score}
            </span>
          </div>

          <div className="w-[1px] h-4 bg-neutral-800 hidden sm:block" />

          {/* Quick in-game language switch buttons */}
          <LanguageSelector variant="compact" />

          {/* Quick in-game sound toggle button */}
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className={`p-1 sm:px-2 sm:py-0.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                isMuted
                  ? 'bg-rose-950/80 border border-rose-500 text-rose-300 font-bold'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
              title={isMuted ? 'Увімкнути звук [M]' : 'Вимкнути звук [M]'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="hidden sm:inline font-mono">
                {isMuted ? 'MUTE [M]' : `${Math.round(volume * 100)}%`}
              </span>
            </button>
          )}

          <button
            onClick={onOpenBriefing}
            className="p-1 sm:px-2 sm:py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
            title={t.escHint}
          >
            <Menu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.missionsLabel}</span>
          </button>
        </div>
      </div>

      {/* --- BOTTOM: Streamlined Controls & Weapons (No Clutter) --- */}
      <div className="flex flex-col gap-2 w-full max-w-3xl mx-auto">
        {/* Quick Toggles: Vision & Utilities */}
        <div className="pointer-events-auto flex items-center justify-between gap-2 bg-neutral-950/75 backdrop-blur-md border border-neutral-800/80 px-2.5 py-1.5 rounded-xl text-xs">
          {/* Vision Modes */}
          <div className="flex items-center gap-1 bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={() => setVisionMode('optical')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs flex items-center gap-1 cursor-pointer ${
                visionMode === 'optical'
                  ? 'bg-neutral-100 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{t.opticalMode}</span>
            </button>
            <button
              onClick={() => setVisionMode('thermal')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs flex items-center gap-1 cursor-pointer ${
                visionMode === 'thermal'
                  ? 'bg-emerald-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Crosshair className="w-3 h-3" />
              <span>{t.flirMode}</span>
            </button>
            <button
              onClick={() => setVisionMode('radar')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs flex items-center gap-1 cursor-pointer ${
                visionMode === 'radar'
                  ? 'bg-emerald-400 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>{t.radarMode}</span>
            </button>
          </div>

          {/* Searchlight & Lead Point Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => simulation.toggleSearchlight()}
              className={`px-2.5 py-1 rounded-lg border transition-all text-xs flex items-center gap-1 cursor-pointer ${
                simulation.searchlightOn
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              <span className="hidden sm:inline">{t.searchlightToggle}</span>
            </button>

            <button
              onClick={() => setShowLeadAid((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg border transition-all text-xs flex items-center gap-1 cursor-pointer ${
                showLeadAid
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">{t.leadAidToggle}</span>
            </button>
          </div>
        </div>

        {/* Compact Weapons Toolbar */}
        <div className="pointer-events-auto grid grid-cols-4 gap-1.5 sm:gap-2 bg-neutral-950/85 backdrop-blur-md border border-neutral-800/90 p-1.5 sm:p-2 rounded-2xl shadow-xl">
          {/* 1: Browning */}
          <button
            onClick={() => simulation.switchWeapon('browning')}
            className={`flex flex-col p-2 rounded-xl border text-left transition-all cursor-pointer ${
              currentWeapon === 'browning'
                ? 'bg-neutral-800/90 border-amber-400 shadow-md shadow-amber-950/20'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase">
              <span>[1] {t.weaponBrowningShort.split(' ')[0]}</span>
              <span className="font-code text-neutral-400">12.7</span>
            </div>
            <div className="text-[11px] font-semibold text-neutral-200 truncate">
              {t.weaponBrowningRole}
            </div>
            <div className="mt-0.5 text-[10px] font-code text-emerald-400 font-bold">
              {t.infiniteAmmo}
            </div>
          </button>

          {/* 2: Gepard */}
          <button
            onClick={() => simulation.switchWeapon('gepard')}
            disabled={
              simulation.mission
                ? !simulation.mission.unlockedWeapons.includes('gepard')
                : false
            }
            className={`flex flex-col p-2 rounded-xl border text-left transition-all relative cursor-pointer ${
              simulation.mission && !simulation.mission.unlockedWeapons.includes('gepard')
                ? 'opacity-40 cursor-not-allowed bg-neutral-950 border-neutral-900'
                : currentWeapon === 'gepard'
                ? 'bg-neutral-800/90 border-amber-400 shadow-md shadow-amber-950/20'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase">
              <span>[2] Gepard</span>
              <span className="font-code text-neutral-400">35mm</span>
            </div>
            <div className="text-[11px] font-semibold text-neutral-200 truncate">
              {t.weaponGepardRole}
            </div>
            <div className="mt-0.5 text-[10px] font-code flex items-center justify-between">
              <span
                className={`font-bold tabular-nums ${
                  simulation.weaponAmmo.gepard > 20
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {t.ammoShort} {simulation.weaponAmmo.gepard}
              </span>
              {simulation.weaponAmmo.gepard <= 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onResupply('gepard');
                  }}
                  className="text-amber-400 hover:underline cursor-pointer"
                  title={t.resupplyAmmo}
                >
                  <RotateCcw className="w-2.5 h-2.5 inline" />
                </span>
              )}
            </div>
          </button>

          {/* 3: Stinger */}
          <button
            onClick={() => simulation.switchWeapon('stinger')}
            disabled={
              simulation.mission
                ? !simulation.mission.unlockedWeapons.includes('stinger')
                : false
            }
            className={`flex flex-col p-2 rounded-xl border text-left transition-all cursor-pointer ${
              simulation.mission && !simulation.mission.unlockedWeapons.includes('stinger')
                ? 'opacity-40 cursor-not-allowed bg-neutral-950 border-neutral-900'
                : currentWeapon === 'stinger'
                ? 'bg-neutral-800/90 border-amber-400 shadow-md shadow-amber-950/20'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase">
              <span>[3] Stinger</span>
              <span className="font-code text-neutral-400">IR</span>
            </div>
            <div className="text-[11px] font-semibold text-neutral-200 truncate">
              {t.weaponStingerRole}
            </div>
            <div className="mt-0.5 text-[10px] font-code flex items-center justify-between">
              <span
                className={`font-bold tabular-nums ${
                  simulation.weaponAmmo.stinger > 2 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {t.missilesShort} {simulation.weaponAmmo.stinger}
              </span>
              {simulation.weaponAmmo.stinger <= 2 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onResupply('stinger');
                  }}
                  className="text-amber-400 hover:underline cursor-pointer"
                  title="Reload [R]"
                >
                  <RotateCcw className="w-2.5 h-2.5 inline" />
                </span>
              )}
            </div>
          </button>

          {/* 4: Patriot */}
          <button
            onClick={() => simulation.switchWeapon('patriot')}
            disabled={
              simulation.mission
                ? !simulation.mission.unlockedWeapons.includes('patriot')
                : false
            }
            className={`flex flex-col p-2 rounded-xl border text-left transition-all cursor-pointer ${
              simulation.mission && !simulation.mission.unlockedWeapons.includes('patriot')
                ? 'opacity-40 cursor-not-allowed bg-neutral-950 border-neutral-900'
                : currentWeapon === 'patriot'
                ? 'bg-neutral-800/90 border-sky-400 shadow-md shadow-sky-950/20'
                : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-sky-400 uppercase">
              <span>[4] Patriot</span>
              <span className="font-code text-rose-400">ABM</span>
            </div>
            <div className="text-[11px] font-semibold text-neutral-200 truncate">
              {t.weaponPatriotRole}
            </div>
            <div className="mt-0.5 text-[10px] font-code flex items-center justify-between">
              <span
                className={`font-bold tabular-nums ${
                  simulation.weaponAmmo.patriot > 2 ? 'text-sky-400' : 'text-rose-400'
                }`}
              >
                {t.missilesShort} {simulation.weaponAmmo.patriot}
              </span>
              {simulation.weaponAmmo.patriot <= 2 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onResupply('patriot');
                  }}
                  className="text-amber-400 hover:underline cursor-pointer"
                  title="Reload [R]"
                >
                  <RotateCcw className="w-2.5 h-2.5 inline" />
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Barrel Heat Line */}
        {(currentWeapon === 'browning' || currentWeapon === 'gepard') && (
          <div className="flex items-center gap-2 bg-neutral-950/70 border border-neutral-800/80 px-2.5 py-1 rounded-xl w-full max-w-sm mx-auto text-[10px]">
            <Flame
              className={`w-3 h-3 ${
                simulation.isOverheated
                  ? 'text-rose-500 animate-bounce'
                  : simulation.weaponHeat > 60
                  ? 'text-amber-400'
                  : 'text-neutral-400'
              }`}
            />
            <span className="text-neutral-400 font-bold uppercase">{t.heatLabel}</span>
            <div className="flex-1 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className={`h-full transition-all duration-75 ${
                  simulation.isOverheated
                    ? 'bg-rose-600'
                    : simulation.weaponHeat > 70
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
                }`}
                style={{ width: `${simulation.weaponHeat}%` }}
              />
            </div>
            <span
              className={`font-code font-bold ${
                simulation.isOverheated ? 'text-rose-400' : 'text-neutral-400'
              }`}
            >
              {simulation.isOverheated ? t.overheatedLabel : `${Math.round(simulation.weaponHeat)}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
