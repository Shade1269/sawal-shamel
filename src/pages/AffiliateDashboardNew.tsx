import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BarChart3, 
  DollarSign, 
  Package, 
  Store, 
  Settings,
  Bell,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

// Import new components
import { AffiliateOverview } from '@/components/affiliate/AffiliateOverview';
import { AffiliateCommissions } from '@/components/affiliate/AffiliateCommissions';
import { AffiliateAnalytics } from '@/components/affiliate/AffiliateAnalytics';
import { AffiliateStoreManager } from '@/components/affiliate/AffiliateStoreManager';
import { AffiliateProductsManager } from '@/components/AffiliateProductsManager';
import AffiliateStoreCustomizer from '@/components/affiliate/AffiliateStoreCustomizer';
import StoreAnalyticsDashboard from '@/components/affiliate/StoreAnalyticsDashboard';

const AffiliateDashboardNew = () => {
  const { profile } = useFastAuth();
  const { navigate } = useSmartNavigation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [affiliateStore, setAffiliateStore] = useState(null);
  const [stats, setStats] = useState({
    totalCommissions: 0,
    thisMonthCommissions: 0,
    totalSales: 0,
    conversionRate: 3.2,
    totalVisits: 2847,
    totalClicks: 456,
    activeProducts: 0,
    monthlyGrowth: 15.3,
    weeklyGoal: 5000,
    weeklyProgress: 2340,
    pendingCommissions: 0,
    paidCommissions: 0
  });
  const [commissions, setCommissions] = useState([]);
  const [products, setProducts] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Sample chart data
  const sampleChartData = [
    { month: 'يناير', commissions: 850, sales: 8500 },
    { month: 'فبراير', commissions: 1200, sales: 12000 },
    { month: 'مارس', commissions: 980, sales: 9800 },
    { month: 'أبريل', commissions: 1500, sales: 15000 },
    { month: 'مايو', commissions: 1800, sales: 18000 },
    { month: 'يونيو', commissions: 2340, sales: 23400 }
  ];

  useEffect(() => {
    if (profile) {
      fetchAffiliateData();
    }
  }, [profile]);

  const fetchAffiliateData = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);

      // Fetch affiliate store
      const { data: storeData } = await supabase
        .from('affiliate_stores')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (storeData) {
        setAffiliateStore(storeData);

        // Fetch affiliate products
        const { data: productsData } = await supabase
          .from('affiliate_products')
          .select(`
            *,
            products (
              id,
              title,
              price_sar,
              image_urls,
              is_active
            )
          `)
          .eq('affiliate_store_id', storeData.id)
          .eq('is_visible', true);

        setProducts(productsData || []);

        // Fetch commissions
        const { data: commissionsData } = await supabase
          .from('commissions')
          .select('*')
          .eq('affiliate_id', profile.id)
          .order('created_at', { ascending: false });

        setCommissions(commissionsData || []);

        // Calculate stats
        const totalCommissions = commissionsData?.reduce((sum, c) => sum + parseFloat(c.amount_sar?.toString() || '0'), 0) || 0;
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const thisMonthCommissions = commissionsData?.filter(c => new Date(c.created_at) >= thisMonth)
          .reduce((sum, c) => sum + parseFloat(c.amount_sar?.toString() || '0'), 0) || 0;
        const pendingCommissions = commissionsData?.filter(c => c.status === 'PENDING')
          .reduce((sum, c) => sum + parseFloat(c.amount_sar?.toString() || '0'), 0) || 0;
        const paidCommissions = commissionsData?.filter(c => c.status === 'PAID')
          .reduce((sum, c) => sum + parseFloat(c.amount_sar?.toString() || '0'), 0) || 0;

        setStats(prev => ({
          ...prev,
          totalCommissions,
          thisMonthCommissions,
          totalSales: totalCommissions * 10, // Estimated sales based on 10% commission
          activeProducts: productsData?.length || 0,
          pendingCommissions,
          paidCommissions
        }));

        setChartData(sampleChartData);
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

  const handleUpdateStore = async (storeData: any) => {
    if (!affiliateStore) return;

    try {
      const { error } = await supabase
        .from('affiliate_stores')
        .update(storeData)
        .eq('id', affiliateStore.id);

      if (error) throw error;

      setAffiliateStore(prev => ({ ...prev, ...storeData }));
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المتجر بنجاح",
      });
    } catch (error) {
      console.error('Error updating store:', error);
      toast({
        title: "خطأ في التحديث",
        description: "تعذر تحديث بيانات المتجر",
        variant: "destructive",
      });
    }
  };

  const handleExportCommissions = () => {
    // Generate CSV or PDF export
    const csvContent = "data:text/csv;charset=utf-8," 
      + "التاريخ,رقم الطلب,المبلغ,الحالة\n"
      + commissions.map(c => `${c.created_at},${c.order_id},${c.amount_sar},${c.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "affiliate_commissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="flex justify-start">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
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

          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Store className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">إنشاء متجر التسويق</h3>
              <p className="text-muted-foreground mb-4">
                أنشئ متجرك الخاص لبدء التسويق بالعمولة
              </p>
              <Button 
                className="w-full" 
                onClick={() => navigate('/affiliate-dashboard')}
              >
                <Plus className="ml-2 h-4 w-4" />
                إنشاء متجر جديد
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم المسوق</h1>
          <p className="text-muted-foreground">إدارة متجرك ومتابعة أداء العمولات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <Home className="h-4 w-4 ml-2" />
            الداشبورد الرئيسي
          </Button>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">العمولات</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">المنتجات</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">التحليلات</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">المتجر</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AffiliateOverview 
            stats={stats}
            chartData={chartData}
            level="bronze"
            affiliateStore={affiliateStore}
          />
        </TabsContent>

        <TabsContent value="commissions">
          <AffiliateCommissions 
            commissions={commissions}
            stats={stats}
            onExport={handleExportCommissions}
          />
        </TabsContent>

        <TabsContent value="products">
          <AffiliateProductsManager storeId={affiliateStore?.id} />
        </TabsContent>

        <TabsContent value="analytics">
          <AffiliateAnalytics 
            timeRange="30d"
          />
        </TabsContent>

        <TabsContent value="store">
          <Tabs defaultValue="management" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="management">إدارة المتجر</TabsTrigger>
              <TabsTrigger value="customization">التخصيص</TabsTrigger>
              <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="management">
              <AffiliateStoreManager 
                store={affiliateStore}
                onUpdateStore={handleUpdateStore}
                onGenerateQR={() => {
                  toast({
                    title: "قريباً",
                    description: "ميزة توليد رمز QR ستكون متاحة قريباً",
                  });
                }}
              />
            </TabsContent>
            
            <TabsContent value="customization">
              <AffiliateStoreCustomizer 
                store={affiliateStore}
                onUpdateStore={handleUpdateStore}
              />
            </TabsContent>
            
            <TabsContent value="analytics">
              <StoreAnalyticsDashboard storeId={affiliateStore?.id} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateDashboardNew;