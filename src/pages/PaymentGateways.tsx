import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Plus, 
  Settings, 
  Eye, 
  EyeOff,
  TestTube,
  Check,
  X,
  AlertTriangle,
  Smartphone,
  Banknote,
  Building,
  Globe,
  Percent,
  DollarSign,
  Shield,
  Activity,
  TrendingUp,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface PaymentGateway {
  id: string;
  gateway_name: string;
  display_name: string;
  provider: string;
  is_enabled: boolean;
  is_test_mode: boolean;
  fixed_fee_sar: number;
  percentage_fee: number;
  min_amount_sar: number;
  max_amount_sar: number;
  api_key: string;
  secret_key: string;
  merchant_id: string;
  api_url: string;
  configuration: any;
  created_at: string;
}

const availableGateways = [
  {
    id: 'mada',
    name: 'مدى',
    provider: 'saudi_payments',
    description: 'نظام مدى للدفع الإلكتروني',
    icon: <Banknote className="h-6 w-6" />,
    color: 'bg-green-500',
    features: ['آمن ومحلي', 'رسوم منخفضة', 'دعم 24/7']
  },
  {
    id: 'visa',
    name: 'فيزا',
    provider: 'visa_international',
    description: 'بطاقات فيزا الدولية',
    icon: <CreditCard className="h-6 w-6" />,
    color: 'bg-blue-500',
    features: ['قبول دولي', 'حماية متقدمة', 'تحويل العملات']
  },
  {
    id: 'mastercard',
    name: 'ماستركارد',
    provider: 'mastercard_international',
    description: 'بطاقات ماستركارد الدولية',
    icon: <CreditCard className="h-6 w-6" />,
    color: 'bg-red-500',
    features: ['شبكة عالمية', 'حماية الاحتيال', 'مكافآت']
  },
  {
    id: 'stcpay',
    name: 'STC Pay',
    provider: 'stc_group',
    description: 'محفظة STC Pay الرقمية',
    icon: <Smartphone className="h-6 w-6" />,
    color: 'bg-purple-500',
    features: ['دفع فوري', 'بدون رسوم', 'ربط سهل']
  },
  {
    id: 'tamara',
    name: 'تمارا',
    provider: 'tamara_bnpl',
    description: 'اشتري الآن وادفع لاحقاً',
    icon: <Building className="h-6 w-6" />,
    color: 'bg-teal-500',
    features: ['دفع بالتقسيط', 'بدون فوائد', 'موافقة فورية']
  },
  {
    id: 'tabby',
    name: 'تابي',
    provider: 'tabby_bnpl',
    description: 'قسط مشترياتك على 4 دفعات',
    icon: <Building className="h-6 w-6" />,
    color: 'bg-orange-500',
    features: ['4 دفعات', 'بدون فوائد', 'اعتماد سريع']
  },
  {
    id: 'applepay',
    name: 'Apple Pay',
    provider: 'apple_inc',
    description: 'الدفع بواسطة Apple Pay',
    icon: <Smartphone className="h-6 w-6" />,
    color: 'bg-gray-900',
    features: ['Touch/Face ID', 'أمان عالي', 'دفع سريع']
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    provider: 'google_inc',
    description: 'الدفع بواسطة Google Pay',
    icon: <Smartphone className="h-6 w-6" />,
    color: 'bg-blue-600',
    features: ['NFC Payment', 'حماية متقدمة', 'تكامل Android']
  }
];

