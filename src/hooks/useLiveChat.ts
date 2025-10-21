import { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  room_id: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  created_at: string;
  metadata?: Record<string, any>;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

interface ChatUser {
  userId: string;
  isOnline: boolean;
  isTyping: boolean;
  lastSeen?: string;
}

interface UseLiveChatReturn {
  messages: ChatMessage[];
  connectedUsers: ChatUser[];
  isConnected: boolean;
  isTyping: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  sendMessage: (content: string, messageType?: string, metadata?: Record<string, any>) => void;
  startTyping: () => void;
  stopTyping: () => void;
  requestSupport: (title: string, description: string) => void;
  currentRoom: string | null;
}

export const useLiveChat = (): UseLiveChatReturn => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<ChatUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
      const wsUrl = `wss://${projectId}.functions.supabase.co/functions/v1/live-chat`;
      
      console.log('💬 Connecting to live chat WebSocket:', wsUrl);
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ Connected to live chat');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('💬 Chat message received:', data);

          switch (data.type) {
            case 'ROOM_JOINED':
              setCurrentRoom(data.roomId);
              setMessages(data.messages || []);
              
              toast({
                title: 'انضممت للغرفة',
                description: `تم الانضمام إلى غرفة ${data.roomId} بنجاح`,
              });
              break;

            case 'NEW_MESSAGE':
              setMessages(prev => [...prev, data.message]);
              
              // Play sound for messages from others
              if (data.message.user_id !== user.id) {
                // Play notification sound
                const audio = new Audio('/notification.mp3');
                audio.play().catch(() => {}); // Ignore errors
              }
              break;

            case 'USER_JOINED':
              if (data.userId !== user.id) {
                setConnectedUsers(prev => {
                  const existing = prev.find(u => u.userId === data.userId);
                  if (existing) {
                    return prev.map(u => 
                      u.userId === data.userId 
                        ? { ...u, isOnline: true }
                        : u
                    );
                  }
                  return [...prev, {
                    userId: data.userId,
                    isOnline: true,
                    isTyping: false
                  }];
                });

                toast({
                  title: 'مستخدم انضم',
                  description: 'انضم مستخدم جديد للمحادثة',
                });
              }
              break;

            case 'USER_LEFT':
              setConnectedUsers(prev => 
                prev.map(u => 
                  u.userId === data.userId 
                    ? { ...u, isOnline: false }
                    : u
                )
              );
              break;

            case 'USER_TYPING':
              setConnectedUsers(prev => 
                prev.map(u => 
                  u.userId === data.userId 
                    ? { ...u, isTyping: data.isTyping }
                    : u
                )
              );
              break;

            case 'SUPPORT_REQUEST_SENT':
              toast({
                title: 'تم إرسال طلب الدعم',
                description: 'سيتم التواصل معك قريباً',
                variant: 'default',
              });
              break;

            case 'ERROR':
              console.error('❌ Chat error:', data.message);
              toast({
                title: 'خطأ في الدردشة',
                description: data.message,
                variant: 'destructive',
              });
              break;
          }
        } catch (error) {
          console.error('❌ Error parsing chat message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 Live chat WebSocket closed:', event.code);
        setIsConnected(false);
        setCurrentRoom(null);

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
        console.error('🚨 Live chat WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Error creating chat WebSocket:', error);
    }
  }, [user?.id, toast]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (currentRoom && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'LEAVE_ROOM'
      }));
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setCurrentRoom(null);
    setMessages([]);
    setConnectedUsers([]);
  }, [currentRoom]);

  // Join a chat room
  const joinRoom = useCallback((roomId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && user?.id) {
      wsRef.current.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomId,
        userId: user.id
      }));
    }
  }, [user?.id]);

  // Leave current room
  const leaveRoom = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'LEAVE_ROOM'
      }));
    }
    setCurrentRoom(null);
    setMessages([]);
    setConnectedUsers([]);
  }, []);

  // Send a message
  const sendMessage = useCallback((
    content: string,
    messageType = 'text',
    metadata = {}
  ) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && currentRoom) {
      wsRef.current.send(JSON.stringify({
        type: 'SEND_MESSAGE',
        content,
        messageType,
        metadata
      }));
    }
  }, [currentRoom]);

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && !isTyping) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({
        type: 'TYPING_START'
      }));

      // Auto-stop typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    }
  }, [isTyping]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isTyping) {
      setIsTyping(false);
      wsRef.current.send(JSON.stringify({
        type: 'TYPING_STOP'
      }));

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [isTyping]);

  // Request support
  const requestSupport = useCallback((title: string, description: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'REQUEST_SUPPORT',
        title,
        description
      }));
    }
  }, []);

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
    messages,
    connectedUsers,
    isConnected,
    isTyping,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    requestSupport,
    currentRoom
  };
};