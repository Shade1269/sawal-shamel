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
    </div>
  );
};

export default ProductsBrowser;
