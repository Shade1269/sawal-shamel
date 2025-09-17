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
  
  // Store room connections
  const roomConnections = new Map();
  let currentUser = null;
  let currentRoom = null;

  socket.onopen = () => {
    console.log("💬 Live chat WebSocket connection established");
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("📱 Chat message received:", message);

      switch (message.type) {
        case 'JOIN_ROOM':
          currentUser = message.userId;
          currentRoom = message.roomId;
          
          // Add to room connections
          if (!roomConnections.has(currentRoom)) {
            roomConnections.set(currentRoom, new Set());
          }
          roomConnections.get(currentRoom).add({ socket, userId: currentUser });

          // Update user presence
          await supabase
            .from('chat_room_members')
            .upsert({
              room_id: currentRoom,
              user_id: currentUser,
              is_online: true,
              last_seen: new Date().toISOString()
            });

          // Load recent messages
          const { data: recentMessages } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user:profiles(id, username, avatar_url)
            `)
            .eq('room_id', currentRoom)
            .order('created_at', { ascending: false })
            .limit(50);

          socket.send(JSON.stringify({
            type: 'ROOM_JOINED',
            roomId: currentRoom,
            messages: recentMessages?.reverse() || []
          }));

          // Notify room members of user joining
          broadcastToRoom(currentRoom, {
            type: 'USER_JOINED',
            userId: currentUser,
            timestamp: new Date().toISOString()
          }, currentUser);
          break;

        case 'SEND_MESSAGE':
          if (!currentRoom || !currentUser) return;

          // Save message to database
          const { data: newMessage } = await supabase
            .from('chat_messages')
            .insert({
              room_id: currentRoom,
              user_id: currentUser,
              content: message.content,
              message_type: message.messageType || 'text',
              metadata: message.metadata || {}
            })
            .select(`
              *,
              user:profiles(id, username, avatar_url)
            `)
            .single();

          if (newMessage) {
            // Broadcast to all room members
            broadcastToRoom(currentRoom, {
              type: 'NEW_MESSAGE',
              message: newMessage
            });
          }
          break;

        case 'TYPING_START':
          if (!currentRoom || !currentUser) return;
          
          broadcastToRoom(currentRoom, {
            type: 'USER_TYPING',
            userId: currentUser,
            isTyping: true
          }, currentUser);
          break;

        case 'TYPING_STOP':
          if (!currentRoom || !currentUser) return;
          
          broadcastToRoom(currentRoom, {
            type: 'USER_TYPING',
            userId: currentUser,
            isTyping: false
          }, currentUser);
          break;

        case 'REQUEST_SUPPORT':
          // Create support ticket and notify admins
          const { data: supportTicket } = await supabase
            .from('support_tickets')
            .insert({
              user_id: currentUser,
              title: message.title || 'طلب دعم فوري',
              description: message.description,
              priority: 'high',
              status: 'open'
            })
            .select()
            .single();

          // Notify support team
          const { data: adminUsers } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin');

          for (const admin of adminUsers || []) {
            await supabase
              .from('notifications')
              .insert({
                user_id: admin.id,
                title: '🆘 طلب دعم عاجل',
                message: `مستخدم يطلب المساعدة: ${message.title}`,
                type: 'support_request',
                metadata: { ticketId: supportTicket?.id }
              });
          }
          break;

        case 'LEAVE_ROOM':
          if (currentRoom && currentUser) {
            // Remove from room connections
            const roomSockets = roomConnections.get(currentRoom);
            if (roomSockets) {
              roomSockets.forEach(conn => {
                if (conn.userId === currentUser) {
                  roomSockets.delete(conn);
                }
              });
            }

            // Update presence
            await supabase
              .from('chat_room_members')
              .update({
                is_online: false,
                last_seen: new Date().toISOString()
              })
              .eq('room_id', currentRoom)
              .eq('user_id', currentUser);

            // Notify others
            broadcastToRoom(currentRoom, {
              type: 'USER_LEFT',
              userId: currentUser
            }, currentUser);
          }
          break;
      }
    } catch (error) {
      console.error("❌ Error in live chat:", error);
      socket.send(JSON.stringify({
        type: 'ERROR',
        message: 'خطأ في معالجة الرسالة'
      }));
    }
  };

  // Broadcast message to all users in a room except sender
  function broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    const roomSockets = roomConnections.get(roomId);
    if (!roomSockets) return;

    const messageStr = JSON.stringify(message);
    roomSockets.forEach(conn => {
      if (!excludeUserId || conn.userId !== excludeUserId) {
        try {
          conn.socket.send(messageStr);
        } catch (error) {
          console.error("Error sending message to socket:", error);
          roomSockets.delete(conn);
        }
      }
    });
  }

  socket.onclose = () => {
    // Clean up on disconnect
    if (currentRoom && currentUser) {
      const roomSockets = roomConnections.get(currentRoom);
      if (roomSockets) {
        roomSockets.forEach(conn => {
          if (conn.userId === currentUser) {
            roomSockets.delete(conn);
          }
        });
      }

      // Update presence
      supabase
        .from('chat_room_members')
        .update({
          is_online: false,
          last_seen: new Date().toISOString()
        })
        .eq('room_id', currentRoom)
        .eq('user_id', currentUser);
    }
    console.log("👋 Live chat connection closed");
  };

  return response;
});