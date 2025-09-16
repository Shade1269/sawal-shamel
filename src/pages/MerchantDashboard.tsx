import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Home,
  ArrowRight
} from 'lucide-react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { BackButton } from '@/components/ui/back-button';

const MerchantDashboard = () => {
  const { profile } = useFastAuth();
  const { goToUserHome } = useSmartNavigation();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeAffiliates: 0
  });
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [merchant, setMerchant] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price_sar: '',
    stock: '',
    category: ''
  });

  useEffect(() => {
    if (profile) {
      fetchMerchantData();
    }
  }, [profile]);

  const fetchMerchantData = async () => {
    try {
      // جلب بيانات التاجر أو إنشاؤها
      let { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (merchantError && merchantError.code !== 'PGRST116') throw merchantError;

      if (!merchantData) {
        const { data: newMerchant, error } = await supabase
          .from('merchants')
          .insert({
            profile_id: profile.id,
            business_name: profile.full_name + ' Store'
          })
          .select()
          .maybeSingle();

        if (error) throw error;
        merchantData = newMerchant;
      }

      setMerchant(merchantData);
      
      // جلب المنتجات
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchantData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // جلب الطلبات مع إخفاء معلومات المسوقين
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          shop_id,
          customer_name,
          customer_phone,
          shipping_address,
          payment_method,
          status,
          subtotal_sar,
          vat_sar,
          total_sar,
          created_at,
          updated_at,
          order_number,
          customer_profile_id,
          shipping_sar,
          tax_sar,
          tracking_number,
          delivered_at,
          order_items (
            *,
            product:products (title)
          )
        `)
        .eq('shop_id', merchantData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;
      
      // إضافة معلومة إذا كان الطلب من مسوق بدون كشف الهوية
      const ordersWithAffiliateInfo = ordersData?.map(order => ({
        ...order,
        is_affiliate_order: false // سيتم تحديثها من جدول admin_order_reviews
      })) || [];
      
      setOrders(ordersWithAffiliateInfo);

      // حساب الإحصائيات
      const totalProducts = productsData?.length || 0;
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_sar || 0), 0) || 0;

        setStats({
          totalProducts,
          totalOrders,
          totalRevenue,
          activeAffiliates: 0 // إخفاء عدد المسوقين لحماية الخصوصية
        });

    } catch (error) {
      console.error('Error fetching merchant data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات التاجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: any) => {
    e.preventDefault();
    if (!merchant) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...newProduct,
          merchant_id: merchant.id,
          price_sar: parseFloat(newProduct.price_sar),
          stock: parseInt(newProduct.stock),
          is_active: true
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      toast({
        title: "تم إضافة المنتج",
        description: "تم إضافة المنتج بنجاح",
      });

      setIsAddProductOpen(false);
      setNewProduct({ title: '', description: '', price_sar: '', stock: '', category: '' });
      fetchMerchantData();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "خطأ في إضافة المنتج",
        description: "تعذر إضافة المنتج",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج بنجاح",
      });

      fetchMerchantData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "خطأ في الحذف",
        description: "تعذر حذف المنتج",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل لوحة المتجر...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <BackButton />
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
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            لوحة تحكم المتجر
          </h1>
          <p className="text-muted-foreground mt-2">
            مرحباً {profile?.full_name}، إليك نظرة عامة على متجرك
          </p>
        </div>
        <Badge className="bg-gradient-premium text-premium-foreground">
          <Store className="ml-1 h-4 w-4" />
          مسوّق
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المنتجات
            </CardTitle>
            <Package className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الطلبات الجديدة
            </CardTitle>
            <ShoppingCart className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المبيعات
            </CardTitle>
            <TrendingUp className="h-6 w-6 text-premium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} ريال</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المبيعات المعتمدة
            </CardTitle>
            <DollarSign className="h-6 w-6 text-luxury" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} ريال</div>
            <p className="text-xs text-muted-foreground mt-1">المبيعات المكتملة</p>
          </CardContent>
        </Card>
      </div>

      {/* Products and Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                منتجاتي
              </CardTitle>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-primary">
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة منتج
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة منتج جديد</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label>اسم المنتج</Label>
                      <Input
                        value={newProduct.title}
                        onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                        placeholder="اسم المنتج"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="وصف المنتج"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>السعر (ريال)</Label>
                        <Input
                          type="number"
                          value={newProduct.price_sar}
                          onChange={(e) => setNewProduct({...newProduct, price_sar: e.target.value})}
                          placeholder="السعر"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>الكمية</Label>
                        <Input
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                          placeholder="الكمية"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>الفئة</Label>
                      <Input
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        placeholder="فئة المنتج"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">إضافة المنتج</Button>
                      <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)} className="flex-1">
                        إلغاء
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد منتجات. ابدأ بإضافة منتج جديد!</p>
              ) : (
                products.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div>
                      <h3 className="font-medium">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">{product.price_sar} ريال</p>
                      <p className="text-xs text-muted-foreground">المخزون: {product.stock}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              الطلبات الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد طلبات حتى الآن</p>
              ) : (
                orders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div>
                      <h3 className="font-medium">{order.customer_name}</h3>
                      <p className="text-sm text-muted-foreground">{order.total_sar} ريال</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status === 'COMPLETED' ? 'مكتمل' : 
                       order.status === 'PENDING' ? 'قيد الانتظار' :
                       order.status === 'CANCELLED' ? 'ملغي' : order.status}
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
              <Package className="h-8 w-8 text-white" />
            </div>
            <CardTitle>إدارة المنتجات</CardTitle>
            <CardDescription>
              إضافة وتحرير وحذف المنتجات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-gradient-primary hover:opacity-90"
              onClick={() => setIsAddProductOpen(true)}
            >
              إدارة المنتجات
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <CardTitle>تقارير المبيعات</CardTitle>
            <CardDescription>
              عرض إحصائيات وتقارير مفصلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-luxury hover:opacity-90">
              عرض التقارير
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-premium rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle>إدارة المسوقين</CardTitle>
            <CardDescription>
              عرض وإدارة المسوقين المرتبطين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-gradient-premium hover:opacity-90">
              إدارة المسوقين
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantDashboard;