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
  Crown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AffiliateDashboard = () => {
  const { profile } = useAuthContext();
  const { toast } = useToast();
  
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
    store_slug: '',
    bio: ''
  });

  useEffect(() => {
    if (profile) {
      fetchAffiliateData();
    }
  }, [profile]);

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

    try {
      const { data, error } = await supabase
        .from('affiliate_stores')
        .insert({
          profile_id: profile.id,
          store_name: newStore.store_name,
          store_slug: newStore.store_slug || newStore.store_name.toLowerCase().replace(/\s+/g, '-'),
          bio: newStore.bio,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم إنشاء المتجر",
        description: "تم إنشاء متجرك بنجاح",
      });

      setIsCreateStoreOpen(false);
      setNewStore({ store_name: '', store_slug: '', bio: '' });
      fetchAffiliateData();
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: "خطأ في إنشاء المتجر",
        description: "تعذر إنشاء المتجر",
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
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
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
                  <Button className="w-full bg-gradient-primary">
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
                      <Label>رابط المتجر (اختياري)</Label>
                      <Input
                        value={newStore.store_slug}
                        onChange={(e) => setNewStore({...newStore, store_slug: e.target.value})}
                        placeholder="my-store (سيتم إنشاؤه تلقائياً)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>نبذة عن المتجر</Label>
                      <Input
                        value={newStore.bio}
                        onChange={(e) => setNewStore({...newStore, bio: e.target.value})}
                        placeholder="وصف قصير لمتجرك"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">إنشاء المتجر</Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreateStoreOpen(false)} className="flex-1">
                        إلغاء
                      </Button>
                    </div>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">لوحة المسوق المتقدمة</h1>
              <p className="text-sm text-muted-foreground">
                مرحباً {profile?.full_name} - {affiliateStore?.store_name}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`${getLevelColor(profile?.level)} bg-background border-2`}>
            {getLevelIcon(profile?.level)}
            <span className="ml-1 font-semibold">
              {profile?.level === 'legendary' ? 'أسطوري' :
               profile?.level === 'gold' ? 'ذهبي' :
               profile?.level === 'silver' ? 'فضي' : 'برونزي'}
            </span>
          </Badge>
          <Badge variant="secondary" className="bg-gradient-subtle">
            <Zap className="h-3 w-3 ml-1" />
            {profile?.points || 0} نقطة
          </Badge>
          <Button size="sm" variant="outline">
            <Bell className="h-4 w-4 ml-2" />
            الإشعارات
          </Button>
        </div>
      </div>

      {/* الإنجازات والهدف الأسبوعي */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 bg-gradient-subtle backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              الهدف الأسبوعي
            </CardTitle>
            <CardDescription>
              تقدمك نحو هدف {stats.weeklyGoal} ريال هذا الأسبوع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{stats.thisMonthCommissions.toFixed(2)} ريال</span>
                <span className="text-sm text-muted-foreground">من {stats.weeklyGoal} ريال</span>
              </div>
              <Progress value={stats.weeklyProgress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  باقي {(stats.weeklyGoal - stats.thisMonthCommissions).toFixed(2)} ريال
                </span>
                <span className="font-medium">{stats.weeklyProgress.toFixed(1)}% مكتمل</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              الإنجازات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">أول عمولة</p>
                <p className="text-xs text-muted-foreground">مكتمل</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">100 زائر</p>
                <p className="text-xs text-muted-foreground">80/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">{stats.totalCommissions.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">إجمالي العمولات</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <Badge variant="secondary" className="text-xs">+{stats.monthlyGrowth}%</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">{stats.thisMonthCommissions.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-premium/10 flex items-center justify-center group-hover:bg-premium/20 transition-colors">
                <Eye className="h-5 w-5 text-premium" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">{stats.totalVisits}</div>
            <p className="text-xs text-muted-foreground">إجمالي الزيارات</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-luxury/10 flex items-center justify-center group-hover:bg-luxury/20 transition-colors">
                <Users className="h-5 w-5 text-luxury" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">النقرات</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <ShoppingCart className="h-5 w-5 text-secondary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">معدل التحويل</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <Star className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">المنتجات النشطة</p>
          </CardContent>
        </Card>
      </div>

      {/* التقارير والأدوات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مخطط الأداء */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              أداء العمولات
            </CardTitle>
            <CardDescription>تطور عمولاتك خلال الأسابيع الماضية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} ${name === 'commissions' ? 'ريال' : 'نقرة'}`,
                      name === 'commissions' ? 'العمولات' : 'النقرات'
                    ]}
                  />
                  <Area type="monotone" dataKey="commissions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* الأنشطة الحديثة */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              الأنشطة الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'sale' ? 'bg-green-100 dark:bg-green-900/20' :
                    activity.type === 'commission' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    activity.type === 'click' ? 'bg-purple-100 dark:bg-purple-900/20' :
                    'bg-orange-100 dark:bg-orange-900/20'
                  }`}>
                    {activity.type === 'sale' ? <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                     activity.type === 'commission' ? <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                     activity.type === 'click' ? <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" /> :
                     <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">منذ {activity.time}</span>
                      {activity.amount && (
                        <Badge variant="secondary" className="text-xs">{activity.amount} ريال</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات التسويق */}
      <Card className="border-0 bg-gradient-subtle backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            أدوات التسويق المتقدمة
          </CardTitle>
          <CardDescription>
            إدارة المتجر والروابط التسويقية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="links" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="links">الروابط</TabsTrigger>
              <TabsTrigger value="products">المنتجات</TabsTrigger>
              <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="links" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Share className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">رابط المتجر الرئيسي</p>
                    <Input
                      value={`${window.location.origin}/store/${affiliateStore.store_slug}?ref=${profile.id}`}
                      readOnly
                      className="mt-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyAffiliateLink()}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => window.open(`/store/${affiliateStore.store_slug}?ref=${profile.id}`, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {products.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.products?.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.products?.price_sar} ريال</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => copyAffiliateLink(item.product_id)}>
                      <Share className="h-4 w-4 ml-1" />
                      نسخ الرابط
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4 mt-6">
              <div className="grid gap-3">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                      notification.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      'bg-yellow-100 dark:bg-yellow-900/20'
                    }`}>
                      <Bell className={`h-4 w-4 ${
                        notification.type === 'success' ? 'text-green-600 dark:text-green-400' :
                        notification.type === 'info' ? 'text-blue-600 dark:text-blue-400' :
                        'text-yellow-600 dark:text-yellow-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Products and Commissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              أفضل المنتجات
            </CardTitle>
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

        {/* Recent Commissions */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              العمولات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد عمولات حتى الآن</p>
              ) : (
                commissions.map((commission: any) => (
                  <div key={commission.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div>
                      <p className="font-medium">{commission.amount_sar} ريال</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(commission.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <Badge className={
                      commission.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      commission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }>
                      {commission.status === 'PAID' ? 'مدفوع' : 
                       commission.status === 'PENDING' ? 'قيد الانتظار' : commission.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <CardTitle>إدارة المنتجات</CardTitle>
            <CardDescription>
              أضف منتجات جديدة لمتجرك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-primary hover:opacity-90">
              إدارة المنتجات
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto mb-4">
              <Share className="h-8 w-8 text-white" />
            </div>
            <CardTitle>روابط الحملات</CardTitle>
            <CardDescription>
              إنشاء وإدارة روابط التسويق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-luxury hover:opacity-90">
              إنشاء رابط
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-premium rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <CardTitle>تخصيص المتجر</CardTitle>
            <CardDescription>
              تخصيص مظهر وإعدادات متجرك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-premium hover:opacity-90">
              تخصيص المتجر
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateDashboard;