import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useToast } from '@/hooks/use-toast';
import { SimpleProductForm } from '@/components/inventory/SimpleProductForm';

interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  category: string;
  images: any;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_notes: string | null;
  is_active: boolean;
  stock: number;
  created_at: string;
}

const MerchantProducts = () => {
  const { profile } = useFastAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetchMerchantId();
  }, [profile]);

  useEffect(() => {
    if (merchantId) {
      fetchProducts();
    }
  }, [merchantId, activeTab]);

  const fetchMerchantId = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // إنشاء حساب تاجر تلقائياً إذا لم يوجد
        const { data: inserted, error: insertError } = await supabase
          .from('merchants')
          .insert({
            profile_id: profile.id,
            business_name: profile.full_name || profile.email || 'Merchant',
            default_commission_rate: 10,
            vat_enabled: false,
          })
          .select('id')
          .maybeSingle();

        if (insertError) throw insertError;
        if (inserted?.id) setMerchantId(inserted.id);
      } else {
        setMerchantId(data.id);
      }
    } catch (error) {
      console.error('Error ensuring merchant ID:', error);
      toast({ title: 'خطأ', description: 'تعذر إنشاء/جلب حساب التاجر', variant: 'destructive' });
    }
  };

  const fetchProducts = async () => {
    if (!merchantId) return;

    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('approval_status', activeTab);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'خطأ',
        description: 'فشل جلب المنتجات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><AlertCircle className="h-3 w-3 ml-1" />قيد المراجعة</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 ml-1" />موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 ml-1" />مرفوض</Badge>;
      default:
        return null;
    }
  };

  const stats = {
    all: products.length,
    pending: products.filter(p => p.approval_status === 'pending').length,
    approved: products.filter(p => p.approval_status === 'approved').length,
    rejected: products.filter(p => p.approval_status === 'rejected').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
          <p className="text-muted-foreground">إدارة منتجاتك والاطلاع على حالة الموافقة</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتج جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">جميع المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.all}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">موافق عليها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">مرفوضة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>قائمة المنتجات</CardTitle>
          <CardDescription>عرض وإدارة منتجاتك</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">الكل ({stats.all})</TabsTrigger>
              <TabsTrigger value="pending">قيد المراجعة ({stats.pending})</TabsTrigger>
              <TabsTrigger value="approved">موافق عليها ({stats.approved})</TabsTrigger>
              <TabsTrigger value="rejected">مرفوضة ({stats.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد منتجات في هذه الفئة</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square bg-muted relative">
                        {product.images?.length > 0 && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="object-cover w-full h-full"
                          />
                        )}
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(product.approval_status)}
                        </div>
                        {!product.is_active && (
                          <div className="absolute top-2 left-2">
                            <Badge variant="outline" className="bg-gray-500/10">غير نشط</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {product.price_sar} ر.س
                          </span>
                          <span className="text-xs text-muted-foreground">
                            المخزون: {product.stock}
                          </span>
                        </div>
                        {product.approval_notes && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            <strong>ملاحظات الأدمن:</strong> {product.approval_notes}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => toast({ title: 'قريباً', description: 'صفحة تعديل المنتج قيد التطوير' })}
                            disabled={product.approval_status !== 'pending'}
                          >
                            تعديل
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantProducts;
