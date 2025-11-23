import React, { useState } from 'react';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Ban, 
  VolumeX, 
  Lock, 
  Clock, 
  AlertTriangle,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModerationPanelProps {
  currentProfile: any;
  activeChannelId: string;
  targetUser?: {
    id: string;
    full_name: string;
    email: string;
  };
  onClose?: () => void;
}

const ModerationPanel: React.FC<ModerationPanelProps> = ({
  currentProfile,
  activeChannelId,
  targetUser,
  onClose
}) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('24h');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isAdmin = currentProfile?.role === 'admin' || currentProfile?.role === 'moderator';

  if (!isAdmin) return null;

  const banUser = async (tempBan = false) => {
    if (!targetUser) return;
    
    try {
      setLoading(true);
      
      let expiresAt = null;
      if (tempBan) {
        const hours = duration === '24h' ? 24 : 1;
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: targetUser.id,
          banned_by: currentProfile.id,
          channel_id: tempBan ? activeChannelId : null,
          reason: reason || (tempBan ? 'حظر مؤقت' : 'مخالفة قوانين الدردشة'),
          expires_at: expiresAt,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: tempBan ? "تم الحظر المؤقت" : "تم حظر المستخدم",
        description: `تم ${tempBan ? 'حظر' : 'حظر'} ${targetUser.full_name} بنجاح`
      });

      onClose?.();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "خطأ في الحظر",
        description: "فشل في تنفيذ الحظر",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const muteUser = async () => {
    if (!targetUser) return;
    
    try {
      setLoading(true);
      
      const hours = duration === '24h' ? 24 : 1;
      const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('user_mutes')
        .insert({
          user_id: targetUser.id,
          muted_by: currentProfile.id,
          channel_id: activeChannelId,
          reason: reason || 'إسكات مؤقت',
          expires_at: expiresAt,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "تم إسكات المستخدم",
        description: `تم إسكات ${targetUser.full_name} لمدة ${duration}`
      });

      onClose?.();
    } catch (error) {
      console.error('Error muting user:', error);
      toast({
        title: "خطأ في الإسكات",
        description: "فشل في إسكات المستخدم",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const lockChannel = async () => {
    try {
      setLoading(true);
      
      const hours = duration === '24h' ? 24 : 1;
      const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('channel_locks')
        .insert({
          channel_id: activeChannelId,
          locked_by: currentProfile.id,
          reason: reason || 'قفل مؤقت للدردشة',
          expires_at: expiresAt,
          is_active: true
        });

      if (error) throw error;

      // Update channel lock status
      await supabase
        .from('channels')
        .update({ is_locked: true })
        .eq('id', activeChannelId);

      toast({
        title: "تم قفل الدردشة",
        description: `تم قفل الدردشة لمدة ${duration}`
      });

      onClose?.();
    } catch (error) {
      console.error('Error locking channel:', error);
      toast({
        title: "خطأ في القفل",
        description: "فشل في قفل الدردشة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-semibold arabic-text">لوحة الإشراف</h3>
      </div>

      {targetUser && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded">
          <User className="h-4 w-4" />
          <span className="arabic-text">{targetUser.full_name}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <Label htmlFor="reason" className="arabic-text">السبب</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اذكر سبب الإجراء (اختياري)"
            className="arabic-text"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="duration" className="arabic-text">المدة</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">ساعة واحدة</SelectItem>
              <SelectItem value="24h">24 ساعة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {targetUser && (
          <>
            <Button
              onClick={() => muteUser()}
              disabled={loading}
              variant="outline"
              size="sm"
              className="justify-start arabic-text"
            >
              <VolumeX className="h-4 w-4 mr-2" />
              إسكات المستخدم
            </Button>

            <Button
              onClick={() => banUser(true)}
              disabled={loading}
              variant="outline"
              size="sm" 
              className="justify-start arabic-text"
            >
              <Clock className="h-4 w-4 mr-2" />
              حظر مؤقت (24 ساعة)
            </Button>

            <Button
              onClick={() => banUser(false)}
              disabled={loading}
              variant="destructive"
              size="sm"
              className="justify-start arabic-text"
            >
              <Ban className="h-4 w-4 mr-2" />
              حظر دائم
            </Button>
          </>
        )}

        <Button
          onClick={lockChannel}
          disabled={loading}
          variant="outline"
          size="sm"
          className="justify-start arabic-text"
        >
          <Lock className="h-4 w-4 mr-2" />
          قفل الدردشة مؤقتاً
        </Button>
      </div>
    </div>
  );
};

export default ModerationPanel;