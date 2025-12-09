import { useEffect, useRef, useCallback } from 'react';

// ============== مدير الأصوات ==============
class GameAudioManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.5;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  // صوت النقر
  playClick() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(800, 0.05, 'sine');
  }
  
  // صوت التحديد
  playSelect() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(600, 0.1, 'sine');
    setTimeout(() => this.playTone(900, 0.08, 'sine'), 50);
  }
  
  // صوت الإرسال
  playSend() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(400, 0.15, 'triangle');
    setTimeout(() => this.playTone(500, 0.12, 'triangle'), 80);
    setTimeout(() => this.playTone(700, 0.1, 'triangle'), 160);
  }
  
  // صوت النصر
  playVictory() {
    if (!this.enabled || !this.audioContext) return;
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 100);
    });
  }
  
  // صوت الهزيمة
  playDefeat() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(300, 0.3, 'sawtooth');
    setTimeout(() => this.playTone(200, 0.4, 'sawtooth'), 200);
  }
  
  // صوت الاكتشاف
  playDiscover() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(440, 0.1, 'sine');
    setTimeout(() => this.playTone(550, 0.1, 'sine'), 100);
    setTimeout(() => this.playTone(660, 0.15, 'sine'), 200);
  }
  
  // صوت جمع الموارد
  playGather() {
    if (!this.enabled || !this.audioContext) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.playTone(800 + i * 100, 0.05, 'sine'), i * 50);
    }
  }
  
  // صوت المعركة
  playBattle() {
    if (!this.enabled || !this.audioContext) return;
    // أصوات السيوف
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playNoise(0.1);
        this.playTone(200 + Math.random() * 200, 0.05, 'sawtooth');
      }, i * 100);
    }
  }
  
  // صوت الموسيقى الخلفية (محاكاة بسيطة)
  playAmbient() {
    if (!this.enabled || !this.audioContext) return;
    // نغمة خلفية هادئة
    const playNote = () => {
      if (!this.enabled) return;
      const notes = [220, 277, 330, 392, 440];
      const note = notes[Math.floor(Math.random() * notes.length)];
      this.playTone(note, 0.5, 'sine', 0.1);
    };
    
    playNote();
    setInterval(playNote, 3000);
  }
  
  private playTone(frequency: number, duration: number, type: OscillatorType, volume?: number) {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      const vol = (volume ?? this.masterVolume) * 0.3;
      gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }
  
  private playNoise(duration: number) {
    if (!this.audioContext) return;
    
    try {
      const bufferSize = this.audioContext.sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      source.buffer = buffer;
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.setValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      source.start();
    } catch (e) {
      console.warn('Noise playback failed:', e);
    }
  }
}

// ============== مثيل واحد ==============
let audioManagerInstance: GameAudioManager | null = null;

export const getAudioManager = (): GameAudioManager => {
  if (!audioManagerInstance) {
    audioManagerInstance = new GameAudioManager();
  }
  return audioManagerInstance;
};

// ============== هوك React ==============
export const useGameSounds = (enabled: boolean = true) => {
  const audioManager = useRef(getAudioManager());
  
  useEffect(() => {
    audioManager.current.setEnabled(enabled);
  }, [enabled]);
  
  const playClick = useCallback(() => audioManager.current.playClick(), []);
  const playSelect = useCallback(() => audioManager.current.playSelect(), []);
  const playSend = useCallback(() => audioManager.current.playSend(), []);
  const playVictory = useCallback(() => audioManager.current.playVictory(), []);
  const playDefeat = useCallback(() => audioManager.current.playDefeat(), []);
  const playDiscover = useCallback(() => audioManager.current.playDiscover(), []);
  const playGather = useCallback(() => audioManager.current.playGather(), []);
  const playBattle = useCallback(() => audioManager.current.playBattle(), []);
  
  return {
    playClick,
    playSelect,
    playSend,
    playVictory,
    playDefeat,
    playDiscover,
    playGather,
    playBattle,
  };
};
