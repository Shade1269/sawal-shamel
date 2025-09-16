import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { usePublicStorefront } from '@/hooks/usePublicStorefront';
import { CustomerOTPModal } from '@/components/storefront/CustomerOTPModal';
import { CustomerSessionHeader } from '@/components/storefront/CustomerSessionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Plus, Minus, Store, Package, CheckCircle, User, Shield } from 'lucide-react';
import { toast } from 'sonner';

function PublicStorefront() {
  const { store_slug } = useParams<{ store_slug: string }>();
  const {
    store,
    products,
    cart,
    storeLoading,
    productsLoading,
    storeError,
    addToCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems,
    customerSession,
    setCustomerVerified,
    isCustomerAuthenticated,
    getCustomerInfo
  } = usePublicStorefront({ storeSlug: store_slug || '' });

  const [showCheckout, setShowCheckout] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Handle customer verification from OTP modal
  const handleCustomerVerified = (verifiedCustomer: {
    phone: string;
    name?: string;
    email?: string;
    sessionId: string;
  }) => {
    setCustomerVerified(verifiedCustomer);
    setCustomerData(prev => ({
      ...prev,
      phone: verifiedCustomer.phone,
      name: verifiedCustomer.name || prev.name,
      email: verifiedCustomer.email || prev.email
    }));
    setShowOTPModal(false);
    toast.success('تم تسجيل الدخول بنجاح!');
  };

  // Handle customer logout
  const handleCustomerLogout = () => {
    sessionManager.clearSession();
    setCustomerData({ name: '', phone: '', email: '', address: '' });
    setCustomerSession(null);
    clearCart();
    toast.success('تم تسجيل الخروج بنجاح');
  };
  // Handle checkout initiation
    if (!isCustomerAuthenticated()) {
      setShowOTPModal(true);
      return;
    }
    setShowCheckout(true);
  };

  // Create order using public client
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!store || cart.length === 0) return;

      // Insert order using public client
      const { data: orderData, error: orderError } = await supabasePublic
        .from('orders')
        .insert({
          shop_id: store.id,
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          customer_email: customerData.email || null,
          shipping_address: {
            address: customerData.address,
            phone: customerData.phone,
            name: customerData.name
          },
          subtotal_sar: totalAmount,
          tax_sar: 0,
          shipping_sar: 0,
          total_sar: totalAmount,
          payment_method: 'COD',
          affiliate_store_id: store.id,
          affiliate_commission_sar: totalAmount * 0.1,
          status: 'PENDING'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        merchant_id: store.id,
        title_snapshot: item.title,
        quantity: item.quantity,
        unit_price_sar: item.price,
        line_total_sar: item.price * item.quantity,
        commission_rate: 10
      }));

      const { error: itemsError } = await supabasePublic
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return orderData.id;
    },
    onSuccess: (orderId) => {
      toast.success("تم إنشاء الطلب بنجاح", {
        description: `رقم الطلب: ${orderId}`
      });
      clearCart();
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

  if (storeError || !store) {
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
      <div className="bg-gradient-to-r from-primary/10 to-primary/20 py-12 relative">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline"
                onClick={() => window.location.href = `/`}
                className="bg-white/10 border-white/20 text-foreground hover:bg-white/20"
              >
                الصفحة الرئيسية
              </Button>
              
              {/* Customer Status */}
              <div className="flex items-center gap-3">
                <CustomerSessionHeader
                  isAuthenticated={isCustomerAuthenticated()}
                  customerInfo={getCustomerInfo()}
                  onLoginClick={() => setShowOTPModal(true)}
                  onLogout={handleCustomerLogout}
                  storeSlug={store_slug || ''}
                />
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = `/s/${store_slug}/my-orders`}
                  className="bg-white/10 border-white/20 text-foreground hover:bg-white/20"
                >
                  طلباتي
                </Button>
              </div>
            </div>
          
          {/* Store Info */}
          <div className="text-center">
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
      </div>

      {/* Shopping Cart Button */}
      {totalItems > 0 && (
        <div className="fixed top-4 left-4 z-50">
          <Button 
            onClick={handleCheckoutStart}
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

      {/* Customer OTP Modal */}
      <CustomerOTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerified={handleCustomerVerified}
        storeId={store?.id || ''}
      />

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="h-5 w-5" />
                <h2 className="text-xl font-bold">إتمام الطلب</h2>
              </div>
              
              <div className="space-y-6">
                {/* Cart Items */}
                <div>
                  <h3 className="font-semibold mb-3">عناصر السلة</h3>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.product_id} className="flex items-center gap-3 p-3 border rounded">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-grow">
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.price} ر.س</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="font-semibold">
                          {(item.price * item.quantity).toFixed(2)} ر.س
                        </p>
                      </div>
                    ))}
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
                    disabled={!customerData.name || !customerData.phone || !customerData.address || createOrderMutation.isPending}
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
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PublicStorefront;