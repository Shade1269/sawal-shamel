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
  Warehouse as WarehouseIcon, 
  MapPin, 
  Users, 
  Package 
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

export const WarehouseManagement: React.FC = () => {
  const {
    warehouses,
    inventoryItems,
    loading,
    createWarehouse,
    updateWarehouse
  } = useInventoryManagement();

  const [showDialog, setShowDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    address: '',
    capacity_limit: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const warehouseData = {
      ...formData,
      capacity_limit: formData.capacity_limit ? parseInt(formData.capacity_limit) : null,
      address: formData.address ? JSON.parse(`{"address": "${formData.address}"}`) : null
    };

    if (editingWarehouse) {
      await updateWarehouse(editingWarehouse.id, warehouseData);
    } else {
      await createWarehouse(warehouseData);
    }
    
    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      location: '',
      address: '',
      capacity_limit: '',
      is_active: true
    });
    setEditingWarehouse(null);
  };

  const startEdit = (warehouse: any) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location || '',
      address: warehouse.address ? JSON.stringify(warehouse.address) : '',
      capacity_limit: warehouse.capacity_limit?.toString() || '',
      is_active: warehouse.is_active
    });
    setShowDialog(true);
  };

  const getWarehouseStats = (warehouseId: string) => {
    const items = inventoryItems.filter(item => item.warehouse_id === warehouseId);
    const totalItems = items.reduce((sum, item) => sum + item.quantity_available, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.quantity_available * (item.unit_cost || 0)), 0);
    const lowStockItems = items.filter(item => 
      item.quantity_available <= item.reorder_level && item.reorder_level > 0
    ).length;

    return { totalItems, totalValue, lowStockItems, productCount: items.length };
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل المخازن...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <WarehouseIcon className="h-6 w-6" />
          إدارة المخازن
        </h1>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مخزن
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingWarehouse ? 'تعديل المخزن' : 'إضافة مخزن جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">اسم المخزن</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="اسم المخزن"
                />
              </div>
              
              <div>
                <Label htmlFor="code">رمز المخزن</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                  placeholder="WH001"
                />
              </div>
              
              <div>
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="الرياض، المملكة العربية السعودية"
                />
              </div>
              
              <div>
                <Label htmlFor="address">العنوان التفصيلي</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="العنوان الكامل للمخزن"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="capacity_limit">السعة القصوى</Label>
                <Input
                  id="capacity_limit"
                  type="number"
                  value={formData.capacity_limit}
                  onChange={(e) => setFormData({...formData, capacity_limit: e.target.value})}
                  placeholder="1000"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">مخزن نشط</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingWarehouse ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {warehouses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <WarehouseIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مخازن مضافة</h3>
            <p className="text-muted-foreground mb-4">
              ابدأ بإضافة أول مخزن لإدارة المخزون الخاص بك
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {warehouses.map((warehouse) => {
            const stats = getWarehouseStats(warehouse.id);
            const utilizationPercent = warehouse.capacity_limit ? 
              (warehouse.current_utilization / warehouse.capacity_limit) * 100 : 0;

            return (
              <Card key={warehouse.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <WarehouseIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {warehouse.name}
                          <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
                            {warehouse.is_active ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          رمز المخزن: {warehouse.code}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(warehouse)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* معلومات أساسية */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{warehouse.location || 'لا يوجد موقع محدد'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{stats.productCount} نوع منتج</span>
                    </div>
                  </div>

                  <Separator />

                  {/* إحصائيات المخزن */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
                      <div className="text-sm text-blue-600">إجمالي القطع</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.totalValue.toFixed(0)} ر.س
                      </div>
                      <div className="text-sm text-green-600">قيمة المخزون</div>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
                      <div className="text-sm text-orange-600">مخزون منخفض</div>
                    </div>
                  </div>

                  {/* السعة والاستخدام */}
                  {warehouse.capacity_limit && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">استخدام السعة</span>
                        <span className="text-sm text-muted-foreground">
                          {warehouse.current_utilization} / {warehouse.capacity_limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {utilizationPercent.toFixed(1)}% من السعة الإجمالية
                      </p>
                    </div>
                  )}

                  {/* العنوان */}
                  {warehouse.address && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium mb-1">العنوان:</h4>
                      <p className="text-sm text-muted-foreground">
                        {typeof warehouse.address === 'string' ? 
                          warehouse.address : 
                          warehouse.address.address || 'عنوان غير محدد'
                        }
                      </p>
                    </div>
                  )}

                  {/* تواريخ */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>تم الإنشاء: {new Date(warehouse.created_at).toLocaleDateString('ar-SA')}</span>
                    <span>آخر تحديث: {new Date(warehouse.updated_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};