import React from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Activity,
  Calendar,
  User,
  Star
} from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useUserDataContext } from '@/contexts/UserDataContext';

export const UserDashboard: React.FC = () => {
  const { user } = useSupabaseAuth();
  const { userShop, userActivities, userStatistics, loading } = useUserDataContext();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={''} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">
                {user?.user_metadata?.full_name || user?.email}
              </CardTitle>
              <p className="text-muted-foreground">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  مستخدم
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  0 نقطة
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              المنتجات
            </CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              {userStatistics?.totalProducts || userShop?.total_products || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              المنتجات المتاحة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الطلبات
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStatistics?.totalOrders || userShop?.total_orders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي الطلبات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الإيرادات
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStatistics?.totalRevenue || 0} ر.س
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي المبيعات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              العملاء
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStatistics?.totalCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              عدد العملاء
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shop Info Card */}
      {userShop && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              معلومات المتجر
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-sm text-muted-foreground">اسم المتجر</p>
                <p className="font-medium">{userShop.display_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">رابط المتجر</p>
                <p className="font-medium text-primary">{userShop.slug}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p className="font-medium">{formatDate(userShop.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge variant="default">نشط</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            الأنشطة الأخيرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userActivities.length > 0 ? (
              userActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {activity.activity_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(activity.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد أنشطة بعد</p>
                <p className="text-sm">ابدأ بإنشاء متجرك أو إضافة منتجات</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};