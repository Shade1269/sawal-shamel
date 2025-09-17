import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let subscribedUserId = null;
  const activeSubscriptions = new Map();

  socket.onopen = () => {
    console.log("📊 Activity feed WebSocket connected");
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("🔔 Activity feed message:", message);

      switch (message.type) {
        case 'SUBSCRIBE_ACTIVITIES':
          subscribedUserId = message.userId;
          
          // Get initial activity feed
          const { data: activities } = await supabase
            .from('user_activities')
            .select(`
              *,
              user:profiles(id, username, avatar_url),
              target_user:profiles!user_activities_target_user_id_fkey(id, username, avatar_url)
            `)
            .or(`user_id.eq.${subscribedUserId},target_user_id.eq.${subscribedUserId}`)
            .order('created_at', { ascending: false })
            .limit(50);

          socket.send(JSON.stringify({
            type: 'INITIAL_ACTIVITIES',
            activities: activities || []
          }));

          // Subscribe to real-time changes
          const channel = supabase
            .channel('activity-changes')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'user_activities',
                filter: `user_id=eq.${subscribedUserId}`
              },
              async (payload) => {
                // Get full activity data with user info
                const { data: fullActivity } = await supabase
                  .from('user_activities')
                  .select(`
                    *,
                    user:profiles(id, username, avatar_url),
                    target_user:profiles!user_activities_target_user_id_fkey(id, username, avatar_url)
                  `)
                  .eq('id', payload.new.id)
                  .single();

                if (fullActivity) {
                  socket.send(JSON.stringify({
                    type: 'NEW_ACTIVITY',
                    activity: fullActivity
                  }));
                }
              }
            )
            .subscribe();

          activeSubscriptions.set(subscribedUserId, channel);
          break;

        case 'LOG_ACTIVITY':
          // Log new activity
          const { data: newActivity } = await supabase
            .from('user_activities')
            .insert({
              user_id: message.userId,
              action: message.action,
              description: message.description,
              activity_type: message.activityType || 'general',
              target_type: message.targetType,
              target_id: message.targetId,
              target_user_id: message.targetUserId,
              metadata: message.metadata || {},
              points_earned: message.pointsEarned || 0
            })
            .select(`
              *,
              user:profiles(id, username, avatar_url),
              target_user:profiles!user_activities_target_user_id_fkey(id, username, avatar_url)
            `)
            .single();

          if (newActivity) {
            // Update user points if earned
            if (message.pointsEarned > 0) {
              await supabase
                .from('profiles')
                .update({
                  atlantis_points: message.pointsEarned,
                  updated_at: new Date().toISOString()
                })
                .eq('id', message.userId);
            }

            // Broadcast to interested parties
            socket.send(JSON.stringify({
              type: 'ACTIVITY_LOGGED',
              activity: newActivity
            }));
          }
          break;

        case 'GET_TEAM_ACTIVITIES':
          // Get team/alliance activities
          const { data: teamActivities } = await supabase
            .from('user_activities')
            .select(`
              *,
              user:profiles(id, username, avatar_url, alliance_id),
              target_user:profiles!user_activities_target_user_id_fkey(id, username, avatar_url)
            `)
            .eq('profiles.alliance_id', message.allianceId)
            .order('created_at', { ascending: false })
            .limit(100);

          socket.send(JSON.stringify({
            type: 'TEAM_ACTIVITIES',
            activities: teamActivities || []
          }));
          break;

        case 'GET_LEADERBOARD_ACTIVITIES':
          // Get top activities for leaderboard
          const { data: leaderboardData } = await supabase
            .from('user_activities')
            .select(`
              user_id,
              user:profiles(id, username, avatar_url, alliance_id),
              points_earned
            `)
            .gte('created_at', message.timeframe || '7 days ago')
            .order('points_earned', { ascending: false });

          // Aggregate points by user
          const userPoints = new Map();
          leaderboardData?.forEach(activity => {
            const userId = activity.user_id;
            const points = activity.points_earned || 0;
            userPoints.set(userId, (userPoints.get(userId) || 0) + points);
          });

          // Convert to sorted array
          const leaderboard = Array.from(userPoints.entries())
            .map(([userId, points]) => ({
              userId,
              points,
              user: leaderboardData?.find(a => a.user_id === userId)?.user
            }))
            .sort((a, b) => b.points - a.points)
            .slice(0, 10);

          socket.send(JSON.stringify({
            type: 'LEADERBOARD_UPDATE',
            leaderboard
          }));
          break;

        case 'UNSUBSCRIBE':
          // Clean up subscriptions
          if (subscribedUserId && activeSubscriptions.has(subscribedUserId)) {
            const channel = activeSubscriptions.get(subscribedUserId);
            await supabase.removeChannel(channel);
            activeSubscriptions.delete(subscribedUserId);
          }
          break;
      }
    } catch (error) {
      console.error("❌ Activity feed error:", error);
      socket.send(JSON.stringify({
        type: 'ERROR',
        message: 'خطأ في تحديث الأنشطة'
      }));
    }
  };

  socket.onclose = async () => {
    // Clean up all subscriptions
    if (subscribedUserId && activeSubscriptions.has(subscribedUserId)) {
      const channel = activeSubscriptions.get(subscribedUserId);
      await supabase.removeChannel(channel);
      activeSubscriptions.delete(subscribedUserId);
    }
    console.log("📊 Activity feed connection closed");
  };

  return response;
});