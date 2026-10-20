export type Language = 'uk' | 'en' | 'ru';

export interface Translations {
  // App & Header
  appTitle: string;
  appSubtitle: string;
  scenarios: string;
  bossButton: string;
  endlessMode: string;
  controls: string;
  sound: string;
  settings: string;
  escHint: string;

  // Title Menu
  defenseForcesBadge: string;
  titleHero: string;
  gameDescription: string;
  storyMode: string;
  btnStoryMode: string;
  storyCampaign: string;
  btnStartDefense: string;
  btnBossOreshnik: string;
  btnMissionHq: string;
  featureVision: string;
  featureVisionDesc: string;
  featureArsenal: string;
  featureArsenalDesc: string;
  featureThreats: string;
  featureThreatsDesc: string;

  // HUD
  cityIntegrity: string;
  cityClearSky: string;
  killsLabel: string;
  scoreLabel: string;
  missionsLabel: string;
  bossName: string;
  bossSplitAlert: string;
  bossSplitNote: string;
  surviveUntilOreshnik: string;
  ballisticAlert: string;
  cruiseAlert: string;
  geranGroupAlert: string;
  opticalMode: string;
  flirMode: string;
  radarMode: string;
  searchlightToggle: string;
  leadAidToggle: string;
  resupplyAmmo: string;
  infiniteAmmo: string;
  ammoShort: string;
  missilesShort: string;
  heatLabel: string;
  overheatedLabel: string;

  // Survival phases & hints
  survivalPhase1: string;
  survivalHint1: string;
  survivalPhase2: string;
  survivalHint2: string;
  survivalPhase3: string;
  survivalHint3: string;
  survivalPhase4: string;
  survivalHint4: string;
  survivalBossArrived: string;
  ammoAirdrop: string;

  // Weapons
  weaponBrowningName: string;
  weaponBrowningShort: string;
  weaponBrowningRole: string;
  weaponBrowningDesc: string;

  weaponGepardName: string;
  weaponGepardShort: string;
  weaponGepardRole: string;
  weaponGepardDesc: string;

  weaponStingerName: string;
  weaponStingerShort: string;
  weaponStingerRole: string;
  weaponStingerDesc: string;

  weaponPatriotName: string;
  weaponPatriotShort: string;
  weaponPatriotRole: string;
  weaponPatriotDesc: string;

  // Difficulties
  diffEasy: string;
  diffMedium: string;
  diffHard: string;
  diffExtreme: string;
  diffBoss: string;

  // Missions
  m1Title: string;
  m1Subtitle: string;
  m1Desc: string;

  m2Title: string;
  m2Subtitle: string;
  m2Desc: string;

  m3Title: string;
  m3Subtitle: string;
  m3Desc: string;

  m4Title: string;
  m4Subtitle: string;
  m4Desc: string;

  m5Title: string;
  m5Subtitle: string;
  m5Desc: string;

  // Mission HQ Modal
  hqTitle: string;
  hqSubtitle: string;
  tabMissions: string;
  tabIntel: string;
  tabArsenal: string;
  startMissionBtn: string;
  endlessMissionTitle: string;
  endlessMissionSubtitle: string;
  endlessMissionDesc: string;
  targetsToDefeat: string;
  durationLabel: string;
  environmentLabel: string;
  threatsLabel: string;
  arsenalLabel: string;
  sectorsLabel: string;

  // Threat Dossier
  intelTitle: string;
  intelSubtitle: string;
  speedUnit: string;
  altUnit: string;
  kmh: string;

  // After Action Report
  victoryTitle: string;
  victoryDesc: string;
  defeatTitle: string;
  defeatDesc: string;
  rankLabel: string;
  citySavedLabel: string;
  shotsAccuracyLabel: string;
  totalDestroyedLabel: string;
  scoreEarnedLabel: string;
  btnNextMission: string;
  btnRetryMission: string;
  btnReturnHq: string;

  // Settings Modal
  settingsTitle: string;
  soundVolume: string;
  leadAidSetting: string;
  leadAidSettingDesc: string;
  languageSetting: string;
  languageSettingDesc: string;
  keybindingsTitle: string;
  keyAim: string;
  keyAimDesc: string;
  keyBrowning: string;
  keyGepard: string;
  keyStinger: string;
  keyPatriot: string;
  keyReload: string;
  keySearchlight: string;
  keyVision: string;
  keyMute: string;
  keyMenu: string;

  // Sectors
  secPower: string;
  secPowerDesc: string;
  secResidential: string;
  secResidentialDesc: string;
  secLogistics: string;
  secLogisticsDesc: string;
  secFuel: string;
  secFuelDesc: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  uk: {
    appTitle: 'Небесний Щит: Симулятор ППО',
    appSubtitle: 'Тактичний симулятор протиповітряної оборони',
    scenarios: 'Сценарії оборони',
    bossButton: 'ФІНАЛЬНИЙ БОС: ОРЕШНИК',
    endlessMode: 'Нескінченна варта',
    controls: 'Керування',
    sound: 'Звук [M]',
    settings: 'Налаштування',
    escHint: 'Меню місій [Esc]',

    defenseForcesBadge: 'Сили Протиповітряної Оборони України',
    titleHero: 'Небесний Щит',
    gameDescription:
      'Тактичний симулятор перехоплення ворожих загроз: збивай шахеди, крилаті ракети, балістику та розпади БРСД «Орешник» мобільними вогневими групами, Gepard та ЗРК Patriot.',
    storyMode: 'Сюжетний режим',
    btnStoryMode: 'СЮЖЕТНИЙ РЕЖИМ',
    storyCampaign: 'Сюжетна кампанія',
    btnStartDefense: 'ОБОРОНА #1',
    btnBossOreshnik: 'БОС: ОРЕШНИК',
    btnMissionHq: 'ШТАБ МІСІЙ',
    featureVision: 'Режими зору',
    featureVisionDesc: 'Тепловізор FLIR · Прожектор · РЛС',
    featureArsenal: 'Арсенал ППО',
    featureArsenalDesc: 'ДШК 12.7 · Gepard · Stinger · Patriot',
    featureThreats: 'Загрози',
    featureThreatsDesc: 'Шахеди · Бандероль · Циркон · Орешник',

    cityIntegrity: 'Місто:',
    cityClearSky: 'Небо чисте',
    killsLabel: 'Збито:',
    scoreLabel: 'Бали:',
    missionsLabel: 'Місії',
    bossName: 'БОС: БРСД «ОРЕШНИК»',
    bossSplitAlert: 'РОЗПАД ОРЕШНИКА: СУББОЄПРИПАСИ',
    bossSplitNote: '(РОЗПАД НА 50% HP)',
    surviveUntilOreshnik: 'ВИЖИТИ ДО ОРЕШНИКА:',
    ballisticAlert: 'БАЛІСТИКА! ПУСК PATRIOT [4]',
    cruiseAlert: 'КРИЛАТА Х-101 / КАЛІБР',
    geranGroupAlert: 'Група Герань-2 / Герань-4',
    opticalMode: 'Оптика',
    flirMode: 'Тепловізор',
    radarMode: 'РЛС',
    searchlightToggle: 'Прожектор [Пробіл]',
    leadAidToggle: 'Упередження',
    resupplyAmmo: 'Поповнити',
    infiniteAmmo: 'НЕСКІНЧ.',
    ammoShort: 'БК:',
    missilesShort: 'Ракет:',
    heatLabel: 'Нагрів:',
    overheatedLabel: 'ПЕРЕНАГРІВ',

    survivalPhase1: 'ФАЗА 1: РІЙ FPV ТА ШАХЕДИ',
    survivalHint1: 'Кулемет 12.7 мм [1] та прожектор [Пробіл]',
    survivalPhase2: 'ФАЗА 2: ГЕРАНЬ-5 «СИКЕР», ГЕРАНЬ-4 ТА Х-101',
    survivalHint2: 'Реактивні Герань-5, Х-101! Gepard 35мм [2] та ПЗРК Stinger [3]',
    survivalPhase3: 'ФАЗА 3: ЦИРКОН, БАНДЕРОЛІ ТА БАЛІСТИКА',
    survivalHint3: 'Гіперзвуковий Циркон, Іскандер, Бандеролі! Patriot [4] та Gepard [2]',
    survivalPhase4: 'ФАЗА 4: ФІНАЛЬНИЙ РОЙ БАНДЕРОЛЕЙ ТА РАКЕТ',
    survivalHint4: 'Бандеролі, Циркони, балістика! 30 сек до Орешника!',
    survivalBossArrived: '🚨 180 СЕК ВИТРИМАНО! ФІНАЛЬНИЙ БОС: БРСД «ОРЕШНИК» У ПОВІТРІ! 🚨',
    ammoAirdrop: '📦 ПІДВЕЗЕННЯ БОЄКОМПЛЕКТУ: PATRIOT ТА GEPARD ПОПОВНЕНО!',

    weaponBrowningName: 'Кулемет ДШК / Browning M2 (12.7 мм)',
    weaponBrowningShort: 'Кулемет 12.7 мм',
    weaponBrowningRole: 'FPV & Герань',
    weaponBrowningDesc:
      'Мобільна вогнева група: висока щільність трасерного вогню, ідеально проти FPV, Гербер та Герань-2.',

    weaponGepardName: 'ЗСУ Flakpanzer Gepard (2x35 мм)',
    weaponGepardShort: 'Gepard 35 мм',
    weaponGepardRole: 'AHEAD Осколки',
    weaponGepardDesc:
      'Спарена автоматична гармата зі снарядами AHEAD: дистанційний підрив та хмара осколків проти реактивних БПЛА та крилатих ракет.',

    weaponStingerName: 'ПЗРК FIM-92 Stinger / Ігла-1',
    weaponStingerShort: 'ПЗРК Stinger',
    weaponStingerRole: 'ІЧ Захоплення',
    weaponStingerDesc:
      'Інфрачервона ГСН: утримуйте приціл на цілі для захоплення теплового сліду двигуна перед пуском.',

    weaponPatriotName: 'ЗРК Patriot PAC-3 MSE',
    weaponPatriotShort: 'ЗРК Patriot',
    weaponPatriotRole: 'Протибалістика',
    weaponPatriotDesc:
      'Протибалістичний комплекс Hit-to-Kill: гіперзвуковий кінетичний перехоплювач балістики (Іскандер, Кинджал) та блоків Орешника!',

    diffEasy: 'легка',
    diffMedium: 'середня',
    diffHard: 'висока',
    diffExtreme: 'екстремальна',
    diffBoss: 'БОС',

    m1Title: 'Мінімальна загроза: FPV-дрони та Гербери',
    m1Subtitle: 'Робота мобільної групи з кулеметом 12.7 мм',
    m1Desc:
      'Противник випробовує оборону швидкими маневровими FPV-дронами та фанерними дронами-обманками "Гербера". Працюйте кулеметом ДШК/Браунінг із прожектором, відпрацьовуючи приціл упередження.',

    m2Title: 'Ударні крила: Герань-2 та Герань-4 «Сикер»',
    m2Subtitle: 'Поршневі та реактивні камікадзе під прикриттям FPV',
    m2Desc:
      'Масований наліт важких ударних БПЛА: класичні Герань-2 із толкаючим гвинтом та новітні реактивні Герань-4 «Сикер» з оптичною головкою. Використовуйте ЗСУ Gepard 35-мм!',

    m3Title: 'Крилата атака: Х-101 та Калібр',
    m3Subtitle: 'Перехоплення наднизьких швидкісних цілей',
    m3Desc:
      'У сектор заходять стратегічні крилаті ракети Х-101 та морські "Калібри" на надмалій висоті під прикриттям реактивних Герань-4. Вмикайте тепловізор FLIR та застосовуйте ПЗРК Stinger із захопленням цілі!',

    m4Title: 'БАЛІСТИКА: Іскандер-М та Кинджал',
    m4Subtitle: 'Гіперзвуковий удар із космосу',
    m4Desc:
      'Тривога по всій лінії! Зафіксовано пуски квазібалістичних ракет Іскандер-М та аеробалістичних гіперзвукових ракет Кинджал. Лічені секунди на розгортання ЗРК Patriot PAC-3!',

    m5Title: 'ФІНАЛЬНИЙ БОС: БРСД ОРЕШНИК',
    m5Subtitle: 'Вижити 180 секунд під безперервним роєм · Усі типи загроз · ОРЕШНИК',
    m5Desc:
      'Головна битва за небо! Протримайтесь 180 секунд під постійним масованим роєм FPV-дронів, Гербер, Герань-2, реактивних Герань-4 «Сикер», крилатих ракет Х-101/Калібр та балістики (Іскандер-М, Кинджал). Після 180 секунд виживання — кульмінація: вихід стратегічної БРСД «ОРЕШНИК» з розпадом на 6 блоків при 50% HP!',

    hqTitle: 'Оперативний Штаб ППО',
    hqSubtitle: 'Захист повітряного простору: шахеди, балістика, ОРЕШНИК',
    tabMissions: 'Бойові Місії',
    tabIntel: 'Досьє Загроз (11 типів)',
    tabArsenal: 'Зброя ППО',
    startMissionBtn: 'РОЗПОЧАТИ ОБОРОНУ',
    endlessMissionTitle: 'Нескінченна варта: Відбиття масованих хвиль',
    endlessMissionSubtitle: 'Постійне наростання складності до прориву',
    endlessMissionDesc:
      'Нескінченна бойова черга проти змішаних хвиль дронів, крилатих та балістичних ракет із динамічним підвезенням боєкомплекту.',
    targetsToDefeat: 'Цілей у нальоті',
    durationLabel: 'Тривалість',
    environmentLabel: 'Погодні умови',
    threatsLabel: 'Очікувані загрози',
    arsenalLabel: 'Доступне озброєння',
    sectorsLabel: 'Сектори під захистом',

    intelTitle: 'Розвідка та ТТХ повітряних цілей',
    intelSubtitle: 'Класифікація та вразливості повітряних цілей противника',
    speedUnit: 'км/г',
    altUnit: 'м',
    kmh: 'км/г',

    victoryTitle: 'СЕКТОР ЗАХИЩЕНО! ПЕРЕМОГА',
    victoryDesc: 'Усі повітряні цілі знищено. Критична інфраструктура встояла!',
    defeatTitle: 'СЕКТОР ПРОРВАНО! ПОРАЗКА',
    defeatDesc: 'Критична інфраструктура міста зазнала непоправних руйнувань.',
    rankLabel: 'Бойове звання:',
    citySavedLabel: 'Цілісність міста:',
    shotsAccuracyLabel: 'Точність стрільби:',
    totalDestroyedLabel: 'Знищено цілей:',
    scoreEarnedLabel: 'Набрано балів:',
    btnNextMission: 'НАСТУПНА МІСІЯ',
    btnRetryMission: 'ПОВТОРИТИ ОБОРОНУ',
    btnReturnHq: 'ШТАБ МІСІЙ',

    settingsTitle: 'Налаштування та Керування',
    soundVolume: 'Гучність бойових ефектів',
    leadAidSetting: 'Маркер упередження стрільби (Lead Indicator)',
    leadAidSettingDesc: 'Відображає розраховану точку прицілювання з урахуванням швидкості кулі/снаряда',
    languageSetting: 'Мова інтерфейсу (Language)',
    languageSettingDesc: 'Оберіть зручну мову інтерфейсу, брифінгів та бойових сповіщень',
    keybindingsTitle: 'Клавіші бойового розрахунку',
    keyAim: 'Прицілювання та вогонь:',
    keyAimDesc: 'Миша (затискання для черги)',
    keyBrowning: 'Кулемет 12.7 мм:',
    keyGepard: 'ЗСУ Gepard 35мм:',
    keyStinger: 'ПЗРК Stinger:',
    keyPatriot: 'ЗРК Patriot PAC-3:',
    keyReload: 'Перезарядка / Поповнити БК:',
    keySearchlight: 'Прожектор МВГ:',
    keyVision: 'Зміна режиму зору (FLIR/РЛС):',
    keyMute: 'Вимкнути/увімкнути звук:',
    keyMenu: 'Меню місій / Пауза:',

    secPower: 'ТЕЦ та енергопідстанції',
    secPowerDesc: 'Критична інфраструктура живлення міста та лікарень',
    secResidential: 'Житлові квартали та центр',
    secResidentialDesc: 'Спальні райони, цивільне населення під захистом мобільних груп',
    secLogistics: 'Мости та логістичний вузол',
    secLogisticsDesc: 'Транспортні артерії постачання та звʼязок',
    secFuel: 'Резервуари пального та склад',
    secFuelDesc: 'Стратегічні запаси палива для генераторів та техніки',
  },

