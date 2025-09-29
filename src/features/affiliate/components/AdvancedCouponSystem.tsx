import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Edit, Trash2, Calendar as CalendarIcon, Gift, Users, TrendingUp, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  usage_limit_per_customer: number;
  usage_count: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  applicable_products: string[];
  applicable_categories: string[];
  created_at: string;
}

interface CouponUsage {
  id: string;
  coupon_id: string;
  customer_id: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
  customer_name: string;
}

interface AdvancedCouponSystemProps {
  storeId: string;
}

export const AdvancedCouponSystem = ({ storeId }: AdvancedCouponSystemProps) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponUsage, setCouponUsage] = useState<CouponUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [validFromDate, setValidFromDate] = useState<Date>(new Date());
  const [validUntilDate, setValidUntilDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as const,
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 100,
    usage_limit_per_customer: 1,
    valid_from: new Date(),
    valid_until: new Date(),
    applicable_products: [] as string[],
    applicable_categories: [] as string[],
    is_active: true
  });
  const { toast } = useToast();

  const fetchCoupons = async () => {
    try {
      // Mock data since the coupon system is not fully implemented
      const mockCoupons: Coupon[] = [];
      setCoupons(mockCoupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "خطأ في تحميل الكوبونات",
        description: "حدث خطأ أثناء تحميل الكوبونات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponUsage = async () => {
    try {
      // Mock data since coupon usage tracking is not implemented
      const mockUsage: CouponUsage[] = [];
      setCouponUsage(mockUsage);
    } catch (error) {
      console.error('Error fetching coupon usage:', error);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchCoupons();
      fetchCouponUsage();
    }
  }, [storeId]);

  const handleSaveCoupon = async () => {
    try {
      toast({
        title: "قريباً",
        description: "ميزة إدارة الكوبونات ستكون متاحة قريباً",
      });
      
      setDialogOpen(false);
      setEditingCoupon(null);
      setNewCoupon({
        code: '',
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order_amount: 0,
        max_discount_amount: 0,
        usage_limit: 100,
        usage_limit_per_customer: 1,
        valid_from: new Date(),
        valid_until: new Date(),
        applicable_products: [],
        applicable_categories: [],
        is_active: true
      });
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الكوبون",
        variant: "destructive",
      });
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon(prev => ({ ...prev, code: result }));
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      toast({
        title: "قريباً",
        description: "ميزة حذف الكوبونات ستكون متاحة قريباً",
      });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الكوبون",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">نظام الكوبونات المتقدم</h2>
          <p className="text-muted-foreground">إدارة كوبونات الخصم وتحليل الاستخدام</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCoupon(null);
              setNewCoupon({
                code: '',
                name: '',
                description: '',
                discount_type: 'percentage',
                discount_value: 0,
                min_order_amount: 0,
                max_discount_amount: 0,
                usage_limit: 100,
                usage_limit_per_customer: 1,
                valid_from: new Date(),
                valid_until: new Date(),
                applicable_products: [],
                applicable_categories: [],
                is_active: true
              });
            }}>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء كوبون جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
              </DialogTitle>
              <DialogDescription>
                أنشئ كوبونات خصم مخصصة لعملائك مع إمكانيات متقدمة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">المعلومات الأساسية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">كود الكوبون</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="SAVE20"
                      />
                      <Button type="button" variant="outline" onClick={generateCouponCode}>
                        توليد
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="name">اسم الكوبون</Label>
                    <Input
                      id="name"
                      value={newCoupon.name}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="خصم الجمعة البيضاء"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="وصف الكوبون وشروط الاستخدام"
                    rows={3}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveCoupon} className="flex-1">
                  {editingCoupon ? 'تحديث الكوبون' : 'إنشاء الكوبون'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="coupons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="coupons">الكوبونات</TabsTrigger>
          <TabsTrigger value="usage">تتبع الاستخدام</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          {coupons.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد كوبونات بعد</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإنشاء كوبونات خصم لجذب المزيد من العملاء
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء أول كوبون
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {/* Coupon cards would go here */}
            </div>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تتبع استخدام الكوبونات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد بيانات استخدام بعد</h3>
                <p className="text-muted-foreground">
                  عندما يستخدم العملاء كوبوناتك، ستظهر التفاصيل هنا
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الكوبونات</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">كوبون نشط</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل الاستخدام</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground">من إجمالي الطلبات</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الخصومات</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 ريال</div>
                <p className="text-xs text-muted-foreground">خصومات مطبقة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">عملاء جدد</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">من خلال الكوبونات</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};