import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Clock,
  DollarSign,
  Star,
  RefreshCw,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  usersByLevel: Record<string, number>;
  activityTrend: Array<{
    date: string;
    count: number;
  }>;
}

export const UserAnalytics = () => {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    usersByRole: {},
    usersByLevel: {},
    activityTrend: []
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('role, level, is_active, created_at, last_activity_at');

      if (profilesError) throw profilesError;

      // Calculate date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth(), 1);

      // Calculate statistics
      const totalUsers = profiles?.length || 0;
      const activeUsers = profiles?.filter(p => p.is_active)?.length || 0;
      
      const newUsersToday = profiles?.filter(p => 
        new Date(p.created_at) >= today
      )?.length || 0;
      
      const newUsersThisWeek = profiles?.filter(p => 
        new Date(p.created_at) >= weekAgo
      )?.length || 0;
      
      const newUsersThisMonth = profiles?.filter(p => 
        new Date(p.created_at) >= monthAgo
      )?.length || 0;

      // Count by role
      const usersByRole: Record<string, number> = {};
      profiles?.forEach(profile => {
        usersByRole[profile.role] = (usersByRole[profile.role] || 0) + 1;
      });

      // Count by level
      const usersByLevel: Record<string, number> = {};
      profiles?.forEach(profile => {
        if (profile.level) {
          usersByLevel[profile.level] = (usersByLevel[profile.level] || 0) + 1;
        }
      });

      // Activity trend (last 7 days)
      const activityTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        
        const count = profiles?.filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt >= date && createdAt < nextDate;
        })?.length || 0;

        activityTrend.push({
          date: dateStr,
          count
        });
      }

      setStats({
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        usersByRole,
        usersByLevel,
        activityTrend
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "خطأ في جلب التحليلات",
        description: "تعذر جلب بيانات التحليلات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const csvContent = [
      ['المؤشر', 'القيمة'],
      ['إجمالي المستخدمين', stats.totalUsers.toString()],
      ['المستخدمون النشطون', stats.activeUsers.toString()],
      ['مستخدمون جدد اليوم', stats.newUsersToday.toString()],
      ['مستخدمون جدد هذا الأسبوع', stats.newUsersThisWeek.toString()],
      ['مستخدمون جدد هذا الشهر', stats.newUsersThisMonth.toString()],
      ['', ''],
      ['التوزيع حسب الدور', ''],
      ...Object.entries(stats.usersByRole).map(([role, count]) => [role, count.toString()]),
      ['', ''],
      ['التوزيع حسب المستوى', ''],
      ...Object.entries(stats.usersByLevel).map(([level, count]) => [level, count.toString()])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'مدير',
      merchant: 'تاجر',
      affiliate: 'مسوق',
      customer: 'عميل',
      moderator: 'مشرف'
    };
    return roleNames[role] || role;
  };

  const getLevelName = (level: string) => {
    const levelNames: Record<string, string> = {
      bronze: 'برونزي',
      silver: 'فضي',
      gold: 'ذهبي',
      legendary: 'أسطوري'
    };
    return levelNames[level] || level;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            تحليلات المستخدمين
          </h2>
          <p className="text-muted-foreground">
            إحصائيات شاملة عن نشاط المستخدمين والنمو
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="growth">النمو</TabsTrigger>
          <TabsTrigger value="distribution">التوزيع</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">المستخدمون النشطون</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">جدد اليوم</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.newUsersToday}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">معدل النشاط</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  اليوم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.newUsersToday}
                </div>
                <p className="text-sm text-muted-foreground">
                  مستخدم جديد اليوم
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  هذا الأسبوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.newUsersThisWeek}
                </div>
                <p className="text-sm text-muted-foreground">
                  مستخدم جديد هذا الأسبوع
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  هذا الشهر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.newUsersThisMonth}
                </div>
                <p className="text-sm text-muted-foreground">
                  مستخدم جديد هذا الشهر
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه التسجيل (آخر 7 أيام)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {stats.activityTrend.map((day, index) => {
                  const maxCount = Math.max(...stats.activityTrend.map(d => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 200 : 10;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="bg-primary rounded-t w-full min-h-[10px] flex items-end justify-center transition-all hover:bg-primary/80"
                        style={{ height: `${height}px` }}
                      >
                        <span className="text-xs text-primary-foreground font-medium mb-1">
                          {day.count}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(day.date).toLocaleDateString('ar-SA', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribution by Role */}
            <Card>
              <CardHeader>
                <CardTitle>التوزيع حسب الدور</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.usersByRole).map(([role, count]) => {
                  const percentage = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
                  
                  return (
                    <div key={role} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{getRoleName(role)}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{count}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Distribution by Level */}
            <Card>
              <CardHeader>
                <CardTitle>التوزيع حسب المستوى</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.usersByLevel).map(([level, count]) => {
                  const percentage = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
                  
                  return (
                    <div key={level} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{getLevelName(level)}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{count}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  نشاط المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>المستخدمون النشطون</span>
                  <Badge className="bg-green-100 text-green-800">
                    {stats.activeUsers}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>المستخدمون غير النشطين</span>
                  <Badge variant="secondary">
                    {stats.totalUsers - stats.activeUsers}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>معدل النشاط</span>
                  <Badge variant="outline">
                    {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  اتجاهات النمو
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>النمو اليومي</span>
                  <Badge variant="outline">
                    {stats.newUsersToday} مستخدم
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>النمو الأسبوعي</span>
                  <Badge variant="outline">
                    {stats.newUsersThisWeek} مستخدم
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span>النمو الشهري</span>
                  <Badge variant="outline">
                    {stats.newUsersThisMonth} مستخدم
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};