  en: {
    appTitle: 'Sky Shield: Air Defense Simulator',
    appSubtitle: 'Tactical Air Defense Interception Simulator',
    scenarios: 'Defense Scenarios',
    bossButton: 'FINAL BOSS: ORESHNIK',
    endlessMode: 'Endless Watch',
    controls: 'Controls',
    sound: 'Sound [M]',
    settings: 'Settings',
    escHint: 'Mission HQ [Esc]',

    defenseForcesBadge: 'Air Defense Forces of Ukraine',
    titleHero: 'Sky Shield',
    gameDescription:
      'Tactical interception simulator: shoot down Shaheds, cruise missiles, ballistic strikes, and Oreshnik MRBM MIRV warhead clusters with mobile fire groups, Flakpanzer Gepard, and Patriot SAM.',
    storyMode: 'Story Mode',
    btnStoryMode: 'STORY CAMPAIGN',
    storyCampaign: 'Story Campaign',
    btnStartDefense: 'DEFENSE #1',
    btnBossOreshnik: 'BOSS: ORESHNIK',
    btnMissionHq: 'MISSION HQ',
    featureVision: 'Vision Modes',
    featureVisionDesc: 'Thermal FLIR · Searchlight · Radar PPI',
    featureArsenal: 'AD Arsenal',
    featureArsenalDesc: '12.7mm M2 · Gepard · Stinger · Patriot',
    featureThreats: 'Air Threats',
    featureThreatsDesc: 'Shaheds · Banderol · Zircon · Oreshnik',

    cityIntegrity: 'City:',
    cityClearSky: 'Sky is clear',
    killsLabel: 'Kills:',
    scoreLabel: 'Score:',
    missionsLabel: 'Missions',
    bossName: 'BOSS: MRBM "ORESHNIK"',
    bossSplitAlert: 'ORESHNIK MIRV SPLIT: 6 WARHEADS',
    bossSplitNote: '(SPLITS AT 50% HP)',
    surviveUntilOreshnik: 'SURVIVE UNTIL ORESHNIK:',
    ballisticAlert: 'BALLISTIC! LAUNCH PATRIOT [4]',
    cruiseAlert: 'CRUISE KH-101 / KALIBR',
    geranGroupAlert: 'Geran-2 / Geran-4 Inbound',
    opticalMode: 'Optical',
    flirMode: 'FLIR Thermal',
    radarMode: 'Radar',
    searchlightToggle: 'Searchlight [Space]',
    leadAidToggle: 'Lead Aid',
    resupplyAmmo: 'Resupply',
    infiniteAmmo: 'INF',
    ammoShort: 'Ammo:',
    missilesShort: 'Missiles:',
    heatLabel: 'Heat:',
    overheatedLabel: 'OVERHEAT',

    survivalPhase1: 'PHASE 1: FPV & SHAHED SWARM',
    survivalHint1: '12.7mm Machine Gun [1] & Searchlight [Space]',
    survivalPhase2: 'PHASE 2: GERAN-5 SEEKER, GERAN-4 & KH-101',
    survivalHint2: 'Twin-jet Geran-5, Kh-101! Gepard 35mm [2] & MANPADS Stinger [3]',
    survivalPhase3: 'PHASE 3: ZIRCON, BANDEROL & BALLISTICS',
    survivalHint3: 'Hypersonic Zircon, Iskander, Banderols! Patriot [4] & Gepard [2]',
    survivalPhase4: 'PHASE 4: FINAL BANDEROL & MISSILE SURGE',
    survivalHint4: 'Banderols, Zircons, Ballistics! 30s until Oreshnik!',
    survivalBossArrived: '🚨 180s SURVIVED! FINAL BOSS: MRBM "ORESHNIK" INBOUND! 🚨',
    ammoAirdrop: '📦 SUPPLY AIRDROP: PATRIOT & GEPARD AMMO RESTOCKED!',

    weaponBrowningName: 'DShK / Browning M2 (12.7mm HMG)',
    weaponBrowningShort: '12.7mm HMG',
    weaponBrowningRole: 'FPV & Shahed',
    weaponBrowningDesc:
      'Mobile Fire Team: high-density tracer fire, optimal against low-altitude FPV drones, Gerbera decoys, and Geran-2.',

    weaponGepardName: 'Flakpanzer Gepard (Twin 35mm SPAAG)',
    weaponGepardShort: 'Gepard 35mm',
    weaponGepardRole: 'AHEAD Flak',
    weaponGepardDesc:
      'Twin autocannon with AHEAD programmable ammunition: airburst fragmentation cloud against high-speed jet drones and cruise missiles.',

    weaponStingerName: 'MANPADS FIM-92 Stinger / Igla-1',
    weaponStingerShort: 'Stinger MANPADS',
    weaponStingerRole: 'IR Lock-On',
    weaponStingerDesc:
      'Infrared heatseeker: maintain lock-on crosshair on target exhaust signature before missile launch.',

    weaponPatriotName: 'Patriot PAC-3 MSE Air Defense System',
    weaponPatriotShort: 'Patriot PAC-3',
    weaponPatriotRole: 'Anti-Ballistic',
    weaponPatriotDesc:
      'Hit-to-Kill anti-ballistic system: hypersonic kinetic interceptor engineered against Iskander, Kinzhal, and Oreshnik MIRVs!',

    diffEasy: 'easy',
    diffMedium: 'medium',
    diffHard: 'hard',
    diffExtreme: 'extreme',
    diffBoss: 'BOSS',

    m1Title: 'Initial Threat: FPV Drones & Gerberas',
    m1Subtitle: 'Mobile fire group with 12.7mm machine gun',
    m1Desc:
      'Enemy tests defense perimeter with agile FPV drones and wooden Gerbera decoy drones. Use Browning/DShK with searchlight and lead reticle.',

    m2Title: 'Strike Wings: Geran-2 & Geran-4 Seeker',
    m2Subtitle: 'Piston & jet-propelled kamikazes under FPV cover',
    m2Desc:
      'Mass raid of heavy loitering munitions: classic propeller Geran-2 and jet-powered Geran-4 Seeker with optical terminal homing. Deploy Gepard 35mm!',

    m3Title: 'Cruise Assault: Kh-101 & Kalibr',
    m3Subtitle: 'Interception of ultra-low fast cruise missiles',
    m3Desc:
      'Strategic Kh-101 and naval Kalibr cruise missiles flying along riverbeds at ultra-low altitudes. Switch to FLIR thermal and fire Stinger MANPADS!',

    m4Title: 'BALLISTIC STRIKE: Iskander-M & Kinzhal',
    m4Subtitle: 'Hypersonic orbital descent',
    m4Desc:
      'Air raid sirens active across the region! Quasi-ballistic Iskander-M and aeroballistic hypersonic Kinzhal missiles detected. Seconds to deploy Patriot PAC-3 MSE!',

    m5Title: 'FINAL BOSS: MRBM ORESHNIK',
    m5Subtitle: 'Survive 180s under continuous swarm · All threat types · ORESHNIK',
    m5Desc:
      'The ultimate battle for the skies! Hold out for 180 seconds under a continuous relentless swarm of FPVs, Gerberas, Shaheds, jet Geran-4s, Kh-101 cruise missiles, and ballistics. After 180s, the climax arrives: the strategic MRBM Oreshnik emerges, splitting into 6 hypersonic MIRV warheads at 50% HP!',

    hqTitle: 'Air Defense Command HQ',
    hqSubtitle: 'Airspace defense operations: Shaheds, Ballistics, ORESHNIK',
    tabMissions: 'Combat Missions',
    tabIntel: 'Threat Dossier (11 Types)',
    tabArsenal: 'AD Arsenal',
    startMissionBtn: 'COMMENCE DEFENSE',
    endlessMissionTitle: 'Endless Watch: Continuous Threat Waves',
    endlessMissionSubtitle: 'Dynamic difficulty scaling until sector breach',
    endlessMissionDesc:
      'Endless combat shift against escalating mixed waves of drones, cruise missiles, and ballistic warheads with tactical ammo resupplies.',
    targetsToDefeat: 'Raid Targets',
    durationLabel: 'Duration',
    environmentLabel: 'Weather & Light',
    threatsLabel: 'Expected Threats',
    arsenalLabel: 'Available Weapons',
    sectorsLabel: 'Sectors to Defend',

    intelTitle: 'Air Intelligence & Target Specifications',
    intelSubtitle: 'Classification, speeds, altitudes, and vulnerabilities',
    speedUnit: 'km/h',
    altUnit: 'm',
    kmh: 'km/h',

    victoryTitle: 'SECTOR SECURED! VICTORY',
    victoryDesc: 'All hostile air targets neutralized. Critical infrastructure protected!',
    defeatTitle: 'SECTOR COMPROMISED! DEFEAT',
    defeatDesc: 'City infrastructure sustained catastrophic damage from unintercepted strikes.',
    rankLabel: 'Combat Rank:',
    citySavedLabel: 'City Integrity:',
    shotsAccuracyLabel: 'Gunnery Accuracy:',
    totalDestroyedLabel: 'Targets Destroyed:',
    scoreEarnedLabel: 'Score Accumulated:',
    btnNextMission: 'NEXT MISSION',
    btnRetryMission: 'RETRY DEFENSE',
    btnReturnHq: 'MISSION HQ',

    settingsTitle: 'Settings & Controls',
    soundVolume: 'Combat Sound Volume',
    leadAidSetting: 'Target Lead Reticle (Lead Indicator)',
    leadAidSettingDesc: 'Projects estimated projectile lead point taking velocity into account',
    languageSetting: 'Interface Language',
    languageSettingDesc: 'Choose your preferred language for UI, mission briefings, and tactical alerts',
    keybindingsTitle: 'Operator Keyboard Shortcuts',
    keyAim: 'Aim & Fire:',
    keyAimDesc: 'Mouse (Hold left click to fire)',
    keyBrowning: '12.7mm Machine Gun:',
    keyGepard: 'Flakpanzer Gepard 35mm:',
    keyStinger: 'Stinger MANPADS:',
    keyPatriot: 'Patriot PAC-3 MSE:',
    keyReload: 'Reload / Resupply Ammo:',
    keySearchlight: 'Spotlight Searchlight:',
    keyVision: 'Cycle Vision Mode (FLIR/Radar):',
    keyMute: 'Toggle Sound Audio:',
    keyMenu: 'Mission HQ / Pause:',

    secPower: 'Power Plants & Substations',
    secPowerDesc: 'Critical grid infrastructure providing power to city & hospitals',
    secResidential: 'Residential Quarters & Downtown',
    secResidentialDesc: 'Civilian homes and urban center under mobile team defense',
    secLogistics: 'Bridges & Logistics Hub',
    secLogisticsDesc: 'Transport supply arteries and communication towers',
    secFuel: 'Fuel Depots & Warehouses',
    secFuelDesc: 'Strategic fuel reserves for emergency generators and military vehicles',
  },

