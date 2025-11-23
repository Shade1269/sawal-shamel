import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Edit, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

/**
 * Props للـ ShippingSection Component
 */
interface ShippingSectionProps {
  providers: any[];
  loading: boolean;
  onCreate: (provider: any) => Promise<void>;
  onUpdate: (providerId: string, updates: any) => Promise<void>;
  onRefetch?: () => Promise<void>;
}

/**
 * قسم إدارة شركات الشحن
 * يتيح إضافة وتعديل شركات الشحن والأسعار
 */
export function ShippingSection({
  providers,
  loading,
  onCreate,
  onUpdate,
  onRefetch
}: ShippingSectionProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  // حالات محلية للنماذج
  const [newShippingCompany, setNewShippingCompany] = useState({
    name: '',
    name_en: '',
    code: '',
    api_endpoint: '',
    base_price_sar: ''
  });

  // معالج إضافة شركة شحن جديدة
  const handleAddShippingCompany = async () => {
    if (!newShippingCompany.name.trim() || !newShippingCompany.code.trim() || !newShippingCompany.base_price_sar) {
      toast({
        title: "مطلوب",
        description: "الاسم والرمز والسعر مطلوبان",
        variant: "destructive"
      });
      return;
    }

    await onCreate({
      name: newShippingCompany.name,
      name_en: newShippingCompany.name_en || newShippingCompany.name,
      code: newShippingCompany.code,
      api_endpoint: newShippingCompany.api_endpoint,
      base_price_sar: parseFloat(newShippingCompany.base_price_sar),
      is_active: true,
      configuration: {}
    });

    await onRefetch?.();
    setNewShippingCompany({ name: '', name_en: '', code: '', api_endpoint: '', base_price_sar: '' });
    toast({
      title: "تم الإضافة",
      description: "تم إضافة شركة الشحن إلى القائمة"
    });
  };

  // معالج تفعيل/تعطيل شركة شحن
  const handleToggleProvider = async (provider: any) => {
    const nextActive = !provider.is_active;
    await onUpdate(provider.id, { is_active: nextActive });
    toast({
      title: nextActive ? "تم التفعيل" : "تم التعطيل",
      description: `تم ${nextActive ? 'تفعيل' : 'تعطيل'} الشركة بنجاح`
    });
    await onRefetch?.();
  };

  // معالج تعديل بيانات شركة الشحن
  const handleEditProvider = async (provider: any) => {
    const newName = window.prompt("تعديل اسم الشركة", provider.name);
    if (newName === null) return;

    const newCode = window.prompt("تعديل رمز الشركة", provider.code);
    if (newCode === null) return;

    const newPrice = window.prompt("تعديل السعر الأساسي (ريال)", String(provider.base_price_sar || 0));
    if (newPrice === null) return;

    await onUpdate(provider.id, {
      name: newName.trim(),
      code: newCode.trim(),
      base_price_sar: parseFloat(newPrice)
    });

    toast({
      title: "تم التحديث",
      description: "تم تحديث بيانات شركة الشحن"
    });
    await onRefetch?.();
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-warning flex items-center justify-center shadow-elegant ring-2 ring-warning/20">
          <Package className="h-6 w-6 text-primary-foreground drop-shadow-sm" />
        </div>
        <div>
          <h2 className="text-3xl font-black admin-card">شركات الشحن</h2>
          <p className="text-lg text-muted-foreground/80 font-medium mt-1">إدارة شركات الشحن والمناطق والأسعار</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إضافة شركة شحن */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">إضافة شركة شحن</h3>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="اسم الشركة بالعربية"
              value={newShippingCompany.name}
              onChange={(e) => setNewShippingCompany({...newShippingCompany, name: e.target.value})}
            />
            <Input
              placeholder="اسم الشركة بالإنجليزية"
              value={newShippingCompany.name_en}
              onChange={(e) => setNewShippingCompany({...newShippingCompany, name_en: e.target.value})}
            />
            <Input
              placeholder="رمز الشركة (مثل: aramex, smsa)"
              value={newShippingCompany.code}
              onChange={(e) => setNewShippingCompany({...newShippingCompany, code: e.target.value})}
            />
            <Input
              placeholder="رابط API (اختياري)"
              value={newShippingCompany.api_endpoint}
              onChange={(e) => setNewShippingCompany({...newShippingCompany, api_endpoint: e.target.value})}
            />
            <Input
              type="number"
              placeholder="السعر الأساسي (ريال سعودي) *"
              value={newShippingCompany.base_price_sar}
              onChange={(e) => setNewShippingCompany({...newShippingCompany, base_price_sar: e.target.value})}
            />
            <Button
              onClick={handleAddShippingCompany}
              className="w-full"
              disabled={loading}
            >
              إضافة شركة شحن
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/shipping')}
              className="w-full"
            >
              إدارة المناطق والأسعار
            </Button>
          </div>
        </div>

        {/* قائمة شركات الشحن */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">شركات الشحن</h3>
            <Badge variant="outline">{providers.length}</Badge>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3">
            {providers.map((provider) => (
              <div key={provider.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{provider.name}</h4>
                    <p className="text-xs text-muted-foreground">رمز: {provider.code}</p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      السعر: {provider.base_price_sar || 0} ريال
                    </p>
                    {provider.api_endpoint && (
                      <p className="text-xs text-muted-foreground mt-1">
                        API: {provider.api_endpoint}
                      </p>
                    )}
                    <Badge variant={provider.is_active ? 'default' : 'secondary'} className="mt-2">
                      {provider.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleProvider(provider)}
                      disabled={loading}
                    >
                      {provider.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProvider(provider)}
                      disabled={loading}
                      title="تعديل"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {providers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? 'جاري التحميل...' : 'لا توجد شركات شحن محددة'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
