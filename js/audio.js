export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.musicEnabled = true;
    this.theme = "sanctuary";
    this.stepIndex = 0;
    this.loopTimer = null;
  }

  unlock() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    if (!this.loopTimer) {
      this.startMusicLoop();
    }
  }

  toggleMute() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setTheme(theme) {
    if (this.theme !== theme) {
      this.theme = theme;
      this.stepIndex = 0;
    }
  }

  tone(freq, duration = 0.12, type = "triangle", gainVal = 0.08, slideTo = null, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(24, freq), now);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(24, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  noise(duration = 0.12, gainVal = 0.08, cutoff = 1400) {
    if (!this.enabled || !this.ctx) return;
    const sampleCount = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, sampleCount, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(now);
  }

  startMusicLoop() {
    const patterns = {
      sanctuary: {
        tempo: 260,
        wave: "triangle",
        notes: [261.6, 329.6, 392.0, 523.3, 392.0, 329.6, 293.7, 392.0, 440.0, 523.3, 440.0, 392.0, 329.6, 293.7, 261.6, 196.0],
        bass: [130.8, 0, 130.8, 0, 146.8, 0, 110.0, 0, 130.8, 0, 164.8, 0, 146.8, 0, 98.0, 0],
      },
      wilds: {
        tempo: 210,
        wave: "square",
        notes: [293.7, 349.2, 440.0, 587.3, 523.3, 440.0, 392.0, 440.0, 349.2, 293.7, 329.6, 392.0, 440.0, 523.3, 440.0, 349.2],
        bass: [146.8, 146.8, 0, 146.8, 130.8, 130.8, 0, 130.8, 116.5, 116.5, 0, 116.5, 130.8, 0, 146.8, 0],
      },
      tundra: {
        tempo: 250,
        wave: "sine",
        notes: [329.6, 493.9, 587.3, 659.3, 587.3, 493.9, 392.0, 493.9, 329.6, 440.0, 523.3, 659.3, 523.3, 440.0, 392.0, 329.6],
        bass: [164.8, 0, 0, 164.8, 146.8, 0, 0, 146.8, 130.8, 0, 0, 130.8, 123.5, 0, 146.8, 0],
      },
      badlands: {
        tempo: 185,
        wave: "sawtooth",
        notes: [220.0, 233.1, 293.7, 329.6, 293.7, 233.1, 220.0, 196.0, 220.0, 261.6, 311.1, 329.6, 311.1, 261.6, 233.1, 220.0],
        bass: [110.0, 110.0, 110.0, 0, 116.5, 116.5, 98.0, 0, 110.0, 110.0, 130.8, 0, 116.5, 110.0, 98.0, 0],
      },
      citadel: {
        tempo: 175,
        wave: "sawtooth",
        notes: [196.0, 233.1, 293.7, 370.0, 392.0, 370.0, 293.7, 233.1, 185.0, 220.0, 277.2, 349.2, 370.0, 293.7, 233.1, 196.0],
        bass: [98.0, 0, 98.0, 98.0, 92.5, 0, 92.5, 92.5, 87.3, 0, 87.3, 87.3, 98.0, 92.5, 87.3, 82.4],
      },
      boss: {
        tempo: 145,
        wave: "sawtooth",
        notes: [293.7, 311.1, 392.0, 440.0, 466.2, 440.0, 392.0, 311.1, 293.7, 349.2, 415.3, 466.2, 523.3, 466.2, 415.3, 349.2],
        bass: [73.4, 73.4, 146.8, 73.4, 77.8, 77.8, 155.6, 77.8, 69.3, 69.3, 138.6, 69.3, 82.4, 77.8, 73.4, 65.4],
      },
      victory: {
        tempo: 220,
        wave: "triangle",
        notes: [523.3, 659.3, 784.0, 1046.5, 784.0, 659.3, 587.3, 784.0, 659.3, 523.3, 587.3, 698.5, 784.0, 880.0, 784.0, 659.3],
        bass: [130.8, 0, 196.0, 0, 146.8, 0, 196.0, 0, 164.8, 0, 174.6, 0, 196.0, 0, 130.8, 0],
      },
    };

    const tick = () => {
      const cfg = patterns[this.theme] || patterns.sanctuary;
      if (this.enabled && this.musicEnabled && this.ctx && this.ctx.state === "running") {
        const idx = this.stepIndex % cfg.notes.length;
        const lead = cfg.notes[idx];
        const bass = cfg.bass[idx];
        if (lead > 0) {
          this.tone(lead, (cfg.tempo / 1000) * 0.85, cfg.wave, cfg.wave === "sawtooth" ? 0.022 : 0.032);
        }
        if (bass > 0) {
          this.tone(bass, (cfg.tempo / 1000) * 0.9, "triangle", 0.035);
        }
        this.stepIndex++;
      }
      this.loopTimer = window.setTimeout(tick, cfg.tempo);
    };
    tick();
  }

  slash(step = 0) {
    const base = 420 + step * 95;
    this.tone(base, 0.085, "sawtooth", 0.09, base * 0.45);
    this.noise(0.06, 0.06, 2600);
  }

  spinSlash() {
    this.tone(360, 0.24, "sawtooth", 0.11, 920);
    this.tone(540, 0.22, "triangle", 0.08, 1180, 0.04);
    this.noise(0.18, 0.08, 3200);
  }

  bowShot() {
    this.tone(760, 0.1, "triangle", 0.08, 320);
    this.tone(1120, 0.07, "sine", 0.05, 580, 0.02);
  }

  dash() {
    this.noise(0.11, 0.07, 2200);
    this.tone(310, 0.11, "sine", 0.07, 680);
  }

  bombPlant() {
    this.tone(240, 0.09, "square", 0.06, 380);
  }

  explosion() {
    this.noise(0.34, 0.16, 780);
    this.tone(130, 0.28, "sawtooth", 0.12, 36);
  }

  hitEnemy() {
    this.tone(220, 0.08, "square", 0.09, 110);
    this.noise(0.05, 0.06, 1800);
  }

  playerHurt() {
    this.tone(190, 0.18, "sawtooth", 0.11, 78);
    this.noise(0.1, 0.08, 950);
  }

  bushCut() {
    this.noise(0.07, 0.06, 2900);
  }

  pickupShard() {
    this.tone(660, 0.07, "sine", 0.07, 880);
    this.tone(990, 0.09, "triangle", 0.06, 1320, 0.05);
  }

  pickupHeart() {
    this.tone(523.3, 0.09, "triangle", 0.08);
    this.tone(659.3, 0.12, "triangle", 0.08, 784.0, 0.07);
  }

  heal() {
    [523.3, 659.3, 784.0, 1046.5].forEach((n, idx) => {
      this.tone(n, 0.12, "sine", 0.07, null, idx * 0.06);
    });
  }

  chestOpen() {
    [392.0, 493.9, 587.3, 784.0].forEach((n, idx) => {
      this.tone(n, 0.14, "triangle", 0.085, null, idx * 0.075);
    });
  }

  shrineActivate() {
    [329.6, 440.0, 554.4, 659.3, 880.0].forEach((n, idx) => {
      this.tone(n, 0.18, "triangle", 0.09, null, idx * 0.08);
    });
  }

  warp() {
    this.tone(280, 0.28, "sine", 0.09, 1240);
    this.tone(420, 0.26, "triangle", 0.07, 1560, 0.05);
  }

  upgrade() {
    [440, 554.4, 659.3, 880].forEach((n, idx) => {
      this.tone(n, 0.11, "square", 0.06, null, idx * 0.055);
    });
  }

  bossRoar() {
    this.tone(110, 0.45, "sawtooth", 0.14, 46);
    this.noise(0.35, 0.12, 650);
  }

  victory() {
    [523.3, 659.3, 784.0, 1046.5, 1318.5].forEach((n, idx) => {
      this.tone(n, 0.22, "triangle", 0.1, null, idx * 0.09);
    });
  }
}
