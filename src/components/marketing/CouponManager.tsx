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
  Percent,
  DollarSign,
  Users,
  Gift,
  TrendingUp,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

const CouponManager = () => {
  const [newCoupon, setNewCoupon] = useState({
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
    isActive: true
  });

  const [coupons] = useState([
    {
      id: 1,
      name: 'خصم الجمعة البيضاء',
      code: 'FRIDAY30',
      discountType: 'percentage',
      discountValue: 30,
      minimumAmount: 100,
      maximumDiscount: 200,
      validUntil: '2024-01-30',
      usageCount: 145,
      usageLimit: 500,
      status: 'active',
      totalSavings: 12580
    },
    {
      id: 2,
      name: 'ترحيب بالعملاء الجدد',
      code: 'WELCOME15',
      discountType: 'percentage',
      discountValue: 15,
      minimumAmount: 50,
      maximumDiscount: 100,
      validUntil: '2024-02-15',
      usageCount: 89,
      usageLimit: 200,
      status: 'active',
      totalSavings: 3450
    },
    {
      id: 3,
      name: 'شحن مجاني',
      code: 'FREESHIP',
      discountType: 'fixed',
      discountValue: 25,
      minimumAmount: 200,
      maximumDiscount: 25,
      validUntil: '2024-01-20',
      usageCount: 234,
      usageLimit: 1000,
      status: 'expired',
      totalSavings: 5850
    }
  ]);

  const generateCouponCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setNewCoupon(prev => ({ ...prev, code: result }));
  };

  const handleCreateCoupon = () => {
    if (!newCoupon.name || !newCoupon.code || !newCoupon.discountValue) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    toast.success('تم إنشاء الكوبون بنجاح!');
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
      isActive: true
    });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`تم نسخ الكود: ${code}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'expired': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'expired': return 'منتهي الصلاحية';
      case 'paused': return 'متوقف';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="coupons" className="w-full">
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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              كوبون جديد
            </Button>
          </div>

          <div className="grid gap-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{coupon.name}</h4>
                        <Badge className={`${getStatusColor(coupon.status)} text-white`}>
                          {getStatusText(coupon.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-3 py-1 rounded font-mono text-sm">
                          {coupon.code}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(coupon.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">قيمة الخصم:</span>
                          <div className="font-medium">
                            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue} ريال`}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">الحد الأدنى:</span>
                          <div className="font-medium">{coupon.minimumAmount} ريال</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">مرات الاستخدام:</span>
                          <div className="font-medium">{coupon.usageCount}/{coupon.usageLimit}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">إجمالي الوفورات:</span>
                          <div className="font-medium text-green-500">{coupon.totalSavings.toLocaleString()} ريال</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          ينتهي في: {coupon.validUntil}
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${(coupon.usageCount / coupon.usageLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mr-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

              {/* Discount Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">إعدادات الخصم</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">نوع الخصم</label>
                    <Select value={newCoupon.discountType} onValueChange={(value) => setNewCoupon(prev => ({ ...prev, discountType: value }))}>
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
                <Button onClick={handleCreateCoupon} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء الكوبون
                </Button>
                <Button variant="outline">
                  معاينة
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Ticket className="h-4 w-4 text-primary" />
                  إجمالي الكوبونات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <div className="text-sm text-muted-foreground">12 نشط</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">مرات الاستخدام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-primary">+18% هذا الشهر</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">إجمالي الوفورات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45,230</div>
                <div className="text-sm text-muted-foreground">ريال</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">معدل التحويل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.8%</div>
                <div className="text-sm text-primary">+2.3% هذا الشهر</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-turquoise" />
                أفضل الكوبونات أداءً
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coupons.slice(0, 3).map((coupon, index) => (
                  <div key={coupon.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{coupon.name}</div>
                        <div className="text-sm text-muted-foreground">{coupon.code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{coupon.usageCount} استخدام</div>
                      <div className="text-sm text-green-500">{coupon.totalSavings.toLocaleString()} ريال</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CouponManager;