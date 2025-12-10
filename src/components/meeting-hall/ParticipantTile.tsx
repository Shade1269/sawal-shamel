import React, { useEffect, useRef } from 'react';
import { Participant, Track } from 'livekit-client';
import { Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantTileProps {
  participant: Participant;
  isSpeaker?: boolean;
  isLocal?: boolean;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({
  participant,
  isSpeaker = false,
  isLocal = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const videoTrack = participant.getTrackPublication(Track.Source.Camera);
  const audioTrack = participant.getTrackPublication(Track.Source.Microphone);

  const hasVideo = videoTrack?.isSubscribed && !videoTrack.isMuted;
  const hasAudio = audioTrack?.isSubscribed && !audioTrack.isMuted;

  useEffect(() => {
    if (videoRef.current && videoTrack?.track) {
      videoTrack.track.attach(videoRef.current);
    }
    return () => {
      if (videoTrack?.track) {
        videoTrack.track.detach();
      }
    };
  }, [videoTrack]);

  useEffect(() => {
    if (audioRef.current && audioTrack?.track && !isLocal) {
      audioTrack.track.attach(audioRef.current);
    }
    return () => {
      if (audioTrack?.track) {
        audioTrack.track.detach();
      }
    };
  }, [audioTrack, isLocal]);

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-card border border-border",
        isSpeaker ? "ring-2 ring-primary" : "",
        "aspect-video"
      )}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">
              {participant.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
        </div>
      )}

      <audio ref={audioRef} autoPlay />

      {/* Overlay with participant info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSpeaker && (
              <Crown className="w-4 h-4 text-warning" />
            )}
            <span className="text-white text-sm font-medium truncate">
              {participant.name || 'مشارك'}
              {isLocal && ' (أنت)'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {hasAudio ? (
              <Mic className="w-4 h-4 text-success" />
            ) : (
              <MicOff className="w-4 h-4 text-destructive" />
            )}
            {isSpeaker && (
              hasVideo ? (
                <Video className="w-4 h-4 text-success" />
              ) : (
                <VideoOff className="w-4 h-4 text-destructive" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
