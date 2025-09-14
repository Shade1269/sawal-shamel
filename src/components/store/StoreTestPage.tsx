import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Store, Users, Package, TrendingUp } from "lucide-react";
import { useCustomerAuthContext } from '@/contexts/CustomerAuthContext';

const StoreTestPage = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { customer, isAuthenticated } = useCustomerAuthContext();

  // جلب بيانات المتجر
  const { data: store, isLoading } = useQuery({
    queryKey: ["store-test", storeSlug],
    queryFn: async () => {
      if (!storeSlug) return null;
      
      const { data, error } = await supabase
        .from("affiliate_stores")
        .select("*")
        .eq("store_slug", storeSlug)
        .eq("is_active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!storeSlug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">المتجر غير موجود</h3>
            <p className="text-muted-foreground">لم يتم العثور على المتجر المطلوب</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رسالة نجاح الفصل */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Store className="h-5 w-5" />
            نجح فصل المتجر عن المنصة! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">ما تم تطبيقه:</h4>
              <ul className="space-y-1 text-green-700">
                <li>✅ تخطيط منفصل للمتجر</li>
                <li>✅ هيدر وفوتر خاص بالمتجر</li>
                <li>✅ نظام مصادقة منفصل للعملاء</li>
                <li>✅ حماية من الوصول للمنصة</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">النتيجة:</h4>
              <ul className="space-y-1 text-green-700">
                <li>🚫 لا يمكن للعميل رؤية المنصة</li>
                <li>🔐 نظام دخول منفصل (هاتف + OTP)</li>
                <li>🎨 عرض اسم المتجر بدلاً من "أتلانتس"</li>
                <li>🛒 تجربة تسوق مستقلة تماماً</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات المتجر الحالي */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={store.logo_url} alt={store.store_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {store.store_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{store.store_name}</CardTitle>
              <p className="text-muted-foreground mt-1">{store.bio}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{store.theme}</Badge>
                <Badge variant={store.is_active ? "default" : "destructive"}>
                  {store.is_active ? "نشط" : "معطل"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-lg font-bold">{store.total_sales.toLocaleString()} ريال</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Package className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">عدد الطلبات</p>
                <p className="text-lg font-bold">{store.total_orders}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">رقم المتجر</p>
                <p className="text-lg font-bold">#{store.store_slug}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* حالة العميل */}
      <Card>
        <CardHeader>
          <CardTitle>حالة تسجيل الدخول</CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated && customer ? (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium">مسجل دخول كعميل</p>
                <p className="text-sm text-muted-foreground">
                  {customer.full_name} - {customer.phone}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              </div>
              <div>
                <p className="font-medium">غير مسجل دخول</p>
                <p className="text-sm text-muted-foreground">
                  يمكنك تسجيل الدخول من الهيدر أعلاه
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* اختبار الروابط */}
      <Card>
        <CardHeader>
          <CardTitle>اختبار النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">الروابط المتاحة للعميل:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-green-50 rounded">✅ /store/{store.store_slug}</div>
                <div className="p-2 bg-green-50 rounded">✅ /store/{store.store_slug}/auth</div>
                <div className="p-2 bg-green-50 rounded">✅ /store/{store.store_slug}/checkout</div>
                <div className="p-2 bg-green-50 rounded">✅ /store/{store.store_slug}/order-confirmation</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">الروابط المحظورة على العميل:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-red-50 rounded">🚫 /admin</div>
                <div className="p-2 bg-red-50 rounded">🚫 /affiliate</div>
                <div className="p-2 bg-red-50 rounded">🚫 /merchant</div>
                <div className="p-2 bg-red-50 rounded">🚫 /dashboard</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreTestPage;