import { useState, useCallback, useRef, useEffect } from 'react';
import { Room, RoomEvent, Participant } from 'livekit-client';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ParticipantRole = 'speaker' | 'listener';

interface LiveKitState {
  isConnected: boolean;
  isConnecting: boolean;
  room: Room | null;
  participants: Participant[];
  localRole: ParticipantRole;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export const useLiveKit = () => {
  const [state, setState] = useState<LiveKitState>({
    isConnected: false,
    isConnecting: false,
    room: null,
    participants: [],
    localRole: 'listener',
    audioEnabled: false,
    videoEnabled: false,
  });

  const roomRef = useRef<Room | null>(null);

  const updateParticipants = useCallback(() => {
    if (!roomRef.current) return;
    const allParticipants: Participant[] = [];
    
    if (roomRef.current.localParticipant) {
      allParticipants.push(roomRef.current.localParticipant);
    }
    
    roomRef.current.remoteParticipants.forEach((p) => {
      allParticipants.push(p);
    });
    
    setState(prev => ({ ...prev, participants: allParticipants }));
  }, []);

  const connect = useCallback(async (
    roomName: string,
    participantName: string,
    participantIdentity: string,
    role: ParticipantRole
  ) => {
    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      const { data, error } = await supabase.functions.invoke('livekit-token', {
        body: { roomName, participantName, participantIdentity, role }
      });

      if (error) throw error;

      const { token, url } = data;

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      room.on(RoomEvent.ParticipantConnected, updateParticipants);
      room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      room.on(RoomEvent.TrackSubscribed, updateParticipants);
      room.on(RoomEvent.TrackUnsubscribed, updateParticipants);
      room.on(RoomEvent.Disconnected, () => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          room: null,
          participants: [],
        }));
        toast.info('انقطع الاتصال بالقاعة');
      });

      await room.connect(url, token);
      roomRef.current = room;

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        room,
        localRole: role,
      }));

      updateParticipants();
      toast.success('تم الاتصال بالقاعة بنجاح');

    } catch (error) {
      console.error('Failed to connect:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
      toast.error('فشل الاتصال بالقاعة');
      throw error;
    }
  }, [updateParticipants]);

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setState({
      isConnected: false,
      isConnecting: false,
      room: null,
      participants: [],
      localRole: 'listener',
      audioEnabled: false,
      videoEnabled: false,
    });
  }, []);

  const toggleAudio = useCallback(async () => {
    if (!roomRef.current || state.localRole !== 'speaker') return;
    
    try {
      const enabled = !state.audioEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(enabled);
      setState(prev => ({ ...prev, audioEnabled: enabled }));
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      toast.error('فشل تغيير حالة الصوت');
    }
  }, [state.audioEnabled, state.localRole]);

  const toggleVideo = useCallback(async () => {
    if (!roomRef.current || state.localRole !== 'speaker') return;
    
    try {
      const enabled = !state.videoEnabled;
      await roomRef.current.localParticipant.setCameraEnabled(enabled);
      setState(prev => ({ ...prev, videoEnabled: enabled }));
    } catch (error) {
      console.error('Failed to toggle video:', error);
      toast.error('فشل تغيير حالة الفيديو');
    }
  }, [state.videoEnabled, state.localRole]);

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
  };
};
