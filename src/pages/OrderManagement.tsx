import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';
import { maskPhone, maskEmail, shouldShowFullCustomerData } from '@/lib/privacy';
import { UnifiedButton, UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle, UnifiedBadge } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_sar: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  shipping_address: any;
  notes: string | null;
  internal_notes: string | null;
  shop_id: string;
}

interface OrderItem {
  id: string;
  product_title: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number | null;
  product_sku: string | null;
}

const OrderManagement = () => {
  const { profile } = useFastAuth();
  const showFullData = shouldShowFullCustomerData(profile?.role);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const fetchOrders = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // جلب من order_hub أولاً
      let query = supabase
        .from('order_hub')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by shop if user is merchant
      if (profile.role === 'merchant') {
        const { data: shops } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', profile.id);
        
        if (shops?.length) {
          query = query.in('shop_id', shops.map(shop => shop.id));
        }
      }

      // Filter by status if selected
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as any);
      }

      // Search filter
      if (searchTerm) {
        query = query.or(`order_number.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%`);
      }

      const { data: hubOrders, error } = await query;

      if (error) {
        throw error;
      }

      // جلب التفاصيل من الجداول الأصلية
      const ordersWithDetails = await Promise.all(
        (hubOrders || []).map(async (hubOrder) => {
          if (hubOrder.source === 'ecommerce') {
            const { data: ecomOrder } = await supabase
              .from('ecommerce_orders')
              .select('*')
              .eq('id', hubOrder.source_order_id)
              .single();
            
            return {
              id: hubOrder.id,
              order_number: hubOrder.order_number,
              status: hubOrder.status,
              payment_status: hubOrder.payment_status,
              total_sar: hubOrder.total_amount_sar,
              customer_name: hubOrder.customer_name,
              customer_phone: hubOrder.customer_phone,
              customer_email: hubOrder.customer_email,
              created_at: hubOrder.created_at,
              shipped_at: ecomOrder?.shipped_at || null,
              delivered_at: ecomOrder?.delivered_at || null,
              tracking_number: ecomOrder?.tracking_number || null,
              shipping_address: ecomOrder?.shipping_address || null,
              notes: ecomOrder?.notes || null,
              internal_notes: ecomOrder?.internal_notes || null,
              shop_id: hubOrder.shop_id || ecomOrder?.shop_id,
            };
          } else if (hubOrder.source === 'simple') {
            const { data: simpleOrder } = await supabase
              .from('simple_orders')
              .select('*')
              .eq('id', hubOrder.source_order_id)
              .single();
            
            return {
              id: hubOrder.id,
              order_number: hubOrder.order_number,
              status: hubOrder.status,
              payment_status: hubOrder.payment_status,
              total_sar: hubOrder.total_amount_sar,
              customer_name: hubOrder.customer_name,
              customer_phone: hubOrder.customer_phone,
              customer_email: hubOrder.customer_email,
              created_at: hubOrder.created_at,
              shipped_at: null,
              delivered_at: null,
              tracking_number: null,
              shipping_address: simpleOrder?.shipping_address || null,
              notes: null,
              internal_notes: null,
              shop_id: hubOrder.shop_id,
            };
          }
          return null;
        })
      );

      setOrders(ordersWithDetails.filter((order): order is Order => order !== null));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      // جلب من order_hub أولاً
      const { data: hubOrder, error: hubError } = await supabase
        .from('order_hub')
        .select('*')
        .eq('id', orderId)
        .single();

      if (hubError) throw hubError;

      // جلب العناصر من الجدول الأصلي
      if (hubOrder.source === 'ecommerce') {
        const { data, error } = await supabase
          .from('ecommerce_order_items')
          .select('*')
          .eq('order_id', hubOrder.source_order_id);

        if (error) throw error;
        setOrderItems(data || []);
      } else if (hubOrder.source === 'simple') {
        const { data, error } = await supabase
          .from('simple_order_items')
          .select('*')
          .eq('order_id', hubOrder.source_order_id);

        if (error) throw error;
        // تحويل simple_order_items إلى OrderItem format
        const mappedItems = (data || []).map(item => ({
          id: item.id,
          product_title: item.product_title,
          quantity: item.quantity,
          unit_price_sar: item.unit_price_sar,
          total_price_sar: item.total_price_sar,
          product_sku: null, // simple orders don't have SKU
        }));
        setOrderItems(mappedItems);
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('حدث خطأ أثناء تحميل عناصر الطلب');
    }
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      // جلب من order_hub أولاً
      const { data: hubOrder, error: hubError } = await supabase
        .from('order_hub')
        .select('*')
        .eq('id', selectedOrder.id)
        .single();

      if (hubError) throw hubError;

      // تحديث order_hub
      const { error: hubUpdateError } = await supabase
        .from('order_hub')
        .update({ 
          status: newStatus,
          payment_status: newStatus === 'DELIVERED' ? 'PAID' : hubOrder.payment_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (hubUpdateError) throw hubUpdateError;

      // تحديث الجدول الأصلي
      const updates: any = { 
        status: newStatus,
        internal_notes: statusNotes || selectedOrder.internal_notes
      };

      // Add timestamps based on status
      const now = new Date().toISOString();
      switch (newStatus) {
        case 'CONFIRMED':
          updates.confirmed_at = now;
          break;
        case 'SHIPPED':
          updates.shipped_at = now;
          if (trackingNumber) {
            updates.tracking_number = trackingNumber;
          }
          break;
        case 'DELIVERED':
          updates.delivered_at = now;
          break;
        case 'CANCELLED':
          updates.cancelled_at = now;
          break;
      }

      if (hubOrder.source === 'ecommerce') {
        const { error } = await supabase
          .from('ecommerce_orders')
          .update(updates)
          .eq('id', hubOrder.source_order_id);

        if (error) throw error;

        // Add status history
        await supabase
          .from('order_status_history')
          .insert({
            order_id: hubOrder.source_order_id,
            new_status: newStatus as any,
            notes: statusNotes || null,
            changed_by: profile?.id || ''
          });
      } else if (hubOrder.source === 'simple') {
        const { error } = await supabase
          .from('simple_orders')
          .update({ order_status: newStatus })
          .eq('id', hubOrder.source_order_id);

        if (error) throw error;
      }

      toast.success('تم تحديث حالة الطلب بنجاح');
      setStatusUpdateDialog(false);
      setNewStatus('');
      setStatusNotes('');
      setTrackingNumber('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [profile, filterStatus, searchTerm]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      PENDING: { label: 'في الانتظار', variant: 'secondary', icon: Clock },
      CONFIRMED: { label: 'مؤكد', variant: 'default', icon: CheckCircle },
      PREPARING: { label: 'قيد التحضير', variant: 'default', icon: Package },
      SHIPPED: { label: 'تم الشحن', variant: 'default', icon: Truck },
      DELIVERED: { label: 'تم التسليم', variant: 'default', icon: CheckCircle },
      CANCELLED: { label: 'ملغى', variant: 'destructive', icon: XCircle }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary', icon: Clock };
    const IconComponent = config.icon;
    
    return (
      <UnifiedBadge variant={config.variant} className="flex items-center gap-1" leadingIcon={<IconComponent className="h-3 w-3" />}>
        {config.label}
      </UnifiedBadge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: 'في الانتظار', variant: 'secondary' },
      PAID: { label: 'مدفوع', variant: 'default' },
      FAILED: { label: 'فشل', variant: 'destructive' },
      REFUNDED: { label: 'مسترد', variant: 'outline' }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <UnifiedBadge variant={config.variant}>{config.label}</UnifiedBadge>;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <UnifiedCard variant="flat" hover="lift">
        <UnifiedCardHeader>
          <UnifiedCardTitle className="text-2xl font-bold">إدارة الطلبات</UnifiedCardTitle>
          <UnifiedCardDescription>
            إدارة ومتابعة جميع طلبات المتجر
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">الطلبات</TabsTrigger>
              <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">البحث</Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">حالة الطلب</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="PENDING">في الانتظار</SelectItem>
                      <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                      <SelectItem value="PREPARING">قيد التحضير</SelectItem>
                      <SelectItem value="SHIPPED">تم الشحن</SelectItem>
                      <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                      <SelectItem value="CANCELLED">ملغى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>حالة الدفع</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {showFullData ? order.customer_phone : maskPhone(order.customer_phone)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {order.total_sar} ريال
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <UnifiedButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    fetchOrderItems(order.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </UnifiedButton>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>تفاصيل الطلب {selectedOrder?.order_number}</DialogTitle>
                                  <DialogDescription>
                                    عرض تفاصيل الطلب والعناصر المطلوبة
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedOrder && (
                                  <div className="space-y-6">
                                    {/* Customer Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <UnifiedCard variant="flat">
                                        <UnifiedCardHeader>
                                          <UnifiedCardTitle className="text-lg">معلومات العميل</UnifiedCardTitle>
                                        </UnifiedCardHeader>
                                        <UnifiedCardContent className="space-y-2">
                                          <p><strong>الاسم:</strong> {selectedOrder.customer_name}</p>
                                          <p><strong>الهاتف:</strong> {showFullData ? selectedOrder.customer_phone : maskPhone(selectedOrder.customer_phone)}</p>
                                          {selectedOrder.customer_email && (
                                            <p><strong>الإيميل:</strong> {showFullData ? selectedOrder.customer_email : maskEmail(selectedOrder.customer_email)}</p>
                                          )}
                                        </UnifiedCardContent>
                                      </UnifiedCard>
                                      
                                      <UnifiedCard variant="flat">
                                        <UnifiedCardHeader>
                                          <UnifiedCardTitle className="text-lg">معلومات الطلب</UnifiedCardTitle>
                                        </UnifiedCardHeader>
                                        <UnifiedCardContent className="space-y-2">
                                          <div className="flex gap-2">
                                            {getStatusBadge(selectedOrder.status)}
                                            {getPaymentStatusBadge(selectedOrder.payment_status)}
                                          </div>
                                          <p><strong>المبلغ الإجمالي:</strong> {selectedOrder.total_sar} ريال</p>
                                          {selectedOrder.tracking_number && (
                                            <p><strong>رقم التتبع:</strong> {selectedOrder.tracking_number}</p>
                                          )}
                                        </UnifiedCardContent>
                                      </UnifiedCard>
                                    </div>

                                    {/* Order Items */}
                                    <UnifiedCard variant="flat">
                                      <UnifiedCardHeader>
                                        <UnifiedCardTitle className="text-lg">عناصر الطلب</UnifiedCardTitle>
                                      </UnifiedCardHeader>
                                      <UnifiedCardContent>
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>المنتج</TableHead>
                                              <TableHead>الكمية</TableHead>
                                              <TableHead>السعر</TableHead>
                                              <TableHead>المجموع</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {orderItems.map((item) => (
                                              <TableRow key={item.id}>
                                                <TableCell>
                                                  <div>
                                                    <p className="font-medium">{item.product_title}</p>
                                                    {item.product_sku && (
                                                      <p className="text-sm text-muted-foreground">
                                                        SKU: {item.product_sku}
                                                      </p>
                                                    )}
                                                  </div>
                                                </TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{item.unit_price_sar} ريال</TableCell>
                                                <TableCell className="font-semibold">
                                                  {item.total_price_sar} ريال
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </UnifiedCardContent>
                                    </UnifiedCard>

                                    {/* Notes */}
                                    {(selectedOrder.notes || selectedOrder.internal_notes) && (
                                      <UnifiedCard variant="flat">
                                        <UnifiedCardHeader>
                                          <UnifiedCardTitle className="text-lg">الملاحظات</UnifiedCardTitle>
                                        </UnifiedCardHeader>
                                        <UnifiedCardContent className="space-y-2">
                                          {selectedOrder.notes && (
                                            <div>
                                              <Label>ملاحظات العميل:</Label>
                                              <p className="text-sm bg-muted p-2 rounded">{selectedOrder.notes}</p>
                                            </div>
                                          )}
                                          {selectedOrder.internal_notes && (
                                            <div>
                                              <Label>الملاحظات الداخلية:</Label>
                                              <p className="text-sm bg-muted p-2 rounded">{selectedOrder.internal_notes}</p>
                                            </div>
                                          )}
                                        </UnifiedCardContent>
                                      </UnifiedCard>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
                              <DialogTrigger asChild>
                                <UnifiedButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setNewStatus(order.status);
                                    setTrackingNumber(order.tracking_number || '');
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </UnifiedButton>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>تحديث حالة الطلب</DialogTitle>
                                  <DialogDescription>
                                    تغيير حالة الطلب {selectedOrder?.order_number}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="newStatus">الحالة الجديدة</Label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="PENDING">في الانتظار</SelectItem>
                                        <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                                        <SelectItem value="PREPARING">قيد التحضير</SelectItem>
                                        <SelectItem value="SHIPPED">تم الشحن</SelectItem>
                                        <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                                        <SelectItem value="CANCELLED">ملغى</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {newStatus === 'SHIPPED' && (
                                    <div>
                                      <Label htmlFor="tracking">رقم التتبع</Label>
                                      <Input
                                        id="tracking"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="أدخل رقم التتبع"
                                      />
                                    </div>
                                  )}

                                  <div>
                                    <Label htmlFor="notes">ملاحظات (اختيارية)</Label>
                                    <Textarea
                                      id="notes"
                                      value={statusNotes}
                                      onChange={(e) => setStatusNotes(e.target.value)}
                                      placeholder="إضافة ملاحظات حول تغيير الحالة"
                                      rows={3}
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2">
                                    <UnifiedButton
                                      variant="outline"
                                      onClick={() => setStatusUpdateDialog(false)}
                                    >
                                      إلغاء
                                    </UnifiedButton>
                                    <UnifiedButton variant="primary" onClick={updateOrderStatus}>
                                      تحديث الحالة
                                    </UnifiedButton>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {orders.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
                  <p className="text-muted-foreground">لم يتم العثور على أي طلبات بالمعايير المحددة</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <UnifiedCard variant="flat">
                <UnifiedCardHeader>
                  <UnifiedCardTitle>إحصائيات الطلبات</UnifiedCardTitle>
                </UnifiedCardHeader>
                <UnifiedCardContent>
                  <p className="text-muted-foreground">
                    قريباً - ستتوفر الإحصائيات التفصيلية للطلبات والمبيعات
                  </p>
                </UnifiedCardContent>
              </UnifiedCard>
            </TabsContent>
          </Tabs>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};

export default OrderManagement;
