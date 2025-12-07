import { useState, useEffect } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, TrendingUp, Link, MousePointer, ShoppingCart, QrCode } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ReferralLink {
  id: string;
  name: string;
  ref_code: string;
  target_url: string;
  clicks_count: number;
  conversions_count: number;
  revenue_generated: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

interface ReferralClick {
  id: string;
  referral_link_id: string;
  ip_address: string;
  user_agent: string;
  referrer_url?: string;
  location_data?: any;
  clicked_at: string;
  converted: boolean;
  conversion_value?: number;
}

interface ReferralTrackingSystemProps {
  storeId: string;
  baseUrl?: string;
}

export const ReferralTrackingSystem = ({ storeId, baseUrl = 'https://example.com' }: ReferralTrackingSystemProps) => {
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [referralClicks, setReferralClicks] = useState<ReferralClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [_selectedLink, _setSelectedLink] = useState<ReferralLink | null>(null);
  const [newLink, setNewLink] = useState({
    name: '',
    target_url: '',
    ref_code: ''
  });
  const { toast } = useToast();

  const fetchReferralLinks = async () => {
    try {
      // Mock data instead of database call
      const mockLinks: ReferralLink[] = [
        {
          id: '1',
          name: 'حملة فيسبوك',
          ref_code: 'FB2024',
          target_url: `${baseUrl}/products/123`,
          clicks_count: 245,
          conversions_count: 23,
          revenue_generated: 1150.00,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'حملة تويتر',
          ref_code: 'TW2024',
          target_url: `${baseUrl}/products/456`,
          clicks_count: 128,
          conversions_count: 15,
          revenue_generated: 750.00,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];
      
      setReferralLinks(mockLinks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching referral links:', error);
      setLoading(false);
    }
  };

  const fetchReferralClicks = async () => {
    try {
      // Mock data instead of database call
      const mockClicks: ReferralClick[] = [
        {
          id: '1',
          referral_link_id: '1',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          clicked_at: new Date().toISOString(),
          converted: true,
          conversion_value: 50
        }
      ];
      
      setReferralClicks(mockClicks);
    } catch (error) {
      console.error('Error fetching referral clicks:', error);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchReferralLinks();
    }
  }, [storeId]);

  useEffect(() => {
    if (referralLinks.length > 0) {
      fetchReferralClicks();
    }
  }, [referralLinks]);

  const generateRefCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewLink(prev => ({ ...prev, ref_code: result }));
  };

  const handleCreateLink = async () => {
    try {
      if (!newLink.name || !newLink.target_url || !newLink.ref_code) {
        toast({
          title: "بيانات مطلوبة",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }

      // Mock creation - add to local state
      const newReferralLink: ReferralLink = {
        id: Math.random().toString(36).substr(2, 9),
        name: newLink.name,
        ref_code: newLink.ref_code,
        target_url: newLink.target_url,
        clicks_count: 0,
        conversions_count: 0,
        revenue_generated: 0,
        is_active: true,
        created_at: new Date().toISOString()
      };

      setReferralLinks(prev => [newReferralLink, ...prev]);

      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء رابط الإحالة بنجاح",
      });

      setDialogOpen(false);
      setNewLink({ name: '', target_url: '', ref_code: '' });
    } catch (error) {
      console.error('Error creating referral link:', error);
      toast({
        title: "خطأ في الإنشاء",
        description: "حدث خطأ أثناء إنشاء رابط الإحالة",
        variant: "destructive",
      });
    }
  };

  const getFullReferralUrl = (refCode: string) => {
    return `${baseUrl}?ref=${refCode}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: "تم نسخ الرابط إلى الحافظة",
    });
  };

  const generateQRCode = async (url: string) => {
    // Simple QR code generation placeholder
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    window.open(qrUrl, '_blank');
  };

  const getAnalyticsData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayClicks = referralClicks.filter(click => 
        click.clicked_at.split('T')[0] === date
      );
      const dayConversions = dayClicks.filter(click => click.converted);

      return {
        date: new Date(date).toLocaleDateString('ar'),
        clicks: dayClicks.length,
        conversions: dayConversions.length,
        revenue: dayConversions.reduce((sum, click) => sum + (click.conversion_value || 0), 0)
      };
    });
  };

  const getTotalStats = () => {
    const totalClicks = referralLinks.reduce((sum, link) => sum + link.clicks_count, 0);
    const totalConversions = referralLinks.reduce((sum, link) => sum + link.conversions_count, 0);
    const totalRevenue = referralLinks.reduce((sum, link) => sum + link.revenue_generated, 0);
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return { totalClicks, totalConversions, totalRevenue, conversionRate };
  };

  const getTopPerformingLinks = () => {
    return referralLinks
      .sort((a, b) => b.clicks_count - a.clicks_count)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = getTotalStats();
  const analyticsData = getAnalyticsData();
  const topLinks = getTopPerformingLinks();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">نظام تتبع الإحالات</h2>
          <p className="text-muted-foreground">إنشاء وتتبع روابط الإحالة لزيادة الوصول والمبيعات</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Link className="w-4 h-4 ml-2" />
              إنشاء رابط إحالة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء رابط إحالة جديد</DialogTitle>
              <DialogDescription>
                أنشئ رابط إحالة مخصص لتتبع الزيارات والتحويلات
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">اسم الحملة</Label>
                <Input
                  id="name"
                  value={newLink.name}
                  onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: حملة فيسبوك"
                />
              </div>
              <div>
                <Label htmlFor="target_url">الرابط المستهدف</Label>
                <Input
                  id="target_url"
                  value={newLink.target_url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, target_url: e.target.value }))}
                  placeholder={`${baseUrl}/products/123`}
                />
              </div>
              <div>
                <Label htmlFor="ref_code">كود الإحالة</Label>
                <div className="flex gap-2">
                  <Input
                    id="ref_code"
                    value={newLink.ref_code}
                    onChange={(e) => setNewLink(prev => ({ ...prev, ref_code: e.target.value }))}
                    placeholder="FB2024"
                  />
                  <Button type="button" variant="outline" onClick={generateRefCode}>
                    توليد
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">الرابط النهائي:</Label>
                <code className="block text-sm mt-1 break-all">
                  {newLink.ref_code ? getFullReferralUrl(newLink.ref_code) : 'أدخل كود الإحالة'}
                </code>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateLink} className="flex-1">
                  إنشاء الرابط
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي النقرات</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              من {referralLinks.length} رابط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التحويلات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              معدل {stats.conversionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} ر.س</div>
            <p className="text-xs text-muted-foreground">
              من الإحالات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الروابط النشطة</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralLinks.filter(link => link.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              من {referralLinks.length} إجمالي
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="links" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="links">روابط الإحالة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-4">
          {referralLinks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Share2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد روابط إحالة بعد</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإنشاء روابط إحالة لتتبع مصادر الزيارات والمبيعات
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Link className="w-4 h-4 ml-2" />
                  إنشاء أول رابط إحالة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {referralLinks.map((link) => (
                <Card key={link.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{link.name}</h3>
                          <Badge variant={link.is_active ? "default" : "secondary"}>
                            {link.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <Label className="text-sm font-medium">رابط الإحالة:</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-muted px-2 py-1 rounded text-sm flex-1 break-all">
                              {getFullReferralUrl(link.ref_code)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(getFullReferralUrl(link.ref_code))}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateQRCode(getFullReferralUrl(link.ref_code))}
                            >
                              <QrCode className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">النقرات:</span>
                            <div className="text-lg font-bold">{link.clicks_count}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">التحويلات:</span>
                            <div className="text-lg font-bold text-success">{link.conversions_count}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">معدل التحويل:</span>
                            <div className="text-lg font-bold">
                              {link.clicks_count > 0 
                                ? ((link.conversions_count / link.clicks_count) * 100).toFixed(1)
                                : '0'
                              }%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الإيرادات:</span>
                            <div className="text-lg font-bold text-info">
                              {link.revenue_generated.toFixed(2)} ر.س
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${link.clicks_count > 0 ? Math.min((link.conversions_count / link.clicks_count) * 100, 100) : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل النقرات والتحويلات - آخر 7 أيام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="النقرات"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="التحويلات"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الإيرادات اليومية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="revenue" 
                      fill="#ffc658"
                      name="الإيرادات (ر.س)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أفضل الروابط أداءً</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLinks.map((link, index) => (
                  <div key={link.id} className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">#{index + 1}</span>
                      <div>
                        <div className="font-medium">{link.name}</div>
                        <div className="text-sm text-muted-foreground">{link.ref_code}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{link.clicks_count}</div>
                      <div className="text-sm text-muted-foreground">نقرة</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>متوسط النقرات لكل رابط</span>
                    <Badge>
                      {referralLinks.length > 0 
                        ? Math.round(stats.totalClicks / referralLinks.length)
                        : 0
                      }
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>متوسط التحويل لكل رابط</span>
                    <Badge>
                      {referralLinks.length > 0 
                        ? Math.round(stats.totalConversions / referralLinks.length)
                        : 0
                      }
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>متوسط الإيرادات لكل رابط</span>
                    <Badge>
                      {referralLinks.length > 0 
                        ? (stats.totalRevenue / referralLinks.length).toFixed(2)
                        : '0.00'
                      } ر.س
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نصائح لتحسين الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-info/10 rounded-lg">
                    <h4 className="font-medium text-info">استخدم أكواد إحالة وصفية</h4>
                    <p className="text-info/80">مثل: INSTAGRAM2024 أو FACEBOOK-SALE</p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg">
                    <h4 className="font-medium text-success">تتبع المصادر المختلفة</h4>
                    <p className="text-success/80">أنشئ رابط منفصل لكل منصة أو حملة</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <h4 className="font-medium text-accent">استخدم رموز QR</h4>
                    <p className="text-accent/80">للمواد المطبوعة والعروض التقديمية</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};