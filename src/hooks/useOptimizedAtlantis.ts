import { useMemo } from 'react';
import { useAtlantisSystem, UserLevel, Alliance, LeaderboardEntry } from './useAtlantisSystem';
import { memoize } from '@/utils/performance';

/**
 * Optimized version of Atlantis hooks with performance enhancements
 */

// Memoized level calculations
const calculateLevelProgress = memoize((level: UserLevel | null) => {
  if (!level) return null;
  
  const progressPercentage = Math.min(
    (level.total_points / level.next_level_threshold) * 100,
    100
  );
  
  const pointsToNext = Math.max(
    level.next_level_threshold - level.total_points,
    0
  );
  
  return {
    progressPercentage,
    pointsToNext,
    isMaxLevel: level.current_level === 'legendary'
  };
});

// Memoized level styling
const getLevelStyling = memoize((level: string) => {
  const styles = {
    bronze: {
      color: 'from-orange-400 to-orange-600',
      name: 'برونزي',
      badge: 'bg-warning/10 text-warning'
    },
    silver: {
      color: 'from-gray-300 to-gray-500',
      name: 'فضي',
      badge: 'bg-muted text-muted-foreground'
    },
    gold: {
      color: 'from-yellow-400 to-yellow-600',
      name: 'ذهبي',
      badge: 'bg-premium/10 text-premium'
    },
    legendary: {
      color: 'from-purple-500 to-purple-600',
      name: 'أسطوري',
      badge: 'bg-accent/10 text-accent'
    }
  };
  
  return styles[level as keyof typeof styles] || styles.bronze;
});

// Optimized leaderboard processing
const processLeaderboard = memoize((entries: LeaderboardEntry[]) => {
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    isTopThree: index < 3,
    medalType: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null
  }));
});

export const useOptimizedAtlantis = () => {
  const atlantisData = useAtlantisSystem();
  
  // Memoized calculations
  const levelProgress = useMemo(
    () => calculateLevelProgress(atlantisData.userLevel),
    [atlantisData.userLevel]
  );
  
  const levelStyling = useMemo(
    () => atlantisData.userLevel ? getLevelStyling(atlantisData.userLevel.current_level) : null,
    [atlantisData.userLevel?.current_level]
  );
  
  const processedLeaderboard = useMemo(
    () => processLeaderboard(atlantisData.weeklyLeaderboard),
    [atlantisData.weeklyLeaderboard]
  );
  
  const allianceStats = useMemo(() => {
    if (!atlantisData.userAlliance || !atlantisData.userMembership) return null;
    
    return {
      alliance: atlantisData.userAlliance,
      membership: atlantisData.userMembership,
      isLeader: atlantisData.userMembership.role === 'leader',
      canLeave: atlantisData.userMembership.role !== 'leader'
    };
  }, [atlantisData.userAlliance, atlantisData.userMembership]);
  
  return {
    ...atlantisData,
    levelProgress,
    levelStyling,
    processedLeaderboard,
    allianceStats
  };
};