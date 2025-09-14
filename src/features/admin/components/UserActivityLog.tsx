import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar,
  Clock,
  User,
  Activity,
  Search,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata?: any;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
}

export const UserActivityLog = ({ userId }: { userId?: string }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_activities')
        .select(`
          *,
          profiles!user_activities_user_id_fkey (
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "خطأ في جلب سجل الأنشطة",
        description: "تعذر جلب سجل الأنشطة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <User className="h-4 w-4 text-green-500" />;
      case 'logout': return <User className="h-4 w-4 text-red-500" />;
      case 'profile_update': return <User className="h-4 w-4 text-blue-500" />;
      case 'order_created': return <Activity className="h-4 w-4 text-purple-500" />;
      case 'shop_created': return <Activity className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'login': return 'تسجيل دخول';
      case 'logout': return 'تسجيل خروج';
      case 'profile_update': return 'تحديث الملف الشخصي';
      case 'order_created': return 'إنشاء طلب';
      case 'shop_created': return 'إنشاء متجر';
      case 'product_created': return 'إضافة منتج';
      case 'commission_earned': return 'كسب عمولة';
      default: return type;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedActivityType === 'all' || activity.activity_type === selectedActivityType;
    return matchesSearch && matchesType;
  });

  const exportActivities = () => {
    const csvContent = [
      ['التاريخ', 'المستخدم', 'نوع النشاط', 'الوصف'],
      ...filteredActivities.map(activity => [
        new Date(activity.created_at).toLocaleString('ar-SA'),
        activity.user?.full_name || '',
        getActivityTypeLabel(activity.activity_type),
        activity.description || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `activities_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              سجل الأنشطة
            </CardTitle>
            <CardDescription>
              سجل شامل لجميع أنشطة المستخدمين
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportActivities}>
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
            <Button variant="outline" onClick={fetchActivities}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الأنشطة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          
          <select
            value={selectedActivityType}
            onChange={(e) => setSelectedActivityType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">جميع الأنشطة</option>
            <option value="login">تسجيل دخول</option>
            <option value="profile_update">تحديث ملف شخصي</option>
            <option value="order_created">إنشاء طلب</option>
            <option value="shop_created">إنشاء متجر</option>
            <option value="product_created">إضافة منتج</option>
          </select>
        </div>

        {/* Activities List */}
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">
                        {activity.user?.full_name || 'مستخدم غير معروف'}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {getActivityTypeLabel(activity.activity_type)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.created_at).toLocaleString('ar-SA')}
                      </div>
                      
                      {activity.user?.email && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {activity.user.email}
                        </div>
                      )}
                    </div>
                    
                    {activity.metadata && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <pre className="whitespace-pre-wrap text-muted-foreground">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm || selectedActivityType !== 'all' 
                  ? 'لا توجد أنشطة تطابق البحث' 
                  : 'لا توجد أنشطة مسجلة'
                }
              </p>
            </div>
          )}
        </ScrollArea>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>عرض {filteredActivities.length} نشاط</span>
          <span>آخر تحديث: {new Date().toLocaleString('ar-SA')}</span>
        </div>
      </CardContent>
    </Card>
  );
};