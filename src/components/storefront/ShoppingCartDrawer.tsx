import { useState, useEffect } from 'react';
import { UnifiedButton, UnifiedBadge } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number;
  products?: {
    title: string;
    image_urls?: string[];
  };
}

interface ShoppingCartDrawerProps {
  storeSlug: string;
  onItemsChange?: (count: number) => void;
}

const ShoppingCartDrawer = ({ storeSlug, onItemsChange }: ShoppingCartDrawerProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen, storeSlug]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const sessionData = localStorage.getItem(`ea_session_${storeSlug}`);
      if (!sessionData) return;

      const session = JSON.parse(sessionData);

      const { data: cart } = await supabasePublic
        .from('shopping_carts')
        .select('id')
        .eq('session_id', session.sessionId)
        .maybeSingle();

      if (!cart) return;

      const { data: items, error } = await supabasePublic
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          unit_price_sar,
          total_price_sar
        `)
        .eq('cart_id', cart.id);

      if (error) throw error;

        // جلب تفاصيل المنتجات
        const itemsWithProducts = await Promise.all(
          (items || []).map(async (item) => {
            return {
              ...item,
              products: { title: 'منتج', image_urls: [] }
            };
          })
        );

      setCartItems(itemsWithProducts);
      onItemsChange?.(itemsWithProducts.reduce((sum, item) => sum + item.quantity, 0));

    } catch (error: any) {
      console.error('Error loading cart:', error);
      toast({
        title: "خطأ في تحميل السلة",
        description: "تعذر تحميل عناصر السلة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      const item = cartItems.find(i => i.id === itemId);
      if (!item) return;

      const newTotal = item.unit_price_sar * newQuantity;

      const { error } = await supabasePublic
        .from('cart_items')
        .update({
          quantity: newQuantity,
          total_price_sar: newTotal
        })
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(items => 
        items.map(i => 
          i.id === itemId 
            ? { ...i, quantity: newQuantity, total_price_sar: newTotal }
            : i
        )
      );

      const totalItems = cartItems.reduce((sum, i) => 
        i.id === itemId ? sum + newQuantity : sum + i.quantity, 0
      );
      onItemsChange?.(totalItems);

    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast({
        title: "خطأ في التحديث",
        description: "تعذر تحديث كمية المنتج",
        variant: "destructive"
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabasePublic
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(items => items.filter(i => i.id !== itemId));
      
      const newTotal = cartItems.filter(i => i.id !== itemId)
        .reduce((sum, item) => sum + item.quantity, 0);
      onItemsChange?.(newTotal);

      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج من السلة",
      });

    } catch (error: any) {
      console.error('Error removing item:', error);
      toast({
        title: "خطأ في الحذف",
        description: "تعذر حذف المنتج من السلة",
        variant: "destructive"
      });
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.total_price_sar, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    setIsOpen(false);
    navigate(storeSlug ? `/checkout?store=${storeSlug}` : '/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <UnifiedButton variant="outline" className="relative">
          <ShoppingCart className="h-4 w-4 ml-2" />
          السلة
          {getTotalItems() > 0 && (
            <UnifiedBadge variant="error" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {getTotalItems()}
            </UnifiedBadge>
          )}
        </UnifiedButton>
      </SheetTrigger>
      
      <SheetContent>
        <SheetHeader>
          <SheetTitle>سلة التسوق</SheetTitle>
          <SheetDescription>
            {cartItems.length === 0 
              ? "سلة التسوق فارغة" 
              : `${getTotalItems()} منتج في السلة`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>جاري تحميل السلة...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">سلة التسوق فارغة</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.products?.image_urls?.[0] ? (
                      <img
                        src={item.products.image_urls[0]}
                        alt={item.products.title || 'منتج'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {item.products?.title || 'منتج'}
                    </h4>
                    
                    <div className="text-xs text-muted-foreground mb-2">
                      الكمية: {item.quantity}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-primary">
                        {item.total_price_sar.toFixed(2)} ر.س
                      </div>

                      <div className="flex items-center gap-2">
                        <UnifiedButton
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </UnifiedButton>
                        
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <UnifiedButton
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </UnifiedButton>

                        <UnifiedButton
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </UnifiedButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <Separator />
              
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>المجموع الكلي:</span>
                <span className="text-primary">{getTotalPrice().toFixed(2)} ر.س</span>
              </div>

              <UnifiedButton
                onClick={proceedToCheckout}
                variant="primary"
                className="w-full"
              >
                متابعة الدفع
              </UnifiedButton>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCartDrawer;