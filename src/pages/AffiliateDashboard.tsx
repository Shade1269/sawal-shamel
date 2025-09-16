import { useState, useEffect, useCallback } from 'react';
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
import { createStoreUrl, getBaseUrl, createProductUrl } from '@/utils/domains';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { CommissionsPanel, AffiliateProductsManager } from '@/features/affiliate';
import { StatsOverview } from '@/shared/components';
import { BackButton } from '@/components/ui/back-button';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

const AffiliateDashboard = () => {
  const { profile, user, isLoading, optimizedDataFetch } = useOptimizedAuth();
  const { navigate } = useSmartNavigation();
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
  const [hasExistingStore, setHasExistingStore] = useState(false);
  const [products, setProducts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);
  
  const [newStore, setNewStore] = useState({
    store_name: '',
    bio: '',
    store_slug: '',
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const sanitizeSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);

  // مُحسّن: استخدام Hook محسّن مع caching
  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // التحقق من الجلسة مرة واحدة
        const { data: sessionData } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setHasSession(!!sessionData.session);
        
        // الحصول على profiles.id بدلاً من user_profiles.id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileData?.id) return;

        // استخدام profiles.id لجلب البيانات
        const data = await optimizedDataFetch.fetchAffiliateData(profileData.id);
        if (!isMounted) return;
        
        if (data) {
          setAffiliateStore(data.store);
          setHasExistingStore(!!data.store);
          setProducts(data.products || []);
          setCommissions(data.commissions || []);
          setActivities(data.activities || []);
          setStats(data.stats || stats);
        }
        
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, optimizedDataFetch.fetchAffiliateData]);

  // مُحسّن: دالة جلب البيانات باستخدام Hook محسّن
  const fetchAffiliateData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // الحصول على profiles.id الصحيح
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData?.id) return;

      const data = await optimizedDataFetch.fetchAffiliateData(profileData.id);
      
      if (data) {
        setAffiliateStore(data.store);
        setHasExistingStore(!!data.store);
        setProducts(data.products || []);
        setCommissions(data.commissions || []);
        setActivities(data.activities || []);
        setStats(data.stats || stats);
      }
      
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات المسوق",
        variant: "destructive",
      });
    }
  }, [user?.id, optimizedDataFetch, toast]);

  const handleCreateStore = async (e: any) => {
    e.preventDefault();

    // التحقق من وجود متجر سابق أولاً
    if (hasExistingStore) {
      toast({
        title: "متجر موجود مسبقاً",
        description: "لديك متجر تسويق موجود بالفعل. لا يُسمح بأكثر من متجر واحد",
        variant: "destructive",
      });
      return;
    }

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

      // تحقق من صحة رابط المتجر (Slug) بالإنجليزية فقط
      const slugToUse = sanitizeSlug(newStore.store_slug || newStore.store_name);
      const isValidSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugToUse);
      if (!isValidSlug) {
        toast({
          title: "رابط المتجر غير صالح",
          description: "استخدم أحرف إنجليزية صغيرة وأرقام و- فقط",
          variant: "destructive",
        });
        return;
      }

      // تحقق من وجود متجر فعلياً في قاعدة البيانات لمنع التكرار
      const { data: existingStores, error: existingError } = await supabase
        .from('affiliate_stores')
        .select('id, store_name, store_slug, bio, total_sales, total_orders')
        .eq('profile_id', profileRow.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingError) throw existingError;
      if (existingStores && existingStores.length > 0) {
        setAffiliateStore(existingStores[0] as any);
        setHasExistingStore(true);
        toast({ title: "متجر موجود مسبقاً", description: "لديك متجر مسجل بالفعل.", variant: "destructive" });
        return;
      }

      // إنشاء المتجر عبر Hook محسّن
      const newStoreId = await optimizedDataFetch.createAffiliateStore(profileRow.id, {
        store_name: newStore.store_name,
        bio: newStore.bio || null,
        store_slug: slugToUse
      });

      // جلب السجل لمعرفة الـ slug
      const { data: createdStore, error: fetchError } = await supabase
        .from('affiliate_stores')
        .select('store_slug')
        .eq('id', newStoreId as unknown as string)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const storeUrl = createStoreUrl(createdStore?.store_slug || '');

      toast({
        title: "تم إنشاء المتجر",
        description: `تم إنشاء متجرك بنجاح. رابط المتجر: ${storeUrl}`,
      });

      setIsCreateStoreOpen(false);
      setNewStore({ store_name: '', bio: '', store_slug: '' });
      
      // تحديث الحالة مباشرة دون استخدام setTimeout
      setAffiliateStore({
        id: newStoreId as string,
        store_name: newStore.store_name,
        store_slug: createdStore?.store_slug || slugToUse,
        bio: newStore.bio,
        total_sales: 0,
        total_orders: 0
      });
      setHasExistingStore(true);
      await fetchAffiliateData();
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
    const link = productId 
      ? createProductUrl(productId, profile.id)
      : createStoreUrl(affiliateStore?.store_slug || '', profile.id);
    
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

  if (loading || isLoading) {
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
        {/* زر العودة إلى الداشبورد */}
        <div className="flex justify-start">
          <Button 
            variant="outline" 
            onClick={() => {
              if (profile?.role === 'admin') navigate('/admin/dashboard');
              else if (profile?.role === 'merchant') navigate('/merchant');  
              else if (profile?.role === 'affiliate') navigate('/affiliate');
              else navigate('/dashboard');
            }}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            العودة إلى الداشبورد
          </Button>
        </div>

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
              {hasExistingStore ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Store className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">لديك متجر موجود بالفعل</p>
                  </div>
                  <div className="space-y-2">
                    <Label>رابط متجرك:</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Input 
                        value={createStoreUrl(affiliateStore?.store_slug || '')} 
                        disabled 
                        className="flex-1 bg-background"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyAffiliateLink()}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(createStoreUrl(affiliateStore?.store_slug || ''), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 ml-2" />
                        عرض متجري
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{affiliateStore?.total_sales || 0}</div>
                      <div className="text-xs text-muted-foreground">إجمالي المبيعات</div>
                    </div>
                    <div className="p-3 bg-accent/5 rounded-lg">
                      <div className="text-2xl font-bold text-accent">{affiliateStore?.total_orders || 0}</div>
                      <div className="text-xs text-muted-foreground">إجمالي الطلبات</div>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/affiliate')}
                  >
                    الذهاب إلى لوحة التحكم
                  </Button>
                </div>
              ) : (
                <Dialog open={isCreateStoreOpen} onOpenChange={setIsCreateStoreOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={hasExistingStore}>
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
                        <Label>اسم المتجر (يظهر للعملاء)</Label>
                        <Input
                          value={newStore.store_name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setNewStore((prev) => ({
                              ...prev,
                              store_name: name,
                              ...(slugManuallyEdited ? {} : { store_slug: sanitizeSlug(name) }),
                            }));
                          }}
                          placeholder="اسم متجرك"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رابط المتجر (بالإنجليزية)</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{`${getBaseUrl()}/store/`}</span>
                          <Input
                            value={newStore.store_slug}
                            onChange={(e) => {
                              setSlugManuallyEdited(true);
                              setNewStore({ ...newStore, store_slug: sanitizeSlug(e.target.value) });
                            }}
                            placeholder="my-store"
                            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                            title="استخدم أحرف إنجليزية صغيرة وأرقام وشرطات فقط"
                            required
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          الاسم الظاهر يمكن أن يكون بأي لغة. أما رابط المتجر فيجب أن يكون بالحروف الإنجليزية فقط.
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>نبذة عن المتجر</Label>
                        <Input
                          value={newStore.bio}
                          onChange={(e) => setNewStore({ ...newStore, bio: e.target.value })}
                          placeholder="وصف قصير لمتجرك"
                        />
                      </div>
                        <div className="flex gap-2 items-center">
                          <Button type="submit" className="flex-1" disabled={!hasSession || !newStore.store_name.trim() || !newStore.store_slug.trim() || hasExistingStore}>
                            إنشاء المتجر
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsCreateStoreOpen(false)} className="flex-1">
                            إلغاء
                          </Button>
                        </div>
                        {!hasSession && (
                          <p className="text-xs text-destructive mt-2">يجب تسجيل الدخول لإنشاء المتجر</p>
                        )}
                        {hasExistingStore && (
                          <p className="text-xs text-destructive mt-2">لديك متجر موجود بالفعل. لا يُسمح بأكثر من متجر واحد</p>
                        )}
                    </form>
                  </DialogContent>
                </Dialog>
              )}
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
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-3xl font-bold">لوحة تحكم المسوق</h1>
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              if (affiliateStore?.store_slug) {
                window.open(createStoreUrl(affiliateStore.store_slug), '_blank');
              }
            }}
          >
            <Store className="ml-2 h-4 w-4" />
            عرض المتجر
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
                      <Input value={createStoreUrl(affiliateStore?.store_slug || '')} disabled className="flex-1" />
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