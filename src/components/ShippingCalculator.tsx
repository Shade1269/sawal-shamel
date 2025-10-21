import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Package, Clock, Truck } from 'lucide-react';
import { useShippingManagement } from '@/hooks/useShippingManagement';

interface ShippingResult {
  providerId: string;
  providerName: string;
  serviceType: string;
  baseCost: number;
  codFee: number;
  totalCost: number;
  estimatedDeliveryDays: string;
}

export const ShippingCalculator: React.FC = () => {
  const { calculateShippingCost, loading } = useShippingManagement();
  const [city, setCity] = useState('');
  const [weight, setWeight] = useState<number>(1);
  const [serviceType, setServiceType] = useState('standard');
  const [isCOD, setIsCOD] = useState(false);
  const [results, setResults] = useState<ShippingResult[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCalculate = async () => {
    if (!city || !weight) {
      setError('يرجى إدخال المدينة والوزن');
      return;
    }

    setCalculating(true);
    setError('');
    setResults([]);

    const result = await calculateShippingCost(city, weight, serviceType, isCOD);

    if (result.success && result.costs) {
      setResults(result.costs);
    } else {
      setError(result.error || 'حدث خطأ في الحساب');
    }

    setCalculating(false);
  };

  const serviceTypeLabels = {
    standard: 'عادي',
    express: 'سريع',
    overnight: 'نفس اليوم',
    registered: 'مسجل'
  };

  const saudiCities = [
    'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران',
    'الطائف', 'تبوك', 'بريدة', 'خميس مشيط', 'حفر الباطن', 'الجبيل', 'ضبا',
    'رابغ', 'ينبع', 'الأحساء', 'القطيف', 'عرعر', 'سكاكا', 'جازان', 'نجران',
    'أبها', 'الباحة', 'حائل', 'القنفذة', 'الليث', 'صبيا', 'شرورة'
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            احسب تكلفة الشحن
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">المدينة</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {saudiCities.map((cityName) => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">الوزن (كجم)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
                placeholder="1.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">نوع الخدمة</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">عادي</SelectItem>
                  <SelectItem value="express">سريع</SelectItem>
                  <SelectItem value="overnight">نفس اليوم</SelectItem>
                  <SelectItem value="registered">مسجل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="cod"
                  checked={isCOD}
                  onCheckedChange={setIsCOD}
                />
                <Label htmlFor="cod">دفع عند الاستلام</Label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleCalculate} 
            disabled={calculating || loading}
            className="w-full"
          >
            {calculating ? 'جاري الحساب...' : 'احسب التكلفة'}
          </Button>

          {error && (
            <div className="text-center text-destructive text-sm bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              خيارات الشحن المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{result.providerName}</h3>
                      <Badge variant="outline" className="mt-1">
                        {serviceTypeLabels[result.serviceType as keyof typeof serviceTypeLabels]}
                      </Badge>
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold text-primary">
                        {result.totalCost.toFixed(2)} ر.س
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.estimatedDeliveryDays}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-muted-foreground">التكلفة الأساسية</div>
                        <div className="font-medium">{result.baseCost.toFixed(2)} ر.س</div>
                      </div>
                    </div>

                    {result.codFee > 0 && (
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-muted-foreground">رسوم الدفع عند الاستلام</div>
                          <div className="font-medium">{result.codFee.toFixed(2)} ر.س</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-muted-foreground">الوزن</div>
                        <div className="font-medium">{weight} كجم</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">المجموع الكلي:</span>
                      <span className="text-xl font-bold">{result.totalCost.toFixed(2)} ر.س</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {results.length === 0 && !calculating && !error && (
              <div className="text-center text-muted-foreground py-8">
                أدخل المدينة والوزن للحصول على أسعار الشحن
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};