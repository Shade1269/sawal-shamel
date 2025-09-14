import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreVertical, Shield, Flag, Info } from 'lucide-react';
import ModerationPanel from '@/features/chat/components/ModerationPanel';

interface UserActionsMenuProps {
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  currentProfile: any;
  activeChannelId: string;
  isOwnMessage?: boolean;
}

const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  user,
  currentProfile,
  activeChannelId,
  isOwnMessage = false
}) => {
  const [showModerationPanel, setShowModerationPanel] = useState(false);

  const isAdmin = currentProfile?.role === 'admin' || currentProfile?.role === 'moderator';

  if (isOwnMessage) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="rtl">
          <DropdownMenuItem className="arabic-text cursor-pointer">
            <Info className="h-4 w-4 ml-2" />
            عرض الملف الشخصي
          </DropdownMenuItem>
          
          <DropdownMenuItem className="arabic-text cursor-pointer">
            <Flag className="h-4 w-4 ml-2" />
            الإبلاغ عن المستخدم
          </DropdownMenuItem>

          {isAdmin && (
            <DropdownMenuItem 
              onClick={() => setShowModerationPanel(true)}
              className="arabic-text cursor-pointer text-red-600 focus:text-red-600"
            >
              <Shield className="h-4 w-4 ml-2" />
              إجراءات الإشراف
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showModerationPanel} onOpenChange={setShowModerationPanel}>
        <DialogContent className="sm:max-w-md rtl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="arabic-text">إجراءات الإشراف</DialogTitle>
          </DialogHeader>
          
          <ModerationPanel
            currentProfile={currentProfile}
            activeChannelId={activeChannelId}
            targetUser={user}
            onClose={() => setShowModerationPanel(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserActionsMenu;