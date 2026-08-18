"use client";

class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  isMuted = false;
  
  bgmAudio: HTMLAudioElement | null = null;
  bgmFadeInterval: NodeJS.Timeout | null = null;

  init() {
    if (typeof window === 'undefined') return;
    
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/sounds/bgm_dashboard.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0;
    }

    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.4; // Default SFX volume
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    
    // Handle SFX mute
    if (this.masterGain) {
      this.masterGain.gain.value = mute ? 0 : 0.4;
    }

    // Handle BGM mute and fade
    if (!this.bgmAudio) return;
    
    if (this.bgmFadeInterval) clearInterval(this.bgmFadeInterval);
    
    if (!mute) {
      if (this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => {});
      }
      let vol = this.bgmAudio.volume;
      this.bgmFadeInterval = setInterval(() => {
        vol += 0.01;
        if (vol >= 0.04) {
          this.bgmAudio!.volume = 0.04;
          if (this.bgmFadeInterval) clearInterval(this.bgmFadeInterval);
        } else {
          this.bgmAudio!.volume = vol;
        }
      }, 50);
    } else {
      let vol = this.bgmAudio.volume;
      this.bgmFadeInterval = setInterval(() => {
        vol -= 0.01;
        if (vol <= 0) {
          this.bgmAudio!.pause();
          this.bgmAudio!.volume = 0;
          if (this.bgmFadeInterval) clearInterval(this.bgmFadeInterval);
        } else {
          this.bgmAudio!.volume = vol;
        }
      }, 50);
    }
  }

  ensureBGMPlaying() {
    if (!this.isMuted && this.bgmAudio && this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {});
      
      // Fade in if volume is 0
      if (this.bgmAudio.volume < 0.04) {
        if (this.bgmFadeInterval) clearInterval(this.bgmFadeInterval);
        let vol = this.bgmAudio.volume;
        this.bgmFadeInterval = setInterval(() => {
          vol += 0.01;
          if (vol >= 0.04) {
            this.bgmAudio!.volume = 0.04;
            if (this.bgmFadeInterval) clearInterval(this.bgmFadeInterval);
          } else {
            this.bgmAudio!.volume = vol;
          }
        }, 50);
      }
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol = 1, delay = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  playNoise(duration: number, vol = 1, delay = 0, bandpassFreq = 1000) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    
    // Create white noise buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = bandpassFreq;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start(this.ctx.currentTime + delay);
    noise.stop(this.ctx.currentTime + delay + duration);
  }

  // 1. Hover: microscopic blip
  playHover() {
    this.playTone(800, 'sine', 0.05, 0.05);
  }

  // 2. Click: soft interface click
  playClick() {
    this.playNoise(0.05, 0.1, 0, 2000);
    this.playTone(400, 'sine', 0.05, 0.05);
  }

  // 3. Correct: Chime
  playCorrect() {
    this.playTone(523.25, 'sine', 0.1, 0.3); // C5
    this.playTone(659.25, 'sine', 0.3, 0.3, 0.1); // E5
  }

  // 4. Wrong: Buzzer
  playWrong() {
    this.playTone(150, 'sawtooth', 0.3, 0.2);
    this.playTone(145, 'square', 0.3, 0.2);
  }

  // 5. LevelUp: Final Fantasy style arpeggio
  playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      this.playTone(freq, 'square', 0.15, 0.2, i * 0.1);
    });
    this.playTone(1046.50, 'sine', 0.6, 0.3, 0.4);
  }

  // 6. Unlock: Magical sweep
  playUnlock() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
    
    // sparkling noises
    this.playTone(1200, 'sine', 0.2, 0.1, 0.1);
    this.playTone(1500, 'sine', 0.2, 0.1, 0.2);
    this.playTone(1800, 'sine', 0.4, 0.1, 0.3);
  }

  // 7. Timer Tick: Wooden clock tick
  playTimerTick() {
    this.playNoise(0.03, 0.2, 0, 800);
    this.playTone(1000, 'square', 0.02, 0.03);
  }

  // 8. Drag Start: Sloop (frequency swoop up)
  playDragStart() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // 9. Drop: Soft thud
  playDrop() {
    this.playNoise(0.05, 0.3, 0, 300);
    this.playTone(100, 'sine', 0.1, 0.2);
  }

  // 10. Achievement: Tada!
  playAchievement() {
    this.playTone(523.25, 'triangle', 0.2, 0.3); // C5
    this.playTone(523.25, 'triangle', 0.4, 0.3, 0.25); // C5 again
    this.playTone(659.25, 'triangle', 0.2, 0.3, 0.65); // E5
  }

  // 11. Popup: Wind woosh
  playPopup() {
    this.playNoise(0.2, 0.05, 0, 500);
  }
}

export const sfx = new AudioEngine();
