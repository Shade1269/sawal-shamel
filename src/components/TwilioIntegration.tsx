import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Settings, 
  Send, 
  RefreshCw, 
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TestTube,
  History
} from 'lucide-react';

interface TwilioSettings {
  account_sid: string;
  auth_token: string;
  whatsapp_from: string;
  sms_from: string;
  is_enabled: boolean;
  test_mode: boolean;
}

interface TwilioMessage {
  id: string;
  to: string;
  from: string;
  body: string;
  type: 'sms' | 'whatsapp';
  status: string;
  sent_at: string;
  error_message?: string;
}

const TwilioIntegration: React.FC = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<TwilioSettings>({
    account_sid: '',
    auth_token: '',
    whatsapp_from: '',
    sms_from: '',
    is_enabled: false,
    test_mode: true
  });
  const [messages, setMessages] = useState<TwilioMessage[]>([]);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [testMessage, setTestMessage] = useState({
    to: '',
    body: '',
    type: 'sms' as 'sms' | 'whatsapp'
  });
  const [countryCode, setCountryCode] = useState('+966');

  useEffect(() => {
    loadTwilioSettings();
    loadMessageHistory();
  }, []);

  const loadTwilioSettings = async () => {
    setLoading(true);
    try {
      // Load from localStorage for now (in production, use secure backend storage)
      const savedSettings = localStorage.getItem('twilio_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading Twilio settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessageHistory = async () => {
    try {
      // In a real implementation, this would fetch from a messages table
      // For now, using mock data
      const mockMessages: TwilioMessage[] = [
        {
          id: '1',
          to: '+966501234567',
          from: settings.sms_from,
          body: 'رسالة تجريبية',
          type: 'sms',
          status: 'delivered',
          sent_at: new Date().toISOString(),
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in production, save securely)
      localStorage.setItem('twilio_settings', JSON.stringify(settings));
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات Twilio بنجاح"
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

  const testTwilioConnection = async () => {
    if (!settings.account_sid || !settings.auth_token) {
      toast({
        title: "مطلوب",
        description: "يرجى ملء Account SID وAuth Token",
        variant: "destructive"
      });
      return;
    }

    if (!session?.access_token) {
      toast({ 
        title: "غير مصرح", 
        description: "الرجاء تسجيل الدخول كمشرف", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🔗 Testing Twilio connection...');
      
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: {
          action: 'test_twilio_connection',
          account_sid: settings.account_sid,
          auth_token: settings.auth_token,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast({
          title: "✅ نجح الاتصال",
          description: "تم الاتصال بـ Twilio بنجاح"
        });
      } else {
        toast({
          title: "❌ فشل الاتصال",
          description: data?.error || "فشل في الاتصال بـ Twilio",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Twilio connection test failed:', error);
      toast({
        title: "❌ فشل الاتصال",
        description: error instanceof Error ? error.message : "فشل في اختبار الاتصال",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testMessage.to || !testMessage.body) {
      toast({
        title: "مطلوب",
        description: "يرجى ملء رقم الهاتف ونص الرسالة",
        variant: "destructive"
      });
      return;
    }

    if (!session?.access_token) {
      toast({ 
        title: "غير مصرح", 
        description: "الرجاء تسجيل الدخول كمشرف", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      const functionName = testMessage.type === 'whatsapp' ? 'send-whatsapp-otp' : 'send-sms-otp';
      const fullPhone = testMessage.to.startsWith('+') ? testMessage.to : `${countryCode}${testMessage.to}`;
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          phone: fullPhone,
          message: testMessage.body,
          test_mode: true
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "✅ تم الإرسال",
        description: `تم إرسال رسالة ${testMessage.type === 'whatsapp' ? 'WhatsApp' : 'SMS'} بنجاح`
      });

      // Clear test message form
      setTestMessage({ to: '', body: '', type: 'sms' });
      
      // Reload message history
      loadMessageHistory();
    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: "❌ فشل الإرسال",
        description: error instanceof Error ? error.message : "فشل في إرسال الرسالة",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />تم التسليم</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />مُرسل</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />فاشل</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="w-3 h-3 mr-1" />غير معروف</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhoneNumber = (phone: string) => {
    // Format Saudi phone numbers
    if (phone.startsWith('+966')) {
      return phone.replace('+966', '0');
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">تكامل Twilio</h2>
            <p className="text-muted-foreground">إدارة رسائل SMS وWhatsApp</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadMessageHistory}
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
                <DialogTitle>إعدادات Twilio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account_sid">Account SID</Label>
                  <Input
                    id="account_sid"
                    value={settings.account_sid}
                    onChange={(e) => setSettings({...settings, account_sid: e.target.value})}
                    placeholder="أدخل Account SID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth_token">Auth Token</Label>
                  <Input
                    id="auth_token"
                    type="password"
                    value={settings.auth_token}
                    onChange={(e) => setSettings({...settings, auth_token: e.target.value})}
                    placeholder="أدخل Auth Token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms_from">رقم SMS</Label>
                  <Input
                    id="sms_from"
                    value={settings.sms_from}
                    onChange={(e) => setSettings({...settings, sms_from: e.target.value})}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_from">رقم WhatsApp</Label>
                  <Input
                    id="whatsapp_from"
                    value={settings.whatsapp_from}
                    onChange={(e) => setSettings({...settings, whatsapp_from: e.target.value})}
                    placeholder="whatsapp:+1234567890"
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
                    تفعيل Twilio
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
                <div className="flex gap-2 pt-4">
                  <Button onClick={testTwilioConnection} variant="outline" className="flex-1" disabled={loading}>
                    🔗 اختبار الاتصال
                  </Button>
                  <Button onClick={saveSettings} className="flex-1" disabled={loading}>
                    💾 حفظ
                  </Button>
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
                <p className="text-sm text-muted-foreground">إجمالي الرسائل</p>
                <p className="text-lg font-semibold">{messages.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">رسائل SMS</p>
                <p className="text-lg font-semibold">
                  {messages.filter(m => m.type === 'sms').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">رسائل WhatsApp</p>
                <p className="text-lg font-semibold">
                  {messages.filter(m => m.type === 'whatsapp').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            إرسال تجريبي
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            سجل الرسائل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                إرسال رسالة تجريبية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test_to">رقم الهاتف</Label>
                  <div className="flex gap-2">
                    <select 
                      className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+20">🇪🇬 +20</option>
                    </select>
                    <Input
                      id="test_to"
                      value={testMessage.to}
                      onChange={(e) => setTestMessage({...testMessage, to: e.target.value})}
                      placeholder="501234567"
                      dir="ltr"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test_type">نوع الرسالة</Label>
                  <select
                    id="test_type"
                    value={testMessage.type}
                    onChange={(e) => setTestMessage({...testMessage, type: e.target.value as 'sms' | 'whatsapp'})}
                    className="w-full p-2 border border-input bg-background rounded-md"
                  >
                    <option value="sms">📱 SMS</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test_body">نص الرسالة</Label>
                <Textarea
                  id="test_body"
                  value={testMessage.body}
                  onChange={(e) => setTestMessage({...testMessage, body: e.target.value})}
                  placeholder="أدخل نص الرسالة..."
                  rows={4}
                />
              </div>
              <Button 
                onClick={sendTestMessage} 
                disabled={loading || !testMessage.to || !testMessage.body}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                سجل الرسائل
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد رسائل حتى الآن</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>النوع</TableHead>
                        <TableHead>إلى</TableHead>
                        <TableHead>الرسالة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <Badge variant={message.type === 'whatsapp' ? 'default' : 'secondary'}>
                              {message.type === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatPhoneNumber(message.to)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {message.body}
                          </TableCell>
                          <TableCell>{getStatusBadge(message.status)}</TableCell>
                          <TableCell>{formatDate(message.sent_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TwilioIntegration;