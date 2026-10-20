import React, { useEffect, useState, useRef } from 'react';
import { StoryTransmission } from '../story/types';
import { STORY_CHARACTERS } from '../story/storyData';
import { useTranslation } from '../i18n/LanguageContext';
import { Radio, AlertTriangle, Shield, Skull, Zap, Volume2, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface StoryTransmissionOverlayProps {
  missionTimer: number;
  transmissions: StoryTransmission[];
  onTransmissionTrigger?: (transmission: StoryTransmission) => void;
}

export const StoryTransmissionOverlay: React.FC<StoryTransmissionOverlayProps> = ({
  missionTimer,
  transmissions,
  onTransmissionTrigger,
}) => {
  const { language } = useTranslation();
  const [activeTransmission, setActiveTransmission] = useState<StoryTransmission | null>(null);
  const [visibleUntil, setVisibleUntil] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const triggeredIdsRef = useRef<Set<string>>(new Set());

  // Listen to mission timer to trigger transmissions
  useEffect(() => {
    for (const tr of transmissions) {
      if (!triggeredIdsRef.current.has(tr.id) && missionTimer >= tr.triggerTimeSec) {
        triggeredIdsRef.current.add(tr.id);
        setActiveTransmission(tr);
        setVisibleUntil(Date.now() + 8500); // show for 8.5 seconds
        soundEngine.playRadioBeep();
        if (onTransmissionTrigger) {
          onTransmissionTrigger(tr);
        }
        break;
      }
    }
  }, [missionTimer, transmissions, onTransmissionTrigger]);

  // Teletype effect
  useEffect(() => {
    if (!activeTransmission) {
      setDisplayedText('');
      return;
    }

    const fullText =
      language === 'en'
        ? activeTransmission.text.en
        : language === 'ru'
        ? activeTransmission.text.ru
        : activeTransmission.text.uk;

    let index = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      index += 2;
      setDisplayedText(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [activeTransmission, language]);

  // Auto-dismiss
  useEffect(() => {
    if (!activeTransmission) return;

    const remaining = visibleUntil - Date.now();
    if (remaining <= 0) {
      setActiveTransmission(null);
      return;
    }

    const timer = setTimeout(() => {
      setActiveTransmission(null);
    }, remaining);

    return () => clearTimeout(timer);
  }, [activeTransmission, visibleUntil]);

  if (!activeTransmission) return null;

  const character = STORY_CHARACTERS[activeTransmission.characterId] || STORY_CHARACTERS.titan;
  const charName =
    language === 'en'
      ? character.name.en
      : language === 'ru'
      ? character.name.ru
      : character.name.uk;

  const charCallsign =
    language === 'en'
      ? character.callsign.en
      : language === 'ru'
      ? character.callsign.ru
      : character.callsign.uk;

  const charRole =
    language === 'en'
      ? character.role.en
      : language === 'ru'
      ? character.role.ru
      : character.role.uk;

  const isAlertOrBoss =
    activeTransmission.alertType === 'critical' || activeTransmission.alertType === 'boss';

  return (
    <aside
      aria-label="Військовий радіоперехват штабу"
      className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl pointer-events-auto select-none"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl p-3 sm:p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
          isAlertOrBoss
            ? 'bg-rose-950/90 border-rose-500/80 shadow-rose-950/60 ring-2 ring-rose-500/40'
            : activeTransmission.alertType === 'alert'
            ? 'bg-amber-950/90 border-amber-500/70 shadow-amber-950/50'
            : 'bg-neutral-950/92 border-neutral-700/80 shadow-black/80'
        }`}
      >
        {/* Top frequency scan bar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80 text-[10px] font-mono tracking-wider text-neutral-400">
          <div className="flex items-center gap-2">
            <Radio className={`w-3.5 h-3.5 animate-pulse ${isAlertOrBoss ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="font-bold text-neutral-300">SECURE FREQ 142.85 MHz</span>
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 text-[9px] uppercase">
              {character.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold uppercase text-[9px]">LIVE TRANS</span>
            <button
              onClick={() => setActiveTransmission(null)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
              title="Dismiss transmission"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message body */}
        <div className="flex items-start gap-3">
          {/* Character Badge / Avatar */}
          <div
            className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center shrink-0 shadow-md ${character.avatarBg}`}
          >
            {activeTransmission.characterId === 'titan' && <Shield className="w-5 h-5" />}
            {activeTransmission.characterId === 'sova' && <Zap className="w-5 h-5" />}
            {activeTransmission.characterId === 'iskra' && <AlertTriangle className="w-5 h-5" />}
            {activeTransmission.characterId === 'mayak' && <Radio className="w-5 h-5" />}
            <span className="text-[8px] font-black font-hud tracking-tighter uppercase mt-0.5">
              {charCallsign.replace(/[«»"]/g, '')}
            </span>
          </div>

          {/* Texts */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold font-hud text-neutral-100 tracking-wide">
                {charName}
              </span>
              <span className="text-[10px] text-neutral-400 font-medium truncate">
                {charRole}
              </span>
            </div>

            <p
              className={`text-xs sm:text-sm font-medium leading-relaxed font-sans ${
                isAlertOrBoss
                  ? 'text-rose-100 font-bold'
                  : activeTransmission.alertType === 'alert'
                  ? 'text-amber-100'
                  : 'text-neutral-200'
              }`}
            >
              {displayedText}
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400 animate-pulse align-middle" />
            </p>
          </div>
        </div>

        {/* Bottom indicator line */}
        <div className="mt-2.5 h-0.5 w-full bg-neutral-900 rounded-full overflow-hidden">
          <div
            className={`h-full animate-pulse ${
              isAlertOrBoss ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </aside>
  );
};
