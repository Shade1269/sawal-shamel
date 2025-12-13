import { useState, useEffect } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
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
  merchant_base_price_sar?: number;
  catalog_price_sar?: number;
  category: string;
  images: any;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_notes: string | null;
  is_active: boolean;
  stock: number;
  created_at: string;
  merchant_id: string;
  brand_id?: string;
  category_id?: string;
  sku?: string;
  image_url?: string;
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
      // أولاً: الحصول على profile_id الحقيقي من جدول profiles
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', profile.auth_user_id ?? '')
        .maybeSingle();

      if (profileErr && profileErr.code !== 'PGRST116') throw profileErr;

      const profileId = profileRow?.id;
      if (!profileId) {
        toast({ 
          title: 'خطأ', 
          description: 'لم يتم العثور على الملف الشخصي', 
          variant: 'destructive' 
        });
        return;
      }

      // ثانياً: الحصول على merchant_id باستخدام profile_id الصحيح
      const { data, error } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setMerchantId(data.id);
      } else {
        toast({ 
          title: 'خطأ', 
          description: 'لم يتم العثور على حساب تاجر. الرجاء تحديث الصفحة.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error fetching merchant ID:', error);
      toast({ 
        title: 'خطأ', 
        description: 'تعذر جلب حساب التاجر', 
        variant: 'destructive' 
      });
    }
  };

  const fetchProducts = async () => {
    if (!merchantId) return;

    setLoading(true);
    try {
      const baseQuery = supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      const query = activeTab !== 'all' 
        ? baseQuery.eq('approval_status', activeTab)
        : baseQuery;

      const { data, error } = await query;

      if (error) throw error;
      setProducts((data || []) as unknown as Product[]);
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
        return <UnifiedBadge variant="outline" className="bg-warning/10 text-warning border-warning/20"><AlertCircle className="h-3 w-3 ml-1" />قيد المراجعة</UnifiedBadge>;
      case 'approved':
        return <UnifiedBadge variant="outline" className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 ml-1" />موافق عليه</UnifiedBadge>;
      case 'rejected':
        return <UnifiedBadge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 ml-1" />مرفوض</UnifiedBadge>;
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
        <UnifiedButton onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتج جديد
        </UnifiedButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UnifiedCard variant="glass">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">جميع المنتجات</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold">{stats.all}</div>
          </UnifiedCardContent>
        </UnifiedCard>
        <UnifiedCard variant="glass">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">قيد المراجعة</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </UnifiedCardContent>
        </UnifiedCard>
        <UnifiedCard variant="glass">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">موافق عليها</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
          </UnifiedCardContent>
        </UnifiedCard>
        <UnifiedCard variant="glass">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">مرفوضة</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>

      <UnifiedCard variant="glass">
        <UnifiedCardHeader>
          <UnifiedCardTitle>قائمة المنتجات</UnifiedCardTitle>
          <UnifiedCardDescription>عرض وإدارة منتجاتك</UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent>
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
                    <UnifiedCard key={product.id} variant="glass" hover="lift">
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
                            <UnifiedBadge variant="outline" className="bg-muted/50">غير نشط</UnifiedBadge>
                          </div>
                        )}
                      </div>
                      <UnifiedCardContent className="p-4 space-y-2">
                        <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        
                        {/* معلومات التسعير */}
                        <div className="space-y-1 pt-2 border-t">
                          {product.merchant_base_price_sar ? (
                              <>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">سعرك الأساسي:</span>
                                <span className="font-bold text-success">
                                  {product.merchant_base_price_sar.toFixed(2)} ر.س
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">سعر الكتالوج:</span>
                                <span className="font-medium">
                                  {product.catalog_price_sar?.toFixed(2) || (product.merchant_base_price_sar * 1.25).toFixed(2)} ر.س
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">السعر:</span>
                              <span className="text-lg font-bold text-primary">
                                {product.price_sar} ر.س
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-muted-foreground">المخزون:</span>
                            <span className="font-medium">{product.stock}</span>
                          </div>
                        </div>

                        {product.approval_notes && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            <strong>ملاحظات الأدمن:</strong> {product.approval_notes}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <UnifiedButton
                            variant="outline"
                            size="sm"
                            fullWidth
                            onClick={() => toast({ title: 'قريباً', description: 'صفحة تعديل المنتج قيد التطوير' })}
                            disabled={product.approval_status !== 'pending'}
                          >
                            تعديل
                          </UnifiedButton>
                        </div>
                      </UnifiedCardContent>
                    </UnifiedCard>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </UnifiedCardContent>
      </UnifiedCard>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة منتج جديد</DialogTitle>
          </DialogHeader>
          <SimpleProductForm
            onSuccess={() => {
              setShowAdd(false);
              fetchProducts();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MerchantProducts;
