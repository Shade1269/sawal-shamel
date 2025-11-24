import React from 'react';
import { 
  UnifiedCard as Card, 
  UnifiedCardContent as CardContent, 
  UnifiedCardDescription as CardDescription, 
  UnifiedCardHeader as CardHeader, 
  UnifiedCardTitle as CardTitle,
  UnifiedButton as Button,
  UnifiedInput as Input
} from '@/components/design-system';
import { 
  UnifiedSelect as Select,
  UnifiedSelectContent as SelectContent,
  UnifiedSelectItem as SelectItem,
  UnifiedSelectTrigger as SelectTrigger,
  UnifiedSelectValue as SelectValue
} from '@/components/design-system';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntegrationHealthChecker from '@/components/IntegrationHealthChecker';
import PushNotificationManager from '@/components/PushNotificationManager';
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Database,
  Save,
  RefreshCw,
  Activity,
  Zap,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const handleSave = () => {
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          إعدادات النظام
        </h1>
        <p className="text-muted-foreground mt-2">
          إدارة الإعدادات العامة للمنصة والنظام
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Zap className="h-4 w-4" />
            التكاملات
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="h-4 w-4" />
            النظام
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription>
                تخصيص الإعدادات الأساسية للمنصة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="site-name">اسم الموقع</Label>
                <Input
                  id="site-name"
                  placeholder="منصة الأفيليت"
                  defaultValue="منصة الأفيليت"
                />
              </div>
              <div>
                <Label htmlFor="site-description">وصف الموقع</Label>
                <Input
                  id="site-description"
                  placeholder="أفضل منصة تسويق بالعمولة"
                  defaultValue="أفضل منصة تسويق بالعمولة"
                />
              </div>
              <div>
                <Label htmlFor="support-email">بريد الدعم الفني</Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="support@example.com"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تسجيل المستخدمين الجدد</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للمستخدمين بإنشاء حسابات جديدة
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-premium" />
                إعدادات العمولات والمدفوعات
              </CardTitle>
              <CardDescription>
                تحكم في نسبة عمولة المنصة وإعدادات السحب
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platform-commission">نسبة عمولة المنصة (%)</Label>
                <Input
                  id="platform-commission"
                  type="number"
                  placeholder="25"
                  defaultValue="25"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  النسبة التي تحصل عليها المنصة من كل عملية بيع
                </p>
              </div>
              <div>
                <Label htmlFor="min-withdrawal">الحد الأدنى للسحب (ر.س)</Label>
                <Input
                  id="min-withdrawal"
                  type="number"
                  placeholder="100"
                  defaultValue="100"
                  min="1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  أقل مبلغ يمكن للمسوقات والتجار سحبه
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تفعيل نظام المحفظة</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح بطلبات السحب من المسوقات والتجار
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-premium" />
                إعدادات الأمان
              </CardTitle>
              <CardDescription>
                تحسين أمان المنصة وحماية البيانات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>المصادقة الثنائية</Label>
                  <p className="text-sm text-muted-foreground">
                    فرض استخدام المصادقة الثنائية
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تشفير قاعدة البيانات</Label>
                  <p className="text-sm text-muted-foreground">
                    تشفير البيانات الحساسة
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div>
                <Label htmlFor="session-timeout">انتهاء صلاحية الجلسة (دقيقة)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  placeholder="30"
                  defaultValue="30"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <PushNotificationManager />
          
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-turquoise" />
                إعدادات الإشعارات التقليدية
              </CardTitle>
              <CardDescription>
                تحكم في إشعارات النظام والبريد الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    إرسال إشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات الطلبات الجديدة</Label>
                  <p className="text-sm text-muted-foreground">
                    تنبيه عند وصول طلبات جديدة
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات العمولات</Label>
                  <p className="text-sm text-muted-foreground">
                    تنبيه عند استحقاق عمولات جديدة
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تقارير يومية</Label>
                  <p className="text-sm text-muted-foreground">
                    إرسال تقارير إحصائية يومية
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationHealthChecker />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-persian" />
                معلومات النظام
              </CardTitle>
              <CardDescription>
                تفاصيل النظام والخادم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">إصدار النظام:</span>
                  <div className="font-medium">v2.1.0</div>
                </div>
                <div>
                  <span className="text-muted-foreground">قاعدة البيانات:</span>
                  <div className="font-medium">PostgreSQL 15</div>
                </div>
                <div>
                  <span className="text-muted-foreground">المستخدمون النشطون:</span>
                  <div className="font-medium">1,247</div>
                </div>
                <div>
                  <span className="text-muted-foreground">مساحة التخزين:</span>
                  <div className="font-medium">2.8 GB</div>
                </div>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  فحص التحديثات
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Database className="h-4 w-4 mr-2" />
                  نسخ احتياطي
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8">
          <Save className="h-4 w-4 mr-2" />
          حفظ جميع الإعدادات
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
