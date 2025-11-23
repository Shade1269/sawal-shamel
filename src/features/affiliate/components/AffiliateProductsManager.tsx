import React, { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { useToast } from '@/components/ui/use-toast';
import { 
  Package,
  Percent,
  Save,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface AffiliateProduct {
  id: string;
  product_id: string;
  commission_rate: number;
  custom_price_sar: number | null;
  is_visible: boolean;
  products: {
    title: string;
    price_sar: number;
    image_urls: string[];
  } | null;
}

interface AffiliateProductsManagerProps {
  storeId: string;
}

export const AffiliateProductsManager: React.FC<AffiliateProductsManagerProps> = ({ storeId }) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [commissionRates, setCommissionRates] = useState<{ [key: string]: number }>({});
  const [customPrices, setCustomPrices] = useState<{ [key: string]: string }>({});

  const { data: affiliateProducts = [], isLoading } = useQuery({
    queryKey: ['affiliate-products', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_products')
        .select(`
          *,
          products (
            title,
            price_sar,
            image_urls
          )
        `)
        .eq('affiliate_store_id', storeId);

      if (error) throw error;
      return data as AffiliateProduct[];
    },
    enabled: !!storeId
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, rate, customPrice }: { productId: string; rate: number; customPrice?: number | null }) => {
      const updates: any = { commission_rate: rate };
      if (customPrice !== undefined) {
        updates.custom_price_sar = customPrice;
      }
      
      const { error } = await supabase
        .from('affiliate_products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-products', storeId] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المنتج بنجاح",
      });
      setEditingProduct(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث بيانات المنتج",
        variant: "destructive",
      });
    }
  });

  const handleSaveProduct = (productId: string) => {
    const newRate = commissionRates[productId];
    const customPriceStr = customPrices[productId];
    const customPriceNum = customPriceStr ? parseFloat(customPriceStr) : null;
    
    if (!newRate || newRate <= 0 || newRate > 50) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب أن تكون نسبة العمولة بين 1% و 50%",
        variant: "destructive",
      });
      return;
    }
    
    if (customPriceNum !== null && customPriceNum <= 0) {
      toast({
        title: "خطأ في البيانات",
        description: "السعر المخصص يجب أن يكون أكبر من صفر",
        variant: "destructive",
      });
      return;
    }
    
    updateProductMutation.mutate({ 
      productId, 
      rate: newRate,
      customPrice: customPriceNum 
    });
  };

  const startEditing = (productId: string, currentRate: number, currentPrice: number | null) => {
    setEditingProduct(productId);
    setCommissionRates(prev => ({ ...prev, [productId]: currentRate }));
    setCustomPrices(prev => ({ ...prev, [productId]: currentPrice?.toString() || '' }));
  };

  const calculatePotentialEarning = (price: number, rate: number) => {
    return (price * rate / 100).toFixed(2);
  };
  
  const getDisplayPrice = (product: AffiliateProduct) => {
    return product.custom_price_sar || product.products?.price_sar || 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">جاري تحميل المنتجات...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          إدارة منتجات المتجر والعمولات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {affiliateProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">لا توجد منتجات في متجرك حتى الآن</p>
          </div>
        ) : (
          <div className="space-y-4">
            {affiliateProducts.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {product.products?.image_urls?.[0] ? (
                      <img 
                        src={product.products.image_urls[0]} 
                        alt={product.products.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{product.products?.title || 'منتج غير محدد'}</h3>
                        <p className="text-sm text-muted-foreground">
                          السعر الأصلي: {product.products?.price_sar} ريال
                        </p>
                        {product.custom_price_sar && (
                          <p className="text-sm font-medium text-primary">
                            سعرك المخصص: {product.custom_price_sar} ريال
                          </p>
                        )}
                      </div>
                      <Badge variant={product.is_visible ? "default" : "secondary"}>
                        {product.is_visible ? 'مرئي' : 'مخفي'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* السعر المخصص */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          💰 السعر المخصص (ريال)
                        </Label>
                        {editingProduct === product.id ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={customPrices[product.id] || ''}
                            onChange={(e) => setCustomPrices(prev => ({
                              ...prev,
                              [product.id]: e.target.value
                            }))}
                            className="text-center"
                            placeholder={`${product.products?.price_sar || 0}`}
                          />
                        ) : (
                          <div className="text-lg font-bold text-primary">
                            {getDisplayPrice(product)} ريال
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {editingProduct === product.id 
                            ? "اتركه فارغاً لاستخدام السعر الأصلي" 
                            : product.custom_price_sar 
                              ? "سعر مخصص"
                              : "السعر الأصلي"
                          }
                        </p>
                      </div>
                      
                      {/* نسبة العمولة */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          نسبة العمولة
                        </Label>
                        {editingProduct === product.id ? (
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={commissionRates[product.id] || product.commission_rate}
                            onChange={(e) => setCommissionRates(prev => ({
                              ...prev,
                              [product.id]: Number(e.target.value)
                            }))}
                            className="text-center"
                            placeholder="نسبة %"
                          />
                        ) : (
                          <Badge variant="outline" className="text-lg">
                            {product.commission_rate}%
                          </Badge>
                        )}
                      </div>
                      
                      {/* العمولة المتوقعة */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">العمولة المتوقعة</Label>
                        <div className="text-lg font-bold text-green-600">
                          {calculatePotentialEarning(
                            getDisplayPrice(product),
                            editingProduct === product.id 
                              ? (commissionRates[product.id] || product.commission_rate)
                              : product.commission_rate
                          )} ريال
                        </div>
                        <p className="text-xs text-muted-foreground">
                          عمولتك من كل عملية بيع
                        </p>
                      </div>
                    </div>
                    
                    {/* أزرار الحفظ والتعديل */}
                    {editingProduct === product.id ? (
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm"
                          onClick={() => handleSaveProduct(product.id)}
                          disabled={updateProductMutation.isPending}
                        >
                          <Save className="h-4 w-4 ml-2" />
                          حفظ التغييرات
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(null)}
                        >
                          إلغاء
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(product.id, product.commission_rate, product.custom_price_sar)}
                        >
                          <Edit3 className="h-4 w-4 ml-2" />
                          تعديل السعر والعمولة
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};