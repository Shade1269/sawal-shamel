import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Package, Phone, MapPin, User, DollarSign, Clock, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUnifiedOrdersStats, useUnifiedOrders } from '@/hooks/useUnifiedOrders';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_sar: number;
  subtotal_sar: number;
  tax_sar: number;
  payment_method: string;
  status: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_title: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number;
  commission_rate: number;
  commission_sar: number;
}

interface StoreOrdersProps {
  shopId: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const statusColors = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'CONFIRMED': 'bg-blue-100 text-blue-800',
  'PROCESSING': 'bg-purple-100 text-purple-800',
  'SHIPPED': 'bg-indigo-100 text-indigo-800',
  'DELIVERED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800'
};

const statusLabels = {
  'PENDING': 'في الانتظار',
  'CONFIRMED': 'مؤكد',
  'PROCESSING': 'قيد المعالجة',
  'SHIPPED': 'تم الشحن',
  'DELIVERED': 'تم التسليم',
  'CANCELLED': 'ملغي'
};

export const StoreOrders: React.FC<StoreOrdersProps> = ({ shopId }) => {
  const { stats, loading: statsLoading } = useUnifiedOrdersStats(shopId);
  const { orders, loading: ordersLoading, updateOrderStatus } = useUnifiedOrders({ storeId: shopId });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const updateStatus = async (orderId: string, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديث حالة الطلب بنجاح"
      });
    } else {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive"
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer_phone.includes(searchQuery) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (statsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">لا توجد طلبات حتى الآن</h3>
        <p className="text-muted-foreground mt-1">
          عندما يقوم العملاء بتقديم طلبات، ستظهر هنا.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات المتجر */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">طلبات في الانتظار</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الطلبات المؤكدة</p>
                <p className="text-2xl font-bold">{stats.confirmedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ابحث باسم العميل، رقم الهاتف أو معرف الطلب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="حالة الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="PENDING">في الانتظار</SelectItem>
                <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                <SelectItem value="PROCESSING">قيد المعالجة</SelectItem>
                <SelectItem value="SHIPPED">تم الشحن</SelectItem>
                <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                <SelectItem value="CANCELLED">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الطلبات */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">طلب #{order.id.slice(-8)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                
                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">العميل</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{order.customer_phone}</p>
                    <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{order.total_amount_sar?.toFixed(2) || '0.00'} ر.س</p>
                    <p className="text-xs text-muted-foreground">إجمالي المبلغ</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order as any)}>
                      <Eye className="h-4 w-4 mr-1" />
                      عرض التفاصيل
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>تفاصيل الطلب #{order.id.slice(-8)}</DialogTitle>
                      <DialogDescription>
                        معلومات مفصلة عن الطلب والعناصر المطلوبة
                      </DialogDescription>
                    </DialogHeader>
                    
                    {selectedOrder && (
                      <div className="space-y-4">
                        {/* معلومات العميل */}
                        <div>
                          <h4 className="font-medium mb-2">معلومات العميل</h4>
                          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <p><strong>الاسم:</strong> {selectedOrder.customer_name}</p>
                            <p><strong>الهاتف:</strong> {selectedOrder.customer_phone}</p>
                            <p><strong>العنوان:</strong> {selectedOrder.shipping_address.address}</p>
                          </div>
                        </div>

                        {/* عناصر الطلب */}
                        <div>
                          <h4 className="font-medium mb-2">عناصر الطلب</h4>
                          <div className="space-y-2">
                            {selectedOrder.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{item.product_title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.unit_price_sar} ريال × {item.quantity}
                                  </p>
                                </div>
                                <span className="font-semibold">{item.total_price_sar} ريال</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between text-lg font-bold">
                            <span>المجموع الكلي:</span>
                            <span>{selectedOrder.total_sar} ريال</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <div className="flex gap-2">
                  {order.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order.id, 'CONFIRMED')}
                    >
                      تأكيد الطلب
                    </Button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order.id, 'PROCESSING')}
                    >
                      بدء المعالجة
                    </Button>
                  )}
                  {order.status === 'PROCESSING' && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order.id, 'SHIPPED')}
                    >
                      تم الشحن
                    </Button>
                  )}
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateStatus(order.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">في الانتظار</SelectItem>
                      <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                      <SelectItem value="PROCESSING">قيد المعالجة</SelectItem>
                      <SelectItem value="SHIPPED">تم الشحن</SelectItem>
                      <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                      <SelectItem value="CANCELLED">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">لا توجد طلبات مطابقة</h3>
            <p className="text-muted-foreground">جرب تغيير معايير البحث أو الفلاتر</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};