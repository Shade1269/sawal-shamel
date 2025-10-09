import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Phone, MessageCircle, RefreshCw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import { useCustomerOTP } from '@/hooks/useCustomerOTP';

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
}

interface OrderData {
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

const StorefrontMyOrders = () => {
  const { store_slug = '' } = useParams();
  const { toast } = useToast();
  
  const [store, setStore] = useState<StoreData | null>(null);
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // استخدام hook إدارة OTP
  const otpManager = useCustomerOTP(store?.id || '');

  // جلب بيانات المتجر
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const { data: storeData, error } = await supabasePublic
          .from('affiliate_stores')
          .select('id, store_name, store_slug')
          .eq('store_slug', store_slug)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        if (!storeData) {
          toast({
            title: "المتجر غير موجود",
            description: "لم يتم العثور على المتجر المطلوب",
            variant: "destructive"
          });
          return;
        }

        setStore(storeData);
        
        // التحقق من جلسة عميل موجودة
        const existingSession = otpManager.getCustomerSession();
        if (existingSession) {
          setIsVerified(true);
          setPhone(existingSession.phone);
          await fetchOrders(existingSession.sessionId);
        }

      } catch (error: any) {
        console.error('Error fetching store:', error);
        toast({
          title: "خطأ في جلب البيانات",
          description: error.message || "حدث خطأ في تحميل بيانات المتجر",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [store_slug, toast]);

  // إرسال كود OTP
  const handleSendOTP = async () => {
    if (!store || !phone.trim()) {
      toast({
        title: "رقم الجوال مطلوب",
        description: "يرجى إدخال رقم جوالك",
        variant: "destructive"
      });
      return;
    }

    const result = await otpManager.sendOTP(phone);
    if (result.success) {
      setShowOTPInput(true);
    }
  };

  // التحقق من كود OTP
  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      toast({
        title: "الكود مطلوب",
        description: "يرجى إدخال كود التحقق",
        variant: "destructive"
      });
      return;
    }

    const result = await otpManager.verifyOTP(phone, otpCode);
    if (result.success && result.sessionId) {
      setIsVerified(true);
      setShowOTPInput(false);
      await fetchOrders(result.sessionId);
    }
  };

  // جلب الطلبات
  const fetchOrders = async (sessionId: string) => {
    if (!store) return;

    try {
      setLoadingOrders(true);
      
      const { data, error } = await supabasePublic.functions.invoke('get-store-orders-for-session', {
        body: { 
          store_id: store.id,
          session_id: sessionId 
        }
      });

      if (error) throw error;
      
      setOrders(data?.orders || []);

    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "خطأ في جلب الطلبات",
        description: error.message || "تعذر جلب طلباتك",
        variant: "destructive"
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  // تحديث الطلبات
  const handleRefreshOrders = () => {
    const session = otpManager.getCustomerSession();
    if (session) {
      fetchOrders(session.sessionId);
    }
  };

  // تسجيل الخروج
  const handleLogout = () => {
    otpManager.clearCustomerSession();
    setIsVerified(false);
    setPhone('');
    setOtpCode('');
    setShowOTPInput(false);
    setOrders([]);
  };

  // ترجمة حالات الطلب
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'قيد المعالجة',
      'CONFIRMED': 'مؤكد',
      'PROCESSING': 'قيد التحضير',
      'SHIPPED': 'تم الشحن',
      'DELIVERED': 'تم التسليم',
      'CANCELLED': 'ملغي'
    };
    return statusMap[status] || status;
  };

  // ألوان حالات الطلب
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>جاري التحميل...</p>
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
          <div className="flex items-center justify-between">
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
            </div>
            
            {isVerified && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleRefreshOrders}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تحديث
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  تسجيل خروج
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!isVerified ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                تحقق من رقم جوالك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={showOTPInput}
                />
              </div>

              {showOTPInput && (
                <div>
                  <Label htmlFor="otp">كود التحقق</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    تم إرسال كود التحقق إلى رقم {phone}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {!showOTPInput ? (
                  <Button 
                    onClick={handleSendOTP} 
                    disabled={otpManager.loading}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 ml-2" />
                    {otpManager.loading ? 'جاري الإرسال...' : 'إرسال كود التحقق'}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleVerifyOTP} 
                      disabled={otpManager.verifying}
                      className="flex-1"
                    >
                      {otpManager.verifying ? 'جاري التحقق...' : 'تحقق'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowOTPInput(false);
                        setOtpCode('');
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">طلباتك</h2>
              <p className="text-muted-foreground">رقم الجوال: {phone}</p>
            </div>

            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>جاري تحميل طلباتك...</p>
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
                  <p className="text-muted-foreground mb-4">
                    لم تقم بأي طلبات من هذا المتجر حتى الآن
                  </p>
                  <Button asChild>
                    <Link to={`/s/${store_slug}`}>
                      ابدأ التسوق الآن
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.order_id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            طلب رقم: {order.order_number}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>عدد الأصناف: {order.item_count}</span>
                          <span className="font-bold text-lg">{order.total_sar} ر.س</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">تفاصيل الطلب:</h4>
                          {order.order_items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{item.title} × {item.quantity}</span>
                              <span>{item.total_price} ر.س</span>
                            </div>
                          ))}
                        </div>
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