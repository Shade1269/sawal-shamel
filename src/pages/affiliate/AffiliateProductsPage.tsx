import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Package, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AffiliateProduct {
  id: string;
  affiliate_store_id: string;
  product_id: string;
  is_visible: boolean;
  sort_order: number;
  commission_rate: number;
  added_at: string;
  products: {
    title: string;
    price_sar: number;
    image_urls: string[];
    description: string;
  };
}

export default function AffiliateProductsPage() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: affiliateStore } = useQuery({
    queryKey: ['affiliate-store', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('affiliate_stores')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['affiliate-products', affiliateStore?.id],
    queryFn: async () => {
      if (!affiliateStore) return [];
      
      const { data, error } = await supabase
        .from('affiliate_products')
        .select(`
          *,
          products (
            title,
            price_sar,
            image_urls,
            description
          )
        `)
        .eq('affiliate_store_id', affiliateStore.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as AffiliateProduct[];
    },
    enabled: !!affiliateStore
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: string; updates: Partial<AffiliateProduct> }) => {
      const { error } = await supabase
        .from('affiliate_products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-products'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث إعدادات المنتج بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث إعدادات المنتج",
        variant: "destructive",
      });
    }
  });

  const handleVisibilityToggle = (productId: string, isVisible: boolean) => {
    updateProductMutation.mutate({
      productId,
      updates: { is_visible: !isVisible }
    });
  };

  const handleCommissionRateChange = (productId: string, rate: number) => {
    updateProductMutation.mutate({
      productId,
      updates: { commission_rate: rate }
    });
  };

  const handleSortOrderChange = (productId: string, order: number) => {
    updateProductMutation.mutate({
      productId,
      updates: { sort_order: order }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة المنتجات</h1>
        <p className="text-muted-foreground">
          إدارة منتجات متجرك وإعدادات العمولة والظهور
        </p>
      </div>

      {!products || products.length === 0 ? (
        <UnifiedCard variant="glass">
          <UnifiedCardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
            <p className="text-muted-foreground mb-4">
              لم تقم بإضافة أي منتجات إلى متجرك بعد
            </p>
            <UnifiedButton 
              variant="outline" 
              onClick={() => navigate('/products')}
            >
              تصفح المخزون وإضافة منتجات
            </UnifiedButton>
          </UnifiedCardContent>
        </UnifiedCard>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <UnifiedCard key={product.id} variant="glass" hover="lift">
              <UnifiedCardContent className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={product.products.image_urls?.[0] || '/placeholder.svg'}
                      alt={product.products.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {product.products.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {product.products.description?.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-4">
                          <UnifiedBadge variant="secondary">
                            {product.products.price_sar} ر.س
                          </UnifiedBadge>
                          <UnifiedBadge variant={product.is_visible ? "success" : "secondary"}>
                            {product.is_visible ? "مرئي" : "مخفي"}
                          </UnifiedBadge>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Visibility Toggle */}
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Switch
                          checked={product.is_visible}
                          onCheckedChange={() => handleVisibilityToggle(product.id, product.is_visible)}
                          disabled={updateProductMutation.isPending}
                        />
                        <Label className="flex items-center gap-2">
                          {product.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          إظهار المنتج
                        </Label>
                      </div>

                      {/* Commission Rate */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          نسبة العمولة %
                        </Label>
                        <Input
                          type="number"
                          value={product.commission_rate}
                          onChange={(e) => handleCommissionRateChange(product.id, Number(e.target.value))}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full"
                        />
                      </div>

                      {/* Sort Order */}
                      <div className="space-y-2">
                        <Label>ترتيب الظهور</Label>
                        <Input
                          type="number"
                          value={product.sort_order}
                          onChange={(e) => handleSortOrderChange(product.id, Number(e.target.value))}
                          min="0"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          ))}
        </div>
      )}
    </div>
  );
}