import React from 'react';
import { UnifiedCard, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Package, Warehouse, Settings } from 'lucide-react';
import { useRealInventoryManagement } from '@/hooks/useRealInventoryManagement';

export const InventorySetupCard: React.FC = () => {
  const { warehouses, initializeSystem, isInitializing } = useRealInventoryManagement();

  if (warehouses.length > 0) {
    return null; // Don't show if already initialized
  }

  return (
    <UnifiedCard variant="elegant" padding="lg" className="border-2 border-dashed border-primary/30">
      <UnifiedCardContent className="p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/20 rounded-full">
            <Settings className="h-12 w-12 text-primary animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-4">
          إعداد نظام المخزون
        </h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          لم يتم إعداد نظام المخزون بعد. سنقوم بإنشاء مخزن رئيسي تلقائياً وربطه بمنتجاتك الموجودة.
        </p>
        
        <div className="flex justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Warehouse className="h-4 w-4" />
            إنشاء مخزن رئيسي
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            ربط المنتجات الموجودة
          </div>
        </div>
        
        <UnifiedButton
          onClick={initializeSystem}
          disabled={isInitializing}
          variant="primary"
          size="lg"
          className="font-semibold px-8"
        >
          {isInitializing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
              جاري الإعداد...
            </>
          ) : (
            'إعداد المخزون الآن'
          )}
        </UnifiedButton>
        
        <p className="text-xs text-muted-foreground mt-4">
          العملية آمنة ولن تؤثر على منتجاتك الحالية
        </p>
      </UnifiedCardContent>
    </UnifiedCard>
  );
};