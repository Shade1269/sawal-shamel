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
  
  // Store connected users
  const connectedUsers = new Map();

  socket.onopen = () => {
    console.log("🔗 WebSocket connection established for real-time notifications");
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("📨 Received message:", message);

      switch (message.type) {
        case 'SUBSCRIBE_USER':
          // Subscribe user to their notifications
          connectedUsers.set(message.userId, { socket, lastSeen: new Date() });
          
          // Send initial notifications
          const { data: notifications } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', message.userId)
            .eq('read', false)
            .order('created_at', { ascending: false })
            .limit(20);

          socket.send(JSON.stringify({
            type: 'INITIAL_NOTIFICATIONS',
            notifications: notifications || []
          }));
          break;

        case 'MARK_AS_READ':
          // Mark notification as read
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', message.notificationId);

          // Broadcast to user
          socket.send(JSON.stringify({
            type: 'NOTIFICATION_READ',
            notificationId: message.notificationId
          }));
          break;

        case 'BROADCAST_NOTIFICATION':
          // Create new notification
          const { data: newNotification } = await supabase
            .from('notifications')
            .insert({
              user_id: message.targetUserId,
              title: message.title,
              message: message.message,
              type: message.notificationType || 'info',
              metadata: message.metadata || {}
            })
            .select()
            .single();

          // Send to target user if online
          const targetUser = connectedUsers.get(message.targetUserId);
          if (targetUser && newNotification) {
            targetUser.socket.send(JSON.stringify({
              type: 'NEW_NOTIFICATION',
              notification: newNotification
            }));
          }
          break;

        case 'PING':
          // Keep connection alive
          socket.send(JSON.stringify({ type: 'PONG' }));
          break;
      }
    } catch (error) {
      console.error("❌ Error processing message:", error);
      socket.send(JSON.stringify({
        type: 'ERROR',
        message: 'Failed to process message'
      }));
    }
  };

  socket.onclose = () => {
    // Remove user from connected users
    for (const [userId, userData] of connectedUsers.entries()) {
      if (userData.socket === socket) {
        connectedUsers.delete(userId);
        console.log(`👋 User ${userId} disconnected from notifications`);
        break;
      }
    }
  };

  socket.onerror = (error) => {
    console.error("🚨 WebSocket error:", error);
  };

  return response;
});
