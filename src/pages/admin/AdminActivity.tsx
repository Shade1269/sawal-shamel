import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  Search, 
  Filter, 
  Download,
  User,
  ShoppingCart,
  Settings,
  Shield,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';

const AdminActivity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const activities = [
    {
      id: 1,
      user: 'أحمد محمد',
      action: 'تسجيل دخول',
      type: 'login',
      details: 'تم تسجيل الدخول بنجاح',
      timestamp: 'منذ 5 دقائق',
      ip: '192.168.1.100',
      status: 'success'
    },
    {
      id: 2,
      user: 'فاطمة علي',
      action: 'إضافة منتج',
      type: 'product',
      details: 'تم إضافة منتج جديد: هاتف ذكي',
      timestamp: 'منذ 12 دقيقة',
      ip: '192.168.1.101',
      status: 'success'
    },
    {
      id: 3,
      user: 'محمد أحمد',
      action: 'محاولة دخول فاشلة',
      type: 'security',
      details: 'كلمة مرور خاطئة - 3 محاولات',
      timestamp: 'منذ 25 دقيقة',
      ip: '192.168.1.102',
      status: 'warning'
    },
    {
      id: 4,
      user: 'سارة خالد',
      action: 'طلب جديد',
      type: 'order',
      details: 'طلب رقم #ORD-2024-001',
      timestamp: 'منذ 45 دقيقة',
      ip: '192.168.1.103',
      status: 'success'
    },
    {
      id: 5,
      user: 'عبدالله سعد',
      action: 'تحديث ملف شخصي',
      type: 'profile',
      details: 'تم تحديث البيانات الشخصية',
      timestamp: 'منذ ساعة',
      ip: '192.168.1.104',
      status: 'success'
    },
    {
      id: 6,
      user: 'مريم أحمد',
      action: 'حذف منتج',
      type: 'product',
      details: 'تم حذف منتج: جهاز لوحي',
      timestamp: 'منذ ساعتين',
      ip: '192.168.1.105',
      status: 'danger'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'profile':
        return User;
      case 'product':
        return ShoppingCart;
      case 'order':
        return ShoppingCart;
      case 'security':
        return Shield;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'نجح';
      case 'warning':
        return 'تحذير';
      case 'danger':
        return 'خطر';
      default:
        return 'معلومات';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || activity.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          سجل النشاط
        </h1>
        <p className="text-muted-foreground mt-2">
          تتبع جميع أنشطة المستخدمين والعمليات في النظام
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="البحث في الأنشطة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="نوع النشاط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنشطة</SelectItem>
                <SelectItem value="login">تسجيل الدخول</SelectItem>
                <SelectItem value="product">المنتجات</SelectItem>
                <SelectItem value="order">الطلبات</SelectItem>
                <SelectItem value="security">الأمان</SelectItem>
                <SelectItem value="profile">الملفات الشخصية</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-elegant">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">1,247</div>
            <div className="text-sm text-muted-foreground">إجمالي الأنشطة</div>
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">892</div>
            <div className="text-sm text-muted-foreground">عمليات ناجحة</div>
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">23</div>
            <div className="text-sm text-muted-foreground">تحذيرات</div>
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">5</div>
            <div className="text-sm text-muted-foreground">أخطاء</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            سجل الأنشطة الحديثة
          </CardTitle>
          <CardDescription>
            عرض {filteredActivities.length} من أصل {activities.length} نشاط
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border bg-background/50 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm font-medium">{activity.action}</span>
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusText(activity.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.details}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{activity.timestamp}</span>
                      <span>IP: {activity.ip}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivity;