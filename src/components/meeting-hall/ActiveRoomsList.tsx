import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, Lock, ArrowLeft } from 'lucide-react';
import type { MeetingRoom } from '@/hooks/useMeetingRooms';

interface ActiveRoomsListProps {
  rooms: MeetingRoom[];
  loading: boolean;
  onJoinRoom: (room: MeetingRoom) => void;
}

export const ActiveRoomsList: React.FC<ActiveRoomsListProps> = ({
  rooms,
  loading,
  onJoinRoom
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            الغرف النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            الغرف النشطة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد غرف نشطة حالياً</p>
            <p className="text-sm">كن أول من ينشئ غرفة!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          الغرف النشطة
          <Badge variant="secondary" className="mr-auto">
            {rooms.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                {room.is_private ? (
                  <Lock className="w-5 h-5 text-warning" />
                ) : (
                  <Globe className="w-5 h-5 text-success" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-foreground">{room.room_name}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">{room.room_code}</span>
                  {room.creator_name && (
                    <>
                      <span>•</span>
                      <span>{room.creator_name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{room.participant_count}</span>
              </div>
              <Button
                size="sm"
                onClick={() => onJoinRoom(room)}
              >
                انضم
                <ArrowLeft className="w-4 h-4 mr-1" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
