import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  EnhancedButton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';

interface StoreContextType {
  store: {
    id: string;
    store_name: string;
    store_slug: string;
  };
}

export const IsolatedStoreCart: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { store } = useOutletContext<StoreContextType>();
  const { cart, loading, updateQuantity, removeFromCart } = useIsolatedStoreCart(store?.id || '');

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity(itemId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/store/${storeSlug}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للمتجر
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">جاري تحميل السلة...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/store/${storeSlug}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للمتجر
          </Button>
        </div>

        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">السلة فارغة</h3>
          <p className="text-muted-foreground mb-4">
            لم تقم بإضافة أي منتجات للسلة بعد
          </p>
          <Button onClick={() => navigate(`/store/${storeSlug}`)}>
            تسوق الآن
          </Button>
        </div>
      </div>
    );
  }

  const shipping = 25; // Fixed shipping cost
  const total = cart.total + shipping;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/store/${storeSlug}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للمتجر
        </Button>
        <h1 className="text-2xl font-bold">سلة التسوق</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.product_image_url && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product_image_url}
                        alt={item.product_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-sm">{item.product_title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.unit_price_sar} ر.س للقطعة
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItems.has(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <Badge variant="secondary" className="min-w-[2rem] justify-center">
                          {item.quantity}
                        </Badge>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItems.has(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {item.total_price_sar} ر.س
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي</span>
                  <span>{cart.total} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>الشحن</span>
                  <span>{shipping} ر.س</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>المجموع الكلي</span>
                  <span>{total} ر.س</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate(`/store/${storeSlug}/checkout`)}
              >
                إتمام الطلب
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                الدفع عند الاستلام متاح
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};