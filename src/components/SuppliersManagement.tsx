import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit2, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  Building2,
  Star
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

export const SuppliersManagement: React.FC = () => {
  const { suppliers, loading } = useInventoryManagement();

  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_code: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    payment_terms: '',
    credit_limit: '',
    tax_id: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplierData = {
      ...formData,
      credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : null
    };

    // TODO: Implement actual create/update supplier functionality
    console.log('Supplier data:', supplierData);
    
    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      supplier_name: '',
      supplier_code: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      contact_address: '',
      payment_terms: '',
      credit_limit: '',
      tax_id: '',
      is_active: true
    });
    setEditingSupplier(null);
  };

  const startEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      supplier_name: supplier.supplier_name || '',
      supplier_code: supplier.supplier_code || '',
      contact_person: supplier.contact_person || '',
      contact_phone: supplier.contact_phone || '',
      contact_email: supplier.contact_email || '',
      contact_address: supplier.contact_address || '',
      payment_terms: supplier.payment_terms || '',
      credit_limit: supplier.credit_limit?.toString() || '',
      tax_id: supplier.tax_id || '',
      is_active: supplier.is_active
    });
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل الموردين...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          إدارة الموردين
        </h1>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مورد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_name">اسم المورد</Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
                    required
                    placeholder="شركة الموردين المتحدة"
                  />
                </div>
                
                <div>
                  <Label htmlFor="supplier_code">رمز المورد</Label>
                  <Input
                    id="supplier_code"
                    value={formData.supplier_code}
                    onChange={(e) => setFormData({...formData, supplier_code: e.target.value})}
                    required
                    placeholder="SUP001"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="contact_person">الشخص المسؤول</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  placeholder="أحمد محمد"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">رقم الهاتف</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    placeholder="+966501234567"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_email">البريد الإلكتروني</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    placeholder="contact@supplier.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="contact_address">العنوان</Label>
                <Textarea
                  id="contact_address"
                  value={formData.contact_address}
                  onChange={(e) => setFormData({...formData, contact_address: e.target.value})}
                  placeholder="الرياض، المملكة العربية السعودية"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_terms">شروط الدفع</Label>
                  <Input
                    id="payment_terms"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                    placeholder="30 يوم"
                  />
                </div>
                
                <div>
                  <Label htmlFor="credit_limit">حد الائتمان</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                    placeholder="100000"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tax_id">الرقم الضريبي</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({...formData, tax_id: e.target.value})}
                  placeholder="123456789012345"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">مورد نشط</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingSupplier ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {suppliers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد موردين مضافين</h3>
            <p className="text-muted-foreground mb-4">
              ابدأ بإضافة أول مورد لإدارة المخزون
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {supplier.supplier_name}
                        <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                          {supplier.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        رمز المورد: {supplier.supplier_code}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(supplier)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* معلومات الاتصال */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {supplier.contact_person && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.contact_person}</span>
                    </div>
                  )}
                  
                  {supplier.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.contact_phone}</span>
                    </div>
                  )}
                  
                  {supplier.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.contact_email}</span>
                    </div>
                  )}
                  
                  {supplier.contact_address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.contact_address}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* معلومات مالية */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {supplier.payment_terms && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">شروط الدفع</div>
                      <div className="text-lg font-bold text-blue-600">{supplier.payment_terms}</div>
                    </div>
                  )}
                  
                  {supplier.credit_limit && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-900">حد الائتمان</div>
                      <div className="text-lg font-bold text-green-600">
                        {supplier.credit_limit.toLocaleString()} ر.س
                      </div>
                    </div>
                  )}
                  
                  {supplier.tax_id && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">الرقم الضريبي</div>
                      <div className="text-sm font-mono text-gray-600">{supplier.tax_id}</div>
                    </div>
                  )}
                </div>

                {/* تواريخ */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>تم الإنشاء: {new Date(supplier.created_at).toLocaleDateString('ar-SA')}</span>
                  <span>آخر تحديث: {new Date(supplier.updated_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};