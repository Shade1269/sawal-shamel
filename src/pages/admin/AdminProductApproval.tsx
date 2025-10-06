import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    user_profile_id: string;
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

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          merchants(business_name, user_profile_id)
        `)
        .eq('approval_status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
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
      const { error } = await supabase
        .from('products')
        .update({
          approval_status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
          approval_notes: reviewNotes || null,
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'تمت الموافقة',
        description: 'تمت الموافقة على المنتج بنجاح',
      });

      setSelectedProduct(null);
      setReviewNotes('');
      fetchProducts();
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
      const { error } = await supabase
        .from('products')
        .update({
          approval_status: 'rejected',
          approved_by: profile?.id,
          rejected_at: new Date().toISOString(),
          approval_notes: reviewNotes,
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'تم الرفض',
        description: 'تم رفض المنتج',
      });

      setSelectedProduct(null);
      setReviewNotes('');
      fetchProducts();
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
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><AlertCircle className="h-3 w-3 ml-1" />قيد المراجعة</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 ml-1" />موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 ml-1" />مرفوض</Badge>;
      default:
        return null;
    }
  };

  const allProducts = products;
  const stats = {
    pending: allProducts.filter(p => p.approval_status === 'pending').length,
    approved: allProducts.filter(p => p.approval_status === 'approved').length,
    rejected: allProducts.filter(p => p.approval_status === 'rejected').length,
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
          <CardDescription>مراجعة المنتجات حسب الحالة</CardDescription>
        </CardHeader>
        <CardContent>
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
                            {product.merchants.business_name}
                          </span>
                        </div>
                        {product.approval_notes && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            <strong>ملاحظات:</strong> {product.approval_notes}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            مراجعة
                          </Button>
                          {activeTab === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  handleApprove(product.id);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedProduct(product);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => handleApprove(selectedProduct.id)}
                    disabled={isReviewing}
                  >
                    <Check className="h-4 w-4 ml-2" />
                    موافقة
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedProduct.id)}
                    disabled={isReviewing || !reviewNotes.trim()}
                  >
                    <X className="h-4 w-4 ml-2" />
                    رفض
                  </Button>
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
