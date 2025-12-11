import React, { useState } from 'react';
import { ParticipantTile } from './ParticipantTile';
import { MeetingControls } from './MeetingControls';
import { toast } from 'sonner';
import { Video, Mic, Users, Loader2, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ParticipantRole } from '@/hooks/useLiveKit';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface LiveKitHookReturn {
  room: any;
  participants: any[];
  audioEnabled: boolean;
  videoEnabled: boolean;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
}

interface MeetingRoomProps {
  roomName: string;
  roomCode?: string;
  onLeave: () => void;
  selectedRole: ParticipantRole;
  liveKitHook: LiveKitHookReturn;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ 
  roomName, 
  roomCode,
  onLeave, 
  selectedRole,
  liveKitHook 
}) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    room,
    participants,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
  } = liveKitHook;

  const joinLink = roomCode ? `${window.location.origin}/meeting-hall?code=${roomCode}` : '';

  const handleCopyLink = () => {
    if (joinLink) {
      navigator.clipboard.writeText(joinLink);
      setCopied(true);
      toast.success('تم نسخ الرابط!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toast.success('تم نسخ الكود!');
    }
  };

  const handleRaiseHand = () => {
    toast.info('تم رفع يدك! سيراك المتحدثون');
  };

  const isSpeaker = selectedRole === 'speaker';

  // Separate speakers from listeners based on track publications
  const speakers = participants.filter((p: any) => {
    const videoTrack = p?.getTrackPublication?.('camera');
    const audioTrack = p?.getTrackPublication?.('microphone');
    return videoTrack || audioTrack;
  });

  const listeners = participants.filter((p: any) => {
    const videoTrack = p?.getTrackPublication?.('camera');
    const audioTrack = p?.getTrackPublication?.('microphone');
    return !videoTrack && !audioTrack;
  });

  const isLocalParticipant = (p: any) => 
    room?.localParticipant?.identity === p?.identity;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">مشاركة الغرفة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">كود الغرفة</label>
              <div className="flex gap-2">
                <Input value={roomCode || ''} readOnly className="font-mono text-center text-lg" dir="ltr" />
                <Button variant="outline" size="icon" onClick={handleCopyCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">رابط الانضمام</label>
              <div className="flex gap-2">
                <Input value={joinLink} readOnly className="text-xs" dir="ltr" />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              شارك هذا الرابط أو الكود مع الآخرين للانضمام إلى الغرفة
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">🎥 {roomName}</h1>
          <div className="flex items-center gap-2">
            {roomCode && (
              <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)} className="gap-2">
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isSpeaker ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {isSpeaker ? '🎤 متحدث' : '👂 مستمع'}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        
        {/* Instructions for speakers */}
        {isSpeaker && !audioEnabled && !videoEnabled && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">ابدأ البث المباشر!</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    اضغط على الأزرار في الأسفل لتفعيل الميكروفون والكاميرا
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={toggleAudio} variant="default" className="gap-2">
                      <Mic className="w-4 h-4" />
                      تفعيل الصوت
                    </Button>
                    <Button onClick={toggleVideo} variant="outline" className="gap-2">
                      <Video className="w-4 h-4" />
                      تفعيل الكاميرا
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active broadcast indicator */}
        {isSpeaker && (audioEnabled || videoEnabled) && (
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <span className="font-medium text-success">أنت تبث الآن!</span>
                <div className="flex gap-2 mr-auto">
                  {audioEnabled && <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">🎤 الصوت مفعل</span>}
                  {videoEnabled && <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">📹 الكاميرا مفعلة</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Speakers section */}
        {speakers.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              المتحدثون ({speakers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {speakers.map((participant: any) => (
                <ParticipantTile
                  key={participant?.identity}
                  participant={participant}
                  isSpeaker={true}
                  isLocal={isLocalParticipant(participant)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Listeners section */}
        {listeners.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              المستمعون ({listeners.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {listeners.map((participant: any) => (
                <div
                  key={participant?.identity}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {participant?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className="text-sm text-foreground">
                    {participant?.name || 'مشارك'}
                    {isLocalParticipant(participant) && ' (أنت)'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state - waiting for broadcast */}
        {speakers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              {isSpeaker ? (
                <Video className="w-12 h-12 text-muted-foreground" />
              ) : (
                <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {isSpeaker ? 'ابدأ البث الآن!' : 'في انتظار المتحدث...'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isSpeaker 
                ? 'اضغط على زر الميكروفون أو الكاميرا في الأسفل لبدء البث المباشر'
                : 'سيبدأ البث عندما يفعل المتحدث الصوت أو الفيديو'
              }
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <MeetingControls
        role={selectedRole}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        participantCount={participants.length}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onLeave={onLeave}
        onRaiseHand={handleRaiseHand}
      />
    </div>
  );
};
