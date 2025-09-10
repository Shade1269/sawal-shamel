import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Package, Phone, MapPin, User, DollarSign, Clock, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_sar: number;
  subtotal_sar: number;
  vat_sar: number;
  payment_method: string;
  status: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  title_snapshot: string;
  quantity: number;
  unit_price_sar: number;
  line_total_sar: number;
  product_id: string;
  commission_amount?: number;
}

interface StoreOrdersProps {
  shopId: string;
}

const statusColors = {
  'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-200',
  'SHIPPED': 'bg-purple-100 text-purple-800 border-purple-200',
  'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
  'CANCELED': 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  'PENDING': Clock,
  'CONFIRMED': CheckCircle,
  'SHIPPED': Package,
  'DELIVERED': CheckCircle,
  'CANCELED': XCircle
};

const statusLabels = {
  'PENDING': 'في الانتظار',
  'CONFIRMED': 'مؤكد',
  'SHIPPED': 'مشحون',
  'DELIVERED': 'تم التسليم',
  'CANCELED': 'ملغي'
};

export const StoreOrders: React.FC<StoreOrdersProps> = ({ shopId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (shopId) {
      fetchOrders();
    }
  }, [shopId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // For now, we'll show empty orders since we're moving to Firestore
      // This would need to be implemented with Firestore orders collection
      setOrders([]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلبات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrder(orderId);
      
      // This would need to be implemented in Firestore
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة الطلب إلى ${statusLabels[newStatus as keyof typeof statusLabels]}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive"
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  const calculateTotalCommission = (orderItems: OrderItem[]) => {
    return orderItems.reduce((total, item) => 
      total + ((item.commission_amount || 0) * item.quantity), 0
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">لا توجد طلبات بعد</h3>
        <p className="text-muted-foreground">
          عندما يقوم العملاء بإجراء طلبات من متجرك، ستظهر هنا
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{orders.length}</p>
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
                <p className="text-2xl font-bold">
                  {orders.reduce((sum, order) => sum + Number(order.total_sar), 0).toFixed(2)} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العمولات</p>
                <p className="text-2xl font-bold">
                  {orders.reduce((sum, order) => 
                    sum + calculateTotalCommission(order.order_items), 0
                  ).toFixed(2)} ر.س
                </p>
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
                <p className="text-sm text-muted-foreground">الطلبات المكتملة</p>
                <p className="text-2xl font-bold">
                  {orders.filter(order => order.status === 'DELIVERED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
          const totalCommission = calculateTotalCommission(order.order_items);
          
          return (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
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
                  
                  <Badge 
                    className={`${statusColors[order.status as keyof typeof statusColors]} flex items-center gap-1`}
                  >
                    <StatusIcon className="h-3 w-3" />
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
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{order.payment_method}</p>
                      <p className="text-xs text-muted-foreground">وسيلة الدفع</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">المنتجات</p>
                      <p className="font-semibold">{order.subtotal_sar.toFixed(2)} ر.س</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">الضريبة</p>
                      <p className="font-semibold">{order.vat_sar.toFixed(2)} ر.س</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">المجموع</p>
                      <p className="font-semibold text-lg">{order.total_sar.toFixed(2)} ر.س</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">عمولتك</p>
                      <p className="font-semibold text-lg text-green-600">{totalCommission.toFixed(2)} ر.س</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 ml-2" />
                          عرض التفاصيل
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl" dir="rtl">
                        <DialogHeader>
                          <DialogTitle>تفاصيل الطلب #{order.id.slice(-8)}</DialogTitle>
                          <DialogDescription>
                            تفاصيل كاملة عن الطلب والمنتجات
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">معلومات العميل</h4>
                            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                              <p><span className="font-medium">الاسم:</span> {order.customer_name}</p>
                              <p><span className="font-medium">الهاتف:</span> {order.customer_phone}</p>
                              {order.shipping_address && (
                                <p><span className="font-medium">العنوان:</span> {JSON.stringify(order.shipping_address).replace(/[{}",]/g, ' ')}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">المنتجات المطلوبة</h4>
                            <div className="space-y-2">
                              {order.order_items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                  <div>
                                    <p className="font-medium">{item.title_snapshot}</p>
                                    <p className="text-sm text-muted-foreground">
                                      الكمية: {item.quantity} × {item.unit_price_sar.toFixed(2)} ر.س
                                    </p>
                                  </div>
                                  <div className="text-left">
                                    <p className="font-semibold">{item.line_total_sar.toFixed(2)} ر.س</p>
                                    <p className="text-sm text-green-600">
                                      عمولة: {((item.commission_amount || 0) * item.quantity).toFixed(2)} ر.س
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                      disabled={updatingOrder === order.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">في الانتظار</SelectItem>
                        <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                        <SelectItem value="SHIPPED">مشحون</SelectItem>
                        <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                        <SelectItem value="CANCELED">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {updatingOrder === order.id && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};