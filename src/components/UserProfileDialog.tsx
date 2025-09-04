import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Crown, Store, Users } from "lucide-react";

interface UserProfileDialogProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileDialog = ({ user, isOpen, onClose }: UserProfileDialogProps) => {
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
    return isActive ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">تفاصيل المستخدم</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 p-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar_url} alt={user.full_name} />
              <AvatarFallback className="text-2xl">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            {/* Online Status Indicator */}
            <div 
              className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background ${
                user.is_active ? 'bg-green-500' : 'bg-red-500'
              } flex items-center justify-center`}
            >
              <div className="h-3 w-3 rounded-full bg-white/80" />
            </div>
          </div>

          {/* User Info */}
          <div className="text-center space-y-3 w-full">
            {/* Name */}
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {user.full_name || 'مستخدم جديد'}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-center justify-center">
              <Badge 
                variant={getRoleBadgeVariant(user.role)}
                className="flex items-center gap-2 px-3 py-1"
              >
                {getRoleIcon(user.role)}
                {getRoleLabel(user.role)}
              </Badge>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2">
              <div className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${getStatusColor(user.is_active)}`}>
                {user.is_active ? 'متصل' : 'غير متصل'}
              </span>
            </div>

            {/* Points */}
            {user.points !== undefined && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">النقاط:</span>
                  <span className="font-semibold text-primary">{user.points}</span>
                </div>
              </div>
            )}

            {/* Join Date */}
            {user.created_at && (
              <div className="text-xs text-muted-foreground">
                انضم في: {new Date(user.created_at).toLocaleDateString('ar-SA')}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;