const PaymentGateways = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGateway, setShowAddGateway] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});
  const [selectedGateway, setSelectedGateway] = useState<any>(null);
  
  const [newGateway, setNewGateway] = useState({
    gateway_name: '',
    display_name: '',
    provider: '',
    api_key: '',
    secret_key: '',
    merchant_id: '',
    api_url: '',
    fixed_fee_sar: 0,
    percentage_fee: 2.5,
    min_amount_sar: 1,
    max_amount_sar: 100000,
    is_test_mode: true
  });

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setGateways(data || []);
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بوابات الدفع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGateway = async () => {
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .insert({
          gateway_name: newGateway.gateway_name,
          display_name: newGateway.display_name,
          provider: newGateway.provider,
          api_key: newGateway.api_key,
          secret_key: newGateway.secret_key,
          merchant_id: newGateway.merchant_id,
          api_url: newGateway.api_url,
          fixed_fee_sar: newGateway.fixed_fee_sar,
          percentage_fee: newGateway.percentage_fee,
          min_amount_sar: newGateway.min_amount_sar,
          max_amount_sar: newGateway.max_amount_sar,
          is_test_mode: newGateway.is_test_mode,
          is_enabled: false
        });

      if (error) throw error;

      toast({
        title: "تم إضافة البوابة",
        description: `تم إضافة ${newGateway.display_name} بنجاح`,
      });

      setShowAddGateway(false);
      setNewGateway({
        gateway_name: '',
        display_name: '',
        provider: '',
        api_key: '',
        secret_key: '',
        merchant_id: '',
        api_url: '',
        fixed_fee_sar: 0,
        percentage_fee: 2.5,
        min_amount_sar: 1,
        max_amount_sar: 100000,
        is_test_mode: true
      });
      
      fetchGateways();
    } catch (error) {
      console.error('Error adding payment gateway:', error);
      toast({
        title: "خطأ في إضافة البوابة",
        description: "تعذر إضافة بوابة الدفع",
        variant: "destructive",
      });
    }
  };

  const toggleGateway = async (gatewayId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({ is_enabled: enabled })
        .eq('id', gatewayId);

      if (error) throw error;

      toast({
        title: enabled ? "تم تفعيل البوابة" : "تم إيقاف البوابة",
        description: enabled ? "البوابة متاحة الآن للعملاء" : "البوابة غير متاحة للعملاء",
      });

      fetchGateways();
    } catch (error) {
      console.error('Error toggling gateway:', error);
      toast({
        title: "خطأ في تحديث البوابة",
        description: "تعذر تحديث حالة البوابة",
        variant: "destructive",
      });
    }
  };

  const toggleTestMode = async (gatewayId: string, testMode: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({ is_test_mode: testMode })
        .eq('id', gatewayId);

      if (error) throw error;

      toast({
        title: testMode ? "تم تفعيل الوضع التجريبي" : "تم إيقاف الوضع التجريبي",
        description: testMode ? "البوابة في الوضع التجريبي" : "البوابة في الوضع المباشر",
      });

      fetchGateways();
    } catch (error) {
      console.error('Error toggling test mode:', error);
      toast({
        title: "خطأ في تحديث الوضع",
        description: "تعذر تحديث وضع البوابة",
        variant: "destructive",
      });
    }
  };

  const testGatewayConnection = async (gateway: PaymentGateway) => {
    toast({
      title: "جاري اختبار الاتصال",
      description: `اختبار الاتصال مع ${gateway.display_name}...`,
    });

    // محاكاة اختبار الاتصال
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% نجاح
      
      toast({
        title: success ? "نجح الاختبار" : "فشل الاختبار",
        description: success 
          ? `الاتصال مع ${gateway.display_name} يعمل بشكل صحيح`
          : `فشل الاتصال مع ${gateway.display_name}. تحقق من الإعدادات`,
        variant: success ? "default" : "destructive",
      });
    }, 2000);
  };

  const selectAvailableGateway = (gateway: any) => {
    setSelectedGateway(gateway);
    setNewGateway(prev => ({
      ...prev,
      gateway_name: gateway.id,
      display_name: gateway.name,
      provider: gateway.provider
    }));
  };

  const toggleApiKeyVisibility = (gatewayId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل بوابات الدفع...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            إدارة بوابات الدفع
          </h1>
          <p className="text-muted-foreground mt-2">
            إعداد وإدارة وسائل الدفع المختلفة للمتجر
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/payment-dashboard')}>
            العودة للمدفوعات
          </Button>
          <Dialog open={showAddGateway} onOpenChange={setShowAddGateway}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة بوابة دفع
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة بوابة دفع جديدة</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="select" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select">اختيار البوابة</TabsTrigger>
                  <TabsTrigger value="configure">التكوين</TabsTrigger>
                </TabsList>
                
                <TabsContent value="select" className="space-y-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableGateways.map((gateway) => (
                      <Card 
                        key={gateway.id} 
                        className={`cursor-pointer hover:shadow-md transition-all ${
                          selectedGateway?.id === gateway.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => selectAvailableGateway(gateway)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-xl ${gateway.color} flex items-center justify-center text-white`}>
                              {gateway.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold">{gateway.name}</h3>
                              <p className="text-sm text-muted-foreground">{gateway.provider}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{gateway.description}</p>
                          <div className="space-y-1">
                            {gateway.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Check className="h-3 w-3 text-green-500" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="configure" className="space-y-6">
                  {selectedGateway ? (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${selectedGateway.color} flex items-center justify-center text-white`}>
                              {selectedGateway.icon}
                            </div>
                            تكوين {selectedGateway.name}
                          </CardTitle>
                          <CardDescription>{selectedGateway.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>اسم العرض</Label>
                              <Input
                                value={newGateway.display_name}
                                onChange={(e) => setNewGateway(prev => ({...prev, display_name: e.target.value}))}
                                placeholder="الاسم الذي سيظهر للعملاء"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>رقم التاجر</Label>
                              <Input
                                value={newGateway.merchant_id}
                                onChange={(e) => setNewGateway(prev => ({...prev, merchant_id: e.target.value}))}
                                placeholder="Merchant ID"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>مفتاح API</Label>
                              <Input
                                type="password"
                                value={newGateway.api_key}
                                onChange={(e) => setNewGateway(prev => ({...prev, api_key: e.target.value}))}
                                placeholder="API Key"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>المفتاح السري</Label>
                              <Input
                                type="password"
                                value={newGateway.secret_key}
                                onChange={(e) => setNewGateway(prev => ({...prev, secret_key: e.target.value}))}
                                placeholder="Secret Key"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>رابط API</Label>
                              <Input
                                value={newGateway.api_url}
                                onChange={(e) => setNewGateway(prev => ({...prev, api_url: e.target.value}))}
                                placeholder="https://api.gateway.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>الرسوم الثابتة (ر.س)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={newGateway.fixed_fee_sar}
                                onChange={(e) => setNewGateway(prev => ({...prev, fixed_fee_sar: parseFloat(e.target.value) || 0}))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>رسوم النسبة المئوية (%)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={newGateway.percentage_fee}
                                onChange={(e) => setNewGateway(prev => ({...prev, percentage_fee: parseFloat(e.target.value) || 0}))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>الحد الأدنى للمبلغ (ر.س)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={newGateway.min_amount_sar}
                                onChange={(e) => setNewGateway(prev => ({...prev, min_amount_sar: parseInt(e.target.value) || 1}))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>الحد الأقصى للمبلغ (ر.س)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={newGateway.max_amount_sar}
                                onChange={(e) => setNewGateway(prev => ({...prev, max_amount_sar: parseInt(e.target.value) || 100000}))}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Switch
                              checked={newGateway.is_test_mode}
                              onCheckedChange={(checked) => setNewGateway(prev => ({...prev, is_test_mode: checked}))}
                            />
                            <Label>الوضع التجريبي</Label>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex gap-3">
                        <Button onClick={addGateway} className="flex-1">
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة البوابة
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddGateway(false)}>
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">يرجى اختيار بوابة دفع من التبويب السابق</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">البوابات المفعلة</p>
                <p className="text-2xl font-bold text-green-600">
                  {gateways.filter(g => g.is_enabled).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الوضع التجريبي</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {gateways.filter(g => g.is_test_mode).length}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <TestTube className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي البوابات</p>
                <p className="text-2xl font-bold text-blue-600">{gateways.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط الرسوم</p>
                <p className="text-2xl font-bold text-purple-600">
                  {gateways.length ? (gateways.reduce((sum, g) => sum + g.percentage_fee, 0) / gateways.length).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة البوابات */}
      <Card>
        <CardHeader>
          <CardTitle>بوابات الدفع المُكونة</CardTitle>
          <CardDescription>إدارة وتكوين جميع بوابات الدفع المتاحة</CardDescription>
        </CardHeader>
        <CardContent>
          {gateways.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد بوابات دفع</h3>
              <p className="text-muted-foreground mb-4">
                قم بإضافة بوابة دفع لبدء قبول المدفوعات من العملاء
              </p>
              <Button onClick={() => setShowAddGateway(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة بوابة دفع
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {gateways.map((gateway) => (
                <Card key={gateway.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold">{gateway.display_name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {gateway.provider}
                            </Badge>
                            {gateway.is_enabled ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                مفعلة
                              </Badge>
                            ) : (
                              <Badge variant="secondary">غير مفعلة</Badge>
                            )}
                            {gateway.is_test_mode && (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                <TestTube className="h-3 w-3 ml-1" />
                                تجريبي
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>رسوم: {gateway.percentage_fee}% + {gateway.fixed_fee_sar} ر.س</span>
                            <span>الحد الأدنى: {gateway.min_amount_sar} ر.س</span>
                            <span>الحد الأقصى: {gateway.max_amount_sar?.toLocaleString()} ر.س</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`enable-${gateway.id}`} className="text-sm">تفعيل</Label>
                          <Switch
                            id={`enable-${gateway.id}`}
                            checked={gateway.is_enabled}
                            onCheckedChange={(checked) => toggleGateway(gateway.id, checked)}
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`test-${gateway.id}`} className="text-sm">تجريبي</Label>
                          <Switch
                            id={`test-${gateway.id}`}
                            checked={gateway.is_test_mode}
                            onCheckedChange={(checked) => toggleTestMode(gateway.id, checked)}
                          />
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testGatewayConnection(gateway)}
                        >
                          <TestTube className="h-4 w-4 ml-2" />
                          اختبار
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* تفاصيل إضافية */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">رقم التاجر</p>
                          <p className="font-mono">{gateway.merchant_id || 'غير محدد'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">مفتاح API</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono">
                              {showApiKeys[gateway.id] ? gateway.api_key : '••••••••••••'}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleApiKeyVisibility(gateway.id)}
                            >
                              {showApiKeys[gateway.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">API URL</p>
                          <p className="font-mono text-xs">{gateway.api_url || 'غير محدد'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">تم الإنشاء</p>
                          <p>{new Date(gateway.created_at).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentGateways;