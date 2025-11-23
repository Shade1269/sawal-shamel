import React, { useState } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from "@/components/design-system";
import { UnifiedButton } from "@/components/design-system";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UnifiedBadge } from "@/components/design-system";
import { useInvoiceManagement } from "@/hooks/useInvoiceManagement";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Send, 
  Download, 
  Plus,
  Trash2,
  Calculator
} from "lucide-react";

interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

interface InvoiceGeneratorProps {
  shopId?: string;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ shopId }) => {
  const { createInvoice, loading } = useInvoiceManagement(shopId);
  const { toast } = useToast();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'السعودية'
    }
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { name: '', description: '', quantity: 1, unit_price: 0, discount: 0 }
  ]);

  const [invoiceSettings, setInvoiceSettings] = useState({
    due_date: '',
    notes: '',
    shipping_fee: 0,
    discount_amount: 0,
    vat_rate: 15
  });

  const addItem = () => {
    setItems([...items, { name: '', description: '', quantity: 1, unit_price: 0, discount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.unit_price) - item.discount;
      return sum + itemTotal;
    }, 0);
    
    const subtotalWithShipping = subtotal + invoiceSettings.shipping_fee - invoiceSettings.discount_amount;
    const vatAmount = subtotalWithShipping * (invoiceSettings.vat_rate / 100);
    const total = subtotalWithShipping + vatAmount;
    
    return {
      subtotal,
      vat: vatAmount,
      total
    };
  };

  const handleCreateInvoice = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال اسم العميل ورقم الهاتف على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (items.some(item => !item.name || item.quantity <= 0 || item.unit_price <= 0)) {
      toast({
        title: "بيانات الأصناف ناقصة",
        description: "يرجى التأكد من إدخال جميع بيانات الأصناف بشكل صحيح",
        variant: "destructive",
      });
      return;
    }

    const totals = calculateTotals();
    
    const invoiceData = {
      shop_id: shopId,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      status: 'DRAFT',
      payment_status: 'PENDING',
      subtotal_sar: totals.subtotal,
      shipping_sar: invoiceSettings.shipping_fee,
      discount_sar: invoiceSettings.discount_amount,
      vat_rate: invoiceSettings.vat_rate,
      vat_sar: totals.vat,
      total_sar: totals.total,
      vat_breakdown: {
        rate: invoiceSettings.vat_rate,
        amount: totals.vat,
        taxable_amount: totals.subtotal + invoiceSettings.shipping_fee - invoiceSettings.discount_amount
      },
      due_date: invoiceSettings.due_date || null,
      notes: invoiceSettings.notes,
      metadata: {
        items: items,
        generated_from: 'invoice_generator'
      }
    };

    const result = await createInvoice(invoiceData);
    
    if (result.success) {
      // إعادة تعيين النموذج
      setCustomerInfo({
        name: '',
        email: '',
        phone: '',
        address: { street: '', city: '', postal_code: '', country: 'السعودية' }
      });
      setItems([{ name: '', description: '', quantity: 1, unit_price: 0, discount: 0 }]);
      setInvoiceSettings({
        due_date: '',
        notes: '',
        shipping_fee: 0,
        discount_amount: 0,
        vat_rate: 15
      });
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <UnifiedCard variant="default" padding="none">
        <UnifiedCardHeader>
          <UnifiedCardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            إنشاء فاتورة جديدة
          </UnifiedCardTitle>
        </UnifiedCardHeader>
        <UnifiedCardContent className="space-y-6">
          {/* بيانات العميل */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">بيانات العميل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-name">اسم العميل *</Label>
                <Input
                  id="customer-name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  placeholder="أدخل اسم العميل"
                />
              </div>
              <div>
                <Label htmlFor="customer-phone">رقم الهاتف *</Label>
                <Input
                  id="customer-phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  placeholder="05xxxxxxxx"
                />
              </div>
              <div>
                <Label htmlFor="customer-email">البريد الإلكتروني</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="customer-city">المدينة</Label>
                <Input
                  id="customer-city"
                  value={customerInfo.address.city}
                  onChange={(e) => setCustomerInfo({
                    ...customerInfo, 
                    address: {...customerInfo.address, city: e.target.value}
                  })}
                  placeholder="الرياض"
                />
              </div>
            </div>
          </div>

          {/* الأصناف */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">الأصناف</h3>
              <UnifiedButton onClick={addItem} size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                إضافة صنف
              </UnifiedButton>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <UnifiedCard key={index} variant="default" padding="md">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2">
                      <Label>اسم الصنف</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="أدخل اسم الصنف"
                      />
                    </div>
                    <div>
                      <Label>الكمية</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>السعر</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>الخصم</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-end">
                      <UnifiedButton
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </UnifiedButton>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="وصف الصنف (اختياري)"
                      rows={2}
                    />
                  </div>
                </UnifiedCard>
              ))}
            </div>
          </div>

          {/* إعدادات الفاتورة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">إعدادات الفاتورة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>تاريخ الاستحقاق</Label>
                <Input
                  type="date"
                  value={invoiceSettings.due_date}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, due_date: e.target.value})}
                />
              </div>
              <div>
                <Label>رسوم الشحن (ر.س)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceSettings.shipping_fee}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, shipping_fee: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>خصم إضافي (ر.س)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceSettings.discount_amount}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, discount_amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={invoiceSettings.notes}
                onChange={(e) => setInvoiceSettings({...invoiceSettings, notes: e.target.value})}
                placeholder="ملاحظات إضافية (اختياري)"
                rows={3}
              />
            </div>
          </div>

          {/* ملخص المبالغ */}
          <UnifiedCard variant="flat" padding="md">
            <UnifiedCardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{totals.subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن:</span>
                  <span>{invoiceSettings.shipping_fee.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>الخصم:</span>
                  <span>-{invoiceSettings.discount_amount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة ({invoiceSettings.vat_rate}%):</span>
                  <span>{totals.vat.toFixed(2)} ر.س</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>المجموع الكلي:</span>
                    <span>{totals.total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* أزرار العمليات */}
          <div className="flex gap-3">
            <UnifiedButton onClick={handleCreateInvoice} disabled={loading} fullWidth leftIcon={loading ? null : <Calculator className="h-4 w-4" />}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              ) : null}
              إنشاء الفاتورة
            </UnifiedButton>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};