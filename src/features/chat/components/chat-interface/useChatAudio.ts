import { useState } from 'react';

/**
 * Custom hook لإدارة تشغيل الرسائل الصوتية
 * Manages voice message playback
 */
export function useChatAudio() {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const playAudio = (url: string, messageId: string) => {
    if (playingAudio === messageId) {
      // Stop current audio
      const audio = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio) {
        const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      // Play new audio
      const audio = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
      if (audio) {
        audio.play();
        setPlayingAudio(messageId);
        audio.onended = () => setPlayingAudio(null);
      }
    }
  };

  return { playingAudio, playAudio };
}
