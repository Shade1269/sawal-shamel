import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UnifiedButton as Button } from "@/components/design-system";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldX, 
  VolumeX, 
  Ban, 
  Clock, 
  Crown,
  Users
} from "lucide-react";

interface UserSettingsMenuProps {
  user: any;
  currentUserRole: string;
  onModerationAction: (action: string, user: any, reason: string, duration?: string) => Promise<void>;
  onRoleChange: (user: any, newRole: string) => Promise<void>;
}

const UserSettingsMenu = ({ user, currentUserRole, onModerationAction, onRoleChange }: UserSettingsMenuProps) => {
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<string>("");
  const [moderationReason, setModerationReason] = useState("");
  const [moderationDuration, setModerationDuration] = useState("24h");
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Don't show settings for admin users or if current user is not admin/moderator
  if (user.role === 'admin' || !['admin', 'moderator'].includes(currentUserRole)) {
    return null;
  }

  const handleModerationSubmit = async () => {
    if (!moderationReason.trim()) {
      toast({ title: "مطلوب", description: "الرجاء إدخال سبب الإجراء", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      await onModerationAction(moderationAction, user, moderationReason, moderationDuration);
      setShowModerationDialog(false);
      setModerationReason("");
      setModerationAction("");
    } catch (error) {
      console.error('Moderation action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSubmit = async () => {
    if (selectedRole === user.role) {
      setShowRoleDialog(false);
      return;
    }

    try {
      setLoading(true);
      await onRoleChange(user, selectedRole);
      setShowRoleDialog(false);
    } catch (error) {
      console.error('Role change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'moderator': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'moderator': return 'مشرف';
      default: return 'مسوق';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>إعدادات المستخدم</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Role Management - Only for admins */}
          {currentUserRole === 'admin' && (
            <>
              <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
                {getRoleIcon(user.role)}
                <span className="mr-2">تغيير الدور</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Moderation Actions */}
          <DropdownMenuItem 
            onClick={() => {
              setModerationAction('mute');
              setShowModerationDialog(true);
            }}
          >
            <VolumeX className="h-4 w-4" />
            <span className="mr-2">إسكات</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => {
              setModerationAction('tempban');
              setShowModerationDialog(true);
            }}
          >
            <Clock className="h-4 w-4" />
            <span className="mr-2">حظر مؤقت</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={() => {
              setModerationAction('ban');
              setShowModerationDialog(true);
            }}
            className="text-destructive"
          >
            <Ban className="h-4 w-4" />
            <span className="mr-2">حظر دائم</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              إجراءات الإشراف - {user.full_name || user.email}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">السبب</label>
              <Textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="اذكر سبب الإجراء"
                rows={3}
              />
            </div>

            {(moderationAction === 'mute' || moderationAction === 'tempban') && (
              <div>
                <label className="text-sm font-medium mb-2 block">المدة</label>
                <Select value={moderationDuration} onValueChange={setModerationDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">ساعة واحدة</SelectItem>
                    <SelectItem value="24h">24 ساعة</SelectItem>
                    <SelectItem value="168h">أسبوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleModerationSubmit}
                disabled={loading}
                variant={moderationAction === 'ban' ? 'danger' : 'primary'}
                className="flex-1"
              >
                {moderationAction === 'mute' && <VolumeX className="h-4 w-4 mr-2" />}
                {moderationAction === 'tempban' && <Clock className="h-4 w-4 mr-2" />}
                {moderationAction === 'ban' && <Ban className="h-4 w-4 mr-2" />}
                تأكيد الإجراء
              </Button>
              <Button
                onClick={() => setShowModerationDialog(false)}
                variant="outline"
                disabled={loading}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              تغيير دور المستخدم - {user.full_name || user.email}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">الدور الجديد</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="affiliate">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      مسوق
                    </div>
                  </SelectItem>
                  <SelectItem value="moderator">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      مشرف
                    </div>
                  </SelectItem>
                  {currentUserRole === 'admin' && (
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        مدير
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleRoleSubmit}
                disabled={loading || selectedRole === user.role}
                className="flex-1"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                تغيير الدور
              </Button>
              <Button
                onClick={() => setShowRoleDialog(false)}
                variant="outline"
                disabled={loading}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserSettingsMenu;