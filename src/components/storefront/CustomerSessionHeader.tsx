import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { User, Shield, Phone, LogOut, Clock } from 'lucide-react';

interface CustomerSessionHeaderProps {
  isAuthenticated: boolean;
  customerInfo: {
    phone?: string;
    name?: string;
    email?: string;
    sessionId: string;
  } | null;
  onLoginClick: () => void;
  onLogout?: () => void;
  storeSlug: string;
}

export const CustomerSessionHeader: React.FC<CustomerSessionHeaderProps> = ({
  isAuthenticated,
  customerInfo,
  onLoginClick,
  onLogout,
  storeSlug
}) => {
  const navigate = useNavigate();
  
  if (!isAuthenticated || !customerInfo) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onLoginClick}
        className="bg-white/10 border-white/20 text-foreground hover:bg-white/20"
      >
        <User className="h-4 w-4 mr-2" />
        تسجيل دخول سريع
      </Button>
    );
  }

  const displayName = customerInfo.name || customerInfo.phone || 'عميل';
  const initials = customerInfo.name ? customerInfo.name.charAt(0) : 'ع';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 border-white/20 text-foreground hover:bg-white/20 flex items-center gap-2"
        >
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-xs bg-primary/20 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Shield className="h-3 w-3 text-green-400" />
          <span className="hidden sm:inline max-w-24 truncate">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-green-500" />
            <Badge variant="secondary" className="text-xs">
              محقق
            </Badge>
          </div>
          
          {customerInfo.name && (
            <p className="text-sm font-medium">{customerInfo.name}</p>
          )}
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Phone className="h-3 w-3" />
            {customerInfo.phone}
          </div>
          
          {customerInfo.email && (
            <p className="text-xs text-muted-foreground mt-1">
              {customerInfo.email}
            </p>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => navigate(`/s/${storeSlug}/my-orders`)}
        >
          <Clock className="ml-2 h-4 w-4" />
          طلباتي السابقة
        </DropdownMenuItem>
        
        {onLogout && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};