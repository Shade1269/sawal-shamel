import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  channel_id: string;
  created_at: string;
  edited_at?: string;
  message_type: string;
  status?: string;
  reply_to_message_id?: string;
  is_pinned?: boolean;
  pinned_at?: string;
  pinned_by?: string;
  sender?: {
    id: string;
    full_name: string | null;
    email: string | null;
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

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: string;
  created_at: string;
  is_active: boolean;
}

export const useRealTimeChat = (channelId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const { user, session } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  // Get or create user profile
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
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            auth_user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم جديد'
          })
          .select()
          .single();

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

  // Load channels
  useEffect(() => {
    if (currentProfile) {
      loadChannels();
    }
  }, [currentProfile]);

  const loadChannels = async () => {
    try {
      const { data: channelsData, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading channels:', error);
        return;
      }

      setChannels(channelsData || []);
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  // Load messages for current channel (ensure membership first)
  useEffect(() => {
    if (channelId && currentProfile) {
      const init = async () => {
        await joinChannel(channelId);
        await loadMessages();
        setupRealTimeSubscription();
      };
      init();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelId, currentProfile]);

  const loadMessages = async () => {
    if (!channelId) return;

    try {
      setLoading(true);
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages((messagesData || []) as Message[]);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel(`messages:channel:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          const newMessage: Message = {
            ...(payload.new as any),
          };
          
          // Skip if it's our own message (already handled by optimistic update)
          if (newMessage.sender_id === currentProfile?.id) {
            return;
          }
          
          // Fetch sender info immediately for faster display
          let senderData = null;
          if (newMessage.sender_id) {
            const { data } = await supabase
              .from('profiles')
              .select('id, full_name, email, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();
            senderData = data;
          }
          
          if (senderData) {
            newMessage.sender = senderData;
          }
          
          setMessages((prev) => {
            // Prevent duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' | 'file' | 'voice' = 'text') => {
    if (!currentProfile || !channelId || !content.trim()) {
      return;
    }

    const trimmed = content.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // Optimistic UI update with sender info
    const tempMessage: Message = {
      id: tempId,
      content: trimmed,
      sender_id: currentProfile.id,
      channel_id: channelId,
      message_type: messageType,
      created_at: new Date().toISOString(),
      sender: {
        id: currentProfile.id,
        full_name: currentProfile.full_name,
        email: currentProfile.email,
        avatar_url: currentProfile.avatar_url
      }
    };
    
    // Immediately add to UI for instant feedback
    setMessages(prev => [...prev, tempMessage]);

    try {
      // Send to database (no need to select back - real-time will handle others)
      const { error } = await supabase
        .from('messages')
        .insert({
          content: trimmed,
          sender_id: currentProfile.id,
          channel_id: channelId,
          message_type: messageType,
          status: 'sent'
        });

      if (error) {
        // Rollback optimistic message
        setMessages(prev => prev.filter(m => m.id !== tempId));
        console.error('Error sending message:', error);
        toast({
          title: "خطأ في الإرسال",
          description: "لم يتم إرسال الرسالة، حاول مرة أخرى",
          variant: "destructive"
        });
        return;
      }

      // Message sent successfully - replace temp ID with a more permanent one
      // The actual DB message will come via real-time subscription if others are listening
      setMessages(prev => prev.map(m => {
        if (m.id === tempId) {
          return { ...m, id: `sent-${Date.now()}`, status: 'sent' };
        }
        return m;
      }));

    } catch (error) {
      // Rollback optimistic message
      setMessages(prev => prev.filter(m => m.id !== tempId));
      console.error('Error sending message:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "لم يتم إرسال الرسالة، حاول مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const joinChannel = async (channelId: string) => {
    if (!currentProfile) return;

    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', currentProfile.id)
        .single();

      if (!existingMember) {
        const { error } = await supabase
          .from('channel_members')
          .insert({
            channel_id: channelId,
            user_id: currentProfile.id,
            role: 'member'
          });

        if (error) {
          console.error('Error joining channel:', error);
        }
      }
    } catch (error) {
      console.error('Error checking/joining channel:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentProfile) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        toast({
          title: "خطأ في الحذف",
          description: "لم يتم حذف الرسالة، حاول مرة أخرى",
          variant: "destructive"
        });
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        toast({
          title: "تم الحذف",
          description: "تم حذف الرسالة بنجاح"
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return {
    messages,
    channels,
    loading,
    currentProfile,
    sendMessage,
    deleteMessage,
    joinChannel
  };
};