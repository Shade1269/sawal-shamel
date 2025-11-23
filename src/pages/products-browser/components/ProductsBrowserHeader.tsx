import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Home, ArrowRight } from 'lucide-react';

interface ProductsBrowserHeaderProps {
  productsCount: number;
  myProductsCount: number;
  userRole?: string;
  onNavigateHome: () => void;
}

/**
 * Header لصفحة تصفح المنتجات
 * يعرض العنوان، الإحصائيات، وزر العودة للصفحة الرئيسية
 */
export function ProductsBrowserHeader({
  productsCount,
  myProductsCount,
  userRole,
  onNavigateHome,
}: ProductsBrowserHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
      <div>
        <div className="flex items-center gap-2 sm:gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={onNavigateHome}
            className="text-primary hover:bg-primary/10 gap-1 sm:gap-2 text-sm sm:text-base px-2 sm:px-4"
          >
            <Home className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">الصفحة الرئيسية</span>
            <span className="sm:hidden">الرئيسية</span>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              مخزن المنتجات
            </h1>
            <p className="text-xs sm:text-base text-muted-foreground hidden sm:block">
              تصفح واختر المنتجات لإضافتها إلى متجرك
            </p>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-center">
          <div className="text-lg sm:text-2xl font-bold text-primary">{productsCount}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">منتج متاح</div>
        </div>
        <Separator orientation="vertical" className="h-8 sm:h-12" />
        <div className="text-center">
          <div className="text-lg sm:text-2xl font-bold text-accent">{myProductsCount}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">في متجري</div>
        </div>
      </div>
    </div>
  );
}
