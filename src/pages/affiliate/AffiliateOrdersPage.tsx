import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UnifiedOrdersService, UnifiedOrderWithItems } from '@/lib/unifiedOrdersService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
};

const statusColors = {
  PENDING: "default",
  CONFIRMED: "secondary", 
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
} as const;

const statusLabels = {
  PENDING: "في الانتظار",
  CONFIRMED: "مؤكد",
  PROCESSING: "قيد المعالجة", 
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

export default function AffiliateOrdersPage() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: affiliateStore } = useQuery({
    queryKey: ['affiliate-store', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('affiliate_stores')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['affiliate-orders', affiliateStore?.id],
    queryFn: async () => {
      if (!affiliateStore) return [];
      
      return await UnifiedOrdersService.getOrdersWithItems({
        affiliate_store_id: affiliateStore.id,
        limit: 100
      });
    },
    enabled: !!affiliateStore
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      return await UnifiedOrdersService.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-orders'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, newStatus });
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
          متابعة وإدارة طلبات متجرك
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
            <p className="text-muted-foreground">
              لم يتم إنشاء أي طلبات في متجرك بعد
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
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">معلومات العميل</h4>
                        <p className="text-sm text-muted-foreground">
                          الاسم: {order.customer_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          الهاتف: {order.customer_phone}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">إجمالي الطلب</h4>
                        <p className="text-lg font-bold text-primary">
                          {order.total.toFixed(2)} ر.س
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">عناصر الطلب</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <div>
                                <p className="font-medium">{item.product_title}</p>
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

                    {/* Status Update */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <label className="text-sm font-medium">تحديث الحالة:</label>
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-48">
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
            );
          })}
        </div>
      )}
    </div>
  );
}