import { useEffect, useRef } from 'react';

interface NotificationSoundProps {
  enabled?: boolean;
  onNewMessage?: boolean;
  onMention?: boolean;
}

const NotificationSound: React.FC<NotificationSoundProps> = ({ 
  enabled = true, 
  onNewMessage = false,
  onMention = false 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // إنشاء ملف صوتي بسيط للإشعارات
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // إنشاء تون بسيط للإشعار
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };

    const createMentionSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // صوت أكثر تميزاً للمنشن
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
      
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.4);
      oscillator2.stop(audioContext.currentTime + 0.4);
    };

    if (enabled && onNewMessage) {
      createNotificationSound();
    }

    if (enabled && onMention) {
      createMentionSound();
    }
  }, [enabled, onNewMessage, onMention]);

  // يمكن أيضاً استخدام ملف صوتي خارجي
  const _playNotificationFromFile = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(console.error);
    }
  };

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
    >
      {/* يمكن إضافة ملف صوتي هنا إذا كان متوفراً */}
      {/* <source src="/notification.mp3" type="audio/mpeg" /> */}
    </audio>
  );
};

export default NotificationSound;