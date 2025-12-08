import { UnifiedButton, UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle, UnifiedBadge } from '@/components/design-system';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  DollarSign,
  BarChart3
} from 'lucide-react';

const AdminReports = () => {
  const reports = [
    {
      title: 'تقرير المبيعات الشهري',
      description: 'إحصائيات مفصلة عن المبيعات والأرباح',
      icon: TrendingUp,
      status: 'متاح',
      lastGenerated: 'اليوم',
      color: 'bg-gradient-primary'
    },
    {
      title: 'تقرير المستخدمين',
      description: 'إحصائيات نشاط المستخدمين والتسجيلات الجديدة',
      icon: Users,
      status: 'متاح',
      lastGenerated: 'أمس',
      color: 'bg-gradient-luxury'
    },
    {
      title: 'تقرير الطلبات',
      description: 'تحليل تفصيلي لحالة الطلبات والمدفوعات',
      icon: ShoppingCart,
      status: 'قيد التحديث',
      lastGenerated: 'منذ 3 أيام',
      color: 'bg-gradient-premium'
    },
    {
      title: 'تقرير العمولات',
      description: 'تقرير شامل عن العمولات المدفوعة والمستحقة',
      icon: DollarSign,
      status: 'متاح',
      lastGenerated: 'اليوم',
      color: 'bg-gradient-heritage'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          التقارير والإحصائيات
        </h1>
        <p className="text-muted-foreground mt-2">
          تقارير تفصيلية عن جميع جوانب النظام
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <UnifiedCard key={index} variant="glass" hover="lift" className="shadow-elegant">
              <UnifiedCardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <UnifiedCardTitle className="text-lg">{report.title}</UnifiedCardTitle>
                      <UnifiedCardDescription className="text-sm mt-1">
                        {report.description}
                      </UnifiedCardDescription>
                    </div>
                  </div>
                  <UnifiedBadge 
                    variant={report.status === 'متاح' ? 'success' : 'info'}
                    className="text-xs"
                  >
                    {report.status}
                  </UnifiedBadge>
                </div>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    آخر تحديث: {report.lastGenerated}
                  </div>
                  <div className="flex gap-2">
                    <UnifiedButton size="sm" variant="outline" leftIcon={<BarChart3 className="h-4 w-4" />}>
                      عرض
                    </UnifiedButton>
                    <UnifiedButton 
                      size="sm" 
                      variant="primary"
                      disabled={report.status !== 'متاح'}
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      تحميل
                    </UnifiedButton>
                  </div>
                </div>
              </UnifiedCardContent>
            </UnifiedCard>
          );
        })}
      </div>

      {/* Quick Stats */}
      <UnifiedCard variant="flat" hover="lift" className="shadow-elegant">
        <UnifiedCardHeader>
          <UnifiedCardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            إحصائيات سريعة
          </UnifiedCardTitle>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-primary/10">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-sm text-muted-foreground">تقرير محفوظ</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-luxury/10">
              <div className="text-2xl font-bold text-luxury">1,247</div>
              <div className="text-sm text-muted-foreground">تحميل هذا الشهر</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-premium/10">
              <div className="text-2xl font-bold text-premium">892</div>
              <div className="text-sm text-muted-foreground">مشاهدة التقارير</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-heritage/10">
              <div className="text-2xl font-bold text-heritage">15</div>
              <div className="text-sm text-muted-foreground">تقرير مجدول</div>
            </div>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>

      {/* Generate New Report */}
      <UnifiedCard variant="flat" hover="lift" className="shadow-elegant">
        <UnifiedCardHeader>
          <UnifiedCardTitle>إنشاء تقرير جديد</UnifiedCardTitle>
          <UnifiedCardDescription>
            قم بإنشاء تقرير مخصص حسب احتياجاتك
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="flex gap-3">
            <UnifiedButton variant="primary" leftIcon={<Calendar className="h-4 w-4" />}>
              تقرير فترة محددة
            </UnifiedButton>
            <UnifiedButton variant="outline" leftIcon={<Users className="h-4 w-4" />}>
              تقرير المستخدمین
            </UnifiedButton>
            <UnifiedButton variant="outline" leftIcon={<TrendingUp className="h-4 w-4" />}>
              تقرير الأداء
            </UnifiedButton>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};

export default AdminReports;