import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, User, Clock, TrendingUp, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StoreHeaderProps {
  affiliateStore: {
    id: string;
    store_name: string;
    bio?: string;
    logo_url?: string;
    total_orders: number;
    total_sales: number;
  };
  productsCount: number;
  cartItemsCount: number;
  isAuthenticated: boolean;
  customer?: { full_name?: string; profile_id: string } | null;
  storeSlug?: string;
  onCartOpen: () => void;
}

export const StoreHeader = ({
  affiliateStore,
  productsCount,
  cartItemsCount,
  isAuthenticated,
  customer,
  storeSlug,
  onCartOpen
}: StoreHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-primary/20 shadow-lg">
      <div className="container mx-auto px-3 md:px-6 py-3 md:py-4">
        <div className="flex justify-between items-center gap-3">
          {/* Store Identity */}
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            {affiliateStore?.logo_url && (
              <div className="relative flex-shrink-0">
                <img
                  src={affiliateStore.logo_url}
                  alt={`شعار متجر ${affiliateStore.store_name}`}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-lg ring-2 ring-primary/20"
                  loading="lazy"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background animate-pulse"></div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-2xl font-bold text-foreground truncate">
                {affiliateStore?.store_name}
              </h1>
              {affiliateStore?.bio && (
                <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">
                  {affiliateStore.bio}
                </p>
              )}
              <div className="flex items-center gap-2 md:gap-4 mt-0.5 md:mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="hidden sm:inline">{affiliateStore.total_orders} طلب</span>
                  <span className="sm:hidden">{affiliateStore.total_orders}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span className="hidden sm:inline">{productsCount} منتج</span>
                  <span className="sm:hidden">{productsCount}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Login/User Button */}
            {isAuthenticated && customer ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/${storeSlug}/orders`)}
                className="hover:shadow-lg hover:scale-105 transition-all rounded-xl"
              >
                <User className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{customer.full_name || 'حسابي'}</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/${storeSlug}/auth`)}
                className="hover:shadow-lg hover:scale-105 transition-all rounded-xl"
              >
                <User className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">تسجيل الدخول</span>
              </Button>
            )}

            {/* Cart Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="relative group hover:shadow-lg hover:scale-105 transition-all rounded-xl"
                  onClick={onCartOpen}
                >
                  <ShoppingCart className="h-4 w-4 md:mr-2 group-hover:scale-110 transition-transform" />
                  <span className="hidden md:inline">السلة</span>
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1.5 -left-1.5 min-w-[18px] h-5 text-xs animate-bounce bg-danger shadow-lg">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Orders Button - Only show when authenticated */}
            {isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/${storeSlug}/orders`)}
                className="hidden lg:flex hover:shadow-lg hover:scale-105 transition-all rounded-xl"
              >
                <Clock className="h-4 w-4 mr-2" />
                طلباتي
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