  ru: {
    appTitle: 'Небесный Щит: Симулятор ПВО',
    appSubtitle: 'Тактический симулятор противовоздушной обороны',
    scenarios: 'Сценарии обороны',
    bossButton: 'ФИНАЛЬНЫЙ БОСС: ОРЕШНИК',
    endlessMode: 'Бесконечная стража',
    controls: 'Управление',
    sound: 'Звук [M]',
    settings: 'Настройки',
    escHint: 'Штаб миссий [Esc]',

    defenseForcesBadge: 'Силы Противовоздушной Обороны',
    titleHero: 'Небесный Щит',
    gameDescription:
      'Тактический симулятор перехвата воздушных угроз: уничтожай шахеды, крылатые ракеты, баллистику и распадающиеся блоки БРСД «Орешник» мобильными огневыми группами, Gepard и ЗРК Patriot.',
    storyMode: 'Сюжетный режим',
    btnStoryMode: 'СЮЖЕТНЫЙ РЕЖИМ',
    storyCampaign: 'Сюжетная кампания',
    btnStartDefense: 'ОБОРОНА #1',
    btnBossOreshnik: 'БОСС: ОРЕШНИК',
    btnMissionHq: 'ШТАБ МИССИЙ',
    featureVision: 'Режимы зрения',
    featureVisionDesc: 'Тепловизор FLIR · Прожектор · РЛС',
    featureArsenal: 'Арсенал ПВО',
    featureArsenalDesc: 'ДШК 12.7 · Gepard · Stinger · Patriot',
    featureThreats: 'Угрозы',
    featureThreatsDesc: 'Шахеды · Бандероль · Циркон · Орешник',

    cityIntegrity: 'Город:',
    cityClearSky: 'Небо чистое',
    killsLabel: 'Сбито:',
    scoreLabel: 'Очки:',
    missionsLabel: 'Миссии',
    bossName: 'БОСС: БРСД «ОРЕШНИК»',
    bossSplitAlert: 'РАСПАД ОРЕШНИКА: СУББОЕПРИПАСЫ',
    bossSplitNote: '(РАСПАД НА 50% HP)',
    surviveUntilOreshnik: 'ВЫЖИТЬ ДО ОРЕШНИКА:',
    ballisticAlert: 'БАЛЛИСТИКА! ПУСК PATRIOT [4]',
    cruiseAlert: 'КРЫЛАТАЯ Х-101 / КАЛИБР',
    geranGroupAlert: 'Группа Герань-2 / Герань-4',
    opticalMode: 'Оптика',
    flirMode: 'Тепловизор',
    radarMode: 'РЛС',
    searchlightToggle: 'Прожектор [Пробел]',
    leadAidToggle: 'Упреждение',
    resupplyAmmo: 'Пополнить',
    infiniteAmmo: 'БЕСКОНЕЧ.',
    ammoShort: 'БК:',
    missilesShort: 'Ракет:',
    heatLabel: 'Нагрев:',
    overheatedLabel: 'ПЕРЕНАГРЕВ',

    survivalPhase1: 'ФАЗА 1: РОЙ FPV И ШАХЕДЫ',
    survivalHint1: 'Пулемет 12.7 мм [1] и прожектор [Пробел]',
    survivalPhase2: 'ФАЗА 2: ГЕРАНЬ-5 «СИКЕР», ГЕРАНЬ-4 И Х-101',
    survivalHint2: 'Реактивные Герань-5, Х-101! Gepard 35мм [2] и ПЗРК Stinger [3]',
    survivalPhase3: 'ФАЗА 3: ЦИРКОН, БАНДЕРОЛИ И БАЛЛИСТИКА',
    survivalHint3: 'Гиперзвуковой Циркон, Искандер, Бандероли! Patriot [4] и Gepard [2]',
    survivalPhase4: 'ФАЗА 4: ФИНАЛЬНЫЙ РОЙ БАНДЕРОЛЕЙ И РАКЕТ',
    survivalHint4: 'Бандероли, Цирконы, баллистика! 30 сек до Орешника!',
    survivalBossArrived: '🚨 180 СЕК ВЫДЕРЖАНО! ФИНАЛЬНЫЙ БОСС: БРСД «ОРЕШНИК» В ВОЗДУХЕ! 🚨',
    ammoAirdrop: '📦 ПОДВОЗ БОЕКОМПЛЕКТА: PATRIOT И GEPARD ПОПОЛНЕНЫ!',

    weaponBrowningName: 'Пулемет ДШК / Browning M2 (12.7 мм)',
    weaponBrowningShort: 'Пулемет 12.7 мм',
    weaponBrowningRole: 'FPV & Герань',
    weaponBrowningDesc:
      'Мобильная огневая группа: высокая плотность трассирующего огня, идеально против FPV, Гербер и Герань-2.',

    weaponGepardName: 'ЗСУ Flakpanzer Gepard (2x35 мм)',
    weaponGepardShort: 'Gepard 35 мм',
    weaponGepardRole: 'AHEAD Осколки',
    weaponGepardDesc:
      'Спаренная автоматическая пушка со снарядами AHEAD: дистанционный подрыв и облако осколков против реактивных БПЛА и крылатых ракет.',

    weaponStingerName: 'ПЗРК FIM-92 Stinger / Игла-1',
    weaponStingerShort: 'ПЗРК Stinger',
    weaponStingerRole: 'ИК Захват',
    weaponStingerDesc:
      'Инфракрасная ГСН: удерживайте прицел на цели для захвата теплового следа двигателя перед пуском.',

    weaponPatriotName: 'ЗРК Patriot PAC-3 MSE',
    weaponPatriotShort: 'ЗРК Patriot',
    weaponPatriotRole: 'Противобаллистика',
    weaponPatriotDesc:
      'Противобаллистический комплекс Hit-to-Kill: гиперзвуковой кинетический перехватчик баллистики (Искандер, Кинжал) и боевых блоков Орешника!',

    diffEasy: 'легкая',
    diffMedium: 'средняя',
    diffHard: 'высокая',
    diffExtreme: 'экстремальная',
    diffBoss: 'БОСС',

    m1Title: 'Минимальная угроза: FPV-дроны и Герберы',
    m1Subtitle: 'Работа мобильной группы с пулеметом 12.7 мм',
    m1Desc:
      'Противник прощупывает оборону быстрыми маневренными FPV-дронами и фанерными дронами-обманками "Гербера". Работайте пулеметом ДШК/Браунинг с прожектором, отрабатывая прицел упреждения.',

    m2Title: 'Ударные крылья: Герань-2 и Герань-4 «Сикер»',
    m2Subtitle: 'Поршневые и реактивные камикадзе под прикрытием FPV',
    m2Desc:
      'Массированный налет тяжелых ударных БПЛА: классические Герань-2 с толкающим винтом и новейшие реактивные Герань-4 «Сикер» с оптической головкой. Используйте ЗСУ Gepard 35-мм!',

    m3Title: 'Крылатая атака: Х-101 и Калибр',
    m3Subtitle: 'Перехват сверхнизких скоростных целей',
    m3Desc:
      'В сектор заходят стратегические крылатые ракеты Х-101 и морские "Калибры" на сверхмалой высоте под прикрытием реактивных Герань-4. Включайте тепловизор FLIR и применяйте ПЗРК Stinger с захватом цели!',

    m4Title: 'БАЛЛИСТИКА: Искандер-М и Кинжал',
    m4Subtitle: 'Гиперзвуковой удар из космоса',
    m4Desc:
      'Тревога по всей линии! Зафиксированы пуски квазибаллистических ракет Искандер-М и аэробаллистических гиперзвуковых ракет Кинжал. Считанные секунды на развертывание ЗРК Patriot PAC-3!',

    m5Title: 'ФИНАЛЬНЫЙ БОСС: БРСД ОРЕШНИК',
    m5Subtitle: 'Выжить 180 секунд под непрерывным роем · Все типы угроз · ОРЕШНИК',
    m5Desc:
      'Главная битва за небо! Продержитесь 180 секунд под постоянным массированным роем FPV-дронов, Гербер, Герань-2, реактивных Герань-4 «Сикер», крылатых ракет Х-101/Калибр и баллистики (Искандер-М, Кинжал). После 180 секунд выживания — кульминация: выход стратегической БРСД «ОРЕШНИК» с распадом на 6 блоков при 50% HP!',

    hqTitle: 'Оперативный Штаб ПВО',
    hqSubtitle: 'Защита воздушного пространства: шахеды, баллистика, ОРЕШНИК',
    tabMissions: 'Боевые Миссии',
    tabIntel: 'Досье Угроз (11 типов)',
    tabArsenal: 'Оружие ПВО',
    startMissionBtn: 'НАЧАТЬ ОБОРОНУ',
    endlessMissionTitle: 'Бесконечная стража: Отражение массированных волн',
    endlessMissionSubtitle: 'Постоянное нарастание сложности до прорыва',
    endlessMissionDesc:
      'Бесконечное боевое дежурство против смешанных волн дронов, крылатых и баллистических ракет с динамическим подвозом боекомплекта.',
    targetsToDefeat: 'Целей в налете',
    durationLabel: 'Длительность',
    environmentLabel: 'Погодные условия',
    threatsLabel: 'Ожидаемые угрозы',
    arsenalLabel: 'Доступное вооружение',
    sectorsLabel: 'Секторы под защитой',

    intelTitle: 'Разведка и ТТХ воздушных целей',
    intelSubtitle: 'Классификация и уязвимости воздушных целей противника',
    speedUnit: 'км/ч',
    altUnit: 'м',
    kmh: 'км/ч',

    victoryTitle: 'СЕКТОР ЗАЩИЩЕН! ПОБЕДА',
    victoryDesc: 'Все воздушные цели уничтожены. Критическая инфраструктура устояла!',
    defeatTitle: 'СЕКТОР ПРОРВАН! ПОРАЖЕНИЕ',
    defeatDesc: 'Критическая инфраструктура города понесла непоправимый ущерб.',
    rankLabel: 'Боевое звание:',
    citySavedLabel: 'Целостность города:',
    shotsAccuracyLabel: 'Точность стрельбы:',
    totalDestroyedLabel: 'Уничтожено целей:',
    scoreEarnedLabel: 'Набрано очков:',
    btnNextMission: 'СЛЕДУЮЩАЯ МИССИЯ',
    btnRetryMission: 'ПОВТОРИТЬ ОБОРОНУ',
    btnReturnHq: 'ШТАБ МИССИЙ',

    settingsTitle: 'Настройки и Управление',
    soundVolume: 'Громкость боевых эффектов',
    leadAidSetting: 'Маркер упреждения стрельбы (Lead Indicator)',
    leadAidSettingDesc: 'Отображает расчетную точку прицеливания с учетом скорости пули/снаряда',
    languageSetting: 'Язык интерфейса (Language)',
    languageSettingDesc: 'Выберите удобный язык интерфейса, брифингов и боевых оповещений',
    keybindingsTitle: 'Клавиши боевого расчета',
    keyAim: 'Прицеливание и огонь:',
    keyAimDesc: 'Мышь (зажатие для очереди)',
    keyBrowning: 'Пулемет 12.7 мм:',
    keyGepard: 'ЗСУ Gepard 35мм:',
    keyStinger: 'ПЗРК Stinger:',
    keyPatriot: 'ЗРК Patriot PAC-3:',
    keyReload: 'Перезарядка / Пополнить БК:',
    keySearchlight: 'Прожектор МОГ:',
    keyVision: 'Смена режима зрения (FLIR/РЛС):',
    keyMute: 'Выключить/включить звук:',
    keyMenu: 'Меню миссий / Пауза:',

    secPower: 'ТЭЦ и энергоподстанции',
    secPowerDesc: 'Критическая инфраструктура питания города и больниц',
    secResidential: 'Жилые кварталы и центр',
    secResidentialDesc: 'Спальные районы, гражданское население под защитой мобильных групп',
    secLogistics: 'Мосты и логистический узел',
    secLogisticsDesc: 'Транспортные артерии снабжения и связь',
    secFuel: 'Резервуары топлива и склад',
    secFuelDesc: 'Стратегические запасы топлива для генераторов и техники',
  },
};
