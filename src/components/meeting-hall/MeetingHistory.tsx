import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Clock, Users, Lock, Globe, Video } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface MeetingHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  getHistory: () => Promise<any[]>;
  onRejoin: (roomCode: string) => void;
}

export const MeetingHistory: React.FC<MeetingHistoryProps> = ({
  isOpen,
  onClose,
  getHistory,
  onRejoin
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getHistory();
    setHistory(data);
    setLoading(false);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}س ${minutes}د`;
    return `${minutes} دقيقة`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            سجل الاجتماعات
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Video className="w-12 h-12 mb-2 opacity-50" />
              <p>لا يوجد سجل اجتماعات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.room?.is_private ? (
                          <Lock className="w-4 h-4 text-warning" />
                        ) : (
                          <Globe className="w-4 h-4 text-success" />
                        )}
                        <h4 className="font-medium text-foreground">
                          {item.room?.room_name || 'غرفة محذوفة'}
                        </h4>
                      </div>
                      
                      <p className="text-sm text-muted-foreground font-mono">
                        {item.room?.room_code}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(item.joined_at), 'PPp', { locale: ar })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.role === 'speaker' ? 'متحدث' : 'مستمع'}
                        </span>
                        <span>
                          المدة: {formatDuration(item.duration_seconds)}
                        </span>
                      </div>
                    </div>

                    {item.room?.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRejoin(item.room.room_code)}
                      >
                        انضم مجدداً
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
