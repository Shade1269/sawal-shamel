import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  Truck, 
  Package,
  Eye,
  Banknote
} from 'lucide-react';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { useAffiliateOrders } from '@/hooks/useAffiliateOrders';

const statusIcons = {
  'PENDING': Clock,
  'CONFIRMED': CheckCircle,
  'PROCESSING': Package,
  'SHIPPED': Truck,
  'DELIVERED': CheckCircle,
  'CANCELLED': Clock,
};

const statusLabels = {
  'PENDING': 'في الانتظار',
  'CONFIRMED': 'مؤكد',
  'PROCESSING': 'جاري التحضير',
  'SHIPPED': 'تم الشحن',
  'DELIVERED': 'تم التسليم',
  'CANCELLED': 'ملغي',
};

const statusColors = {
  'PENDING': 'secondary' as const,
  'CONFIRMED': 'default' as const,
  'PROCESSING': 'outline' as const,
  'SHIPPED': 'default' as const,
  'DELIVERED': 'default' as const,
  'CANCELLED': 'destructive' as const,
};

export default function UnifiedAffiliateOrders() {
  const { store } = useAffiliateStore();
  const { stats, orders, loading, error } = useAffiliateOrders(store?.id);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-destructive mb-4">خطأ في تحميل الطلبات: {error}</p>
            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة الطلبات</h1>
        <p className="text-muted-foreground">
          متابعة طلبات عملائك وحالاتها
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي المبيعات: {stats.totalRevenue.toFixed(2)} ر.س
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العمولات المؤكدة</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedCommissions.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              عمولات مؤكدة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العمولات المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingCommissions.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              في انتظار التأكيد
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageOrderValue.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              متوسط القيمة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
            <p className="text-muted-foreground">
              لم تتلقَّ أي طلبات من العملاء بعد
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              تفاصيل الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order: any) => {
                const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock;
                
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          طلب #{order.id.slice(-8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          العميل: {order.customer_name || 'غير محدد'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {order.total_sar?.toFixed(2) || '0.00'} ر.س
                      </p>
                      <Badge variant={statusColors[order.status as keyof typeof statusColors] || 'secondary'}>
                        {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        العمولة: {order.affiliate_commission_sar?.toFixed(2) || '0.00'} ر.س
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}