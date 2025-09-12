import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedUserTable } from '@/components/admin/EnhancedUserTable';
import { QuickUserActions } from '@/components/admin/QuickUserActions';
import { 
  Users, 
  Search,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Filter,
  ArrowLeft,
  BarChart3,
  Download,
  Upload,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Store,
  Crown,
  Shield,
  Activity,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Bell,
  Ban,
  Key,
  MessageSquare,
  Send,
  History,
  Home,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { UserActivityLog } from '@/components/admin/UserActivityLog';
import { UserPermissions } from '@/components/admin/UserPermissions';
import { UserAnalytics } from '@/components/admin/UserAnalytics';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'admin' | 'merchant' | 'affiliate' | 'customer' | 'moderator';
  level: 'bronze' | 'silver' | 'gold' | 'legendary';
  points: number;
  total_earnings: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at?: string;
  avatar_url?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    merchants: 0,
    affiliates: 0,
    customers: 0,
    moderators: 0,
    newUsersThisMonth: 0,
    totalEarnings: 0
  });
  
  // Enhanced state for new features
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTargetRole, setNotificationTargetRole] = useState<string>('all');
  
  const { toast } = useToast();
  const { goToUserHome } = useSmartNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedLevel, selectedStatus]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "خطأ في جلب المستخدمين",
        description: "تعذر جلب قائمة المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role, is_active, total_earnings, created_at');

      if (profiles) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const stats = {
          totalUsers: profiles.length,
          activeUsers: profiles.filter(p => p.is_active).length,
          admins: profiles.filter(p => p.role === 'admin').length,
          merchants: profiles.filter(p => p.role === 'merchant').length,
          affiliates: profiles.filter(p => p.role === 'affiliate').length,
          customers: profiles.filter(p => p.role === 'customer').length,
          moderators: profiles.filter(p => p.role === 'moderator').length,
          newUsersThisMonth: profiles.filter(p => new Date(p.created_at) >= startOfMonth).length,
          totalEarnings: profiles.reduce((sum, p) => sum + (p.total_earnings || 0), 0)
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(user => user.level === selectedLevel);
    }

    if (selectedStatus === 'active') {
      filtered = filtered.filter(user => user.is_active);
    } else if (selectedStatus === 'inactive') {
      filtered = filtered.filter(user => !user.is_active);
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });

      fetchUsers();
      fetchStats();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "خطأ في التحديث",
        description: "تعذر تحديث بيانات المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "تم إضافة المستخدم بنجاح",
        description: "تم إنشاء حساب جديد",
      });

      fetchUsers();
      fetchStats();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "خطأ في الإضافة",
        description: "تعذر إضافة المستخدم الجديد",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.')) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المستخدم بنجاح",
      });

      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "خطأ في الحذف",
        description: "تعذر حذف المستخدم",
        variant: "destructive",
      });
    }
  };

  const sendNotificationToUser = async (userId: string, message: string, type: 'info' | 'warning' | 'success' = 'info') => {
    try {
      // In a real app, this would send notification through your notification system
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "تم إرسال الإشعار",
        description: "تم إرسال الإشعار للمستخدم بنجاح",
      });
      
      setIsNotificationDialogOpen(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "تعذر إرسال الإشعار",
        variant: "destructive",
      });
    }
  };

  const banUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;

      // Log the ban action
      await supabase
        .from('user_activities')
        .insert([{
          user_id: userId,
          activity_type: 'user_banned',
          description: `تم حظر المستخدم. السبب: ${reason}`,
          metadata: { reason, banned_by: 'admin', banned_at: new Date().toISOString() }
        }]);

      toast({
        title: "تم حظر المستخدم",
        description: "تم حظر المستخدم بنجاح",
      });

      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "خطأ في الحظر",
        description: "تعذر حظر المستخدم",
        variant: "destructive",
      });
    }
  };
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "تم تحديث الحالة",
        description: `تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم`,
      });

      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "خطأ في التحديث",
        description: "تعذر تغيير حالة المستخدم",
        variant: "destructive",
      });
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['الاسم', 'الإيميل', 'الهاتف', 'الدور', 'المستوى', 'النقاط', 'الأرباح', 'الحالة', 'تاريخ التسجيل'],
      ...filteredUsers.map(user => [
        user.full_name || '',
        user.email || '',
        user.phone || '',
        getRoleName(user.role),
        user.level || '',
        user.points || 0,
        user.total_earnings || 0,
        user.is_active ? 'نشط' : 'غير نشط',
        new Date(user.created_at).toLocaleDateString('ar-SA')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Enhanced functions for new features
  const handleBulkNotification = async (message: string, targetRole?: string) => {
    try {
      // Filter users based on target role
      let targetUsers = users;
      if (targetRole && targetRole !== 'all') {
        targetUsers = users.filter(user => user.role === targetRole);
      }

      // Simulate sending notifications
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "تم إرسال الإشعارات",
        description: `تم إرسال الإشعار إلى ${targetUsers.length} مستخدم بنجاح`,
      });
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "تعذر إرسال الإشعارات",
        variant: "destructive",
      });
    }
  };

  const handleImportUsers = () => {
    // TODO: Implement user import functionality
    toast({
      title: "قريباً",
      description: "ميزة استيراد المستخدمين ستكون متاحة قريباً",
    });
  };

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filters: any) => {
    if (filters.status) {
      setSelectedStatus(filters.status);
    }
    if (filters.role) {
      setSelectedRole(filters.role);
    }
  };

  const userStatsForActions = {
    total: stats.totalUsers,
    active: stats.activeUsers,
    newThisMonth: stats.newUsersThisMonth,
    byRole: {
      admin: stats.admins,
      merchant: stats.merchants,
      affiliate: stats.affiliates,
      customer: stats.customers,
      moderator: stats.moderators
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'merchant': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'affiliate': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'moderator': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'legendary': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'merchant': return 'تاجر';
      case 'affiliate': return 'مسوق';
      case 'customer': return 'عميل';
      case 'moderator': return 'مشرف';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'merchant': return <Store className="h-4 w-4" />;
      case 'affiliate': return <Star className="h-4 w-4" />;
      case 'customer': return <ShoppingCart className="h-4 w-4" />;
      case 'moderator': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLastActivityColor = (lastActivity?: string) => {
    if (!lastActivity) return 'text-red-500';
    
    const now = new Date();
    const activityDate = new Date(lastActivity);
    const daysDiff = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return 'text-green-500';
    if (daysDiff <= 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل المستخدمين...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للوحة التحكم
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToUserHome}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              الصفحة الرئيسية
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              إدارة المستخدمين
            </h1>
            <p className="text-muted-foreground mt-2">
              إدارة شاملة للمستخدمين والصلاحيات
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 ml-2" />
            تصدير البيانات
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <UserPlus className="h-4 w-4 ml-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>
                  إنشاء حساب مستخدم جديد في النظام
                </DialogDescription>
              </DialogHeader>
              <AddUserForm 
                onSave={handleAddUser} 
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="analytics">تحليلات</TabsTrigger>
          <TabsTrigger value="activity">الأنشطة</TabsTrigger>
          <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions Section */}
          <QuickUserActions
            onBulkNotification={handleBulkNotification}
            onExportUsers={exportUsers}
            onImportUsers={handleImportUsers}
            onQuickSearch={handleQuickSearch}
            onFilterChange={handleFilterChange}
            userStats={userStatsForActions}
          />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-primary text-primary-foreground">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">إجمالي المستخدمين</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-luxury text-luxury-foreground">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">المستخدمين النشطين</p>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  </div>
                  <Activity className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-premium text-premium-foreground">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">مستخدمين جدد</p>
                    <p className="text-2xl font-bold">{stats.newUsersThisMonth}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-heritage text-heritage-foreground">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">إجمالي الأرباح</p>
                    <p className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()} ر.س</p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-4 text-center">
                <Crown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-red-800 dark:text-red-300">المدراء</p>
                <p className="text-xl font-bold text-red-600">{stats.admins}</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-4 text-center">
                <Store className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">التجار</p>
                <p className="text-xl font-bold text-blue-600">{stats.merchants}</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300">المسوقين</p>
                <p className="text-xl font-bold text-green-600">{stats.affiliates}</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300">المشرفين</p>
                <p className="text-xl font-bold text-purple-600">{stats.moderators}</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gray-50 dark:bg-gray-950/20">
              <CardContent className="p-4 text-center">
                <ShoppingCart className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-300">العملاء</p>
                <p className="text-xl font-bold text-gray-600">{stats.customers}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>البحث والتصفية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>البحث</Label>
                  <div className="relative">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="الاسم، الإيميل، الهاتف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>الدور</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأدوار</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="merchant">تاجر</SelectItem>
                      <SelectItem value="affiliate">مسوق</SelectItem>
                      <SelectItem value="customer">عميل</SelectItem>
                      <SelectItem value="moderator">مشرف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>المستوى</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستويات</SelectItem>
                      <SelectItem value="bronze">برونزي</SelectItem>
                      <SelectItem value="silver">فضي</SelectItem>
                      <SelectItem value="gold">ذهبي</SelectItem>
                      <SelectItem value="legendary">أسطوري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedRole('all');
                      setSelectedLevel('all');
                      setSelectedStatus('all');
                    }}
                  >
                    <Filter className="ml-2 h-4 w-4" />
                    إعادة تعيين
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Users Table */}
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    قائمة المستخدمين المحسنة
                  </CardTitle>
                  <CardDescription>
                    إدارة شاملة ومتقدمة لحسابات المستخدمين - عرض {filteredUsers.length} من أصل {users.length} مستخدم
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="px-3 py-1">
                  <Users className="ml-1 h-4 w-4" />
                  {filteredUsers.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <EnhancedUserTable
                users={filteredUsers}
                onEdit={(user) => {
                  setSelectedUser(user);
                  setIsEditDialogOpen(true);
                }}
                onDelete={handleDeleteUser}
                onToggleStatus={toggleUserStatus}
                onViewDetails={(user) => {
                  setSelectedUser(user);
                  setIsDetailsDialogOpen(true);
                }}
                onSendNotification={(user) => {
                  setSelectedUser(user);
                  setIsNotificationDialogOpen(true);
                }}
                onManagePermissions={(user) => {
                  setSelectedUser(user);
                  setIsPermissionsDialogOpen(true);
                }}
              />
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.full_name || 'غير محدد'}</h3>
                          {user.role === 'admin' && <Crown className="h-4 w-4 text-amber-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </p>
                        )}
                        {user.last_activity_at && (
                          <p className={`text-xs flex items-center gap-1 ${getLastActivityColor(user.last_activity_at)}`}>
                            <Clock className="h-3 w-3" />
                            آخر نشاط: {formatDate(user.last_activity_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right space-y-1">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleName(user.role)}
                        </Badge>
                        {user.level && (
                          <Badge variant="outline" className={getLevelColor(user.level)}>
                            {user.level}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" />
                          {user.points || 0} نقطة
                        </div>
                      </div>
                      
                      <Separator orientation="vertical" className="h-8" />
                      
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => toggleUserStatus(user.id, user.is_active)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <span className="text-xs text-muted-foreground">
                          {user.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Dialog open={isDetailsDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsDetailsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>تفاصيل المستخدم</DialogTitle>
                              <DialogDescription>
                                معلومات مفصلة عن {user.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="details">التفاصيل</TabsTrigger>
                                <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
                                <TabsTrigger value="activity">الأنشطة</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="details" className="space-y-4">
                                <UserDetailsView user={user} />
                              </TabsContent>
                              
                              <TabsContent value="permissions" className="space-y-4">
                                <UserPermissions user={user} />
                              </TabsContent>
                              
                              <TabsContent value="activity" className="space-y-4">
                                <UserActivityLog userId={user.id} />
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={isEditDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>تحرير المستخدم</DialogTitle>
                              <DialogDescription>
                                تحديث بيانات المستخدم {user.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <EditUserForm 
                              user={user} 
                              onSave={handleUpdateUser} 
                              onCancel={() => setIsEditDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isNotificationDialogOpen && selectedUser?.id === user.id} onOpenChange={setIsNotificationDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>إرسال إشعار</DialogTitle>
                              <DialogDescription>
                                إرسال إشعار للمستخدم {user.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            <NotificationForm 
                              user={user} 
                              onSend={sendNotificationToUser} 
                              onCancel={() => setIsNotificationDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              const reason = prompt('سبب الحظر:');
                              if (reason) {
                                banUser(user.id, reason);
                              }
                            }}
                          >
                            <Ban className="h-4 w-4 text-orange-500" />
                          </Button>
                        )}
                        
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <UserAnalytics />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <UserActivityLog />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              إدارة الصلاحيات - اختر مستخدم لعرض وتعديل صلاحياته
            </AlertDescription>
          </Alert>
          
          {selectedUser ? (
            <UserPermissions user={selectedUser} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">اختر مستخدماً</h3>
                <p className="text-muted-foreground">
                  اختر مستخدماً من قائمة المستخدمين لعرض وإدارة صلاحياته
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              إعدادات إدارة المستخدمين - تأكد من مراجعة جميع التغييرات قبل الحفظ
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات عامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>السماح بالتسجيل الجديد</Label>
                  <p className="text-sm text-muted-foreground">تمكين المستخدمين الجدد من إنشاء حسابات</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>التحقق من البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">طلب تأكيد البريد الإلكتروني للحسابات الجديدة</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>الموافقة اليدوية للتجار</Label>
                  <p className="text-sm text-muted-foreground">مراجعة طلبات التاجر قبل الموافقة</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component for user details view
const UserDetailsView = ({ user }: { user: User }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{user.full_name || 'غير محدد'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">الدور:</span>
                <Badge>{user.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">المستوى:</span>
                <Badge variant="outline">{user.level}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">النقاط:</span>
                <span className="font-medium">{user.points}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات إضافية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>رقم الهاتف:</span>
            <span>{user.phone || 'غير متوفر'}</span>
          </div>
          <div className="flex justify-between">
            <span>إجمالي الأرباح:</span>
            <span className="font-medium">{user.total_earnings?.toLocaleString() || 0} ر.س</span>
          </div>
          <div className="flex justify-between">
            <span>تاريخ التسجيل:</span>
            <span>{new Date(user.created_at).toLocaleDateString('ar-SA')}</span>
          </div>
          <div className="flex justify-between">
            <span>آخر تحديث:</span>
            <span>{new Date(user.updated_at).toLocaleDateString('ar-SA')}</span>
          </div>
          <div className="flex justify-between">
            <span>الحالة:</span>
            <Badge variant={user.is_active ? "default" : "secondary"}>
              {user.is_active ? 'نشط' : 'غير نشط'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Component for editing user
const EditUserForm = ({ user, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'customer',
    level: user.level || 'bronze',
    points: user.points || 0,
    total_earnings: user.total_earnings || 0,
    is_active: user.is_active || false
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>الاسم الكامل</Label>
        <Input
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          placeholder="الاسم الكامل"
        />
      </div>
      
      <div className="space-y-2">
        <Label>البريد الإلكتروني</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="البريد الإلكتروني"
        />
      </div>
      
      <div className="space-y-2">
        <Label>رقم الهاتف</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="رقم الهاتف"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>الدور</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">مدير</SelectItem>
              <SelectItem value="merchant">تاجر</SelectItem>
              <SelectItem value="affiliate">مسوق</SelectItem>
              <SelectItem value="customer">عميل</SelectItem>
              <SelectItem value="moderator">مشرف</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>المستوى</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bronze">برونزي</SelectItem>
              <SelectItem value="silver">فضي</SelectItem>
              <SelectItem value="gold">ذهبي</SelectItem>
              <SelectItem value="legendary">أسطوري</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>النقاط</Label>
          <Input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({...formData, points: parseInt(e.target.value) || 0})}
            placeholder="النقاط"
          />
        </div>
        
        <div className="space-y-2">
          <Label>إجمالي الأرباح (ر.س)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.total_earnings}
            onChange={(e) => setFormData({...formData, total_earnings: parseFloat(e.target.value) || 0})}
            placeholder="الأرباح"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
        />
        <Label>حساب نشط</Label>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          حفظ التغييرات
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          إلغاء
        </Button>
      </div>
    </form>
  );
};

// Component for adding new user
const AddUserForm = ({ onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'customer',
    level: 'bronze',
    points: 0,
    total_earnings: 0,
    is_active: true
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>الاسم الكامل *</Label>
        <Input
          required
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          placeholder="الاسم الكامل"
        />
      </div>
      
      <div className="space-y-2">
        <Label>البريد الإلكتروني *</Label>
        <Input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="البريد الإلكتروني"
        />
      </div>
      
      <div className="space-y-2">
        <Label>رقم الهاتف</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          placeholder="رقم الهاتف"
        />
      </div>
      
      <div className="space-y-2">
        <Label>الدور</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer">عميل</SelectItem>
            <SelectItem value="affiliate">مسوق</SelectItem>
            <SelectItem value="merchant">تاجر</SelectItem>
            <SelectItem value="moderator">مشرف</SelectItem>
            <SelectItem value="admin">مدير</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          إضافة المستخدم
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          إلغاء
        </Button>
      </div>
    </form>
  );
};

// Component for notification form
const NotificationForm = ({ user, onSend, onCancel }: any) => {
  const [formData, setFormData] = useState({
    message: '',
    type: 'info' as 'info' | 'warning' | 'success'
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSend(user.id, formData.message, formData.type);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>نوع الإشعار</Label>
        <Select value={formData.type} onValueChange={(value: 'info' | 'warning' | 'success') => setFormData({...formData, type: value})}>
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع الإشعار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">معلوماتي</SelectItem>
            <SelectItem value="warning">تحذير</SelectItem>
            <SelectItem value="success">نجح</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>نص الإشعار</Label>
        <Textarea
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          placeholder="اكتب نص الإشعار..."
          rows={4}
          required
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          <Send className="h-4 w-4 ml-2" />
          إرسال الإشعار
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          إلغاء
        </Button>
      </div>
    </form>
  );
};

export default AdminUsers;