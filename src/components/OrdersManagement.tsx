import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Truck,
  X,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UnifiedOrdersService, UnifiedOrderWithItems } from '@/lib/unifiedOrdersService';

// استخدام النوع الموحد بدلاً من التعريف المحلي
type Order = UnifiedOrderWithItems;

interface OrdersManagementProps {
  shopId?: string;
}

export const OrdersManagement: React.FC<OrdersManagementProps> = ({ shopId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [shopId]);

  const fetchOrders = async () => {
    try {
      // استخدام الخدمة الموحدة لجلب الطلبات
      const ordersData = await UnifiedOrdersService.getOrdersWithItems({
        shop_id: shopId,
        limit: 100
      });

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطأ في جلب الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // استخدام الخدمة الموحدة لتحديث حالة الطلب
      const success = await UnifiedOrdersService.updateOrderStatus(orderId, newStatus);
      
      if (!success) {
        throw new Error('فشل في تحديث حالة الطلب');
      }

      toast.success('تم تحديث حالة الطلب');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('خطأ في تحديث حالة الطلب');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'مؤكد';
      case 'PENDING': return 'في الانتظار';
      case 'PROCESSING': return 'قيد المعالجة';
      case 'SHIPPED': return 'تم الشحن';
      case 'DELIVERED': return 'تم التسليم';
      case 'CANCELLED': return 'ملغي';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer_phone.includes(searchQuery) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const OrderDetailModal = ({ order, onClose }: { order: Order; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>تفاصيل الطلب #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* معلومات العميل */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              معلومات العميل
            </h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p><strong>الاسم:</strong> {order.customer_name}</p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <strong>الهاتف:</strong> {order.customer_phone}
              </p>
              {order.customer_email && (
                <p><strong>الإيميل:</strong> {order.customer_email}</p>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <div>
                  <strong>العنوان:</strong>
                  <p>{order.shipping_address.address}</p>
                  <p className="text-sm text-muted-foreground">{order.shipping_address.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* عناصر الطلب */}
          <div>
            <h4 className="font-semibold mb-3">عناصر الطلب ({order.items.length})</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.product_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.unit_price_sar} ريال × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">{item.total_price_sar} ريال</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                المجموع: {order.total_sar} ريال
              </p>
            </div>
          </div>

          {/* إجراءات الطلب */}
          <div>
            <h4 className="font-semibold mb-3">إجراءات الطلب</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                تأكيد
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
              >
                <Clock className="h-4 w-4 mr-1" />
                قيد المعالجة
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
              >
                <Truck className="h-4 w-4 mr-1" />
                تم الشحن
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
              >
                <Package className="h-4 w-4 mr-1" />
                تم التسليم
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
          <p className="text-muted-foreground">إدارة ومتابعة جميع الطلبات</p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          {orders.length} طلب إجمالي
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-md border border-border bg-background"
            >
              <option value="all">جميع الحالات</option>
              <option value="PENDING">في الانتظار</option>
              <option value="CONFIRMED">مؤكد</option>
              <option value="PROCESSING">قيد المعالجة</option>
              <option value="SHIPPED">تم الشحن</option>
              <option value="DELIVERED">تم التسليم</option>
              <option value="CANCELLED">ملغي</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد طلبات</h3>
            <p className="text-muted-foreground">لم يتم العثور على طلبات مطابقة للبحث</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-semibold">
                        طلب #{order.id.slice(0, 8).toUpperCase()}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {order.total_sar} ريال
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} منتج
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">العميل</p>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.customer_phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">العنوان</p>
                    <p className="text-sm">{order.shipping_address.address}</p>
                    <p className="text-sm text-muted-foreground">{order.shipping_address.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                    <p className="text-sm">الدفع عند الاستلام</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    عرض التفاصيل
                  </Button>
                  <div className="flex gap-2">
                    {order.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                      >
                        تأكيد الطلب
                      </Button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                      >
                        بدء المعالجة
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};