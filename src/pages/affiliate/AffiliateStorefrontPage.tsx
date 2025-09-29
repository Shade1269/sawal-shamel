import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Plus, Minus, Store, Package, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';

interface AffiliateStore {
  id: string;
  store_name: string;
  store_slug: string;
  bio: string;
  logo_url: string;
  theme: string;
  is_active: boolean;
}

interface StoreProduct {
  id: string;
  affiliate_store_id: string;
  product_id: string;
  is_visible: boolean;
  sort_order: number;
  commission_rate: number;
  products: {
    id: string;
    title: string;
    price_sar: number;
    image_urls: string[];
    description: string;
  };
}

export default function AffiliateStorefrontPage() {
  const { store_slug } = useParams<{ store_slug: string }>();

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Fetch store data using public client
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['public-affiliate-store', store_slug],
    queryFn: async () => {
      if (!store_slug) return null;
      
      const { data, error } = await supabasePublic
        .from('affiliate_stores')
        .select('*')
        .eq('store_slug', store_slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as AffiliateStore;
    },
    enabled: !!store_slug
  });

  // Fetch store products using public client
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['public-store-products', store?.id],
    queryFn: async () => {
      if (!store) return [];
      
      const { data, error } = await supabasePublic
        .from('affiliate_products')
        .select(`
          *,
          products (
            id,
            title,
            price_sar,
            image_urls,
            description
          )
        `)
        .eq('affiliate_store_id', store.id)
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as StoreProduct[];
    },
    enabled: !!store
  });

  const {
    cart: storefrontCart,
    loading: cartLoading,
    addToCart: addCartItem,
    updateQuantity: updateCartItemQuantity,
    clearCart: clearStorefrontCart,
  } = useIsolatedStoreCart(store?.id || '');

  const cartItems = storefrontCart?.items ?? [];
  const totalAmount = storefrontCart?.total ?? 0;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Create order using public client
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!store || !cartItems.length) return;

      const total = totalAmount;

      // Insert order using public client
      const orderNumber = `EC-${Date.now()}-${Math.random().toString(36).slice(-6).toUpperCase()}`;

      const { data: orderData, error: orderError } = await supabasePublic
        .from('ecommerce_orders')
        .insert({
          shop_id: store.id,
          affiliate_store_id: store.id,
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          customer_email: customerData.email || null,
          shipping_address: {
            address: customerData.address,
            phone: customerData.phone,
            name: customerData.name
          },
          subtotal_sar: total,
          tax_sar: 0,
          shipping_sar: 0,
          total_sar: total,
          payment_method: 'CASH_ON_DELIVERY',
          payment_status: 'PENDING',
          status: 'PENDING',
          affiliate_commission_sar: total * 0.1,
          order_number: orderNumber
        })
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_title: item.product_title,
        quantity: item.quantity,
        unit_price_sar: item.unit_price_sar,
        total_price_sar: item.total_price_sar,
        commission_rate: 10
      }));

      const { error: itemsError } = await supabasePublic
        .from('ecommerce_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await supabasePublic
        .from('ecommerce_payment_transactions')
        .insert({
          order_id: orderData.id,
          transaction_id: `COD-${orderData.id.slice(-6)}`,
          payment_method: 'CASH_ON_DELIVERY',
          payment_status: 'PENDING',
          amount_sar: total,
          currency: 'SAR',
          gateway_name: 'Cash on Delivery',
        });

      return orderData.order_number || orderData.id;
    },
    onSuccess: async (orderNumber) => {
      toast.success("تم إنشاء الطلب بنجاح", {
        description: `رقم الطلب: ${orderNumber}`
      });
      await clearStorefrontCart();
      setShowCheckout(false);
      setCustomerData({ name: '', phone: '', email: '', address: '' });
    },
    onError: (error) => {
      toast.error("خطأ في إنشاء الطلب", {
        description: "حدث خطأ أثناء إنشاء الطلب، يرجى المحاولة مرة أخرى"
      });
      console.error('Order creation error:', error);
    }
  });

  const addToCart = (product: StoreProduct) => {
    if (!store?.id) {
      toast.error('المتجر غير متاح حالياً');
      return;
    }

    addCartItem(
      product.product_id,
      1,
      product.products.price_sar,
      product.products.title
    );
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    updateCartItemQuantity(itemId, newQuantity);
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">المتجر غير موجود</h1>
          <p className="text-muted-foreground">لم يتم العثور على المتجر المطلوب</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/20 py-12">
        <div className="container mx-auto px-4 text-center">
          {store.logo_url && (
            <img 
              src={store.logo_url} 
              alt={store.store_name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          )}
          <h1 className="text-4xl font-bold mb-2">{store.store_name}</h1>
          {store.bio && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {store.bio}
            </p>
          )}
        </div>
      </div>

      {/* Shopping Cart Button */}
      {cartItems.length > 0 && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setShowCheckout(true)}
            className="relative"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            السلة ({totalItems})
            <Badge className="absolute -top-2 -right-2 min-w-[20px] h-5">
              {totalItems}
            </Badge>
          </Button>
        </div>
      )}

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {productsLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
            <p className="text-muted-foreground">لم يتم إضافة أي منتجات إلى هذا المتجر بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.products.image_urls?.[0] || '/placeholder.svg'}
                    alt={product.products.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">
                    {product.products.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.products.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-lg font-bold">
                      {product.products.price_sar} ر.س
                    </Badge>
                    <Button onClick={() => addToCart(product)} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      إضافة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                إتمام الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cart Items */}
              <div>
                <h3 className="font-semibold mb-3">عناصر السلة</h3>
                <div className="space-y-3">
                  {cartLoading ? (
                    <p className="text-muted-foreground">جاري تحميل السلة...</p>
                  ) : cartItems.length === 0 ? (
                    <p className="text-muted-foreground">السلة فارغة</p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded">
                        <img
                          src={item.product_image_url || '/placeholder.svg'}
                          alt={item.product_title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-grow">
                          <p className="font-medium">{item.product_title}</p>
                          <p className="text-sm text-muted-foreground">{item.unit_price_sar} ر.س</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-semibold">
                          {item.total_price_sar.toFixed(2)} ر.س
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span>{totalAmount.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>

              {/* Customer Form */}
              <div className="space-y-4">
                <h3 className="font-semibold">معلومات العميل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="address">العنوان *</Label>
                  <Textarea
                    id="address"
                    value={customerData.address}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1"
                >
                  إغلاق
                </Button>
                <Button
                  onClick={() => createOrderMutation.mutate()}
                  disabled={
                    !customerData.name ||
                    !customerData.phone ||
                    !customerData.address ||
                    createOrderMutation.isPending ||
                    cartLoading ||
                    cartItems.length === 0
                  }
                  className="flex-1"
                >
                  {createOrderMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  تأكيد الطلب
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}