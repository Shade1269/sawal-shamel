import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Clock,
  MousePointer,
  Eye,
  Navigation,
  BarChart3,
  Users,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  Download,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFastAuth } from '@/hooks/useFastAuth';

interface ActivitySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // بالثواني
  pageViews: number;
  clicks: number;
  scrollDepth: number; // نسبة مئوية
  bounceRate: number;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location?: string;
  referrer?: string;
}

interface UserBehavior {
  totalSessions: number;
  totalTime: number; // بالثواني
  averageSessionDuration: number;
  totalPageViews: number;
  averagePageViews: number;
  clickThroughRate: number;
  averageScrollDepth: number;
  bounceRate: number;
  mostVisitedPages: { page: string; visits: number }[];
  mostActiveHours: { hour: number; activity: number }[];
  devicePreference: Record<string, number>;
  engagementScore: number;
}

interface RealTimeMetrics {
  currentUsers: number;
  pageViews: number;
  uniqueVisitors: number;
  averageSessionTime: number;
  conversionRate: number;
  topPages: { page: string; views: number }[];
  userFlow: { from: string; to: string; count: number }[];
}

export function UserActivityTracker() {
  const [currentSession, setCurrentSession] = useState<ActivitySession | null>(null);
  const [behavior, setBehavior] = useState<UserBehavior | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  const { profile } = useFastAuth();
  const sessionStartRef = useRef<Date>(new Date());
  const pageViewsRef = useRef<number>(0);
  const clicksRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);

  // بدء جلسة جديدة
  useEffect(() => {
    if (!isTracking || !profile) return;

    const session: ActivitySession = {
      id: `session_${Date.now()}`,
      startTime: sessionStartRef.current,
      duration: 0,
      pageViews: 1,
      clicks: 0,
      scrollDepth: 0,
      bounceRate: 0,
      deviceType: getDeviceType(),
      browser: getBrowserInfo(),
      location: 'Saudi Arabia', // يمكن الحصول عليها من IP
      referrer: document.referrer || 'Direct'
    };

    setCurrentSession(session);

    // تحديث الجلسة كل ثانية
    const sessionInterval = setInterval(() => {
      setCurrentSession(prev => {
        if (!prev) return null;
        
        const now = new Date();
        const duration = Math.floor((now.getTime() - prev.startTime.getTime()) / 1000);
        
        return {
          ...prev,
          duration,
          pageViews: pageViewsRef.current,
          clicks: clicksRef.current,
          scrollDepth: maxScrollRef.current
        };
      });
    }, 1000);

    return () => clearInterval(sessionInterval);
  }, [isTracking, profile]);

  // تتبع تغييرات الصفحة
  useEffect(() => {
    const handleLocationChange = () => {
      pageViewsRef.current += 1;
      maxScrollRef.current = 0; // إعادة تعيين التمرير للصفحة الجديدة
    };

    // تتبع التغييرات في history API
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // تتبع النقرات
  useEffect(() => {
    if (!isTracking) return;

    const handleClick = (event: MouseEvent) => {
      clicksRef.current += 1;
      
      // تتبع نوع العنصر المنقور
      const target = event.target as HTMLElement;
      const elementType = target.tagName.toLowerCase();
      const elementClass = target.className;
      const elementId = target.id;
      
      // يمكن إرسال هذه البيانات لخادم التحليلات
      console.log('Click tracked:', {
        elementType,
        elementClass,
        elementId,
        timestamp: new Date(),
        coordinates: { x: event.clientX, y: event.clientY }
      });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isTracking]);

  // تتبع التمرير
  useEffect(() => {
    if (!isTracking) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTracking]);

  // محاكاة بيانات السلوك
  useEffect(() => {
    // في التطبيق الحقيقي، سيتم جلب هذه البيانات من قاعدة البيانات
    const mockBehavior: UserBehavior = {
      totalSessions: 45,
      totalTime: 18720, // 5.2 ساعة
      averageSessionDuration: 416, // ~7 دقائق
      totalPageViews: 234,
      averagePageViews: 5.2,
      clickThroughRate: 12.5,
      averageScrollDepth: 68.5,
      bounceRate: 32.1,
      mostVisitedPages: [
        { page: '/affiliate', visits: 89 },
        { page: '/affiliate/storefront', visits: 67 },
        { page: '/affiliate/orders', visits: 45 },
        { page: '/affiliate/analytics', visits: 33 }
      ],
      mostActiveHours: [
        { hour: 9, activity: 85 },
        { hour: 14, activity: 92 },
        { hour: 16, activity: 78 },
        { hour: 20, activity: 65 }
      ],
      devicePreference: {
        desktop: 68,
        mobile: 28,
        tablet: 4
      },
      engagementScore: 78
    };

    setBehavior(mockBehavior);

    // محاكاة البيانات الفورية
    const mockRealTime: RealTimeMetrics = {
      currentUsers: 1247,
      pageViews: 3456,
      uniqueVisitors: 892,
      averageSessionTime: 387,
      conversionRate: 4.2,
      topPages: [
        { page: '/affiliate', views: 456 },
        { page: '/affiliate/storefront', views: 234 },
        { page: '/affiliate/orders', views: 189 }
      ],
      userFlow: [
        { from: '/affiliate', to: '/affiliate/storefront', count: 45 },
        { from: '/affiliate/storefront', to: '/affiliate/orders', count: 23 },
        { from: '/affiliate', to: '/affiliate/analytics', count: 18 }
      ]
    };

    setRealTimeMetrics(mockRealTime);
  }, [selectedPeriod]);

  // helper functions
  const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const getBrowserInfo = (): string => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}س ${minutes}د ${secs}ث`;
    } else if (minutes > 0) {
      return `${minutes}د ${secs}ث`;
    } else {
      return `${secs}ث`;
    }
  };

  const getEngagementLevel = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'ممتاز', color: 'text-green-500' };
    if (score >= 60) return { label: 'جيد', color: 'text-blue-500' };
    if (score >= 40) return { label: 'متوسط', color: 'text-yellow-500' };
    return { label: 'ضعيف', color: 'text-red-500' };
  };

  const exportData = () => {
    const data = {
      currentSession,
      behavior,
      realTimeMetrics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!behavior || !realTimeMetrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p>جاري تحميل بيانات النشاط...</p>
        </div>
      </div>
    );
  }

  const engagement = getEngagementLevel(behavior.engagementScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Activity className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">تتبع نشاط المستخدم</h1>
            <p className="text-muted-foreground">مراقبة وتحليل سلوك المستخدمين</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${engagement.color}`}>
            <Target className="h-3 w-3 mr-1" />
            {engagement.label}
          </Badge>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsTracking(!isTracking)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isTracking ? 'إيقاف التتبع' : 'بدء التتبع'}
          </Button>
        </div>
      </motion.div>

      {/* Current Session */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                الجلسة الحالية
                <Badge variant="secondary" className="ml-2">
                  {isTracking ? 'نشط' : 'متوقف'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{formatDuration(currentSession.duration)}</div>
                  <div className="text-sm text-muted-foreground">مدة الجلسة</div>
                </div>
                <div className="text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{currentSession.pageViews}</div>
                  <div className="text-sm text-muted-foreground">مشاهدات الصفحة</div>
                </div>
                <div className="text-center">
                  <MousePointer className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{currentSession.clicks}</div>
                  <div className="text-sm text-muted-foreground">النقرات</div>
                </div>
                <div className="text-center">
                  <Navigation className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">{Math.round(currentSession.scrollDepth)}%</div>
                  <div className="text-sm text-muted-foreground">عمق التمرير</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="behavior">السلوك</TabsTrigger>
            <TabsTrigger value="realtime">فوري</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="today">اليوم</option>
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="quarter">ربع سنة</option>
            </select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'إجمالي الجلسات',
                value: behavior.totalSessions.toLocaleString(),
                icon: Users,
                color: 'text-blue-500',
                change: '+12%'
              },
              {
                title: 'إجمالي الوقت',
                value: formatDuration(behavior.totalTime),
                icon: Clock,
                color: 'text-green-500',
                change: '+8%'
              },
              {
                title: 'متوسط مدة الجلسة',
                value: formatDuration(behavior.averageSessionDuration),
                icon: Activity,
                color: 'text-purple-500',
                change: '+5%'
              },
              {
                title: 'نقاط المشاركة',
                value: behavior.engagementScore,
                icon: Target,
                color: engagement.color.replace('text-', ''),
                change: '+15%'
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.title}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {metric.change}
                        </Badge>
                      </div>
                      <metric.icon className={`h-8 w-8 ${metric.color}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Engagement Score */}
          <Card>
            <CardHeader>
              <CardTitle>نقاط المشاركة</CardTitle>
              <CardDescription>تقييم شامل لمدى تفاعل المستخدم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">النقاط الإجمالية</span>
                  <span className={`text-2xl font-bold ${engagement.color}`}>
                    {behavior.engagementScore}/100
                  </span>
                </div>
                <Progress value={behavior.engagementScore} className="h-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">متوسط الجلسة:</span>
                    <span className="font-medium ml-1">
                      {formatDuration(behavior.averageSessionDuration)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">معدل الارتداد:</span>
                    <span className="font-medium ml-1">{behavior.bounceRate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">عمق التمرير:</span>
                    <span className="font-medium ml-1">{behavior.averageScrollDepth}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">معدل النقر:</span>
                    <span className="font-medium ml-1">{behavior.clickThroughRate}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Visited Pages */}
            <Card>
              <CardHeader>
                <CardTitle>الصفحات الأكثر زيارة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {behavior.mostVisitedPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{page.page}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {page.visits} زيارة
                      </span>
                      <Progress 
                        value={(page.visits / behavior.mostVisitedPages[0].visits) * 100} 
                        className="w-16 h-2" 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Device Preference */}
            <Card>
              <CardHeader>
                <CardTitle>تفضيل الأجهزة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(behavior.devicePreference).map(([device, percentage]) => {
                  const icons = {
                    desktop: Monitor,
                    mobile: Smartphone,
                    tablet: Smartphone
                  };
                  const Icon = icons[device as keyof typeof icons];
                  
                  return (
                    <div key={device} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="capitalize">{device}</span>
                        </div>
                        <span className="font-medium">{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Active Hours */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>الساعات الأكثر نشاطاً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-2">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const activity = behavior.mostActiveHours.find(h => h.hour === hour);
                    const intensity = activity ? activity.activity : 0;
                    
                    return (
                      <div key={hour} className="text-center">
                        <div 
                          className="bg-primary rounded-sm mb-2 transition-all hover:bg-primary/80"
                          style={{ 
                            height: `${Math.max(4, (intensity / 100) * 40)}px`,
                            opacity: intensity / 100 
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {hour.toString().padStart(2, '0')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          {/* Real-time Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                title: 'المستخدمون الحاليون',
                value: realTimeMetrics.currentUsers.toLocaleString(),
                icon: Users,
                color: 'text-green-500'
              },
              {
                title: 'مشاهدات الصفحة',
                value: realTimeMetrics.pageViews.toLocaleString(),
                icon: Eye,
                color: 'text-blue-500'
              },
              {
                title: 'زوار فريدون',
                value: realTimeMetrics.uniqueVisitors.toLocaleString(),
                icon: Globe,
                color: 'text-purple-500'
              },
              {
                title: 'متوسط الجلسة',
                value: formatDuration(realTimeMetrics.averageSessionTime),
                icon: Clock,
                color: 'text-orange-500'
              },
              {
                title: 'معدل التحويل',
                value: `${realTimeMetrics.conversionRate}%`,
                icon: TrendingUp,
                color: 'text-red-500'
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4 text-center">
                    <metric.icon className={`h-6 w-6 mx-auto mb-2 ${metric.color}`} />
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">{metric.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Real-time Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                النشاط المباشر
              </CardTitle>
              <CardDescription>
                تحديث كل ثانية - المستخدمون النشطون: {realTimeMetrics.currentUsers}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">الصفحات الأكثر مشاهدة</h4>
                    <div className="space-y-2">
                      {realTimeMetrics.topPages.map((page, index) => (
                        <div key={page.page} className="flex items-center justify-between">
                          <span className="text-sm">{page.page}</span>
                          <Badge variant="secondary">{page.views}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">مسار المستخدمين</h4>
                    <div className="space-y-2">
                      {realTimeMetrics.userFlow.map((flow, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span>{flow.from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span>{flow.to}</span>
                          <Badge variant="outline" className="ml-auto">
                            {flow.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}