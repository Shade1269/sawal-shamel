import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, ShoppingBag, Loader2 } from 'lucide-react';
import { storeOrderService } from '@/services/storeOrderService';
import { toast } from 'sonner';

interface StoreContextType {
  store: {
    id: string;
    store_name: string;
    store_slug: string;
    shop_id: string;
  };
}

interface OrderItem {
  id: string;
  product_title: string;
  product_image_url?: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number;
}

interface Order {
  id: string;
  order_number?: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total_sar: number;
  created_at: string;
  items: OrderItem[];
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'secondary';
    case 'confirmed':
      return 'default';
    case 'shipped':
      return 'outline';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'secondary';
  }
};

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'قيد المعالجة';
    case 'confirmed':
      return 'مؤكد';
    case 'shipped':
      return 'تم الشحن';
    case 'delivered':
      return 'تم التسليم';
    case 'cancelled':
      return 'ملغي';
    default:
      return status;
  }
};

export const MyStoreOrders: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { store } = useOutletContext<StoreContextType>();
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get('highlight');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!store?.id) return;

    const sessionId = localStorage.getItem(`store_session_${store.id}`);
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      const result = await storeOrderService.getStoreOrders(store.id, sessionId);
      if (result.success) {
        setOrders(result.orders as Order[]);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store?.id) {
      loadOrders();
    }
  }, [store?.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <UnifiedButton variant="ghost" size="sm" onClick={() => navigate(`/${storeSlug}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للمتجر
          </UnifiedButton>
        </div>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <UnifiedButton variant="ghost" size="sm" onClick={() => navigate(`/${storeSlug}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للمتجر
          </UnifiedButton>
        </div>

        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
          <p className="text-muted-foreground mb-4">
            لم تقم بإجراء أي طلبات من هذا المتجر بعد
          </p>
          <UnifiedButton onClick={() => navigate(`/${storeSlug}`)}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            تسوق الآن
          </UnifiedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <UnifiedButton variant="ghost" size="sm" onClick={() => navigate(`/${storeSlug}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للمتجر
        </UnifiedButton>
        <h1 className="text-2xl font-bold">طلباتي</h1>
        <UnifiedBadge variant="secondary">{orders.length} طلب</UnifiedBadge>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <UnifiedCard 
            key={order.id}
            variant="glass"
            className={`${
              highlightOrderId === order.id ? 'ring-2 ring-primary animate-pulse' : ''
            }`}
          >
            <UnifiedCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <UnifiedCardTitle className="text-lg">
                    {order.order_number ? `طلب ${order.order_number}` : `طلب #${order.id.slice(-8)}`}
                  </UnifiedCardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <UnifiedBadge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusText(order.status)}
                  </UnifiedBadge>
                  <p className="text-lg font-semibold mt-1">
                    {order.total_sar} ر.س
                  </p>
                </div>
              </div>
            </UnifiedCardHeader>

            <UnifiedCardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">المنتجات:</h4>
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    {item.product_image_url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product_image_url}
                          alt={item.product_title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate">
                        {item.product_title}
                      </h5>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          الكمية: {item.quantity} × {item.unit_price_sar} ر.س
                        </p>
                        <p className="text-sm font-semibold">
                          {item.total_price_sar} ر.س
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">اسم العميل:</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">رقم الجوال:</p>
                  <p className="font-medium" dir="ltr">{order.customer_phone}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {order.status.toLowerCase() === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <UnifiedButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info('يمكنك التواصل مع المتجر لإلغاء الطلب');
                    }}
                  >
                    طلب إلغاء
                  </UnifiedButton>
                </div>
              )}

              {(order.status.toLowerCase() === 'shipped' ||
                order.status.toLowerCase() === 'delivered') && (
                <div className="bg-success/10 p-3 rounded-lg">
                  <p className="text-sm text-success">
                    {order.status.toLowerCase() === 'delivered'
                      ? '✅ تم تسليم طلبك بنجاح!'
                      : '🚚 طلبك في الطريق إليك'
                    }
                  </p>
                </div>
              )}
            </UnifiedCardContent>
          </UnifiedCard>
        ))}
      </div>

      {/* Contact Info */}
      <UnifiedCard variant="glass">
        <UnifiedCardContent className="p-4">
          <div className="text-center">
            <h4 className="font-medium mb-2">تحتاج مساعدة؟</h4>
            <p className="text-sm text-muted-foreground mb-3">
              يمكنك التواصل مع {store?.store_name} للاستفسار عن طلباتك
            </p>
            <UnifiedButton variant="outline" size="sm">
              التواصل مع المتجر
            </UnifiedButton>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};