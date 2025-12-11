import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ParticipantRole = 'speaker' | 'listener';

// Session storage key
const SESSION_KEY = 'livekit_session';

// Session data interface
interface SessionData {
  roomName: string;
  participantName: string;
  participantIdentity: string;
  role: ParticipantRole;
  timestamp: number;
}

// Define types without importing from livekit-client directly
interface LiveKitRoom {
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => Promise<void>;
  localParticipant: any;
  remoteParticipants: Map<string, any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

interface LiveKitState {
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  room: LiveKitRoom | null;
  participants: any[];
  localRole: ParticipantRole;
  audioEnabled: boolean;
  videoEnabled: boolean;
  liveKitLoaded: boolean;
}

// Helper functions for session storage
const saveSession = (data: SessionData) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save session:', e);
  }
};

const getSession = (): SessionData | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session = JSON.parse(data) as SessionData;
    // Session expires after 1 hour
    if (Date.now() - session.timestamp > 60 * 60 * 1000) {
      clearSession();
      return null;
    }
    return session;
  } catch (e) {
    return null;
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.warn('Failed to clear session:', e);
  }
};

export const useLiveKit = () => {
  const [state, setState] = useState<LiveKitState>({
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    room: null,
    participants: [],
    localRole: 'listener',
    audioEnabled: false,
    videoEnabled: false,
    liveKitLoaded: false,
  });

  const roomRef = useRef<LiveKitRoom | null>(null);
  const liveKitModuleRef = useRef<any>(null);

  // Load LiveKit dynamically
  const loadLiveKit = useCallback(async () => {
    if (liveKitModuleRef.current) return liveKitModuleRef.current;
    
    try {
      const livekit = await import('livekit-client');
      liveKitModuleRef.current = livekit;
      setState(prev => ({ ...prev, liveKitLoaded: true }));
      return livekit;
    } catch (error) {
      console.error('Failed to load LiveKit:', error);
      toast.error('فشل تحميل مكتبة الفيديو');
      throw error;
    }
  }, []);

  const updateParticipants = useCallback(() => {
    if (!roomRef.current) return;
    const allParticipants: any[] = [];
    
    if (roomRef.current.localParticipant) {
      allParticipants.push(roomRef.current.localParticipant);
    }
    
    roomRef.current.remoteParticipants.forEach((p: any) => {
      allParticipants.push(p);
    });
    
    setState(prev => ({ ...prev, participants: allParticipants }));
  }, []);

  const reconnect = useCallback(async (session: SessionData) => {
    console.log('Attempting to reconnect...', session);
    setState(prev => ({ ...prev, isReconnecting: true }));

    try {
      const livekit = await loadLiveKit();
      const { Room, RoomEvent } = livekit;

      const { data, error } = await supabase.functions.invoke('livekit-token', {
        body: { 
          roomName: session.roomName, 
          participantName: session.participantName, 
          participantIdentity: session.participantIdentity, 
          role: session.role 
        }
      });

      if (error) throw error;

      const { token } = data;
      // Remove trailing slash from URL if present
      const url = data.url.replace(/\/$/, '');

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        reconnectPolicy: {
          maxRetries: 5,
          retryBackoff: (retryCount: number) => Math.min(1000 * Math.pow(2, retryCount), 10000),
        }
      });

      room.on(RoomEvent.ParticipantConnected, updateParticipants);
      room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      room.on(RoomEvent.TrackSubscribed, updateParticipants);
      room.on(RoomEvent.TrackUnsubscribed, updateParticipants);
      room.on(RoomEvent.Reconnecting, () => {
        console.log('Room is reconnecting...');
        setState(prev => ({ ...prev, isReconnecting: true }));
        toast.info('جاري إعادة الاتصال...');
      });
      room.on(RoomEvent.Reconnected, () => {
        console.log('Room reconnected successfully');
        setState(prev => ({ ...prev, isReconnecting: false }));
        toast.success('تم إعادة الاتصال بنجاح');
      });
      room.on(RoomEvent.Disconnected, (reason?: any) => {
        console.error('Room disconnected (reconnect), reason:', reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isReconnecting: false,
          room: null,
          participants: [],
        }));
        clearSession();
        const reasonText = reason ? `: ${reason}` : '';
        toast.info(`انقطع الاتصال بالقاعة${reasonText}`);
      });

      await room.connect(url, token);
      roomRef.current = room;

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        isReconnecting: false,
        room,
        localRole: session.role,
      }));

      updateParticipants();
      toast.success('تم إعادة الاتصال بالقاعة');

    } catch (error) {
      console.error('Failed to reconnect:', error);
      setState(prev => ({ ...prev, isReconnecting: false }));
      clearSession();
      toast.error('فشل إعادة الاتصال');
    }
  }, [updateParticipants, loadLiveKit]);

  const connect = useCallback(async (
    roomName: string,
    participantName: string,
    participantIdentity: string,
    role: ParticipantRole
  ) => {
    setState(prev => ({ ...prev, isConnecting: true }));

    try {
      // Load LiveKit dynamically
      const livekit = await loadLiveKit();
      const { Room, RoomEvent } = livekit;

      const { data, error } = await supabase.functions.invoke('livekit-token', {
        body: { roomName, participantName, participantIdentity, role }
      });

      if (error) throw error;
      if (!data?.token || !data?.url) {
        throw new Error('Invalid response from token service');
      }

      const { token } = data;
      // Remove trailing slash from URL if present
      const url = data.url.replace(/\/$/, '');
      console.log('Connecting to LiveKit URL:', url);

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        reconnectPolicy: {
          maxRetries: 5,
          retryBackoff: (retryCount: number) => Math.min(1000 * Math.pow(2, retryCount), 10000),
        }
      });

      room.on(RoomEvent.ParticipantConnected, updateParticipants);
      room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      room.on(RoomEvent.TrackSubscribed, updateParticipants);
      room.on(RoomEvent.TrackUnsubscribed, updateParticipants);
      room.on(RoomEvent.Reconnecting, () => {
        console.log('Room is reconnecting...');
        setState(prev => ({ ...prev, isReconnecting: true }));
        toast.info('جاري إعادة الاتصال...');
      });
      room.on(RoomEvent.Reconnected, () => {
        console.log('Room reconnected successfully');
        setState(prev => ({ ...prev, isReconnecting: false }));
        toast.success('تم إعادة الاتصال بنجاح');
      });
      room.on(RoomEvent.Disconnected, (reason?: any) => {
        console.error('Room disconnected, reason:', reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isReconnecting: false,
          room: null,
          participants: [],
        }));
        clearSession();
        const reasonText = reason ? `: ${reason}` : '';
        toast.info(`انقطع الاتصال بالقاعة${reasonText}`);
      });

      await room.connect(url, token);
      roomRef.current = room;

      // Save session for recovery
      saveSession({
        roomName,
        participantName,
        participantIdentity,
        role,
        timestamp: Date.now(),
      });

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
  }, [updateParticipants, loadLiveKit]);

  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    clearSession();
    setState({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      room: null,
      participants: [],
      localRole: 'listener',
      audioEnabled: false,
      videoEnabled: false,
      liveKitLoaded: state.liveKitLoaded,
    });
  }, [state.liveKitLoaded]);

  // Check for saved session on mount
  const checkSavedSession = useCallback(() => {
    const session = getSession();
    return session;
  }, []);

  const toggleAudio = useCallback(async () => {
    if (!roomRef.current) {
      console.warn('Room not connected, cannot toggle audio');
      toast.error('الغرفة غير متصلة');
      return;
    }
    
    if (!roomRef.current.localParticipant) {
      console.warn('Local participant not ready');
      toast.error('المشارك المحلي غير جاهز');
      return;
    }
    
    try {
      const enabled = !state.audioEnabled;
      console.log('Toggling audio to:', enabled);
      await roomRef.current.localParticipant.setMicrophoneEnabled(enabled);
      setState(prev => ({ ...prev, audioEnabled: enabled }));
      toast.success(enabled ? 'تم تفعيل الميكروفون' : 'تم إيقاف الميكروفون');
    } catch (error: any) {
      console.error('Failed to toggle audio:', error);
      if (error?.name === 'NotAllowedError') {
        toast.error('يرجى السماح بالوصول للميكروفون من إعدادات المتصفح');
      } else if (error?.name === 'NotFoundError') {
        toast.error('لم يتم العثور على ميكروفون');
      } else {
        toast.error('فشل تغيير حالة الصوت: ' + (error?.message || 'خطأ غير معروف'));
      }
    }
  }, [state.audioEnabled]);

  const toggleVideo = useCallback(async () => {
    if (!roomRef.current) {
      console.warn('Room not connected, cannot toggle video');
      toast.error('الغرفة غير متصلة');
      return;
    }
    
    if (!roomRef.current.localParticipant) {
      console.warn('Local participant not ready');
      toast.error('المشارك المحلي غير جاهز');
      return;
    }
    
    try {
      const enabled = !state.videoEnabled;
      console.log('Toggling video to:', enabled);
      await roomRef.current.localParticipant.setCameraEnabled(enabled);
      setState(prev => ({ ...prev, videoEnabled: enabled }));
      toast.success(enabled ? 'تم تفعيل الكاميرا' : 'تم إيقاف الكاميرا');
    } catch (error: any) {
      console.error('Failed to toggle video:', error);
      if (error?.name === 'NotAllowedError') {
        toast.error('يرجى السماح بالوصول للكاميرا من إعدادات المتصفح');
      } else if (error?.name === 'NotFoundError') {
        toast.error('لم يتم العثور على كاميرا');
      } else {
        toast.error('فشل تغيير حالة الفيديو: ' + (error?.message || 'خطأ غير معروف'));
      }
    }
  }, [state.videoEnabled]);

  // Warn before closing tab/window
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isConnected) {
        e.preventDefault();
        e.returnValue = 'أنت متصل بغرفة اجتماع. هل تريد المغادرة؟';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, [state.isConnected]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    toggleAudio,
    toggleVideo,
    checkSavedSession,
    clearSession,
  };
};
