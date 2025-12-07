import React from 'react';
import { useUnifiedOrders } from '@/hooks/useUnifiedOrders';
import type { UnifiedOrderFilters } from '@/services/UnifiedOrdersService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isFeatureEnabled } from '@/config/featureFlags';
import { Package, ShoppingCart, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface UnifiedOrdersListProps {
  filters?: UnifiedOrderFilters;
  onOrderClick?: (orderId: string) => void;
}

export const UnifiedOrdersList: React.FC<UnifiedOrdersListProps> = ({ filters, onOrderClick }) => {
  const { orders, loading, error } = useUnifiedOrders(filters);
  const showSourceIndicator = isFeatureEnabled('SHOW_SOURCE_INDICATOR');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive">حدث خطأ في تحميل الطلبات</p>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">لا توجد طلبات</p>
      </Card>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ecommerce':
        return <ShoppingCart className="w-4 h-4" />;
      case 'simple':
        return <Package className="w-4 h-4" />;
      case 'manual':
        return <Edit className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'ecommerce':
        return 'متجر إلكتروني';
      case 'simple':
        return 'طلب بسيط';
      case 'manual':
        return 'يدوي';
      default:
        return source;
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'cancelled') return 'destructive';
    if (statusLower === 'pending') return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onOrderClick?.(order.id)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">#{order.order_number}</span>
                {showSourceIndicator && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getSourceIcon(order.source)}
                    <span className="text-xs">{getSourceLabel(order.source)}</span>
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{order.customer_name}</p>
              {order.customer_phone && (
                <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
              )}
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">{order.total_amount_sar?.toFixed(2)} ر.س</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(order.created_at), {
                  addSuffix: true,
                  locale: ar,
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getStatusColor(order.status || '')}>{order.status}</Badge>
            {order.payment_status && (
              <Badge
                variant={
                  order.payment_status === 'paid' || order.payment_status === 'completed'
                    ? 'default'
                    : 'secondary'
                }
              >
                {order.payment_status}
              </Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
