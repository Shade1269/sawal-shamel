import React from 'react';
import { useMerchantOrders } from '@/hooks/useMerchantOrders';
import { useFastAuth } from '@/hooks/useFastAuth';
import { maskPhone, shouldShowFullCustomerData } from '@/lib/privacy';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELED: XCircle,
  RETURNED: Package,
};

const statusColors = {
  PENDING: "default",
  CONFIRMED: "secondary", 
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELED: "destructive",
  RETURNED: "outline",
} as const;

const statusLabels = {
  PENDING: "في الانتظار",
  CONFIRMED: "مؤكد",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELED: "ملغي",
  RETURNED: "مرتجع",
};

export default function MerchantOrders() {
  const { profile } = useFastAuth();
  const showFullData = shouldShowFullCustomerData(profile?.role);
  const { toast } = useToast();
  const { orders, isLoading, updateOrderStatus, isUpdating } = useMerchantOrders();

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatus({ orderId, newStatus }, {
      onSuccess: () => {
        toast({
          title: "تم التحديث",
          description: "تم تحديث حالة الطلب بنجاح",
        });
      },
      onError: () => {
        toast({
          title: "خطأ في التحديث",
          description: "فشل في تحديث حالة الطلب",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة الطلبات</h1>
        <p className="text-muted-foreground">
          متابعة وإدارة الطلبات التي تحتوي على منتجاتك
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
            <p className="text-muted-foreground">
              لم يتم إنشاء أي طلبات لمنتجاتك بعد
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock;
            
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        طلب #{order.order_number || order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">
                        {format(new Date(order.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                      </p>
                    </div>
                    <Badge variant={statusColors[order.status as keyof typeof statusColors] || "default"}>
                      {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">معلومات العميل</h4>
                        <p className="text-sm text-muted-foreground">
                          الاسم: {order.customer_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          الهاتف: {showFullData ? order.customer_phone : maskPhone(order.customer_phone)}
                        </p>
                        {order.customer_email && (
                          <p className="text-sm text-muted-foreground">
                            البريد: {showFullData ? order.customer_email : '***@***.***'}
                          </p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">إجمالي الطلب</h4>
                        <p className="text-lg font-bold text-primary">
                          {order.total_sar.toFixed(2)} ر.س
                        </p>
                        <p className="text-sm text-muted-foreground">
                          المجموع الفرعي: {order.subtotal_sar.toFixed(2)} ر.س
                        </p>
                        <p className="text-sm text-muted-foreground">
                          الشحن: {order.shipping_sar.toFixed(2)} ر.س
                        </p>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">المنتجات</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                              {item.product_image_url && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.product_image_url}
                                    alt={item.product_title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium">{item.product_title}</p>
                                {item.product_sku && (
                                  <p className="text-xs text-muted-foreground">
                                    SKU: {item.product_sku}
                                  </p>
                                )}
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
                      </div>
                    )}

                    {order.shipping_address && (
                      <div>
                        <h4 className="font-semibold mb-2">عنوان الشحن</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {order.shipping_address.city && (
                            <p>المدينة: {order.shipping_address.city}</p>
                          )}
                          {order.shipping_address.street && (
                            <p>الشارع: {order.shipping_address.street}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <label className="text-sm font-medium">تحديث الحالة:</label>
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">في الانتظار</SelectItem>
                          <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                          <SelectItem value="SHIPPED">تم الشحن</SelectItem>
                          <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                          <SelectItem value="CANCELED">ملغي</SelectItem>
                          <SelectItem value="RETURNED">مرتجع</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
