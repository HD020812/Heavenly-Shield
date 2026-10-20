import React, { useState } from 'react';
import { MISSIONS } from '../game/constants';
import { Mission } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import {
  Shield,
  Crosshair,
  Clock,
  Skull,
  ChevronRight,
  X,
  Eye,
  Maximize2,
} from 'lucide-react';

const MISSILE_PHOTOS: Record<string, { src: string; caption: string }> = {
  '1': {
    src: '/src/assets/images/fpv_kamikaze_drone_1791610981579.jpg',
    caption: 'FPV-дрон — скоростной квадрокоптер с кумулятивным зарядом от РПГ-7',
  },
  '2': {
    src: '/src/assets/images/geran2_shahed_uav_1791610992183.jpg',
    caption: 'Герань-2 (Shahed-136) — классический ударный дрон-камикадзе с поршневым мотором MD-550',
  },
  '3': {
    src: '/src/assets/images/gerbera_decoy_drone_1791611003557.jpg',
    caption: 'Гербера — дрон-обманка из фанеры и пенопласта для истощения ракетных боеприпасов ПВО',
  },
  '4': {
    src: '/src/assets/images/geran4_seeker_uav_1791611014008.jpg',
    caption: 'Герань-4 «Сикер» — реактивный ударный БПЛА с микротурбиной и оптической ГСН (~380 км/ч)',
  },
  '5': {
    src: '/src/assets/images/kh101_cruise_missile_1791521942801.jpg',
    caption: 'Х-101 / Калибр — малозаметная крылатая ракета с выдвижным ТРДД-50А',
  },
  '6': {
    src: '/src/assets/images/kinzhal_hypersonic_missile_1791521975171.jpg',
    caption: 'Х-47М2 «Кинжал» — гиперзвуковая аэробаллистическая ракета (Mach 10)',
  },
  '7': {
    src: '/src/assets/images/iskander_ballistic_missile_1791521959416.jpg',
    caption: '9М723 «Искандер-М» — квазибаллистическая ракета ОТРК с сопловым факелом',
  },
  '8': {
    src: '/src/assets/images/oreshnik_irbm_mirv_1791521991833.jpg',
    caption: 'БРСД «Орешник» — гиперзвуковой разделяющийся удар 6 боевыми блоками MIRV',
  },
  '9': {
    src: '/src/assets/images/geran5_seeker_uav_1791534719108.jpg',
    caption: 'Герань-5 «Сикер» (2 стадия) — двухдвигательный реактивный БПЛА с оптической ГСН',
  },
  '10': {
    src: '/src/assets/images/zircon_hypersonic_missile_1791534747287.jpg',
    caption: '3М22 «Циркон» (3 стадия) — гиперзвуковая прямоточная ракета Waverider (Mach 8-9)',
  },
  '11': {
    src: '/src/assets/images/banderol_strike_drone_1791534781962.jpg',
    caption: '«Бандероль» (3-4 стадия) — скоростной маневренный ударный дрон доставки боевой части',
  },
};

interface MissionBriefingModalProps {
  isOpen: boolean;
  onSelectMission: (m: Mission | null, isEndless?: boolean) => void;
  onClose: () => void;
  activeMissionId?: string;
}

