import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  UnifiedCard,
  UnifiedCardContent,
  UnifiedCardHeader,
  UnifiedCardTitle,
  UnifiedButton
} from '@/components/design-system';
import { ArrowLeft, Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from '@/components/ui/back-button';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';
import { supabase } from '@/integrations/supabase/client';

const Cart = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);

  // Load store ID from slug
  useEffect(() => {
    const loadStore = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('affiliate_stores')
          .select('id')
          .eq('store_slug', slug)
          .single();
        
        if (error) throw error;
        setStoreId(data.id);
      } catch (err) {
        console.error('Error loading store:', err);
        toast.error('فشل في تحميل بيانات المتجر');
      } finally {
        setStoreLoading(false);
      }
    };

    loadStore();
  }, [slug]);

  // Use the unified cart hook
  const { 
    cart, 
    loading: cartLoading, 
    updateQuantity: updateCartQuantity, 
    removeFromCart: removeCartItem 
  } = useIsolatedStoreCart(storeId || '', slug);

  const cartItems = cart?.items || [];
  const total = cart?.total || 0;

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(itemId);
      return;
    }
    await updateCartQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeCartItem(itemId);
    toast.success("تم حذف المنتج من السلة");
  };

  const handleContinueToShipping = () => {
    if (cartItems.length === 0) {
      toast.error("السلة فارغة! أضف منتجات أولاً");
      return;
    }
    navigate(`/${slug}/checkout`);
  };

  const handleBackToStore = () => {
    navigate(`/${slug}`);
  };

  const isLoading = storeLoading || cartLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <UnifiedButton
                variant="ghost"
                onClick={handleBackToStore}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                العودة للمتجر
              </UnifiedButton>
            </div>
            <h1 className="text-2xl font-bold">سلة التسوق</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <UnifiedCard variant="glass" padding="lg">
            <UnifiedCardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">السلة فارغة</h2>
              <p className="text-muted-foreground mb-6">
                لم تقم بإضافة أي منتجات للسلة بعد
              </p>
              <UnifiedButton variant="primary" onClick={handleBackToStore}>
                تصفح المنتجات
              </UnifiedButton>
            </UnifiedCardContent>
          </UnifiedCard>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <UnifiedCard variant="glass" padding="lg">
                <UnifiedCardHeader>
                  <UnifiedCardTitle>منتجات السلة ({cartItems.length})</UnifiedCardTitle>
                </UnifiedCardHeader>
                <UnifiedCardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_title || 'منتج'}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product_title || 'منتج'}</h3>
                        <p className="text-primary font-bold">
                          {item.unit_price_sar.toFixed(2)} ريال
                        </p>
                        {item.selected_variants && Object.keys(item.selected_variants).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.selected_variants).map(([key, value]) => (
                              <span key={key} className="text-xs bg-muted px-2 py-0.5 rounded">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <UnifiedButton
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </UnifiedButton>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <UnifiedButton
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </UnifiedButton>
                      </div>
                      <UnifiedButton
                        variant="danger"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </UnifiedButton>
                    </div>
                  ))}
                </UnifiedCardContent>
              </UnifiedCard>
            </div>

            {/* Order Summary */}
            <div>
              <UnifiedCard variant="glass" padding="lg">
                <UnifiedCardHeader>
                  <UnifiedCardTitle>ملخص الطلب</UnifiedCardTitle>
                </UnifiedCardHeader>
                <UnifiedCardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span>{total.toFixed(2)} ريال</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>المجموع الكلي:</span>
                      <span className="text-primary">{total.toFixed(2)} ريال</span>
                    </div>
                  </div>
                  <UnifiedButton 
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleContinueToShipping}
                  >
                    متابعة للشحن
                  </UnifiedButton>
                </UnifiedCardContent>
              </UnifiedCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
