import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  room_id: string;
  message_type: 'text' | 'image' | 'file' | 'voice' | 'system';
  reply_to_id?: string;
  is_edited: boolean;
  is_deleted: boolean;
  is_pinned: boolean;
  reactions: Record<string, string[]>;
  mentions: string[];
  created_at: string;
  updated_at: string;
  edited_at?: string;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  reply_to?: {
    id: string;
    content: string;
    sender?: {
      full_name?: string;
    };
  } | null;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  owner_id?: string | null;
  is_active: boolean;
  max_members: number | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
  unread_count?: number;
}

export interface RoomMember {
  id?: string;
  room_id: string;
  user_id: string;
  role: string;
  joined_at?: string;
  is_banned?: boolean;
  is_muted?: boolean;
  muted_until?: string | null;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useAtlantisChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [currentMember, setCurrentMember] = useState<RoomMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, any>>({});
  
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // الحصول على ملف المستخدم
  useEffect(() => {
    if (user && !currentProfile) {
      getUserProfile();
    }
  }, [user]);

  const getUserProfile = async () => {
    if (!user) return;

    try {
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (error && error.code === 'PGRST116') {
        // إنشاء ملف جديد
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            auth_user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم جديد',
            role: 'affiliate'
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }
        profile = newProfile;
      }

      setCurrentProfile(profile);
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
  };

  // تحميل الغرف
  useEffect(() => {
    if (currentProfile) {
      loadRooms();
    }
  }, [currentProfile]);

