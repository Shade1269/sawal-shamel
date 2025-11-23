import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Crown, UserCheck, UserX } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

/**
 * Props للـ ModeratorsSection Component
 */
interface ModeratorsSectionProps {
  users: any[];
  loading: boolean;
  onAssign: (email: string) => Promise<void>;
  onRevoke: (email: string) => Promise<void>;
  onCreateModerator: (email: string, password: string) => Promise<void>;
  onRefresh: () => void;
}

/**
 * قسم إدارة المشرفين
 * يتيح تعيين وإنشاء وسحب صلاحيات المشرفين
 */
export function ModeratorsSection({
  users,
  loading,
  onAssign,
  onRevoke,
  onCreateModerator,
  onRefresh
}: ModeratorsSectionProps) {
  const { toast } = useToast();

  // حالات محلية للنماذج
  const [targetEmail, setTargetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // معالج تعيين مشرف
  const handleAssignModerator = async () => {
    if (!targetEmail.trim()) return;

    await onAssign(targetEmail.trim().toLowerCase());
    toast({
      title: "تم التعيين",
      description: `${targetEmail} أصبح مشرف`
    });
    setTargetEmail("");
    onRefresh();
  };

  // معالج إنشاء مشرف جديد
  const handleCreateModerator = async () => {
    if (!targetEmail.trim() || !newPassword.trim()) {
      toast({
        title: "مطلوب",
        description: "البريد وكلمة المرور مطلوبان",
        variant: "destructive"
      });
      return;
    }

    await onCreateModerator(targetEmail.trim().toLowerCase(), newPassword);
    toast({
      title: "تم الإنشاء",
      description: `أُنشئ ${targetEmail} كمشرف`
    });
    setTargetEmail("");
    setNewPassword("");
    onRefresh();
  };

  // معالج سحب صلاحيات مشرف
  const handleRevokeModerator = async (moderator: any) => {
    await onRevoke(moderator.email.toLowerCase());
    toast({
      title: "تم السحب",
      description: `تم سحب الإشراف من ${moderator.email}`
    });
    onRefresh();
  };

  // الحصول على قائمة المشرفين
  const moderators = users.filter(u => u.role === 'moderator');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-warning flex items-center justify-center shadow-elegant">
          <Crown className="h-5 w-5 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-black admin-card">إدارة المشرفين</h3>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="بريد المستخدم"
          value={targetEmail}
          onChange={(e) => setTargetEmail(e.target.value)}
        />
        <Input
          placeholder="كلمة المرور (للمستخدمين الجدد)"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleAssignModerator}
            disabled={loading}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            تعيين مشرف
          </Button>
          <Button
            variant="outline"
            onClick={handleCreateModerator}
            disabled={loading}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            إنشاء مشرف
          </Button>
        </div>
      </div>

      <div className="border-t pt-4 space-y-2">
        <h4 className="font-medium text-sm">المشرفين الحاليين</h4>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {moderators.map((moderator) => (
            <div key={moderator.id} className="flex items-center justify-between bg-accent/20 p-2 rounded">
              <div className="text-sm">
                <div className="font-medium">{moderator.full_name || moderator.email}</div>
                <div className="text-xs text-muted-foreground">{moderator.email}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevokeModerator(moderator)}
                className="text-destructive hover:text-destructive"
              >
                <UserX className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {moderators.length === 0 && (
            <p className="text-sm text-muted-foreground">لا يوجد مشرفين حالياً</p>
          )}
        </div>
      </div>
    </div>
  );
}
