import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { soundEngine } from '../audio/soundEngine';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'normal' | 'large';
  showLabel?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'normal',
  showLabel = false,
  className = '',
}) => {
  const { language, setLanguage } = useTranslation();

  const languages: { id: Language; label: string; fullLabel: string; flag: string }[] = [
    { id: 'uk', label: 'УКР', fullLabel: 'Українська', flag: '🇺🇦' },
    { id: 'en', label: 'ENG', fullLabel: 'English', flag: '🇬🇧' },
    { id: 'ru', label: 'РУС', fullLabel: 'Русский', flag: '🇷🇺' },
  ];

  const handleSelect = (lang: Language) => {
    soundEngine.playClick();
    setLanguage(lang);
  };

  const isCompact = variant === 'compact';
  const isLarge = variant === 'large';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-1 text-xs text-neutral-400 font-medium mr-1">
          <Globe className="w-3.5 h-3.5 text-neutral-400" />
          <span>Мова:</span>
        </div>
      )}

      <div
        className={`inline-flex items-center p-0.5 rounded-xl border bg-neutral-950/80 backdrop-blur-md border-neutral-800 ${
          isCompact ? 'gap-0.5' : 'gap-1'
        }`}
        role="group"
        aria-label="Language selector"
      >
        {languages.map((item) => {
          const isActive = language === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              title={item.fullLabel}
              className={`flex items-center gap-1 font-bold font-hud transition-all rounded-lg cursor-pointer ${
                isCompact
                  ? 'px-2 py-0.5 text-[10px]'
                  : isLarge
                  ? 'px-3 py-1.5 text-xs'
                  : 'px-2.5 py-1 text-xs'
              } ${
                isActive
                  ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                  : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
              }`}
            >
              <span className="text-[11px] leading-none select-none">{item.flag}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
