import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, Crown, Store, Users, MessageSquare, Calendar, Award, Phone } from "lucide-react";
import NotificationSettings from './NotificationSettings';

interface UserProfileDialogProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  showNotificationSettings?: boolean;
}

const UserProfileDialog = ({ user, isOpen, onClose, showNotificationSettings = false }: UserProfileDialogProps) => {
  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'moderator': return <Shield className="h-4 w-4" />;
      case 'merchant': return <Store className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'moderator': return 'مشرف';
      case 'merchant': return 'تاجر';
      default: return 'مسوق';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'moderator': return 'secondary';
      case 'merchant': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-success' : 'text-destructive';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {showNotificationSettings ? "الملف الشخصي والإعدادات" : "تفاصيل المستخدم"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
          {/* User Profile Section */}
          <div className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                
                {/* Online Status Indicator */}
                <div 
                  className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background ${
                    user?.is_active ? 'bg-success' : 'bg-destructive'
                  } flex items-center justify-center shadow-lg`}
                >
                  <div className="h-3 w-3 rounded-full bg-white/90" />
                </div>
              </div>

              {/* Name and Email */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  {user?.full_name || 'مستخدم جديد'}
                </h3>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex items-center justify-center">
                <Badge 
                  variant={getRoleBadgeVariant(user?.role)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                >
                  {getRoleIcon(user?.role)}
                  {getRoleLabel(user?.role)}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Detailed Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                معلومات تفصيلية
              </h4>
              
              <div className="grid gap-3 text-sm">
                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">الحالة</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${user?.is_active ? 'bg-success' : 'bg-destructive'}`} />
                    <span className={`font-medium ${getStatusColor(user?.is_active)}`}>
                      {user?.is_active ? 'متصل الآن' : 'غير متصل'}
                    </span>
                  </div>
                </div>

                {/* Points */}
                {user?.points !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="font-medium">النقاط المكتسبة</span>
                    </div>
                    <span className="font-bold text-primary text-lg">{user.points}</span>
                  </div>
                )}

                {/* Join Date */}
                {user?.created_at && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">تاريخ الانضمام</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {/* Phone (if available) */}
                {user?.phone && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">رقم الهاتف</span>
                    </div>
                    <span className="text-muted-foreground">{user.phone}</span>
                  </div>
                )}

                {/* WhatsApp (if available) */}
                {user?.whatsapp && (
                  <div className="flex items-center justify-between p-3 bg-success/10 dark:bg-success/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-success" />
                      <span className="font-medium">واتساب</span>
                    </div>
                    <span className="text-success">{user.whatsapp}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notification Settings Section (if enabled) */}
          {showNotificationSettings && (
            <div className="space-y-4">
              <Separator className="lg:hidden" />
              <NotificationSettings />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 p-4 border-t">
          <Button onClick={onClose} variant="outline" className="min-w-[120px]">
            إغلاق
          </Button>
          {showNotificationSettings && (
            <Button 
              onClick={() => {
                // Additional profile actions can be added here
                onClose();
              }}
              className="min-w-[120px]"
            >
              حفظ الإعدادات
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;