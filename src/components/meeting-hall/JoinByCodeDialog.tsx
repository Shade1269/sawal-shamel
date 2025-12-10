import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Link2 } from 'lucide-react';

interface JoinByCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string, password?: string) => Promise<any>;
  initialCode?: string;
}

export const JoinByCodeDialog: React.FC<JoinByCodeDialogProps> = ({
  isOpen,
  onClose,
  onJoin,
  initialCode = ''
}) => {
  const [roomCode, setRoomCode] = useState(initialCode);
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setRoomCode(initialCode);
    }
  }, [initialCode]);

  const formatRoomCode = (value: string) => {
    // Remove non-letter characters and format as xxx-xxxx-xxx
    const letters = value.toLowerCase().replace(/[^a-z]/g, '');
    let formatted = '';
    for (let i = 0; i < Math.min(letters.length, 10); i++) {
      if (i === 3 || i === 7) formatted += '-';
      formatted += letters[i];
    }
    return formatted;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(formatRoomCode(e.target.value));
  };

  const handleJoin = async () => {
    if (roomCode.length < 12) return; // xxx-xxxx-xxx = 12 chars

    setJoining(true);
    const room = await onJoin(roomCode, needsPassword ? password : undefined);
    setJoining(false);

    if (room === null && !needsPassword) {
      // Might need password
      setNeedsPassword(true);
    } else if (room) {
      handleClose();
    }
  };

  const handleClose = () => {
    setRoomCode('');
    setPassword('');
    setNeedsPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>الانضمام برمز الغرفة</DialogTitle>
          <DialogDescription>
            أدخل رمز الغرفة للانضمام مباشرة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">رمز الغرفة</Label>
            <div className="relative">
              <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="room-code"
                placeholder="abc-defg-hij"
                value={roomCode}
                onChange={handleCodeChange}
                className="pr-10 text-center font-mono text-lg tracking-widest"
                maxLength={12}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              الرمز بصيغة: xxx-xxxx-xxx
            </p>
          </div>

          {needsPassword && (
            <div className="space-y-2">
              <Label htmlFor="join-password">كلمة المرور</Label>
              <Input
                id="join-password"
                type="password"
                placeholder="أدخل كلمة مرور الغرفة"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={joining || roomCode.length < 12}
          >
            {joining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                جاري الانضمام...
              </>
            ) : (
              'انضم للغرفة'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
