import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useFastAuth } from '@/hooks/useFastAuth';
import { LogOut, Settings, User, Crown, Star, Award, Medal, CreditCard, FileText, RotateCcw, DollarSign, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartDrawer } from '@/features/commerce';
import { GlobalSearch, GlobalNotifications } from '@/shared/components';

const Header = () => {
  const { profile, user, isAuthenticated } = useFastAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'merchant': return <Award className="h-4 w-4 text-blue-500" />;
      case 'affiliate': return <Star className="h-4 w-4 text-purple-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-bronze text-bronze-foreground';
      case 'silver': return 'bg-muted text-muted-foreground';
      case 'gold': return 'bg-premium text-premium-foreground';
      case 'legendary': return 'bg-gradient-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'merchant': return 'تاجر';
      case 'affiliate': return 'مسوق';
      case 'customer': return 'عميل';
      default: return 'مستخدم';
    }
  };

  if (!isAuthenticated) {
    return (
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/')}
          >
            منصة الأفيليت
          </div>
          
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-gradient-primary hover:opacity-90"
          >
            تسجيل الدخول
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
          onClick={() => navigate('/')}
        >
          منصة الأفيليت
        </div>

        <div className="flex items-center gap-4">
          {/* Global Search */}
          <GlobalSearch />
          
          {/* Global Notifications */}
          <GlobalNotifications />
          
          {/* Shopping Cart */}
          <ShoppingCartDrawer />
          
          {/* Points Display for Affiliates */}
          {profile?.role === 'affiliate' && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Medal className="h-3 w-3" />
                {profile.points} نقطة
              </Badge>
              <Badge className={getLevelColor(profile.level)}>
                {profile.level}
              </Badge>
            </div>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0).toUpperCase() || 'م'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {getRoleIcon(profile?.role || '')}
                    <span className="text-xs text-muted-foreground">
                      {getRoleName(profile?.role || '')}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="ml-2 h-4 w-4" />
                الإعدادات الشخصية
              </DropdownMenuItem>
              
              {profile?.role === 'admin' && (
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Crown className="ml-2 h-4 w-4" />
                  لوحة الإدارة
                </DropdownMenuItem>
              )}
              
              {profile?.role === 'merchant' && (
                <DropdownMenuItem onClick={() => navigate('/merchant')}>
                  <Award className="ml-2 h-4 w-4" />
                  لوحة التاجر
                </DropdownMenuItem>
              )}
              
              {(profile?.role === 'admin' || profile?.role === 'merchant') && (
                <>
                  <DropdownMenuItem onClick={() => navigate('/admin/marketing')}>
                    <Share2 className="ml-2 h-4 w-4" />
                    نظام التسويق
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/payments')}>
                    <CreditCard className="ml-2 h-4 w-4" />
                    لوحة المدفوعات
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/invoices')}>
                    <FileText className="ml-2 h-4 w-4" />
                    إدارة الفواتير
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/payment-gateways')}>
                    <DollarSign className="ml-2 h-4 w-4" />
                    بوابات الدفع
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/refunds')}>
                    <RotateCcw className="ml-2 h-4 w-4" />
                    المرتجعات والاسترداد
                  </DropdownMenuItem>
                </>
              )}
              
              {profile?.role === 'affiliate' && (
                <DropdownMenuItem onClick={() => navigate('/affiliate')}>
                  <Star className="ml-2 h-4 w-4" />
                  متجري
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;