import React, { useState, useEffect } from 'react';
import { StoryChapter, CampaignProgress, StoryCharacter } from '../story/types';
import { STORY_CHAPTERS, STORY_CHARACTERS, CAMPAIGN_MEDALS } from '../story/storyData';
import { loadCampaignProgress, resetCampaignProgress } from '../story/storyStorage';
import { useTranslation } from '../i18n/LanguageContext';
import { soundEngine } from '../audio/soundEngine';
import {
  Shield,
  Star,
  Lock,
  Play,
  Award,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Skull,
  Crosshair,
  Zap,
  RotateCcw,
  X,
  ChevronRight,
  Target,
  Flame,
} from 'lucide-react';

interface StoryCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (chapter: StoryChapter) => void;
  activeChapterId?: string;
}

export const StoryCampaignModal: React.FC<StoryCampaignModalProps> = ({
  isOpen,
  onClose,
  onSelectChapter,
  activeChapterId,
}) => {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'chapters' | 'characters' | 'medals'>('chapters');
  const [progress, setProgress] = useState<CampaignProgress>(loadCampaignProgress);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    activeChapterId || STORY_CHAPTERS[0].id
  );

  useEffect(() => {
    if (isOpen) {
      setProgress(loadCampaignProgress());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedChapter =
    STORY_CHAPTERS.find((c) => c.id === selectedChapterId) || STORY_CHAPTERS[0];

  const isChapterUnlocked = (id: string) => progress.unlockedChapters.includes(id);

  // Total stars count
  const totalStars = Object.values(progress.chapterRecords).reduce(
    (acc, r) => acc + (r.stars || 0),
    0
  );
  const maxStars = STORY_CHAPTERS.length * 3;
  const completedChaptersCount = Object.keys(progress.chapterRecords).length;

  const handleStartChapter = (chapter: StoryChapter) => {
    if (!isChapterUnlocked(chapter.id)) return;
    soundEngine.playClick();
    onSelectChapter(chapter);
  };

  const handleReset = () => {
    const confirmText =
      language === 'en'
        ? 'Reset campaign progress and start from Chapter 1?'
        : language === 'ru'
        ? 'Сбросить прогресс сюжетной кампании и начать с Главы 1?'
        : 'Скинути прогрес сюжетної кампанії та почати з Глави 1?';

    if (window.confirm(confirmText)) {
      const next = resetCampaignProgress();
      setProgress(next);
      setSelectedChapterId(STORY_CHAPTERS[0].id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Штаб сюжетної кампанії ППО"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in select-none"
    >
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-neutral-950 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
        {/* Background accent image */}
        <div className="absolute inset-0 -z-10 opacity-15 pointer-events-none">
          <img
            src="/src/assets/images/campaign_command_center_1791827662356.jpg"
            alt="Tactical Command Room"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* --- MODAL HEADER --- */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-hud uppercase tracking-wider text-neutral-100">
                  {language === 'en'
                    ? 'Sky Defender: Story Campaign'
                    : language === 'ru'
                    ? 'Небесный Щит: Сюжетный режим'
                    : 'Небесний Щит: Сюжетна кампанія'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {completedChaptersCount}/{STORY_CHAPTERS.length} ОПЕРАЦІЙ
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium">
                {language === 'en'
                  ? 'Strategic Air Defense Operations & Storyline'
                  : language === 'ru'
                  ? 'Стратегические операции ПВО и военный сюжет'
                  : 'Стратегічні операції ППО та сюжетна лінія оборони'}
              </p>
            </div>
          </div>

          {/* Stats Badges & Close Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>
                  {totalStars}/{maxStars}
                </span>
              </div>
              <div className="w-px h-3 bg-neutral-700" />
              <div className="flex items-center gap-1 text-sky-400 font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>{progress.unlockedMedals.length}/7</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* --- NAVIGATION TABS --- */}
        <nav className="flex items-center gap-2 px-5 py-2.5 border-b border-neutral-800/80 bg-neutral-900/40 text-xs font-hud uppercase tracking-wider">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('chapters');
            }}
            className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'chapters'
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {language === 'en'
                ? 'Operations & Chapters'
                : language === 'ru'
                ? 'Операции и главы'
                : 'Операції та глави'}
            </span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('characters');
            }}
            className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>
              {language === 'en'
                ? 'HQ Staff & Operatives'
                : language === 'ru'
                ? 'Штаб и офицеры'
                : 'Особовий склад штабу'}
            </span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('medals');
            }}
            className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'medals'
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              {language === 'en'
                ? 'Combat Medals'
                : language === 'ru'
                ? 'Боевые награды'
                : 'Бойові нагороди'}
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/20 text-amber-300 font-mono">
              {progress.unlockedMedals.length}
            </span>
          </button>

          <div className="ml-auto">
            <button
              onClick={handleReset}
              className="text-[10px] text-neutral-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer font-sans normal-case"
              title="Reset campaign"
            >
              <RotateCcw className="w-3 h-3" />
              <span>
                {language === 'en'
                  ? 'Reset Progress'
                  : language === 'ru'
                  ? 'Сброс кампании'
                  : 'Скинути прогрес'}
              </span>
            </button>
          </div>
        </nav>

        {/* --- MAIN TAB CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {/* === TAB 1: CHAPTERS & TIMELINE === */}
          {activeTab === 'chapters' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
              {/* Left Column: Chapters Timeline List */}
              <div className="lg:col-span-5 flex flex-col gap-2.5 overflow-y-auto pr-1">
                <div className="text-[11px] font-bold font-hud uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>
                    {language === 'en'
                      ? 'Operational Timeline'
                      : language === 'ru'
                      ? 'Хронология операций'
                      : 'Хронологія операцій'}
                  </span>
                  <span className="text-neutral-500 font-mono">6 ЧАСТИН</span>
                </div>

                {STORY_CHAPTERS.map((chapter) => {
                  const unlocked = isChapterUnlocked(chapter.id);
                  const isSelected = selectedChapter.id === chapter.id;
                  const record = progress.chapterRecords[chapter.id];

                  const title =
                    language === 'en'
                      ? chapter.title.en
                      : language === 'ru'
                      ? chapter.title.ru
                      : chapter.title.uk;

                  const subtitle =
                    language === 'en'
                      ? chapter.subtitle.en
                      : language === 'ru'
                      ? chapter.subtitle.ru
                      : chapter.subtitle.uk;

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedChapterId(chapter.id);
                      }}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-neutral-900 border-emerald-500/80 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/40'
                          : unlocked
                          ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80'
                          : 'bg-neutral-950/40 border-neutral-900/80 opacity-60'
                      }`}
                    >
                      {/* Top row: Code + Time + Status */}
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              isSelected
                                ? 'text-emerald-400'
                                : unlocked
                                ? 'text-neutral-300'
                                : 'text-neutral-600'
                            }`}
                          >
                            {chapter.code}
                          </span>
                          <span className="text-neutral-500">· {chapter.timeLabel}</span>
                        </div>

                        {record ? (
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3 h-3 ${
                                  starIdx <= record.stars
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-neutral-700'
                                }`}
                              />
                            ))}
                            <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-500/10 text-[9px] font-hud text-amber-300">
                              {record.rank}
                            </span>
                          </div>
                        ) : unlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                            ДОСТУПНО
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 text-neutral-600 text-[10px]">
                            <Lock className="w-3 h-3" />
                            <span>ЗАКРИТО</span>
                          </div>
                        )}
                      </div>

                      {/* Main Title */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-bold font-hud text-neutral-100">
                          {title}
                        </h3>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-neutral-600'
                          }`}
                        />
                      </div>

                      {/* Subtitle */}
                      <p className="text-[11px] text-neutral-400 line-clamp-1">{subtitle}</p>

                      {/* Active indicator bar */}
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Selected Chapter Tactical Briefing & Deploy */}
              <div className="lg:col-span-7 flex flex-col bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 overflow-y-auto">
                {/* Chapter Banner & Meta */}
                <div className="relative rounded-xl overflow-hidden border border-neutral-800/80 mb-4 bg-neutral-950 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {selectedChapter.code}
                    </span>
                    <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                      <span>{selectedChapter.timeLabel}</span>
                      <span>·</span>
                      <span className="text-amber-400 uppercase font-bold">
                        {selectedChapter.difficulty}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black font-hud text-neutral-100 mb-1">
                    {language === 'en'
                      ? selectedChapter.title.en
                      : language === 'ru'
                      ? selectedChapter.title.ru
                      : selectedChapter.title.uk}
                  </h3>

                  <p className="text-xs text-neutral-300 font-medium">
                    {language === 'en'
                      ? selectedChapter.subtitle.en
                      : language === 'ru'
                      ? selectedChapter.subtitle.ru
                      : selectedChapter.subtitle.uk}
                  </p>
                </div>

                {/* Narrative Lore Dispatch */}
                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-hud mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>
                      {language === 'en'
                        ? 'Operational Intelligence Briefing'
                        : language === 'ru'
                        ? 'Оперативная сводка разведки'
                        : 'Оперативне зведення розвідки'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {language === 'en'
                      ? selectedChapter.narrativeBriefing.en
                      : language === 'ru'
                      ? selectedChapter.narrativeBriefing.ru
                      : selectedChapter.narrativeBriefing.uk}
                  </p>
                </div>

                {/* Tactical Mission Objective */}
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-hud mb-1.5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>
                      {language === 'en'
                        ? 'Tactical Objective & Instructions'
                        : language === 'ru'
                        ? 'Боевая задача и инструкции'
                        : 'Бойове завдання та інструкції'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {language === 'en'
                      ? selectedChapter.tacticalObjective.en
                      : language === 'ru'
                      ? selectedChapter.tacticalObjective.ru
                      : selectedChapter.tacticalObjective.uk}
                  </p>
                </div>

                {/* Threats & Weapons Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* Threats */}
                  <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                    <div className="text-[10px] font-bold text-rose-400 uppercase font-hud mb-1.5 flex items-center gap-1">
                      <Skull className="w-3 h-3" />
                      <span>
                        {language === 'en'
                          ? 'Expected Threats'
                          : language === 'ru'
                          ? 'Ожидаемые угрозы'
                          : 'Очікувані загрози'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedChapter.targetTypes.map((tType) => (
                        <span
                          key={tType}
                          className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300 uppercase"
                        >
                          {tType.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Authorized Weapons */}
                  <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
                    <div className="text-[10px] font-bold text-sky-400 uppercase font-hud mb-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>
                        {language === 'en'
                          ? 'Authorized Weapons'
                          : language === 'ru'
                          ? 'Доступный арсенал'
                          : 'Дозволений арсенал'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedChapter.unlockedWeapons.map((wpn) => (
                        <span
                          key={wpn}
                          className="px-2 py-0.5 rounded bg-sky-950/40 border border-sky-500/30 text-[10px] font-mono text-sky-300 uppercase font-bold"
                        >
                          {wpn}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Deployment Button */}
                <div className="mt-auto pt-2">
                  {isChapterUnlocked(selectedChapter.id) ? (
                    <button
                      onClick={() => handleStartChapter(selectedChapter)}
                      className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-neutral-950 font-black font-hud rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>
                        {language === 'en'
                          ? `Deploy to ${selectedChapter.code}`
                          : language === 'ru'
                          ? `Начать операцию: ${selectedChapter.code}`
                          : `Розпочати операцію: ${selectedChapter.code}`}
                      </span>
                    </button>
                  ) : (
                    <div className="w-full py-3 px-4 bg-neutral-950 border border-neutral-800 text-neutral-500 rounded-xl text-xs font-mono text-center flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>
                        {language === 'en'
                          ? 'Chapter Locked — Complete previous chapter to proceed'
                          : language === 'ru'
                          ? 'Глава заблокирована — завершите предыдущую операцию'
                          : 'Глава заблокована — завершіть попередню операцію'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* === TAB 2: STAFF & OPERATIVES DOSSIER === */}
          {activeTab === 'characters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(STORY_CHARACTERS).map((char) => {
                const name =
                  language === 'en'
                    ? char.name.en
                    : language === 'ru'
                    ? char.name.ru
                    : char.name.uk;

                const callsign =
                  language === 'en'
                    ? char.callsign.en
                    : language === 'ru'
                    ? char.callsign.ru
                    : char.callsign.uk;

                const role =
                  language === 'en'
                    ? char.role.en
                    : language === 'ru'
                    ? char.role.ru
                    : char.role.uk;

                return (
                  <div
                    key={char.id}
                    className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex gap-4 items-start"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 shadow-lg ${char.avatarBg}`}
                    >
                      {char.id === 'titan' && <Shield className="w-6 h-6" />}
                      {char.id === 'sova' && <Zap className="w-6 h-6" />}
                      {char.id === 'iskra' && <Crosshair className="w-6 h-6" />}
                      {char.id === 'mayak' && <AlertTriangle className="w-6 h-6" />}
                      <span className="text-[8px] font-black font-hud tracking-tight mt-0.5">
                        {callsign.replace(/[«»"]/g, '')}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-neutral-800 text-neutral-300">
                          {char.badge}
                        </span>
                        <span className="text-xs font-bold font-hud text-emerald-400">
                          {callsign}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold font-hud text-neutral-100">{name}</h4>
                      <p className="text-xs text-neutral-400 mt-1 font-medium">{role}</p>

                      <div className="mt-3 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 italic">
                        {char.id === 'titan' &&
                          (language === 'en'
                            ? '"The sky over the capital must remain impenetrable. Not a single missile will break our perimeter."'
                            : language === 'ru'
                            ? '"Небо над столицей должно оставаться непроницаемым. Ни одна ракета не пройдет наш рубеж."'
                            : '"Небо над столицею має залишатися непробивним. Жодна ракета не пройде наш рубіж."')}
                        {char.id === 'sova' &&
                          (language === 'en'
                            ? '"Radars calibrated. I track every turbine whistle and separate decoy signatures immediately."'
                            : language === 'ru'
                            ? '"Радары откалиброваны. Фиксирую каждый свист турбины и мгновенно отличаю фальш-цели."'
                            : '"Радари відкалібровані. Фіксую кожен свист турбіни та миттєво відрізняю фальш-цілі."')}
                        {char.id === 'iskra' &&
                          (language === 'en'
                            ? '"Patriot launchers loaded. When Oreshnik drops, we unleash everything we have."'
                            : language === 'ru'
                            ? '"Пусковые Patriot заряжены. При входе Орешника дадим полный залп."'
                            : '"Пускові Patriot заряджені. При вході Орешника дамо повний залп."')}
                        {char.id === 'mayak' &&
                          (language === 'en'
                            ? '"Emergency teams standing by at power substations. Hold the umbrella!"'
                            : language === 'ru'
                            ? '"Аварийные бригады на дежурстве у подстанций. Держите небесный купол!"'
                            : '"Аварійні бригади на чергуванні біля підстанцій. Тримайте небесний купол!"')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* === TAB 3: MEDALS & SERVICE RECORD === */}
          {activeTab === 'medals' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold font-hud text-neutral-200 uppercase">
                    {language === 'en'
                      ? 'Combat Commendations & Medals'
                      : language === 'ru'
                      ? 'Боевые награды и знаки отличия'
                      : 'Бойові нагороди та знаки відзнаки'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {language === 'en'
                      ? 'Earn medals by achieving tactical milestones across story operations.'
                      : language === 'ru'
                      ? 'Получайте награды за выполнение боевых задач в сюжете.'
                      : 'Здобувайте нагороди за виконання бойових завдань у сюжеті.'}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold font-hud text-xs">
                  {progress.unlockedMedals.length} / {CAMPAIGN_MEDALS.length}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CAMPAIGN_MEDALS.map((medal) => {
                  const unlocked = progress.unlockedMedals.includes(medal.id);

                  const title =
                    language === 'en'
                      ? medal.title.en
                      : language === 'ru'
                      ? medal.title.ru
                      : medal.title.uk;

                  const description =
                    language === 'en'
                      ? medal.description.en
                      : language === 'ru'
                      ? medal.description.ru
                      : medal.description.uk;

                  return (
                    <div
                      key={medal.id}
                      className={`p-4 rounded-2xl border flex gap-3.5 items-start transition-all ${
                        unlocked
                          ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/20'
                          : 'bg-neutral-900/40 border-neutral-800/80 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                          unlocked
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-600'
                        }`}
                      >
                        {medal.icon === 'Shield' && <Shield className="w-6 h-6" />}
                        {medal.icon === 'Crosshair' && <Crosshair className="w-6 h-6" />}
                        {medal.icon === 'Zap' && <Zap className="w-6 h-6" />}
                        {medal.icon === 'Target' && <Target className="w-6 h-6" />}
                        {medal.icon === 'Flame' && <Flame className="w-6 h-6" />}
                        {medal.icon === 'Skull' && <Skull className="w-6 h-6" />}
                        {medal.icon === 'Award' && <Award className="w-6 h-6" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4
                            className={`text-xs font-bold font-hud ${
                              unlocked ? 'text-amber-300' : 'text-neutral-400'
                            }`}
                          >
                            {title}
                          </h4>
                          {unlocked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Lock className="w-3 h-3 text-neutral-600 shrink-0" />
                          )}
                        </div>

                        <p className="text-[11px] text-neutral-400 leading-snug">{description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
