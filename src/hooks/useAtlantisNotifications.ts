import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AtlantisPointsService, AtlantisTTSService } from '@/lib/atlantisServices';

interface AtlantisNotificationData {
  type: 'level_up' | 'points_earned' | 'achievement' | 'challenge' | 'alliance' | 'rank_up';
  title: string;
  body: string;
  points?: number;
  level?: string;
  achievement?: string;
  challenge?: string;
  rank?: number;
  playSound?: boolean;
}

export const useAtlantisNotifications = () => {
  const { toast } = useToast();

  // Check if notifications are supported and enabled
  const isNotificationEnabled = useCallback(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  }, []);

  // Send visual notification (toast)
  const showToastNotification = useCallback((data: AtlantisNotificationData) => {
    toast({
      title: data.title,
      description: data.body,
      className: 'animate-scale-in',
    });
  }, [toast]);

  // Send browser notification
  const showBrowserNotification = useCallback((data: AtlantisNotificationData) => {
    if (!isNotificationEnabled()) return;

    const getNotificationIcon = (type: string) => {
      switch (type) {
        case 'level_up':
          return '🏆';
        case 'points_earned':
          return '⭐';
        case 'achievement':
          return '🎖️';
        case 'challenge':
          return '🎯';
        case 'alliance':
          return '⚔️';
        case 'rank_up':
          return '📈';
        default:
          return '🔔';
      }
    };

    const notification = new Notification(`${getNotificationIcon(data.type)} ${data.title}`, {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: data.type === 'level_up' || data.type === 'achievement',
      data: {
        type: data.type,
        atlantisData: {
          points: data.points,
          level: data.level,
          achievement: data.achievement,
          challenge: data.challenge,
          rank: data.rank,
        }
      }
    });

    // Auto close after 5 seconds for less important notifications
    if (!['level_up', 'achievement'].includes(data.type)) {
      setTimeout(() => notification.close(), 5000);
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Navigate to Atlantis page if needed
      if (data.type === 'level_up' || data.type === 'achievement') {
        window.location.href = '/atlantis';
      }
    };
  }, [isNotificationEnabled]);

  // Play sound notification
  const playSoundNotification = useCallback(async (data: AtlantisNotificationData) => {
    if (!data.playSound) return;

    try {
      switch (data.type) {
        case 'level_up':
          if (data.level) {
            await AtlantisTTSService.playLevelUpSound(data.level);
          }
          break;
        case 'achievement':
          if (data.achievement) {
            await AtlantisTTSService.playAchievementSound(data.achievement);
          }
          break;
        case 'challenge':
          if (data.challenge) {
            await AtlantisTTSService.playNewChallengeSound(data.challenge);
          }
          break;
        case 'rank_up':
          if (data.rank) {
            await AtlantisTTSService.playRankUpSound(data.rank);
          }
          break;
        case 'points_earned':
          await AtlantisTTSService.playText(`حصلت على ${data.points} نقطة أتلانتس!`);
          break;
        default:
          await AtlantisTTSService.playText(data.body);
      }
    } catch (error) {
      console.error('Error playing sound notification:', error);
    }
  }, []);

  // Main notification function
  const sendAtlantisNotification = useCallback(async (data: AtlantisNotificationData) => {
    // Always show toast notification
    showToastNotification(data);

    // Show browser notification if enabled
    showBrowserNotification(data);

    // Play sound if requested
    if (data.playSound) {
      await playSoundNotification(data);
    }

    // Add visual effects for important notifications
    if (['level_up', 'achievement'].includes(data.type)) {
      // Add celebration animation class to body
      document.body.classList.add('celebration-mode');
      setTimeout(() => {
        document.body.classList.remove('celebration-mode');
      }, 3000);
    }
  }, [showToastNotification, showBrowserNotification, playSoundNotification]);

  // Pre-defined notification templates
  const notificationTemplates = {
    levelUp: (newLevel: string, points: number) => sendAtlantisNotification({
      type: 'level_up',
      title: '🏆 تهانينا! مستوى جديد',
      body: `وصلت إلى مستوى ${newLevel} بمجموع ${points} نقطة!`,
      level: newLevel,
      points,
      playSound: true,
    }),

    pointsEarned: (points: number, reason: string) => sendAtlantisNotification({
      type: 'points_earned',
      title: '⭐ نقاط أتلانتس جديدة',
      body: `حصلت على ${points} نقطة من ${reason}`,
      points,
      playSound: points >= 50, // Play sound for significant points
    }),

    achievement: (achievementName: string, description: string) => sendAtlantisNotification({
      type: 'achievement',
      title: '🎖️ إنجاز جديد',
      body: `حصلت على إنجاز "${achievementName}" - ${description}`,
      achievement: achievementName,
      playSound: true,
    }),

    newChallenge: (challengeName: string, description: string) => sendAtlantisNotification({
      type: 'challenge',
      title: '🎯 تحدي جديد',
      body: `تحدي جديد متاح: ${challengeName} - ${description}`,
      challenge: challengeName,
      playSound: false,
    }),

    allianceUpdate: (message: string) => sendAtlantisNotification({
      type: 'alliance',
      title: '⚔️ تحديث التحالف',
      body: message,
      playSound: false,
    }),

    rankUp: (newRank: number, totalUsers: number) => sendAtlantisNotification({
      type: 'rank_up',
      title: '📈 ترقية في الترتيب',
      body: `تقدمت إلى المرتبة ${newRank} من أصل ${totalUsers} مستخدم`,
      rank: newRank,
      playSound: true,
    }),
  };

  // Listen for Atlantis events and send notifications
  useEffect(() => {
    // Make notification functions available globally
    if (typeof window !== 'undefined') {
      (window as any).atlantisNotifications = {
        send: sendAtlantisNotification,
        templates: notificationTemplates,
      };
    }

    // Listen for custom Atlantis events
    const handleAtlantisEvent = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'level_up':
          notificationTemplates.levelUp(data.level, data.points);
          break;
        case 'points_earned':
          notificationTemplates.pointsEarned(data.points, data.reason);
          break;
        case 'achievement':
          notificationTemplates.achievement(data.name, data.description);
          break;
        case 'new_challenge':
          notificationTemplates.newChallenge(data.name, data.description);
          break;
        case 'alliance_update':
          notificationTemplates.allianceUpdate(data.message);
          break;
        case 'rank_up':
          notificationTemplates.rankUp(data.rank, data.totalUsers);
          break;
      }
    };

    window.addEventListener('atlantis-event', handleAtlantisEvent as EventListener);

    return () => {
      window.removeEventListener('atlantis-event', handleAtlantisEvent as EventListener);
    };
  }, [sendAtlantisNotification, notificationTemplates]);

  return {
    sendAtlantisNotification,
    notificationTemplates,
    isNotificationEnabled,
  };
};