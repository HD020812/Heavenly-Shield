/**
 * Небесний Щит: Симулятор сил протиповітряної оборони
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Simulation } from './game/simulation';
import { SkyCanvas } from './game/SkyCanvas';
import { HUD } from './components/HUD';
import { MissionBriefingModal } from './components/MissionBriefingModal';
import { AfterActionReportModal } from './components/AfterActionReportModal';
import { SettingsModal } from './components/SettingsModal';
import { LanguageSelector } from './components/LanguageSelector';
import { StoryCampaignModal } from './components/StoryCampaignModal';
import { StoryTransmissionOverlay } from './components/StoryTransmissionOverlay';
import { StoryChapter } from './story/types';
import { STORY_CHAPTERS } from './story/storyData';
import { recordChapterClear } from './story/storyStorage';
import { chapterToMission } from './story/storyHelper';
import { MISSIONS, CITY_SECTORS, WEAPON_CONFIGS } from './game/constants';
import { VisionMode, Mission, GameState } from './types/game';
import { soundEngine } from './audio/soundEngine';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import {
  Shield,
  Volume2,
  VolumeX,
  Sliders,
  Play,
  Crosshair,
  Skull,
  Award,
} from 'lucide-react';

function GameApp() {
  const { t, language } = useTranslation();

  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [currentMission, setCurrentMission] = useState<Mission | null>(MISSIONS[0]);
  const [isEndless, setIsEndless] = useState<boolean>(false);
  const [visionMode, setVisionMode] = useState<VisionMode>('optical');
  const [showLeadAid, setShowLeadAid] = useState<boolean>(true);
  const [showBriefingModal, setShowBriefingModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showStoryCampaignModal, setShowStoryCampaignModal] = useState<boolean>(false);
  const [isStoryMode, setIsStoryMode] = useState<boolean>(false);
  const [activeStoryChapter, setActiveStoryChapter] = useState<StoryChapter | null>(null);

  // Audio state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);

  // Crosshair coordinates
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.45,
  });

  // Continuous firing state
  const isMouseDownRef = useRef<boolean>(false);
  const fireIntervalRef = useRef<number | null>(null);

  // Persistent Simulation Engine instance
  const [simulation, setSimulation] = useState<Simulation>(() => {
    return new Simulation(MISSIONS[0], CITY_SECTORS, false);
  });

  // Sync simulation triggers with React state (victory, defeat)
  const [, setTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);

      if (gameState === 'PLAYING') {
        if (simulation.missionCompleted || simulation.missionFailed) {
          if (isStoryMode && activeStoryChapter && simulation.missionCompleted) {
            const totalCityHealth = simulation.sectors.reduce((acc, s) => acc + s.health, 0);
            const maxCityHealth = simulation.sectors.length * 100;
            const cityHealthPct = Math.round((totalCityHealth / maxCityHealth) * 100);

            recordChapterClear(activeStoryChapter.id, {
              score: simulation.stats.score,
              cityIntegrityRemaining: cityHealthPct,
              bossDefeated: simulation.stats.bossDefeated,
              targetsDestroyed: simulation.stats.targetsDestroyed,
            });
          }
          setGameState('AFTER_ACTION');
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [gameState, simulation, isStoryMode, activeStoryChapter]);

  // Global user-gesture audio unlocker & resume on tab visibility
  useEffect(() => {
    const unlockAudio = () => {
      soundEngine.ensureContext();
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('click', unlockAudio, { passive: true });

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        soundEngine.resume();
      }
    };
    const handleFocus = () => {
      soundEngine.resume();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('click', unlockAudio);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Start or restart a specific mission
  const startMission = useCallback(
    (mission: Mission | null, endlessMode: boolean = false) => {
      soundEngine.unlockAudio().then(() => {
        soundEngine.playRadioBeep();
      });
      setIsStoryMode(false);
      setActiveStoryChapter(null);
      const newSim = new Simulation(mission, CITY_SECTORS, endlessMode);
      setSimulation(newSim);
      setCurrentMission(mission);
      setIsEndless(endlessMode);
      setShowBriefingModal(false);
      setShowStoryCampaignModal(false);
      setGameState('PLAYING');
    },
    []
  );

  // Start a specific Story Chapter
  const startStoryChapter = useCallback(
    (chapter: StoryChapter) => {
      soundEngine.unlockAudio().then(() => {
        soundEngine.playRadioBeep();
      });
      setIsStoryMode(true);
      setActiveStoryChapter(chapter);
      const mission = chapterToMission(chapter, language);
      const newSim = new Simulation(mission, CITY_SECTORS, false);
      setSimulation(newSim);
      setCurrentMission(mission);
      setIsEndless(false);
      setShowBriefingModal(false);
      setShowStoryCampaignModal(false);
      setGameState('PLAYING');
    },
    [language]
  );

  // Weapon fire execution
  const executeFire = useCallback(
    (x: number, y: number) => {
      if (gameState !== 'PLAYING') return;
      soundEngine.init();
      soundEngine.resume();
      simulation.fireCurrentWeapon(x, y, window.innerWidth, window.innerHeight);
    },
    [gameState, simulation]
  );

  // Mouse / Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setCrosshairPos({ x: e.clientX, y: e.clientY });
  };

  // Continuous pointer down / fire
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING') return;
    // Don't fire if clicking interactive UI buttons
    if ((e.target as HTMLElement).closest('button, input')) return;

    isMouseDownRef.current = true;
    executeFire(e.clientX, e.clientY);

    const config = WEAPON_CONFIGS[simulation.currentWeapon];
    if (config.fireRate > 2) {
      if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
      fireIntervalRef.current = window.setInterval(() => {
        if (isMouseDownRef.current) {
          executeFire(crosshairPos.x, crosshairPos.y);
        }
      }, 1000 / config.fireRate);
    }
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
    if (fireIntervalRef.current) {
      clearInterval(fireIntervalRef.current);
      fireIntervalRef.current = null;
    }
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === '1') {
        simulation.switchWeapon('browning');
      } else if (e.key === '2') {
        simulation.switchWeapon('gepard');
      } else if (e.key === '3') {
        simulation.switchWeapon('stinger');
      } else if (e.key === '4') {
        simulation.switchWeapon('patriot');
      } else if (e.key === ' ') {
        e.preventDefault();
        simulation.toggleSearchlight();
      } else if (e.key === 'Tab' || e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setVisionMode((prev) =>
          prev === 'optical' ? 'thermal' : prev === 'thermal' ? 'radar' : 'optical'
        );
      } else if (e.key.toLowerCase() === 'r') {
        simulation.reloadAllWeapons();
      } else if (e.key.toLowerCase() === 'm' || e.code === 'KeyM') {
        const next = soundEngine.toggleMute();
        setIsMuted(next);
      } else if (e.key === 'Escape') {
        if (gameState === 'PLAYING') {
          setShowBriefingModal((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [simulation, gameState]);

  // Next Mission progression
  const handleNextMission = () => {
    if (isStoryMode && activeStoryChapter) {
      const currentIdx = STORY_CHAPTERS.findIndex((c) => c.id === activeStoryChapter.id);
      if (currentIdx !== -1 && currentIdx + 1 < STORY_CHAPTERS.length) {
        startStoryChapter(STORY_CHAPTERS[currentIdx + 1]);
        return;
      } else {
        // Completed entire campaign!
        setShowStoryCampaignModal(true);
        setGameState('TITLE_MENU');
        return;
      }
    }

    if (!currentMission) {
      startMission(MISSIONS[0], false);
      return;
    }
    const nextIdx = MISSIONS.findIndex((m) => m.id === currentMission.id) + 1;
    if (nextIdx < MISSIONS.length) {
      startMission(MISSIONS[nextIdx], false);
    } else {
      // Completed all missions, start endless
      startMission(null, true);
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans select-none"
    >
      {/* --- TOP BAR NAVIGATION (Only in Menu / Briefing) --- */}
      {gameState === 'TITLE_MENU' && (
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
          {/* Zone 1: Brand title, one line */}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
            <h1 className="text-sm sm:text-base font-bold tracking-wider font-hud text-neutral-100 uppercase whitespace-nowrap">
              {t.appTitle}
            </h1>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-300">
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowStoryCampaignModal(true);
              }}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t.storyMode}</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowBriefingModal(true);
              }}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {t.scenarios}
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                startMission(MISSIONS[4], false);
              }}
              className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Skull className="w-3.5 h-3.5" />
              <span>{t.bossButton}</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                startMission(null, true);
              }}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              {t.endlessMode}
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowSettingsModal(true);
              }}
              className="hover:text-neutral-100 transition-colors cursor-pointer"
            >
              {t.controls}
            </button>
          </nav>

          {/* Zone 3: Actions + Translation Buttons */}
          <div className="flex items-center gap-2">
            {/* Top Bar Language Selector */}
            <LanguageSelector variant="compact" />

            <button
              onClick={async () => {
                if (isMuted) {
                  setIsMuted(false);
                  soundEngine.setMuted(false);
                  await soundEngine.playTestChime();
                } else {
                  const next = soundEngine.toggleMute();
                  setIsMuted(next);
                }
              }}
              className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isMuted
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title={isMuted ? 'Увімкнути звук [M]' : 'Вимкнути звук [M]'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span className="text-xs font-mono hidden sm:inline">
                {isMuted ? 'MUTE [M]' : `${Math.round(volume * 100)}%`}
              </span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title={t.settings}
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </header>
      )}

      {/* --- SIMULATION CANVAS & FLIR SCANLINES --- */}
      <SkyCanvas
        simulation={simulation}
        visionMode={visionMode}
        showLeadAid={showLeadAid}
        onFire={executeFire}
        crosshairPos={crosshairPos}
      />

      {/* Scanline CRT overlay for night sensor feel */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          visionMode === 'thermal'
            ? 'flir-scanlines opacity-50'
            : visionMode === 'radar'
            ? 'scanlines opacity-40'
            : 'scanlines opacity-20'
        }`}
      />

      {/* --- PLAYING STATE: IMMERSIVE CLEAN HUD (NO CLUTTER WINDOWS) --- */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            simulation={simulation}
            visionMode={visionMode}
            setVisionMode={setVisionMode}
            showLeadAid={showLeadAid}
            setShowLeadAid={setShowLeadAid}
            onResupply={(w) => simulation.resupplyWeapon(w)}
            onOpenBriefing={() => setShowBriefingModal(true)}
            isMuted={isMuted}
            volume={volume}
            onToggleMute={() => {
              const next = soundEngine.toggleMute();
              setIsMuted(next);
            }}
          />

          {/* Story Mode In-Mission Transmissions */}
          {isStoryMode && activeStoryChapter && (
            <StoryTransmissionOverlay
              missionTimer={simulation.missionTimer}
              transmissions={activeStoryChapter.transmissions}
            />
          )}
        </>
      )}

      {/* --- TITLE MENU OVERLAY --- */}
      {gameState === 'TITLE_MENU' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-neutral-950/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-neutral-950/95 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center overflow-hidden">
            {/* Background accent image */}
            <div className="absolute inset-0 -z-10 opacity-20">
              <img
                src="/src/assets/images/skyline_night_radar_1791394269892.jpg"
                alt="Defended Night Skyline"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>{t.defenseForcesBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-hud text-neutral-100 tracking-wide mb-2 uppercase">
              {t.titleHero}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto mb-5 font-medium leading-relaxed">
              {t.gameDescription}
            </p>

            {/* Language Selection Buttons prominently featured */}
            <div className="flex items-center justify-center mb-4">
              <LanguageSelector variant="large" showLabel={true} />
            </div>

            {/* Audio Check / Quick Unlock & Test Chime */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={async () => {
                  setIsMuted(false);
                  await soundEngine.playTestChime();
                }}
                className="py-2 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold font-hud uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md shadow-emerald-950/40"
              >
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>
                  {language === 'en'
                    ? '🔊 Test Audio (Click to verify sound)'
                    : language === 'ru'
                    ? '🔊 Проверить звук (Кликните для проверки)'
                    : '🔊 Перевірити звук (Клікніть для перевірки)'}
                </span>
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col gap-3 max-w-lg mx-auto mb-8">
              {/* Primary Story Mode CTA */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowStoryCampaignModal(true);
                }}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-neutral-950 font-black font-hud rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-2xl shadow-amber-950/60 cursor-pointer active:scale-[0.99] border border-amber-300/40"
              >
                <Award className="w-4 sm:w-5 h-4 sm:h-5 text-neutral-950 shrink-0" />
                <span className="tracking-wide uppercase text-sm">{t.btnStoryMode}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-950/20 text-neutral-950 uppercase font-mono ml-1">
                  6 ОПЕРАЦІЙ
                </span>
              </button>

              {/* Secondary Buttons Row */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => startMission(MISSIONS[0], false)}
                  className="w-full sm:flex-1 py-2.5 px-3 bg-neutral-900/90 hover:bg-neutral-800 text-emerald-400 border border-emerald-500/30 font-bold font-hud rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.btnStartDefense}</span>
                </button>

                <button
                  onClick={() => startMission(MISSIONS[4], false)}
                  className="w-full sm:flex-1 py-2.5 px-3 bg-rose-950/70 hover:bg-rose-900/70 text-rose-300 font-bold font-hud rounded-xl text-xs border border-rose-500/40 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 cursor-pointer animate-pulse"
                >
                  <Skull className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.btnBossOreshnik}</span>
                </button>

                <button
                  onClick={() => setShowBriefingModal(true)}
                  className="w-full sm:flex-1 py-2.5 px-3 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 font-semibold font-hud rounded-xl text-xs border border-neutral-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.btnMissionHq}</span>
                </button>
              </div>
            </div>

            {/* Quick feature callouts */}
            <div className="grid grid-cols-3 gap-3 text-left pt-4 border-t border-neutral-800/80">
              <div className="p-2.5 bg-neutral-900/50 rounded-xl border border-neutral-800/60">
                <div className="text-[10px] text-neutral-400 uppercase font-bold mb-0.5">
                  {t.featureVision}
                </div>
                <div className="text-xs text-neutral-200 font-hud">
                  {t.featureVisionDesc}
                </div>
              </div>
              <div className="p-2.5 bg-neutral-900/50 rounded-xl border border-neutral-800/60">
                <div className="text-[10px] text-neutral-400 uppercase font-bold mb-0.5">
                  {t.featureArsenal}
                </div>
                <div className="text-xs text-neutral-200 font-hud">
                  {t.featureArsenalDesc}
                </div>
              </div>
              <div className="p-2.5 bg-neutral-900/50 rounded-xl border border-neutral-800/60">
                <div className="text-[10px] text-neutral-400 uppercase font-bold mb-0.5">
                  {t.featureThreats}
                </div>
                <div className="text-xs text-neutral-200 font-hud">
                  {t.featureThreatsDesc}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- AFTER ACTION REPORT (VICTORY / DEFEAT) --- */}
      <AfterActionReportModal
        isOpen={gameState === 'AFTER_ACTION'}
        isVictory={simulation.missionCompleted}
        stats={simulation.stats}
        mission={currentMission}
        sectors={simulation.sectors}
        onRestart={() =>
          isStoryMode && activeStoryChapter
            ? startStoryChapter(activeStoryChapter)
            : startMission(currentMission, isEndless)
        }
        onNextMission={handleNextMission}
        onOpenMissions={() => {
          setGameState('BRIEFING');
          setShowBriefingModal(true);
        }}
        isStoryMode={isStoryMode}
        storyChapterCode={activeStoryChapter?.code}
        onOpenCampaign={() => {
          setGameState('TITLE_MENU');
          setShowStoryCampaignModal(true);
        }}
      />

      {/* --- STORY CAMPAIGN HQ MODAL --- */}
      <StoryCampaignModal
        isOpen={showStoryCampaignModal}
        onClose={() => setShowStoryCampaignModal(false)}
        onSelectChapter={startStoryChapter}
        activeChapterId={activeStoryChapter?.id}
      />

      {/* --- MISSION BRIEFING MODAL --- */}
      <MissionBriefingModal
        isOpen={showBriefingModal || gameState === 'BRIEFING'}
        onSelectMission={startMission}
        onClose={() => {
          setShowBriefingModal(false);
          if (gameState === 'BRIEFING') {
            setGameState(simulation.targets.length > 0 ? 'PLAYING' : 'TITLE_MENU');
          }
        }}
        activeMissionId={currentMission?.id}
      />

      {/* --- SETTINGS & CONTROLS MODAL --- */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        showLeadAid={showLeadAid}
        setShowLeadAid={setShowLeadAid}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <GameApp />
    </LanguageProvider>
  );
}
