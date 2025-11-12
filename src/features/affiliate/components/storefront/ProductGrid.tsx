import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ProductCard, type Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  onProductClick: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onClearFilters: () => void;
  searchQuery: string;
  selectedCategory: string;
}

export const ProductGrid = ({
  products,
  isLoading,
  onProductClick,
  onToggleWishlist,
  onAddToCart,
  wishlist,
  onClearFilters,
  searchQuery,
  selectedCategory
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">جاري تحميل المنتجات الرائعة...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="space-y-6">
          <div className="w-32 h-32 gradient-bg-muted rounded-full flex items-center justify-center mx-auto">
            <Search className="h-16 w-16 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3">لم يتم العثور على منتجات</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `لا توجد منتجات تتطابق مع "${searchQuery}"`
                : 'لا توجد منتجات في هذا التصنيف'
              }
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button onClick={onClearFilters} className="px-8">
                <X className="h-4 w-4 mr-2" />
                مسح الفلاتر والعرض الكامل
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onQuickView={onProductClick}
          onToggleWishlist={onToggleWishlist}
          onAddToCart={onAddToCart}
          isWishlisted={wishlist.includes(product.id)}
        />
      ))}
    </div>
  );
};
