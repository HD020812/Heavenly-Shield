import {
  TargetThreat,
  TargetType,
  WeaponType,
  Projectile,
  ParticleEffect,
  CitySector,
  Mission,
  GameStats,
} from '../types/game';
import { WEAPON_CONFIGS } from './constants';
import { soundEngine } from '../audio/soundEngine';

export class Simulation {
  public targets: TargetThreat[] = [];
  public projectiles: Projectile[] = [];
  public particles: ParticleEffect[] = [];
  public sectors: CitySector[] = [];
  public mission: Mission | null = null;
  public isEndless: boolean = false;

  public stats: GameStats = {
    score: 0,
    shotsFired: 0,
    shotsHit: 0,
    targetsDestroyed: {
      fpv: 0,
      geran2: 0,
      gerbera: 0,
      geran4_seeker: 0,
      geran5_seeker: 0,
      banderol: 0,
      kh101_kalibr: 0,
      zircon: 0,
      kinzhal: 0,
      iskander: 0,
      oreshnik_boss: 0,
    },
    cityDamageTaken: 0,
    flakExpended: 0,
    missilesExpended: 0,
    searchlightSpots: 0,
    highestStreak: 0,
    currentStreak: 0,
    bossDefeated: false,
  };

  public currentWeapon: WeaponType = 'browning';
  public weaponAmmo: Record<WeaponType, number> = {
    browning: 300,
    gepard: 160,
    stinger: 8,
    patriot: 8,
  };
  public weaponHeat: number = 0;
  public isOverheated: boolean = false;

  // Searchlight beam
  public searchlightOn: boolean = true;
  public searchlightAngle: number = -Math.PI / 2;
  public searchlightTargetX: number = 0;
  public searchlightTargetY: number = 0;

  // Crosshair & Locking
  public crosshairX: number = 0;
  public crosshairY: number = 0;
  public lockedTargetId: string | null = null;
  public lockProgress: number = 0;
  public lockState: 'off' | 'acquiring' | 'locked' = 'off';

  // Mission Pacing & Spawning
  public missionTimer: number = 0;
  public nextSpawnTimer: number = 1.5;
  public spawnedCount: number = 0;
  public totalToSpawn: number = 0;
  public missionCompleted: boolean = false;
  public missionFailed: boolean = false;
  public bossSpawned: boolean = false;

  // 180-second survival swarm before ORESHNIK BOSS
  public survivalTimeRemaining: number = 180;
  public readonly SURVIVAL_TOTAL_TIME: number = 180;
  public survivalSwarmActive: boolean = false;
  public lastResupplyTime: number = 0;
  private hasAnnouncedPhase2: boolean = false;
  private hasAnnouncedPhase3: boolean = false;
  private hasAnnouncedPhase4: boolean = false;

  public bossPhaseStage: 'SURVIVAL_180' | 'BOSS_ORESHNIK' = 'SURVIVAL_180';
  public bossWaveQueue: TargetType[] = [];
  public bossWaveSpawnTimer: number = 0;
  public bossStageAnnouncement: string | null = null;
  public bossStageAnnouncementKey: string | null = null;
  public bossStageAnnouncementTimer: number = 0;

  // Ambient flak
  public distantFlakPuffs: { x: number; y: number; life: number; maxLife: number; color: string }[] = [];

  constructor(mission: Mission | null, sectors: CitySector[], isEndless: boolean = false) {
    this.mission = mission;
    this.isEndless = isEndless;
    this.sectors = sectors.map((s) => ({ ...s, health: 100, underAttack: false }));
    this.totalToSpawn = mission ? mission.totalTargets : 999;
    this.currentWeapon = mission ? mission.unlockedWeapons[0] : 'browning';

    if (mission?.hasBoss) {
      this.survivalTimeRemaining = 180;
      this.survivalSwarmActive = true;
      this.bossPhaseStage = 'SURVIVAL_180';
      this.bossStageAnnouncement = '⏱️ ВИЖИТИ 180 СЕКУНД ПІД РОЄМ ЗАГРОЗ ДО ПОЯВИ ОРЕШНИКА!';
      this.bossStageAnnouncementKey = 'SURVIVAL_START';
      this.bossStageAnnouncementTimer = 6.0;
    }
  }

  public setCrosshair(x: number, y: number) {
    this.crosshairX = x;
    this.crosshairY = y;
  }

  public toggleSearchlight() {
    this.searchlightOn = !this.searchlightOn;
    soundEngine.playSearchlightClick(this.searchlightOn);
  }

  public switchWeapon(type: WeaponType) {
    if (this.mission && !this.mission.unlockedWeapons.includes(type)) return;
    this.currentWeapon = type;
    this.lockedTargetId = null;
    this.lockProgress = 0;
    this.lockState = 'off';
    soundEngine.setLockTone('off');
    soundEngine.playClick();
  }

  public resupplyWeapon(type: WeaponType) {
    const config = WEAPON_CONFIGS[type];
    this.weaponAmmo[type] = config.maxAmmo;
  }

  public reloadAllWeapons() {
    this.weaponAmmo.browning = WEAPON_CONFIGS.browning.maxAmmo;
    this.weaponAmmo.gepard = WEAPON_CONFIGS.gepard.maxAmmo;
    this.weaponAmmo.stinger = WEAPON_CONFIGS.stinger.maxAmmo;
    this.weaponAmmo.patriot = WEAPON_CONFIGS.patriot.maxAmmo;
    soundEngine.playClick();
  }

  public getSurvivalCountdown(): {
    secondsLeft: number;
    totalSeconds: number;
    formattedTime: string;
    progress: number;
    phaseNumber: 1 | 2 | 3 | 4;
    phaseTitle: string;
    hint: string;
  } | null {
    if (!this.mission?.hasBoss || this.bossSpawned) return null;
    const s = Math.max(0, Math.ceil(this.survivalTimeRemaining));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    const progress = Math.min(1, Math.max(0, 1 - this.survivalTimeRemaining / this.SURVIVAL_TOTAL_TIME));

    let phaseNumber: 1 | 2 | 3 | 4 = 1;
    let phaseTitle = 'ФАЗА 1: РІЙ FPV ТА ШАХЕДИ';
    let hint = 'Кулемет 12.7 мм [1] та прожектор [Пробіл]';
    if (this.survivalTimeRemaining <= 30) {
      phaseNumber = 4;
      phaseTitle = 'ФАЗА 4: ФІНАЛЬНИЙ РОЙ БАНДЕРОЛЕЙ ТА РАКЕТ';
      hint = 'Бандеролі, Циркони, балістика! 30 сек до Орешника!';
    } else if (this.survivalTimeRemaining <= 80) {
      phaseNumber = 3;
      phaseTitle = 'ФАЗА 3: ЦИРКОН, БАНДЕРОЛІ ТА БАЛІСТИКА';
      hint = 'Гіперзвуковий Циркон, Іскандер, Бандеролі! Patriot [4] та Gepard [2]';
    } else if (this.survivalTimeRemaining <= 135) {
      phaseNumber = 2;
      phaseTitle = 'ФАЗА 2: ГЕРАНЬ-5 «СИКЕР», ГЕРАНЬ-4 ТА Х-101';
      hint = 'Реактивні Герань-5, Х-101! Gepard 35мм [2] та ПЗРК Stinger [3]';
    }

    return {
      secondsLeft: s,
      totalSeconds: this.SURVIVAL_TOTAL_TIME,
      formattedTime,
      progress,
      phaseNumber,
      phaseTitle,
      hint,
    };
  }

  public getActiveBoss(): TargetThreat | undefined {
    return this.targets.find((t) => t.isBoss && !t.destroyed);
  }

  public getOreshnikSubmunitions(): TargetThreat[] {
    return this.targets.filter((t) => t.isBoss && t.callsign.startsWith('ОРЕШНИК-ББ') && !t.destroyed);
  }

  public update(dt: number, screenWidth: number, screenHeight: number) {
    if (this.missionCompleted || this.missionFailed) return;

    this.missionTimer += dt;

    if (this.bossStageAnnouncementTimer > 0) {
      this.bossStageAnnouncementTimer -= dt;
      if (this.bossStageAnnouncementTimer <= 0) {
        this.bossStageAnnouncement = null;
        this.bossStageAnnouncementKey = null;
      }
    }

    // Cool down guns
    if (this.weaponHeat > 0) {
      this.weaponHeat = Math.max(0, this.weaponHeat - dt * 38);
      if (this.weaponHeat < 20 && this.isOverheated) {
        this.isOverheated = false;
      }
    }

    // Spawning logic
    this.handleSpawning(dt, screenWidth, screenHeight);

    // Audio trackers
    let closestGeranDist = 99999;
    let geranCount = 0;
    let geranPan = 0;
    let closestJetDist = 99999;
    let jetCount = 0;
    let jetPan = 0;
    let fpvCount = 0;

    // Update Targets
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];

      // Update positions
      target.x += target.vx * dt;
      target.y += target.vy * dt;
      target.distance = Math.max(150, target.distance - (target.speed / 3.6) * dt * 0.45);

