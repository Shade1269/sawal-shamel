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
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useState } from 'react';

const StoreHeader = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { customer, isAuthenticated, signOut } = useCustomerAuth();
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
      <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-[0_4px_24px_rgba(90,38,71,0.06)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-[0_4px_24px_rgba(90,38,71,0.06)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* شعار المتجر واسمه */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate(`/${storeSlug}`)}
        >
          <Avatar className="h-10 w-10 border-2 border-secondary">
            <AvatarImage src={store.logo_url} alt={store.store_name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
              {store.store_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-primary">{store.store_name}</h1>
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
            className="text-foreground hover:text-primary hover:bg-secondary/50"
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
            className="relative border-border hover:border-primary hover:bg-secondary/30"
            onClick={() => {
              navigate(`/${storeSlug}/cart`);
            }}
          >
            <ShoppingCart className="h-4 w-4 text-primary" />
            {cartItemsCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground"
              >
                {cartItemsCount}
              </Badge>
            )}
          </Button>

          {/* حساب العميل */}
          {isAuthenticated && customer ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 border-border hover:border-primary hover:bg-secondary/30">
                  <User className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">{customer.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-56 bg-card border-border shadow-[0_8px_40px_rgba(90,38,71,0.1)]" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground">{customer.full_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 text-accent" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem className="hover:bg-secondary/50 focus:bg-secondary/50">
                  <MapPin className="ml-2 h-4 w-4 text-primary" />
                  عناوين التوصيل
                </DropdownMenuItem>
                
                <DropdownMenuItem className="hover:bg-secondary/50 focus:bg-secondary/50">
                  <Clock className="ml-2 h-4 w-4 text-accent" />
                  طلباتي السابقة
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem onClick={handleAuthAction} className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10">
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={handleAuthAction}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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