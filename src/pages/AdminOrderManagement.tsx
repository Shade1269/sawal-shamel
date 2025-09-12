import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ShoppingCart, 
  Check, 
  X, 
  ArrowRight,
  Users,
  Package,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderReview {
  id: string;
  order_id: string;
  affiliate_store_id: string;
  merchant_id: string;
  admin_notes: string;
  status: string;
  created_at: string;
  order: {
    customer_name: string;
    customer_phone: string;
    total_sar: number;
    created_at: string;
  };
  affiliate_store: {
    store_name: string;
    profile_id: string;
  };
  merchant: {
    business_name: string;
    profile_id: string;
  };
}

const AdminOrderManagement = () => {
  const { toast } = useToast();
  const [orderReviews, setOrderReviews] = useState<OrderReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderReview | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchOrderReviews();
  }, []);

  const fetchOrderReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_order_reviews')
        .select(`
          *,
          order:orders (
            customer_name,
            customer_phone,
            total_sar,
            created_at
          ),
          affiliate_store:affiliate_stores (
            store_name,
            profile_id
          ),
          merchant:merchants (
            business_name,
            profile_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrderReviews(data || []);
    } catch (error) {
      console.error('Error fetching order reviews:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب طلبات المراجعة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderReviewId: string, action: 'APPROVED' | 'REJECTED' | 'FORWARDED_TO_MERCHANT') => {
    try {
      const { error } = await supabase
        .from('admin_order_reviews')
        .update({
          status: action,
          admin_notes: adminNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', orderReviewId);

      if (error) throw error;

      toast({
        title: "تم تحديث الطلب",
        description: getActionMessage(action),
      });

      setSelectedOrder(null);
      setAdminNotes('');
      fetchOrderReviews();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "خطأ في التحديث",
        description: "تعذر تحديث حالة الطلب",
        variant: "destructive",
      });
    }
  };

  const getActionMessage = (action: string) => {
    switch (action) {
      case 'APPROVED': return 'تم قبول الطلب وإرساله للتاجر';
      case 'REJECTED': return 'تم رفض الطلب';
      case 'FORWARDED_TO_MERCHANT': return 'تم إرسال الطلب للتاجر';
      default: return 'تم تحديث الطلب';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'FORWARDED_TO_MERCHANT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'قيد المراجعة';
      case 'APPROVED': return 'مقبول'; 
      case 'REJECTED': return 'مرفوض';
      case 'FORWARDED_TO_MERCHANT': return 'تم إرساله للتاجر';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل طلبات المراجعة...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            إدارة الطلبات - الادمن
          </h1>
          <p className="text-muted-foreground mt-2">
            مراجعة الطلبات الواردة من المسوقين وإرسالها للتجار
          </p>
        </div>
        <Badge className="bg-gradient-premium text-premium-foreground">
          <AlertCircle className="ml-1 h-4 w-4" />
          مدير النظام
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيد المراجعة
            </CardTitle>
            <ShoppingCart className="h-6 w-6 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderReviews.filter(o => o.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              تم إرسالها للتجار
            </CardTitle>
            <ArrowRight className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderReviews.filter(o => o.status === 'FORWARDED_TO_MERCHANT').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مقبولة
            </CardTitle>
            <Check className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderReviews.filter(o => o.status === 'APPROVED').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مرفوضة
            </CardTitle>
            <X className="h-6 w-6 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderReviews.filter(o => o.status === 'REJECTED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            طلبات المراجعة
          </CardTitle>
          <CardDescription>
            الطلبات الواردة من المسوقين والتي تحتاج لمراجعة ادارية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderReviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">لا توجد طلبات للمراجعة</p>
            ) : (
              orderReviews.map((orderReview) => (
                <div key={orderReview.id} className="flex items-center justify-between p-4 rounded-lg border bg-background/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-medium">{orderReview.order.customer_name}</h3>
                      <Badge className={getStatusColor(orderReview.status)}>
                        {getStatusText(orderReview.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      المبلغ: {orderReview.order.total_sar} ريال
                    </p>
                    <p className="text-sm text-muted-foreground">
                      المتجر: {orderReview.affiliate_store.store_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      التاجر: {orderReview.merchant.business_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(orderReview.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  
                  {orderReview.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedOrder(orderReview)}>
                            مراجعة
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>مراجعة الطلب</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">تفاصيل الطلب:</h4>
                                <p>العميل: {selectedOrder.order.customer_name}</p>
                                <p>المبلغ: {selectedOrder.order.total_sar} ريال</p>
                                <p>المتجر: {selectedOrder.affiliate_store.store_name}</p>
                                <p>التاجر: {selectedOrder.merchant.business_name}</p>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium">ملاحظات الادمن:</label>
                                <Textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="أضف ملاحظات..."
                                  className="mt-1"
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => handleOrderAction(selectedOrder.id, 'FORWARDED_TO_MERCHANT')}
                                >
                                  إرسال للتاجر
                                </Button>
                                <Button 
                                  variant="outline" 
                                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                                  onClick={() => handleOrderAction(selectedOrder.id, 'REJECTED')}
                                >
                                  رفض
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrderManagement;