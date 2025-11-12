import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { 
  CreditCard, 
  Settings, 
  Eye, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign
} from 'lucide-react';

interface EmkanSettings {
  api_key: string;
  merchant_id: string;
  password: string;
  is_enabled: boolean;
  test_mode: boolean;
}

interface EmkanTransaction {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  emkan_ref: string;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
}

const EmkanIntegration: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<EmkanSettings>({
    api_key: '',
    merchant_id: '',
    password: '',
    is_enabled: false,
    test_mode: true
  });
  const [transactions, setTransactions] = useState<EmkanTransaction[]>([]);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  useEffect(() => {
    loadEmkanSettings();
    loadTransactions();
  }, []);

  const loadEmkanSettings = async () => {
    setLoading(true);
    try {
      // Load from localStorage for now (in a real app, this would be from secure backend)
      const savedSettings = localStorage.getItem('emkan_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading Emkan settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('provider', 'emkan')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedTransactions: EmkanTransaction[] = (data || []).map(payment => ({
        id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount_sar || 0,
        status: payment.status || 'unknown',
        emkan_ref: payment.provider_ref || '',
        created_at: payment.created_at,
        customer_name: 'غير متوفر',
        customer_phone: 'غير متوفر'
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المعاملات",
        variant: "destructive"
      });
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in production, this should be encrypted and stored securely)
      localStorage.setItem('emkan_settings', JSON.stringify(settings));
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات إمكان بنجاح"
      });
      
      setShowSettingsDialog(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const { user, session } = useSupabaseAuth();

  const testConnection = async () => {
    if (!settings.api_key || !settings.merchant_id || !settings.password) {
      toast({
        title: "مطلوب",
        description: "يرجى ملء جميع بيانات الاتصال في النموذج أولاً",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({ title: "غير مصرح", description: "الرجاء تسجيل الدخول كمشرف لإجراء الاختبار", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = session?.access_token;
      // Testing Emkan connection
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'test_emkan_connection',
          merchantId: settings.merchant_id,
          apiKey: settings.api_key,
          password: settings.password,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) {
        console.error('❌ Admin function error:', error);
        throw new Error(error.message || 'فشل استدعاء الخدمة');
      }

      if (data?.success) {
        toast({ title: '✅ نجح الاتصال', description: data.message || 'تم الاتصال بإمكان بنجاح' });
      } else {
        toast({ title: '❌ فشل الاتصال', description: data?.error || 'فشل في الاتصال بإمكان', variant: 'destructive' });
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      toast({
        title: '❌ فشل الاتصال',
        description: error instanceof Error ? error.message : 'فشل في اختبار الاتصال مع إمكان',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />مكتمل</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />معلق</Badge>;
      case 'failed':
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />فاشل</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />غير معروف</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">تكامل إمكان</h2>
            <p className="text-muted-foreground">إدارة مدفوعات إمكان - اشتري الآن وادفع لاحقاً</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadTransactions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                الإعدادات
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إعدادات إمكان</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant_id">معرف التاجر</Label>
                  <Input
                    id="merchant_id"
                    value={settings.merchant_id}
                    onChange={(e) => setSettings({...settings, merchant_id: e.target.value})}
                    placeholder="أدخل معرف التاجر"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_key">مفتاح API</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={settings.api_key}
                    onChange={(e) => setSettings({...settings, api_key: e.target.value})}
                    placeholder="أدخل مفتاح API"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={settings.password}
                    onChange={(e) => setSettings({...settings, password: e.target.value})}
                    placeholder="أدخل كلمة المرور"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.is_enabled}
                      onChange={(e) => setSettings({...settings, is_enabled: e.target.checked})}
                      className="rounded"
                    />
                    تفعيل إمكان
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.test_mode}
                      onChange={(e) => setSettings({...settings, test_mode: e.target.checked})}
                      className="rounded"
                    />
                    وضع التجريب
                  </label>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    ملاحظة: تأكد من أن بيانات إمكان محفوظة في إعدادات Supabase Secrets
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={testConnection} 
                      variant="outline" 
                      className="flex-1" 
                      disabled={loading}
                    >
                      {loading ? "جاري اختبار الاتصال..." : "🔗 اختبار الاتصال"}
                    </Button>
                    <Button onClick={saveSettings} className="flex-1" disabled={loading}>
                      💾 حفظ الإعدادات
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <p className="text-lg font-semibold">
                  {settings.is_enabled ? (
                    <span className="text-green-600">مفعل</span>
                  ) : (
                    <span className="text-red-600">غير مفعل</span>
                  )}
                </p>
              </div>
              <div className={`p-2 rounded-full ${settings.is_enabled ? 'bg-green-100' : 'bg-red-100'}`}>
                {settings.is_enabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المعاملات</p>
                <p className="text-lg font-semibold">{transactions.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المعاملات الناجحة</p>
                <p className="text-lg font-semibold">
                  {transactions.filter(t => ['completed', 'success'].includes(t.status.toLowerCase())).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبلغ</p>
                <p className="text-lg font-semibold">
                  {formatAmount(transactions.reduce((sum, t) => sum + t.amount, 0))}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            المعاملات الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد معاملات إمكان حتى الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>مرجع إمكان</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.order_id}
                      </TableCell>
                      <TableCell>{formatAmount(transaction.amount)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.emkan_ref || 'غير متوفر'}
                      </TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmkanIntegration;