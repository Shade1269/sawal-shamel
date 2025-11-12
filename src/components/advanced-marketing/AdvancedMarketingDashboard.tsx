import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Zap, 
  Brain, 
  Mail, 
  Activity,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';
import { LeadManagementSection } from './LeadManagementSection';
import { MarketingAutomationSection } from './MarketingAutomationSection';
import { BehavioralTriggersSection } from './BehavioralTriggersSection';
import { PredictiveInsightsSection } from './PredictiveInsightsSection';
import { SmartNotificationsSection } from './SmartNotificationsSection';
import { AdvancedAnalyticsSection } from './AdvancedAnalyticsSection';
import { 
  useMarketingCampaigns, 
  useLeadManagement, 
  useBehavioralTriggers, 
  usePredictiveInsights 
} from '@/hooks/useAdvancedMarketing';

export const AdvancedMarketingDashboard: React.FC = () => {
  const { campaigns } = useMarketingCampaigns();
  const { leads } = useLeadManagement();
  const { triggers } = useBehavioralTriggers();
  const { insights } = usePredictiveInsights();

  // إحصائيات سريعة
  const activeCampaigns = campaigns.filter(c => c.is_active).length;
  const qualifiedLeads = leads.filter(l => l.lead_status === 'qualified').length;
  const activeTriggers = triggers.filter(t => t.is_active).length;
  const recentInsights = insights.filter(i => 
    new Date(i.generated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const stats = [
    {
      title: 'الحملات النشطة',
      value: activeCampaigns,
      icon: Target,
      description: 'حملة تسويقية فعالة',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'العملاء المؤهلون',
      value: qualifiedLeads,
      icon: Users,
      description: 'عميل محتمل مؤهل',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'المحفزات النشطة',
      value: activeTriggers,
      icon: Zap,
      description: 'محفز سلوكي فعال',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'رؤى تنبؤية',
      value: recentInsights,
      icon: Brain,
      description: 'رؤية تنبؤية حديثة',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          نظام التسويق المتقدم والأتمتة
        </h1>
        <p className="text-muted-foreground text-lg">
          أدوات ذكية لتحسين استراتيجيات التسويق وزيادة المبيعات
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            إدارة العملاء
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            الأتمتة
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            المحفزات
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            التحليلات التنبؤية
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            التحليلات المتقدمة
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  أحدث الحملات التسويقية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {campaign.campaign_type}
                        </p>
                      </div>
                      <Badge variant={campaign.is_active ? "default" : "secondary"}>
                        {campaign.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  ))}
                  {campaigns.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      لا توجد حملات تسويقية بعد
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Leads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  أهم العملاء المحتملين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leads
                    .sort((a, b) => b.lead_score - a.lead_score)
                    .slice(0, 5)
                    .map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{lead.full_name || lead.email}</h4>
                          <p className="text-sm text-muted-foreground">
                            النقاط: {lead.lead_score}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            lead.interest_level === 'high' ? 'destructive' :
                            lead.interest_level === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {lead.interest_level === 'high' ? 'عالي' :
                           lead.interest_level === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                    ))}
                  {leads.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      لا يوجد عملاء محتملون بعد
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                نظرة عامة على الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {campaigns.reduce((acc, c) => acc + c.stats.sent, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">إجمالي الرسائل المرسلة</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {campaigns.reduce((acc, c) => acc + c.stats.opened, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">الرسائل المفتوحة</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {campaigns.reduce((acc, c) => acc + c.stats.converted, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">التحويلات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs */}
        <TabsContent value="leads">
          <LeadManagementSection />
        </TabsContent>

        <TabsContent value="automation">
          <MarketingAutomationSection />
        </TabsContent>

        <TabsContent value="triggers">
          <BehavioralTriggersSection />
        </TabsContent>

        <TabsContent value="insights">
          <PredictiveInsightsSection />
        </TabsContent>

        <TabsContent value="notifications">
          <SmartNotificationsSection />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedAnalyticsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
