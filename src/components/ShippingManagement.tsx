import React, { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle, UnifiedCardContent as CardContent } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit2, Package, MapPin, Calculator, Trash2, CheckSquare } from 'lucide-react';
import { useShippingManagement } from '@/hooks/useShippingManagement';
import { useShippingZones } from '@/hooks/useShippingZones';
import { ShippingCalculator } from '@/components/ShippingCalculator';
import { saudiCities } from '@/data/saudiCities';
import { toast } from 'sonner';

const ShippingManagement: React.FC = () => {
  const {
    providers,
    zones: shippingZones,
    rates,
    loading,
    createProvider,
    updateProvider,
    createRate,
    updateRate
  } = useShippingManagement();

  const {
    zones,
    loading: zonesLoading,
    createZone,
    updateZone,
    deleteZone,
    refetch: refetchZones
  } = useShippingZones();

  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [editingRate, setEditingRate] = useState<any>(null);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectAllCities, setSelectAllCities] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const [providerForm, setProviderForm] = useState({
    name: '',
    name_en: '',
    code: '',
    api_endpoint: '',
    is_active: true,
    configuration: {}
  });

  const [zoneForm, setZoneForm] = useState({
    name: '',
    name_en: '',
    zone_code: '',
    zone_type: 'city',
    is_active: true
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

  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCities.length === 0) {
      toast.error('يرجى اختيار مدينة واحدة على الأقل');
      return;
    }

    const zoneData = {
      ...zoneForm,
      postal_codes: selectedCities
    };
    
    if (editingZone) {
      await updateZone(editingZone.id, zoneData);
      setEditingZone(null);
    } else {
      await createZone(zoneData);
    }
    
    setShowZoneDialog(false);
    resetZoneForm();
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

  const resetZoneForm = () => {
    setZoneForm({
      name: '',
      name_en: '',
      zone_code: '',
      zone_type: 'city',
      is_active: true
    });
    setSelectedCities([]);
    setSelectAllCities(false);
    setCitySearch('');
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

  const startEditZone = (zone: any) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      name_en: zone.name_en || '',
      zone_code: zone.zone_code,
      zone_type: zone.zone_type,
      is_active: zone.is_active
    });
    setSelectedCities(Array.isArray(zone.postal_codes) ? zone.postal_codes : []);
    setShowZoneDialog(true);
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

  const handleSelectAllCities = (checked: boolean) => {
    setSelectAllCities(checked);
    if (checked) {
      setSelectedCities([...saudiCities]);
    } else {
      setSelectedCities([]);
    }
  };

  const handleCityToggle = (city: string, checked: boolean) => {
    if (checked) {
      setSelectedCities(prev => [...prev, city]);
    } else {
      setSelectedCities(prev => prev.filter(c => c !== city));
      setSelectAllCities(false);
    }
  };

  const filteredCities = saudiCities.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleDeleteZone = async (zoneId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المنطقة؟')) {
      await deleteZone(zoneId);
    }
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>مناطق الشحن</CardTitle>
              <Dialog open={showZoneDialog} onOpenChange={setShowZoneDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    resetZoneForm();
                    setEditingZone(null);
                  }}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة منطقة شحن
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingZone ? 'تعديل منطقة الشحن' : 'إضافة منطقة شحن جديدة'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleZoneSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="zone_name">اسم المنطقة بالعربية</Label>
                      <Input
                        id="zone_name"
                        value={zoneForm.name}
                        onChange={(e) => setZoneForm({...zoneForm, name: e.target.value})}
                        placeholder="مثال: المنطقة الوسطى"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zone_name_en">اسم المنطقة بالإنجليزية</Label>
                      <Input
                        id="zone_name_en"
                        value={zoneForm.name_en}
                        onChange={(e) => setZoneForm({...zoneForm, name_en: e.target.value})}
                        placeholder="Example: Central Region"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zone_code">رمز المنطقة</Label>
                      <Input
                        id="zone_code"
                        value={zoneForm.zone_code}
                        onChange={(e) => setZoneForm({...zoneForm, zone_code: e.target.value})}
                        placeholder="مثال: CENTRAL"
                        required
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">المدن المشمولة</Label>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="select_all"
                            checked={selectAllCities}
                            onCheckedChange={handleSelectAllCities}
                          />
                          <Label htmlFor="select_all" className="text-sm font-medium cursor-pointer">
                            <CheckSquare className="h-4 w-4 inline ml-1" />
                            تحديد جميع المدن ({saudiCities.length} مدينة)
                          </Label>
                        </div>
                      </div>
                      
                      <Input
                        placeholder="بحث عن مدينة..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full"
                      />
                      
                      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-muted/20">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {filteredCities.map((city) => (
                            <div key={city} className="flex items-center space-x-2 space-x-reverse">
                              <Checkbox
                                id={`city_${city}`}
                                checked={selectedCities.includes(city)}
                                onCheckedChange={(checked) => handleCityToggle(city, checked as boolean)}
                              />
                              <Label
                                htmlFor={`city_${city}`}
                                className="text-sm cursor-pointer hover:text-primary"
                              >
                                {city}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {filteredCities.length === 0 && (
                          <div className="text-center text-muted-foreground py-4">
                            لا توجد مدن تطابق البحث
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          المدن المحددة: {selectedCities.length}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="zone_is_active"
                        checked={zoneForm.is_active}
                        onCheckedChange={(checked) => setZoneForm({...zoneForm, is_active: checked})}
                      />
                      <Label htmlFor="zone_is_active">منطقة نشطة</Label>
                    </div>
                    
                    <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowZoneDialog(false)}>
                        إلغاء
                      </Button>
                      <Button type="submit" disabled={selectedCities.length === 0}>
                        {editingZone ? 'تحديث' : 'إضافة'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {zones.map((zone) => (
                  <div key={zone.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{zone.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                          {zone.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditZone(zone)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteZone(zone.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      رمز: {zone.zone_code} | عدد المدن: {Array.isArray(zone.postal_codes) ? zone.postal_codes.length : 0}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(zone.postal_codes) ? zone.postal_codes : []).slice(0, 10).map((city, index) => (
                        <Badge key={index} variant="outline">{city}</Badge>
                      ))}
                      {Array.isArray(zone.postal_codes) && zone.postal_codes.length > 10 && (
                        <Badge variant="outline">+{zone.postal_codes.length - 10} مدن أخرى</Badge>
                      )}
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