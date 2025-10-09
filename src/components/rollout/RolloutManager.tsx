import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Users,
  Settings,
  Zap
} from 'lucide-react';
import { FEATURE_FLAGS, FeatureFlag } from '@/config/featureFlags';

interface RolloutStage {
  id: number;
  name: string;
  description: string;
  percentage: number;
  status: 'pending' | 'active' | 'completed';
  duration: string;
}

const ROLLOUT_STAGES: RolloutStage[] = [
  {
    id: 1,
    name: 'التحقق الأولي',
    description: 'فحص البيانات والبنية التحتية',
    percentage: 0,
    status: 'completed',
    duration: 'أسبوع 1',
  },
  {
    id: 2,
    name: 'الاختبار الداخلي',
    description: 'اختبار مع الفريق الداخلي',
    percentage: 5,
    status: 'completed',
    duration: 'أسبوع 2',
  },
  {
    id: 3,
    name: 'إطلاق تجريبي',
    description: 'متاجر Pilot محددة',
    percentage: 20,
    status: 'active',
    duration: 'أسبوع 3-4',
  },
  {
    id: 4,
    name: 'إطلاق كامل',
    description: 'جميع المستخدمين',
    percentage: 100,
    status: 'pending',
    duration: 'أسبوع 5-6',
  },
];

export const RolloutManager: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(3);
  const [rolloutPercentage, setRolloutPercentage] = useState(20);
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>(FEATURE_FLAGS);

  const getStageIcon = (status: RolloutStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'active':
        return <Activity className="w-5 h-5 text-primary animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStageColor = (status: RolloutStage['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'active':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const toggleFlag = (flag: FeatureFlag) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const metrics = {
    activeUsers: 1234,
    avgResponseTime: 425,
    errorRate: 0.8,
    satisfaction: 4.5,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الإطلاق التدريجي</h1>
          <p className="text-muted-foreground mt-2">
            مراقبة والتحكم في إطلاق النظام الموحد
          </p>
        </div>
        <Badge variant="default" className="text-lg py-2 px-4">
          <Activity className="w-4 h-4 ml-2" />
          مرحلة نشطة
        </Badge>
      </div>

      {/* Current Rollout Status */}
      <Card>
        <CardHeader>
          <CardTitle>حالة الإطلاق الحالية</CardTitle>
          <CardDescription>
            المرحلة {currentStage} من 4 - {ROLLOUT_STAGES[currentStage - 1].name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">نسبة التفعيل</span>
            <span className="text-2xl font-bold">{rolloutPercentage}%</span>
          </div>
          <Progress value={rolloutPercentage} className="h-3" />
          
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={() => setRolloutPercentage(Math.min(100, rolloutPercentage + 10))}
              disabled={rolloutPercentage >= 100}
            >
              <TrendingUp className="w-4 h-4 ml-2" />
              زيادة 10%
            </Button>
            <Button 
              variant="outline"
              onClick={() => setRolloutPercentage(Math.max(0, rolloutPercentage - 10))}
              disabled={rolloutPercentage <= 0}
            >
              تقليل 10%
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setRolloutPercentage(0)}
            >
              <AlertTriangle className="w-4 h-4 ml-2" />
              Rollback كامل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              المستخدمون النشطون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              على النظام الموحد
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              وقت الاستجابة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime}ms</div>
            <p className="text-xs text-success mt-1">
              ✓ أقل من 500ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              معدل الأخطاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-success mt-1">
              ✓ أقل من 2%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              رضا المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.satisfaction}/5</div>
            <p className="text-xs text-success mt-1">
              ✓ أعلى من 4.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rollout Stages */}
      <Card>
        <CardHeader>
          <CardTitle>مراحل الإطلاق</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ROLLOUT_STAGES.map((stage) => (
              <div
                key={stage.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  stage.status === 'active' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                {getStageIcon(stage.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{stage.name}</p>
                    <Badge variant={getStageColor(stage.status)}>
                      {stage.status === 'completed' && 'مكتمل'}
                      {stage.status === 'active' && 'نشط'}
                      {stage.status === 'pending' && 'قادم'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stage.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stage.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            التحكم في Feature Flags
          </CardTitle>
          <CardDescription>
            تفعيل أو تعطيل ميزات محددة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(flags).map(([flag, enabled]) => (
              <div key={flag} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor={flag} className="font-medium cursor-pointer">
                    {flag.replace(/_/g, ' ')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {getFlagDescription(flag as FeatureFlag)}
                  </p>
                </div>
                <Switch
                  id={flag}
                  checked={enabled}
                  onCheckedChange={() => toggleFlag(flag as FeatureFlag)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            تنبيهات مهمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              ⚠️ تأكد من مراقبة Metrics بشكل مستمر خلال الإطلاق
            </p>
            <p className="text-sm">
              ⚠️ كن مستعداً للـ Rollback إذا ارتفع معدل الأخطاء
            </p>
            <p className="text-sm">
              ⚠️ اجمع Feedback من المستخدمين بشكل يومي
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getFlagDescription(flag: FeatureFlag): string {
  const descriptions: Record<FeatureFlag, string> = {
    USE_UNIFIED_ORDERS: 'تفعيل نظام order_hub الموحد',
    USE_UNIFIED_RETURNS: 'استخدام المرتجعات الموحدة',
    USE_UNIFIED_REFUNDS: 'استخدام الاستردادات الموحدة',
    USE_UNIFIED_SHIPMENTS: 'استخدام الشحنات الموحدة',
    SHOW_UNIFIED_DASHBOARD: 'عرض لوحة التحكم الموحدة',
    SHOW_SOURCE_INDICATOR: 'عرض مصدر الطلب (ecommerce/simple/manual)',
    ENABLE_DUAL_WRITE: 'الكتابة على الجداول القديمة والجديدة',
    PREFER_LEGACY_READ: 'القراءة من الجداول القديمة عند التوفر',
    SHOW_MIGRATION_TOOLS: 'عرض أدوات الترحيل في الإدارة',
    ENABLE_DATA_VALIDATION: 'تشغيل فحوصات التحقق من البيانات',
  };
  return descriptions[flag] || flag;
}
