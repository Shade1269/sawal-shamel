import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Mail, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Target,
  Workflow
} from 'lucide-react';
import { useMarketingCampaigns, MarketingCampaign } from '@/hooks/useAdvancedMarketing';

export const MarketingAutomationSection: React.FC = () => {
  const { campaigns, createCampaign, updateCampaign, isCreating, isUpdating } = useMarketingCampaigns();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [newCampaignData, setNewCampaignData] = useState({
    name: '',
    description: '',
    campaign_type: 'email_sequence' as MarketingCampaign['campaign_type'],
    trigger_type: 'event' as MarketingCampaign['trigger_type'],
    trigger_conditions: {},
    target_audience_rules: {},
    campaign_steps: [],
    is_active: false,
  });

  const handleCreateCampaign = async () => {
    try {
      await createCampaign.mutateAsync(newCampaignData);
      setIsDialogOpen(false);
      setNewCampaignData({
        name: '',
        description: '',
        campaign_type: 'email_sequence',
        trigger_type: 'event',
        trigger_conditions: {},
        target_audience_rules: {},
        campaign_steps: [],
        is_active: false,
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleToggleCampaign = async (campaignId: string, isActive: boolean) => {
    try {
      await updateCampaign.mutateAsync({ id: campaignId, is_active: isActive });
    } catch (error) {
      console.error('Error toggling campaign:', error);
    }
  };

  const getCampaignTypeLabel = (type: MarketingCampaign['campaign_type']) => {
    const labels = {
      email_sequence: 'سلسلة بريد إلكتروني',
      abandoned_cart: 'السلة المهجورة',
      post_purchase: 'ما بعد الشراء',
      welcome_series: 'سلسلة الترحيب',
      re_engagement: 'إعادة التفاعل',
      birthday_campaign: 'حملة أعياد الميلاد'
    };
    return labels[type];
  };

  const getTriggerTypeLabel = (type: MarketingCampaign['trigger_type']) => {
    const labels = {
      event: 'حدث',
      time_based: 'وقت محدد',
      behavioral: 'سلوكي',
      manual: 'يدوي'
    };
    return labels[type];
  };

  const getCampaignTypeColor = (type: MarketingCampaign['campaign_type']) => {
    const colors = {
      email_sequence: 'bg-info/10 text-info',
      abandoned_cart: 'bg-warning/10 text-warning',
      post_purchase: 'bg-success/10 text-success',
      welcome_series: 'bg-premium/10 text-premium',
      re_engagement: 'bg-warning/10 text-warning',
      birthday_campaign: 'bg-primary/10 text-primary'
    };
    return colors[type];
  };

  // إحصائيات الحملات
  const campaignStats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.is_active).length,
    totalSent: campaigns.reduce((acc, c) => acc + c.stats.sent, 0),
    totalOpened: campaigns.reduce((acc, c) => acc + c.stats.opened, 0),
    totalConverted: campaigns.reduce((acc, c) => acc + c.stats.converted, 0),
    openRate: campaigns.length > 0 ? Math.round((campaigns.reduce((acc, c) => acc + c.stats.opened, 0) / campaigns.reduce((acc, c) => acc + c.stats.sent, 0)) * 100) || 0 : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">أتمتة التسويق</h2>
          <p className="text-muted-foreground">إنشاء وإدارة حملات التسويق الآلية</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إنشاء حملة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء حملة تسويقية آلية</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الحملة *</Label>
                  <Input
                    id="name"
                    value={newCampaignData.name}
                    onChange={(e) => setNewCampaignData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="اسم الحملة التسويقية"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign_type">نوع الحملة</Label>
                  <Select 
                    value={newCampaignData.campaign_type} 
                    onValueChange={(value: MarketingCampaign['campaign_type']) => 
                      setNewCampaignData(prev => ({ ...prev, campaign_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحملة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email_sequence">سلسلة بريد إلكتروني</SelectItem>
                      <SelectItem value="abandoned_cart">السلة المهجورة</SelectItem>
                      <SelectItem value="post_purchase">ما بعد الشراء</SelectItem>
                      <SelectItem value="welcome_series">سلسلة الترحيب</SelectItem>
                      <SelectItem value="re_engagement">إعادة التفاعل</SelectItem>
                      <SelectItem value="birthday_campaign">حملة أعياد الميلاد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">وصف الحملة</Label>
                <Textarea
                  id="description"
                  value={newCampaignData.description}
                  onChange={(e) => setNewCampaignData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف الحملة وأهدافها..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger_type">نوع المحفز</Label>
                  <Select 
                    value={newCampaignData.trigger_type} 
                    onValueChange={(value: MarketingCampaign['trigger_type']) => 
                      setNewCampaignData(prev => ({ ...prev, trigger_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المحفز" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">حدث</SelectItem>
                      <SelectItem value="time_based">وقت محدد</SelectItem>
                      <SelectItem value="behavioral">سلوكي</SelectItem>
                      <SelectItem value="manual">يدوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex items-center justify-between">
                  <Label htmlFor="is_active">تفعيل الحملة</Label>
                  <Switch
                    id="is_active"
                    checked={newCampaignData.is_active}
                    onCheckedChange={(checked) => 
                      setNewCampaignData(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateCampaign} disabled={isCreating || !newCampaignData.name}>
                {isCreating ? 'جاري الإنشاء...' : 'إنشاء الحملة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{campaignStats.total}</p>
            <p className="text-sm text-muted-foreground">إجمالي الحملات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{campaignStats.active}</p>
            <p className="text-sm text-muted-foreground">حملات نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-info">{campaignStats.totalSent}</p>
            <p className="text-sm text-muted-foreground">رسائل مرسلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-premium">{campaignStats.totalOpened}</p>
            <p className="text-sm text-muted-foreground">رسائل مفتوحة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-warning">{campaignStats.totalConverted}</p>
            <p className="text-sm text-muted-foreground">تحويلات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{campaignStats.openRate}%</p>
            <p className="text-sm text-muted-foreground">معدل الفتح</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            الحملات التسويقية الآلية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <Badge className={getCampaignTypeColor(campaign.campaign_type)}>
                        {getCampaignTypeLabel(campaign.campaign_type)}
                      </Badge>
                      <Badge variant={campaign.is_active ? "default" : "secondary"}>
                        {campaign.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                    
                    {campaign.description && (
                      <p className="text-muted-foreground mb-3">{campaign.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>المحفز: {getTriggerTypeLabel(campaign.trigger_type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>مرسل: {campaign.stats.sent}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>مفتوح: {campaign.stats.opened}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>محول: {campaign.stats.converted}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={campaign.is_active}
                      onCheckedChange={(checked) => handleToggleCampaign(campaign.id, checked)}
                      disabled={isUpdating}
                    />
                    
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Campaign Performance */}
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-info">
                        {campaign.stats.sent > 0 ? Math.round((campaign.stats.opened / campaign.stats.sent) * 100) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">معدل الفتح</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-success">
                        {campaign.stats.sent > 0 ? Math.round((campaign.stats.clicked / campaign.stats.sent) * 100) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">معدل النقر</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-premium">
                        {campaign.stats.sent > 0 ? Math.round((campaign.stats.converted / campaign.stats.sent) * 100) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">معدل التحويل</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {campaigns.length === 0 && (
              <div className="text-center py-8">
                <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد حملات آلية</h3>
                <p className="text-muted-foreground mb-4">ابدأ بإنشاء حملات تسويقية آلية لزيادة التفاعل</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إنشاء حملة جديدة
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};