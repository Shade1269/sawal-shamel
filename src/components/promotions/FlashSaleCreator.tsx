import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Percent, DollarSign } from 'lucide-react';
import { usePromotionCampaigns } from '@/hooks/usePromotionCampaigns';

export const FlashSaleCreator: React.FC = () => {
  const { createCampaign, isCreating } = usePromotionCampaigns();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: 0,
    start_date: '',
    end_date: '',
    minimum_order_amount: 0,
    usage_limit: 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaign({
      campaign_name: formData.name,
      description: formData.description,
      campaign_type: 'flash_sale',
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Clock className="h-5 w-5 text-destructive" />
          إنشاء تخفيض سريع (Flash Sale)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم التخفيض</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="تخفيض نهاية الأسبوع"
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

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="وصف التخفيض السريع..."
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
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      نسبة مئوية
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed_amount">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      مبلغ ثابت
                    </div>
                  </SelectItem>
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

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? 'جاري الإنشاء...' : 'إنشاء التخفيض السريع'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormData({
                name: '',
                description: '',
                discount_type: 'percentage',
                discount_value: 0,
                start_date: '',
                end_date: '',
                minimum_order_amount: 0,
                usage_limit: 100,
              })}
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};