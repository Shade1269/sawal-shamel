import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { toast } from 'sonner';

export interface MeetingRoom {
  id: string;
  room_code: string;
  room_name: string;
  created_by: string | null;
  is_private: boolean;
  is_active: boolean;
  max_participants: number | null;
  participant_count: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  creator_name?: string;
}

export interface CreateRoomParams {
  roomName: string;
  isPrivate: boolean;
  password?: string;
}

// Simple hash function for password
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const useMeetingRooms = () => {
  const { user } = useUnifiedAuth();
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [myRooms, setMyRooms] = useState<MeetingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Fetch the correct profile ID from profiles table (not user_profiles)
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setProfileId(data.id);
      }
    };
    fetchProfileId();
  }, [user?.id]);

  // Generate room code like Google Meet (xxx-xxxx-xxx)
  const generateRoomCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 3; i++) result += chars[Math.floor(Math.random() * 26)];
    result += '-';
    for (let i = 0; i < 4; i++) result += chars[Math.floor(Math.random() * 26)];
    result += '-';
    for (let i = 0; i < 3; i++) result += chars[Math.floor(Math.random() * 26)];
    return result;
  };

  // Fetch active public rooms (exclude ended rooms)
  const fetchRooms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_rooms')
        .select('*')
        .eq('is_active', true)
        .eq('is_private', false)
        .is('ended_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  }, []);

  // Fetch my rooms (created by me)
  const fetchMyRooms = useCallback(async () => {
    if (!profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('meeting_rooms')
        .select('*')
        .eq('created_by', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRooms(data || []);
    } catch (error) {
      console.error('Error fetching my rooms:', error);
    }
  }, [profileId]);

  // Create a new room
  const createRoom = async (params: CreateRoomParams): Promise<MeetingRoom | null> => {
    if (!profileId) {
      toast.error('يجب تسجيل الدخول أولاً');
      return null;
    }

    try {
      const roomCode = generateRoomCode();
      const passwordHash = params.password ? await hashPassword(params.password) : null;

      const { data, error } = await supabase
        .from('meeting_rooms')
        .insert({
          room_code: roomCode,
          room_name: params.roomName,
          created_by: profileId,
          is_private: params.isPrivate,
          password_hash: passwordHash,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('تم إنشاء الغرفة بنجاح');
      await fetchMyRooms();
      await fetchRooms();
      
      return data;
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast.error('فشل إنشاء الغرفة');
      return null;
    }
  };

  // Join room by code
  const joinRoom = async (roomCode: string, password?: string): Promise<MeetingRoom | null> => {
    try {
      const { data: room, error } = await supabase
        .from('meeting_rooms')
        .select('*')
        .eq('room_code', roomCode.toLowerCase())
        .eq('is_active', true)
        .single();

      if (error || !room) {
        toast.error('الغرفة غير موجودة أو منتهية');
        return null;
      }

      // Check password for private rooms
      if (room.is_private && room.password_hash) {
        if (!password) {
          toast.error('هذه غرفة خاصة، يرجى إدخال كلمة المرور');
          return null;
        }
        const hashedInput = await hashPassword(password);
        if (hashedInput !== room.password_hash) {
          toast.error('كلمة المرور غير صحيحة');
          return null;
        }
      }

      return room;
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('فشل الانضمام للغرفة');
      return null;
    }
  };

  // Record participant join
  const recordParticipant = async (roomId: string, participantName: string, role: string) => {
    if (!profileId) return null;

    try {
      const { data, error } = await supabase
        .from('meeting_participants')
        .insert({
          room_id: roomId,
          profile_id: profileId,
          participant_name: participantName,
          role: role
        })
        .select()
        .single();

      if (error) throw error;

      // Update participant count - get current and increment
      const { data: room } = await supabase
        .from('meeting_rooms')
        .select('participant_count')
        .eq('id', roomId)
        .single();

      await supabase
        .from('meeting_rooms')
        .update({ participant_count: (room?.participant_count || 0) + 1 })
        .eq('id', roomId);

      return data;
    } catch (error) {
      console.error('Error recording participant:', error);
      return null;
    }
  };

  // Record participant leave
  const recordLeave = async (participantId: string, _roomId: string) => {
    try {
      const { data: participant } = await supabase
        .from('meeting_participants')
        .select('joined_at')
        .eq('id', participantId)
        .single();

      const joinedAt = participant?.joined_at ? new Date(participant.joined_at) : new Date();
      const duration = Math.floor((Date.now() - joinedAt.getTime()) / 1000);

      await supabase
        .from('meeting_participants')
        .update({
          left_at: new Date().toISOString(),
          duration_seconds: duration
        })
        .eq('id', participantId);

    } catch (error) {
      console.error('Error recording leave:', error);
    }
  };

  // End room (creator only)
  const endRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('meeting_rooms')
        .update({
          is_active: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) throw error;
      
      toast.success('تم إنهاء الغرفة');
      await fetchMyRooms();
      await fetchRooms();
    } catch (error) {
      console.error('Error ending room:', error);
      toast.error('فشل إنهاء الغرفة');
    }
  };

  // Get meeting history
  const getMeetingHistory = async () => {
    if (!profileId) return [];

    try {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select(`
          *,
          room:meeting_rooms(*)
        `)
        .eq('profile_id', profileId)
        .order('joined_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRooms(), fetchMyRooms()]);
      setLoading(false);
    };
    init();
  }, [fetchRooms, fetchMyRooms]);

  return {
    rooms,
    myRooms,
    loading,
    createRoom,
    joinRoom,
    recordParticipant,
    recordLeave,
    endRoom,
    getMeetingHistory,
    refreshRooms: () => Promise.all([fetchRooms(), fetchMyRooms()])
  };
};
