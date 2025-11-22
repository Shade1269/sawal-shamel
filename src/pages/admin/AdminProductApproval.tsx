import { useState, useEffect } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedBadge } from '@/components/design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, Eye, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFastAuth } from '@/hooks/useFastAuth';

interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  category: string;
  images: any;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_notes: string | null;
  created_at: string;
  merchant_id: string;
  merchants: {
    business_name: string;
    profile_id: string;
  };
}

const AdminProductApproval = () => {
  const { profile } = useFastAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('approval_status');

      if (error) throw error;
      
      const counts = {
        pending: data?.filter(p => p.approval_status === 'pending').length || 0,
        approved: data?.filter(p => p.approval_status === 'approved').length || 0,
        rejected: data?.filter(p => p.approval_status === 'rejected').length || 0,
      };
      setStats(counts);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          merchants(business_name, profile_id)
        `)
        .eq('approval_status', activeTab)
        .order('created_at', { ascending: false });

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

  const handleApprove = async (productId: string) => {
    setIsReviewing(true);
    try {
      console.log('Profile data:', profile);
      console.log('Profile ID:', profile?.id);
      
      if (!profile?.id) {
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      // Try to update without approved_by first, then update with it
      const updateData: any = {
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approval_notes: reviewNotes || null,
      };

      // Only add approved_by if we have a valid profile ID
      if (profile.id) {
        updateData.approved_by = profile.id;
      }

      let { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      // If error with approved_by, try without it
      if (error && error.code === '23503') {
        console.log('Foreign key error, trying without approved_by');
        const { error: retryError } = await supabase
          .from('products')
          .update({
            approval_status: 'approved',
            approved_at: new Date().toISOString(),
            approval_notes: reviewNotes || null,
          })
          .eq('id', productId);
        
        if (retryError) {
          console.error('Supabase retry error:', retryError);
          throw retryError;
        }
      } else if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: 'تمت الموافقة',
        description: 'تمت الموافقة على المنتج بنجاح',
      });

      setSelectedProduct(null);
      setReviewNotes('');
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error approving product:', error);
      toast({
        title: 'خطأ',
        description: 'فشل الموافقة على المنتج',
        variant: 'destructive',
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async (productId: string) => {
    if (!reviewNotes.trim()) {
      toast({
        title: 'تنبيه',
        description: 'يجب إضافة سبب الرفض',
        variant: 'destructive',
      });
      return;
    }

    setIsReviewing(true);
    try {
      if (!profile?.id) {
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      // Try to update without approved_by first, then update with it
      const updateData: any = {
        approval_status: 'rejected',
        rejected_at: new Date().toISOString(),
        approval_notes: reviewNotes,
      };

      // Only add approved_by if we have a valid profile ID
      if (profile.id) {
        updateData.approved_by = profile.id;
      }

      let { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      // If error with approved_by, try without it
      if (error && error.code === '23503') {
        console.log('Foreign key error, trying without approved_by');
        const { error: retryError } = await supabase
          .from('products')
          .update({
            approval_status: 'rejected',
            rejected_at: new Date().toISOString(),
            approval_notes: reviewNotes,
          })
          .eq('id', productId);
        
        if (retryError) {
          console.error('Supabase retry error:', retryError);
          throw retryError;
        }
      } else if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: 'تم الرفض',
        description: 'تم رفض المنتج',
      });

      setSelectedProduct(null);
      setReviewNotes('');
      fetchProducts();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast({
        title: 'خطأ',
        description: 'فشل رفض المنتج',
        variant: 'destructive',
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <UnifiedBadge variant="warning" leadingIcon={<AlertCircle className="h-3 w-3" />}>قيد المراجعة</UnifiedBadge>;
      case 'approved':
        return <UnifiedBadge variant="success" leadingIcon={<CheckCircle className="h-3 w-3" />}>موافق عليه</UnifiedBadge>;
      case 'rejected':
        return <UnifiedBadge variant="error" leadingIcon={<XCircle className="h-3 w-3" />}>مرفوض</UnifiedBadge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">موافقة المنتجات</h1>
          <p className="text-muted-foreground">مراجعة والموافقة على المنتجات الجديدة</p>
        </div>
        <Package className="h-8 w-8 text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UnifiedCard variant="default" padding="md">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">قيد المراجعة</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
          </UnifiedCardContent>
        </UnifiedCard>
        <UnifiedCard variant="default" padding="md">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">موافق عليها</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
          </UnifiedCardContent>
        </UnifiedCard>
        <UnifiedCard variant="default" padding="md">
          <UnifiedCardHeader className="pb-3">
            <UnifiedCardTitle className="text-sm font-medium">مرفوضة</UnifiedCardTitle>
          </UnifiedCardHeader>
          <UnifiedCardContent>
            <div className="text-2xl font-bold text-danger">{stats.rejected}</div>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>

      <UnifiedCard variant="elegant" padding="md">
        <UnifiedCardHeader>
          <UnifiedCardTitle>قائمة المنتجات</UnifiedCardTitle>
          <UnifiedCardDescription>مراجعة المنتجات حسب الحالة</UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                قيد المراجعة ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="approved">
                موافق عليها ({stats.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                مرفوضة ({stats.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد منتجات في هذه الحالة
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <UnifiedCard key={product.id} variant="default" padding="none" className="overflow-hidden">
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
                      </div>
                      <UnifiedCardContent className="p-4 space-y-2">
                        <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            {product.price_sar} ر.س
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {product.merchants.business_name}
                          </span>
                        </div>
                        {product.approval_notes && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            <strong>ملاحظات:</strong> {product.approval_notes}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <UnifiedButton
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedProduct(product)}
                            leftIcon={<Eye className="h-4 w-4" />}
                          >
                            مراجعة
                          </UnifiedButton>
                          {activeTab === 'pending' && (
                            <>
                              <UnifiedButton
                                variant="success"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                }}
                                leftIcon={<Check className="h-4 w-4" />}
                              />
                              <UnifiedButton
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                }}
                                leftIcon={<X className="h-4 w-4" />}
                              />
                            </>
                          )}
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

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>مراجعة المنتج</DialogTitle>
            <DialogDescription>
              قم بمراجعة تفاصيل المنتج واتخاذ القرار المناسب
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم المنتج</Label>
                  <p className="font-medium">{selectedProduct.title}</p>
                </div>
                <div>
                  <Label>السعر</Label>
                  <p className="font-medium">{selectedProduct.price_sar} ر.س</p>
                </div>
                <div>
                  <Label>التاجر</Label>
                  <p className="font-medium">{selectedProduct.merchants.business_name}</p>
                </div>
                <div>
                  <Label>الفئة</Label>
                  <p className="font-medium">{selectedProduct.category || 'غير محدد'}</p>
                </div>
              </div>
              <div>
                <Label>الوصف</Label>
                <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
              </div>
              <div>
                <Label htmlFor="review-notes">ملاحظات المراجعة</Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="أضف ملاحظات حول قرارك (إلزامي في حالة الرفض)"
                  rows={3}
                />
              </div>
              {activeTab === 'pending' && (
                <div className="flex gap-3">
                  <UnifiedButton
                    variant="success"
                    className="flex-1"
                    onClick={() => handleApprove(selectedProduct.id)}
                    disabled={isReviewing}
                    loading={isReviewing}
                    loadingText="جاري المعالجة..."
                    leftIcon={!isReviewing && <Check className="h-4 w-4" />}
                  >
                    {!isReviewing && 'موافقة'}
                  </UnifiedButton>
                  <UnifiedButton
                    variant="danger"
                    className="flex-1"
                    onClick={() => handleReject(selectedProduct.id)}
                    disabled={isReviewing || !reviewNotes.trim()}
                    loading={isReviewing}
                    loadingText="جاري المعالجة..."
                    leftIcon={!isReviewing && <X className="h-4 w-4" />}
                  >
                    {!isReviewing && 'رفض'}
                  </UnifiedButton>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductApproval;
