import { useNavigate } from 'react-router-dom';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedBadge, UnifiedButton } from '@/components/design-system';
import { Package, ShoppingCart, ArrowLeft, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface RecentProductsProps {
  products: any[];
}

interface RecentOrdersProps {
  orders: any[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <UnifiedBadge variant="outline" className="bg-warning/10 text-warning text-xs"><AlertCircle className="h-3 w-3 ml-1" />قيد المراجعة</UnifiedBadge>;
    case 'approved':
      return <UnifiedBadge variant="outline" className="bg-success/10 text-success text-xs"><CheckCircle className="h-3 w-3 ml-1" />موافق</UnifiedBadge>;
    case 'rejected':
      return <UnifiedBadge variant="outline" className="bg-destructive/10 text-destructive text-xs"><XCircle className="h-3 w-3 ml-1" />مرفوض</UnifiedBadge>;
    default:
      return null;
  }
};

export const MerchantRecentProducts = ({ products }: RecentProductsProps) => {
  const navigate = useNavigate();

  return (
    <UnifiedCard variant="glass">
      <UnifiedCardHeader className="flex flex-row items-center justify-between">
        <UnifiedCardTitle className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          آخر المنتجات
        </UnifiedCardTitle>
        <UnifiedButton variant="ghost" size="sm" onClick={() => navigate('/merchant/products')}>
          عرض الكل
          <ArrowLeft className="h-4 w-4 mr-1" />
        </UnifiedButton>
      </UnifiedCardHeader>
      <UnifiedCardContent>
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">لا توجد منتجات بعد</p>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {product.image_urls?.[0] ? (
                    <img src={product.image_urls[0]} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(product.created_at), { addSuffix: true, locale: ar })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(product.approval_status)}
              </div>
            ))}
          </div>
        )}
      </UnifiedCardContent>
    </UnifiedCard>
  );
};

export const MerchantRecentOrders = ({ orders }: RecentOrdersProps) => {
  const navigate = useNavigate();

  return (
    <UnifiedCard variant="glass">
      <UnifiedCardHeader className="flex flex-row items-center justify-between">
        <UnifiedCardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          آخر الطلبات
        </UnifiedCardTitle>
        <UnifiedButton variant="ghost" size="sm" onClick={() => navigate('/merchant/orders')}>
          عرض الكل
          <ArrowLeft className="h-4 w-4 mr-1" />
        </UnifiedButton>
      </UnifiedCardHeader>
      <UnifiedCardContent>
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">لا توجد طلبات بعد</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">
                    {order.items.slice(0, 2).join('، ')}
                    {order.items.length > 2 && ` +${order.items.length - 2}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}
                  </p>
                </div>
                <span className="font-bold text-primary">{Number(order.total).toFixed(2)} ر.س</span>
              </div>
            ))}
          </div>
        )}
      </UnifiedCardContent>
    </UnifiedCard>
  );
};
