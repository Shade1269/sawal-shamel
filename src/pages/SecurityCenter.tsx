import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui/index';
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { FraudDetectionPanel } from "@/components/security/FraudDetectionPanel";
import { BackupManagement } from "@/components/security/BackupManagement";
import { 
  Shield, 
  AlertTriangle, 
  Database, 
  Lock, 
  FileText, 
  RefreshCw,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            مركز الأمان والحماية
          </h1>
          <p className="text-muted-foreground">
            نظام حماية متقدم مع كشف الاحتيال والتشفير المالي ومطابقة معايير PCI DSS
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            PCI DSS Level 1
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            نظام آمن
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Security Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              كشف الاحتيال
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-success mb-1">مفعل</div>
            <p className="text-xs text-muted-foreground">
              ذكي اصطناعي متطور لكشف المعاملات المشبوهة
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-info" />
              التشفير المالي
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-info mb-1">AES-256</div>
            <p className="text-xs text-muted-foreground">
              تشفير عسكري لجميع المعاملات المالية
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-accent" />
              النسخ الاحتياطية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-accent mb-1">تلقائي</div>
            <p className="text-xs text-muted-foreground">
              نسخ احتياطية مشفرة ومجدولة يومياً
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-warning" />
              الامتثال
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-warning mb-1">100%</div>
            <p className="text-xs text-muted-foreground">
              متوافق مع معايير PCI DSS والأنظمة السعودية
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">لوحة التحكم</span>
          </TabsTrigger>
          <TabsTrigger value="fraud" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">كشف الاحتيال</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">النسخ الاحتياطية</span>
          </TabsTrigger>
          <TabsTrigger value="encryption" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">التشفير</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">الامتثال</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="fraud" className="space-y-6">
          <FraudDetectionPanel />
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <BackupManagement />
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                إعدادات التشفير المتقدمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h4 className="font-medium text-success mb-2">التشفير النشط</h4>
                    <ul className="space-y-1 text-sm text-success/80">
                      <li>• المعاملات المالية: AES-256</li>
                      <li>• بيانات المستخدمين: RSA-2048</li>
                      <li>• النسخ الاحتياطية: AES-256</li>
                      <li>• الاتصالات: TLS 1.3</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                    <h4 className="font-medium text-info mb-2">إدارة المفاتيح</h4>
                    <ul className="space-y-1 text-sm text-info/80">
                      <li>• دوران المفاتيح: كل 90 يوم</li>
                      <li>• تخزين المفاتيح: HSM آمن</li>
                      <li>• النسخ الاحتياطية للمفاتيح: مشفرة</li>
                      <li>• التحقق من التوقيعات: تلقائي</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                    <h4 className="font-medium text-accent mb-2">الشهادات الرقمية</h4>
                    <ul className="space-y-1 text-sm text-accent/80">
                      <li>• SSL Certificate: Valid</li>
                      <li>• Code Signing: Active</li>
                      <li>• API Authentication: JWT</li>
                      <li>• انتهاء الصلاحية: 11 شهر</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <h4 className="font-medium text-warning mb-2">التدقيق والمراقبة</h4>
                    <ul className="space-y-1 text-sm text-warning/80">
                      <li>• مراقبة المفاتيح: 24/7</li>
                      <li>• تسجيل العمليات: شامل</li>
                      <li>• التنبيهات الأمنية: فوري</li>
                      <li>• التقارير: أسبوعية</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                حالة الامتثال للمعايير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* PCI DSS Compliance */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">PCI DSS Level 1</h4>
                    <Badge variant="secondary">متوافق 100%</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>أمان الشبكة</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>حماية بيانات حملة البطاقات</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>إدارة نقاط الضعف</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>تدابير التحكم في الوصول</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>المراقبة والاختبار</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>سياسات أمن المعلومات</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                  </div>
                </div>

                {/* SAMA Compliance */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">معايير البنك المركزي السعودي (ساما)</h4>
                    <Badge variant="secondary">متوافق</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>إطار الأمن السيبراني</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>حماية البيانات</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>إدارة المخاطر</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>التقارير والامتثال</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                  </div>
                </div>

                {/* GDPR Compliance */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">اللائحة العامة لحماية البيانات (GDPR)</h4>
                    <Badge variant="secondary">متوافق</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>موافقة المستخدم</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>حق الوصول للبيانات</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>حق النسيان</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>حماية البيانات بالتصميم</span>
                      <span className="text-success">✓ متوافق</span>
                    </div>
                  </div>
                </div>

                {/* Audit Schedule */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-3">جدولة التدقيق</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>آخر تدقيق PCI DSS:</strong> منذ 45 يوم
                    </div>
                    <div>
                      <strong>التدقيق التالي:</strong> خلال 320 يوم
                    </div>
                    <div>
                      <strong>تدقيق الأمان الداخلي:</strong> شهري
                    </div>
                    <div>
                      <strong>مراجعة السياسات:</strong> ربع سنوي
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}