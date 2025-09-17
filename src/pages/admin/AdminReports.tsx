import React from 'react';
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardDescription, 
  EnhancedCardHeader, 
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  InteractiveWidget,
  EnhancedButton,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
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
            <Card key={index} className="shadow-elegant hover:shadow-luxury transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {report.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={report.status === 'متاح' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    آخر تحديث: {report.lastGenerated}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      عرض
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default"
                      disabled={report.status !== 'متاح'}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      تحميل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            إحصائيات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Generate New Report */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>إنشاء تقرير جديد</CardTitle>
          <CardDescription>
            قم بإنشاء تقرير مخصص حسب احتياجاتك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button className="bg-gradient-primary">
              <Calendar className="h-4 w-4 mr-2" />
              تقرير فترة محددة
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              تقرير المستخدمین
            </Button>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              تقرير الأداء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;