      // Unique flight dynamics per threat
      if (target.type === 'fpv') {
        fpvCount++;
        // Rapid agile zigzags and height changes
        target.x += Math.sin(this.missionTimer * 8 + i * 2) * 1.8;
        target.y += Math.cos(this.missionTimer * 6 + i) * 1.2;
        target.vy += dt * 15; // gradual descent to ground
      } else if (target.type === 'geran2') {
        geranCount++;
        if (target.distance < closestGeranDist) {
          closestGeranDist = target.distance;
          geranPan = (target.x / screenWidth) * 2 - 1;
        }
        target.y += Math.sin(this.missionTimer * 3 + i) * 0.4;
        if (target.distance < 1200) {
          target.diveMode = true;
          target.vy = Math.min(target.vy + dt * 50, 95);
        }
      } else if (target.type === 'gerbera') {
        target.x += Math.cos(this.missionTimer * 4 + i) * 1.1;
      } else if (target.type === 'geran4_seeker') {
        jetCount++;
        if (target.distance < closestJetDist) {
          closestJetDist = target.distance;
          jetPan = (target.x / screenWidth) * 2 - 1;
        }
        // High speed jet-powered Shahed
        target.y += Math.sin(this.missionTimer * 4.5 + i) * 0.6;
        if (target.distance < 1400) {
          target.vy = Math.min(target.vy + dt * 65, 120);
        }
      } else if (target.type === 'geran5_seeker') {
        jetCount++;
        if (target.distance < closestJetDist) {
          closestJetDist = target.distance;
          jetPan = (target.x / screenWidth) * 2 - 1;
        }
        // Next-gen high speed twin-jet stealth Seeker (Stage 2)
        target.y += Math.sin(this.missionTimer * 5.2 + i) * 0.7;
        if (target.distance < 1500) {
          target.vy = Math.min(target.vy + dt * 75, 135);
        }
      } else if (target.type === 'kh101_kalibr') {
        // Terrain following cruise missile
        target.y += Math.sin(this.missionTimer * 2 + i) * 0.2;
      } else if (target.type === 'kinzhal') {
        // Aeroballistic glide: gentle curved descent from upper side
        target.vy = Math.min(target.vy + dt * 15, 75);
        target.heading = Math.atan2(target.vy, target.vx);
      } else if (target.type === 'iskander') {
        // Quasi-ballistic arc from upper side
        target.vy = Math.min(target.vy + dt * 12, 68);
        target.heading = Math.atan2(target.vy, target.vx);
      } else if (target.type === 'zircon') {
        // Hypersonic scramjet cruise missile 3M22 (Stage 3, Mach 8-9)
        target.y += Math.sin(this.missionTimer * 1.5 + i) * 0.15;
        target.vy = Math.min(target.vy + dt * 10, 52);
        target.heading = Math.atan2(target.vy, target.vx);
      } else if (target.type === 'banderol') {
        fpvCount++;
        // High-speed agile delivery strike drone "Бандероль" (Stage 3-4)
        target.x += Math.sin(this.missionTimer * 6.5 + i * 2.5) * 1.5;
        target.y += Math.cos(this.missionTimer * 5.0 + i) * 1.4;
        if (target.distance < 1100) {
          target.diveMode = true;
          target.vy = Math.min(target.vy + dt * 60, 110);
        }
      } else if (target.type === 'oreshnik_boss') {
        // Boss ORESHNIK: descent from upper side
        target.vy = Math.min(target.vy + dt * 12, 65);
        target.heading = Math.atan2(target.vy, target.vx);

        // Boss Phase 2: MIRV Sub-munitions Split EXACTLY when health <= 50%
        if (target.bossPhase === 1 && target.health <= target.maxHealth * 0.5) {
          target.bossPhase = 2;
          this.splitOreshnikSubmunitions(target, screenWidth);
          // Destroy main booster casing
          target.destroyed = true;
          this.targets.splice(i, 1);
          continue;
        }
      }

      // Check illumination
      if (this.searchlightOn) {
        const dx = target.x - this.searchlightTargetX;
        const dy = target.y - this.searchlightTargetY;
        const distToBeamCenter = Math.sqrt(dx * dx + dy * dy);
        target.illuminated = distToBeamCenter < 130;
      } else {
        target.illuminated = false;
      }

      // Smoke / Trail points
      const maxTrails = target.isBoss ? 20 : target.type === 'kinzhal' || target.type === 'iskander' || target.type === 'zircon' ? 18 : target.type === 'geran5_seeker' ? 12 : 10;
      target.trailPoints.push({ x: target.x, y: target.y, alpha: 0.85 });
      if (target.trailPoints.length > maxTrails) {
        target.trailPoints.shift();
      }
      for (const tp of target.trailPoints) {
        tp.alpha = Math.max(0, tp.alpha - dt * 1.6);
      }

      // Ground horizon impact check
      const horizonY = screenHeight * 0.82;
      if (target.y >= horizonY || target.distance <= 180) {
        this.handleTargetCityImpact(target);
        this.targets.splice(i, 1);
        continue;
      }

      // Offscreen check
      if (target.x < -180 || target.x > screenWidth + 180) {
        this.targets.splice(i, 1);
        continue;
      }
    }

    // Audio updates
    soundEngine.updateShahedAudio(geranCount > 0, geranCount, closestGeranDist, geranPan);
    soundEngine.updateJetAudio(jetCount > 0, jetCount, closestJetDist, jetPan);
    soundEngine.updateFpvAudio(fpvCount > 0, fpvCount);

    // Update Weapon Lock State (Stinger / Patriot)
    this.updateLockOn(dt, screenWidth, screenHeight);

    // Update Projectiles & Hits
    this.updateProjectiles(dt, screenWidth, screenHeight);

    // Update Particle Systems
    this.updateParticles(dt);

    // Ambient Distant Air Defense Flak
    this.updateDistantFlak(dt, screenWidth, screenHeight);

    // Check Victory / Defeat
    this.checkGameConditions();
  }

  private splitOreshnikSubmunitions(boss: TargetThreat, screenWidth: number) {
    soundEngine.playHypersonicBoom();
    soundEngine.setSiren(true);
    setTimeout(() => soundEngine.setSiren(false), 4500);

    // Spawn exactly 6 sub-munitions (боєприпаси MIRV) continuing diagonally across the sky
    const offsets = [-80, -48, -16, 16, 48, 80];
    offsets.forEach((off, idx) => {
      const vx = boss.vx + off * 0.45;
      const vy = boss.vy + Math.abs(off) * 0.15 + (Math.random() * 8 - 4);
      const heading = Math.atan2(vy, vx);
      const submunition: TargetThreat = {
        id: `oreshnik-sub-${idx}-${Date.now()}`,
        type: 'kinzhal',
        name: `Суббоєприпас Орешника #${idx + 1}`,
        callsign: `ОРЕШНИК-ББ${idx + 1}`,
        x: Math.max(30, Math.min(screenWidth - 30, boss.x + off * 0.35)),
        y: boss.y + (idx * 3 - 8),
        distance: boss.distance - 70,
        altitude: boss.altitude - 70,
        speed: 2500,
        vx,
        vy,
        heading,
        health: 160,
        maxHealth: 160,
        size: 1.15,
        illuminated: false,
        destroyed: false,
        impacted: false,
        isBoss: true,
        trailPoints: [],
        threatLevel: 'boss',
      };
      this.targets.push(submunition);
    });

    // Massive staging separation flash & plasma explosion
    for (let s = 0; s < 45; s++) {
      this.particles.push({
        x: boss.x,
        y: boss.y,
        vx: (Math.random() - 0.5) * 260,
        vy: (Math.random() - 0.5) * 260,
        size: 7,
        color: Math.random() > 0.4 ? '#f97316' : '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 1.8,
        type: 'plasma',
      });
    }

    // Expanding shockwave ring
    this.particles.push({
      x: boss.x,
      y: boss.y,
      vx: 0,
      vy: 0,
      size: 40,
      color: '#ffffff',
      alpha: 1,
      life: 0,
      maxLife: 0.8,
      type: 'shockwave',
    });
  }

  private handleSpawning(dt: number, screenWidth: number, screenHeight: number) {
    // 1. If boss staged wave queue is active, spawn queued targets
    if (this.bossWaveQueue.length > 0) {
      this.bossWaveSpawnTimer -= dt;
      if (this.bossWaveSpawnTimer <= 0) {
        const nextType = this.bossWaveQueue.shift()!;
        this.spawnTargetOfType(nextType, screenWidth, screenHeight);
        this.bossWaveSpawnTimer = nextType === 'fpv' ? 0.65 : nextType === 'geran4_seeker' ? 1.4 : 2.0;
      }
      return;
    }

    // 2. Boss Mission: 180-second survival phase under non-stop swarm, then ORESHNIK BOSS!
    if (this.mission?.hasBoss) {
      if (!this.bossSpawned) {
        this.survivalTimeRemaining = Math.max(0, this.survivalTimeRemaining - dt);

        // Survival elapsed: 180 seconds held! Trigger Oreshnik Boss!
        if (this.survivalTimeRemaining <= 0) {
          this.bossPhaseStage = 'BOSS_ORESHNIK';
          this.bossStageAnnouncement = '🚨 180 СЕК ВИТРИМАНО! ФІНАЛЬНИЙ БОС: БРСД «ОРЕШНИК» У ПОВІТРІ! 🚨';
          this.bossStageAnnouncementKey = 'BOSS_ORESHNIK';
          this.bossStageAnnouncementTimer = 6.0;
          this.weaponAmmo.patriot = 8;
          this.weaponAmmo.gepard = 160;
          this.weaponAmmo.stinger = 8;
          this.spawnOreshnikBoss(screenWidth);
          this.bossSpawned = true;
          return;
        }

        // Tactical Phase Radio Announcements
        if (!this.hasAnnouncedPhase2 && this.survivalTimeRemaining <= 135) {
          this.hasAnnouncedPhase2 = true;
          this.bossStageAnnouncement = '⚠️ ФАЗА 2: ГЕРАНЬ-5 «СИКЕР», ГЕРАНЬ-4 ТА КРИЛАТІ Х-101 У НЕБІ!';
          this.bossStageAnnouncementKey = 'PHASE_2';
          this.bossStageAnnouncementTimer = 4.5;
          soundEngine.playRadioBeep();
        }
        if (!this.hasAnnouncedPhase3 && this.survivalTimeRemaining <= 80) {
          this.hasAnnouncedPhase3 = true;
          this.bossStageAnnouncement = '🚨 ФАЗА 3: ЦИРКОН, БАНДЕРОЛІ ТА БАЛІСТИКА! PATRIOT ДО БОЮ!';
          this.bossStageAnnouncementKey = 'PHASE_3';
          this.bossStageAnnouncementTimer = 5.0;
          soundEngine.playRadioBeep();
          soundEngine.setSiren(true);
          setTimeout(() => soundEngine.setSiren(false), 2500);
        }
        if (!this.hasAnnouncedPhase4 && this.survivalTimeRemaining <= 30) {
          this.hasAnnouncedPhase4 = true;
          this.bossStageAnnouncement = '⚡ ФАЗА 4: ФІНАЛЬНИЙ РОЙ БАНДЕРОЛЕЙ ТА РАКЕТ! 30 СЕК ДО ОРЕШНИКА!';
          this.bossStageAnnouncementKey = 'PHASE_4';
          this.bossStageAnnouncementTimer = 4.5;
          soundEngine.playRadioBeep();
        }

        // Periodic Ammo Air-Drops every 40s so defense never runs out of ammo
        if (this.missionTimer - this.lastResupplyTime >= 40) {
          this.lastResupplyTime = this.missionTimer;
          this.weaponAmmo.gepard = 160;
          this.weaponAmmo.patriot = Math.min(8, this.weaponAmmo.patriot + 4);
          this.weaponAmmo.stinger = Math.min(8, this.weaponAmmo.stinger + 4);
          this.bossStageAnnouncement = '📦 ПІДВЕЗЕННЯ БОЄКОМПЛЕКТУ: PATRIOT ТА GEPARD ПОПОВНЕНО!';
          this.bossStageAnnouncementKey = 'AIRDROP';
          this.bossStageAnnouncementTimer = 3.5;
          soundEngine.playRadioBeep();
        }

        // Continuous swarm spawning: FPV, Gerbera, Shahed, Geran-4, Geran-5, Kh-101, Zircon, Banderol, Iskander, Kinzhal
        this.nextSpawnTimer -= dt;
        if (this.nextSpawnTimer <= 0) {
          if (this.targets.length < 9) {
            let pool: TargetType[] = [];
            if (this.survivalTimeRemaining > 135) {
              // 0-45s (Phase 1): Heavy drone swarm (FPVs, Gerberas, Shahed Geran-2)
              pool = ['fpv', 'fpv', 'gerbera', 'geran2', 'fpv', 'gerbera', 'geran2'];
            } else if (this.survivalTimeRemaining > 80) {
              // 45-100s (Phase 2): Geran-5 Seeker, Geran-4, Kh-101 join
              pool = ['fpv', 'geran2', 'geran4_seeker', 'geran5_seeker', 'kh101_kalibr', 'geran5_seeker', 'gerbera'];
            } else if (this.survivalTimeRemaining > 30) {
              // 100-150s (Phase 3): Hypersonic Zircon, Banderol, Iskander, Kinzhal join
              pool = ['banderol', 'zircon', 'iskander', 'kinzhal', 'geran5_seeker', 'banderol', 'kh101_kalibr'];
            } else {
              // 150-180s (Phase 4): Full combined swarm assault with Banderol rush
              pool = ['banderol', 'banderol', 'zircon', 'iskander', 'kinzhal', 'geran5_seeker', 'kh101_kalibr', 'geran4_seeker'];
            }

            const chosen = pool[Math.floor(Math.random() * pool.length)];
            this.spawnTargetOfType(chosen, screenWidth, screenHeight);
            this.spawnedCount++;
          }
          this.nextSpawnTimer = 1.05 + Math.random() * 0.85;
        }
        return;
      }
      return;
    }

    // 3. Regular mission / Endless spawning
    this.nextSpawnTimer -= dt;
    if (this.nextSpawnTimer <= 0) {
      if (this.isEndless || this.spawnedCount < this.totalToSpawn) {
        this.spawnTarget(screenWidth, screenHeight);
        this.spawnedCount++;

        const baseInterval = this.isEndless
          ? Math.max(1.8, 6.0 - this.missionTimer * 0.035)
          : this.mission
          ? Math.max(2.5, (this.mission.durationSeconds / (this.mission.totalTargets + 1)) * 0.8)
          : 3.5;
        this.nextSpawnTimer = baseInterval * (0.8 + Math.random() * 0.4);
      }
    }
  }

  private spawnOreshnikBoss(screenWidth: number) {
    soundEngine.playHypersonicBoom();
    soundEngine.setSiren(true);
    setTimeout(() => soundEngine.setSiren(false), 5000);

    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side === 1 ? -90 : screenWidth + 90;
    const y = 45 + Math.random() * 45;
    const vx = side === 1 ? 95 : -95;
    const vy = 36;
    const heading = Math.atan2(vy, vx);

    const boss: TargetThreat = {
      id: `threat-oreshnik-boss-${Date.now()}`,
      type: 'oreshnik_boss',
      name: 'БРСД «ОРЕШНИК» (ФІНАЛЬНИЙ БОС)',
      callsign: 'ОРЕШНИК-ГОЛОВНИЙ',
      x,
      y,
      distance: 6500,
      altitude: 7000,
      speed: 1600,
      vx,
      vy,
      heading,
      health: 500,
      maxHealth: 500,
      size: 2.2,
      illuminated: false,
      destroyed: false,
      impacted: false,
      isBoss: true,
      bossPhase: 1,
      trailPoints: [],
      threatLevel: 'boss',
    };
    this.targets.push(boss);
  }

  public spawnTargetOfType(type: TargetType, screenWidth: number, screenHeight: number): TargetThreat {
    const side = Math.random() > 0.5 ? 1 : -1;
    let x = side === 1 ? -60 : screenWidth + 60;
    let y = 80 + Math.random() * (screenHeight * 0.42);
    let speed = 185;
    let vx = side === 1 ? 55 + Math.random() * 25 : -(55 + Math.random() * 25);
    let vy = 4 + Math.random() * 8;
    let distance = 3500 + Math.random() * 1200;
    let altitude = 450;
    let maxHealth = 70;
    let name = 'Герань-2 (Shahed-136)';
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' | 'boss' = 'high';
    let size = 1.0;

    if (type === 'fpv') {
      name = 'FPV-дрон (Мінімальна загроза)';
      speed = 150;
      maxHealth = 24;
      threatLevel = 'low';
      size = 0.65;
      distance = 2200;
      altitude = 120;
      vx = side === 1 ? 85 : -85;
      vy = 8;
    } else if (type === 'gerbera') {
      name = 'Гербера (Дрон-обманка)';
      speed = 175;
      maxHealth = 30;
      threatLevel = 'low';
      size = 0.85;
      vx *= 1.15;
    } else if (type === 'geran4_seeker') {
      name = 'Герань-4 «Сикер» (Реактивний БПЛА)';
      speed = 380;
      maxHealth = 110;
      threatLevel = 'high';
      size = 1.1;
      altitude = 550;
      vx = (side === 1 ? 110 : -110) + Math.random() * 20;
    } else if (type === 'kh101_kalibr') {
      name = 'Х-101 / Калібр (Крилата ракета)';
      speed = 840;
      vx = side === 1 ? 175 : -175;
      vy = 2;
      altitude = 220;
      maxHealth = 140;
      threatLevel = 'critical';
      size = 1.2;
      distance = 4200;
    } else if (type === 'kinzhal') {
      name = 'Х-47М2 Кинджал (БАЛІСТИКА)';
      speed = 1500;
      x = side === 1 ? -70 : screenWidth + 70;
      y = 50 + Math.random() * 50;
      vx = side === 1 ? 110 + Math.random() * 15 : -(110 + Math.random() * 15);
      vy = 40 + Math.random() * 10;
      altitude = 5500;
      maxHealth = 350;
      threatLevel = 'critical';
      size = 1.5;
      distance = 5500;
      soundEngine.playRadioBeep();
    } else if (type === 'iskander') {
      name = 'Іскандер-М (БАЛІСТИКА)';
      speed = 1350;
      x = side === 1 ? -70 : screenWidth + 70;
      y = 60 + Math.random() * 50;
      vx = side === 1 ? 100 + Math.random() * 15 : -(100 + Math.random() * 15);
      vy = 36 + Math.random() * 10;
      altitude = 5200;
      maxHealth = 375;
      threatLevel = 'critical';
      size = 1.6;
      distance = 5800;
      soundEngine.playRadioBeep();
    } else if (type === 'geran5_seeker') {
      name = 'Герань-5 «Сикер» (Дводвигунний БПЛА)';
      speed = 460;
      maxHealth = 130;
      threatLevel = 'high';
      size = 1.15;
      altitude = 520;
      vx = (side === 1 ? 125 : -125) + Math.random() * 20;
      vy = 5;
    } else if (type === 'zircon') {
      name = '3М22 «Циркон» (ГІПЕРЗВУКОВИЙ Mach 8)';
      speed = 2600;
      x = side === 1 ? -80 : screenWidth + 80;
      y = 45 + Math.random() * 35;
      vx = side === 1 ? 180 + Math.random() * 20 : -(180 + Math.random() * 20);
      vy = 24 + Math.random() * 8;
      altitude = 4200;
      maxHealth = 350;
      threatLevel = 'critical';
      size = 1.45;
      distance = 5400;
      soundEngine.playRadioBeep();
    } else if (type === 'banderol') {
      name = '«Бандероль» (Швидкісний дрон-камікадзе)';
      speed = 260;
      maxHealth = 65;
      threatLevel = 'medium';
      size = 0.95;
      altitude = 360;
      distance = 3200;
      vx = (side === 1 ? 75 : -75) + Math.random() * 15;
      vy = 7;
    }

    const newTarget: TargetThreat = {
      id: `threat-${Date.now()}-${Math.random()}`,
      type,
      name,
      callsign: `ЦІЛЬ-${Math.floor(100 + Math.random() * 900)}`,
      x,
      y,
      distance,
      altitude,
      speed,
      vx,
      vy,
      heading: Math.atan2(vy, vx),
      health: maxHealth,
      maxHealth,
      size,
      illuminated: false,
      destroyed: false,
      impacted: false,
      trailPoints: [],
      threatLevel,
    };

    this.targets.push(newTarget);
    return newTarget;
  }

  private spawnTarget(screenWidth: number, screenHeight: number) {
    const availableTypes: TargetType[] = this.mission
      ? this.mission.targetTypes.filter((t) => t !== 'oreshnik_boss')
      : ['fpv', 'geran2', 'gerbera', 'geran4_seeker', 'geran5_seeker', 'banderol', 'kh101_kalibr', 'zircon', 'kinzhal', 'iskander'];

    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    return this.spawnTargetOfType(type, screenWidth, screenHeight);
  }

  private updateLockOn(dt: number, screenWidth: number, screenHeight: number) {
    const config = WEAPON_CONFIGS[this.currentWeapon];
    if (!config.lockRequired) {
      if (this.lockState !== 'off') {
        this.lockState = 'off';
        this.lockedTargetId = null;
        this.lockProgress = 0;
        soundEngine.setLockTone('off');
      }
      return;
    }

    const lockRadius = 90;
    let candidate: TargetThreat | null = null;
    let closestDist = lockRadius;

    for (const t of this.targets) {
      if (!config.effectiveAgainst.includes(t.type) && !t.isBoss) continue;

      const dx = t.x - this.crosshairX;
      const dy = t.y - this.crosshairY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < closestDist) {
        closestDist = dist;
        candidate = t;
      }
    }

    if (candidate) {
      if (this.lockedTargetId === candidate.id) {
        const lockRate = this.currentWeapon === 'stinger' ? 1.2 : 0.9;
        this.lockProgress = Math.min(1.0, this.lockProgress + dt * lockRate);
        if (this.lockProgress >= 1.0) {
          if (this.lockState !== 'locked') {
            this.lockState = 'locked';
            soundEngine.setLockTone('locked');
          }
        } else {
          if (this.lockState !== 'acquiring') {
            this.lockState = 'acquiring';
            soundEngine.setLockTone('acquiring');
          }
        }
      } else {
        this.lockedTargetId = candidate.id;
        this.lockProgress = 0.15;
        this.lockState = 'acquiring';
        soundEngine.setLockTone('acquiring');
      }
    } else {
      this.lockedTargetId = null;
      this.lockProgress = Math.max(0, this.lockProgress - dt * 2.5);
      if (this.lockProgress === 0 && this.lockState !== 'off') {
        this.lockState = 'off';
        soundEngine.setLockTone('off');
      }
    }
  }

  public fireCurrentWeapon(targetX: number, targetY: number, screenWidth: number, screenHeight: number): boolean {
    const config = WEAPON_CONFIGS[this.currentWeapon];

    if (this.isOverheated) return false;
    if (!config.infiniteAmmo && this.weaponAmmo[this.currentWeapon] <= 0) return false;
    if (config.lockRequired && this.lockState !== 'locked') return false;

    if (!config.infiniteAmmo) {
      this.weaponAmmo[this.currentWeapon]--;
    }
    this.weaponHeat = Math.min(100, this.weaponHeat + config.heatPerShot);
    if (this.weaponHeat >= 100) {
      this.isOverheated = true;
    }

    this.stats.shotsFired++;

    const startX = screenWidth * 0.5;
    const startY = screenHeight * 0.95;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = config.projectileSpeed;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    if (this.currentWeapon === 'browning') {
      soundEngine.playBrowningShot();
      this.projectiles.push({
        id: `proj-${Date.now()}-${Math.random()}`,
        startX,
        startY,
        x: startX + (Math.random() * 8 - 4),
        y: startY,
        vx: vx + (Math.random() * 20 - 10),
        vy: vy + (Math.random() * 20 - 10),
        weapon: 'browning',
        life: 0,
        maxLife: 1.6,
        color: '#fef08a',
      });
    } else if (this.currentWeapon === 'gepard') {
      soundEngine.playGepardBurst();
      this.stats.flakExpended += 2;
      [-12, 12].forEach((offset) => {
        this.projectiles.push({
          id: `proj-${Date.now()}-${Math.random()}`,
          startX: startX + offset,
          startY,
          x: startX + offset,
          y: startY,
          vx: vx + (Math.random() * 15 - 7.5),
          vy: vy + (Math.random() * 15 - 7.5),
          weapon: 'gepard',
          life: 0,
          maxLife: 1.4,
          color: '#fbbf24',
          isFlak: true,
        });
      });
    } else if (this.currentWeapon === 'stinger') {
      soundEngine.playMissileLaunch('stinger');
      this.stats.missilesExpended++;
      this.projectiles.push({
        id: `proj-${Date.now()}-${Math.random()}`,
        startX,
        startY,
        x: startX,
        y: startY,
        vx: vx * 0.6,
        vy: vy * 0.6,
        weapon: 'stinger',
        life: 0,
        maxLife: 3.2,
        color: '#f97316',
        targetId: this.lockedTargetId || undefined,
      });
      this.lockProgress = 0;
      this.lockState = 'off';
      soundEngine.setLockTone('off');
    } else if (this.currentWeapon === 'patriot') {
      soundEngine.playMissileLaunch('patriot');
      this.stats.missilesExpended++;
      this.projectiles.push({
        id: `proj-${Date.now()}-${Math.random()}`,
        startX,
        startY,
        x: startX,
        y: startY,
        vx: vx * 0.7,
        vy: vy * 0.7,
        weapon: 'patriot',
        life: 0,
        maxLife: 3.5,
        color: '#38bdf8',
        targetId: this.lockedTargetId || undefined,
      });
      this.lockProgress = 0;
      this.lockState = 'off';
      soundEngine.setLockTone('off');
    }

    return true;
  }

  private updateProjectiles(dt: number, screenWidth: number, screenHeight: number) {
    for (let pIdx = this.projectiles.length - 1; pIdx >= 0; pIdx--) {
      const p = this.projectiles[pIdx];
      p.life += dt;

      if (p.targetId) {
        const target = this.targets.find((t) => t.id === p.targetId);
        if (target) {
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          const targetHeading = Math.atan2(dy, dx);
          const currentHeading = Math.atan2(p.vy, p.vx);
          const angleDiff = targetHeading - currentHeading;
          const turnRate = p.weapon === 'patriot' ? 8.5 : 6.2;

          const newHeading = currentHeading + Math.max(-turnRate * dt, Math.min(turnRate * dt, angleDiff));
          const curSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) + dt * 650;
          p.vx = Math.cos(newHeading) * curSpeed;
          p.vy = Math.sin(newHeading) * curSpeed;

          this.particles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: p.weapon === 'patriot' ? 5.5 : 3.5,
            color: p.weapon === 'patriot' ? '#94a3b8' : '#cbd5e1',
            alpha: 0.7,
            life: 0,
            maxLife: 0.8,
            type: 'smoke',
          });
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.weapon === 'browning' || p.weapon === 'gepard') {
        p.vy += dt * 42;
      }

      let hitOccurred = false;
      const config = WEAPON_CONFIGS[p.weapon];

      for (let tIdx = this.targets.length - 1; tIdx >= 0; tIdx--) {
        const target = this.targets[tIdx];
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const hitThreshold = config.splashRadius > 0 ? config.splashRadius : (target.isBoss ? 45 : 22 * target.size);

        if (dist <= hitThreshold) {
          hitOccurred = true;
          this.stats.shotsHit++;
          target.health -= config.damage;

          for (let s = 0; s < 8; s++) {
            this.particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120,
              size: 2.5,
              color: '#fef08a',
              alpha: 1,
              life: 0,
              maxLife: 0.35,
              type: 'spark',
            });
          }

          if (p.isFlak || p.weapon === 'gepard') {
            soundEngine.playExplosion('small');
          }

          if (target.health <= 0) {
            this.destroyTarget(target, tIdx);
          }
          break;
        }
      }

      if (hitOccurred || p.life >= p.maxLife || p.y < -100 || p.y > screenHeight + 50) {
        this.projectiles.splice(pIdx, 1);
      }
    }
  }

  private destroyTarget(target: TargetThreat, index: number) {
    target.destroyed = true;
    this.targets.splice(index, 1);

    if (target.isBoss) {
      const remainingBossTargets = this.targets.filter((t) => t.isBoss && !t.destroyed);
      if (remainingBossTargets.length === 0) {
        this.stats.bossDefeated = true;
      }
    }

    const scoreMap: Record<TargetType, number> = {
      fpv: 100,
      gerbera: 150,
      geran2: 350,
      geran4_seeker: 500,
      geran5_seeker: 650,
      banderol: 400,
      kh101_kalibr: 900,
      zircon: 2400,
      iskander: 2200,
      kinzhal: 2800,
      oreshnik_boss: 10000,
    };
    const earned = scoreMap[target.type] || 300;
    this.stats.score += earned;
    this.stats.targetsDestroyed[target.type]++;
    this.stats.currentStreak++;
    if (this.stats.currentStreak > this.stats.highestStreak) {
      this.stats.highestStreak = this.stats.currentStreak;
    }

    const intensity = target.isBoss ? 'huge' : target.type === 'kinzhal' || target.type === 'iskander' || target.type === 'zircon' ? 'huge' : 'medium';
    soundEngine.playExplosion(intensity);

    const particleCount = target.isBoss ? 60 : target.type === 'kinzhal' || target.type === 'iskander' || target.type === 'zircon' ? 45 : 25;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 200;
      this.particles.push({
        x: target.x,
        y: target.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 30,
        size: 3 + Math.random() * 8,
        color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
        alpha: 1,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.9,
        type: 'flare',
      });
    }

    // Shockwave
    this.particles.push({
      x: target.x,
      y: target.y,
      vx: 0,
      vy: 0,
      size: target.isBoss ? 35 : 15,
      color: '#ffffff',
      alpha: 0.95,
      life: 0,
      maxLife: 0.6,
      type: 'shockwave',
    });
  }

  private handleTargetCityImpact(target: TargetThreat) {
    target.impacted = true;
    soundEngine.playExplosion('huge');

    const sectorDamage =
      target.type === 'oreshnik_boss'
        ? 80
        : target.type === 'kinzhal' || target.type === 'iskander'
        ? 45
        : target.type === 'kh101_kalibr'
        ? 35
        : target.type === 'geran4_seeker'
        ? 28
        : target.type === 'geran2'
        ? 22
        : target.type === 'gerbera'
        ? 6
        : 12; // fpv

    const aliveSectors = this.sectors.filter((s) => s.health > 0);
    if (aliveSectors.length > 0) {
      const chosen = aliveSectors[Math.floor(Math.random() * aliveSectors.length)];
      chosen.health = Math.max(0, chosen.health - sectorDamage);
      chosen.underAttack = true;
      setTimeout(() => {
        chosen.underAttack = false;
      }, 2500);
    }

    this.stats.cityDamageTaken += sectorDamage;
    this.stats.currentStreak = 0;

    if (target.isBoss) {
      const remainingBossTargets = this.targets.filter((t) => t.isBoss && !t.destroyed && t.id !== target.id);
      if (remainingBossTargets.length === 0) {
        this.stats.bossDefeated = true;
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.type === 'debris') {
        p.vy += dt * 80;
      }

      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.type === 'shockwave') {
        p.size += dt * 280;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateDistantFlak(dt: number, screenWidth: number, screenHeight: number) {
    if (Math.random() < 0.08) {
      this.distantFlakPuffs.push({
        x: Math.random() * screenWidth,
        y: screenHeight * 0.25 + Math.random() * (screenHeight * 0.35),
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
        color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
      });
    }

    for (let i = this.distantFlakPuffs.length - 1; i >= 0; i--) {
      const puff = this.distantFlakPuffs[i];
      puff.life += dt;
      if (puff.life >= puff.maxLife) {
        this.distantFlakPuffs.splice(i, 1);
      }
    }
  }

  private checkGameConditions() {
    const totalHealth = this.sectors.reduce((acc, s) => acc + s.health, 0);
    if (totalHealth <= 0) {
      this.missionFailed = true;
      return;
    }

    if (this.mission && !this.isEndless) {
      if (this.mission.hasBoss) {
        if (this.bossSpawned && this.targets.length === 0 && this.bossWaveQueue.length === 0) {
          this.stats.bossDefeated = true;
          this.missionCompleted = true;
        }
      } else {
        if (this.spawnedCount >= this.totalToSpawn && this.targets.length === 0) {
          this.missionCompleted = true;
        }
      }
    }
  }

  public getLeadPoint(target: TargetThreat, weapon: WeaponType, screenWidth: number, screenHeight: number): { x: number; y: number } | null {
    const config = WEAPON_CONFIGS[weapon];
    const muzzleSpeed = config.projectileSpeed;
    const playerX = screenWidth * 0.5;
    const playerY = screenHeight * 0.95;

    const dx = target.x - playerX;
    const dy = target.y - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const timeToTarget = dist / muzzleSpeed;

    return {
      x: target.x + target.vx * timeToTarget,
      y: target.y + target.vy * timeToTarget + (weapon === 'browning' ? 12 : 0),
    };
  }
}
