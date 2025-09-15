import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Phone, ShieldCheck, Package, RefreshCw, Calendar, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  order_id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_sar: number;
  item_count: number;
  order_items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export default function MyOrders() {
  const { store_slug } = useParams<{ store_slug: string }>();
  const [step, setStep] = useState<'phone' | 'otp' | 'orders'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  // Load existing session if available
  React.useEffect(() => {
    if (store_slug) {
      const savedSessionId = localStorage.getItem(`sf:${store_slug}:cust_sess`);
      if (savedSessionId) {
        setSessionId(savedSessionId);
        setStep('orders');
      }
    }
  }, [store_slug]);

  // Fetch store info to get store_id
  const { data: store } = useQuery({
    queryKey: ['store-info', store_slug],
    queryFn: async () => {
      if (!store_slug) return null;
      
      const { data, error } = await supabasePublic
        .from('affiliate_stores')
        .select('id, store_name, is_active')
        .eq('store_slug', store_slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!store_slug
  });

  // Set store ID when store data is loaded
  React.useEffect(() => {
    if (store?.id) {
      setStoreId(store.id);
    }
  }, [store]);

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      if (!storeId || !phone) return;

      const { data, error } = await supabasePublic.rpc('create_customer_otp_session', {
        p_store_id: storeId,
        p_phone: phone
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('تم إرسال رمز التحقق', {
        description: 'تحقق من رسائل الجوال الخاصة بك'
      });
      setStep('otp');
    },
    onError: (error: any) => {
      toast.error('خطأ في إرسال الرمز', {
        description: error.message
      });
    }
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!storeId || !phone || !otp) return;

      const { data, error } = await supabasePublic.rpc('verify_customer_otp', {
        p_store_id: storeId,
        p_phone: phone,
        p_code: otp
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSessionId(data);
      if (store_slug && data) {
        localStorage.setItem(`sf:${store_slug}:cust_sess`, data);
      }
      toast.success('تم التحقق بنجاح');
      setStep('orders');
    },
    onError: (error: any) => {
      toast.error('رمز التحقق غير صحيح', {
        description: error.message
      });
    }
  });

  // Fetch orders query
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['customer-orders', storeId, sessionId],
    queryFn: async () => {
      if (!storeId || !sessionId) return [];

      const { data, error } = await supabasePublic.rpc('get_store_orders_for_session', {
        p_store_id: storeId,
        p_session_id: sessionId
      });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!storeId && !!sessionId && step === 'orders'
  });

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      sendOtpMutation.mutate();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim()) {
      verifyOtpMutation.mutate();
    }
  };

  const handleLogout = () => {
    if (store_slug) {
      localStorage.removeItem(`sf:${store_slug}:cust_sess`);
    }
    setSessionId(null);
    setPhone('');
    setOtp('');
    setStep('phone');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'قيد الانتظار';
      case 'CONFIRMED': return 'مؤكد';
      case 'SHIPPED': return 'تم الشحن';
      case 'DELIVERED': return 'تم التسليم';
      case 'CANCELLED': return 'ملغى';
      default: return status;
    }
  };

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات المتجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost"
              onClick={() => window.location.href = `/s/${store_slug}`}
              className="text-primary hover:text-primary/80"
            >
              ← العودة للمتجر
            </Button>
            <div className="text-center">
              <h1 className="font-semibold">طلباتي</h1>
              <p className="text-sm text-muted-foreground">{store.store_name}</p>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Phone Step */}
          {step === 'phone' && (
            <Card>
              <CardHeader className="text-center">
                <Phone className="mx-auto h-8 w-8 text-primary mb-2" />
                <CardTitle>أدخل رقم جوالك</CardTitle>
                <p className="text-sm text-muted-foreground">
                  سنرسل لك رمز التحقق للوصول إلى طلباتك
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="phone">رقم الجوال</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      dir="ltr"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={sendOtpMutation.isPending}
                  >
                    {sendOtpMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      'إرسال رمز التحقق'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <Card>
              <CardHeader className="text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-primary mb-2" />
                <CardTitle>أدخل رمز التحقق</CardTitle>
                <p className="text-sm text-muted-foreground">
                  أدخل الرمز المرسل إلى {phone}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="otp">رمز التحقق</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      dir="ltr"
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep('phone')}
                      className="flex-1"
                    >
                      رجوع
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={verifyOtpMutation.isPending}
                    >
                      {verifyOtpMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري التحقق...
                        </>
                      ) : (
                        'تحقق'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Orders List */}
          {step === 'orders' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">طلباتك</h2>
                  <p className="text-muted-foreground">رقم الجوال: {phone}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchOrders()}
                    disabled={ordersLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${ordersLoading ? 'animate-spin' : ''}`} />
                    تحديث
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    تسجيل خروج
                  </Button>
                </div>
              </div>

              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
                </div>
              ) : !orders || orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
                    <p className="text-muted-foreground">لم تقم بأي طلبات في هذا المتجر بعد</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.order_id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{order.order_number}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(order.created_at).toLocaleDateString('ar-SA', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>عدد العناصر:</span>
                            <span>{order.item_count}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>المجموع:</span>
                            <span>{order.total_sar} ر.س</span>
                          </div>
                        </div>

                        {order.order_items && order.order_items.length > 0 && (
                          <>
                            <Separator className="my-4" />
                            <div>
                              <h4 className="font-medium mb-2">تفاصيل الطلب:</h4>
                              <div className="space-y-2">
                                {order.order_items.map((item) => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span className="flex-1">{item.title}</span>
                                    <span className="text-muted-foreground mx-2">×{item.quantity}</span>
                                    <span>{item.total_price} ر.س</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}