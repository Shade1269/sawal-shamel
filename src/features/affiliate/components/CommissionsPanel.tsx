import React from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Package,
  Calendar,
  Coins
} from 'lucide-react';
import { useAffiliateCommissions } from '@/hooks/useAffiliateCommissions';

export const CommissionsPanel: React.FC = () => {
  const { 
    commissions, 
    orderTracking, 
    totalCommissions, 
    pendingCommissions, 
    confirmedCommissions,
    isLoading 
  } = useAffiliateCommissions();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-success/10 text-success"><CheckCircle className="w-3 h-3 ml-1" />مؤكد</Badge>;
      case 'PENDING':
        return <Badge className="bg-warning/10 text-warning"><Clock className="w-3 h-3 ml-1" />قيد الانتظار</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات العمولات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي العمولات</p>
                <p className="text-2xl font-bold text-primary">{totalCommissions.toFixed(2)} ريال</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">عمولات مؤكدة</p>
                <p className="text-2xl font-bold text-success">{confirmedCommissions.toFixed(2)} ريال</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">عمولات معلقة</p>
                <p className="text-2xl font-bold text-warning">{pendingCommissions.toFixed(2)} ريال</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة العمولات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              سجل العمولات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد عمولات حتى الآن</p>
            ) : (
              <div className="space-y-4">
                {commissions.slice(0, 5).map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{commission.amount_sar} ريال</div>
                      <div className="text-sm text-muted-foreground">
                        نسبة العمولة: {commission.commission_rate}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(commission.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(commission.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              تتبع الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderTracking.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد طلبات مُتتبعة</p>
            ) : (
              <div className="space-y-4">
                {orderTracking.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      {order.products?.image_urls?.[0] ? (
                        <img 
                          src={order.products.image_urls[0]} 
                          alt={order.products.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{order.products?.title || 'منتج غير محدد'}</div>
                      <div className="text-sm text-muted-foreground">
                        الكمية: {order.quantity} × {order.unit_price_sar} ريال
                      </div>
                      <div className="text-sm font-medium text-primary">
                        العمولة: {order.commission_amount_sar} ريال
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(order.status)}
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};