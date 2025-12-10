import React, { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Loader2, Lock, Globe, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (params: { roomName: string; isPrivate: boolean; password?: string }) => Promise<any>;
  onRoomCreated: (room: any) => void;
}

export const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onRoomCreated
}) => {
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!roomName.trim()) {
      toast.error('يرجى إدخال اسم الغرفة');
      return;
    }

    if (isPrivate && !password.trim()) {
      toast.error('يرجى إدخال كلمة المرور للغرفة الخاصة');
      return;
    }

    setCreating(true);
    const room = await onCreateRoom({
      roomName: roomName.trim(),
      isPrivate,
      password: isPrivate ? password : undefined
    });
    setCreating(false);

    if (room) {
      setCreatedRoom(room);
    }
  };

  const handleJoinCreatedRoom = () => {
    if (createdRoom) {
      onRoomCreated(createdRoom);
      handleClose();
    }
  };

  const handleClose = () => {
    setRoomName('');
    setIsPrivate(false);
    setPassword('');
    setCreatedRoom(null);
    setCopied(false);
    onClose();
  };

  const copyRoomLink = () => {
    if (createdRoom) {
      const link = `${window.location.origin}/meeting-hall?room=${createdRoom.room_code}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('تم نسخ الرابط');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (createdRoom) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-success">تم إنشاء الغرفة بنجاح!</DialogTitle>
            <DialogDescription>
              شارك الرابط مع المشاركين للانضمام
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">رمز الغرفة</p>
              <p className="text-2xl font-mono font-bold text-primary tracking-wider">
                {createdRoom.room_code}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/meeting-hall?room=${createdRoom.room_code}`}
                className="text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyRoomLink}>
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {isPrivate && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  <Lock className="w-4 h-4 inline ml-1" />
                  غرفة خاصة - شارك كلمة المرور: <strong>{password}</strong>
                </p>
              </div>
            )}

            <Button className="w-full" onClick={handleJoinCreatedRoom}>
              انضم للغرفة الآن
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء غرفة جديدة</DialogTitle>
          <DialogDescription>
            أنشئ غرفة اجتماع وادعُ المشاركين
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-room-name">اسم الغرفة</Label>
            <Input
              id="create-room-name"
              placeholder="مثال: اجتماع فريق التسويق"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <Lock className="w-5 h-5 text-warning" />
              ) : (
                <Globe className="w-5 h-5 text-success" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {isPrivate ? 'غرفة خاصة' : 'غرفة عامة'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPrivate ? 'تحتاج كلمة مرور للدخول' : 'أي شخص يمكنه الانضمام'}
                </p>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          {isPrivate && (
            <div className="space-y-2">
              <Label htmlFor="room-password">كلمة المرور</Label>
              <Input
                id="room-password"
                type="text"
                placeholder="أدخل كلمة مرور للغرفة"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={creating || !roomName.trim() || (isPrivate && !password.trim())}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                جاري الإنشاء...
              </>
            ) : (
              'إنشاء الغرفة'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
