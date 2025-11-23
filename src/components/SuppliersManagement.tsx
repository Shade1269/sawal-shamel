import React, { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit2, 
  Users, 
  Phone, 
  Mail, 
  MapPin,
  Building2,
  CreditCard,
  Calendar,
  FileText
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Supplier {
  id: string;
  supplier_name: string;
  email: string;
  phone: string;
  address: string;
  is_active: boolean;
  notes: string;
  payment_terms: string;
  supplier_number: string;
  created_at: string;
  updated_at: string;
}

export const SuppliersManagement: React.FC = () => {
  const { suppliers, loading } = useInventoryManagement();
  const { toast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);

  // Function to fetch suppliers from database
  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suppliers:', error);
        return;
      }

      setSuppliersList(data || []);
    } catch (error) {
      console.error('Error in fetchSuppliers:', error);
    }
  };
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

    try {
      if (editingSupplier) {
        // تحديث المورد الموجود
        const { data, error } = await supabase
          .from('suppliers')
          .update({
            supplier_name: supplierData.supplier_name,
            email: supplierData.contact_email,
            phone: supplierData.contact_phone,
            address: supplierData.contact_address,
            payment_terms: supplierData.payment_terms,
            is_active: supplierData.is_active,
            notes: `Contact: ${supplierData.contact_person}, Tax ID: ${supplierData.tax_id}`
          })
          .eq('id', editingSupplier.id)
          .select('*')
          .single();

        if (error) {
          console.error('Error updating supplier:', error);
          toast({
            title: "خطأ في تحديث المورد",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "تم تحديث المورد",
          description: `تم تحديث بيانات المورد ${data.supplier_name} بنجاح`
        });
      } else {
        // إنشاء مورد جديد
        const { data, error } = await supabase
          .from('suppliers')
          .insert({
            supplier_name: supplierData.supplier_name,
            supplier_number: supplierData.supplier_code || `SUP-${Date.now()}`,
            email: supplierData.contact_email,
            phone: supplierData.contact_phone,
            address: supplierData.contact_address,
            payment_terms: supplierData.payment_terms,
            is_active: supplierData.is_active,
            notes: `Contact: ${supplierData.contact_person}, Tax ID: ${supplierData.tax_id}`
          })
          .select('*')
          .single();

        if (error) {
          console.error('Error creating supplier:', error);
          toast({
            title: "خطأ في إنشاء المورد",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "تم إنشاء المورد",
          description: `تم إنشاء المورد ${data.supplier_name} بنجاح`
        });
      }

      // تحديث قائمة الموردين
      fetchSuppliers();
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء معالجة بيانات المورد",
        variant: "destructive"
      });
    } finally {
      setShowDialog(false);
      resetForm();
    }
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
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل الموردين...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">إدارة الموردين</h2>
            <p className="text-muted-foreground">إضافة وإدارة موردي المنتجات</p>
          </div>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow transition-all duration-300"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة مورد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
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
                    className="border-border/50 focus:border-primary"
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
                    className="border-border/50 focus:border-primary"
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
                  className="border-border/50 focus:border-primary"
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
                    className="border-border/50 focus:border-primary"
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
                    className="border-border/50 focus:border-primary"
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
                  className="border-border/50 focus:border-primary"
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
                    className="border-border/50 focus:border-primary"
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
                    className="border-border/50 focus:border-primary"
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
                  className="border-border/50 focus:border-primary"
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
                <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                  {editingSupplier ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {suppliers.length === 0 ? (
        <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/20">
          <CardContent className="text-center py-12">
            <div className="p-4 rounded-full bg-muted mb-4 mx-auto w-fit">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد موردين مضافين</h3>
            <p className="text-muted-foreground mb-4">
              ابدأ بإضافة أول مورد لإدارة المخزون
            </p>
            <Button onClick={resetForm} variant="outline" className="border-primary hover:bg-primary hover:text-primary-foreground">
              إضافة مورد جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm shadow-soft hover:shadow-luxury transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
                      <Building2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2 mb-1">
                        {supplier.supplier_name}
                        <Badge variant={supplier.is_active ? 'default' : 'secondary'} className="text-xs">
                          {supplier.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">
                        رمز المورد: {supplier.supplier_code}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(supplier)}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* معلومات الاتصال */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-accent" />
                    معلومات الاتصال
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {supplier.contact_person && (
                      <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30">
                        <Users className="h-4 w-4 text-accent" />
                        <div>
                          <div className="text-xs text-muted-foreground">الشخص المسؤول</div>
                          <div className="font-medium">{supplier.contact_person}</div>
                        </div>
                      </div>
                    )}
                    
                    {supplier.contact_phone && (
                      <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30">
                        <Phone className="h-4 w-4 text-accent" />
                        <div>
                          <div className="text-xs text-muted-foreground">رقم الهاتف</div>
                          <div className="font-medium font-mono">{supplier.contact_phone}</div>
                        </div>
                      </div>
                    )}
                    
                    {supplier.contact_email && (
                      <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30">
                        <Mail className="h-4 w-4 text-accent" />
                        <div>
                          <div className="text-xs text-muted-foreground">البريد الإلكتروني</div>
                          <div className="font-medium">{supplier.contact_email}</div>
                        </div>
                      </div>
                    )}
                    
                    {supplier.contact_address && (
                      <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30">
                        <MapPin className="h-4 w-4 text-accent" />
                        <div>
                          <div className="text-xs text-muted-foreground">العنوان</div>
                          <div className="font-medium">{supplier.contact_address}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* معلومات مالية */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-accent" />
                    المعلومات المالية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {supplier.payment_terms && (
                      <div className="text-center p-4 bg-gradient-accent rounded-lg border border-accent/20">
                        <div className="text-sm font-medium text-accent mb-1">شروط الدفع</div>
                        <div className="text-lg font-bold text-foreground">{supplier.payment_terms}</div>
                      </div>
                    )}
                    
                    {supplier.credit_limit && (
                      <div className="text-center p-4 bg-gradient-primary rounded-lg border border-primary/20">
                        <div className="text-sm font-medium text-primary mb-1">حد الائتمان</div>
                        <div className="text-lg font-bold text-foreground">
                          {supplier.credit_limit.toLocaleString('ar')} ريال
                        </div>
                      </div>
                    )}
                    
                    {supplier.tax_id && (
                      <div className="text-center p-4 bg-gradient-muted rounded-lg border border-muted-foreground/20">
                        <div className="text-sm font-medium text-muted-foreground mb-1">الرقم الضريبي</div>
                        <div className="text-sm font-mono text-foreground">{supplier.tax_id}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* تواريخ */}
                <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/30 pt-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>تم الإنشاء: {new Date(supplier.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>آخر تحديث: {new Date(supplier.updated_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};