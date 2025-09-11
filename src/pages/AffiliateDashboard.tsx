import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  ExternalLink
} from 'lucide-react';
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
    totalVisits: 0
  });
  
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

        setStats({
          totalCommissions,
          thisMonthCommissions,
          totalSales: storeData.total_sales || 0,
          conversionRate: 2.5, // مؤقت
          totalVisits: 1250 // مؤقت
        });

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
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            لوحة المسوق
          </h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {profile?.full_name}، إليك أداءك في التسويق بالعمولة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getLevelColor(profile?.level)} bg-background`}>
            {getLevelIcon(profile?.level)}
            <span className="ml-1">
              {profile?.level === 'legendary' ? 'أسطوري' :
               profile?.level === 'gold' ? 'ذهبي' :
               profile?.level === 'silver' ? 'فضي' : 'برونزي'}
            </span>
          </Badge>
          <Badge variant="secondary">
            {profile?.points || 0} نقطة
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي العمولات
            </CardTitle>
            <DollarSign className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommissions.toFixed(2)} ريال</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              عمولة هذا الشهر
            </CardTitle>
            <TrendingUp className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthCommissions.toFixed(2)} ريال</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الزيارات
            </CardTitle>
            <Eye className="h-6 w-6 text-premium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisits}</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              معدل التحويل
            </CardTitle>
            <ShoppingCart className="h-6 w-6 text-luxury" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Store Link */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>رابط متجرك</CardTitle>
          <CardDescription>
            شارك هذا الرابط لجلب العملاء وكسب العمولات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={`${window.location.origin}/store/${affiliateStore.store_slug}?ref=${profile.id}`}
              readOnly
              className="flex-1"
            />
            <Button 
              size="sm"
              onClick={() => copyAffiliateLink()}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(`/store/${affiliateStore.store_slug}?ref=${profile.id}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
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