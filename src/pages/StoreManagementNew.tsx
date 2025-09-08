import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUserDataContext } from '@/contexts/UserDataContext';
import { Package, Plus, Store, Activity, BarChart3, User, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const StoreManagement = () => {
  const { user } = useAuth();
  const { 
    userShop, 
    userActivities,
    loading,
    createShop, 
    addProduct,
    getShopProducts,
    logActivity 
  } = useUserDataContext();
  
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [shopName, setShopName] = useState('');
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price_sar: '',
    stock: '',
    category: ''
  });

  // تحميل المنتجات عند وجود متجر
  useEffect(() => {
    if (userShop) {
      loadProducts();
    }
  }, [userShop]);

  const loadProducts = async () => {
    try {
      const shopProducts = await getShopProducts();
      setProducts(shopProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم المتجر",
        variant: "destructive"
      });
      return;
    }

    try {
      await createShop(shopName);
      
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء متجرك بنجاح!"
      });
      
      setShowCreateShop(false);
      setShopName('');
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.title.trim() || !newProduct.price_sar) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      await addProduct({
        title: newProduct.title,
        description: newProduct.description,
        price_sar: parseFloat(newProduct.price_sar),
        stock: parseInt(newProduct.stock) || 0,
        category: newProduct.category,
        is_active: true
      });

      toast({
        title: "تم بنجاح",
        description: "تم إضافة المنتج بنجاح!"
      });

      setNewProduct({
        title: '',
        description: '',
        price_sar: '',
        stock: '',
        category: ''
      });
      
      await loadProducts();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل بيانات المتجر...</p>
        </div>
      </div>
    );
  }

  if (!userShop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Store className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">إنشاء متجرك الإلكتروني</CardTitle>
              <p className="text-muted-foreground">
                ابدأ رحلتك في التجارة الإلكترونية وأنشئ متجرك الخاص
              </p>
            </CardHeader>
            <CardContent>
              {!showCreateShop ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    لا يوجد لديك متجر حتى الآن. أنشئ متجرك الأول وابدأ في بيع منتجاتك!
                  </p>
                  <Button onClick={() => setShowCreateShop(true)} className="w-full">
                    <Plus className="ml-2 h-4 w-4" />
                    إنشاء متجر جديد
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateShop} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">اسم المتجر</Label>
                    <Input
                      id="shopName"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="مثال: متجر الإلكترونيات"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateShop(false)} className="flex-1">
                      إلغاء
                    </Button>
                    <Button type="submit" className="flex-1">
                      إنشاء المتجر
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة المتجر</h1>
            <p className="text-muted-foreground">
              مرحباً بك في لوحة تحكم متجر "{userShop.shop_name}"
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userShop.total_products}</div>
              <p className="text-xs text-muted-foreground">منتج متاح في المتجر</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطلبات</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userShop.total_orders}</div>
              <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الأنشطة</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userActivities.length}</div>
              <p className="text-xs text-muted-foreground">نشاط حديث</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Product */}
          <Card>
            <CardHeader>
              <CardTitle>إضافة منتج جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">اسم المنتج</Label>
                  <Input
                    id="title"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct(prev => ({...prev, title: e.target.value}))}
                    placeholder="اسم المنتج"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">وصف المنتج</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({...prev, description: e.target.value}))}
                    placeholder="وصف تفصيلي للمنتج"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر (ر.س)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price_sar}
                      onChange={(e) => setNewProduct(prev => ({...prev, price_sar: e.target.value}))}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stock">الكمية</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct(prev => ({...prev, stock: e.target.value}))}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({...prev, category: e.target.value}))}
                    placeholder="فئة المنتج"
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة المنتج
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>الأنشطة الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0">
                      <Activity className="h-4 w-4 text-muted-foreground mt-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(activity.created_at).toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {userActivities.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm">
                    لا توجد أنشطة حتى الآن
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        {products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>منتجات المتجر ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="border">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">{product.price_sar} ر.س</span>
                        <span className="text-sm text-muted-foreground">متوفر: {product.stock}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StoreManagement;