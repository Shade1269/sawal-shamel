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
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

const AffiliateDashboard = () => {
  const { profile } = useFastAuth();
  const { goToUserHome } = useSmartNavigation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              onClick={goToUserHome}
              className="text-primary hover:bg-primary/10 gap-2"
            >
              <Home className="h-4 w-4" />
              الصفحة الرئيسية
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
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

      {/* التقارير والأدوات المتقدمة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* مخطط الأداء المحسن */}
        <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  تحليل الأداء المتقدم
                </CardTitle>
                <CardDescription>مقارنة العمولات والنقرات والمبيعات</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">آخر 30 يوم</Badge>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      `${value} ${name === 'commissions' ? 'ريال' : 'نقرة'}`,
                      name === 'commissions' ? 'العمولات' : 'النقرات'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commissions" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* معلومات إضافية */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{stats.monthlyGrowth}%</div>
                <p className="text-xs text-muted-foreground">نمو شهري</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent">2.8x</div>
                <p className="text-xs text-muted-foreground">تحسن الأداء</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-premium">#{Math.floor(Math.random() * 50) + 1}</div>
                <p className="text-xs text-muted-foreground">الترتيب</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* كارد الإنجازات والمكافآت */}
        <Card className="border-0 bg-gradient-subtle backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              الإنجازات والمكافآت
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { title: 'أول 1000 ريال', progress: 100, reward: '50 نقطة', completed: true },
                { title: '100 عميل جديد', progress: 76, reward: '100 نقطة', completed: false },
                { title: 'شهر متتالي نشط', progress: 23, reward: 'شارة ذهبية', completed: false },
              ].map((achievement, index) => (
                <div key={index} className="p-3 rounded-xl bg-background/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    {achievement.completed ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <Trophy className="h-3 w-3 ml-1" />
                        مكتمل
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                    )}
                  </div>
                  <Progress value={achievement.progress} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">المكافأة: {achievement.reward}</p>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Gift className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-medium text-sm">النقاط المتاحة</p>
              <p className="text-2xl font-bold text-primary">{profile?.points || 0}</p>
              <Button size="sm" variant="outline" className="mt-2">
                استبدال النقاط
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات الحملات التسويقية */}
      <Card className="border-0 bg-gradient-subtle backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                مركز الحملات التسويقية
              </CardTitle>
              <CardDescription>
                إنشاء وإدارة الحملات التسويقية المتقدمة
              </CardDescription>
            </div>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 ml-2" />
              حملة جديدة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="campaigns">الحملات النشطة</TabsTrigger>
              <TabsTrigger value="links">الروابط المخصصة</TabsTrigger>
              <TabsTrigger value="analytics">التحليلات</TabsTrigger>
              <TabsTrigger value="automation">الأتمتة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="campaigns" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {[
                  { name: 'حملة العروض الشتوية', clicks: 1250, conversions: 45, revenue: 2800, status: 'نشطة', performance: 'ممتاز' },
                  { name: 'حملة المنتجات الجديدة', clicks: 890, conversions: 28, revenue: 1890, status: 'نشطة', performance: 'جيد' },
                  { name: 'حملة نهاية الأسبوع', clicks: 560, conversions: 12, revenue: 980, status: 'متوقفة', performance: 'متوسط' }
                ].map((campaign, index) => (
                  <div key={index} className="p-4 rounded-xl bg-background/50 border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge className={campaign.status === 'نشطة' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline">{campaign.performance}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">تحرير</Button>
                        <Button size="sm" variant="outline">تقرير</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-2 rounded-lg bg-primary/5">
                        <div className="text-lg font-bold text-primary">{campaign.clicks}</div>
                        <p className="text-xs text-muted-foreground">نقرة</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-accent/5">
                        <div className="text-lg font-bold text-accent">{campaign.conversions}</div>
                        <p className="text-xs text-muted-foreground">تحويل</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-premium/5">
                        <div className="text-lg font-bold text-premium">{campaign.revenue} ريال</div>
                        <p className="text-xs text-muted-foreground">إيرادات</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-luxury/5">
                        <div className="text-lg font-bold text-luxury">{((campaign.conversions / campaign.clicks) * 100).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">معدل التحويل</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="links" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Share className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">رابط المتجر الرئيسي</p>
                    <Input
                      value={`${window.location.origin}/store/${affiliateStore?.store_slug}?ref=${profile?.id}`}
                      readOnly
                      className="mt-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyAffiliateLink()}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => window.open(`/store/${affiliateStore?.store_slug}?ref=${profile?.id}`, '_blank')}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start">
                    <Plus className="h-4 w-4 ml-2" />
                    إنشاء رابط مخصص لحملة
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <QrCode className="h-4 w-4 ml-2" />
                    إنشاء رمز QR
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Share className="h-4 w-4 ml-2" />
                    إنشاء رابط قصير
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-background/50 border text-center">
                  <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold">{stats.totalVisits}</div>
                  <p className="text-sm text-muted-foreground">زيارة شهرية</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border text-center">
                  <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                  <div className="text-xl font-bold">{Math.floor(stats.totalVisits * 0.7)}</div>
                  <p className="text-sm text-muted-foreground">زائر فريد</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border text-center">
                  <Clock className="h-8 w-8 text-premium mx-auto mb-2" />
                  <div className="text-xl font-bold">3:24</div>
                  <p className="text-sm text-muted-foreground">متوسط وقت الزيارة</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border text-center">
                  <TrendingUp className="h-8 w-8 text-luxury mx-auto mb-2" />
                  <div className="text-xl font-bold">78%</div>
                  <p className="text-sm text-muted-foreground">معدل الارتداد</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="automation" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-background/50 border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">التسويق التلقائي عبر البريد الإلكتروني</h4>
                      <p className="text-sm text-muted-foreground">إرسال رسائل ترحيب وعروض تلقائية</p>
                    </div>
                    <Button variant="outline">تفعيل</Button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">إشعارات الواتساب</h4>
                      <p className="text-sm text-muted-foreground">تنبيهات فورية للعمولات الجديدة</p>
                    </div>
                    <Button variant="outline">تفعيل</Button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">تحديث الأسعار التلقائي</h4>
                      <p className="text-sm text-muted-foreground">مزامنة أسعار المنتجات تلقائياً</p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">نشط</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* تقارير مفصلة وأدوات إضافية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مركز العملاء */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-primary" />
              مركز خدمة العملاء
            </CardTitle>
            <CardDescription>التواصل مع العملاء وإدارة الاستفسارات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background/50 border text-center">
                <MessageSquare className="h-6 w-6 text-primary mx-auto mb-1" />
                <div className="text-lg font-bold">24</div>
                <p className="text-xs text-muted-foreground">رسالة جديدة</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border text-center">
                <Phone className="h-6 w-6 text-accent mx-auto mb-1" />
                <div className="text-lg font-bold">12</div>
                <p className="text-xs text-muted-foreground">مكالمة فائتة</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { customer: 'أحمد محمد', message: 'استفسار حول المنتج الجديد', time: '5 دقائق', priority: 'عالي' },
                { customer: 'فاطمة علي', message: 'طلب إلغاء الطلب', time: '15 دقيقة', priority: 'متوسط' },
                { customer: 'محمد أحمد', message: 'شكوى حول التوصيل', time: '30 دقيقة', priority: 'عالي' }
              ].map((ticket, index) => (
                <div key={index} className="p-3 rounded-lg bg-background/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{ticket.customer}</h4>
                    <Badge className={ticket.priority === 'عالي' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{ticket.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">منذ {ticket.time}</span>
                    <Button size="sm" variant="outline">رد</Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="w-full">
              <MessageSquare className="h-4 w-4 ml-2" />
              عرض جميع الرسائل
            </Button>
          </CardContent>
        </Card>

        {/* التقارير المفصلة */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              التقارير والتحليلات
            </CardTitle>
            <CardDescription>تقارير مفصلة حول أداء المتجر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { title: 'تقرير المبيعات الشهري', description: 'تحليل مفصل للمبيعات والعمولات', date: 'ديسمبر 2024', size: '2.4 MB' },
                { title: 'تقرير أداء المنتجات', description: 'أداء المنتجات والمنتجات الأكثر مبيعاً', date: 'نوفمبر 2024', size: '1.8 MB' },
                { title: 'تحليل العملاء', description: 'سلوك العملاء ومعدل الاحتفاظ', date: 'أكتوبر 2024', size: '3.1 MB' }
              ].map((report, index) => (
                <div key={index} className="p-3 rounded-lg bg-background/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{report.title}</h4>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{report.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{report.date}</span>
                    <span className="text-xs text-muted-foreground">{report.size}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button className="flex-1">
                <FileText className="h-4 w-4 ml-2" />
                إنشاء تقرير مخصص
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-subtle border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">التقارير التلقائية</h4>
                  <p className="text-xs text-muted-foreground">احصل على تقارير أسبوعية تلقائية</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full">تفعيل الإرسال التلقائي</Button>
            </div>
          </CardContent>
        </Card>
      </div>

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