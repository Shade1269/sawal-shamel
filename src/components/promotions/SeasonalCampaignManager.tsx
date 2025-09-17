import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Snowflake, Sun, Leaf, Gift } from 'lucide-react';
import { usePromotionCampaigns } from '@/hooks/usePromotionCampaigns';

const seasonIcons = {
  'winter': Snowflake,
  'summer': Sun,
  'spring': Leaf,
  'autumn': Leaf,
  'ramadan': Gift,
  'eid': Gift,
  'national_day': Gift,
  'back_to_school': Gift,
};

const seasonNames = {
  'winter': 'الشتاء',
  'summer': 'الصيف',
  'spring': 'الربيع',
  'autumn': 'الخريف',
  'ramadan': 'رمضان',
  'eid': 'العيد',
  'national_day': 'اليوم الوطني',
  'back_to_school': 'العودة للمدارس',
};

export const SeasonalCampaignManager: React.FC = () => {
  const { campaigns, createCampaign, isCreating } = usePromotionCampaigns();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    season_type: 'winter' as keyof typeof seasonNames,
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: 0,
    start_date: '',
    end_date: '',
    minimum_order_amount: 0,
    usage_limit: 500,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaign({
      campaign_name: formData.name,
      description: formData.description,
      campaign_type: 'seasonal',
      status: 'draft',
      discount_type: formData.discount_type,
      discount_value: formData.discount_value,
      start_date: formData.start_date,
      end_date: formData.end_date,
      minimum_order_amount: formData.minimum_order_amount,
      usage_limit: formData.usage_limit,
      applicable_products: [],
      applicable_categories: [],
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const seasonalCampaigns = campaigns.filter(c => c.campaign_type === 'seasonal');
  const SeasonIcon = seasonIcons[formData.season_type] || Calendar;

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <SeasonIcon className="h-5 w-5 text-primary" />
            إدارة الحملات الموسمية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_name">اسم الحملة</Label>
                <Input
                  id="campaign_name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="حملة الشتاء الكبرى"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="season_type">نوع الموسم</Label>
                <Select
                  value={formData.season_type}
                  onValueChange={(value) => handleInputChange('season_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(seasonNames).map(([key, name]) => {
                      const Icon = seasonIcons[key as keyof typeof seasonIcons];
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign_description">وصف الحملة</Label>
              <Textarea
                id="campaign_description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="وصف الحملة الموسمية والعروض المتاحة..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">نوع التخفيض</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => handleInputChange('discount_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                    <SelectItem value="fixed_amount">مبلغ ثابت (ر.س)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  قيمة التخفيض {formData.discount_type === 'percentage' ? '(%)' : '(ر.س)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => handleInputChange('discount_value', parseFloat(e.target.value) || 0)}
                  min="0"
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_limit">حد الاستخدام</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => handleInputChange('usage_limit', parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">تاريخ البداية</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">تاريخ النهاية</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_order">الحد الأدنى للطلب (ر.س)</Label>
              <Input
                id="minimum_order"
                type="number"
                value={formData.minimum_order_amount}
                onChange={(e) => handleInputChange('minimum_order_amount', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? 'جاري الإنشاء...' : 'إنشاء الحملة الموسمية'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {seasonalCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الحملات الموسمية الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {seasonalCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{campaign.campaign_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {campaign.discount_value}
                        {campaign.discount_type === 'percentage' ? '%' : ' ر.س'} تخفيض
                      </p>
                    </div>
                  </div>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status === 'active' ? 'نشط' : 'مسودة'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};