import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSecurityManagement } from "@/hooks/useSecurityManagement";
import { Shield, AlertTriangle, Lock, Database, Eye, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const SecurityDashboard = () => {
  const { loading, getSecurityInsights } = useSecurityManagement();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const insights = getSecurityInsights();

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 90) return "ممتاز";
    if (score >= 70) return "جيد";
    if (score >= 50) return "متوسط";
    return "ضعيف";
  };

  return (
    <div className="space-y-6">
      {/* مؤشر الأمان العام */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            مؤشر الأمان العام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold">
              {insights.securityScore}%
            </span>
            <Badge 
              variant={insights.securityScore >= 70 ? "default" : "destructive"}
              className="text-sm"
            >
              {getSecurityScoreLabel(insights.securityScore)}
            </Badge>
          </div>
          <Progress value={insights.securityScore} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">
            يعتمد هذا المؤشر على تنبيهات الاحتيال والأحداث الأمنية النشطة
          </p>
        </CardContent>
      </Card>

      {/* إحصائيات الأمان */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* تنبيهات الاحتيال */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              تنبيهات الاحتيال
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">
              {insights.totalAlerts}
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {insights.pendingAlerts} في انتظار المراجعة
            </div>
            {insights.criticalAlerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                {insights.criticalAlerts} حرجة
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* الأحداث عالية المخاطر */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الأحداث عالية المخاطر
            </CardTitle>
            <Eye className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">
              {insights.criticalEvents}
            </div>
            <div className="text-xs text-muted-foreground">
              أحداث تتطلب مراجعة فورية
            </div>
            {insights.criticalEvents > 0 && (
              <Badge variant="destructive" className="text-xs mt-1">
                تتطلب مراجعة
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* النسخ الاحتياطية */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              النسخ الاحتياطية
            </CardTitle>
            <Database className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">
              {insights.recentBackups}
            </div>
            <div className="text-xs text-muted-foreground">
              نسخ احتياطية خلال الأسبوع الماضي
            </div>
            <Badge 
              variant={insights.recentBackups > 0 ? "secondary" : "destructive"} 
              className="text-xs mt-1"
            >
              {insights.recentBackups > 0 ? "محدثة" : "تحتاج نسخ"}
            </Badge>
          </CardContent>
        </Card>

        {/* حالة التشفير */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              حالة التشفير
            </CardTitle>
            <Lock className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success mb-1">
              مفعل
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              AES-256 متقدم
            </div>
            <Badge variant="secondary" className="text-xs">
              PCI DSS متوافق
            </Badge>
          </CardContent>
        </Card>

        {/* مستوى الامتثال */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              مستوى الامتثال
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent mb-1">
              Level 1
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              PCI DSS Level 1
            </div>
            <Badge variant="secondary" className="text-xs">
              أعلى مستوى أمان
            </Badge>
          </CardContent>
        </Card>

        {/* التدقيق الأمني */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              آخر تدقيق أمني
            </CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-foreground mb-1">
              منذ 2 أيام
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              التدقيق التالي خلال 28 يوم
            </div>
            <Badge variant="secondary" className="text-xs">
              كل 30 يوم
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* نصائح الأمان */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            نصائح لتحسين الأمان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.pendingAlerts > 5 && (
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm text-warning">
                  <strong>تحذير:</strong> لديك {insights.pendingAlerts} تنبيه احتيال في انتظار المراجعة. يُنصح بمراجعتها فوراً.
                </p>
              </div>
            )}
            
            {insights.recentBackups === 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">
                  <strong>تحذير:</strong> لم يتم إنشاء نسخ احتياطية مؤخراً. يُنصح بجدولة نسخ احتياطية دورية.
                </p>
              </div>
            )}

            {insights.securityScore >= 90 && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                <p className="text-sm text-success">
                  <strong>ممتاز!</strong> نظام الأمان يعمل بكفاءة عالية. استمر في المراقبة المنتظمة.
                </p>
              </div>
            )}

            <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
              <p className="text-sm text-info">
                <strong>نصيحة:</strong> قم بمراجعة سجلات التدقيق بانتظام وتحديث كلمات المرور كل 90 يوماً.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};