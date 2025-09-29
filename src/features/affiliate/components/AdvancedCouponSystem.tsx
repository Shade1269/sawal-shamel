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
import { supabase } from '@/integrations/supabase/client';
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
  const [validFromDate, setValidFromDate] = useState<Date | undefined>(new Date());
  const [validUntilDate, setValidUntilDate] = useState<Date | undefined>(new Date());
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    usage_limit: 100,
    usage_limit_per_customer: 1,
    applicable_products: [] as string[],
    applicable_categories: [] as string[],
    is_active: true
  });
  const { toast } = useToast();

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('shop_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "خطأ في تحميل الكوبونات",
        description: "حدث خطأ أثناء تحميل الكوبونات",
        variant: "destructive",
      });
    }
  };

  const fetchCouponUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('coupon_usage')
        .select(`
          *,
          profiles!customer_id(full_name)
        `)
        .in('coupon_id', coupons.map(c => c.id))
        .order('used_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const usageWithNames = (data || []).map(usage => ({
        ...usage,
        customer_name: usage.profiles?.full_name || 'عميل مجهول'
      }));
      
      setCouponUsage(usageWithNames);
    } catch (error) {
      console.error('Error fetching coupon usage:', error);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchCoupons();
    }
  }, [storeId]);

  useEffect(() => {
    if (coupons.length > 0) {
      fetchCouponUsage();
    }
  }, [coupons]);

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon(prev => ({ ...prev, code: result }));
  };

  const handleSaveCoupon = async () => {
    try {
      if (!newCoupon.code || !newCoupon.name || !validFromDate || !validUntilDate) {
        toast({
          title: "بيانات مطلوبة",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }

      const couponData = {
        ...newCoupon,
        shop_id: storeId,
        valid_from: validFromDate.toISOString(),
        valid_until: validUntilDate.toISOString(),
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث الكوبون بنجاح",
        });
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);

        if (error) throw error;

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء الكوبون بنجاح",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الكوبون",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
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
      applicable_products: [],
      applicable_categories: [],
      is_active: true
    });
    setValidFromDate(new Date());
    setValidUntilDate(new Date());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ الكود إلى الحافظة",
    });
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount || 0,
      usage_limit: coupon.usage_limit,
      usage_limit_per_customer: coupon.usage_limit_per_customer,
      applicable_products: coupon.applicable_products,
      applicable_categories: coupon.applicable_categories,
      is_active: coupon.is_active
    });
    setValidFromDate(new Date(coupon.valid_from));
    setValidUntilDate(new Date(coupon.valid_until));
    setDialogOpen(true);
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الكوبون بنجاح",
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الكوبون",
        variant: "destructive",
      });
    }
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (!coupon.is_active) return { label: 'غير نشط', variant: 'secondary' as const };
    if (now < validFrom) return { label: 'لم يبدأ بعد', variant: 'outline' as const };
    if (now > validUntil) return { label: 'منتهي الصلاحية', variant: 'destructive' as const };
    if (coupon.usage_count >= coupon.usage_limit) return { label: 'استنفد', variant: 'destructive' as const };
    
    return { label: 'نشط', variant: 'default' as const };
  };

  const getTotalSavings = () => {
    return couponUsage.reduce((total, usage) => total + usage.discount_amount, 0);
  };

  const getTopCoupons = () => {
    const couponStats = coupons.map(coupon => ({
      ...coupon,
      totalSavings: couponUsage
        .filter(usage => usage.coupon_id === coupon.id)
        .reduce((sum, usage) => sum + usage.discount_amount, 0)
    }));

    return couponStats
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5);
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
          <p className="text-muted-foreground">إنشاء وإدارة كوبونات الخصم لزيادة المبيعات</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء كوبون جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الكوبون لتقديم خصومات للعملاء
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم الكوبون</Label>
                  <Input
                    id="name"
                    value={newCoupon.name}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="مثال: خصم الجمعة البيضاء"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نوع الخصم</Label>
                  <Select 
                    value={newCoupon.discount_type} 
                    onValueChange={(value: 'percentage' | 'fixed') => setNewCoupon(prev => ({ ...prev, discount_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">نسبة مئوية</SelectItem>
                      <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>قيمة الخصم</Label>
                  <Input
                    type="number"
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                    placeholder={newCoupon.discount_type === 'percentage' ? '20' : '100'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الحد الأدنى للطلب (ر.س)</Label>
                  <Input
                    type="number"
                    value={newCoupon.min_order_amount}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, min_order_amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="500"
                  />
                </div>
                {newCoupon.discount_type === 'percentage' && (
                  <div>
                    <Label>الحد الأقصى للخصم (ر.س)</Label>
                    <Input
                      type="number"
                      value={newCoupon.max_discount_amount}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, max_discount_amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="200"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>عدد مرات الاستخدام</Label>
                  <Input
                    type="number"
                    value={newCoupon.usage_limit}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, usage_limit: parseInt(e.target.value) || 0 }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label>الحد الأقصى للعميل الواحد</Label>
                  <Input
                    type="number"
                    value={newCoupon.usage_limit_per_customer}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, usage_limit_per_customer: parseInt(e.target.value) || 0 }))}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>تاريخ البداية</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {validFromDate ? format(validFromDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={validFromDate}
                        onSelect={setValidFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>تاريخ الانتهاء</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {validUntilDate ? format(validUntilDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={validUntilDate}
                        onSelect={setValidUntilDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newCoupon.is_active}
                  onCheckedChange={(checked) => setNewCoupon(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">نشط</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveCoupon} className="flex-1">
                  {editingCoupon ? 'تحديث' : 'إنشاء'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الكوبونات</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-xs text-muted-foreground">
              نشط: {coupons.filter(c => getCouponStatus(c).label === 'نشط').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الاستخدام</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{couponUsage.length}</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الوفورات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalSavings().toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              للعملاء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.length > 0 ? Math.round((couponUsage.length / coupons.reduce((sum, c) => sum + c.usage_count, 0)) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              من المشاهدات
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">جميع الكوبونات</TabsTrigger>
          <TabsTrigger value="usage">سجل الاستخدام</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {coupons.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد كوبونات بعد</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإنشاء كوبونات لجذب العملاء وزيادة المبيعات
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء أول كوبون
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <Card key={coupon.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{coupon.name}</h3>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                {coupon.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(coupon.code)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <Badge variant="outline">
                              {coupon.discount_type === 'percentage' 
                                ? `${coupon.discount_value}%` 
                                : `${coupon.discount_value} ر.س`
                              }
                            </Badge>
                          </div>

                          {coupon.description && (
                            <p className="text-muted-foreground mb-3">{coupon.description}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">الاستخدام:</span>
                              <div className="font-medium">
                                {coupon.usage_count}/{coupon.usage_limit}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">الحد الأدنى:</span>
                              <div className="font-medium">{coupon.min_order_amount} ر.س</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">يبدأ:</span>
                              <div className="font-medium">
                                {format(new Date(coupon.valid_from), 'dd/MM/yyyy')}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">ينتهي:</span>
                              <div className="font-medium">
                                {format(new Date(coupon.valid_until), 'dd/MM/yyyy')}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(coupon)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          {couponUsage.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد استخدامات بعد</h3>
                <p className="text-muted-foreground">لم يستخدم أي عميل كوبونات الخصم بعد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {couponUsage.map((usage) => (
                <Card key={usage.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{usage.customer_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          استخدم كوبون: {coupons.find(c => c.id === usage.coupon_id)?.code}
                        </p>
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-bold text-green-600">
                          -{usage.discount_amount.toFixed(2)} ر.س
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(usage.used_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أكثر الكوبونات استخداماً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopCoupons().map((coupon, index) => (
                    <div key={coupon.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <div>
                          <div className="font-medium">{coupon.name}</div>
                          <div className="text-sm text-muted-foreground">{coupon.code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{coupon.usage_count}</div>
                        <div className="text-sm text-muted-foreground">استخدام</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>متوسط قيمة الخصم</span>
                    <Badge>
                      {couponUsage.length > 0 
                        ? (getTotalSavings() / couponUsage.length).toFixed(2)
                        : '0.00'
                      } ر.س
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>الكوبونات النشطة</span>
                    <Badge>{coupons.filter(c => getCouponStatus(c).label === 'نشط').length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>معدل الاستخدام</span>
                    <Badge>
                      {coupons.length > 0 
                        ? Math.round((coupons.reduce((sum, c) => sum + c.usage_count, 0) / coupons.length))
                        : 0
                      } مرة/كوبون
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};