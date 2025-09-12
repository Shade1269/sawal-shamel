import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

  const updateCommissionMutation = useMutation({
    mutationFn: async ({ productId, rate }: { productId: string; rate: number }) => {
      const { error } = await supabase
        .from('affiliate_products')
        .update({ commission_rate: rate })
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-products', storeId] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث نسبة العمولة بنجاح",
      });
      setEditingProduct(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث نسبة العمولة",
        variant: "destructive",
      });
    }
  });

  const handleSaveCommission = (productId: string) => {
    const newRate = commissionRates[productId];
    if (newRate && newRate > 0 && newRate <= 50) {
      updateCommissionMutation.mutate({ productId, rate: newRate });
    } else {
      toast({
        title: "خطأ في البيانات",
        description: "يجب أن تكون نسبة العمولة بين 1% و 50%",
        variant: "destructive",
      });
    }
  };

  const startEditing = (productId: string, currentRate: number) => {
    setEditingProduct(productId);
    setCommissionRates(prev => ({ ...prev, [productId]: currentRate }));
  };

  const calculatePotentialEarning = (price: number, rate: number) => {
    return (price * rate / 100).toFixed(2);
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
                          السعر: {product.products?.price_sar} ريال
                        </p>
                      </div>
                      <Badge variant={product.is_visible ? "default" : "secondary"}>
                        {product.is_visible ? 'مرئي' : 'مخفي'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* نسبة العمولة */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          نسبة العمولة
                        </Label>
                        {editingProduct === product.id ? (
                          <div className="flex gap-2">
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
                            <Button 
                              size="sm"
                              onClick={() => handleSaveCommission(product.id)}
                              disabled={updateCommissionMutation.isPending}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-lg">
                              {product.commission_rate}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(product.id, product.commission_rate)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* العمولة المتوقعة */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">العمولة المتوقعة</Label>
                        <div className="text-lg font-bold text-primary">
                          {product.products?.price_sar ? 
                            calculatePotentialEarning(
                              product.products.price_sar, 
                              editingProduct === product.id ? 
                                (commissionRates[product.id] || product.commission_rate) : 
                                product.commission_rate
                            ) : '0.00'
                          } ريال
                        </div>
                      </div>
                      
                      {/* معلومات إضافية */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">معدل العائد</Label>
                        <div className="text-sm text-muted-foreground">
                          {product.products?.price_sar ? 
                            ((product.commission_rate / 100) * 100).toFixed(1) : '0'
                          }% من سعر المنتج
                        </div>
                      </div>
                    </div>
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