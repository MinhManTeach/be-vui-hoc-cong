import { speechService, SpeechRequestOptions } from './speechService';

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEffectsEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private bgmOsc: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public initCtx() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext policy
    }
  }

  public setSoundEffectsEnabled(enabled: boolean) {
    this.soundEffectsEnabled = enabled;
  }

  public isSoundEffectsEnabled(): boolean {
    return this.soundEffectsEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled && this.isBgmPlaying) {
      this.stopBgm();
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public setSpeechEnabled(enabled: boolean) {
    speechService.setEnabled(enabled);
  }

  public isSpeechEnabled(): boolean {
    return speechService.isEnabled();
  }

  public cancelSpeech() {
    speechService.cancel();
  }

  public speak(text: string, options?: SpeechRequestOptions) {
    return speechService.speakScoped(text, options);
  }

  public speakQuestion(
    prompt: string,
    delayMs: number = 350,
    options?: Omit<SpeechRequestOptions, 'delayMs' | 'eventType'>
  ): () => void {
    return speechService.speakQuestion(prompt, delayMs, options);
  }

  public speakRandomPraise(options?: Omit<SpeechRequestOptions, 'eventType'>): string {
    return speechService.speakRandomPraise(options);
  }

  public speakGentleRetry(options?: Omit<SpeechRequestOptions, 'eventType'>): string {
    return speechService.speakGentleRetry(options);
  }

  // Soft wooden tap / button click
  public playTap() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  // Joyful Success Arpeggio
  public playSuccess() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, this.ctx!.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.36);
      });
    } catch {}
  }

  // Gentle comfort retry sound (warm, non-punishing boing)
  public playGentleRetry() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, this.ctx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(261.63, this.ctx.currentTime + 0.25); // C4

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch {}
  }

  // Star ding / chime
  public playStar() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [1318.51, 1567.98, 2093.0]; // E6, G6, C7
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx!.currentTime + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.06);
        osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.42);
      });
    } catch {}
  }

  // XP gain ding
  public playXp() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  // Combo fanfare
  public playCombo(count: number = 3) {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const baseFreq = Math.min(1000, 440 + count * 50);
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.05);
        osc.stop(this.ctx!.currentTime + idx * 0.05 + 0.26);
      });
    } catch {}
  }

  // Chest open sound: mysterious rumble + magical sparkles
  public playChestOpen() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // Magic sparkle notes
      const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98, 1760.0];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.22, this.ctx!.currentTime + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.09 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.09);
        osc.stop(this.ctx!.currentTime + idx * 0.09 + 0.52);
      });
    } catch {}
  }

  // Level up / Special checkpoint unlock fanfare
  public playLevelUp() {
    this.playChestOpen();
    this.playStar();
  }

  // Castle Gate of 10 opening chime
  public playGateOpen() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const chords = [
        [392.0, 493.88, 587.33], // G major
        [523.25, 659.25, 783.99], // C major
      ];
      chords.forEach((chord, cIdx) => {
        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + cIdx * 0.25);

          gain.gain.setValueAtTime(0, this.ctx!.currentTime + cIdx * 0.25);
          gain.gain.linearRampToValueAtTime(0.18, this.ctx!.currentTime + cIdx * 0.25 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + cIdx * 0.25 + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(this.ctx!.currentTime + cIdx * 0.25);
          osc.stop(this.ctx!.currentTime + cIdx * 0.25 + 0.62);
        });
      });
    } catch {}
  }

  // Rocket launch whoosh
  public playRocketLaunch() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.82);
    } catch {}
  }

  // Bubble Pop
  public playPop() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  // Chomp sound for Carrot game
  public playChomp() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.13);
    } catch {}
  }

  // Train whistle toot-toot
  public playTrainToot() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      [0, 0.18].forEach((offset) => {
        const osc1 = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(587.33, this.ctx!.currentTime + offset); // D5
        osc2.frequency.setValueAtTime(739.99, this.ctx!.currentTime + offset); // F#5

        gain.gain.setValueAtTime(0, this.ctx!.currentTime + offset);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx!.currentTime + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + offset + 0.15);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx!.destination);

        osc1.start(this.ctx!.currentTime + offset);
        osc2.start(this.ctx!.currentTime + offset);
        osc1.stop(this.ctx!.currentTime + offset + 0.16);
        osc2.stop(this.ctx!.currentTime + offset + 0.16);
      });
    } catch {}
  }

  // Victory Fanfare
  public playFanfare() {
    if (!this.soundEffectsEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const chords = [
        { notes: [523.25, 659.25, 783.99], time: 0, dur: 0.15 },
        { notes: [523.25, 659.25, 783.99], time: 0.18, dur: 0.15 },
        { notes: [523.25, 659.25, 783.99], time: 0.36, dur: 0.15 },
        { notes: [698.46, 880.0, 1046.5], time: 0.54, dur: 0.5 },
      ];

      chords.forEach((chord) => {
        chord.notes.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + chord.time);

          gain.gain.setValueAtTime(0, this.ctx!.currentTime + chord.time);
          gain.gain.linearRampToValueAtTime(0.18, this.ctx!.currentTime + chord.time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + chord.time + chord.dur);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(this.ctx!.currentTime + chord.time);
          osc.stop(this.ctx!.currentTime + chord.time + chord.dur + 0.02);
        });
      });
    } catch {}
  }

  public stopBgm() {
    if (this.bgmOsc) {
      try {
        this.bgmOsc.stop();
        this.bgmOsc.disconnect();
      } catch {}
      this.bgmOsc = null;
    }
    this.isBgmPlaying = false;
  }
}

export const sound = new SoundService();
