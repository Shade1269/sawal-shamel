import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

/**
 * Props للـ PaymentProvidersSection Component
 */
interface PaymentProvidersSectionProps {
  paymentGateways: any[];
  loading: boolean;
  onCreate: (gateway: any) => Promise<void>;
  onDelete: (gatewayId: string) => Promise<void>;
}

/**
 * قسم إدارة وسائل الدفع
 * يتيح إضافة وحذف وسائل الدفع المتاحة للمتاجر
 */
export function PaymentProvidersSection({
  paymentGateways,
  loading,
  onCreate,
  onDelete
}: PaymentProvidersSectionProps) {
  const { toast } = useToast();

  // حالات محلية للنماذج
  const [newPaymentProvider, setNewPaymentProvider] = useState({
    gateway_name: '',
    display_name: '',
    api_key: ''
  });

  // معالج إضافة وسيلة دفع جديدة
  const handleAddPaymentProvider = async () => {
    if (!newPaymentProvider.gateway_name.trim() || !newPaymentProvider.display_name.trim()) {
      toast({
        title: "مطلوب",
        description: "المعرف والاسم المعروض مطلوبان",
        variant: "destructive"
      });
      return;
    }

    await onCreate({
      gateway_name: newPaymentProvider.gateway_name,
      display_name: newPaymentProvider.display_name,
      provider: newPaymentProvider.gateway_name,
      api_key: newPaymentProvider.api_key || '',
      is_enabled: true,
      is_test_mode: false,
      percentage_fee: 0,
      fixed_fee_sar: 0,
      min_amount_sar: 0,
      allowed_currencies: ['SAR'],
      configuration: {}
    });

    setNewPaymentProvider({ gateway_name: '', display_name: '', api_key: '' });
    toast({
      title: "تم الإضافة",
      description: "تم إضافة وسيلة الدفع وستظهر لجميع المتاجر"
    });
  };

  // معالج حذف وسيلة دفع
  const handleDeletePaymentProvider = async (gateway: any) => {
    await onDelete(gateway.id);
    toast({
      title: "تم الحذف",
      description: "تم حذف وسيلة الدفع من جميع المتاجر"
    });
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-success flex items-center justify-center shadow-elegant ring-2 ring-success/20">
          <Settings className="h-6 w-6 text-primary-foreground drop-shadow-sm" />
        </div>
        <div>
          <h2 className="text-3xl font-black admin-card">المدفوعات</h2>
          <p className="text-lg text-muted-foreground/80 font-medium mt-1">إدارة وسائل الدفع والعمليات المالية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* إضافة وسيلة دفع */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">إضافة وسيلة دفع</h3>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="معرف الوسيلة (مثل: tabby, tamara)"
              value={newPaymentProvider.gateway_name}
              onChange={(e) => setNewPaymentProvider({...newPaymentProvider, gateway_name: e.target.value})}
            />
            <Input
              placeholder="الاسم المعروض (مثل: تابي، تمارا)"
              value={newPaymentProvider.display_name}
              onChange={(e) => setNewPaymentProvider({...newPaymentProvider, display_name: e.target.value})}
            />
            <Input
              placeholder="API Key (اختياري)"
              value={newPaymentProvider.api_key}
              onChange={(e) => setNewPaymentProvider({...newPaymentProvider, api_key: e.target.value})}
            />
            <Button
              onClick={handleAddPaymentProvider}
              className="w-full"
              disabled={loading}
            >
              إضافة وسيلة دفع
            </Button>
          </div>
        </div>

        {/* قائمة وسائل الدفع */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">وسائل الدفع</h3>
            <Badge variant="outline">{paymentGateways.length}</Badge>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3">
            {paymentGateways.map((gateway) => (
              <div key={gateway.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{gateway.display_name}</h4>
                    <p className="text-xs text-muted-foreground">معرف: {gateway.gateway_name}</p>
                    <p className="text-sm text-muted-foreground">
                      API Key: {gateway.api_key ? '••••••••' : 'غير محدد'}
                    </p>
                    <Badge variant={gateway.is_enabled ? 'default' : 'secondary'} className="mt-1">
                      {gateway.is_enabled ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePaymentProvider(gateway)}
                    className="text-destructive hover:text-destructive"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {paymentGateways.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {loading ? 'جاري التحميل...' : 'لا توجد وسائل دفع محددة'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
