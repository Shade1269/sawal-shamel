import React from 'react';
import { ParticipantTile } from './ParticipantTile';
import { MeetingControls } from './MeetingControls';
import { useLiveKit } from '@/hooks/useLiveKit';
import { Participant, Track } from 'livekit-client';
import { toast } from 'sonner';

interface MeetingRoomProps {
  roomName: string;
  onLeave: () => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ roomName, onLeave }) => {
  const {
    room,
    participants,
    localRole,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    disconnect,
  } = useLiveKit();

  const handleLeave = async () => {
    await disconnect();
    onLeave();
  };

  const handleRaiseHand = () => {
    toast.info('تم رفع يدك! سيراك المتحدثون');
  };

  // Separate speakers from listeners based on track publications
  const speakers = participants.filter(p => {
    const videoTrack = p.getTrackPublication(Track.Source.Camera);
    const audioTrack = p.getTrackPublication(Track.Source.Microphone);
    return videoTrack || audioTrack;
  });

  const listeners = participants.filter(p => {
    const videoTrack = p.getTrackPublication(Track.Source.Camera);
    const audioTrack = p.getTrackPublication(Track.Source.Microphone);
    return !videoTrack && !audioTrack;
  });

  const isLocalParticipant = (p: Participant) => 
    room?.localParticipant.identity === p.identity;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">{roomName}</h1>
          <span className="text-sm text-muted-foreground">
            قاعة الاجتماعات
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Speakers section */}
        {speakers.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              المتحدثون ({speakers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {speakers.map((participant) => (
                <ParticipantTile
                  key={participant.identity}
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
            <h2 className="text-lg font-semibold text-foreground mb-4">
              المستمعون ({listeners.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {listeners.map((participant) => (
                <div
                  key={participant.identity}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {participant.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className="text-sm text-foreground">
                    {participant.name || 'مشارك'}
                    {isLocalParticipant(participant) && ' (أنت)'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {participants.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              لا يوجد مشاركون في القاعة حالياً
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <MeetingControls
        role={localRole}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        participantCount={participants.length}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onLeave={handleLeave}
        onRaiseHand={handleRaiseHand}
      />
    </div>
  );
};
