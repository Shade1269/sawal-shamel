import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit2, Package, MapPin, Calculator } from 'lucide-react';
import { useShippingManagement } from '@/hooks/useShippingManagement';
import { ShippingCalculator } from '@/components/ShippingCalculator';

const ShippingManagement: React.FC = () => {
  const {
    providers,
    zones,
    rates,
    loading,
    createProvider,
    updateProvider,
    createRate,
    updateRate
  } = useShippingManagement();

  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [editingRate, setEditingRate] = useState<any>(null);

  const [providerForm, setProviderForm] = useState({
    name: '',
    name_en: '',
    code: '',
    api_endpoint: '',
    is_active: true,
    configuration: {}
  });

  const [rateForm, setRateForm] = useState({
    provider_id: '',
    zone_id: '',
    service_type: 'standard',
    weight_from: 0,
    weight_to: 50,
    base_price: 0,
    price_per_kg: 0,
    min_price: 0,
    max_price: 0
  });

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProvider) {
      await updateProvider(editingProvider.id, providerForm);
      setEditingProvider(null);
    } else {
      await createProvider(providerForm);
    }
    
    setShowProviderDialog(false);
    resetProviderForm();
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRate) {
      await updateRate(editingRate.id, rateForm);
      setEditingRate(null);
    } else {
      await createRate(rateForm);
    }
    
    setShowRateDialog(false);
    resetRateForm();
  };

  const resetProviderForm = () => {
    setProviderForm({
      name: '',
      name_en: '',
      code: '',
      api_endpoint: '',
      is_active: true,
      configuration: {}
    });
  };

  const resetRateForm = () => {
    setRateForm({
      provider_id: '',
      zone_id: '',
      service_type: 'standard',
      weight_from: 0,
      weight_to: 50,
      base_price: 0,
      price_per_kg: 0,
      min_price: 0,
      max_price: 0
    });
  };

  const startEditProvider = (provider: any) => {
    setEditingProvider(provider);
    setProviderForm({
      name: provider.name,
      name_en: provider.name_en || '',
      code: provider.code,
      api_endpoint: provider.api_endpoint || '',
      is_active: provider.is_active,
      configuration: provider.configuration || {}
    });
    setShowProviderDialog(true);
  };

  const startEditRate = (rate: any) => {
    setEditingRate(rate);
    setRateForm({
      provider_id: rate.provider_id,
      zone_id: rate.zone_id,
      service_type: rate.service_type,
      weight_from: rate.weight_from,
      weight_to: rate.weight_to,
      base_price: rate.base_price,
      price_per_kg: rate.price_per_kg,
      min_price: rate.min_price || 0,
      max_price: rate.max_price || 0
    });
    setShowRateDialog(true);
  };

  if (loading) {
    return <div className="p-4 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الشحن</h1>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            حاسبة الشحن
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            شركات الشحن
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            المناطق
          </TabsTrigger>
          <TabsTrigger value="rates" className="flex items-center gap-2">
            الأسعار
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>حاسبة تكلفة الشحن</CardTitle>
            </CardHeader>
            <CardContent>
              <ShippingCalculator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>شركات الشحن</CardTitle>
              <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    resetProviderForm();
                    setEditingProvider(null);
                  }}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة شركة شحن
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingProvider ? 'تعديل شركة الشحن' : 'إضافة شركة شحن جديدة'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleProviderSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">اسم الشركة بالعربية</Label>
                      <Input
                        id="name"
                        value={providerForm.name}
                        onChange={(e) => setProviderForm({...providerForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name_en">اسم الشركة بالإنجليزية</Label>
                      <Input
                        id="name_en"
                        value={providerForm.name_en}
                        onChange={(e) => setProviderForm({...providerForm, name_en: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">رمز الشركة</Label>
                      <Input
                        id="code"
                        value={providerForm.code}
                        onChange={(e) => setProviderForm({...providerForm, code: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="api_endpoint">رابط API (اختياري)</Label>
                      <Input
                        id="api_endpoint"
                        value={providerForm.api_endpoint}
                        onChange={(e) => setProviderForm({...providerForm, api_endpoint: e.target.value})}
                        placeholder="https://api.example.com"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={providerForm.is_active}
                        onCheckedChange={(checked) => setProviderForm({...providerForm, is_active: checked})}
                      />
                      <Label htmlFor="is_active">نشط</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowProviderDialog(false)}>
                        إلغاء
                      </Button>
                      <Button type="submit">
                        {editingProvider ? 'تحديث' : 'إضافة'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {providers.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground">رمز: {provider.code}</p>
                      {provider.api_endpoint && (
                        <p className="text-xs text-muted-foreground">{provider.api_endpoint}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                        {provider.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditProvider(provider)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {providers.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    لا توجد شركات شحن مضافة بعد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>مناطق الشحن</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {zones.map((zone) => (
                  <div key={zone.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{zone.name}</h3>
                      <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                        {zone.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {zone.postal_codes.map((city, index) => (
                        <Badge key={index} variant="outline">{city}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {zones.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    لا توجد مناطق شحن محددة بعد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>أسعار الشحن</CardTitle>
              <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    resetRateForm();
                    setEditingRate(null);
                  }}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة سعر
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingRate ? 'تعديل سعر الشحن' : 'إضافة سعر شحن جديد'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRateSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="provider_id">شركة الشحن</Label>
                      <Select
                        value={rateForm.provider_id}
                        onValueChange={(value) => setRateForm({...rateForm, provider_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر شركة الشحن" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zone_id">المنطقة</Label>
                      <Select
                        value={rateForm.zone_id}
                        onValueChange={(value) => setRateForm({...rateForm, zone_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المنطقة" />
                        </SelectTrigger>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.id}>
                              {zone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="service_type">نوع الخدمة</Label>
                      <Select
                        value={rateForm.service_type}
                        onValueChange={(value) => setRateForm({...rateForm, service_type: value})}
                      >
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight_from">الوزن الأدنى (كج)</Label>
                        <Input
                          id="weight_from"
                          type="number"
                          step="0.1"
                          value={rateForm.weight_from}
                          onChange={(e) => setRateForm({...rateForm, weight_from: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight_to">الوزن الأعلى (كج)</Label>
                        <Input
                          id="weight_to"
                          type="number"
                          step="0.1"
                          value={rateForm.weight_to}
                          onChange={(e) => setRateForm({...rateForm, weight_to: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="base_price">السعر الأساسي (ر.س)</Label>
                        <Input
                          id="base_price"
                          type="number"
                          step="0.01"
                          value={rateForm.base_price}
                          onChange={(e) => setRateForm({...rateForm, base_price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="price_per_kg">السعر لكل كج (ر.س)</Label>
                        <Input
                          id="price_per_kg"
                          type="number"
                          step="0.01"
                          value={rateForm.price_per_kg}
                          onChange={(e) => setRateForm({...rateForm, price_per_kg: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min_price">الحد الأدنى للسعر (ر.س)</Label>
                        <Input
                          id="min_price"
                          type="number"
                          step="0.01"
                          value={rateForm.min_price}
                          onChange={(e) => setRateForm({...rateForm, min_price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_price">الحد الأعلى للسعر (ر.س)</Label>
                        <Input
                          id="max_price"
                          type="number"
                          step="0.01"
                          value={rateForm.max_price}
                          onChange={(e) => setRateForm({...rateForm, max_price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowRateDialog(false)}>
                        إلغاء
                      </Button>
                      <Button type="submit">
                        {editingRate ? 'تحديث' : 'إضافة'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {rates.map((rate: any) => (
                  <div key={rate.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">
                          {rate.provider?.name} - {rate.zone?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {rate.service_type} | {rate.weight_from}-{rate.weight_to} كج
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditRate(rate)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">السعر الأساسي: </span>
                        <span>{rate.base_price} ر.س</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">لكل كج: </span>
                        <span>{rate.price_per_kg} ر.س</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">الحد الأدنى: </span>
                        <span>{rate.min_price || 0} ر.س</span>
                      </div>
                    </div>
                  </div>
                ))}
                {rates.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    لا توجد أسعار شحن محددة بعد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShippingManagement;