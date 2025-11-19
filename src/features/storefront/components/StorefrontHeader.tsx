import { Search, ShoppingCart, User, Package, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StorefrontThemeToggle } from "@/components/storefront/StorefrontThemeToggle";

interface StorefrontHeaderProps {
  storeName: string;
  storeSlug?: string;
  cartCount: number;
  wishlistCount?: number;
  isAuthenticated: boolean;
  onSearchClick: () => void;
  onCartClick: () => void;
  onOrdersClick: () => void;
  onAuthClick: () => void;
}

export const StorefrontHeader = ({
  storeName,
  storeSlug,
  cartCount,
  wishlistCount = 0,
  isAuthenticated,
  onSearchClick,
  onCartClick,
  onOrdersClick,
  onAuthClick,
}: StorefrontHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
          {/* Search Button - Mobile First */}
          <button
            onClick={onSearchClick}
            className="p-2.5 hover:bg-secondary/50 rounded-lg transition-colors group"
            aria-label="بحث"
          >
            <Search className="w-5 h-5 md:w-6 md:h-6 text-foreground/70 group-hover:text-foreground transition-colors" />
          </button>

          {/* Store Name/Logo - Center on mobile, right on desktop */}
          <h1 className="text-xl md:text-3xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors flex-1 md:flex-initial text-center md:text-right truncate">
            {storeName}
          </h1>

          {/* Action Icons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Theme Toggle */}
            {storeSlug && (
              <div className="hidden md:block">
                <StorefrontThemeToggle storeSlug={storeSlug} />
              </div>
            )}

            {/* Wishlist - Desktop only */}
            {wishlistCount > 0 && (
              <button
                className="hidden md:flex p-2.5 rounded-lg transition-colors relative hover:bg-secondary/50 group"
                aria-label="المفضلة"
              >
                <Heart className="w-6 h-6 text-foreground/70 group-hover:text-red-500 transition-colors" />
                <Badge
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  variant="destructive"
                >
                  {wishlistCount}
                </Badge>
              </button>
            )}

            {/* Orders */}
            <button
              onClick={onOrdersClick}
              className="p-2.5 rounded-lg transition-colors hover:bg-secondary/50 group"
              aria-label="طلباتي"
            >
              <Package className="w-5 h-5 md:w-6 md:h-6 text-foreground/70 group-hover:text-foreground transition-colors" />
            </button>

            {/* User Account */}
            <button
              onClick={onAuthClick}
              className="p-2.5 rounded-lg transition-colors hover:bg-secondary/50 group"
              aria-label={isAuthenticated ? "حسابي" : "تسجيل الدخول"}
            >
              <User className="w-5 h-5 md:w-6 md:h-6 text-foreground/70 group-hover:text-foreground transition-colors" />
            </button>

            {/* Shopping Cart */}
            <button
              onClick={onCartClick}
              className="p-2.5 rounded-lg transition-colors relative hover:bg-secondary/50 group"
              aria-label="سلة التسوق"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-foreground/70 group-hover:text-foreground transition-colors" />
              {cartCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-in zoom-in-50"
                >
                  {cartCount}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
