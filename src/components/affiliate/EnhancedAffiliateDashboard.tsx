import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Eye,
  Plus,
  BarChart3,
  Calendar,
  Target,
  Award,
  Zap,
  Star,
  Crown,
  Gift,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { useAffiliateOrders } from '@/hooks/useAffiliateOrders';

interface AffiliateStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalVisitors: number;
  conversionRate: number;
  averageOrderValue: number;
  monthlyEarnings: number;
  weeklyGrowth: number;
  topProducts: Array<{
    id: string;
    title: string;
    sales: number;
    revenue: number;
    image_url?: string;
  }>;
  recentOrders: Array<{
    id: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
}

interface LevelInfo {
  current: string;
  progress: number;
  nextLevel: string;
  pointsToNext: number;
  benefits: string[];
}

const EnhancedAffiliateDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const { store, isLoading: storeLoading } = useAffiliateStore();
  const { stats: orderStats, orders, loading: ordersLoading } = useAffiliateOrders(store?.id);

  const isLoading = storeLoading || ordersLoading;

  // جلب بيانات المسوق الحقيقية
  const { data: affiliateData } = useQuery({
    queryKey: ['affiliate-dashboard', store?.id],
    queryFn: async () => {
      if (!store?.id) return null;

      // Get real statistics from the database
      const realStats: AffiliateStats = {
        totalSales: orderStats?.totalRevenue || 0,
        totalOrders: orderStats?.totalOrders || 0,
        totalProducts: 0, // يجب إضافة عداد للمنتجات لاحقاً
        totalVisitors: 0, // يجب ربطه بنظام التحليلات
        conversionRate: 0,
        averageOrderValue: orderStats?.averageOrderValue || 0,
        monthlyEarnings: orderStats?.totalCommissions || 0,
        weeklyGrowth: 0, // يجب حسابه من البيانات التاريخية
        topProducts: [], // سيتم تحميله لاحقاً
        recentOrders: orders?.slice(0, 3).map(order => ({
          id: order.order_number || order.id,
          customer_name: order.customer_name || 'عميل',
          total: order.total_sar || 0,
          status: order.status || 'pending',
          created_at: order.created_at || new Date().toISOString()
        })) || []
      };

      const levelInfo: LevelInfo = {
        current: 'silver', // يجب ربطه بنظام المستويات
        progress: 75,
        nextLevel: 'gold',
        pointsToNext: 450,
        benefits: ['عمولة 15%', 'ثيمات حصرية', 'دعم أولوية', 'تقارير متقدمة']
      };

      return { stats: realStats, level: levelInfo };
    },
    enabled: !!store?.id
  });

  const stats = affiliateData?.stats;
  const levelInfo = affiliateData?.level;

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} ر.س`;
  const formatNumber = (num: number) => new Intl.NumberFormat('ar-SA').format(num);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-info/10 text-info';
      case 'shipped': return 'bg-warning/10 text-warning';
      case 'delivered': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'مؤكد';
      case 'shipped': return 'في الطريق';
      case 'delivered': return 'تم التوصيل';
      default: return status;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze': return <Award className="h-5 w-5 text-bronze" />;
      case 'silver': return <Star className="h-5 w-5 text-muted-foreground" />;
      case 'gold': return <Crown className="h-5 w-5 text-warning" />;
      case 'legendary': return <Sparkles className="h-5 w-5 text-premium" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text-primary">
            لوحة تحكم المسوقة
          </h1>
          <p className="text-muted-foreground mt-2">
            مرحباً بك! إليك ملخص أداء متجرك اليوم
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/affiliate/products')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            إضافة منتج
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/affiliate/storefront')}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            معاينة المتجر
          </Button>
        </div>
      </motion.div>

      {/* Level Progress */}
      {levelInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-bg-primary border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getLevelIcon(levelInfo.current)}
                  <div>
                    <h3 className="font-semibold capitalize">مستوى {levelInfo.current}</h3>
                    <p className="text-sm text-muted-foreground">
                      {levelInfo.pointsToNext} نقطة للوصول لمستوى {levelInfo.nextLevel}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Target className="h-3 w-3" />
                  {levelInfo.progress}%
                </Badge>
              </div>
              
              <Progress value={levelInfo.progress} className="mb-4" />
              
              <div className="flex flex-wrap gap-2">
                {levelInfo.benefits.map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Gift className="h-3 w-3 mr-1" />
                    {benefit}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalSales)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+{stats.weeklyGrowth}%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(stats.totalOrders)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-500">+8 هذا الأسبوع</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الزوار</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(stats.totalVisitors)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Eye className="h-3 w-3 text-purple-500" />
                  <span className="text-xs text-purple-500">معدل التحويل {stats.conversionRate}%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عمولة الشهر</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.monthlyEarnings)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Zap className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-500">متوسط الطلب {formatCurrency(stats.averageOrderValue)}</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    المنتجات الأكثر مبيعاً
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-shrink-0">
                          <Badge className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                            {index + 1}
                          </Badge>
                        </div>
                        
                        {product.image_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img 
                              src={product.image_url} 
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{product.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>المبيعات: {product.sales}</span>
                            <span>الإيرادات: {formatCurrency(product.revenue)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    الطلبات الأخيرة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{order.customer_name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              طلب #{order.id}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getStatusColor(order.status)}`}
                            >
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm">{formatCurrency(order.total)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('ar-SA', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate('/affiliate/orders')}
                  >
                    عرض جميع الطلبات
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => navigate('/affiliate/products/add')}
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">إضافة منتج</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => navigate('/affiliate/storefront')}
                  >
                    <Eye className="h-6 w-6" />
                    <span className="text-sm">معاينة المتجر</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => navigate('/affiliate/analytics')}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">التحليلات</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => navigate('/affiliate/settings')}
                  >
                    <Sparkles className="h-6 w-6" />
                    <span className="text-sm">إعدادات المتجر</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">إدارة المنتجات</h3>
                <p className="text-muted-foreground mb-4">
                  أضف وأدر منتجاتك هنا
                </p>
                <Button onClick={() => navigate('/affiliate/products')}>
                  انتقل لإدارة المنتجات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">إدارة الطلبات</h3>
                <p className="text-muted-foreground mb-4">
                  تابع وأدر طلبات عملائك
                </p>
                <Button onClick={() => navigate('/affiliate/orders')}>
                  انتقل لإدارة الطلبات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">التحليلات المتقدمة</h3>
                <p className="text-muted-foreground mb-4">
                  شاهد تقارير مفصلة عن أداء متجرك
                </p>
                <Button onClick={() => navigate('/affiliate/analytics')}>
                  انتقل للتحليلات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAffiliateDashboard;