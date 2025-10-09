import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import { useCustomerAuthContext } from '@/contexts/CustomerAuthContext';
import { useState } from 'react';

const StoreHeader = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { customer, isAuthenticated, signOut } = useCustomerAuthContext();
  const [cartItemsCount, setCartItemsCount] = useState(0);

  // جلب بيانات المتجر
  const { data: store } = useQuery({
    queryKey: ["store-info", storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;
      
      const { data, error } = await supabase
        .from("affiliate_stores")
        .select("*")
        .eq("store_slug", storeSlug)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!storeSlug,
  });

  const handleAuthAction = () => {
    if (isAuthenticated) {
      signOut();
    } else {
      navigate(`/${storeSlug}/auth`);
    }
  };

  if (!store) {
    return (
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* شعار المتجر واسمه */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/${storeSlug}`)}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={store.logo_url} alt={store.store_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {store.store_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">{store.store_name}</h1>
            {store.bio && (
              <p className="text-xs text-muted-foreground max-w-48 truncate">
                {store.bio}
              </p>
            )}
          </div>
        </div>

        {/* روابط التنقل */}
        <nav className="hidden md:flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/${storeSlug}`)}
          >
            المنتجات
          </Button>
        </nav>

        {/* الأدوات اليمنى */}
        <div className="flex items-center gap-3">
          {/* السلة */}
          <Button 
            variant="outline" 
            size="sm" 
            className="relative"
            onClick={() => {
              // فتح صفحة السلة أو استخدم Sheet
              navigate(`/${storeSlug}/cart`);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartItemsCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {cartItemsCount}
              </Badge>
            )}
          </Button>

          {/* حساب العميل */}
          {isAuthenticated && customer ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{customer.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{customer.full_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <MapPin className="ml-2 h-4 w-4" />
                  عناوين التوصيل
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Clock className="ml-2 h-4 w-4" />
                  طلباتي السابقة
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleAuthAction} className="text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={handleAuthAction}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <User className="h-4 w-4 mr-2" />
              دخول / تسجيل
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;