import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  UserPlus,
  PackagePlus,
  FileText,
  Crown,
  Zap,
  Shield,
  Globe,
  CreditCard,
  Truck,
  Bell,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminQuickActions = () => {
  const navigate = useNavigate();

  const primaryActions = [
    {
      title: "إدارة المستخدمين",
      description: "مراجعة المسوقين والتجار وإدارة الصلاحيات",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      action: () => navigate('/admin/users'),
      badge: "12 جديد"
    },
    {
      title: "إدارة المنتجات",
      description: "إضافة وتعديل المنتجات والفئات",
      icon: Package,
      color: "from-green-500 to-green-600",
      action: () => navigate('/admin/products'),
      badge: "152 منتج"
    },
    {
      title: "التقارير والإحصائيات",
      description: "تحليلات شاملة لأداء المنصة والمبيعات",
      icon: BarChart3,
      color: "from-purple-500 to-purple-600",
      action: () => navigate('/admin/analytics'),
      badge: "تحديث جديد"
    }
  ];

  const secondaryActions = [
    {
      title: "إعدادات النظام",
      icon: Settings,
      color: "bg-gray-100 dark:bg-gray-800",
      action: () => navigate('/admin/settings')
    },
    {
      title: "الأمان والحماية",
      icon: Shield,
      color: "bg-red-100 dark:bg-red-900/20",
      action: () => navigate('/admin/security')
    },
    {
      title: "بوابات الدفع",
      icon: CreditCard,
      color: "bg-blue-100 dark:bg-blue-900/20",
      action: () => navigate('/admin/payment-gateways')
    },
    {
      title: "إدارة الشحن",
      icon: Truck,
      color: "bg-orange-100 dark:bg-orange-900/20",
      action: () => navigate('/shipment-management')
    },
    {
      title: "قاعدة البيانات",
      icon: Database,
      color: "bg-indigo-100 dark:bg-indigo-900/20",
      action: () => navigate('/admin/database')
    },
    {
      title: "الإشعارات",
      icon: Bell,
      color: "bg-yellow-100 dark:bg-yellow-900/20",
      action: () => navigate('/admin/notifications')
    }
  ];

  const quickStats = [
    { label: "المستخدمين النشطين اليوم", value: "1,234", icon: Users },
    { label: "الطلبات الجديدة", value: "89", icon: Package },
    { label: "المبيعات اليوم", value: "45,230 ريال", icon: BarChart3 },
    { label: "معدل النجاح", value: "98.5%", icon: Zap }
  ];

  return (
    <div className="space-y-8">
      {/* Primary Actions */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Crown className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">الإجراءات السريعة</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {primaryActions.map((action, index) => (
            <Card 
              key={index} 
              className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={action.action}
            >
              <CardHeader className="relative">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.color} opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-300`}></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  {action.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-4">{action.title}</CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 group-hover:scale-105 transition-all duration-200">
                  الانتقال
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Secondary Actions Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4">أدوات إضافية</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {secondaryActions.map((action, index) => (
            <Card 
              key={index} 
              className="border-0 bg-card/30 hover:bg-card/60 backdrop-blur-sm cursor-pointer group transition-all duration-200 hover:scale-105"
              onClick={action.action}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">{action.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h3 className="text-xl font-bold mb-4">إحصائيات سريعة</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-0 bg-card/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};