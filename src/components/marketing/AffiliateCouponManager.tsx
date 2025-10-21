import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Ticket, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Calendar,
  Gift,
  TrendingUp,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { useAffiliateCoupons } from '@/hooks/useAffiliateCoupons';

const AffiliateCouponManager = () => {
  const { store } = useAffiliateStore();
  const { 
    coupons, 
    isLoading, 
    createCoupon, 
    updateCoupon, 
    deleteCoupon, 
    usageStats,
    isCreating 
  } = useAffiliateCoupons(store?.id);

  const [newCoupon, setNewCoupon] = useState({
    name: '',
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minimumAmount: '',
    maximumDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    usageLimitPerCustomer: '1',
    targetType: 'store' as 'store' | 'product' | 'category',
    isActive: true
  });
  
  const [activeTab, setActiveTab] = useState<'coupons' | 'create' | 'analytics'>('coupons');

  const generateCouponCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setNewCoupon(prev => ({ ...prev, code: result }));
  };

  const handleCreateCoupon = () => {
    if (!newCoupon.name || !newCoupon.code || !newCoupon.discountValue || !store?.id) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    createCoupon({
      affiliate_store_id: store.id,
      coupon_name: newCoupon.name,
      coupon_code: newCoupon.code,
      discount_type: newCoupon.discountType,
      discount_value: parseFloat(newCoupon.discountValue),
      minimum_order_amount: newCoupon.minimumAmount ? parseFloat(newCoupon.minimumAmount) : 0,
      maximum_discount_amount: newCoupon.maximumDiscount ? parseFloat(newCoupon.maximumDiscount) : undefined,
      valid_from: newCoupon.validFrom || undefined,
      valid_until: newCoupon.validUntil || undefined,
      usage_limit: newCoupon.usageLimit ? parseInt(newCoupon.usageLimit) : undefined,
      usage_limit_per_customer: parseInt(newCoupon.usageLimitPerCustomer),
      target_type: newCoupon.targetType,
      is_active: newCoupon.isActive,
    });

    // Reset form
    setNewCoupon({
      name: '',
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minimumAmount: '',
      maximumDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      usageLimitPerCustomer: '1',
      targetType: 'store',
      isActive: true
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`تم نسخ الكود: ${code}`);
  };

  const getStatusColor = (isActive: boolean, validUntil?: string) => {
    if (!isActive) return 'bg-gray-500';
    if (validUntil && new Date(validUntil) < new Date()) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = (isActive: boolean, validUntil?: string) => {
    if (!isActive) return 'متوقف';
    if (validUntil && new Date(validUntil) < new Date()) return 'منتهي الصلاحية';
    return 'نشط';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'coupons' | 'create' | 'analytics')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50">
          <TabsTrigger value="coupons">الكوبونات</TabsTrigger>
          <TabsTrigger value="create">إنشاء كوبون</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">إدارة الكوبونات</h3>
              <p className="text-sm text-muted-foreground">إنشاء وإدارة كوبونات الخصم</p>
            </div>
          </div>

          {coupons.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">لا توجد كوبونات حالياً</p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء كوبون جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="shadow-elegant">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{coupon.coupon_name}</h4>
                          <Badge className={`${getStatusColor(coupon.is_active, coupon.valid_until || undefined)} text-white`}>
                            {getStatusText(coupon.is_active, coupon.valid_until || undefined)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-3 py-1 rounded font-mono text-sm">
                            {coupon.coupon_code}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(coupon.coupon_code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">قيمة الخصم:</span>
                            <div className="font-medium">
                              {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value} ريال`}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الحد الأدنى:</span>
                            <div className="font-medium">{coupon.minimum_order_amount} ريال</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">مرات الاستخدام:</span>
                            <div className="font-medium">{coupon.usage_count}/{coupon.usage_limit || '∞'}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الاستهداف:</span>
                            <div className="font-medium">
                              {coupon.target_type === 'store' && 'كل المتجر'}
                              {coupon.target_type === 'product' && 'منتج محدد'}
                              {coupon.target_type === 'category' && 'فئة محددة'}
                            </div>
                          </div>
                        </div>

                        {coupon.valid_until && (
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              ينتهي في: {new Date(coupon.valid_until).toLocaleDateString('ar-SA')}
                            </div>
                            {coupon.usage_limit && (
                              <div className="w-full bg-muted rounded-full h-2 max-w-[200px]">
                                <div 
                                  className="bg-primary rounded-full h-2 transition-all"
                                  style={{ width: `${(coupon.usage_count / coupon.usage_limit) * 100}%` }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mr-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            updateCoupon({ 
                              id: coupon.id, 
                              updates: { is_active: !coupon.is_active } 
                            });
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                إنشاء كوبون جديد
              </CardTitle>
              <CardDescription>
                أنشئ كوبون خصم جديد لعملائك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">اسم الكوبون</label>
                  <Input
                    placeholder="مثال: خصم الجمعة البيضاء"
                    value={newCoupon.name}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">كود الكوبون</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="مثال: FRIDAY30"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={generateCouponCode}>
                      <Gift className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Target Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">نوع الاستهداف</label>
                <Select 
                  value={newCoupon.targetType} 
                  onValueChange={(value: 'store' | 'product' | 'category') => setNewCoupon(prev => ({ ...prev, targetType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store">كل المتجر</SelectItem>
                    <SelectItem value="product">منتج محدد</SelectItem>
                    <SelectItem value="category">فئة محددة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">إعدادات الخصم</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">نوع الخصم</label>
                    <Select 
                      value={newCoupon.discountType} 
                      onValueChange={(value: 'percentage' | 'fixed') => setNewCoupon(prev => ({ ...prev, discountType: value }))}
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
                    <label className="text-sm font-medium mb-2 block">
                      قيمة الخصم {newCoupon.discountType === 'percentage' ? '(%)' : '(ريال)'}
                    </label>
                    <Input
                      type="number"
                      placeholder="30"
                      value={newCoupon.discountValue}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, discountValue: e.target.value }))}
                    />
                  </div>
                  {newCoupon.discountType === 'percentage' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">الحد الأقصى للخصم (ريال)</label>
                      <Input
                        type="number"
                        placeholder="200"
                        value={newCoupon.maximumDiscount}
                        onChange={(e) => setNewCoupon(prev => ({ ...prev, maximumDiscount: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Limits */}
              <div className="space-y-4">
                <h4 className="font-semibold">قيود الاستخدام</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">الحد الأدنى للطلب (ريال)</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={newCoupon.minimumAmount}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, minimumAmount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">عدد الاستخدامات الكلي</label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={newCoupon.usageLimit}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, usageLimit: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">استخدامات لكل عميل</label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={newCoupon.usageLimitPerCustomer}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, usageLimitPerCustomer: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div className="space-y-4">
                <h4 className="font-semibold">فترة الصلاحية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">تاريخ البداية</label>
                    <Input
                      type="datetime-local"
                      value={newCoupon.validFrom}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, validFrom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">تاريخ الانتهاء</label>
                    <Input
                      type="datetime-local"
                      value={newCoupon.validUntil}
                      onChange={(e) => setNewCoupon(prev => ({ ...prev, validUntil: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">تفعيل الكوبون</div>
                  <div className="text-sm text-muted-foreground">
                    سيكون الكوبون متاحاً للاستخدام فور إنشائه
                  </div>
                </div>
                <Switch
                  checked={newCoupon.isActive}
                  onCheckedChange={(checked) => setNewCoupon(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateCoupon} 
                  className="flex-1"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      إنشاء الكوبون
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-primary" />
                  إجمالي الكوبونات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{coupons.length}</div>
                <div className="text-sm text-muted-foreground">
                  {coupons.filter(c => c.is_active).length} نشط
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">مرات الاستخدام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats?.totalUsage || 0}</div>
                <div className="text-sm text-primary">المجموع</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">إجمالي الوفورات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats?.totalSavings?.toFixed(0) || 0}</div>
                <div className="text-sm text-muted-foreground">ريال</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateCouponManager;
