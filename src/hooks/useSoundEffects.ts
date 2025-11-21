import { useCallback, useRef, useEffect } from 'react';
import { useGamingSettings } from '@/contexts/GamingSettingsContext';

/**
 * Sound Effects System
 * نظام أصوات gaming-style
 *
 * الأصوات يتم توليدها باستخدام Web Audio API
 * بدون الحاجة لملفات خارجية
 */

type SoundType =
  | 'hover'
  | 'click'
  | 'addToCart'
  | 'purchase'
  | 'achievement'
  | 'levelUp'
  | 'error'
  | 'notification'
  | 'combo';

export const useSoundEffects = () => {
  const { settings } = useGamingSettings();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize Audio Context on user interaction
    if (settings.enableSoundEffects && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [settings.enableSoundEffects]);

  const playSound = useCallback((type: SoundType) => {
    if (!settings.enableSoundEffects || !audioContextRef.current) {
      return;
    }

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const volume = settings.soundVolume / 100;

    try {
      switch (type) {
        case 'hover':
          // Subtle whoosh sound
          const hoverOsc = ctx.createOscillator();
          const hoverGain = ctx.createGain();
          hoverOsc.connect(hoverGain);
          hoverGain.connect(ctx.destination);

          hoverOsc.frequency.setValueAtTime(800, now);
          hoverOsc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
          hoverGain.gain.setValueAtTime(volume * 0.1, now);
          hoverGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

          hoverOsc.start(now);
          hoverOsc.stop(now + 0.1);
          break;

        case 'click':
          // Sharp click sound
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          clickOsc.connect(clickGain);
          clickGain.connect(ctx.destination);

          clickOsc.frequency.setValueAtTime(1000, now);
          clickGain.gain.setValueAtTime(volume * 0.2, now);
          clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

          clickOsc.start(now);
          clickOsc.stop(now + 0.05);
          break;

        case 'addToCart':
          // Power-up sound
          const cartOsc = ctx.createOscillator();
          const cartGain = ctx.createGain();
          cartOsc.connect(cartGain);
          cartGain.connect(ctx.destination);

          cartOsc.frequency.setValueAtTime(200, now);
          cartOsc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
          cartGain.gain.setValueAtTime(volume * 0.3, now);
          cartGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

          cartOsc.start(now);
          cartOsc.stop(now + 0.2);
          break;

        case 'purchase':
          // Victory sound - 3 ascending tones
          [400, 500, 600].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const startTime = now + (i * 0.1);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(volume * 0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            osc.start(startTime);
            osc.stop(startTime + 0.2);
          });
          break;

        case 'achievement':
          // Fanfare sound
          [300, 400, 500, 600, 700].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const startTime = now + (i * 0.08);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(volume * 0.25, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
          });
          break;

        case 'levelUp':
          // Rising arpeggio
          [200, 250, 300, 400, 500, 600, 800].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const startTime = now + (i * 0.05);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(volume * 0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            osc.start(startTime);
            osc.stop(startTime + 0.15);
          });
          break;

        case 'error':
          // Error buzz
          const errorOsc = ctx.createOscillator();
          const errorGain = ctx.createGain();
          errorOsc.connect(errorGain);
          errorGain.connect(ctx.destination);

          errorOsc.type = 'sawtooth';
          errorOsc.frequency.setValueAtTime(150, now);
          errorOsc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
          errorGain.gain.setValueAtTime(volume * 0.2, now);
          errorGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

          errorOsc.start(now);
          errorOsc.stop(now + 0.3);
          break;

        case 'notification':
          // Bell-like sound
          const notifOsc = ctx.createOscillator();
          const notifGain = ctx.createGain();
          notifOsc.connect(notifGain);
          notifGain.connect(ctx.destination);

          notifOsc.frequency.setValueAtTime(1000, now);
          notifGain.gain.setValueAtTime(volume * 0.3, now);
          notifGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

          notifOsc.start(now);
          notifOsc.stop(now + 0.4);
          break;

        case 'combo':
          // Multi-tone combo sound
          [600, 700, 800, 900, 1000, 1100].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const startTime = now + (i * 0.03);
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(volume * 0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

            osc.start(startTime);
            osc.stop(startTime + 0.1);
          });
          break;
      }
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }, [settings.enableSoundEffects, settings.soundVolume]);

  return {
    playSound,
    enabled: settings.enableSoundEffects,
  };
};
