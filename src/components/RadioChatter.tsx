import React, { useEffect, useState } from 'react';
import { RadioMessage } from '../types/game';
import { RADIO_CALLOUTS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { useTranslation } from '../i18n/LanguageContext';
import { Radio, Volume2 } from 'lucide-react';

interface RadioChatterProps {
  lastEventTrigger?: string;
}

export const RadioChatter: React.FC<RadioChatterProps> = () => {
  const { language } = useTranslation();

  const getInitialMessages = (): RadioMessage[] => {
    if (language === 'en') {
      return [
        {
          id: 'm-init-1',
          timestamp: '03:14:02',
          sender: 'SECTOR COMMAND',
          text: 'All air defense batteries: Condition 1 combat readiness. Hostile air targets inbound.',
          type: 'info',
        },
        {
          id: 'm-init-2',
          timestamp: '03:14:18',
          sender: 'SURVEILLANCE RADAR',
          text: 'Strike UAV groups detected approaching from south-eastern vector.',
          type: 'warning',
        },
      ];
    }
    if (language === 'ru') {
      return [
        {
          id: 'm-init-1',
          timestamp: '03:14:02',
          sender: 'КОМАНДИР СЕКТОРА',
          text: 'Всем расчетам ПВО: боевая готовность №1. В воздухе вражеские цели.',
          type: 'info',
        },
        {
          id: 'm-init-2',
          timestamp: '03:14:18',
          sender: 'РЛС НАБЛЮДЕНИЯ',
          text: 'Зафиксировано движение ударных БПЛА с юго-восточного направления.',
          type: 'warning',
        },
      ];
    }
    return [
      {
        id: 'm-init-1',
        timestamp: '03:14:02',
        sender: 'КОМАНДИР СЕКТОРУ',
        text: 'Усім розрахункам ППО: оперативна готовність №1. У повітрі ворожі цілі.',
        type: 'info',
      },
      {
        id: 'm-init-2',
        timestamp: '03:14:18',
        sender: 'РЛС СПОСТЕРЕЖЕННЯ',
        text: 'Зафіксовано рух ударних БПЛА з південно-східного напрямку.',
        type: 'warning',
      },
    ];
  };

  const [messages, setMessages] = useState<RadioMessage[]>(getInitialMessages);

  // Re-sync messages when language changes
  useEffect(() => {
    setMessages(getInitialMessages());
  }, [language]);

  // Periodic ambient chatter
  useEffect(() => {
    const interval = setInterval(() => {
      const calloutsEn = [
        'Notice: small high-speed contacts — FPV kamikaze drones, alt 80m!',
        'Gerbera on radar! Wooden decoy drone, hold heavy missiles!',
        'Characteristic moped buzz! Shahed-136 in sector 3, alt 350m!',
        'ALERT: Jet turbo turbine whine! Geran-4 Seeker with optical head, speed 400!',
        'Kh-101 / Kalibr cruise missile detected flying ultra-low over riverbed!',
        'BALLISTIC THREAT! Iskander-M launch detected from the north! Patriot battery engage!',
        'Hypersonic Kinzhal diving steeply! Target lock in the stratosphere!',
        'MAXIMUM FLASH ALERT: STRATEGIC MRBM "ORESHNIK" LAUNCH DETECTED!',
        'ORESHNIK SEPARATION INTO 6 MIRV WARHEADS! ALL AIR DEFENSE ENGAGE!',
        'Direct kinetic hit! Target warhead destroyed mid-air!',
      ];

      const calloutsRu = [
        'Внимание, мелкие скоростные цели — это FPV-дроны, высота 80 метров!',
        'Гербера на радаре! Это фальш-цель из фанеры, не тратьте ракеты!',
        'Характерный звук мопеда! Герань-2 в секторе 3, высота 350!',
        'ВНИМАНИЕ: Реактивный звук! Это Герань-4 «Сикер» с оптикой, скорость 400!',
        'Зафиксирована Х-101 / Калибр! Идет над руслом реки на сверхмалой высоте!',
        'БАЛЛИСТИЧЕСКАЯ ОПАСНОСТЬ! Пуск Искандер-М с севера! Расчету Patriot — пуск!',
        'Гиперзвуковой Кинжал пикирует! Захват цели в стратосфере!',
        'ТРЕВОГА ОСОБОЙ ВАЖНОСТИ! ЗАФИКСИРОВАН СТАРТ БРСД «ОРЕШНИК»!',
        'ОРЕШНИК РАЗДЕЛИЛСЯ НА 6 БОЕВЫХ БЛОКОВ! ВСЕ СИЛЫ ПВО К БОЮ!',
        'Прямое попадание кинетическим перехватчиком! Блок уничтожен в воздухе!',
      ];

      const calloutList =
        language === 'en' ? calloutsEn : language === 'ru' ? calloutsRu : RADIO_CALLOUTS;

      const text = calloutList[Math.floor(Math.random() * calloutList.length)];
      const senders =
        language === 'en'
          ? ['MOBILE FIRE TEAM 2', 'GEPARD SPAAG-1', 'PATRIOT BATTERY', 'RADAR OPERATOR', 'AIR DEFENSE HQ']
          : language === 'ru'
          ? ['МОГ ЮГ-2', 'ЗСУ GEPARD-1', 'ДИВИЗИОН PATRIOT', 'ОПЕРАТОР РЛС', 'ДЕЖУРНЫЙ ПВО']
          : ['МВГ ПІВДЕНЬ-2', 'ЗСУ GEPARD-1', 'ДИВІЗІОН PATRIOT', 'ОПЕРАТОР РЛС', 'ЧЕРГОВИЙ ППО'];

      const sender = senders[Math.floor(Math.random() * senders.length)];

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newMsg: RadioMessage = {
        id: `rad-${Date.now()}`,
        timestamp: timeStr,
        sender,
        text,
        type:
          text.includes('BALLISTIC') || text.includes('БАЛІСТИЧНА') || text.includes('БАЛЛИСТИЧЕСКАЯ') || text.includes('ORESHNIK') || text.includes('ОРЕШНИК')
            ? 'alert'
            : text.includes('hit') || text.includes('влучання') || text.includes('попадание') || text.includes('destroyed') || text.includes('знищено') || text.includes('уничтожен')
            ? 'success'
            : text.includes('ALERT') || text.includes('УВАГА') || text.includes('ВНИМАНИЕ')
            ? 'warning'
            : 'info',
      };

      setMessages((prev) => [...prev.slice(-4), newMsg]);
      soundEngine.playRadioBeep();
    }, 18000);

    return () => clearInterval(interval);
  }, [language]);

  const channelTitle =
    language === 'en' ? 'Combat Radio Net' : language === 'ru' ? 'Боевая радиоволна' : 'Бойова радіохвиля';

  return (
    <div className="hidden lg:flex flex-col gap-1 max-w-xs bg-neutral-950/85 backdrop-blur-md border border-neutral-800/80 p-2.5 rounded-2xl shadow-xl font-code text-xs">
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5 mb-1 text-[10px] text-neutral-400 font-hud">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{channelTitle}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px]">
          <Volume2 className="w-3 h-3 text-emerald-400" />
          <span>142.85 MHz</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 overflow-hidden">
        {messages.map((m) => (
          <div key={m.id} className="text-[11px] leading-tight flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[9px] text-neutral-500">
              <span className="font-bold text-neutral-400">{m.sender}</span>
              <span>{m.timestamp}</span>
            </div>
            <div
              className={`${
                m.type === 'alert'
                  ? 'text-rose-400 font-bold'
                  : m.type === 'success'
                  ? 'text-emerald-400'
                  : m.type === 'warning'
                  ? 'text-amber-300'
                  : 'text-neutral-300'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
