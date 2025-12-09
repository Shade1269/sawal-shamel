import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Users, 
  Award,
  Target,
  Zap,
  Bell,
  Settings,
  BarChart3,
  Activity,
  Crown,
  Star,
  Gift,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFastAuth } from '@/hooks/useFastAuth';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
/* eslint-disable @typescript-eslint/no-unused-vars */
import StatsOverview, { getDashboardStats, getInventoryStats } from './StatsOverview';
import QuickActionPanel, { getAdminActions, getAffiliateActions, getCustomerActions } from './QuickActionPanel';
import ActivityFeed, { generateSampleActivities } from './ActivityFeed';
/* eslint-enable @typescript-eslint/no-unused-vars */

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  reward: string;
}

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isAuthenticated } = useFastAuth();
  const { userLevel, userAlliance } = useAtlantisSystem();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any[]>([]);
  const [_activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.role) {
      setQuickActions(getQuickActionsForRole(profile.role));
      setAchievements(getAchievementsForUser());
      setDashboardStats(getStatsForRole(profile.role));
      setActivities(generateSampleActivities());
    }
  }, [profile]);

  const getStatsForRole = (role: string) => {
    switch (role) {
      case 'admin':
        return getDashboardStats();
      case 'affiliate':
      case 'merchant':
        return getInventoryStats();
      default:
        return getDashboardStats();
    }
  };

  const getQuickActionsForRole = (role: string) => {
    const baseActions: QuickAction[] = [
      {
        id: 'profile',
        title: 'تحديث الملف الشخصي',
        description: 'تحديث بياناتك الشخصية والصورة',
        icon: <Settings className="w-5 h-5" />,
        onClick: () => navigate('/profile')
      },
      {
        id: 'chat',
        title: 'أتلانتس شات',
        description: 'انضم للدردشة التفاعلية',
        icon: <MessageSquare className="w-5 h-5" />,
        onClick: () => navigate('/chat')
      }
    ];

    const roleActions: Record<string, QuickAction[]> = {
      affiliate: [
        {
          id: 'store',
          title: 'متجري التابع',
          description: 'إدارة متجرك التابع',
          icon: <Award className="w-5 h-5" />,
          onClick: () => navigate('/affiliate')
        }
      ],
      admin: [
        {
          id: 'admin',
          title: 'لوحة الإدارة',
          description: 'إدارة النظام والمستخدمين',
          icon: <Crown className="w-5 h-5" />,
          onClick: () => navigate('/admin/dashboard')
        }
      ]
    };

    const normalizedRole = role === 'merchant' ? 'affiliate' : role;

    return [...baseActions, ...(roleActions[normalizedRole] || [])];
  };

  const getAchievementsForUser = (): Achievement[] => {
    return [
      {
        id: 'first_sale',
        title: 'أول عملية بيع',
        description: 'أتمم أول عملية بيع ناجحة',
        icon: <Target className="w-4 h-4" />,
        progress: 1,
        maxProgress: 1,
        reward: '100 نقطة'
      },
      {
        id: 'level_up',
        title: 'ارتقاء المستوى',
        description: 'اوصل للمستوى الفضي',
        icon: <Star className="w-4 h-4" />,
        progress: userLevel?.total_points || 0,
        maxProgress: 1000,
        reward: 'مستوى فضي'
      },
      {
        id: 'alliance_member',
        title: 'عضو تحالف',
        description: 'انضم لتحالف نشط',
        icon: <Users className="w-4 h-4" />,
        progress: userAlliance ? 1 : 0,
        maxProgress: 1,
        reward: '50 نقطة'
      }
    ];
  };

  const _stats = [
    {
      title: 'النقاط الإجمالية',
      value: userLevel?.total_points || 0,
      change: '+12%',
      icon: <Zap className="w-4 h-4" />
    },
    {
      title: 'المستوى الحالي',
      value: userLevel?.current_level || 'برونزي',
      change: '',
      icon: <Award className="w-4 h-4" />
    },
    {
      title: 'العمليات اليوم',
      value: 5,
      change: '+8%',
      icon: <Activity className="w-4 h-4" />
    },
    {
      title: 'نشاط الأسبوع',
      value: '85%',
      change: '+5%',
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p>يرجى تسجيل الدخول لعرض لوحة التحكم</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 border-4 border-primary">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? undefined} />
            <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
              {profile?.full_name?.charAt(0) || 'ن'}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-2xl font-bold">مرحباً، {profile?.full_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="gap-1">
                <Crown className="w-3 h-3" />
                {userLevel?.current_level || 'برونزي'}
              </Badge>
              {userAlliance && (
                <Badge variant="outline">
                  تحالف {userAlliance.name}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
          </Button>
          <Button size="sm" className="bg-primary">
            <Settings className="w-4 h-4 mr-2" />
            الإعدادات
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {stat.icon}
                </div>
                {stat.change && (
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="actions">إجراءات سريعة</TabsTrigger>
            <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
            <TabsTrigger value="activity">النشاط</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Level Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    تقدم المستوى
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">المستوى الحالي</span>
                    <Badge>{userLevel?.current_level || 'برونزي'}</Badge>
                  </div>
                  <Progress 
                    value={((userLevel?.level_points || 0) / (userLevel?.next_level_threshold || 1)) * 100}
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{userLevel?.level_points || 0} نقطة</span>
                    <span>{userLevel?.next_level_threshold || 0} نقطة للترقية</span>
                  </div>
                </CardContent>
              </Card>

              {/* Alliance Info */}
              {userAlliance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      تحالف {userAlliance.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">عدد الأعضاء</span>
                      <span>{userAlliance.member_count || 0}</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      عرض التحالف
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                    onClick={action.onClick}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                    <Card className={achievement.progress >= achievement.maxProgress ? 'border-success' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className={`p-2 rounded-lg ${
                            achievement.progress >= achievement.maxProgress 
                              ? 'bg-success/10 text-success' 
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        {achievement.progress >= achievement.maxProgress && (
                          <Badge className="bg-success">
                            <Gift className="w-3 h-3 mr-1" />
                            مكتمل
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>التقدم: {achievement.progress}/{achievement.maxProgress}</span>
                          <span className="text-muted-foreground">المكافأة: {achievement.reward}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>النشاط الأخير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-full bg-success/10 text-success">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">تم تسجيل دخولك</p>
                      <p className="text-sm text-muted-foreground">منذ دقائق قليلة</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-full bg-info/10 text-info">
                      <Star className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">حصلت على 10 نقاط</p>
                      <p className="text-sm text-muted-foreground">منذ ساعة</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;