export const MissionBriefingModal: React.FC<MissionBriefingModalProps> = ({
  isOpen,
  onSelectMission,
  onClose,
  activeMissionId,
}) => {
  const {
    t,
    language,
    getMissionTitle,
    getMissionSubtitle,
    getMissionDescription,
    getDifficultyLabel,
    getWeaponName,
  } = useTranslation();

  const [selectedId, setSelectedId] = useState<string>(activeMissionId || MISSIONS[0].id);
  const [activeTab, setActiveTab] = useState<'missions' | 'intel' | 'arsenal'>('missions');
  const [previewPhoto, setPreviewPhoto] = useState<{ src: string; title: string; caption: string } | null>(null);

  if (!isOpen) return null;

  const currentMission = MISSIONS.find((m) => m.id === selectedId) || MISSIONS[0];

  const handleStartMission = (mission: Mission | null, isEndless: boolean = false) => {
    soundEngine.init();
    soundEngine.resume();
    soundEngine.playClick();
    onSelectMission(mission, isEndless);
  };

  // Threat dossier data localized
  const getThreatDossier = () => {
    if (language === 'en') {
      return [
        {
          num: '1',
          name: 'FPV Kamikaze Drone',
          badge: 'LOW THREAT',
          badgeClass: 'bg-sky-950 text-sky-300 border-sky-800/40',
          desc: 'Small agile quadcopter rigged with RPG-7 shaped-charge warhead. Performs rapid vertical and horizontal evasive maneuvers.',
          weapon: 'Weapon: 12.7mm Machine Gun or Gepard (burst fire).',
        },
        {
          num: '2',
          name: 'Geran-2 (Shahed-136)',
          badge: 'STRIKE UAV',
          badgeClass: 'bg-amber-950 text-amber-300 border-amber-800/40',
          desc: 'Classic delta-wing loitering munition with loud two-stroke piston buzz. Cruising at ~185 km/h, dives directly onto target sectors.',
          weapon: 'Weapon: Searchlight + 12.7mm machine gun or Gepard 35mm.',
        },
        {
          num: '3',
          name: 'Gerbera (Decoy Drone)',
          badge: 'DECOY TARGET',
          badgeClass: 'bg-neutral-800 text-neutral-300 border-neutral-700',
          desc: 'Constructed from lightweight foam and plywood without warhead. Deployed in swarms to deplete interceptor missile reserves.',
          weapon: 'Weapon: 12.7mm machine gun only — conserve expensive missiles!',
        },
        {
          num: '4',
          name: 'Jet Geran-4 "Seeker"',
          badge: 'JET STRIKE UAV',
          badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800/40',
          desc: 'Propelled by a micro-turbojet engine (speed ~380 km/h) equipped with optical electro-optical terminal seeker.',
          weapon: 'Weapon: Flakpanzer Gepard (35mm AHEAD) or Stinger MANPADS lock-on.',
        },
        {
          num: '5',
          name: 'Kh-101 / Kalibr Cruise Missile',
          badge: 'CRUISE MISSILE',
          badgeClass: 'bg-orange-950 text-orange-300 border-orange-800/40',
          desc: 'Subsonic cruise missile (~840 km/h) hugging terrain at ultra-low altitudes (150-250 m) with noticeable rocket jet exhaust.',
          weapon: 'Weapon: Stinger MANPADS with thermal lock or Patriot SAM.',
        },
        {
          num: '6',
          name: 'Kh-47M2 Kinzhal',
          badge: 'HYPERSONIC BALLISTIC',
          badgeClass: 'bg-rose-950 text-rose-300 border-rose-800/40',
          desc: 'Aeroballistic hypersonic missile flying at ~2200 km/h. Enters steeply from the flank enveloped in ionized plasma shockwave.',
          weapon: 'Weapon: Patriot PAC-3 MSE (kinetic Hit-to-Kill interceptor).',
        },
        {
          num: '7',
          name: '9M723 Iskander-M',
          badge: 'QUASI-BALLISTIC',
          badgeClass: 'bg-rose-950 text-rose-300 border-rose-800/40',
          desc: 'Heavy quasi-ballistic missile with 480 kg warhead. Descends along a shallow trajectory from the side (~1900 km/h).',
          weapon: 'Weapon: Patriot PAC-3 MSE.',
        },
        {
          num: '8',
          name: 'MRBM "ORESHNIK" — FINAL BOSS',
          badge: 'FINAL BOSS (MIRV)',
          badgeClass: 'bg-rose-600 text-white font-bold',
          desc: 'Strategic medium-range ballistic missile! High durability (500 HP). At exactly 50% HP (250 HP), jettisons shroud and splits into 6 blazing hypersonic MIRV warheads!',
          weapon: 'Tactics: Rapid-fire Patriot PAC-3 MSE [key 4] and Gepard flak barrages against all 6 submunitions!',
          isBoss: true,
        },
        {
          num: '9',
          name: 'Jet Geran-5 "Seeker" (Stage 2)',
          badge: 'TWIN-JET UAV',
          badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800/40',
          desc: 'Next-gen twin-engine stealth jet drone with advanced AI optical terminal seeker (~460 km/h). Emits twin turbojet flame streams.',
          weapon: 'Weapon: Gepard 35mm AHEAD flak or Stinger IR missile lock-on.',
        },
        {
          num: '10',
          name: '3M22 Zircon (Stage 3)',
          badge: 'HYPERSONIC SCRAMJET',
          badgeClass: 'bg-rose-950 text-rose-300 border-rose-800/40',
          desc: 'Hypersonic scramjet cruise missile traveling at Mach 8 (~2600 km/h) with waverider compression wedge and brilliant cyan plasma bow shock.',
          weapon: 'Weapon: Patriot PAC-3 MSE Hit-to-Kill interceptor.',
        },
        {
          num: '11',
          name: '"Banderol" Delivery Strike Drone (Stages 3-4)',
          badge: 'FAST ATTACK UAV',
          badgeClass: 'bg-amber-950 text-amber-300 border-amber-800/40',
          desc: 'High-speed compact canard attack drone delivering payload (~260 km/h). Flies low with agile evasive weaves.',
          weapon: 'Weapon: 12.7mm Machine Gun or Gepard 35mm burst.',
        },
      ];
    }

    if (language === 'ru') {
      return [
        {
          num: '1',
          name: 'FPV-дрон (Квадрокоптер)',
          badge: 'МИНИМАЛЬНАЯ УГРОЗА',
          badgeClass: 'bg-sky-950 text-sky-300 border-sky-800/40',
          desc: 'Малый скоростной дрон с боевой частью от РПГ-7. Совершает резкие маневры по вертикали и горизонтали.',
          weapon: 'Оружие: Пулемет 12.7 мм или Gepard (очередью).',
        },
        {
          num: '2',
          name: 'Герань-2 (Shahed-136)',
          badge: 'УДАРНЫЙ БПЛА',
          badgeClass: 'bg-amber-950 text-amber-300 border-amber-800/40',
          desc: 'Классическое дельтовидное крыло, громкий звук двухтактного «мопеда». Скорость ~185 км/ч. Пикирует на город.',
          weapon: 'Оружие: Прожектор + пулемет 12.7 мм или ЗСУ Gepard.',
        },
        {
          num: '3',
          name: 'Гербера (Дрон-обманка)',
          badge: 'ФАЛЬШ-ЦЕЛЬ (DECOY)',
          badgeClass: 'bg-neutral-800 text-neutral-300 border-neutral-700',
          desc: 'Изготовлен из фанеры и пенопласта без боевой части. Запускается роями для истощения боекомплекта.',
          weapon: 'Оружие: Только пулемет 12.7 мм — экономьте ракеты!',
        },
        {
          num: '4',
          name: 'Герань-4 «Сикер»',
          badge: 'РЕАКТИВНЫЙ БПЛА',
          badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800/40',
          desc: 'Оснащен реактивной турбиной (~380 км/ч) и оптической головкой самонаведения.',
          weapon: 'Оружие: ЗСУ Gepard (35-мм AHEAD) или ПЗРК Stinger по тепловому следу.',
        },
        {
          num: '5',
          name: 'Х-101 / Калибр',
          badge: 'КРЫЛАТАЯ РАКЕТА',
          badgeClass: 'bg-orange-950 text-orange-300 border-orange-800/40',
          desc: 'Скорость ~840 км/ч. Идет на предельно малой высоте (150–250 м) вдоль русел рек с реактивным факелом.',
          weapon: 'Оружие: ПЗРК Stinger с захватом цели или ЗРК Patriot.',
        },
        {
          num: '6',
          name: 'Х-47М2 Кинжал',
          badge: 'БАЛЛИСТИКА / ГИПЕРЗВУК',
          badgeClass: 'bg-rose-950 text-rose-300 border-rose-800/40',
          desc: 'Аэробаллистическая ракета со скоростью ~2200 км/ч. Заходит сверху и сбоку в яркой плазменной оболочке.',
          weapon: 'Оружие: ЗРК Patriot PAC-3 MSE (кинетический перехватчик).',
        },
        {
          num: '7',
          name: '9М723 Искандер-М',
          badge: 'БАЛЛИСТИКА ОТРК',
          badgeClass: 'bg-rose-950 text-rose-300 border-rose-800/40',
          desc: 'Тяжелая квазибаллистическая ракета с мощной БЧ 480 кг. Заходит сверху и сбоку по пологой траектории (~1900 км/ч).',
          weapon: 'Оружие: ЗРК Patriot PAC-3 MSE.',
        },
        {
          num: '8',
          name: 'БРСД «ОРЕШНИК» — ФИНАЛЬНЫЙ БОСС',
          badge: 'ФИНАЛЬНЫЙ БОСС (MIRV)',
          badgeClass: 'bg-rose-600 text-white font-bold',
          desc: 'Стратегическая ракета средней дальности! Запас прочности (500 HP). Ровно при 50% HP (250 HP) распадается на 6 пылающих гиперзвуковых боевых блоков!',
          weapon: 'Тактика: Пуски ЗРК Patriot [клавиша 4] и огонь Gepard по каждому блоку!',
          isBoss: true,
        },
        {
          num: '9',
          name: 'Герань-5 «Сикер» (2 стадия)',
          badge: 'ДВУХДВИГАТЕЛЬНЫЙ БПЛА',
          badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800/40',
          desc: 'Реактивный ударный БПЛА нового поколения со спаренными турбинами (~460 км/ч) и оптико-электронной головкой самонаведения.',
          weapon: 'Оружие: ЗСУ Gepard (35-мм AHEAD) или ПЗРК Stinger.',
        },
        {
          num: '10',
          name: '3М22 «Циркон» (3 стадия)',
          badge: 'ГИПЕРЗВУК Mach 8',
          badgeClass: 'bg-rose-950 text-rose-300 border-rose-800/40',
          desc: 'Гиперзвуковая прямоточная крылатая ракета со скоростью ~2600 км/ч. Скользит в плотной плазменной оболочке.',
          weapon: 'Оружие: ЗРК Patriot PAC-3 MSE.',
        },
        {
          num: '11',
          name: '«Бандероль» (3-4 стадия)',
          badge: 'СКОРОСТНОЙ ДРОН',
          badgeClass: 'bg-amber-950 text-amber-300 border-amber-800/40',
          desc: 'Скоростной малоразмерный дрон-камикадзе доставки (~260 км/ч) со схемой «утка» и резкими рывками по высоте.',
          weapon: 'Оружие: Пулемет 12.7 мм или ЗСУ Gepard.',
        },
      ];
    }

    // Default Ukrainian
    return [
      {
        num: '1',
        name: 'FPV-дрон (Квадрокоптер)',
        badge: 'МІНІМАЛЬНА ЗАГРОЗА',
        badgeClass: 'bg-sky-950 text-sky-300 border-sky-800/40',
        desc: 'Малий швидкісний дрон із бойовою частиною від РПГ-7. Здійснює різкі маневри по вертикалі та горизонталі.',
        weapon: 'Зброя: Кулемет 12.7 мм або Gepard (легко збивається чергою).',
      },
      {
        num: '2',
        name: 'Герань-2 (Shahed-136)',
        badge: 'УДАРНИЙ БПЛА',
        badgeClass: 'bg-amber-950 text-amber-300 border-amber-800/40',
        desc: 'Класичне дельтоподібне крило, гучний звук двотактного «мопеда». Швидкість ~185 км/г. Пікірує на енергоблок.',
        weapon: 'Зброя: Прожектор + кулемет 12.7 мм або Gepard.',
      },
      {
        num: '3',
        name: 'Гербера (Дрон-обманка)',
        badge: 'ФАЛЬШ-ЦІЛЬ (DECOY)',
        badgeClass: 'bg-neutral-800 text-neutral-300 border-neutral-700',
        desc: 'Виготовлений із фанери та пінопласту, без бойової частини. Запускається роями для виснаження БК.',
        weapon: 'Зброя: Тільки кулемет 12.7 мм — економте цінні ракети!',
      },
      {
        num: '4',
        name: 'Герань-4 «Сикер»',
        badge: 'РЕАКТИВНИЙ УДАРНИЙ БПЛА',
        badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800/40',
        desc: 'Оснащений реактивною мікротурбіною (швидкість ~380 км/г) та оптичною головкою самонаведення.',
        weapon: 'Зброя: ЗСУ Gepard (35-мм AHEAD) або ПЗРК Stinger по тепловому сліду.',
      },
      {
        num: '5',
        name: 'Х-101 / Калібр',
        badge: 'КРИЛАТА РАКЕТА',
        badgeClass: 'bg-orange-950 text-orange-300 border-orange-800/40',
        desc: 'Швидкість ~840 км/г. Іде на гранично малій висоті (150–250 м) вздовж річок із реактивним факелом.',
        weapon: 'Зброя: ПЗРК Stinger із захопленням цілі або комплекс Patriot.',
      },
      {
        num: '6',
        name: 'Х-47М2 Кинджал',
        badge: 'БАЛІСТИКА / ГІПЕРЗВУК',
        badgeClass: 'bg-rose-950 text-rose-300 border-rose-800/40',
        desc: 'Аеробалістична ракета зі швидкістю ~2200 км/г. Заходить зверху і збоку по діагоналі в яскравій плазмовій оболонці.',
        weapon: 'Зброя: ЗРК Patriot PAC-3 MSE (Hit-to-Kill перехоплювач).',
      },
      {
        num: '7',
        name: 'Іскандер-М',
        badge: 'БАЛІСТИКА ОТРК',
        badgeClass: 'bg-rose-950 text-rose-300 border-rose-800/40',
        desc: 'Важка квазібалістична ракета з потужною БЧ 480 кг. Заходить по пологій спадній траєкторії зверху і збоку (~1900 км/г).',
        weapon: 'Зброя: ЗРК Patriot PAC-3 MSE.',
      },
      {
        num: '8',
        name: 'БРСД «ОРЕШНИК» — ФІНАЛЬНИЙ БОС',
        badge: 'ФІНАЛЬНИЙ БОС (MIRV)',
        badgeClass: 'bg-rose-600 text-white font-bold',
        desc: 'Стратегічна ракета середньої дальності! Заходить зверху та збоку. Має запас міцності (500 HP). Рівно при 50% HP (250 HP) скидає обтічник та розділяється на 6 палаючих гіперзвукових бойових блоків!',
        weapon: 'Тактика: Зосередьте пуски ЗРК Patriot [клавіша 4] та загороджувальний вогонь Gepard по кожному блоку!',
        isBoss: true,
      },
      {
        num: '9',
        name: 'Герань-5 «Сикер» (2 стадія)',
        badge: 'ДВОДВИГУННИЙ РЕАКТИВНИЙ БПЛА',
        badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-800/40',
        desc: 'Ударний реактивний БПЛА нового покоління з двома мікротурбінами (~460 км/г) та оптико-електронною головкою самонаведення.',
        weapon: 'Зброя: ЗСУ Gepard (35-мм AHEAD) або ПЗРК Stinger.',
      },
      {
        num: '10',
        name: '3М22 «Циркон» (3 стадія)',
        badge: 'ГІПЕРЗВУК Mach 8',
        badgeClass: 'bg-rose-950 text-rose-300 border-rose-800/40',
        desc: 'Гіперзвукова крилата ракета з прямоточним ГППРД (~2600 км/г). Йде у сліпучій плазмовій оболонці з хвильовим ковзанням.',
        weapon: 'Зброя: ЗРК Patriot PAC-3 MSE.',
      },
      {
        num: '11',
        name: '«Бандероль» (3-4 стадія)',
        badge: 'ШВИДКІСНИЙ ДРОН ДОСТАВКИ',
        badgeClass: 'bg-amber-950 text-amber-300 border-amber-800/40',
        desc: 'Малорозмірний швидкісний дрон-камікадзе доставки бойової частини (~260 км/г) з аеродинамічною схемою «качка» та непередбачуваною траєкторією.',
        weapon: 'Зброя: Кулемет 12.7 мм або ЗСУ Gepard.',
      },
    ];
  };

  const threatDossier = getThreatDossier();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-hud tracking-wide text-neutral-100 uppercase">
                {t.hqTitle}
              </h2>
              <p className="text-xs text-neutral-400">
                {t.hqSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector in HQ Header */}
            <LanguageSelector variant="compact" />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setActiveTab('missions')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'missions'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t.tabMissions}
              </button>
              <button
                onClick={() => setActiveTab('intel')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'intel'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t.tabIntel}
              </button>
              <button
                onClick={() => setActiveTab('arsenal')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === 'arsenal'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t.tabArsenal}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'missions' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Mission Selector List */}
              <div className="md:col-span-5 flex flex-col gap-2">
                <div className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                  {t.scenarios}:
                </div>

                {MISSIONS.map((m) => {
                  const title = getMissionTitle(m.id, m.title);
                  const subtitle = getMissionSubtitle(m.id, m.subtitle);
                  const diffLabel = getDifficultyLabel(m.difficulty);

                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedId(m.id)}
                      className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedId === m.id
                          ? 'bg-neutral-900 border-emerald-500/70 shadow-lg shadow-emerald-950/20'
                          : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold font-code text-neutral-400">
                            #{m.number}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                              m.difficulty === 'легка'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                : m.difficulty === 'середня'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                                : m.difficulty === 'висока'
                                ? 'bg-orange-950 text-orange-400 border border-orange-800/40'
                                : m.difficulty === 'БОС'
                                ? 'bg-rose-600 text-white font-bold animate-pulse'
                                : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                            }`}
                          >
                            {diffLabel}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-neutral-100 font-hud">
                          {title}
                        </div>
                        <div className="text-xs text-neutral-400 truncate max-w-[210px] mt-0.5">
                          {subtitle}
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 mt-2 transition-transform ${
                          selectedId === m.id ? 'text-emerald-400 translate-x-1' : 'text-neutral-600'
                        }`}
                      />
                    </button>
                  );
                })}

                {/* Endless Mode Option */}
                <button
                  onClick={() => handleStartMission(null, true)}
                  className="mt-2 flex items-center justify-between p-3 rounded-xl border border-rose-500/30 bg-rose-950/15 hover:bg-rose-950/30 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Skull className="w-4 h-4 text-rose-400" />
                    <div>
                      <div className="text-xs font-bold text-rose-300 font-hud uppercase">
                        {t.endlessMissionTitle}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {t.endlessMissionSubtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              </div>

              {/* Selected Mission Detailed Briefing */}
              <div className="md:col-span-7 flex flex-col justify-between bg-neutral-900/40 border border-neutral-800/80 p-5 rounded-2xl">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-code text-emerald-400 uppercase tracking-widest font-bold">
                      {t.tabMissions.toUpperCase()} {currentMission.number} / {MISSIONS.length}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{currentMission.durationSeconds} s</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold font-hud text-neutral-100 mb-1">
                    {getMissionTitle(currentMission.id, currentMission.title)}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium mb-4">
                    {getMissionSubtitle(currentMission.id, currentMission.subtitle)}
                  </p>

                  <div className="p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-xl mb-4 text-xs text-neutral-300 leading-relaxed">
                    {getMissionDescription(currentMission.id, currentMission.description)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800">
                      <div className="text-[10px] text-neutral-500 uppercase font-semibold mb-1">
                        {t.targetsToDefeat}
                      </div>
                      <div className="text-sm font-bold font-code text-amber-400">
                        {currentMission.hasBoss
                          ? `180s + ${t.bossButton}`
                          : `${currentMission.totalTargets}`}
                      </div>
                    </div>
                    <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800">
                      <div className="text-[10px] text-neutral-500 uppercase font-semibold mb-1">
                        {t.arsenalLabel}
                      </div>
                      <div className="text-sm font-bold font-code text-emerald-400">
                        {currentMission.unlockedWeapons.length}
                      </div>
                    </div>
                  </div>

                  {/* Operational Image Banner */}
                  <div className="relative h-28 rounded-xl overflow-hidden border border-neutral-800 mb-4">
                    <img
                      src="/src/assets/images/air_defense_truck_1791394294337.jpg"
                      alt="Mobile Air Defense Group"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 text-[11px] font-code text-neutral-300">
                      {currentMission.hasBoss
                        ? `⚠️ 180s → ${t.bossButton}`
                        : 'Air Defense Position'}
                    </div>
                  </div>
                </div>

                {/* Launch Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleStartMission(currentMission, false)}
                    className="flex-1 py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold font-hud text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>{t.startMissionBtn}</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-xl border border-neutral-800 transition-colors cursor-pointer"
                  >
                    {t.btnReturnHq}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Intel / Enemy Threats Dossier (Exact 8 threats) */}
          {activeTab === 'intel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {threatDossier.map((threat) => {
                const photo = MISSILE_PHOTOS[threat.num];
                return (
                  <div
                    key={threat.num}
                    className={`p-3.5 border rounded-xl flex flex-col justify-between ${
                      threat.isBoss
                        ? 'bg-neutral-900/90 border-2 border-rose-500 bg-rose-950/30 col-span-1 md:col-span-2 shadow-lg shadow-rose-950/50'
                        : 'bg-neutral-900/60 border-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {threat.isBoss && <Skull className="w-4 h-4 text-rose-500 animate-bounce" />}
                          <h4
                            className={`font-bold font-hud text-xs ${
                              threat.isBoss ? 'text-rose-300 text-sm' : 'text-neutral-100'
                            }`}
                          >
                            {threat.num}. {threat.name}
                          </h4>
                        </div>
                        <span className={`text-[9px] font-code px-1.5 py-0.5 rounded border ${threat.badgeClass}`}>
                          {threat.badge}
                        </span>
                      </div>

                      {/* Photo Thumbnail if available */}
                      {photo && (
                        <div
                          onClick={() => {
                            soundEngine.playClick();
                            setPreviewPhoto({
                              src: photo.src,
                              title: threat.name,
                              caption: photo.caption,
                            });
                          }}
                          className="group relative my-2 h-28 sm:h-32 rounded-lg overflow-hidden border border-neutral-700/60 bg-neutral-950 cursor-pointer shadow-md"
                        >
                          <img
                            src={photo.src}
                            alt={threat.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-neutral-200">
                            <span className="font-hud flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-neutral-700">
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>ФОТО / INTEL PHOTO</span>
                            </span>
                            <span className="p-1 rounded bg-black/60 border border-neutral-700 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                              <Maximize2 className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-neutral-300 mb-2 leading-relaxed">
                        {threat.desc}
                      </p>
                    </div>

                    <div
                      className={`text-[10px] font-code pt-1 ${
                        threat.isBoss ? 'text-rose-300 font-bold' : 'text-neutral-400'
                      }`}
                    >
                      {threat.weapon}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Arsenal Info */}
          {activeTab === 'arsenal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
                <h4 className="font-bold text-amber-400 font-hud text-sm mb-1">
                  {t.weaponBrowningName}
                </h4>
                <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
                  {t.weaponBrowningDesc}
                </p>
                <span className="text-[11px] font-code text-neutral-400">
                  [1] · {t.infiniteAmmo} · FPV & Shahed
                </span>
              </div>

              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
                <h4 className="font-bold text-amber-400 font-hud text-sm mb-1">
                  {t.weaponGepardName}
                </h4>
                <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
                  {t.weaponGepardDesc}
                </p>
                <span className="text-[11px] font-code text-neutral-400">
                  [2] · 35mm AHEAD · 160 rounds
                </span>
              </div>

              <div className="p-4 bg-neutral-900/60 border border-emerald-400/40 rounded-2xl">
                <h4 className="font-bold text-emerald-400 font-hud text-sm mb-1">
                  {t.weaponStingerName}
                </h4>
                <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
                  {t.weaponStingerDesc}
                </p>
                <span className="text-[11px] font-code text-neutral-400">
                  [3] · IR Lock-On · Kh-101 & Geran-4
                </span>
              </div>

              <div className="p-4 bg-neutral-900/60 border border-sky-400/40 rounded-2xl">
                <h4 className="font-bold text-sky-400 font-hud text-sm mb-1">
                  {t.weaponPatriotName}
                </h4>
                <p className="text-xs text-neutral-300 mb-2 leading-relaxed">
                  {t.weaponPatriotDesc}
                </p>
                <span className="text-[11px] font-code text-neutral-400">
                  [4] · PAC-3 MSE · Hit-to-Kill (Iskander, Kinzhal, Oreshnik)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Fullscreen Photo Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-neutral-950 border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-900/90">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="font-hud font-bold text-neutral-100 text-sm uppercase">
                  {previewPhoto.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={previewPhoto.src}
                alt={previewPhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 bg-neutral-900/90 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-300">
              <p className="font-hud leading-relaxed">
                {previewPhoto.caption}
              </p>
              <a
                href={previewPhoto.src}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg transition-colors cursor-pointer text-[11px] whitespace-nowrap self-end sm:self-auto"
              >
                Відкрити / Завантажити
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
