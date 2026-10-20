import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { Volume2, VolumeX, Keyboard, Sliders, X, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showLeadAid: boolean;
  setShowLeadAid: (val: boolean | ((prev: boolean) => boolean)) => void;
  volume: number;
  setVolume: (val: number) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  showLeadAid,
  setShowLeadAid,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
}) => {
  const { t, language } = useTranslation();

  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  const handleToggleMute = () => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
  };

  const closeBtnText =
    language === 'en' ? 'Close' : language === 'ru' ? 'Закрыть' : 'Закрити';

  const fireKeyText =
    language === 'en' ? 'LMB (Hold)' : language === 'ru' ? 'ЛКМ (Зажатие)' : 'ЛКМ (Затискання)';

  const spaceKeyText =
    language === 'en' ? 'Space' : language === 'ru' ? 'Пробел' : 'Пробіл';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-hud font-bold text-base text-neutral-100 uppercase tracking-wider">
              {t.settingsTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-200 font-bold font-hud uppercase">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.languageSetting}</span>
            </div>
            <LanguageSelector variant="normal" />
          </div>
          <div className="text-[11px] text-neutral-400">
            {t.languageSettingDesc}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="space-y-4 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">{t.soundVolume}</span>
            <span className="font-code text-neutral-400">{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Test Sound Button */}
          <button
            onClick={() => {
              soundEngine.playTestChime();
              setIsMuted(false);
            }}
            className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold font-hud uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'en'
                ? '🔊 Test Audio (Play Chime)'
                : language === 'ru'
                ? '🔊 Проверить звук (Тестовый сигнал)'
                : '🔊 Перевірити звук (Тестовий сигнал)'}
            </span>
          </button>

          <div className="pt-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-200 font-medium">{t.leadAidSetting}</div>
              <div className="text-[11px] text-neutral-400">
                {t.leadAidSettingDesc}
              </div>
            </div>
            <button
              onClick={() => setShowLeadAid((prev) => !prev)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                showLeadAid ? 'bg-emerald-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  showLeadAid ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tactical Keybinds Guide */}
        <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-neutral-300 font-hud uppercase">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <span>{t.keybindingsTitle}:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-code">
            <div className="flex items-center justify-between bg-neutral-950/50 p-2 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">{t.keyAim}</span>
              <span className="text-amber-400 font-bold">{fireKeyText}</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-950/50 p-2 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">{t.keySearchlight}</span>
              <span className="text-amber-400 font-bold">{spaceKeyText}</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-950/50 p-2 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">{t.keyBrowning}</span>
              <span className="text-emerald-400 font-bold">[ 1 ]</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-950/50 p-2 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">{t.keyGepard}</span>
              <span className="text-emerald-400 font-bold">[ 2 ]</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-950/50 p-2 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">{t.keyStinger}</span>
              <span className="text-emerald-400 font-bold">[ 3 ]</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-950/50 p-2 rounded-lg border border-neutral-800">
              <span className="text-neutral-400">{t.keyPatriot}</span>
              <span className="text-sky-400 font-bold">[ 4 ]</span>
            </div>
            <div className="flex items-center justify-between bg-neutral-950/50 p-2 rounded-lg border border-neutral-800 col-span-2">
              <span className="text-neutral-400">{t.keyReload}</span>
              <span className="text-amber-300 font-bold">[ R ]</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {closeBtnText}
        </button>
      </div>
    </div>
  );
};
