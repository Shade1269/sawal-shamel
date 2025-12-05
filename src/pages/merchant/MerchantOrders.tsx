import { useState, useEffect } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Search, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useToast } from '@/hooks/use-toast';
import { useOrdersByMerchant } from '@/hooks/useOrdersByMerchant';
import { supabase } from '@/integrations/supabase/client';

const MerchantOrders = () => {
  const { profile } = useFastAuth();
  const { toast } = useToast();
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'delivered'>('all');

  const { data: orders = [], isLoading } = useOrdersByMerchant(merchantId);

  useEffect(() => {
    const fetchMerchantId = async () => {
      if (!profile) return;

      const { data, error } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        toast({
          title: 'خطأ',
          description: 'تعذر جلب معلومات التاجر',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setMerchantId(data.id);
      }
    };

    fetchMerchantId();
  }, [profile]);

  const filteredOrders = orders.filter(order => {
    const orderNumber = order.order_number?.toLowerCase() || '';
    const customerName = order.customer_name?.toLowerCase() || '';
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = orderNumber.includes(searchLower) || customerName.includes(searchLower);
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', color: 'bg-warning/10 text-warning', icon: Clock },
      confirmed: { label: 'مؤكد', color: 'bg-info/10 text-info', icon: Package },
      delivered: { label: 'تم التسليم', color: 'bg-success/10 text-success', icon: CheckCircle },
      cancelled: { label: 'ملغي', color: 'bg-destructive/10 text-destructive', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <UnifiedBadge variant="outline" className={config.color}>
        <Icon className="h-3 w-3 ml-1" />
        {config.label}
      </UnifiedBadge>
    );
  };

  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">طلبات المنتجات</h1>
        <p className="text-muted-foreground">جميع الطلبات التي تحتوي على منتجاتك</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UnifiedCard variant="glass">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">جميع الطلبات</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{stats.all}</div>
          </UnifiedCardContent>
        </UnifiedCard>
        <UnifiedCard variant="glass">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">قيد الانتظار</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </UnifiedCardContent>
        </UnifiedCard>
        <UnifiedCard variant="glass">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">مؤكدة</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-info">{stats.confirmed}</div>
          </UnifiedCardContent>
        </UnifiedCard>
        <UnifiedCard variant="glass">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">مكتملة</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>

      <UnifiedCard variant="glass">
        <UnifiedCardHeader>
          <div className="flex items-center justify-between">
            <UnifiedCardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              قائمة الطلبات
            </UnifiedCardTitle>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الطلبات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">الكل ({stats.all})</TabsTrigger>
              <TabsTrigger value="pending">انتظار ({stats.pending})</TabsTrigger>
              <TabsTrigger value="confirmed">مؤكدة ({stats.confirmed})</TabsTrigger>
              <TabsTrigger value="delivered">مكتملة ({stats.delivered})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <UnifiedCard key={order.id} variant="glass" hover="lift">
                      <UnifiedCardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold">#{order.order_number}</div>
                            <div className="text-sm text-muted-foreground">{order.customer_name}</div>
                            {order.affiliate_store_name && (
                              <div className="text-xs text-muted-foreground mt-1">
                                من متجر: {order.affiliate_store_name}
                              </div>
                            )}
                          </div>
                          <div className="text-left">
                            {getStatusBadge(order.status)}
                            <div className="text-lg font-bold text-primary mt-1">
                              {order.total_amount} ر.س
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-3 space-y-2">
                          <div className="text-sm font-medium">المنتجات:</div>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-muted-foreground flex justify-between">
                              <span>{item.product_title} × {item.quantity}</span>
                              <span>{((item.unit_price || 0) * item.quantity).toFixed(2)} ر.س</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                          <span>{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                          <span>{order.customer_phone}</span>
                        </div>
                      </UnifiedCardContent>
                    </UnifiedCard>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};

export default MerchantOrders;