  const loadRooms = async () => {
    try {
      const { data: roomsData, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          room_members!inner(user_id)
        `)
        .eq('is_active', true)
        .eq('room_members.user_id', currentProfile.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading rooms:', error);
        return;
      }

      // تحميل عدد الأعضاء لكل غرفة
      const roomsWithCount = await Promise.all(
        (roomsData || []).map(async (room) => {
          const { count } = await supabase
            .from('room_members')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('is_banned', false);
          
          return {
            ...room,
            member_count: count || 0
          };
        })
      );

      setRooms(roomsWithCount);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  // تحميل الرسائل والانضمام للغرفة
  useEffect(() => {
    if (roomId && currentProfile) {
      const init = async () => {
        await joinRoom(roomId);
        await loadMessages();
        await loadRoomMembers();
        setupRealTimeSubscription();
      };
      init();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, currentProfile]);

  const joinRoom = async (roomId: string) => {
    if (!currentProfile) return;

    try {
      // التحقق من العضوية الحالية
      const { data: existingMember } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', currentProfile.id)
        .maybeSingle();

      if (!existingMember) {
        // الانضمام للغرفة
        const { error } = await supabase
          .from('room_members')
          .insert({
            room_id: roomId,
            user_id: currentProfile.id,
            role: 'member'
          });

        if (error) {
          console.error('Error joining room:', error);
          return;
        }
      }

      setCurrentMember(existingMember || { 
        room_id: roomId, 
        user_id: currentProfile.id, 
        role: 'member',
        is_banned: false,
        is_muted: false
      } as RoomMember);

      // تحميل معلومات الغرفة
      const { data: roomData } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle();

      setCurrentRoom(roomData);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const loadMessages = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages((messagesData || []).map((msg: any) => ({
        ...msg,
        reply_to: null // سنحمل الردود لاحقاً إذا احتجنا
      })) as ChatMessage[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoomMembers = async () => {
    if (!roomId) return;

    try {
      const { data: membersData, error } = await supabase
        .from('room_members')
        .select(`
          *,
          user:profiles!room_members_user_id_fkey(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .eq('is_banned', false);

      if (error) {
        console.error('Error loading members:', error);
        return;
      }

      setMembers((membersData || []) as RoomMember[]);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const setupRealTimeSubscription = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`chat_room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMessage: ChatMessage = {
            ...(payload.new as any),
          };
          
          // تخطي الرسائل الخاصة بنا (تم إضافتها بالفعل)
          if (newMessage.sender_id === currentProfile?.id) {
            return;
          }
          
          // تحميل معلومات المرسل
          const { data: senderData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .maybeSingle();
          
          if (senderData) {
            newMessage.sender = senderData;
          }
          
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const updatedMessage = payload.new as any;
          setMessages((prev) => prev.map(m => 
            m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const deletedId = (payload.old as any).id;
          setMessages((prev) => prev.filter(m => m.id !== deletedId));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const newState = channelRef.current.presenceState();
        setTypingUsers(newState);
      })
      .on('presence', { event: 'join' }, () => {
        // User joined the room
      })
      .on('presence', { event: 'leave' }, () => {
        // User left the room
      })
      .subscribe();
  };

  const sendMessage = async (
    content: string, 
    messageType: 'text' | 'image' | 'file' | 'voice' = 'text',
    replyToId?: string
  ) => {
    if (!currentProfile || !roomId || !content.trim()) {
      return;
    }

    // التحقق من الصمت
    if (currentMember?.is_muted && currentMember.muted_until && new Date(currentMember.muted_until) > new Date()) {
      toast({
        title: "محظور إرسال الرسائل",
        description: "أنت محظور من إرسال الرسائل حالياً",
        variant: "destructive"
      });
      return;
    }

    const trimmed = content.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // رسالة مؤقتة للواجهة
    const tempMessage: ChatMessage = {
      id: tempId,
      content: trimmed,
      sender_id: currentProfile.id,
      room_id: roomId,
      message_type: messageType,
      reply_to_id: replyToId,
      is_edited: false,
      is_deleted: false,
      is_pinned: false,
      reactions: {},
      mentions: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: {
        id: currentProfile.id,
        full_name: currentProfile.full_name,
        avatar_url: currentProfile.avatar_url
      }
    };
    
    // إضافة فورية للواجهة
    setMessages(prev => [...prev, tempMessage]);

    try {
      // إرسال للقاعدة
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content: trimmed,
          sender_id: currentProfile.id,
          room_id: roomId,
          message_type: messageType,
          reply_to_id: replyToId,
          mentions: extractMentions(trimmed)
        });

      if (error) {
        // إزالة الرسالة المؤقتة عند الخطأ
        setMessages(prev => prev.filter(m => m.id !== tempId));
        console.error('Error sending message:', error);
        toast({
          title: "خطأ في الإرسال",
          description: "لم يتم إرسال الرسالة، حاول مرة أخرى",
          variant: "destructive"
        });
        return;
      }

      // استبدال الرسالة المؤقتة
      setMessages(prev => prev.map(m => {
        if (m.id === tempId) {
          return { ...m, id: `sent-${Date.now()}` };
        }
        return m;
      }));

      // منح نقاط أتلانتس للدردشة (معطل مؤقتاً حتى يتم إنشاء جدول atlantis_user_levels)
      // if (messageType === 'text') {
      //   try {
      //     await AtlantisPointsService.addPoints({
      //       action: 'manual_add',
      //       amount: 1,
      //       metadata: {
      //         reason: 'نقطة دردشة',
      //         room_id: roomId,
      //         message_type: messageType
      //       }
      //     });
      //   } catch (pointsError) {
      //     console.log('Points service error (non-critical):', pointsError);
      //   }
      // }

    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      console.error('Error sending message:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "لم يتم إرسال الرسالة، حاول مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentProfile) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        toast({
          title: "خطأ في الحذف",
          description: "لم يتم حذف الرسالة، حاول مرة أخرى",
          variant: "destructive"
        });
      } else {
        toast({
          title: "تم الحذف",
          description: "تم حذف الرسالة بنجاح"
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!currentProfile) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: currentProfile.id,
          emoji
        });

      if (error && error.code !== '23505') { // تجاهل الخطأ إذا كان التفاعل موجود
        console.error('Error adding reaction:', error);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!currentProfile) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', currentProfile.id)
        .eq('emoji', emoji);

      if (error) {
        console.error('Error removing reaction:', error);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const startTyping = () => {
    if (!currentProfile || !channelRef.current) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    channelRef.current.track({
      user_id: currentProfile.id,
      full_name: currentProfile.full_name,
      typing: true,
      timestamp: Date.now()
    });
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!currentProfile || !channelRef.current) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    channelRef.current.track({
      user_id: currentProfile.id,
      full_name: currentProfile.full_name,
      typing: false,
      timestamp: Date.now()
    });
  };

  const canDeleteMessage = (message: ChatMessage) => {
    if (!currentProfile || !currentMember) return false;
    
    return (
      message.sender_id === currentProfile.id ||
      currentMember.role === 'admin' ||
      currentMember.role === 'owner' ||
      currentMember.role === 'moderator'
    );
  };

  const canModerateRoom = () => {
    if (!currentMember) return false;
    return ['admin', 'owner', 'moderator'].includes(currentMember.role);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // البيانات
    messages,
    rooms,
    currentRoom,
    members,
    currentMember,
    currentProfile,
    loading,
    typingUsers,

    // الأفعال
    sendMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping,
    joinRoom,
    loadRooms,

    // الصلاحيات
    canDeleteMessage,
    canModerateRoom,

    // إدارة الحالة
    setMessages
  };
};