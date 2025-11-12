import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Crown, 
  Gift,
  Plus, 
  Edit, 
  Trash2,
  Award,
  Target,
  Users,
  TrendingUp,
  Coins,
  Diamond
} from 'lucide-react';
import { toast } from 'sonner';

const LoyaltyProgram = () => {
  const [newTier, setNewTier] = useState({
    name: '',
    color: '#8B0000',
    minimumPoints: '',
    minimumSpent: '',
    benefits: [] as string[],
    isActive: true
  });

  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    pointsCost: '',
    rewardType: 'discount',
    rewardValue: '',
    stockQuantity: '',
    isActive: true
  });

  const [loyaltyTiers] = useState([
    {
      id: 1,
      name: 'البرونزي',
      color: '#CD7F32',
      icon: Star,
      minimumPoints: 0,
      minimumSpent: 0,
      customerCount: 1247,
      benefits: ['نقاط مضاعفة في المناسبات', 'شحن مخفض']
    },
    {
      id: 2,
      name: 'الفضي',
      color: '#C0C0C0',
      icon: Award,
      minimumPoints: 500,
      minimumSpent: 1000,
      customerCount: 342,
      benefits: ['خصم 5% إضافي', 'شحن مجاني', 'دعم أولوية']
    },
    {
      id: 3,
      name: 'الذهبي',
      color: '#FFD700',
      icon: Crown,
      minimumPoints: 1500,
      minimumSpent: 3000,
      customerCount: 89,
      benefits: ['خصم 10% إضافي', 'وصول مبكر للمنتجات', 'هدايا خاصة']
    },
    {
      id: 4,
      name: 'الماسي',
      color: '#B9F2FF',
      icon: Diamond,
      minimumPoints: 3000,
      minimumSpent: 7000,
      customerCount: 23,
      benefits: ['خصم 15% إضافي', 'مدير حساب شخصي', 'هدايا فاخرة']
    }
  ]);

  const [loyaltyRewards] = useState([
    {
      id: 1,
      name: 'خصم 10% على الطلب القادم',
      description: 'احصل على خصم فوري على طلبك',
      pointsCost: 100,
      rewardType: 'discount',
      rewardValue: 10,
      usedCount: 234,
      totalStock: 1000,
      isActive: true
    },
    {
      id: 2,
      name: 'شحن مجاني',
      description: 'شحن مجاني لأي طلب',
      pointsCost: 50,
      rewardType: 'shipping',
      rewardValue: 25,
      usedCount: 456,
      totalStock: 2000,
      isActive: true
    },
    {
      id: 3,
      name: 'منتج مجاني',
      description: 'اختر منتج مجاني من المجموعة المحددة',
      pointsCost: 500,
      rewardType: 'product',
      rewardValue: 100,
      usedCount: 67,
      totalStock: 100,
      isActive: true
    }
  ]);

  const [topCustomers] = useState([
    {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      currentPoints: 2850,
      totalSpent: 12450,
      currentTier: 'الذهبي',
      tierProgress: 85
    },
    {
      id: 2,
      name: 'فاطمة العلي',
      email: 'fatima@example.com',
      currentPoints: 1920,
      totalSpent: 8650,
      currentTier: 'الفضي',
      tierProgress: 64
    },
    {
      id: 3,
      name: 'محمد السالم',
      email: 'mohamed@example.com',
      currentPoints: 3450,
      totalSpent: 15200,
      currentTier: 'الماسي',
      tierProgress: 100
    }
  ]);

  const handleCreateTier = () => {
    if (!newTier.name || !newTier.minimumPoints) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    toast.success('تم إنشاء المستوى بنجاح!');
    setNewTier({
      name: '',
      color: '#8B0000',
      minimumPoints: '',
      minimumSpent: '',
      benefits: [],
      isActive: true
    });
  };

  const handleCreateReward = () => {
    if (!newReward.name || !newReward.pointsCost || !newReward.rewardValue) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    toast.success('تم إنشاء المكافأة بنجاح!');
    setNewReward({
      name: '',
      description: '',
      pointsCost: '',
      rewardType: 'discount',
      rewardValue: '',
      stockQuantity: '',
      isActive: true
    });
  };

  const getRewardTypeText = (type: string) => {
    switch (type) {
      case 'discount': return 'خصم';
      case 'shipping': return 'شحن';
      case 'product': return 'منتج مجاني';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-card/50">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="tiers">المستويات</TabsTrigger>
          <TabsTrigger value="rewards">المكافآت</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  إجمالي الأعضاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,701</div>
                <div className="text-sm text-primary">+12% هذا الشهر</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-turquoise" />
                  النقاط المتداولة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4M</div>
                <div className="text-sm text-muted-foreground">نقطة</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Gift className="h-4 w-4 text-premium" />
                  المكافآت المستبدلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">892</div>
                <div className="text-sm text-primary">+25% هذا الشهر</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-persian" />
                  معدل المشاركة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <div className="text-sm text-primary">+8% هذا الشهر</div>
              </CardContent>
            </Card>
          </div>

          {/* Tiers Overview */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-premium" />
                توزيع العملاء حسب المستوى
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loyaltyTiers.map((tier) => {
                  const Icon = tier.icon;
                  return (
                    <div key={tier.id} className="text-center p-4 border rounded-lg">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                        style={{ backgroundColor: tier.color }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="font-semibold" style={{ color: tier.color }}>
                        {tier.name}
                      </div>
                      <div className="text-2xl font-bold mt-1">{tier.customerCount}</div>
                      <div className="text-sm text-muted-foreground">عميل</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>أفضل العملاء</CardTitle>
              <CardDescription>العملاء الأكثر نشاطاً في برنامج الولاء</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{customer.currentTier}</Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {customer.currentPoints.toLocaleString()} نقطة
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.totalSpent.toLocaleString()} ريال
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">مستويات الولاء</h3>
              <p className="text-sm text-muted-foreground">إنشاء وإدارة مستويات برنامج الولاء</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              مستوى جديد
            </Button>
          </div>

          <div className="grid gap-4">
            {loyaltyTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card key={tier.id} className="shadow-elegant">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: tier.color }}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-bold" style={{ color: tier.color }}>
                              {tier.name}
                            </h4>
                            <Badge variant="secondary">{tier.customerCount} عميل</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">الحد الأدنى للنقاط:</span>
                              <div className="font-medium">{tier.minimumPoints.toLocaleString()} نقطة</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">الحد الأدنى للإنفاق:</span>
                              <div className="font-medium">{tier.minimumSpent.toLocaleString()} ريال</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">المزايا:</div>
                            <div className="flex flex-wrap gap-2">
                              {tier.benefits.map((benefit, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
              );
            })}
          </div>

          {/* Create New Tier */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>إنشاء مستوى جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">اسم المستوى</label>
                  <Input
                    placeholder="مثال: البلاتيني"
                    value={newTier.name}
                    onChange={(e) => setNewTier(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">لون المستوى</label>
                  <Input
                    type="color"
                    value={newTier.color}
                    onChange={(e) => setNewTier(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">الحد الأدنى للنقاط</label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={newTier.minimumPoints}
                    onChange={(e) => setNewTier(prev => ({ ...prev, minimumPoints: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">الحد الأدنى للإنفاق (ريال)</label>
                  <Input
                    type="number"
                    placeholder="15000"
                    value={newTier.minimumSpent}
                    onChange={(e) => setNewTier(prev => ({ ...prev, minimumSpent: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleCreateTier} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                إنشاء المستوى
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">مكافآت الولاء</h3>
              <p className="text-sm text-muted-foreground">إنشاء وإدارة مكافآت برنامج الولاء</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              مكافأة جديدة
            </Button>
          </div>

          <div className="grid gap-4">
            {loyaltyRewards.map((reward) => (
              <Card key={reward.id} className="shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{reward.name}</h4>
                        <Badge className="bg-primary text-white">
                          {reward.pointsCost} نقطة
                        </Badge>
                        <Badge variant="outline">
                          {getRewardTypeText(reward.rewardType)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">القيمة:</span>
                          <div className="font-medium">
                            {reward.rewardType === 'discount' ? `${reward.rewardValue}%` : `${reward.rewardValue} ريال`}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">تم الاستبدال:</span>
                          <div className="font-medium">{reward.usedCount} مرة</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">المتبقي:</span>
                          <div className="font-medium">{reward.totalStock - reward.usedCount}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">معدل الاستبدال:</span>
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${(reward.usedCount / reward.totalStock) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mr-4">
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

          {/* Create New Reward */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>إنشاء مكافأة جديدة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">اسم المكافأة</label>
                  <Input
                    placeholder="مثال: خصم 20% على الطلب"
                    value={newReward.name}
                    onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">تكلفة النقاط</label>
                  <Input
                    type="number"
                    placeholder="200"
                    value={newReward.pointsCost}
                    onChange={(e) => setNewReward(prev => ({ ...prev, pointsCost: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">وصف المكافأة</label>
                <Input
                  placeholder="احصل على خصم فوري على طلبك القادم"
                  value={newReward.description}
                  onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع المكافأة</label>
                  <Select value={newReward.rewardType} onValueChange={(value) => setNewReward(prev => ({ ...prev, rewardType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">خصم</SelectItem>
                      <SelectItem value="shipping">شحن مجاني</SelectItem>
                      <SelectItem value="product">منتج مجاني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    قيمة المكافأة {newReward.rewardType === 'discount' ? '(%)' : '(ريال)'}
                  </label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={newReward.rewardValue}
                    onChange={(e) => setNewReward(prev => ({ ...prev, rewardValue: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">الكمية المتاحة</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={newReward.stockQuantity}
                    onChange={(e) => setNewReward(prev => ({ ...prev, stockQuantity: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleCreateReward} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                إنشاء المكافأة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-turquoise" />
                عملاء برنامج الولاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer) => (
                  <div key={customer.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                      <Badge variant="secondary">{customer.currentTier}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">النقاط الحالية:</span>
                        <div className="font-medium text-primary">{customer.currentPoints.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">إجمالي الإنفاق:</span>
                        <div className="font-medium">{customer.totalSpent.toLocaleString()} ريال</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">تقدم المستوى:</span>
                        <div className="font-medium">{customer.tierProgress}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>تقدم نحو المستوى التالي</span>
                        <span>{customer.tierProgress}%</span>
                      </div>
                      <Progress value={customer.tierProgress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                إعدادات برنامج الولاء
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Points Earning */}
              <div className="space-y-4">
                <h4 className="font-semibold">كسب النقاط</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">نقاط لكل ريال</label>
                    <Input type="number" placeholder="1" defaultValue="1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">نقاط التسجيل</label>
                    <Input type="number" placeholder="100" defaultValue="100" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">نقاط الإحالة</label>
                    <Input type="number" placeholder="50" defaultValue="50" />
                  </div>
                </div>
              </div>

              {/* Points Expiry */}
              <div className="space-y-4">
                <h4 className="font-semibold">انتهاء صلاحية النقاط</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">تفعيل انتهاء صلاحية النقاط</div>
                    <div className="text-sm text-muted-foreground">
                      النقاط ستنتهي صلاحيتها بعد فترة معينة
                    </div>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">مدة الصلاحية (شهر)</label>
                    <Input type="number" placeholder="12" defaultValue="12" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">تنبيه قبل الانتهاء (يوم)</label>
                    <Input type="number" placeholder="30" defaultValue="30" />
                  </div>
                </div>
              </div>

              {/* Program Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">تفعيل برنامج الولاء</div>
                  <div className="text-sm text-muted-foreground">
                    السماح للعملاء بالانضمام لبرنامج الولاء
                  </div>
                </div>
                <Switch defaultChecked={true} />
              </div>

              <Button className="w-full">
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoyaltyProgram;