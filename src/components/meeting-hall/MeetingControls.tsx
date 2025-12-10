import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Users, Hand 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParticipantRole } from '@/hooks/useLiveKit';

interface MeetingControlsProps {
  role: ParticipantRole;
  audioEnabled: boolean;
  videoEnabled: boolean;
  participantCount: number;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
  onRaiseHand?: () => void;
}

export const MeetingControls: React.FC<MeetingControlsProps> = ({
  role,
  audioEnabled,
  videoEnabled,
  participantCount,
  onToggleAudio,
  onToggleVideo,
  onLeave,
  onRaiseHand,
}) => {
  const isSpeaker = role === 'speaker';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left: Participant count */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">{participantCount} مشارك</span>
        </div>

        {/* Center: Main controls */}
        <div className="flex items-center gap-3">
          {isSpeaker ? (
            <>
              <Button
                variant={audioEnabled ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={onToggleAudio}
              >
                {audioEnabled ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>

              <Button
                variant={videoEnabled ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={onToggleVideo}
              >
                {videoEnabled ? (
                  <Video className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={onRaiseHand}
            >
              <Hand className="w-6 h-6" />
            </Button>
          )}

          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={onLeave}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>

        {/* Right: Role indicator */}
        <div className={cn(
          "px-4 py-2 rounded-full text-sm font-medium",
          isSpeaker 
            ? "bg-primary/20 text-primary" 
            : "bg-muted text-muted-foreground"
        )}>
          {isSpeaker ? 'متحدث' : 'مستمع'}
        </div>
      </div>
    </div>
  );
};
