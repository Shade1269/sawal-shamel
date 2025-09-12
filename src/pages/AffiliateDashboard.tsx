import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Eye, 
  Share, 
  DollarSign,
  Star,
  Trophy,
  Gift,
  Users,
  ShoppingCart,
  Plus,
  Copy,
  ExternalLink,
  Target,
  Calendar,
  Award,
  Zap,
  BarChart3,
  TrendingDown,
  Clock,
  Bell,
  Settings,
  Crown,
  QrCode,
  MessageSquare,
  Mail,
  Phone,
  Headphones,
  FileText,
  Download,
  Filter,
  Home,
  ArrowRight,
  Store
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { CommissionsPanel } from '@/components/CommissionsPanel';
import { AffiliateProductsManager } from '@/components/AffiliateProductsManager';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

const AffiliateDashboard = () => {
  const { profile, user } = useFastAuth();
  const { goToUserHome, navigate } = useSmartNavigation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [hasSession, setHasSession] = useState(false);
  
  const [stats, setStats] = useState({
    totalCommissions: 0,
    thisMonthCommissions: 0,
    totalSales: 0,
    conversionRate: 0,
    totalVisits: 0,
    totalClicks: 0,
    activeProducts: 0,
    monthlyGrowth: 0,
    weeklyGoal: 5000,
    weeklyProgress: 0
  });
  
  const [chartData, setChartData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [affiliateStore, setAffiliateStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);
  
  const [newStore, setNewStore] = useState({
    store_name: '',
    bio: ''
  });

  useEffect(() => {
    // تتبع حالة الجلسة وتحديثها فوراً
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    syncSession();
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setHasSession(!!session);
    });

    const initializeProfile = async () => {
      if (!user) return;

      // التحقق من وجود الملف الشخصي وإنشاءه إذا لم يوجد
      if (!profile) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', user.id)
            .maybeSingle();

          if (!existingProfile) {
            // إنشاء ملف شخصي جديد
            const { error } = await supabase
              .from('profiles')
              .insert({
                auth_user_id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                role: 'affiliate'
              });

            if (error) throw error;
            window.location.reload();
            return;
          }
        } catch (error) {
          console.error('Error creating profile:', error);
          toast({
            title: "خطأ في الإعداد",
            description: "تعذر إنشاء الملف الشخصي",
            variant: "destructive",
          });
        }
      }

      if (profile) {
        fetchAffiliateData();
      }
    };

    initializeProfile();

    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, [profile, user]);

  const fetchAffiliateData = async () => {
    try {
      // جلب متجر المسوق أو عدم وجوده
      const { data: storeData, error: storeError } = await supabase
        .from('affiliate_stores')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (storeError && storeError.code !== 'PGRST116') throw storeError;
      
      setAffiliateStore(storeData);

      if (storeData) {
        // جلب المنتجات
        const { data: productsData, error: productsError } = await supabase
          .from('affiliate_products')
          .select(`
            *,
            products (*)
          `)
          .eq('affiliate_store_id', storeData.id)
          .eq('is_visible', true);

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // جلب العمولات
        const { data: commissionsData, error: commissionsError } = await supabase
          .from('commissions')
          .select('*')
          .eq('affiliate_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (commissionsError) throw commissionsError;
        setCommissions(commissionsData || []);

        // حساب الإحصائيات
        const totalCommissions = commissionsData?.reduce((sum, c) => sum + (c.amount_sar || 0), 0) || 0;
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthCommissions = commissionsData?.filter(c => 
          new Date(c.created_at) >= thisMonth
        ).reduce((sum, c) => sum + (c.amount_sar || 0), 0) || 0;

        const totalClicks = Math.floor(Math.random() * 5000) + 1000; // مؤقت
        const conversionRate = totalClicks > 0 ? ((totalCommissions * 100) / totalClicks) : 0;
        const monthlyGrowth = Math.floor(Math.random() * 50) + 10; // مؤقت
        const weeklyProgress = (thisMonthCommissions / 5000) * 100; // نسبة الهدف الأسبوعي

        setStats({
          totalCommissions,
          thisMonthCommissions,
          totalSales: storeData.total_sales || 0,
          conversionRate: Number(conversionRate.toFixed(1)),
          totalVisits: 1250, // مؤقت
          totalClicks,
          activeProducts: productsData?.length || 0,
          monthlyGrowth,
          weeklyGoal: 5000,
          weeklyProgress
        });

        // بيانات المخطط البياني
        const mockChartData = [
          { name: 'الأسبوع 1', commissions: 800, clicks: 1200 },
          { name: 'الأسبوع 2', commissions: 1200, clicks: 1800 },
          { name: 'الأسبوع 3', commissions: 900, clicks: 1400 },
          { name: 'الأسبوع 4', commissions: thisMonthCommissions, clicks: totalClicks/4 },
        ];
        setChartData(mockChartData);

        // الأنشطة الحديثة
        setRecentActivities([
          { type: 'sale', message: 'تم إتمام عملية بيع جديدة', time: '5 دقائق', amount: 150 },
          { type: 'click', message: 'نقرة جديدة على رابط المنتج', time: '15 دقائق' },
          { type: 'commission', message: 'تم إضافة عمولة جديدة', time: '30 دقيقة', amount: 75 },
          { type: 'visit', message: 'زيارة جديدة للمتجر', time: '1 ساعة' },
        ]);

        // الإشعارات
        setNotifications([
          { type: 'success', message: 'تحقيق 80% من الهدف الأسبوعي!', time: 'اليوم' },
          { type: 'info', message: 'منتج جديد متاح للتسويق', time: 'أمس' },
          { type: 'warning', message: 'انخفاض في معدل النقرات', time: 'منذ 2 أيام' },
        ]);

        // جلب الأنشطة
        const { data: activitiesData, error: activitiesError } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (activitiesError) throw activitiesError;
        setActivities(activitiesData || []);
      }

    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات المسوق",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: any) => {
    e.preventDefault();

    // التحقق من وجود جلسة
    if (!hasSession) {
      toast({
        title: "يتطلب تسجيل الدخول",
        description: "يرجى تسجيل الدخول أولاً",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      // تحقق من جلسة المستخدم في Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      const authUser = session?.user || null;
      if (!authUser) {
        toast({
          title: "يتطلب تسجيل الدخول",
          description: "يرجى تسجيل الدخول أولاً لإتمام إنشاء المتجر",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // جلب ملف المستخدم من جدول profiles باستخدام معرف Supabase
      const { data: profileRow, error: profileLookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

      if (profileLookupError) throw profileLookupError;
      if (!profileRow?.id) {
        toast({
          title: "الملف الشخصي غير موجود",
          description: "لم يتم العثور على ملفك الشخصي. يرجى إعادة تسجيل الدخول ثم المحاولة",
          variant: "destructive",
        });
        return;
      }

      // توليد slug تلقائي مع معرف فريد لضمان التفرد
      const baseSlug = newStore.store_name
        .toLowerCase()
        .replace(/[^\u0600-\u06FF\w\s-]/g, '') // إزالة الرموز الخاصة مع دعم العربية والإنجليزية
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const finalSlug = `${baseSlug}-${uniqueId}`;

      // إنشاء المتجر عبر دالة آمنة في قاعدة البيانات (تتجاوز RLS داخلياً)
      const { data: newStoreId, error: rpcError } = await supabase
        .rpc('create_affiliate_store', {
          p_store_name: newStore.store_name,
          p_bio: newStore.bio,
          p_store_slug: null
        });

      if (rpcError) throw rpcError;

      // جلب السجل لمعرفة الـ slug
      const { data: createdStore, error: fetchError } = await supabase
        .from('affiliate_stores')
        .select('store_slug')
        .eq('id', newStoreId as unknown as string)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const storeUrl = `${window.location.origin}/store/${createdStore?.store_slug || ''}`;

      toast({
        title: "تم إنشاء المتجر",
        description: `تم إنشاء متجرك بنجاح. رابط المتجر: ${storeUrl}`,
      });

      setIsCreateStoreOpen(false);
      setNewStore({ store_name: '', bio: '' });
      fetchAffiliateData();
    } catch (error: any) {
      console.error('Error creating store:', error);
      let errorMessage = "تعذر إنشاء المتجر";
      const msg = String(error?.message || '');

      if (msg.includes('duplicate')) {
        errorMessage = "اسم المتجر موجود مسبقاً";
      } else if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('permission denied') || msg.toLowerCase().includes('auth.uid')) {
        errorMessage = "صلاحيات غير كافية. يرجى تسجيل الدخول ثم المحاولة مرة أخرى";
      } else if (msg.includes('profile_id')) {
        errorMessage = "خطأ في بيانات المستخدم";
      }
      
      toast({
        title: "خطأ في إنشاء المتجر",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const copyAffiliateLink = (productId?: string) => {
    const baseUrl = window.location.origin;
    const link = productId 
      ? `${baseUrl}/products/${productId}?ref=${profile.id}`
      : `${baseUrl}/store/${affiliateStore?.store_slug}?ref=${profile.id}`;
    
    navigator.clipboard.writeText(link);
    toast({
      title: "تم نسخ الرابط",
      description: "تم نسخ رابط التسويق إلى الحافظة",
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'legendary': return 'text-yellow-600';
      case 'gold': return 'text-yellow-500';
      case 'silver': return 'text-gray-500';
      default: return 'text-orange-600';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'legendary': return <Trophy className="h-4 w-4" />;
      case 'gold': return <Star className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل لوحة المسوق...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!affiliateStore) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              مرحباً بك في برنامج التسويق بالعمولة
            </h1>
            <p className="text-muted-foreground mt-2">
              أنشئ متجرك الآن وابدأ في كسب العمولات
            </p>
          </div>

          <Card className="max-w-md mx-auto border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>إنشاء متجر التسويق</CardTitle>
              <CardDescription>
                أنشئ متجرك الخاص لبدء التسويق بالعمولة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isCreateStoreOpen} onOpenChange={setIsCreateStoreOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="ml-2 h-4 w-4" />
                    إنشاء متجر جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء متجر التسويق</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateStore} className="space-y-4">
                    <div className="space-y-2">
                      <Label>اسم المتجر</Label>
                      <Input
                        value={newStore.store_name}
                        onChange={(e) => setNewStore({...newStore, store_name: e.target.value})}
                        placeholder="اسم متجرك"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>نبذة عن المتجر</Label>
                      <Input
                        value={newStore.bio}
                        onChange={(e) => setNewStore({...newStore, bio: e.target.value})}
                        placeholder="وصف قصير لمتجرك"
                      />
                      <div className="text-xs text-muted-foreground">
                        سيتم إنشاء رابط المتجر تلقائياً بناءً على اسم المتجر
                      </div>
                    </div>
                      <div className="flex gap-2 items-center">
                        <Button type="submit" className="flex-1" disabled={!hasSession || !newStore.store_name.trim()}>
                          إنشاء المتجر
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsCreateStoreOpen(false)} className="flex-1">
                          إلغاء
                        </Button>
                      </div>
                      {!hasSession && (
                        <p className="text-xs text-destructive mt-2">يجب تسجيل الدخول لإنشاء المتجر</p>
                      )}
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">لوحة تحكم المسوق</h1>
          <Button asChild>
            <Link to="/affiliate/store">
              <Store className="ml-2 h-4 w-4" />
              عرض المتجر
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
            <TabsTrigger value="commissions">العمولات</TabsTrigger>
            <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">إجمالي العمولات</p>
                      <p className="text-2xl font-bold">{stats.totalCommissions.toFixed(2)} ريال</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">عمولات هذا الشهر</p>
                      <p className="text-2xl font-bold">{stats.thisMonthCommissions.toFixed(2)} ريال</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">المنتجات النشطة</p>
                      <p className="text-2xl font-bold">{stats.activeProducts}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">معدل التحويل</p>
                      <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* المخطط البياني */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أداء العمولات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="commissions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أفضل المنتجات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">لا توجد منتجات مضافة بعد</p>
                    ) : (
                      products.slice(0, 5).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                          <div>
                            <h3 className="font-medium">{item.products?.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.products?.price_sar} ريال</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyAffiliateLink(item.product_id)}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            {affiliateStore && (
              <AffiliateProductsManager storeId={affiliateStore.id} />
            )}
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionsPanel />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تحليلات النقرات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="clicks" stroke="hsl(var(--accent))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الإحصائيات التفصيلية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>إجمالي الزيارات</span>
                      <Badge variant="secondary">{stats.totalVisits}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>إجمالي النقرات</span>
                      <Badge variant="secondary">{stats.totalClicks}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>النمو الشهري</span>
                      <Badge variant="secondary">{stats.monthlyGrowth}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المتجر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>اسم المتجر</Label>
                    <Input value={affiliateStore?.store_name || ''} disabled />
                  </div>
                  <div>
                    <Label>رابط المتجر</Label>
                    <div className="flex gap-2">
                      <Input value={`${window.location.origin}/store/${affiliateStore?.store_slug || ''}`} disabled className="flex-1" />
                      <Button 
                        variant="outline" 
                        onClick={() => copyAffiliateLink()}
                        className="shrink-0"
                      >
                        نسخ
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>نبذة عن المتجر</Label>
                    <Input value={affiliateStore?.bio || ''} disabled />
                  </div>
                  <Button>تحديث الإعدادات</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AffiliateDashboard;