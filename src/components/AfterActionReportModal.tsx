import React, { useEffect } from 'react';
import { GameStats, Mission, CitySector } from '../types/game';
import confetti from 'canvas-confetti';
import { useTranslation } from '../i18n/LanguageContext';
import {
  ShieldCheck,
  ShieldX,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';

interface AfterActionReportModalProps {
  isOpen: boolean;
  isVictory: boolean;
  stats: GameStats;
  mission: Mission | null;
  sectors: CitySector[];
  onRestart: () => void;
  onNextMission?: () => void;
  onOpenMissions: () => void;
  isStoryMode?: boolean;
  storyChapterCode?: string;
  onOpenCampaign?: () => void;
}

export const AfterActionReportModal: React.FC<AfterActionReportModalProps> = ({
  isOpen,
  isVictory,
  stats,
  mission,
  sectors,
  onRestart,
  onNextMission,
  onOpenMissions,
  isStoryMode = false,
  storyChapterCode,
  onOpenCampaign,
}) => {
  const { t, getRankTitle, getSectorName, language } = useTranslation();

  useEffect(() => {
    if (isOpen && isVictory) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#38bdf8', '#facc15'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  const totalDestroyed =
    (stats.targetsDestroyed.fpv || 0) +
    (stats.targetsDestroyed.geran2 || 0) +
    (stats.targetsDestroyed.gerbera || 0) +
    (stats.targetsDestroyed.geran4_seeker || 0) +
    (stats.targetsDestroyed.geran5_seeker || 0) +
    (stats.targetsDestroyed.banderol || 0) +
    (stats.targetsDestroyed.kh101_kalibr || 0) +
    (stats.targetsDestroyed.zircon || 0) +
    (stats.targetsDestroyed.kinzhal || 0) +
    (stats.targetsDestroyed.iskander || 0) +
    (stats.targetsDestroyed.oreshnik_boss || 0);

  const accuracyPct =
    stats.shotsFired > 0
      ? Math.round((stats.shotsHit / stats.shotsFired) * 100)
      : 0;

  const totalCityHealth = sectors.reduce((acc, s) => acc + s.health, 0);
  const maxCityHealth = sectors.length * 100;
  const cityHealthPct = Math.round((totalCityHealth / maxCityHealth) * 100);

  const rankTitle = getRankTitle(
    isVictory,
    stats.bossDefeated,
    cityHealthPct,
    accuracyPct
  );

  const reportHeader = isVictory
    ? language === 'en'
      ? 'RAID REPELLED! CLEAR SKIES'
      : language === 'ru'
      ? 'НАЛЕТ ОТБИТ! ЧИСТОЕ НЕБО'
      : 'НАЛІТ ВІДБИТО! ЧИСТЕ НЕБО'
    : language === 'en'
    ? 'SECTOR CRITICAL BREACH'
    : language === 'ru'
    ? 'КРИТИЧЕСКИЙ ПРОРЫВ СЕКТОРА'
    : 'КРИТИЧНЕ ПОШКОДЖЕННЯ СЕКТОРУ';

  const reportSubtitle =
    language === 'en'
      ? 'Air Defense Combat Shift Report'
      : language === 'ru'
      ? 'Отчет боевого дежурства'
      : 'Звіт бойового чергування';

  const dronesLabel =
    language === 'en' ? 'Drones & UAVs' : language === 'ru' ? 'Дроны и БПЛА' : 'Дрони & БПЛА';

  const missilesLabel =
    language === 'en'
      ? 'Missiles & ORESHNIK'
      : language === 'ru'
      ? 'Ракеты и ОРЕШНИК'
      : 'Ракети & ОРЕШНИК';

  const streakLabel =
    language === 'en' ? 'Max Streak' : language === 'ru' ? 'Макс. Серия' : 'Макс. Серія';

  const sectorsHeader =
    language === 'en'
      ? 'Grid & District Status:'
      : language === 'ru'
      ? 'Состояние энергосистемы и районов:'
      : 'Стан енергосистеми та районів:';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Banner Glow */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isVictory ? 'bg-emerald-500' : 'bg-rose-600'
          }`}
        />

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div
            className={`p-3 rounded-2xl border ${
              isVictory
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {isVictory ? <ShieldCheck className="w-8 h-8" /> : <ShieldX className="w-8 h-8" />}
          </div>
          <div>
            <div className="text-xs uppercase font-hud tracking-widest text-neutral-400">
              {reportSubtitle}
            </div>
            <h2 className="text-xl font-bold font-hud text-neutral-100">
              {reportHeader}
            </h2>
            <div
              className={`text-xs font-semibold mt-0.5 ${
                isVictory ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {rankTitle}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-xl text-center">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              {t.totalDestroyedLabel}
            </div>
            <div className="text-lg font-bold font-code text-emerald-400 tabular-nums">
              {totalDestroyed}
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-xl text-center">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              {t.shotsAccuracyLabel}
            </div>
            <div className="text-lg font-bold font-code text-amber-400 tabular-nums">
              {accuracyPct}%
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-xl text-center">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              {t.citySavedLabel}
            </div>
            <div className="text-lg font-bold font-code text-sky-400 tabular-nums">
              {cityHealthPct}%
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-xl text-center">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              {dronesLabel}
            </div>
            <div className="text-base font-bold font-code text-neutral-200 tabular-nums">
              {(stats.targetsDestroyed.fpv || 0) +
                (stats.targetsDestroyed.geran2 || 0) +
                (stats.targetsDestroyed.gerbera || 0) +
                (stats.targetsDestroyed.geran4_seeker || 0) +
                (stats.targetsDestroyed.geran5_seeker || 0) +
                (stats.targetsDestroyed.banderol || 0)}
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-xl text-center">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              {missilesLabel}
            </div>
            <div className="text-base font-bold font-code text-rose-400 tabular-nums">
              {(stats.targetsDestroyed.kh101_kalibr || 0) +
                (stats.targetsDestroyed.zircon || 0) +
                (stats.targetsDestroyed.kinzhal || 0) +
                (stats.targetsDestroyed.iskander || 0) +
                (stats.targetsDestroyed.oreshnik_boss || 0)}
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800/80 p-3 rounded-xl text-center">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
              {streakLabel}
            </div>
            <div className="text-base font-bold font-code text-amber-400 tabular-nums">
              {stats.highestStreak}x
            </div>
          </div>
        </div>

        {/* Protected Sectors Status */}
        <div className="bg-neutral-900/40 border border-neutral-800/80 p-3 rounded-xl mb-5">
          <div className="text-[11px] text-neutral-400 font-semibold mb-2 flex items-center justify-between">
            <span>{sectorsHeader}</span>
            <span className="font-code text-neutral-300">{cityHealthPct}%</span>
          </div>
          <div className="space-y-1.5">
            {sectors.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 truncate max-w-[200px]">
                  {getSectorName(s.id, s.name)}
                </span>
                <span
                  className={`font-code font-bold ${
                    s.health > 50
                      ? 'text-emerald-400'
                      : s.health > 0
                      ? 'text-amber-400'
                      : 'text-rose-500'
                  }`}
                >
                  {s.health}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isVictory && onNextMission ? (
            <button
              onClick={onNextMission}
              className="w-full sm:flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold font-hud rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/30 cursor-pointer"
            >
              <span>
                {isStoryMode
                  ? language === 'en'
                    ? 'NEXT STORY CHAPTER'
                    : language === 'ru'
                    ? 'СЛЕДУЮЩАЯ ГЛАВА'
                    : 'НАСТУПНА ГЛАВА'
                  : t.btnNextMission}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRestart}
              className="w-full sm:flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold font-hud rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-950/30 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.btnRetryMission}</span>
            </button>
          )}

          {isStoryMode && onOpenCampaign ? (
            <button
              onClick={onOpenCampaign}
              className="w-full sm:w-auto py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors cursor-pointer"
            >
              {language === 'en'
                ? 'CAMPAIGN MAP'
                : language === 'ru'
                ? 'КАРТА СЮЖЕТА'
                : 'КАРТА СЮЖЕТУ'}
            </button>
          ) : (
            <button
              onClick={onOpenMissions}
              className="w-full sm:w-auto py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-800 transition-colors cursor-pointer"
            >
              {t.btnReturnHq}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
