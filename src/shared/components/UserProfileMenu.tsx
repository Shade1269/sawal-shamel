import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, Settings, Bell, LogOut, UserCircle } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import UserProfileDialog from './UserProfileDialog';

const UserProfileMenu = () => {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Check if notifications were already configured
  const notificationsConfigured = localStorage.getItem('notificationsConfigured') === 'true';
  
  // Auto-show notifications dialog for new users (only once)
  const shouldShowNotificationsPrompt = !notificationsConfigured && user;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <AvatarImage src={''} alt={user?.email} />
            <AvatarFallback className="bg-primary/10">
              {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          
          {/* Notification dot for unread notifications */}
          {shouldShowNotificationsPrompt && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted-foreground truncate w-[180px]">
              {user?.email}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => setShowProfile(true)}
          className="cursor-pointer"
        >
          <UserCircle className="mr-2 h-4 w-4" />
          <span>الملف الشخصي</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>الإعدادات</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setShowProfile(true)}
          className="cursor-pointer"
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>التنبيهات</span>
          {shouldShowNotificationsPrompt && (
            <div className="mr-auto h-2 w-2 bg-red-500 rounded-full" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Profile Dialog with Notification Settings */}
    <UserProfileDialog
      user={{
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0],
        email: user?.email,
        avatar_url: '',
        role: 'user',
        is_active: true,
        created_at: user?.created_at,
        points: 0
      }}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        showNotificationSettings={true}
      />
    </>
  );
};

export default UserProfileMenu;