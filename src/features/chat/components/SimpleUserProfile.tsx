import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UnifiedBadge as Badge } from "@/components/design-system";
import { UnifiedButton as Button } from "@/components/design-system";
import { User, Mail, Shield, Crown, Users, Calendar, Award } from "lucide-react";

interface SimpleUserProfileProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

const SimpleUserProfile = ({ user, isOpen, onClose }: SimpleUserProfileProps) => {
  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'moderator': return <Shield className="h-4 w-4" />;
      case 'affiliate':
      case 'merchant':
        return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'moderator': return 'مشرف';
      case 'affiliate':
      case 'merchant':
        return 'مسوق';
      default: return 'عضو';
    }
  };

  const formatJoinDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'غير محدد';
    }
  };

  const isOnline = true; // Can be enhanced later with real status

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">معلومات المستخدم</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-primary/20">
                <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                <AvatarFallback className="text-xl bg-primary/10">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              
              {/* Status Indicator */}
              <div 
                className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>

            {/* Name */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">
                {user?.full_name || user?.email?.split('@')[0] || 'مستخدم'}
              </h3>
              
              {/* Email */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
            </div>

            {/* Role Badge */}
            <Badge 
              variant="outline"
              className="flex items-center gap-2 px-3 py-1"
            >
              {getRoleIcon(user?.role || 'user')}
              {getRoleLabel(user?.role || 'user')}
            </Badge>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isOnline ? 'متصل الآن' : 'غير متصل'}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-3 pt-4 border-t">
            {/* Join Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>تاريخ الانضمام</span>
              </div>
              <span className="text-sm">
                {user?.created_at ? formatJoinDate(user.created_at) : 'غير محدد'}
              </span>
            </div>

            {/* Points if available */}
            {user?.points !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>النقاط</span>
                </div>
                <span className="font-bold text-primary">{user.points}</span>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-center p-4 border-t">
          <Button onClick={onClose} className="min-w-[120px]">
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleUserProfile;