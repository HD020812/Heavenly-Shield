/**
 * Real-time procedural audio engine using Web Audio API
 * Generates all air defense sounds: FPV drones, Geran-2, Geran-4/5 jet turbines, missiles, Oreshnik hypersonic booms
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.85;

  // Keep-alive silent carrier to prevent browser from suspending audio context
  private keepAliveOsc: OscillatorNode | null = null;
  private keepAliveGain: GainNode | null = null;

  // Continuous sound sources: Shahed / Geran-2 moped piston buzz
  private shahedOsc1: OscillatorNode | null = null;
  private shahedOsc2: OscillatorNode | null = null;
  private shahedGain: GainNode | null = null;
  private shahedPanner: StereoPannerNode | null = null;
  private shahedFilter: BiquadFilterNode | null = null;

  // Jet turbine whine & roar: Geran-4 & Geran-5 Seeker
  private jetOsc1: OscillatorNode | null = null;
  private jetOsc2: OscillatorNode | null = null;
  private jetGain: GainNode | null = null;
  private jetPanner: StereoPannerNode | null = null;
  private jetFilter: BiquadFilterNode | null = null;

  // FPV drone whine
  private fpvOsc: OscillatorNode | null = null;
  private fpvGain: GainNode | null = null;

  // Missile lock tone
  private lockOsc: OscillatorNode | null = null;
  private lockGain: GainNode | null = null;

  // Air defense siren
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenInterval: number | null = null;

  constructor() {}

  /**
   * Initializes and unlocks AudioContext with keep-alive carrier
   */
  public async unlockAudio(): Promise<boolean> {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return false;

        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.startKeepAlive();
      return true;
    } catch (e) {
      console.warn('Audio unlock warning:', e);
      return false;
    }
  }

  public ensureContext(): boolean {
    if (!this.ctx) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return false;

        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch {
        return false;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.startKeepAlive();
    return true;
  }

  private startKeepAlive() {
    if (!this.ctx || !this.masterGain || this.keepAliveOsc) return;
    try {
      this.keepAliveOsc = this.ctx.createOscillator();
      this.keepAliveGain = this.ctx.createGain();
      // Completely inaudible keep-alive signal (gain 0.00002 at 20Hz)
      this.keepAliveGain.gain.setValueAtTime(0.00002, this.ctx.currentTime);
      this.keepAliveOsc.frequency.setValueAtTime(20, this.ctx.currentTime);
      this.keepAliveOsc.connect(this.keepAliveGain);
      this.keepAliveGain.connect(this.ctx.destination);
      this.keepAliveOsc.start();
    } catch {
      // ignore
    }
  }

  public init() {
    this.ensureContext();
  }

  public resume() {
    this.unlockAudio().catch(() => {});
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch {
        this.masterGain.gain.value = this.volume;
      }
    }
  }

  public setMuted(muted: boolean): boolean {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      try {
        this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      } catch {
        this.masterGain.gain.value = targetGain;
      }
    }
    return this.isMuted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.isMuted);
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getContextState(): string {
    return this.ctx ? this.ctx.state : 'uninitialized';
  }

  /**
   * Plays a loud, pleasant tactical test chime to verify speakers and audio pipeline
   */
  public async playTestChime(): Promise<boolean> {
    const ok = await this.unlockAudio();
    if (!ok || !this.ctx || !this.masterGain) return false;

    this.setMuted(false);
    if (this.volume < 0.2) {
      this.setVolume(0.85);
    }

    try {
      const now = this.ctx.currentTime;
      // 4-tone ascending tactical chime: C5, E5, G5, C6
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const tStart = now + idx * 0.08;
        const tEnd = tStart + 0.28;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, tStart);

        gain.gain.setValueAtTime(0.55, tStart);
        gain.gain.linearRampToValueAtTime(0, tEnd);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(tStart);
        osc.stop(tEnd + 0.05);
      });
      return true;
    } catch {
      return false;
    }
  }

  // --- Shahed / Geran-2 Two-Stroke Moped Hum ---
  public updateShahedAudio(active: boolean, count: number = 1, minDistance: number = 2000, pan: number = 0) {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    if (!active || count === 0) {
      if (this.shahedGain) {
        try {
          this.shahedGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
        } catch {
          this.shahedGain.gain.value = 0;
        }
      }
      return;
    }

    if (!this.shahedOsc1) {
      try {
        this.shahedOsc1 = this.ctx.createOscillator();
        this.shahedOsc2 = this.ctx.createOscillator();
        this.shahedFilter = this.ctx.createBiquadFilter();
        this.shahedGain = this.ctx.createGain();

        this.shahedOsc1.type = 'sawtooth';
        this.shahedOsc2.type = 'square';
        this.shahedOsc1.frequency.value = 52;
        this.shahedOsc2.frequency.value = 104;

        this.shahedFilter.type = 'lowpass';
        this.shahedFilter.frequency.value = 480;
        this.shahedFilter.Q.value = 3.2;

        this.shahedGain.gain.value = 0;

        this.shahedOsc1.connect(this.shahedFilter);
        this.shahedOsc2.connect(this.shahedFilter);
        this.shahedFilter.connect(this.shahedGain);

        if (this.ctx.createStereoPanner) {
          try {
            this.shahedPanner = this.ctx.createStereoPanner();
            this.shahedGain.connect(this.shahedPanner);
            this.shahedPanner.connect(this.masterGain);
          } catch {
            this.shahedGain.connect(this.masterGain);
          }
        } else {
          this.shahedGain.connect(this.masterGain);
        }

        this.shahedOsc1.start();
        this.shahedOsc2.start();
      } catch {
        return;
      }
    }

    if (this.shahedGain && this.shahedOsc1 && this.shahedOsc2) {
      try {
        const now = this.ctx.currentTime;
        const proximityFactor = Math.max(0.15, 1 - minDistance / 4800);
        const targetGain = Math.min(0.42, (0.08 + count * 0.05) * proximityFactor);
        this.shahedGain.gain.setTargetAtTime(targetGain, now, 0.1);

        const baseFreq = 52 + Math.sin(now * 3.5) * 3;
        this.shahedOsc1.frequency.setTargetAtTime(baseFreq, now, 0.1);
        this.shahedOsc2.frequency.setTargetAtTime(baseFreq * 2.03, now, 0.1);

        if (this.shahedPanner) {
          this.shahedPanner.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), now, 0.1);
        }
      } catch {
        // audio param fallback
      }
    }
  }

  // --- Geran-4 & Geran-5 Jet Turbine Whine & Roar ---
  public updateJetAudio(active: boolean, count: number = 1, minDistance: number = 2000, pan: number = 0) {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    if (!active || count === 0) {
      if (this.jetGain) {
        try {
          this.jetGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
        } catch {
          this.jetGain.gain.value = 0;
        }
      }
      return;
    }

    if (!this.jetOsc1) {
      try {
        this.jetOsc1 = this.ctx.createOscillator();
        this.jetOsc2 = this.ctx.createOscillator();
        this.jetFilter = this.ctx.createBiquadFilter();
        this.jetGain = this.ctx.createGain();

        this.jetOsc1.type = 'sawtooth';
        this.jetOsc2.type = 'triangle';
        this.jetOsc1.frequency.value = 160;
        this.jetOsc2.frequency.value = 480;

        this.jetFilter.type = 'bandpass';
        this.jetFilter.frequency.value = 600;
        this.jetFilter.Q.value = 1.8;

        this.jetGain.gain.value = 0;

        this.jetOsc1.connect(this.jetFilter);
        this.jetOsc2.connect(this.jetFilter);
        this.jetFilter.connect(this.jetGain);

        if (this.ctx.createStereoPanner) {
          try {
            this.jetPanner = this.ctx.createStereoPanner();
            this.jetGain.connect(this.jetPanner);
            this.jetPanner.connect(this.masterGain);
          } catch {
            this.jetGain.connect(this.masterGain);
          }
        } else {
          this.jetGain.connect(this.masterGain);
        }

        this.jetOsc1.start();
        this.jetOsc2.start();
      } catch {
        return;
      }
    }

    if (this.jetGain && this.jetOsc1 && this.jetOsc2) {
      try {
        const now = this.ctx.currentTime;
        const proximityFactor = Math.max(0.15, 1 - minDistance / 4800);
        const targetGain = Math.min(0.35, (0.07 + count * 0.04) * proximityFactor);
        this.jetGain.gain.setTargetAtTime(targetGain, now, 0.1);

        const mod = Math.sin(now * 5) * 15;
        this.jetOsc1.frequency.setTargetAtTime(160 + mod, now, 0.08);
        this.jetOsc2.frequency.setTargetAtTime(480 + mod * 2, now, 0.08);

        if (this.jetPanner) {
          this.jetPanner.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), now, 0.1);
        }
      } catch {
        // audio param fallback
      }
    }
  }

  // --- FPV Drone & Banderol Whine ---
  public updateFpvAudio(hasFpv: boolean, count: number = 0) {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    if (!hasFpv || count === 0) {
      if (this.fpvGain) {
        try {
          this.fpvGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
        } catch {
          this.fpvGain.gain.value = 0;
        }
      }
      return;
    }

    if (!this.fpvOsc) {
      try {
        this.fpvOsc = this.ctx.createOscillator();
        this.fpvGain = this.ctx.createGain();
        this.fpvOsc.type = 'sawtooth';
        this.fpvOsc.frequency.value = 380;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 450;
        filter.Q.value = 2.5;

        this.fpvOsc.connect(filter);
        filter.connect(this.fpvGain);
        this.fpvGain.connect(this.masterGain);
        this.fpvOsc.start();
      } catch {
        return;
      }
    }

    if (this.fpvGain && this.fpvOsc) {
      try {
        const now = this.ctx.currentTime;
        this.fpvGain.gain.setTargetAtTime(Math.min(0.24, 0.06 + count * 0.04), now, 0.1);
        this.fpvOsc.frequency.setTargetAtTime(380 + Math.sin(now * 12) * 50, now, 0.05);
      } catch {
        // audio param fallback
      }
    }
  }

  // --- Gunfire: Browning / DShK Heavy Machine Gun ---
  public playBrowningShot() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.12);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.15);

      this.playNoiseBurst(0.08, 0.45, 1400);
    } catch {
      // safe fallback
    }
  }

  // --- Gepard 35mm Autocannon ---
  public playGepardBurst() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      gain.gain.setValueAtTime(0.85, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.22);

      this.playNoiseBurst(0.12, 0.55, 1800);
    } catch {
      // safe fallback
    }
  }

  // --- Stinger / Igla Seeker Lock Tone ---
  public setLockTone(status: 'off' | 'acquiring' | 'locked') {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (status === 'off') {
      if (this.lockGain) {
        try {
          this.lockGain.gain.setTargetAtTime(0, now, 0.05);
        } catch {
          this.lockGain.gain.value = 0;
        }
      }
      return;
    }

    if (!this.lockOsc) {
      try {
        this.lockOsc = this.ctx.createOscillator();
        this.lockGain = this.ctx.createGain();
        this.lockOsc.type = 'sawtooth';
        this.lockOsc.frequency.value = 1100;
        this.lockGain.gain.value = 0;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 6;

        this.lockOsc.connect(filter);
        filter.connect(this.lockGain);
        this.lockGain.connect(this.masterGain);
        this.lockOsc.start();
      } catch {
        return;
      }
    }

    if (this.lockGain && this.lockOsc) {
      try {
        if (status === 'acquiring') {
          this.lockOsc.frequency.setValueAtTime(750 + Math.sin(now * 25) * 150, now);
          this.lockGain.gain.setTargetAtTime(0.12, now, 0.05);
        } else if (status === 'locked') {
          this.lockOsc.frequency.setValueAtTime(1450, now);
          this.lockGain.gain.setTargetAtTime(0.24, now, 0.05);
        }
      } catch {
        // safe fallback
      }
    }
  }

  // --- Missile Launch (Stinger / Patriot) ---
  public playMissileLaunch(type: 'stinger' | 'patriot') {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const duration = type === 'patriot' ? 1.8 : 0.9;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(type === 'patriot' ? 80 : 160, now);
      osc.frequency.exponentialRampToValueAtTime(type === 'patriot' ? 240 : 450, now + duration);

      gain.gain.setValueAtTime(type === 'patriot' ? 0.8 : 0.55, now);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.1);

      this.playNoiseBurst(duration, type === 'patriot' ? 0.7 : 0.45, 1400);
    } catch {
      // safe fallback
    }
  }

  // --- Hypersonic Sonic Boom (ORESHNIK / Kinzhal / Zircon) ---
  public playHypersonicBoom() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(18, now + 1.8);

      gain.gain.setValueAtTime(0.95, now);
      gain.gain.linearRampToValueAtTime(0, now + 2.0);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.1);

      this.playNoiseBurst(2.2, 0.9, 600);
    } catch {
      // safe fallback
    }
  }

  // --- Target Explosion / Flak Detonation ---
  public playExplosion(intensity: 'small' | 'medium' | 'huge' = 'medium') {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const dur = intensity === 'huge' ? 2.2 : intensity === 'medium' ? 1.2 : 0.6;
      const peakGain = intensity === 'huge' ? 0.95 : intensity === 'medium' ? 0.7 : 0.45;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(24, now + dur * 0.8);

      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.linearRampToValueAtTime(0, now + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + dur + 0.1);

      this.playNoiseBurst(dur, peakGain * 0.85, intensity === 'huge' ? 800 : 1200);
    } catch {
      // safe fallback
    }
  }

  // --- Air Defense Siren (Повітряна тривога) ---
  public setSiren(active: boolean) {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    if (!active) {
      if (this.sirenGain) {
        try {
          this.sirenGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.8);
        } catch {
          this.sirenGain.gain.value = 0;
        }
      }
      if (this.sirenInterval) {
        window.clearInterval(this.sirenInterval);
        this.sirenInterval = null;
      }
      return;
    }

    if (!this.sirenOsc) {
      try {
        this.sirenOsc = this.ctx.createOscillator();
        this.sirenGain = this.ctx.createGain();
        this.sirenOsc.type = 'triangle';
        this.sirenOsc.frequency.value = 440;
        this.sirenGain.gain.value = 0;

        this.sirenOsc.connect(this.sirenGain);
        this.sirenGain.connect(this.masterGain);
        this.sirenOsc.start();
      } catch {
        return;
      }
    }

    if (this.sirenGain && this.sirenOsc) {
      try {
        this.sirenGain.gain.setTargetAtTime(0.2, this.ctx.currentTime, 0.4);

        let phase = false;
        const cycleTime = 2200;
        const step = () => {
          if (!this.ctx || !this.sirenOsc) return;
          const targetFreq = phase ? 580 : 380;
          try {
            this.sirenOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.8);
          } catch {
            // fallback
          }
          phase = !phase;
        };

        step();
        if (!this.sirenInterval) {
          this.sirenInterval = window.setInterval(step, cycleTime);
        }
      } catch {
        // fallback
      }
    }
  }

  // --- Searchlight Click Switch ---
  public playSearchlightClick(turnOn: boolean) {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(turnOn ? 400 : 250, now);
      osc.frequency.exponentialRampToValueAtTime(turnOn ? 800 : 120, now + 0.05);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // safe fallback
    }
  }

  // --- Tactical Radio Chatter Squelch / Beep ---
  public playRadioBeep() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.setValueAtTime(2100, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);

      this.playNoiseBurst(0.05, 0.12, 3000);
    } catch {
      // safe fallback
    }
  }

  // --- UI Tactical Click ---
  public playClick() {
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // safe fallback
    }
  }

  private playNoiseBurst(duration: number, volume: number, cutoff: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.max(128, Math.floor(this.ctx.sampleRate * duration));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, now);
      filter.frequency.linearRampToValueAtTime(Math.max(100, cutoff * 0.3), now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(Math.max(0.001, volume), now);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + duration + 0.05);
    } catch {
      // safe fallback
    }
  }
}

export const soundEngine = new SoundEngine();
