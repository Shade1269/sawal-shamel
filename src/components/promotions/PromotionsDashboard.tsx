import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Package, 
  Calendar, 
  TrendingUp, 
  Percent,
  Gift,
  Target
} from 'lucide-react';

import { FlashSaleCreator } from './FlashSaleCreator';
import { BundleOfferCreator } from './BundleOfferCreator';
import { SeasonalCampaignManager } from './SeasonalCampaignManager';
import { CustomerSegmentBuilder } from './CustomerSegmentBuilder';
import { CountdownTimer } from './CountdownTimer';
import { usePromotionCampaigns, useBundleOffers } from '@/hooks/usePromotionCampaigns';

export const PromotionsDashboard: React.FC = () => {
  const { campaigns } = usePromotionCampaigns();
  const { bundles } = useBundleOffers();
  const [activeTab, setActiveTab] = useState('overview');

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const draftCampaigns = campaigns.filter(c => c.status === 'draft');

  const stats = [
    {
      title: 'الحملات النشطة',
      value: activeCampaigns.length,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'الحملات المجدولة',
      value: draftCampaigns.length,
      icon: Calendar,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'عروض المجموعات',
      value: bundles.length,
      icon: Package,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'إجمالي التوفير',
      value: '15%',
      icon: Percent,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة إدارة الترويج</h1>
          <p className="text-muted-foreground mt-2">
            إدارة شاملة للحملات الترويجية والعروض الخاصة
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          المرحلة 2.2 - الترويج المتقدم
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Campaigns Preview */}
      {activeCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              الحملات النشطة الآن
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.slice(0, 3).map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 gradient-card-primary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Gift className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {campaign.campaign_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        تخفيض {campaign.discount_value}
                        {campaign.discount_type === 'percentage' ? '%' : ' ر.س'}
                      </p>
                    </div>
                  </div>
                  <CountdownTimer
                    endDate={campaign.end_date}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="flash-sales" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            التخفيضات السريعة
          </TabsTrigger>
          <TabsTrigger value="bundles" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            عروض المجموعات
          </TabsTrigger>
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            الحملات الموسمية
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            شرائح العملاء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أحدث الحملات</CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns.length > 0 ? (
                  <div className="space-y-3">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h5 className="font-medium">{campaign.campaign_name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {campaign.campaign_type === 'flash_sale' && 'تخفيض سريع'}
                            {campaign.campaign_type === 'seasonal' && 'حملة موسمية'}
                            {campaign.campaign_type === 'bundle' && 'عرض مجمع'}
                          </p>
                        </div>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status === 'active' ? 'نشط' : 'مسودة'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد حملات ترويجية حتى الآن</p>
                    <p className="text-sm">ابدأ بإنشاء أول حملة ترويجية لك</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الإحصائيات السريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">معدل التحويل</span>
                    <span className="font-semibold">12.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">متوسط قيمة الطلب</span>
                    <span className="font-semibold">285 ر.س</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">العملاء المستفيدون</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">إجمالي التوفير</span>
                    <span className="font-semibold text-success">15,430 ر.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flash-sales">
          <FlashSaleCreator />
        </TabsContent>

        <TabsContent value="bundles">
          <BundleOfferCreator />
        </TabsContent>

        <TabsContent value="seasonal">
          <SeasonalCampaignManager />
        </TabsContent>

        <TabsContent value="segments">
          <CustomerSegmentBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
};