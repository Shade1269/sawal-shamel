/**
 * Application constants for Atlantis system
 */

// Atlantis Level Constants
export const ATLANTIS_LEVELS = {
  BRONZE: 'bronze',
  SILVER: 'silver', 
  GOLD: 'gold',
  LEGENDARY: 'legendary'
} as const;

export const LEVEL_NAMES = {
  [ATLANTIS_LEVELS.BRONZE]: 'برونزي',
  [ATLANTIS_LEVELS.SILVER]: 'فضي',
  [ATLANTIS_LEVELS.GOLD]: 'ذهبي', 
  [ATLANTIS_LEVELS.LEGENDARY]: 'أسطوري'
} as const;

export const LEVEL_THRESHOLDS = {
  [ATLANTIS_LEVELS.BRONZE]: 0,
  [ATLANTIS_LEVELS.SILVER]: 500,
  [ATLANTIS_LEVELS.GOLD]: 2000,
  [ATLANTIS_LEVELS.LEGENDARY]: 5000
} as const;

// Point Values
export const POINT_VALUES = {
  SALE_COMPLETED: 10,
  NEW_CUSTOMER: 25,
  CHALLENGE_COMPLETED: 100,
  ALLIANCE_BONUS: 50
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AFFILIATE: 'affiliate',
  CUSTOMER: 'customer',
  MODERATOR: 'moderator'
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  USER_PROFILE_TTL: 5 * 60 * 1000, // 5 minutes
  LEADERBOARD_TTL: 2 * 60 * 1000,  // 2 minutes
  ALLIANCE_TTL: 3 * 60 * 1000      // 3 minutes
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  LEVEL_UP: 3000,
  NOTIFICATION: 5000
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  ATLANTIS_POINTS: 'update-atlantis-points',
  ATLANTIS_TTS: 'atlantis-tts'
} as const;
