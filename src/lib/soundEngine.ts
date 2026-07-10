/**
 * SoundEngine – Web Audio API + Web Speech API utility.
 * All sounds are synthesized in-browser. Zero external audio files.
 * Rich, character-specific sound design for each avatar.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private unlocked = false;

  // ─── Bootstrap ────────────────────────────────────────────────
  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  /** Must be called from a user-gesture handler (click/tap). */
  async unlock(): Promise<void> {
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.unlocked = true;
  }

  get isUnlocked(): boolean {
    return this.unlocked;
  }

  // ─── Low-level helpers ────────────────────────────────────────
  private tone(
    type: OscillatorType,
    freq: number,
    duration: number,
    opts?: {
      freqEnd?: number;
      gain?: number;
      gainEnd?: number;
      delay?: number;
      detune?: number;
      attack?: number;
      filterType?: BiquadFilterType;
      filterFreq?: number;
      filterFreqEnd?: number;
    },
  ): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime + (opts?.delay ?? 0);

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (opts?.freqEnd != null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(opts.freqEnd, 0.01), now + duration);
    }
    if (opts?.detune) {
      osc.detune.setValueAtTime(opts.detune, now);
    }

    const vol = opts?.gain ?? 0.15;
    const attack = opts?.attack ?? 0.005;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vol, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(opts?.gainEnd ?? 0.001, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = opts?.filterType ?? 'lowpass';
    filter.frequency.setValueAtTime(opts?.filterFreq ?? 2000, now);
    if (opts?.filterFreqEnd != null) {
      filter.frequency.linearRampToValueAtTime(opts.filterFreqEnd, now + duration);
    }

    osc.connect(filter).connect(gainNode).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  /** Create white/pink noise burst */
  private noise(
    duration: number,
    opts?: {
      gain?: number;
      attack?: number;
      delay?: number;
      filterType?: BiquadFilterType;
      filterFreq?: number;
      filterFreqEnd?: number;
      filterQ?: number;
    }
  ): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime + (opts?.delay ?? 0);

    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = opts?.filterType ?? 'bandpass';
    filter.frequency.setValueAtTime(opts?.filterFreq ?? 1000, now);
    if (opts?.filterFreqEnd != null) {
      filter.frequency.linearRampToValueAtTime(opts.filterFreqEnd, now + duration);
    }
    filter.Q.value = opts?.filterQ ?? 1;

    const gainNode = ctx.createGain();
    const vol = opts?.gain ?? 0.1;
    const attack = opts?.attack ?? 0.01;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vol, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter).connect(gainNode).connect(ctx.destination);
    source.start(now);
  }

  // ─── Generic Game event sounds ────────────────────────────────

  /**
   * Randomized move sound – 5 subtle variants so it never feels repetitive.
   * All variants simulate an acoustic wooden chess piece being placed.
   */
  playMove(): void {
    const variant = Math.floor(Math.random() * 5);
    switch (variant) {
      case 0:
        // Dry wood tap
        this.tone('sine', 650, 0.035, { freqEnd: 90, gain: 0.11, attack: 0.001 });
        this.tone('triangle', 320, 0.07, { gain: 0.025, attack: 0.004 });
        break;
      case 1:
        // Slightly hollow clack
        this.tone('sine', 500, 0.05, { freqEnd: 120, gain: 0.09, attack: 0.001 });
        this.tone('triangle', 250, 0.1, { gain: 0.018, attack: 0.006 });
        this.noise(0.04, { gain: 0.015, attack: 0.001, filterType: 'bandpass', filterFreq: 2000, filterQ: 3 });
        break;
      case 2:
        // Sharp click, lighter piece
        this.tone('sine', 800, 0.028, { freqEnd: 150, gain: 0.08, attack: 0.001 });
        this.tone('triangle', 400, 0.06, { gain: 0.02, attack: 0.003 });
        break;
      case 3:
        // Muffled thud, heavier piece
        this.tone('sine', 380, 0.06, { freqEnd: 70, gain: 0.13, attack: 0.002 });
        this.tone('triangle', 190, 0.09, { gain: 0.03, attack: 0.005 });
        break;
      case 4:
        // Crisp knock with subtle resonance
        this.tone('sine', 720, 0.04, { freqEnd: 110, gain: 0.10, attack: 0.001 });
        this.tone('triangle', 360, 0.08, { gain: 0.022, attack: 0.004 });
        this.noise(0.05, { gain: 0.012, attack: 0.002, filterType: 'highpass', filterFreq: 3000 });
        break;
    }
  }

  /**
   * Randomized capture sound – 5 heavier variants.
   * Each suggests the weight of a piece being taken off the board.
   */
  playCapture(): void {
    const variant = Math.floor(Math.random() * 5);
    switch (variant) {
      case 0:
        // Deep wood thud
        this.tone('sine', 280, 0.12, { freqEnd: 75, gain: 0.22, attack: 0.002 });
        this.tone('square', 140, 0.16, { freqEnd: 45, gain: 0.06, attack: 0.002, delay: 0.02 });
        break;
      case 1:
        // Heavy slam
        this.tone('sine', 200, 0.14, { freqEnd: 55, gain: 0.28, attack: 0.001 });
        this.noise(0.1, { gain: 0.04, attack: 0.002, filterType: 'lowpass', filterFreq: 800 });
        this.tone('triangle', 100, 0.18, { freqEnd: 35, gain: 0.08, attack: 0.003, delay: 0.01 });
        break;
      case 2:
        // Crisp snatch
        this.tone('sine', 350, 0.09, { freqEnd: 90, gain: 0.18, attack: 0.001 });
        this.tone('square', 175, 0.12, { freqEnd: 55, gain: 0.055, attack: 0.002, delay: 0.015 });
        this.noise(0.06, { gain: 0.03, attack: 0.001, filterType: 'bandpass', filterFreq: 1200, filterQ: 2 });
        break;
      case 3:
        // Solid thwack with ring-out
        this.tone('sine', 320, 0.15, { freqEnd: 60, gain: 0.2, attack: 0.002 });
        this.tone('triangle', 640, 0.25, { freqEnd: 120, gain: 0.04, attack: 0.003, delay: 0.01 });
        break;
      case 4:
        // Double-knock collision
        this.tone('sine', 420, 0.07, { freqEnd: 100, gain: 0.18, attack: 0.001 });
        this.tone('sine', 260, 0.12, { freqEnd: 60, gain: 0.22, attack: 0.002, delay: 0.04 });
        this.noise(0.08, { gain: 0.035, attack: 0.002, filterType: 'lowpass', filterFreq: 600 });
        break;
    }
  }

  /** Subdued two-note alert */
  playCheck(): void {
    this.tone('sine', 500, 0.15, { gain: 0.08, attack: 0.02 });
    this.tone('sine', 750, 0.2, { gain: 0.1, delay: 0.1, attack: 0.02 });
  }

  /** Victory arpeggio (C-E-G-C) */
  playCheckmate(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.tone('sine', f, 0.4, { gain: 0.08, delay: i * 0.1, attack: 0.02 });
    });
  }

  playBlunder(): void {
    this.tone('triangle', 300, 0.5, { freqEnd: 100, gain: 0.08, attack: 0.05 });
  }

  /** Stalemate low hum */
  playStalemate(): void {
    this.tone('sine', 200, 0.4, { freqEnd: 180, gain: 0.06, attack: 0.1 });
  }

  // ══════════════════════════════════════════════════════════════
  // ─── T-REX SOUNDS ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /** Deep, rumbling T-Rex roar with harmonics */
  roar(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Sub-bass body
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(50, now);
    osc1.frequency.linearRampToValueAtTime(30, now + 0.8);

    // Mid harmonic
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(100, now);
    osc2.frequency.linearRampToValueAtTime(60, now + 0.7);

    // High crackle
    const osc3 = ctx.createOscillator();
    osc3.type = 'sawtooth';
    osc3.frequency.setValueAtTime(200, now + 0.1);
    osc3.frequency.linearRampToValueAtTime(80, now + 0.6);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.linearRampToValueAtTime(300, now + 0.8);
    filter.Q.value = 5;

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.08);
    gain1.gain.linearRampToValueAtTime(0.001, now + 0.9);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.001, now + 0.7);

    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0, now + 0.1);
    gain3.gain.linearRampToValueAtTime(0.05, now + 0.2);
    gain3.gain.linearRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(filter).connect(gain1).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);
    osc3.connect(gain3).connect(ctx.destination);

    osc1.start(now); osc1.stop(now + 1);
    osc2.start(now); osc2.stop(now + 0.8);
    osc3.start(now + 0.1); osc3.stop(now + 0.7);
  }

  /** Angry, rapid T-Rex snarl – short burst */
  rexSnarl(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120 + i * 30, now + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(40, now + i * 0.06 + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    }
  }

  /** T-Rex stomp – deep impact thud */
  rexStomp(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Impact transient
    this.tone('sine', 80, 0.3, { freqEnd: 20, gain: 0.4, attack: 0.001, filterFreq: 200 });
    // Sub rumble
    this.tone('triangle', 40, 0.5, { freqEnd: 15, gain: 0.2, attack: 0.005, delay: 0.02 });

    // Earthquake noise
    this.noise(0.4, {
      gain: 0.05,
      attack: 0.01,
      filterType: 'lowpass',
      filterFreq: 300,
      filterFreqEnd: 50,
    });

    void ctx; // suppress unused warning
  }

  /** T-Rex victorious bellow */
  rexVictoryBellow(): void {
    this.roar();
    // Second, higher roar
    setTimeout(() => {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.3);
      osc.frequency.linearRampToValueAtTime(40, now + 0.8);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.linearRampToValueAtTime(400, now + 0.8);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.9);

      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1);
    }, 400);
  }

  /** T-Rex death/defeat – slowing down moan */
  rexDefeat(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.linearRampToValueAtTime(20, now + 2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(80, now + 2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
    gain.gain.linearRampToValueAtTime(0.001, now + 2);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2.1);
  }

  /** T-Rex aggressive bite sound */
  rexBite(): void {
    this.noise(0.15, {
      gain: 0.12,
      attack: 0.002,
      filterType: 'bandpass',
      filterFreq: 1200,
      filterFreqEnd: 400,
      filterQ: 2,
    });
    this.tone('sawtooth', 180, 0.12, { freqEnd: 40, gain: 0.15, attack: 0.001 });
  }

  /** T-Rex thinking – deep rhythmic breathing */
  rexBreathing(): void {
    // Inhale
    this.noise(0.4, {
      gain: 0.04,
      attack: 0.1,
      filterType: 'lowpass',
      filterFreq: 200,
      filterFreqEnd: 400,
    });
    // Exhale
    this.noise(0.6, {
      gain: 0.05,
      attack: 0.05,
      delay: 0.5,
      filterType: 'lowpass',
      filterFreq: 400,
      filterFreqEnd: 100,
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ─── ELEPHANT SOUNDS ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /** Majestic elephant trumpet */
  trumpet(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(520, now + 0.15);
    osc.frequency.linearRampToValueAtTime(420, now + 0.5);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(150, now);
    osc2.frequency.linearRampToValueAtTime(260, now + 0.15);
    osc2.frequency.linearRampToValueAtTime(210, now + 0.5);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 7;
    lfoGain.gain.value = 15;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start(now); lfo.stop(now + 0.55);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.6);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.05);
    gain2.gain.linearRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.65);
    osc2.start(now); osc2.stop(now + 0.6);
  }

  /** Elephant victory fanfare – multi-trumpet call */
  elephantFanfare(): void {
    const ctx = this.getCtx();
    const freqs = [300, 380, 480, 600, 480];
    freqs.forEach((f, i) => {
      const delay = i * 0.12;
      const now = ctx.currentTime + delay;

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 1.2, now + 0.08);

      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 8;
      lfoG.gain.value = 10;
      lfo.connect(lfoG).connect(osc.frequency);
      lfo.start(now); lfo.stop(now + 0.2);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.3);
    });
  }

  /** Elephant stomp – massive ground shake */
  elephantStomp(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Heavy body thud
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(15, now + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.65);

    // Rumble noise
    this.noise(0.5, {
      gain: 0.06,
      attack: 0.01,
      filterType: 'lowpass',
      filterFreq: 200,
    });
  }

  /** Elephant angry war cry */
  elephantWarCry(): void {
    this.trumpet();
    setTimeout(() => this.elephantStomp(), 200);
    setTimeout(() => this.trumpet(), 450);
  }

  /** Elephant defeat – sad, slow trumpet */
  elephantSadTrumpet(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(200, now + 1.5);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(300, now + 1.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.2);
    gain.gain.linearRampToValueAtTime(0.001, now + 1.6);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 1.7);
  }

  /** Elephant ear flap – whoosh sound */
  elephantEarFlap(): void {
    this.noise(0.3, {
      gain: 0.04,
      attack: 0.02,
      filterType: 'bandpass',
      filterFreq: 600,
      filterFreqEnd: 200,
      filterQ: 0.5,
    });
  }

  /** Elephant deep rumble – thinking */
  elephantRumble(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(30, now);

    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.5;
    lfoG.gain.value = 8;
    lfo.connect(lfoG).connect(osc.frequency);
    lfo.start(now); lfo.stop(now + 2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    gain.gain.linearRampToValueAtTime(0.001, now + 2);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 2.1);
  }

  // ══════════════════════════════════════════════════════════════
  // ─── CREEPER SOUNDS ──────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /** Classic Creeper hiss */
  hiss(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const duration = 0.9;

    this.noise(duration, {
      gain: 0.08,
      attack: 0.05,
      filterType: 'bandpass',
      filterFreq: 4000,
      filterFreqEnd: 8000,
      filterQ: 0.8,
    });

    // Low sssss undertone
    this.tone('sawtooth', 80, duration * 0.6, {
      freqEnd: 60,
      gain: 0.02,
      attack: 0.1,
      filterFreq: 300,
    });

    void ctx;
  }

  /** Creeper explosion – massive layered bang */
  creeperExplosion(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Pre-explosion charge sound
    this.noise(0.15, {
      gain: 0.06,
      attack: 0.02,
      filterType: 'highpass',
      filterFreq: 2000,
      filterFreqEnd: 8000,
    });

    // Main explosion bang
    setTimeout(() => {
      // Deep sub boom
      this.tone('sine', 80, 0.6, { freqEnd: 15, gain: 0.5, attack: 0.001 });
      // Mid crack
      this.tone('square', 150, 0.3, { freqEnd: 30, gain: 0.2, attack: 0.001 });
      // High crackle
      this.noise(0.4, {
        gain: 0.15,
        attack: 0.002,
        filterType: 'highpass',
        filterFreq: 3000,
        filterFreqEnd: 500,
      });
      // Ultra-low sub
      this.tone('sine', 40, 0.8, { freqEnd: 10, gain: 0.35, attack: 0.001 });
    }, 150);
  }

  /** Creeper fuse sizzle – getting ready to explode */
  creeperFuse(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Sizzle/spark
    for (let i = 0; i < 5; i++) {
      this.noise(0.08, {
        gain: 0.04 + i * 0.01,
        attack: 0.005,
        delay: i * 0.1,
        filterType: 'highpass',
        filterFreq: 3000 + i * 500,
        filterQ: 3,
      });
    }

    void ctx;
  }

  /** Creeper ominous breathing – very quiet, eerie */
  creeperBreathing(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Ominous low hum
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);

    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.3;
    lfoG.gain.value = 5;
    lfo.connect(lfoG).connect(osc.frequency);
    lfo.start(now); lfo.stop(now + 2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.03, now + 0.5);
    gain.gain.linearRampToValueAtTime(0.001, now + 2);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 2.1);
  }

  /** Creeper victory – triumphant chaos */
  creeperVictory(): void {
    this.creeperExplosion();
    setTimeout(() => this.hiss(), 600);
    setTimeout(() => this.hiss(), 900);
  }

  /** Creeper death – deflating, sad hiss */
  creeperDeath(): void {
    this.noise(1.5, {
      gain: 0.05,
      attack: 0.05,
      filterType: 'bandpass',
      filterFreq: 3000,
      filterFreqEnd: 200,
      filterQ: 1,
    });
    this.tone('sawtooth', 100, 1.5, { freqEnd: 20, gain: 0.03, attack: 0.1, filterFreq: 500 });
  }

  /** Creeper sneak – subtle rustling */
  creeperSneak(): void {
    this.noise(0.3, {
      gain: 0.02,
      attack: 0.05,
      filterType: 'bandpass',
      filterFreq: 1000,
      filterFreqEnd: 2000,
      filterQ: 2,
    });
  }

  // ══════════════════════════════════════════════════════════════
  // ─── NINJA SOUNDS (authentic shinobi palette) ─────────────────
  // ══════════════════════════════════════════════════════════════

  /**
   * Shuriken throw – spinning metal disc cutting air.
   * Sharp metallic ring + tight whoosh.
   */
  swordSlash(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Spinning disc whoosh
    this.noise(0.18, {
      gain: 0.09,
      attack: 0.002,
      filterType: 'bandpass',
      filterFreq: 6000,
      filterFreqEnd: 3000,
      filterQ: 1.2,
    });
    // Metallic shuriken ring on release
    this.tone('triangle', 2400, 0.18, { freqEnd: 900, gain: 0.04, attack: 0.001, filterFreq: 4000 });
    // Subtle second harmonic
    this.tone('triangle', 1200, 0.12, { freqEnd: 500, gain: 0.02, attack: 0.001, delay: 0.01 });

    void ctx;
  }

  /**
   * Katana draw – blade sliding out of scabbard.
   * Smooth metallic scrape with ring at end.
   */
  ninjaKatanaDraw(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Scrape
    this.noise(0.35, {
      gain: 0.06,
      attack: 0.05,
      filterType: 'bandpass',
      filterFreq: 4000,
      filterFreqEnd: 6000,
      filterQ: 2,
    });
    // Ring at the end
    this.tone('triangle', 1800, 0.6, { freqEnd: 400, gain: 0.07, attack: 0.001, delay: 0.3, filterFreq: 3500 });
    this.tone('triangle', 3600, 0.4, { freqEnd: 800, gain: 0.03, attack: 0.001, delay: 0.32 });

    void ctx;
  }

  /**
   * Shadow step – silent footfall + air displacement.
   * Barely audible, creates tension.
   */
  ninjaStealth(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Very soft foot displacement
    this.noise(0.25, {
      gain: 0.018,
      attack: 0.06,
      filterType: 'lowpass',
      filterFreq: 400,
      filterFreqEnd: 150,
      filterQ: 0.5,
    });
    // Subtle air whisper
    this.noise(0.3, {
      gain: 0.012,
      attack: 0.05,
      delay: 0.05,
      filterType: 'bandpass',
      filterFreq: 1800,
      filterQ: 1.5,
    });

    void ctx;
  }

  /**
   * Bamboo strike – hollow wood percussion hit.
   * Bo staff / bamboo training impact.
   */
  private ninjaBambooStrike(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.22);

    // Click transient
    this.noise(0.04, { gain: 0.06, attack: 0.001, filterType: 'highpass', filterFreq: 5000 });
  }

  /**
   * Ninja combo – shuriken + bamboo hits.
   */
  ninjaCombo(): void {
    this.swordSlash();
    setTimeout(() => this.ninjaBambooStrike(), 110);
    setTimeout(() => this.swordSlash(), 220);
    setTimeout(() => this.ninjaBambooStrike(), 330);
  }

  /**
   * Ninja teleport – body vanishes, reappears.
   * Smoke-bomb womp + air-crack on arrival.
   */
  ninjaTeleport(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Smoke burst departure
    this.noise(0.15, {
      gain: 0.07,
      attack: 0.005,
      filterType: 'lowpass',
      filterFreq: 1200,
      filterFreqEnd: 300,
      filterQ: 0.8,
    });
    // Low body-displacement womp
    this.tone('sine', 60, 0.12, { freqEnd: 20, gain: 0.18, attack: 0.002 });

    // Air-crack on arrival (slight delay)
    this.noise(0.1, {
      gain: 0.08,
      attack: 0.001,
      delay: 0.2,
      filterType: 'highpass',
      filterFreq: 3000,
      filterFreqEnd: 800,
    });
    // High crack pop
    this.tone('sine', 1200, 0.08, { freqEnd: 400, gain: 0.05, attack: 0.001, delay: 0.2 });

    void ctx;
  }

  /**
   * Kiai shout – authentic Japanese battle cry.
   * Voiced consonant burst + formant vowel.
   */
  ninjaKiYell(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Initial consonant noise burst ("H" sound)
    this.noise(0.04, {
      gain: 0.08,
      attack: 0.001,
      filterType: 'highpass',
      filterFreq: 2500,
    });

    // Voiced vowel "A" formant
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(180, now + 0.02);
    osc1.frequency.linearRampToValueAtTime(220, now + 0.08);
    osc1.frequency.linearRampToValueAtTime(160, now + 0.3);

    const f1 = ctx.createBiquadFilter(); // first formant ~700Hz
    f1.type = 'bandpass';
    f1.frequency.value = 700;
    f1.Q.value = 5;

    const f2 = ctx.createBiquadFilter(); // second formant ~1200Hz
    f2.type = 'bandpass';
    f2.frequency.value = 1200;
    f2.Q.value = 4;

    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0, now + 0.02);
    g1.gain.linearRampToValueAtTime(0.12, now + 0.05);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    const g2 = ctx.createGain();
    g2.gain.value = 0.06;

    osc1.connect(f1).connect(g1).connect(ctx.destination);
    osc1.connect(f2).connect(g2).connect(ctx.destination);
    osc1.start(now + 0.02); osc1.stop(now + 0.35);
  }

  /**
   * Temple gong – resonant bronze strike.
   * Deep, meditative, reverberant.
   */
  private ninjaGong(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    // Fundamental
    this.tone('sine', 90, 2.5, { freqEnd: 85, gain: 0.15, attack: 0.003, filterFreq: 500 });
    // 2nd partial
    this.tone('sine', 185, 1.8, { freqEnd: 178, gain: 0.07, attack: 0.003, delay: 0.002 });
    // 3rd partial (slightly inharmonic = gong character)
    this.tone('sine', 312, 1.2, { freqEnd: 300, gain: 0.04, attack: 0.003, delay: 0.003 });
    // Attack noise
    this.noise(0.06, { gain: 0.05, attack: 0.001, filterType: 'bandpass', filterFreq: 800, filterQ: 2 });
  }

  /**
   * Chi energy charge – building spiritual power.
   * Rising resonant hum used during thinking.
   */
  private ninjaChiCharge(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(220, now + 1.5);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(280, now);
    osc2.frequency.linearRampToValueAtTime(440, now + 1.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.4);
    gain.gain.linearRampToValueAtTime(0.001, now + 1.6);

    const gain2 = ctx.createGain();
    gain2.gain.value = 0.02;

    osc.connect(gain).connect(ctx.destination);
    osc2.connect(gain2).connect(ctx.destination);
    osc.start(now); osc.stop(now + 1.7);
    osc2.start(now); osc2.stop(now + 1.7);
  }

  /**
   * Ninja parry – katana deflect with spark.
   * Sharp metallic ring + scrape.
   */
  ninjaParry(): void {
    // Impact ring
    this.tone('triangle', 2200, 0.45, { freqEnd: 700, gain: 0.12, attack: 0.001, filterFreq: 4000 });
    this.tone('triangle', 1400, 0.35, { freqEnd: 450, gain: 0.07, attack: 0.001, delay: 0.008, filterFreq: 3000 });
    // Scrape noise
    this.noise(0.12, {
      gain: 0.05,
      attack: 0.002,
      filterType: 'bandpass',
      filterFreq: 5000,
      filterFreqEnd: 2000,
      filterQ: 1.5,
    });
    // Spark tick
    this.noise(0.03, { gain: 0.06, attack: 0.001, filterType: 'highpass', filterFreq: 7000 });
  }

  /**
   * Ninja defeat – katana dropped on stone floor.
   * Long metallic ring decaying slowly.
   */
  ninjaDefeat(): void {
    // Blade hitting stone – impact
    this.noise(0.04, { gain: 0.08, attack: 0.001, filterType: 'highpass', filterFreq: 4000 });
    // Long ring decay
    this.tone('triangle', 1600, 2.5, { freqEnd: 400, gain: 0.1, attack: 0.001, filterFreq: 3000 });
    this.tone('triangle', 2400, 1.8, { freqEnd: 600, gain: 0.05, attack: 0.001, delay: 0.01 });
    this.tone('triangle', 800, 3.0, { freqEnd: 200, gain: 0.06, attack: 0.002, delay: 0.02 });
    // Body fall thud
    this.tone('sine', 80, 0.3, { freqEnd: 25, gain: 0.2, attack: 0.003, delay: 0.6 });
    this.noise(0.15, { gain: 0.04, attack: 0.01, delay: 0.6, filterType: 'lowpass', filterFreq: 300 });
  }

  /**
   * Ninja victory – gong + kiai + shuriken flourish.
   */
  ninjaVictory(): void {
    this.ninjaGong();
    setTimeout(() => this.ninjaKiYell(), 250);
    setTimeout(() => this.swordSlash(), 500);
    setTimeout(() => this.swordSlash(), 620);
    setTimeout(() => this.ninjaKatanaDraw(), 750);
  }

  /**
   * Ninja double slash – two quick shuriken throws.
   */
  ninjaDoubleSlash(): void {
    this.swordSlash();
    setTimeout(() => this.swordSlash(), 130);
  }

  // ══════════════════════════════════════════════════════════════
  // ─── BATMAN SOUNDS ──────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════

  /** Dramatic Bat-Signal hum (low droning sweep) */
  playBatSignal(): void {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    
    // Deep hum
    this.tone('sine', 30, 2.0, { freqEnd: 45, gain: 0.4, attack: 0.2 });
    this.tone('triangle', 60, 2.0, { freqEnd: 90, gain: 0.15, attack: 0.3 });
    
    // High-pitched electrical buzz
    this.noise(2.0, {
      gain: 0.03,
      attack: 0.4,
      filterType: 'bandpass',
      filterFreq: 2000,
      filterFreqEnd: 1000,
      filterQ: 3,
    });
  }

  /** Sharp Batarang slice */
  batarangSwoosh(): void {
    this.tone('triangle', 800, 0.3, { freqEnd: 150, gain: 0.2, attack: 0.005 });
    this.noise(0.3, { gain: 0.1, attack: 0.01, filterType: 'highpass', filterFreq: 2000 });
  }

  /** Grappling hook metal snap */
  batGrapple(): void {
    // Metal snap
    this.tone('square', 500, 0.15, { freqEnd: 80, gain: 0.15, attack: 0.001 });
    // Zip wire noise
    this.noise(0.5, { gain: 0.07, attack: 0.01, filterType: 'bandpass', filterFreq: 3000, filterQ: 2 });
  }

  // ─── Speech ───────────────────────────────────────────────────

  speak(text: string, opts?: { pitch?: number; rate?: number; voice?: string }): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = opts?.pitch ?? 1.3;
    utterance.rate = opts?.rate ?? 1.0;
    utterance.volume = 0.7;

    const voices = window.speechSynthesis.getVoices();

    if (opts?.voice) {
      const named = voices.find((v) => v.name.includes(opts.voice!));
      if (named) utterance.voice = named;
    } else {
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha')),
      );
      if (preferred) utterance.voice = preferred;
    }

    window.speechSynthesis.speak(utterance);
  }

  /** T-Rex – ultra deep, slow growl voice */
  speakAsRex(text: string): void {
    this.speak(text, { pitch: 0.4, rate: 0.75 });
  }

  /** Elephant – medium deep, authoritative, regal */
  speakAsElephant(text: string): void {
    this.speak(text, { pitch: 0.85, rate: 0.9 });
  }

  /** Creeper – high-pitched, manic, slightly distorted */
  speakAsCreeper(text: string): void {
    this.speak(text, { pitch: 1.6, rate: 1.3 });
  }

  /** Ninja – calm, measured, slightly stern */
  speakAsNinja(text: string): void {
    this.speak(text, { pitch: 0.9, rate: 1.0 });
  }

  /** Batman – deep, mysterious, raspy */
  speakAsBatman(text: string): void {
    this.speak(text, { pitch: 0.2, rate: 0.75 });
  }
}

export const soundEngine = new SoundEngine();
