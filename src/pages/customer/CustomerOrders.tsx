import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import { ReturnRequestDialog } from '@/components/orders';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TruckIcon,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Phone,
  MapPin,
  RotateCcw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Order {
  id: string;
  order_number?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  total_amount_sar: number;
  payment_status: string;
  created_at: string;
  shipping_address?: any;
  items: Array<{
    product_title: string;
    quantity: number;
    unit_price_sar: number;
    total_price_sar: number;
    product_image_url?: string;
  }>;
}

const statusConfig = {
  PENDING: { label: 'قيد المراجعة', icon: Clock, color: 'bg-yellow-500' },
  PAID: { label: 'تم الدفع', icon: CheckCircle, color: 'bg-green-500' },
  PROCESSING: { label: 'قيد التجهيز', icon: Package, color: 'bg-indigo-500' },
  SHIPPED: { label: 'تم الشحن', icon: TruckIcon, color: 'bg-purple-500' },
  DELIVERED: { label: 'تم التوصيل', icon: CheckCircle, color: 'bg-green-600' },
  CANCELLED: { label: 'ملغي', icon: XCircle, color: 'bg-red-500' },
  FAILED: { label: 'فشل', icon: XCircle, color: 'bg-red-600' },
};

const CustomerOrders: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, customer, isLoading: authLoading } = useCustomerAuth();
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<{ id: string; amount: number } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/${slug}/auth?returnUrl=/${slug}/orders`);
    }
  }, [isAuthenticated, authLoading, slug, navigate]);

  // Fetch orders
  const { data: orders, isLoading: ordersLoading, refetch } = useQuery<Order[]>({
    queryKey: ['customer-orders', slug, customer?.phone],
    queryFn: async () => {
      if (!customer?.phone) throw new Error('No customer phone');

      // جلب الطلبات من order_hub
      const { data: hubOrders, error: hubError } = await supabase
        .from('order_hub')
        .select('*')
        .eq('customer_phone', customer.phone)
        .order('created_at', { ascending: false });

      if (hubError) throw hubError;

      // جلب تفاصيل كل طلب من الجداول الأصلية
      const ordersWithItems = await Promise.all(
        (hubOrders || []).map(async (hubOrder) => {
          let items: any[] = [];
          let orderDetails: any = null;

          if (hubOrder.source === 'ecommerce') {
            const { data: ecomData } = await supabase
              .from('ecommerce_orders')
              .select('*, ecommerce_order_items(*)')
              .eq('id', hubOrder.source_order_id)
              .maybeSingle();
            
            if (ecomData) {
              orderDetails = ecomData;
              items = ecomData.ecommerce_order_items || [];
            }
          } else if (hubOrder.source === 'simple') {
            const { data: simpleData } = await supabase
              .from('simple_orders')
              .select('*, simple_order_items(*)')
              .eq('id', hubOrder.source_order_id)
              .maybeSingle();
            
            if (simpleData) {
              orderDetails = simpleData;
              items = simpleData.simple_order_items || [];
            }
          }

          return {
            id: hubOrder.id,
            order_number: hubOrder.order_number || hubOrder.id.slice(0, 8).toUpperCase(),
            customer_name: hubOrder.customer_name,
            customer_phone: hubOrder.customer_phone,
            customer_email: hubOrder.customer_email,
            total_amount_sar: hubOrder.total_amount_sar || 0,
            payment_status: hubOrder.payment_status || 'PENDING',
            created_at: hubOrder.created_at,
            shipping_address: orderDetails?.shipping_address || hubOrder.shipping_address,
            items: items.map(item => ({
              product_title: item.product_title,
              quantity: item.quantity,
              unit_price_sar: item.unit_price_sar,
              total_price_sar: item.total_price_sar,
              product_image_url: item.product_image_url
            }))
          };
        })
      );

      return ordersWithItems as Order[];
    },
    enabled: !!customer?.phone && isAuthenticated,
  });

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">جاري تحميل طلباتك...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen gradient-bg-secondary">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">طلباتي</h1>
                <p className="text-sm text-muted-foreground">
                  مرحباً {customer?.full_name || customer?.phone}
                </p>
              </div>
            </div>
            
            <UnifiedButton
              variant="ghost"
              onClick={() => navigate(`/${slug}`)}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للمتجر
            </UnifiedButton>
          </div>
        </div>
      </header>

      {/* Orders List */}
      <main className="container mx-auto px-4 py-8">
        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {orders.length} {orders.length === 1 ? 'طلب' : 'طلبات'}
              </h2>
              <UnifiedButton 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
              >
                تحديث
              </UnifiedButton>
            </div>

            {orders.map((order) => {
              const StatusInfo = statusConfig[order.payment_status as keyof typeof statusConfig] || statusConfig.PENDING;
              
              return (
                <UnifiedCard key={order.id} variant="glass" hover="lift">
                  <UnifiedCardHeader className="bg-muted/50">
                    <div className="flex items-center justify-between">
                      <UnifiedCardTitle className="text-lg">
                        طلب #{order.order_number}
                      </UnifiedCardTitle>
                      <UnifiedBadge className={`${StatusInfo.color} text-white`}>
                        <StatusInfo.icon className="w-4 h-4 ml-1" />
                        {StatusInfo.label}
                      </UnifiedBadge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDistanceToNow(new Date(order.created_at), { 
                          addSuffix: true, 
                          locale: ar 
                        })}
                      </span>
                      {order.customer_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {order.customer_phone}
                        </span>
                      )}
                    </div>
                  </UnifiedCardHeader>

                  <UnifiedCardContent className="p-6 space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                          {item.product_image_url && (
                            <img
                              src={item.product_image_url}
                              alt={item.product_title}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.product_title}</p>
                            <p className="text-sm text-muted-foreground">
                              الكمية: {item.quantity} × {item.unit_price_sar} ر.س
                            </p>
                          </div>
                          <p className="font-semibold">
                            {item.total_price_sar.toFixed(2)} ر.س
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Order Total */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">المجموع الكلي</span>
                      <span className="text-2xl font-bold text-primary">
                        {order.total_amount_sar.toFixed(2)} ر.س
                      </span>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="font-semibold flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            عنوان التوصيل
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {typeof order.shipping_address === 'string' 
                              ? order.shipping_address 
                              : JSON.stringify(order.shipping_address, null, 2)}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Return Request Button */}
                    {order.payment_status === 'DELIVERED' && (
                      <>
                        <Separator />
                        <UnifiedButton
                          variant="outline"
                          fullWidth
                          onClick={() => setSelectedOrderForReturn({ id: order.id, amount: order.total_amount_sar })}
                        >
                          <RotateCcw className="w-4 h-4 ml-2" />
                          طلب إرجاع الطلب
                        </UnifiedButton>
                      </>
                    )}
                  </UnifiedCardContent>
                </UnifiedCard>
              );
            })}
          </div>
        ) : (
          <UnifiedCard variant="glass" className="text-center p-12">
            <div className="space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">لا توجد طلبات</h3>
                <p className="text-muted-foreground mb-6">
                  لم تقم بتقديم أي طلبات بعد. ابدأ التسوق الآن!
                </p>
                <UnifiedButton onClick={() => navigate(`/${slug}`)}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  تصفح المنتجات
                </UnifiedButton>
              </div>
            </div>
          </UnifiedCard>
        )}
      </main>

      {/* Return Request Dialog */}
      {selectedOrderForReturn && (
        <ReturnRequestDialog
          open={!!selectedOrderForReturn}
          onOpenChange={(open) => !open && setSelectedOrderForReturn(null)}
          orderId={selectedOrderForReturn.id}
          orderAmount={selectedOrderForReturn.amount}
        />
      )}
    </div>
  );
};

export default CustomerOrders;
