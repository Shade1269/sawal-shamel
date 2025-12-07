import { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface Activity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  activity_type: 'sale' | 'signup' | 'login' | 'achievement' | 'general';
  target_type?: string;
  target_id?: string;
  target_user_id?: string;
  points_earned: number;
  created_at: string;
  metadata?: Record<string, any>;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
    alliance_id?: string;
  };
  target_user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

interface LeaderboardEntry {
  userId: string;
  points: number;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
    alliance_id?: string;
  };
}

interface UseActivityFeedReturn {
  activities: Activity[];
  teamActivities: Activity[];
  leaderboard: LeaderboardEntry[];
  isConnected: boolean;
  logActivity: (
    action: string,
    description: string,
    activityType?: string,
    targetType?: string,
    targetId?: string,
    targetUserId?: string,
    pointsEarned?: number,
    metadata?: Record<string, any>
  ) => void;
  getTeamActivities: (allianceId: string) => void;
  getLeaderboard: (timeframe?: string) => void;
  refreshFeed: () => void;
}

export const useActivityFeed = (): UseActivityFeedReturn => {
  const { user } = useSupabaseAuth();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teamActivities, setTeamActivities] = useState<Activity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user?.id || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Get project ID from current URL
      const projectId = window.location.hostname.split('.')[0];
      const wsUrl = `wss://${projectId}.functions.supabase.co/functions/v1/activity-feed`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Subscribe to user activities
        wsRef.current?.send(JSON.stringify({
          type: 'SUBSCRIBE_ACTIVITIES',
          userId: user.id
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'INITIAL_ACTIVITIES':
              setActivities(data.activities || []);
              break;

            case 'NEW_ACTIVITY':
              setActivities(prev => [data.activity, ...prev.slice(0, 49)]); // Keep latest 50
              break;

            case 'ACTIVITY_LOGGED':
              // Activity successfully logged
              break;

            case 'TEAM_ACTIVITIES':
              setTeamActivities(data.activities || []);
              break;

            case 'LEADERBOARD_UPDATE':
              setLeaderboard(data.leaderboard || []);
              break;

            case 'ERROR':
              console.error('❌ Activity feed error:', data.message);
              break;
          }
        } catch (error) {
          console.error('❌ Error parsing activity message:', error);
        }
      };

      wsRef.current.onclose = (_event) => {
        setIsConnected(false);

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('🚨 Activity feed WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Error creating activity feed WebSocket:', error);
    }
  }, [user?.id]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE'
      }));
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Log a new activity
  const logActivity = useCallback((
    action: string,
    description: string,
    activityType = 'general',
    targetType?: string,
    targetId?: string,
    targetUserId?: string,
    pointsEarned = 0,
    metadata = {}
  ) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user?.id) {
      wsRef.current.send(JSON.stringify({
        type: 'LOG_ACTIVITY',
        userId: user.id,
        action,
        description,
        activityType,
        targetType,
        targetId,
        targetUserId,
        pointsEarned,
        metadata
      }));
    }
  }, [user?.id]);

  // Get team activities
  const getTeamActivities = useCallback((allianceId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'GET_TEAM_ACTIVITIES',
        allianceId
      }));
    }
  }, []);

  // Get leaderboard
  const getLeaderboard = useCallback((timeframe = '7 days ago') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'GET_LEADERBOARD_ACTIVITIES',
        timeframe
      }));
    }
  }, []);

  // Refresh the activity feed
  const refreshFeed = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user?.id) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBSCRIBE_ACTIVITIES',
        userId: user.id
      }));
    }
  }, [user?.id]);

  // Connect when user is available
  useEffect(() => {
    if (user?.id) {
      connect();
    } else {
      disconnect();
    }

    return () => disconnect();
  }, [user?.id, connect, disconnect]);

  return {
    activities,
    teamActivities,
    leaderboard,
    isConnected,
    logActivity,
    getTeamActivities,
    getLeaderboard,
    refreshFeed
  };
};