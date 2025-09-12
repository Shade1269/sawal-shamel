import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Send, 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

const EmailCampaignManager = () => {
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    targetAudience: 'all',
    scheduledTime: '',
    type: 'promotional'
  });

  const [campaigns] = useState([
    {
      id: 1,
      name: 'عرض نهاية الأسبوع',
      subject: 'خصم 30% على جميع المنتجات',
      status: 'sent',
      sentAt: '2024-01-10 10:00',
      recipients: 1500,
      openRate: '24.5%',
      clickRate: '8.2%',
      type: 'promotional'
    },
    {
      id: 2,
      name: 'منتجات جديدة',
      subject: 'اكتشف مجموعتنا الجديدة',
      status: 'scheduled',
      scheduledTime: '2024-01-15 14:00',
      recipients: 2100,
      type: 'product_update'
    },
    {
      id: 3,
      name: 'رسالة ترحيبية',
      subject: 'مرحباً بك في متجرنا!',
      status: 'draft',
      recipients: 0,
      type: 'welcome'
    }
  ]);

  const [subscribers] = useState([
    {
      segment: 'جميع المشتركين',
      count: 2847,
      growth: '+15%'
    },
    {
      segment: 'عملاء VIP',
      count: 342,
      growth: '+8%'
    },
    {
      segment: 'عملاء جدد',
      count: 156,
      growth: '+45%'
    },
    {
      segment: 'عملاء غير نشطين',
      count: 624,
      growth: '-5%'
    }
  ]);

  const templates = [
    { id: 'welcome', name: 'رسالة ترحيبية', description: 'للعملاء الجدد' },
    { id: 'promotional', name: 'عروض ترويجية', description: 'للخصومات والعروض' },
    { id: 'newsletter', name: 'نشرة إخبارية', description: 'للأخبار والتحديثات' },
    { id: 'abandoned_cart', name: 'سلة مهجورة', description: 'لتذكير العملاء' }
  ];

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    toast.success('تم إنشاء الحملة بنجاح!');
    setNewCampaign({
      name: '',
      subject: '',
      content: '',
      targetAudience: 'all',
      scheduledTime: '',
      type: 'promotional'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'مرسلة';
      case 'scheduled': return 'مجدولة';
      case 'draft': return 'مسودة';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/50">
          <TabsTrigger value="campaigns">الحملات</TabsTrigger>
          <TabsTrigger value="create">إنشاء حملة</TabsTrigger>
          <TabsTrigger value="subscribers">المشتركون</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">حملات البريد الإلكتروني</h3>
              <p className="text-sm text-muted-foreground">إدارة ومراقبة حملاتك</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              حملة جديدة
            </Button>
          </div>

          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                          {getStatusText(campaign.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {campaign.recipients} مستلم
                        </div>
                        {campaign.status === 'sent' && campaign.openRate && (
                          <>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {campaign.openRate} معدل الفتح
                            </div>
                            <div className="flex items-center gap-1">
                              <MousePointer className="h-4 w-4" />
                              {campaign.clickRate} معدل النقر
                            </div>
                          </>
                        )}
                        {campaign.status === 'scheduled' && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {campaign.scheduledTime}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                إنشاء حملة جديدة
              </CardTitle>
              <CardDescription>
                أنشئ وجدول حملة بريد إلكتروني جديدة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campaign Name & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">اسم الحملة</label>
                  <Input
                    placeholder="مثال: عرض نهاية الأسبوع"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع الحملة</label>
                  <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الحملة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promotional">ترويجية</SelectItem>
                      <SelectItem value="newsletter">نشرة إخبارية</SelectItem>
                      <SelectItem value="welcome">ترحيبية</SelectItem>
                      <SelectItem value="abandoned_cart">سلة مهجورة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium mb-2 block">موضوع الرسالة</label>
                <Input
                  placeholder="مثال: خصم 30% على جميع المنتجات"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium mb-2 block">محتوى الرسالة</label>
                <Textarea
                  placeholder="اكتب محتوى رسالتك هنا..."
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, content: e.target.value }))}
                  className="min-h-[200px]"
                />
              </div>

              {/* Target Audience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">الجمهور المستهدف</label>
                  <Select value={newCampaign.targetAudience} onValueChange={(value) => setNewCampaign(prev => ({ ...prev, targetAudience: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجمهور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المشتركين</SelectItem>
                      <SelectItem value="vip">عملاء VIP</SelectItem>
                      <SelectItem value="new">عملاء جدد</SelectItem>
                      <SelectItem value="inactive">عملاء غير نشطين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">وقت الإرسال (اختياري)</label>
                  <Input
                    type="datetime-local"
                    value={newCampaign.scheduledTime}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>

              {/* Templates */}
              <div>
                <label className="text-sm font-medium mb-2 block">القوالب الجاهزة</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      className="h-auto p-3 flex-col items-start"
                      onClick={() => setNewCampaign(prev => ({ ...prev, type: template.id }))}
                    >
                      <div className="font-medium text-xs">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleCreateCampaign} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {newCampaign.scheduledTime ? 'جدولة الحملة' : 'إرسال فوري'}
                </Button>
                <Button variant="outline" onClick={() => toast.success('تم حفظ المسودة')}>
                  حفظ كمسودة
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subscribers.map((segment, index) => (
              <Card key={index} className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">{segment.segment}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{segment.count.toLocaleString()}</div>
                  <div className="text-sm text-primary">{segment.growth}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-turquoise" />
                إدارة المشتركين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input placeholder="البحث عن مشترك..." className="flex-1" />
                <Button>إضافة مشترك</Button>
              </div>
              <div className="text-sm text-muted-foreground text-center py-8">
                سيتم عرض قائمة المشتركين هنا
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  معدل الفتح
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28.5%</div>
                <div className="text-sm text-primary">+2.3% من الشهر الماضي</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-sm">معدل النقر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.8%</div>
                <div className="text-sm text-primary">+1.5% من الشهر الماضي</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-sm">معدل إلغاء الاشتراك</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.8%</div>
                <div className="text-sm text-green-500">-0.2% من الشهر الماضي</div>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-sm">العائد على الاستثمار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">340%</div>
                <div className="text-sm text-primary">+25% من الشهر الماضي</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailCampaignManager;