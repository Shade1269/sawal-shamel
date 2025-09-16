import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabasePublic } from '@/integrations/supabase/publicClient';

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
}

interface OrderData {
  id: string;
  order_number?: string;
  status: string;
  total_sar: number;
  created_at: string;
  payment_status: string;
  customer_phone: string;
}

const StorefrontMyOrders = () => {
  const { store_slug = '' } = useParams();
  const { toast } = useToast();

  const [store, setStore] = useState<StoreData | null>(null);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);

        const { data: storeData, error: storeError } = await supabasePublic
          .from('affiliate_stores')
          .select('id, store_name, store_slug')
          .eq('store_slug', store_slug)
          .eq('is_active', true)
          .maybeSingle();

        if (storeError) throw storeError;
        if (!storeData) {
          toast({
            title: "المتجر غير موجود",
            description: "لم يتم العثور على المتجر المطلوب",
            variant: "destructive"
          });
          return;
        }

        setStore(storeData);

        // فحص الجلسة المحفوظة
        const savedSession = localStorage.getItem(`customer_session_${store_slug}`);
        if (savedSession) {
          const session = JSON.parse(savedSession);
          const expiry = new Date(session.expiresAt);
          if (expiry > new Date()) {
            setAuthenticated(true);
            setCustomerPhone(session.phone);
            await fetchOrders(storeData.id, session.phone);
          } else {
            localStorage.removeItem(`customer_session_${store_slug}`);
          }
        }

      } catch (error: any) {
        console.error('Error fetching store data:', error);
        toast({
          title: "خطأ في جلب البيانات",
          description: error.message || "حدث خطأ في تحميل بيانات المتجر",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (store_slug) {
      fetchStoreData();
    }
  }, [store_slug, toast]);

  const fetchOrders = async (storeId: string, customerPhone: string) => {
    try {
      const { data: ordersData, error: ordersError } = await supabasePublic
        .from('ecommerce_orders')
        .select('id, order_number, status, total_sar, created_at, payment_status, customer_phone')
        .eq('affiliate_store_id', storeId)
        .eq('customer_phone', customerPhone)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "خطأ في جلب الطلبات",
        description: error.message || "حدث خطأ في جلب الطلبات",
        variant: "destructive"
      });
    }
  };

  const sendOTP = async () => {
    if (!phone || !store) return;

    try {
      setOtpSent(true);
      
      // محاكاة إرسال OTP (سنستخدم Edge Function لاحقاً)
      const { data, error } = await supabasePublic
        .from('customer_otp_sessions')
        .insert({
          store_id: store.id,
          phone: phone,
          otp_code: Math.floor(100000 + Math.random() * 900000).toString(),
          verified: false,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        })
        .select('otp_code')
        .single();

      if (error) throw error;

      toast({
        title: "تم إرسال رمز التحقق",
        description: `تم إرسال رمز التحقق إلى ${phone}`,
      });

      // في بيئة التطوير، نعرض الرمز في الكونسول
      console.log('OTP Code:', data.otp_code);
      
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "خطأ في إرسال الرمز",
        description: error.message || "حدث خطأ في إرسال رمز التحقق",
        variant: "destructive"
      });
      setOtpSent(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode || !phone || !store) return;

    try {
      setVerifying(true);

      const { data: otpSession, error: otpError } = await supabasePublic
        .from('customer_otp_sessions')
        .select('*')
        .eq('store_id', store.id)
        .eq('phone', phone)
        .eq('otp_code', otpCode)
        .eq('verified', false)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (otpError) throw otpError;
      if (!otpSession) {
        toast({
          title: "رمز التحقق غير صحيح",
          description: "الرمز المدخل غير صحيح أو منتهي الصلاحية",
          variant: "destructive"
        });
        return;
      }

      // تحديث حالة التحقق
      await supabasePublic
        .from('customer_otp_sessions')
        .update({ verified: true, verified_at: new Date().toISOString() })
        .eq('id', otpSession.id);

      // حفظ الجلسة محلياً
      const session = {
        phone: phone,
        storeId: store.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ساعة
      };
      localStorage.setItem(`customer_session_${store_slug}`, JSON.stringify(session));

      setAuthenticated(true);
      setCustomerPhone(phone);
      
      // جلب الطلبات
      await fetchOrders(store.id, phone);

      toast({
        title: "تم التحقق بنجاح",
        description: "يمكنك الآن عرض طلباتك",
      });

    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "خطأ في التحقق",
        description: error.message || "حدث خطأ في التحقق من الرمز",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'PENDING': { label: 'قيد المراجعة', variant: 'secondary', icon: Clock },
      'CONFIRMED': { label: 'مؤكد', variant: 'default', icon: CheckCircle },
      'PROCESSING': { label: 'قيد التحضير', variant: 'default', icon: Package },
      'SHIPPED': { label: 'تم الشحن', variant: 'default', icon: Package },
      'DELIVERED': { label: 'تم التسليم', variant: 'default', icon: CheckCircle },
      'CANCELLED': { label: 'ملغي', variant: 'destructive', icon: AlertCircle }
    } as const;

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const logout = () => {
    localStorage.removeItem(`customer_session_${store_slug}`);
    setAuthenticated(false);
    setCustomerPhone('');
    setOrders([]);
    setPhone('');
    setOtpCode('');
    setOtpSent(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/s/${store_slug}`}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للمتجر
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">طلباتي</h1>
              <p className="text-sm text-muted-foreground">{store?.store_name}</p>
            </div>
            {authenticated && (
              <div className="mr-auto">
                <Button variant="outline" size="sm" onClick={logout}>
                  تسجيل خروج
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!authenticated ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                تسجيل الدخول برقم الجوال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <Label htmlFor="phone">رقم الجوال</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={sendOTP}
                    disabled={!phone}
                    className="w-full"
                  >
                    إرسال رمز التحقق
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="otp">رمز التحقق</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="ادخل رمز التحقق"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      maxLength={6}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      تم إرسال رمز التحقق إلى {phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={verifyOTP}
                      disabled={!otpCode || verifying}
                      className="flex-1"
                    >
                      {verifying ? 'جاري التحقق...' : 'تحقق'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                      }}
                    >
                      تغيير الرقم
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">طلباتك</h2>
              <p className="text-muted-foreground">رقم الجوال: {customerPhone}</p>
            </div>

            {orders.length === 0 ? (
              <Card className="max-w-md mx-auto">
                <CardContent className="text-center py-8">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
                  <p className="text-muted-foreground mb-4">
                    لم تقم بأي طلبات من هذا المتجر بعد
                  </p>
                  <Button asChild>
                    <Link to={`/s/${store_slug}`}>تصفح المنتجات</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 max-w-4xl mx-auto">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">
                            طلب رقم: {order.order_number || order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <div className="text-left">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold">{order.total_sar} ر.س</p>
                          <p className="text-sm text-muted-foreground">
                            حالة الدفع: {order.payment_status === 'PENDING' ? 'عند الاستلام' : 'مدفوع'}
                          </p>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          عرض التفاصيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorefrontMyOrders;