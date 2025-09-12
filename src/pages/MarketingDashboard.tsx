import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SocialMediaManager from '@/components/marketing/SocialMediaManager';
import EmailCampaignManager from '@/components/marketing/EmailCampaignManager';
import CouponManager from '@/components/marketing/CouponManager';
import LoyaltyProgram from '@/components/marketing/LoyaltyProgram';
import { 
  Share2, 
  Mail, 
  Ticket, 
  Trophy, 
  TrendingUp, 
  Users, 
  DollarSign,
  Star
} from 'lucide-react';

const MarketingDashboard = () => {
  const stats = [
    {
      title: 'إجمالي الحملات',
      value: '24',
      change: '+12%',
      icon: TrendingUp,
      color: 'text-primary'
    },
    {
      title: 'عدد المشتركين',
      value: '1,847',
      change: '+23%',
      icon: Users,
      color: 'text-turquoise'
    },
    {
      title: 'معدل التحويل',
      value: '3.2%',
      change: '+0.8%',
      icon: DollarSign,
      color: 'text-premium'
    },
    {
      title: 'نقاط الولاء',
      value: '12,543',
      change: '+156',
      icon: Star,
      color: 'text-persian'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-persian-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-persian bg-clip-text text-transparent">
            مركز التسويق الذكي
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            إدارة شاملة لحملاتك التسويقية ووسائل التواصل الاجتماعي وبرامج الولاء
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-0 shadow-elegant">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-primary">
                    {stat.change} من الشهر الماضي
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="social" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              التواصل الاجتماعي
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              حملات البريد
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              الكوبونات
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              برنامج الولاء
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="space-y-6">
            <SocialMediaManager />
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <EmailCampaignManager />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <CouponManager />
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            <LoyaltyProgram />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MarketingDashboard;