// Web Audio API Procedural Synthesizer for 90s Comic Slapstick SFX & Dynamic Soundtrack
// Zero external audio files needed - 100% offline, responsive, zero-latency!

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.isPlayingBgm = false;
    this.panicMode = false;
    this.tempo = 130;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.soundEnabled ? 0.8 : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.45 : 0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSoundEnabled(val) {
    this.soundEnabled = val;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(val ? 0.8 : 0, this.ctx.currentTime);
    }
  }

  setMusicEnabled(val) {
    this.musicEnabled = val;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(val ? 0.45 : 0, this.ctx.currentTime);
    }
    if (val && !this.isPlayingBgm) {
      this.startBgm();
    } else if (!val && this.isPlayingBgm) {
      this.stopBgm();
    }
  }

  setPanicMode(panic) {
    if (this.panicMode === panic) return;
    this.panicMode = panic;
    this.tempo = panic ? 165 : 130;
  }

  // --- SLAPSTICK SOUND EFFECTS ---

  // Duct Tape Rip & Slap
  playTape() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Noise burst for tape rip
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
    filter.Q.setValueAtTime(4.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.12);

    // Slap smack
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
    oscGain.gain.setValueAtTime(0.7, now + 0.08);
    oscGain.gain.linearRampToValueAtTime(0.01, now + 0.2);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now + 0.08);
    osc.stop(now + 0.2);
  }

  // Juice / Seltzer Spritz & Sploosh
  playJuice() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.22;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.22);

    // Liquid bubble squirt
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + Math.random() * 300, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Power Broom Swish & Sweep
  playBroom() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.7;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.18);
  }

  // Monkey Wrench / Ratchet Click & Clank
  playWrench() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    [0, 0.04, 0.08].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200 + idx * 250, now + offset);
      osc.frequency.exponentialRampToValueAtTime(400, now + offset + 0.03);

      gain.gain.setValueAtTime(0.3, now + offset);
      gain.gain.linearRampToValueAtTime(0.01, now + offset + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.03);
    });

    // Metallic chime
    const bell = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bell.type = 'triangle';
    bell.frequency.setValueAtTime(1760, now + 0.09);
    bellGain.gain.setValueAtTime(0.4, now + 0.09);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    bell.connect(bellGain);
    bellGain.connect(this.sfxGain);
    bell.start(now + 0.09);
    bell.stop(now + 0.3);
  }

  // Comic Impact / Explosion (KAPOW!)
  playKapow() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Sub thump
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.28);

    oscGain.gain.setValueAtTime(0.9, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);

    // Crunch noise
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + 0.25);
  }

  // News Chopper Camera Shutter & Live Buzz
  playCameraSnap() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // Shutter click 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(2200, now);
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.linearRampToValueAtTime(0.01, now + 0.03);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.03);

    // Shutter click 2
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1600, now + 0.06);
    gain2.gain.setValueAtTime(0.6, now + 0.06);
    gain2.gain.linearRampToValueAtTime(0.01, now + 0.1);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.1);

    // Flash recharge whine
    const whine = this.ctx.createOscillator();
    const whineGain = this.ctx.createGain();
    whine.type = 'sine';
    whine.frequency.setValueAtTime(800, now + 0.1);
    whine.frequency.exponentialRampToValueAtTime(3200, now + 0.35);
    whineGain.gain.setValueAtTime(0.2, now + 0.1);
    whineGain.gain.linearRampToValueAtTime(0.01, now + 0.35);
    whine.connect(whineGain);
    whineGain.connect(this.sfxGain);
    whine.start(now + 0.1);
    whine.stop(now + 0.35);
  }

  // PR Megaphone Siren / Horn
  playMegaphone() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.setValueAtTime(850, now + 0.1);
    osc.frequency.setValueAtTime(650, now + 0.2);
    osc.frequency.setValueAtTime(950, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Cash / Wage Ka-Ching!
  playChing() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const notes = [1318.5, 1760.0]; // E6, A6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.45, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }

  // Comical Slide Whistle / OOPS!
  playOops() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Comic UI Button Click / Pop
  playClick() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Level Win Heroic Fanfare
  playWin() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const fanfare = [
      { f: 523.25, t: 0.0, d: 0.12 }, // C5
      { f: 659.25, t: 0.12, d: 0.12 }, // E5
      { f: 783.99, t: 0.24, d: 0.14 }, // G5
      { f: 1046.50, t: 0.38, d: 0.45 }  // C6
    ];

    fanfare.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      // Lowpass for warm brass tone
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now + note.t);

      gain.gain.setValueAtTime(0.35, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  }

  // Game Over Sad Wah-Wah
  playLose() {
    if (!this.soundEnabled || !this.ctx) return;
    this.ensureContext();
    const now = this.ctx.currentTime;
    const notes = [440, 415.3, 392, 349.2]; // A4, Ab4, G4, F4

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.25);
      osc.frequency.linearRampToValueAtTime(freq - 15, now + idx * 0.25 + 0.22);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now + idx * 0.25);

      gain.gain.setValueAtTime(0.35, now + idx * 0.25);
      gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.25 + 0.24);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.25);
      osc.stop(now + idx * 0.25 + 0.24);
    });
  }

  // --- PROCEDURAL 90s COMIC BACKGROUND MUSIC (BGM) ---
  // Funky superhero cartoon bassline, slap drums, and jaunty chords
  startBgm() {
    if (this.isPlayingBgm || !this.musicEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.isPlayingBgm = true;
    this.bgmStep = 0;
    this.scheduleNextBgmBeat();
  }

  stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  scheduleNextBgmBeat() {
    if (!this.isPlayingBgm || !this.musicEnabled || !this.ctx) return;

    const secondsPerBeat = 60 / this.tempo;
    const stepDuration = secondsPerBeat / 4; // 16th note steps
    const now = this.ctx.currentTime;

    // Bassline in F funky minor / comic blues
    // Pattern: 16-step bar
    const bassNotes = [
      87.31, 0, 87.31, 103.83, 0, 116.54, 0, 130.81,
      87.31, 0, 155.56, 0, 146.83, 130.81, 116.54, 103.83
    ];
    // In panic mode, shift to frenetic chromatic runs
    const panicBassNotes = [
      116.54, 116.54, 123.47, 130.81, 138.59, 146.83, 155.56, 174.61,
      174.61, 164.81, 155.56, 146.83, 138.59, 130.81, 123.47, 116.54
    ];

    const currentBass = this.panicMode ? panicBassNotes : bassNotes;
    const noteFreq = currentBass[this.bgmStep % 16];

    if (noteFreq > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = this.panicMode ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(noteFreq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(this.panicMode ? 850 : 500, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + stepDuration * 2);
    }

    // Drum beat: Kick on 0, 8; Snare on 4, 12; Hi-hat on every odd 16th
    const beatIndex = this.bgmStep % 16;
    if (beatIndex === 0 || beatIndex === 8 || (this.panicMode && (beatIndex === 6 || beatIndex === 14))) {
      // Kick drum
      const kick = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(140, now);
      kick.frequency.exponentialRampToValueAtTime(45, now + 0.1);
      kickGain.gain.setValueAtTime(0.6, now);
      kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      kick.connect(kickGain);
      kickGain.connect(this.musicGain);
      kick.start(now);
      kick.stop(now + 0.12);
    }

    if (beatIndex === 4 || beatIndex === 12) {
      // Snare drum (noise burst + tone)
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.4, now);
      snareGain.gain.linearRampToValueAtTime(0.01, now + 0.08);

      noise.connect(filter);
      filter.connect(snareGain);
      snareGain.connect(this.musicGain);
      noise.start(now);
      noise.stop(now + 0.08);
    }

    // Hi-hat tick
    if (beatIndex % 2 === 1 || this.panicMode) {
      const bufferSize = this.ctx.sampleRate * 0.03;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6000, now);

      const hatGain = this.ctx.createGain();
      hatGain.gain.setValueAtTime(0.15, now);
      hatGain.gain.linearRampToValueAtTime(0.01, now + 0.03);

      noise.connect(filter);
      filter.connect(hatGain);
      hatGain.connect(this.musicGain);
      noise.start(now);
      noise.stop(now + 0.03);
    }

    // Comic horn stab every 16 steps
    if (beatIndex === 0 && (Math.floor(this.bgmStep / 16) % 2 === 1)) {
      const hornNotes = [349.23, 440, 523.25]; // F major triad
      hornNotes.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.22);
      });
    }

    this.bgmStep++;
    const msUntilNext = stepDuration * 1000;
    this.bgmTimer = setTimeout(() => this.scheduleNextBgmBeat(), msUntilNext);
  }
}

export const soundEngine = new SoundSynthesizer();
