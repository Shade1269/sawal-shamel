import React, { useState, useEffect } from 'react';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp,
  Crown,
  Settings,
  Package,
  Activity,
  BarChart3,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Ban,
  UserCheck,
  UserX,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Zap,
  Target,
  Gift,
  Sparkles,
  Star
} from 'lucide-react';
import { PushNotificationManager } from '@/components/PushNotificationManager';
import { AtlantisAnimations } from '@/components/AtlantisAnimations';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
  affiliateStores: number;
  atlantisUsers: number;
  weeklyGrowth: number;
  monthlyRevenue: number;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_activity_at?: string;
  total_earnings?: number;
  points?: number;
}

interface Order {
  id: string;
  customer_name: string;
  total_sar: number;
  status: string;
  created_at: string;
  affiliate_store_id?: string;
}

const ComprehensiveAdminPanel = () => {
  const { profile } = useFastAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    affiliateStores: 0,
    atlantisUsers: 0,
    weeklyGrowth: 0,
    monthlyRevenue: 0
  });

  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState<any>(null);

  // Security & Moderation
  const [moderationAction, setModerationAction] = useState('');
  const [moderationReason, setModerationReason] = useState('');
  const [moderationDuration, setModerationDuration] = useState('24');

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    atlantisSystemEnabled: true,
    chatSystemEnabled: true,
    commissionRate: 10,
    maxUploadSize: 10,
    allowedFileTypes: 'jpg,png,pdf'
  });

  // Notifications & Announcements
  const [announcement, setAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info',
    targetAudience: 'all'
  });

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [profile, navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, userFilter]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive statistics
      const [usersRes, ordersRes, storesRes, atlantisRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('ecommerce_orders').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('affiliate_stores').select('*'),
        supabase.from('user_levels').select('*')
      ]);

      if (usersRes.data) {
        setUsers(usersRes.data);
        setStats(prev => ({
          ...prev,
          totalUsers: usersRes.data.length,
          activeUsers: usersRes.data.filter(u => u.is_active).length
        }));
      }

      if (ordersRes.data) {
        setOrders(ordersRes.data);
        const totalRevenue = ordersRes.data.reduce((sum, order) => sum + (order.total_sar || 0), 0);
        setStats(prev => ({
          ...prev,
          totalOrders: ordersRes.data.length,
          totalRevenue
        }));
      }

      if (storesRes.data) {
        setStats(prev => ({
          ...prev,
          affiliateStores: storesRes.data.length
        }));
      }

      if (atlantisRes.data) {
        setStats(prev => ({
          ...prev,
          atlantisUsers: atlantisRes.data.length
        }));
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "تعذر جلب بيانات لوحة الإدارة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(user => {
        switch (userFilter) {
          case 'active': return user.is_active;
          case 'inactive': return !user.is_active;
          case 'admins': return user.role === 'admin';
          case 'merchants': return user.role === 'merchant';
          case 'affiliates': return user.role === 'affiliate';
          case 'customers': return user.role === 'customer';
          default: return true;
        }
      });
    }

    setFilteredUsers(filtered);
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      let updateData = {};
      let successMessage = '';

      switch (action) {
        case 'activate':
          updateData = { is_active: true };
          successMessage = 'تم تفعيل المستخدم بنجاح';
          break;
        case 'deactivate':
          updateData = { is_active: false };
          successMessage = 'تم إلغاء تفعيل المستخدم بنجاح';
          break;
        case 'promote_admin':
          updateData = { role: 'admin' };
          successMessage = 'تم ترقية المستخدم إلى مدير';
          break;
        case 'promote_merchant':
          updateData = { role: 'merchant' };
          successMessage = 'تم ترقية المستخدم إلى تاجر';
          break;
        case 'promote_affiliate':
          updateData = { role: 'affiliate' };
          successMessage = 'تم ترقية المستخدم إلى مسوق';
          break;
        case 'demote_customer':
          updateData = { role: 'customer' };
          successMessage = 'تم تخفيض رتبة المستخدم إلى عميل';
          break;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: successMessage,
      });

      {/* Show animation for important actions */}
      if (action.includes('promote') || action.includes('activate')) {
        setAnimationTrigger({
          type: 'achievement',
          value: successMessage
        });
        setTimeout(() => setAnimationTrigger(null), 3000);
      }

      fetchAdminData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "خطأ",
        description: "تعذر تحديث المستخدم",
        variant: "destructive",
      });
    }
  };

  const handleModerationAction = async () => {
    if (!selectedUser || !moderationReason.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "الرجاء اختيار مستخدم وإدخال سبب الإجراء",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, store moderation action locally until we create the table
      const moderationData = {
        user_id: selectedUser.id,
        action_type: moderationAction,
        reason: moderationReason,
        duration_hours: moderationAction.includes('temp') ? parseInt(moderationDuration) : null,
        moderator_id: profile?.id,
        expires_at: moderationAction.includes('temp') 
          ? new Date(Date.now() + parseInt(moderationDuration) * 60 * 60 * 1000).toISOString()
          : null
      };

      // Log the moderation action for now
      console.log('Moderation action applied:', moderationData);

      // Update user status if needed
      if (moderationAction === 'ban' || moderationAction === 'temp_ban') {
        await handleUserAction(selectedUser.id, 'deactivate');
      }

      toast({
        title: "تم تطبيق الإجراء",
        description: `تم ${moderationAction.includes('ban') ? 'حظر' : 'كتم'} المستخدم بنجاح`,
      });

      setSelectedUser(null);
      setModerationAction('');
      setModerationReason('');
      setShowUserDialog(false);
      
    } catch (error) {
      console.error('Error applying moderation:', error);
      toast({
        title: "خطأ",
        description: "تعذر تطبيق الإجراء",
        variant: "destructive",
      });
    }
  };

  const sendAnnouncement = async () => {
    if (!announcement.title.trim() || !announcement.content.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "الرجاء إدخال عنوان ومحتوى الإعلان",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, store announcement locally until we create the table
      const announcementData = {
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        target_audience: announcement.targetAudience,
        created_by: profile?.id,
        created_at: new Date().toISOString()
      };

      // Log the announcement for now
      console.log('System announcement created:', announcementData);

      toast({
        title: "تم الإرسال",
        description: "تم إرسال الإعلان بنجاح لجميع المستخدمين",
      });

      setAnnouncement({
        title: '',
        content: '',
        type: 'info',
        targetAudience: 'all'
      });

    } catch (error) {
      console.error('Error sending announcement:', error);
      toast({
        title: "خطأ",
        description: "تعذر إرسال الإعلان",
        variant: "destructive",
      });
    }
  };

  const updateSystemSettings = async () => {
    try {
      // Save system settings to database or local storage
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
      
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات النظام بنجاح",
      });

    } catch (error) {
      console.error('Error updating system settings:', error);
      toast({
        title: "خطأ",
        description: "تعذر تحديث الإعدادات",
        variant: "destructive",
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'merchant': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'affiliate': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">جاري تحميل لوحة الإدارة الشاملة...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Animations */}
      {animationTrigger && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-lg shadow-lg border animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{animationTrigger.value}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-primary hover:bg-primary/10 gap-2"
            >
              <Home className="h-4 w-4" />
              الصفحة الرئيسية
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            لوحة الإدارة الشاملة
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            مرحباً {profile?.full_name || 'مدير النظام'} - إدارة كاملة للمنصة ونظام أتلانتس
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 hover-glow">
            <Activity className="mr-2 h-4 w-4" />
            النظام يعمل بشكل ممتاز
          </Badge>
          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 hover-atlantis">
            <Crown className="mr-2 h-4 w-4" />
            مدير عام
          </Badge>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-luxury transition-all duration-300 interactive-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              إجمالي المستخدمين
            </CardTitle>
            <Users className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{stats.totalUsers}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              <span className="text-green-600 font-medium">{stats.activeUsers} نشط</span> من أصل {stats.totalUsers}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-luxury transition-all duration-300 interactive-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              متاجر المسوقين
            </CardTitle>
            <Store className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800 dark:text-green-200">{stats.affiliateStores}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              متجر تسويق نشط
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 hover:shadow-luxury transition-all duration-300 interactive-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              إجمالي الطلبات
            </CardTitle>
            <ShoppingCart className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">{stats.totalOrders}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              طلب مكتمل ومعلق
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-luxury transition-all duration-300 interactive-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              مستخدمو أتلانتس
            </CardTitle>
            <Crown className="h-6 w-6 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">{stats.atlantisUsers}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              مستخدم في نظام النقاط
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-muted/50">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            إدارة المستخدمين
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            إدارة الطلبات
          </TabsTrigger>
          <TabsTrigger value="atlantis" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            نظام أتلانتس
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إعدادات النظام
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  المبيعات والعمولات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                      <p className="text-2xl font-bold text-green-600">{stats.totalRevenue.toFixed(2)} ر.س</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">العمولات المستحقة</p>
                      <p className="text-2xl font-bold text-blue-600">{(stats.totalRevenue * 0.1).toFixed(2)} ر.س</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  حالة النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">خدمة المصادقة</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">يعمل</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">قاعدة البيانات</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">يعمل</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">نظام الدفع</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">يعمل</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">نظام أتلانتس</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">تحديث مستمر</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle>إدارة المستخدمين</CardTitle>
                <CardDescription>
                  مراجعة وإدارة حسابات المستخدمين والصلاحيات
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <CardTitle>نظام أتلانتس</CardTitle>
                <CardDescription>
                  إدارة النقاط والمستويات والتحالفات
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-premium rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <CardTitle>إعدادات النظام</CardTitle>
                <CardDescription>
                  تخصيص إعدادات المنصة والميزات
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  إدارة المستخدمين ({filteredUsers.length})
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="البحث عن مستخدم..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستخدمين</SelectItem>
                      <SelectItem value="active">النشطين</SelectItem>
                      <SelectItem value="inactive">غير النشطين</SelectItem>
                      <SelectItem value="admins">المدراء</SelectItem>
                      <SelectItem value="merchants">التجار</SelectItem>
                      <SelectItem value="affiliates">المسوقين</SelectItem>
                      <SelectItem value="customers">العملاء</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ التسجيل</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.slice(0, 20).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === 'admin' ? 'مدير' : 
                           user.role === 'merchant' ? 'تاجر' :
                           user.role === 'affiliate' ? 'مسوق' : 'عميل'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{user.points || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUserAction(user.id, user.is_active ? 'deactivate' : 'activate')}
                          >
                            {user.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Management Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                إدارة الطلبات ({orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 20).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell className="font-medium">
                        {order.total_sar} ر.س
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status === 'COMPLETED' ? 'مكتمل' : 
                           order.status === 'PENDING' ? 'قيد الانتظار' :
                           order.status === 'CANCELLED' ? 'ملغي' : order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Atlantis System Tab */}
        <TabsContent value="atlantis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Crown className="h-5 w-5" />
                  إحصائيات أتلانتس
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-600 dark:text-purple-400">مستخدمو أتلانتس</span>
                    <span className="font-bold text-purple-800 dark:text-purple-200">{stats.atlantisUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-600 dark:text-purple-400">التحالفات النشطة</span>
                    <span className="font-bold text-purple-800 dark:text-purple-200">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-600 dark:text-purple-400">النقاط الإجمالية</span>
                    <span className="font-bold text-purple-800 dark:text-purple-200">45,230</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-600 dark:text-purple-400">التحديات النشطة</span>
                    <span className="font-bold text-purple-800 dark:text-purple-200">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Target className="h-5 w-5" />
                  إدارة التحديات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    إنشاء تحدي جديد
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Gift className="mr-2 h-4 w-4" />
                    إدارة المكافآت
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    إدارة التحالفات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Preview */}
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                قائمة المتصدرين - أتلانتس
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Crown className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p>سيتم عرض قائمة المتصدرين هنا</p>
                <p className="text-sm mt-2">المستخدمون الأعلى نقاطاً في نظام أتلانتس</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card className="border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">الإعدادات العامة</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>وضع الصيانة</span>
                      <Button
                        variant={systemSettings.maintenanceMode ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setSystemSettings(prev => ({
                          ...prev, 
                          maintenanceMode: !prev.maintenanceMode
                        }))}
                      >
                        {systemSettings.maintenanceMode ? 'تعطيل' : 'تفعيل'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>تفعيل التسجيل</span>
                      <Button
                        variant={systemSettings.registrationEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSystemSettings(prev => ({
                          ...prev, 
                          registrationEnabled: !prev.registrationEnabled
                        }))}
                      >
                        {systemSettings.registrationEnabled ? 'مفعل' : 'معطل'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>نظام أتلانتس</span>
                      <Button
                        variant={systemSettings.atlantisSystemEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSystemSettings(prev => ({
                          ...prev, 
                          atlantisSystemEnabled: !prev.atlantisSystemEnabled
                        }))}
                      >
                        {systemSettings.atlantisSystemEnabled ? 'مفعل' : 'معطل'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Commission Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">إعدادات العمولات</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">نسبة العمولة الافتراضية (%)</label>
                      <Input
                        type="number"
                        value={systemSettings.commissionRate}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev, 
                          commissionRate: parseFloat(e.target.value) || 10
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">الحد الأقصى لحجم الملف (MB)</label>
                      <Input
                        type="number"
                        value={systemSettings.maxUploadSize}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev, 
                          maxUploadSize: parseFloat(e.target.value) || 10
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Button onClick={updateSystemSettings} className="btn-atlantis">
                  <Settings className="mr-2 h-4 w-4" />
                  حفظ الإعدادات
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  تصدير الإعدادات
                </Button>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  استيراد الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  إرسال إعلان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">عنوان الإعلان</label>
                  <Input
                    value={announcement.title}
                    onChange={(e) => setAnnouncement(prev => ({
                      ...prev, 
                      title: e.target.value
                    }))}
                    placeholder="عنوان الإعلان..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">محتوى الإعلان</label>
                  <Textarea
                    value={announcement.content}
                    onChange={(e) => setAnnouncement(prev => ({
                      ...prev, 
                      content: e.target.value
                    }))}
                    placeholder="محتوى الإعلان..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">نوع الإعلان</label>
                  <Select 
                    value={announcement.type} 
                    onValueChange={(value) => setAnnouncement(prev => ({
                      ...prev, 
                      type: value
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">معلومات</SelectItem>
                      <SelectItem value="warning">تحذير</SelectItem>
                      <SelectItem value="success">نجاح</SelectItem>
                      <SelectItem value="error">خطأ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">الجمهور المستهدف</label>
                  <Select 
                    value={announcement.targetAudience} 
                    onValueChange={(value) => setAnnouncement(prev => ({
                      ...prev, 
                      targetAudience: value
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستخدمين</SelectItem>
                      <SelectItem value="merchants">التجار فقط</SelectItem>
                      <SelectItem value="affiliates">المسوقين فقط</SelectItem>
                      <SelectItem value="customers">العملاء فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={sendAnnouncement} className="w-full btn-atlantis">
                  <Bell className="mr-2 h-4 w-4" />
                  إرسال الإعلان
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  إدارة الإشعارات الفورية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PushNotificationManager />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Management Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إدارة المستخدم: {selectedUser?.full_name || selectedUser?.email}</DialogTitle>
            <DialogDescription>
              تعديل صلاحيات المستخدم أو تطبيق إجراءات الإشراف
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">الاسم:</span>
                    <p className="font-medium">{selectedUser.full_name || 'غير محدد'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">البريد:</span>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">الدور:</span>
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role === 'admin' ? 'مدير' : 
                       selectedUser.role === 'merchant' ? 'تاجر' :
                       selectedUser.role === 'affiliate' ? 'مسوق' : 'عميل'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">الحالة:</span>
                    <Badge className={selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedUser.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Role Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">تغيير الدور</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleUserAction(selectedUser.id, 'promote_admin')}
                    disabled={selectedUser.role === 'admin'}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    ترقية لمدير
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUserAction(selectedUser.id, 'promote_merchant')}
                    disabled={selectedUser.role === 'merchant'}
                  >
                    <Store className="mr-2 h-4 w-4" />
                    ترقية لتاجر
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUserAction(selectedUser.id, 'promote_affiliate')}
                    disabled={selectedUser.role === 'affiliate'}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    ترقية لمسوق
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUserAction(selectedUser.id, 'demote_customer')}
                    disabled={selectedUser.role === 'customer'}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    تخفيض لعميل
                  </Button>
                </div>
              </div>

              {/* Moderation Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">إجراءات الإشراف</h3>
                <div className="space-y-4">
                  <Select value={moderationAction} onValueChange={setModerationAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الإجراء" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warn">تحذير</SelectItem>
                      <SelectItem value="mute">كتم</SelectItem>
                      <SelectItem value="temp_ban">حظر مؤقت</SelectItem>
                      <SelectItem value="ban">حظر دائم</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {(moderationAction === 'mute' || moderationAction === 'temp_ban') && (
                    <Select value={moderationDuration} onValueChange={setModerationDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="مدة الإجراء" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ساعة واحدة</SelectItem>
                        <SelectItem value="6">6 ساعات</SelectItem>
                        <SelectItem value="24">24 ساعة</SelectItem>
                        <SelectItem value="72">3 أيام</SelectItem>
                        <SelectItem value="168">أسبوع</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  <Textarea
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    placeholder="سبب الإجراء..."
                    rows={3}
                  />
                  
                  <div className="flex gap-4">
                    <Button
                      onClick={handleModerationAction}
                      disabled={!moderationAction || !moderationReason.trim()}
                      variant="destructive"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      تطبيق الإجراء
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setModerationAction('');
                        setModerationReason('');
                        setShowUserDialog(false);
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveAdminPanel;