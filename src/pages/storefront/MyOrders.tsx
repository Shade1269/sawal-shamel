import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ArrowLeft, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  order_id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_sar: number;
  item_count: number;
  order_items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

function MyOrders() {
  const { store_slug } = useParams<{ store_slug: string }>();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    const initializeSession = async () => {
      if (!store_slug) return;

      try {
        // Get store info first
        const { data: storeData, error: storeError } = await supabasePublic
          .from('affiliate_stores')
          .select('*')
          .eq('store_slug', store_slug)
          .eq('is_active', true)
          .single();

        if (storeError || !storeData) {
          toast.error('المتجر غير موجود');
          return;
        }

        setStore(storeData);

        // Check for existing session
        const existingSession = localStorage.getItem(`customer_session_${store_slug}`);
        if (existingSession) {
          const session = JSON.parse(existingSession);
          if (session.isVerified && session.sessionId) {
            setSessionId(session.sessionId);
            await fetchOrders(storeData.id, session.sessionId);
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        toast.error('خطأ في تحميل الجلسة');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [store_slug]);

  const fetchOrders = async (storeId: string, sessionId: string) => {
    try {
      const { data, error } = await supabasePublic.rpc('get_store_orders_for_session', {
        p_store_id: storeId,
        p_session_id: sessionId
      });

      if (error) throw error;
      
      // Transform data to match Order interface
      setOrders((data || []).map((order: any) => ({
        order_id: order.order_id,
        order_number: order.order_number,
        created_at: order.created_at,
        status: order.status,
        total_sar: order.total_amount,
        item_count: Array.isArray(order.items) ? order.items.length : 0,
        order_items: Array.isArray(order.items) ? order.items.map((item: any) => ({
          id: item.id || '',
          title: item.product_title || '',
          quantity: item.quantity || 0,
          unit_price: item.unit_price || 0,
          total_price: item.total_price || 0
        })) : []
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطأ في تحميل الطلبات');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
      case 'processing':
        return 'default';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'في الانتظار',
      'confirmed': 'مؤكد',
      'processing': 'قيد التجهيز',
      'shipped': 'تم الشحن',
      'delivered': 'تم التسليم',
      'cancelled': 'ملغي'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">تسجيل الدخول مطلوب</h1>
          <p className="text-muted-foreground mb-4">يجب تسجيل الدخول لعرض طلباتك</p>
          <Button onClick={() => navigate(`/s/${store_slug}`)}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة للمتجر
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-bg-primary py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/s/${store_slug}`)}
              className="bg-white/10 border-white/20 text-foreground hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للمتجر
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">طلباتي</h1>
              {store && <p className="text-muted-foreground">من متجر {store.store_name}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
            <p className="text-muted-foreground">لم تقم بإجراء أي طلبات بعد</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.order_id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        طلب رقم {order.order_number}
                      </CardTitle>
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
                    <Badge variant={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        عدد المنتجات: {order.item_count}
                      </span>
                      <span className="font-bold text-lg">
                        {order.total_sar.toFixed(2)} ر.س
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold">تفاصيل الطلب:</h4>
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              الكمية: {item.quantity} × {item.unit_price.toFixed(2)} ر.س
                            </p>
                          </div>
                          <span className="font-semibold">
                            {item.total_price.toFixed(2)} ر.س
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;