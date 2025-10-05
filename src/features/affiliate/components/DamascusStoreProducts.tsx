import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DamascusProductGrid, DamascusProductGridContainer } from '@/components/store/DamascusProductGrid';
import { useToast } from '@/hooks/use-toast';

interface DamascusStoreProductsProps {
  storeId: string;
  categoryId?: string;
  searchQuery?: string;
}

export const DamascusStoreProducts: React.FC<DamascusStoreProductsProps> = ({
  storeId,
  categoryId,
  searchQuery,
}) => {
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['damascus-store-products', storeId, categoryId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('affiliate_products')
        .select(`
          *,
          product:products (
            id,
            title,
            price_sar,
            compare_at_price_sar,
            image_urls,
            stock_quantity,
            category_id,
            is_active,
            created_at,
            variants
          )
        `)
        .eq('affiliate_store_id', storeId)
        .eq('is_visible', true);

      const { data, error } = await query;

      if (error) throw error;

      // Filter and transform the data
      return data
        ?.filter(item => item.product)
        .map(item => {
          const product = item.product as any;
          return {
            id: product.id,
            title: product.title || 'منتج',
            price: product.price_sar || 0,
            compareAtPrice: product.compare_at_price_sar,
            imageUrl: product.image_urls?.[0] || '/placeholder.svg',
            isNew: new Date(product.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
            isOnSale: product.compare_at_price_sar && product.compare_at_price_sar > product.price_sar,
            isOutOfStock: product.stock_quantity === 0,
            rating: 5,
            currency: 'SAR',
            variants: product.variants || [],
          };
        }) || [];
    },
  });

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, searchQuery]);

  const handleAddToCart = async (productId: string) => {
    try {
      // Get or create cart
      const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);

      const { data: cart } = await supabase
        .from('shopping_carts')
        .select('id')
        .eq('session_id', sessionId)
        .single();

      let cartId = cart?.id;

      if (!cartId) {
        const { data: newCart, error: cartError } = await supabase
          .from('shopping_carts')
          .insert({ session_id: sessionId })
          .select('id')
          .single();

        if (cartError) throw cartError;
        cartId = newCart.id;
      }

      // Get product details
      const product = products?.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');

      // Add to cart
      const { error: itemError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity: 1,
          unit_price_sar: product.price,
          total_price_sar: product.price,
        });

      if (itemError) throw itemError;

      toast({
        title: 'تمت الإضافة للسلة',
        description: `تم إضافة ${product.title} إلى سلة التسوق`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة المنتج للسلة',
        variant: 'destructive',
      });
    }
  };

  const handleProductSelect = (productId: string) => {
    // Navigate to product details
    window.location.href = `/product/${productId}`;
  };

  return (
    <DamascusProductGridContainer
      title="منتجاتنا الفاخرة"
      description="تسوق من مجموعتنا المختارة بعناية"
    >
      <DamascusProductGrid
        products={filteredProducts}
        isLoading={isLoading}
        onAddToCart={handleAddToCart}
        onProductSelect={handleProductSelect}
      />
    </DamascusProductGridContainer>
  );
};
