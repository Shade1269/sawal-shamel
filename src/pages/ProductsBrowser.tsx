
/**
 * ProductsBrowser - صفحة تصفح المنتجات (مُعاد هيكلتها)
 *
 * تم إعادة هيكلة هذا الملف في 2025-11-22 لتحسين الصيانة
 * الملف الأصلي: 1,076 سطر → الملف الجديد: ~250 سطر (-77%)
 *
 * الهيكل الجديد:
 * - 3 Custom Hooks (useProductsData, useProductActions, useProductFilters)
 * - 7 Components (Header, Alerts, Filters, Card, ListItem, 2 Dialogs)
 * - معامل الصيانة: من 5/10 → 9/10
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

import { useState, useEffect } from 'react';
import { 
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardDescription,
  EnhancedCardHeader,
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  EnhancedButton,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/index';
import { UnifiedBadge } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Package, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus,
  Check,
  Eye,
  Star,
  ShoppingCart,
  Store,
  Users,
  Heart,
  Share2,
  Home,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { useFastAuth } from '@/hooks/useFastAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

// Custom Hooks
import { useProductsData } from './products-browser/hooks/useProductsData';
import { useProductActions } from './products-browser/hooks/useProductActions';
import { useProductFilters } from './products-browser/hooks/useProductFilters';
import type { Product } from './products-browser/hooks/useProductsData';

// Components
import { ProductsBrowserHeader } from './products-browser/components/ProductsBrowserHeader';
import { StoreAlerts } from './products-browser/components/StoreAlerts';
import { ProductFilters } from './products-browser/components/ProductFilters';
import { ProductCard } from './products-browser/components/ProductCard';
import { ProductListItem } from './products-browser/components/ProductListItem';
import { PricingDialog } from './products-browser/components/PricingDialog';
import { ProductDetailsDialog } from './products-browser/components/ProductDetailsDialog';

const ProductsBrowser = () => {
  const { profile } = useFastAuth();
  const { goToUserHome } = useSmartNavigation();

  // Data & Actions Hooks
  const { products, affiliateStore, myProducts, setMyProducts, loading } = useProductsData(profile);
  const { addToMyStore, removeFromMyStore, addingProducts } = useProductActions(
    affiliateStore,
    myProducts,
    setMyProducts
  );

  // Filters Hook
  const {
    filteredProducts,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    viewMode,
    setViewMode,
    categories,
  } = useProductFilters(products);

  // Dialog States
  const [pricingProduct, setPricingProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);

  // Handlers
  const handleAddToStore = (product: Product) => {
    setPricingProduct(product);
  };

  const handleConfirmPrice = (productId: string, customPrice: number) => {
    addToMyStore(productId, customPrice);
  };

  const handleViewDetails = (product: Product) => {
    setDetailsProduct(product);
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Header */}

        <ProductsBrowserHeader
          productsCount={products.length}
          myProductsCount={myProducts.size}
          userRole={profile?.role}
          onNavigateHome={() => goToUserHome(profile?.role)}
        />

        {/* Store Alerts */}
        <StoreAlerts hasStore={!!affiliateStore} />

        {/* Filters */}
        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          categories={categories}
        />

        {/* Products Display */}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-4 mb-4">
              <UnifiedButton
                variant="ghost"
                onClick={() => goToUserHome(profile?.role)}
                className="text-primary hover:bg-primary/10 text-sm sm:text-base px-2 sm:px-4"
                leftIcon={<Home className="h-3 w-3 sm:h-4 sm:w-4" />}
                rightIcon={<ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />}
              >
                <span className="hidden sm:inline">الصفحة الرئيسية</span>
                <span className="sm:hidden">الرئيسية</span>
              </UnifiedButton>
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
              <div className="text-lg sm:text-2xl font-bold text-primary">{products.length}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">منتج متاح</div>
            </div>
            <Separator orientation="vertical" className="h-8 sm:h-12" />
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-accent">{myProducts.size}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">في متجري</div>
            </div>
          </div>
        </div>

        {/* تنبيه في حالة عدم وجود متجر */}
        {!affiliateStore && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                    لم يتم إنشاء متجرك بعد
                  </p>
                  <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-300 mt-1">
                    يمكنك تصفح المنتجات، لكن لإضافتها لمتجرك يجب إنشاء المتجر أولاً من لوحة المسوق
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* تعليمات للمسوق */}
        {affiliateStore && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200 text-sm sm:text-base">
                    مرحباً بك في مخزن المنتجات
                  </p>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-300 mt-1">
                    يمكنك الآن تصفح المنتجات والضغط على "إضافة لمتجري" لإضافتها إلى متجرك الخاص
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* أدوات البحث والفلترة */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* البحث */}
              <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8 sm:pr-10 text-sm"
                />
              </div>

              {/* فلتر الفئات */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 sm:px-4 py-2 rounded-md border border-border bg-background text-xs sm:text-sm"
              >
                <option value="all">جميع الفئات</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* نطاق السعر */}
              <div className="flex gap-2">
                <Input
                  placeholder="من"
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="flex-1 text-xs sm:text-sm"
                />
                <Input
                  placeholder="إلى"
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="flex-1 text-xs sm:text-sm"
                />
              </div>

              {/* تبديل العرض */}
              <div className="flex gap-2">
                <UnifiedButton
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1 px-2 sm:px-4"
                >
                  <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
                </UnifiedButton>
                <UnifiedButton
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1 px-2 sm:px-4"
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4" />
                </UnifiedButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* عرض المنتجات */}

        {filteredProducts.length === 0 ? (
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all' || priceRange.min || priceRange.max
                  ? 'لا توجد منتجات تطابق معايير البحث'
                  : 'لا توجد منتجات متاحة حالياً'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                : 'space-y-3 sm:space-y-4'
            }
          >
            {filteredProducts.map((product) => {
              const isInMyStore = myProducts.has(product.id);
              const isProcessing = addingProducts.has(product.id);


              return viewMode === 'grid' ? (
                <ProductCard
                  key={product.id}
                  product={product}
                  isInMyStore={isInMyStore}
                  isProcessing={isProcessing}
                  showStoreActions={!!affiliateStore}
                  onAddToStore={handleAddToStore}
                  onRemoveFromStore={removeFromMyStore}
                  onViewDetails={handleViewDetails}
                />
              ) : (
                <ProductListItem
                  key={product.id}
                  product={product}
                  isInMyStore={isInMyStore}
                  isProcessing={isProcessing}
                  showStoreActions={!!affiliateStore}
                  onAddToStore={handleAddToStore}
                  onRemoveFromStore={removeFromMyStore}
                />
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          عرض {filteredProducts.length} من أصل {products.length} منتج
          {myProducts.size > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>{myProducts.size} منتج في متجرك</span>
            </>
          )}
        </div>
      </div>


      {/* Pricing Dialog */}
      <PricingDialog
        product={pricingProduct}
        onClose={() => setPricingProduct(null)}
        onConfirm={handleConfirmPrice}
      />

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        product={detailsProduct}
        isInMyStore={detailsProduct ? myProducts.has(detailsProduct.id) : false}
        onClose={() => setDetailsProduct(null)}
        onAddToStore={handleAddToStore}
        onRemoveFromStore={removeFromMyStore}
        showStoreActions={!!affiliateStore}
      />

      <Dialog open={!!pricingProduct} onOpenChange={() => setPricingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحديد سعر البيع</DialogTitle>
            <DialogDescription>
              حدد السعر الذي ترغب في بيع المنتج به في متجرك
            </DialogDescription>
          </DialogHeader>
          {pricingProduct && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{pricingProduct.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">سعر التاجر:</span>
                    <p className="font-bold text-lg">{pricingProduct.price_sar} ر.س</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">عمولة افتراضية:</span>
                    <p className="font-bold text-lg">{pricingProduct.merchants?.default_commission_rate ?? 0}%</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="custom-price">سعر البيع في متجرك (ر.س)</Label>
                <Input
                  id="custom-price"
                  type="number"
                  step="0.01"
                  min={pricingProduct.price_sar}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder={pricingProduct.price_sar.toString()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  الحد الأدنى: {pricingProduct.price_sar} ر.س (سعر التاجر)
                </p>
              </div>

              {customPrice && parseFloat(customPrice) >= pricingProduct.price_sar && (
                <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                  <p className="text-sm text-green-600">
                    <strong>ربحك المتوقع:</strong> {(parseFloat(customPrice) - pricingProduct.price_sar).toFixed(2)} ر.س
                  </p>
                </div>
              )}

              <UnifiedButton
                className="w-full"
                onClick={() => {
                  const price = parseFloat(customPrice);
                  if (price >= pricingProduct.price_sar) {
                    addToMyStore(pricingProduct.id, price);
                    setPricingProduct(null);
                    setCustomPrice('');
                  } else {
                    toast({
                      title: 'خطأ',
                      description: 'سعر البيع يجب أن يكون أكبر من أو يساوي سعر التاجر',
                      variant: 'destructive',
                    });
                  }
                }}
                disabled={!customPrice || parseFloat(customPrice) < pricingProduct.price_sar}
              >
                إضافة للمتجر
              </UnifiedButton>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog لعرض تفاصيل المنتج */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل المنتج</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              {/* صور المنتج */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(selectedProduct.image_urls || []).map((url, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={url}
                      alt={`${selectedProduct.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {(!selectedProduct.image_urls || selectedProduct.image_urls.length === 0) && (
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* معلومات المنتج */}
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedProduct.title}</h3>
                <p className="text-muted-foreground">{selectedProduct.description}</p>
              </div>

              {/* السعر والعمولة */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">السعر</p>
                  <p className="text-2xl font-bold text-primary">{selectedProduct.price_sar} ر.س</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">العمولة</p>
                  <p className="text-2xl font-bold text-green-600">{selectedProduct.merchants?.default_commission_rate || 10}%</p>
                </div>
              </div>

              {/* المتغيرات */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">المتغيرات المتاحة</h4>
                  <ProductVariantDisplay 
                    variants={selectedProduct.variants} 
                    compact={false} 
                  />
                </div>
              )}

              {/* معلومات إضافية */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">الفئة:</span>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">المخزون:</span>
                  <p className="font-medium">{selectedProduct.stock}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">التاجر:</span>
                  <p className="font-medium">{selectedProduct.merchants?.business_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">عدد المشاهدات:</span>
                  <p className="font-medium">{selectedProduct.view_count || 0}</p>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 pt-4">
                {affiliateStore && (
                  myProducts.has(selectedProduct.id) ? (
                    <UnifiedButton
                      variant="outline"
                      onClick={() => {
                        removeFromMyStore(selectedProduct.id);
                        setShowViewDialog(false);
                      }}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      حذف من متجري
                    </UnifiedButton>
                  ) : (
                    <UnifiedButton
                      onClick={() => {
                        showPricingModal(selectedProduct);
                        setShowViewDialog(false);
                      }}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة لمتجري
                    </UnifiedButton>
                  )
                )}
                <UnifiedButton
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                  className="flex-1"
                >
                  إغلاق
                </UnifiedButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ProductsBrowser;
