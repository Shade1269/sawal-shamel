import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Package, 
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

export const InventoryMovements: React.FC = () => {
  const { inventoryMovements, warehouseProducts, productVariants, loading } = useInventoryManagement();

  const [showDialog, setShowDialog] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    warehouse_product_id: '',
    product_variant_id: '',
    movement_type: '',
    quantity: '',
    reference_type: '',
    reference_number: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      quantity: parseInt(formData.quantity) || 0
    };

    // TODO: Implement actual create movement functionality
    console.log('Movement data:', data);
    
    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      warehouse_product_id: '',
      product_variant_id: '',
      movement_type: '',
      quantity: '',
      reference_type: '',
      reference_number: '',
      notes: ''
    });
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN': return <ArrowDown className="h-4 w-4 text-green-600" />;
      case 'OUT': return <ArrowUp className="h-4 w-4 text-red-600" />;
      case 'ADJUSTMENT': return <RotateCcw className="h-4 w-4 text-blue-600" />;
      case 'TRANSFER': return <Package className="h-4 w-4 text-purple-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'IN': return 'وارد';
      case 'OUT': return 'صادر';
      case 'ADJUSTMENT': return 'تعديل';
      case 'TRANSFER': return 'نقل';
      default: return type;
    }
  };

  const getMovementTypeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'IN': return 'default';
      case 'OUT': return 'destructive';
      case 'ADJUSTMENT': return 'secondary';
      case 'TRANSFER': return 'outline';
      default: return 'outline';
    }
  };

  const filteredMovements = inventoryMovements.filter((movement) => {
    const matchesType = filterType === 'all' || movement.movement_type === filterType;
    const matchesSearch = !searchTerm || 
      movement.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const getAvailableVariants = (productId: string) => {
    return productVariants.filter(variant => variant.warehouse_product_id === productId);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل حركات المخزون...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          حركات المخزون
        </h1>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              حركة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة حركة مخزون جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="warehouse_product_id">المنتج</Label>
                <Select value={formData.warehouse_product_id} onValueChange={(value) => 
                  setFormData({...formData, warehouse_product_id: value, product_variant_id: ''})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.product_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.warehouse_product_id && (
                <div>
                  <Label htmlFor="product_variant_id">المتغير</Label>
                  <Select value={formData.product_variant_id} onValueChange={(value) => 
                    setFormData({...formData, product_variant_id: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المتغير" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableVariants(formData.warehouse_product_id).map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.variant_name} (متوفر: {variant.available_stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="movement_type">نوع الحركة</Label>
                  <Select value={formData.movement_type} onValueChange={(value) => 
                    setFormData({...formData, movement_type: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">وارد</SelectItem>
                      <SelectItem value="OUT">صادر</SelectItem>
                      <SelectItem value="ADJUSTMENT">تعديل</SelectItem>
                      <SelectItem value="TRANSFER">نقل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                    min="1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference_type">نوع المرجع</Label>
                  <Select value={formData.reference_type} onValueChange={(value) => 
                    setFormData({...formData, reference_type: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase_order">أمر شراء</SelectItem>
                      <SelectItem value="sales_order">أمر بيع</SelectItem>
                      <SelectItem value="return">مرتجع</SelectItem>
                      <SelectItem value="adjustment">تعديل يدوي</SelectItem>
                      <SelectItem value="transfer">نقل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="reference_number">رقم المرجع</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                    placeholder="PO-001"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="تفاصيل إضافية عن الحركة"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  إضافة الحركة
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* شريط البحث والفلاتر */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في الحركات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="نوع الحركة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحركات</SelectItem>
                <SelectItem value="IN">وارد</SelectItem>
                <SelectItem value="OUT">صادر</SelectItem>
                <SelectItem value="ADJUSTMENT">تعديل</SelectItem>
                <SelectItem value="TRANSFER">نقل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الحركات */}
      {filteredMovements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد حركات مخزون</h3>
            <p className="text-muted-foreground mb-4">
              لم يتم تسجيل أي حركات مخزون بعد
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMovements.map((movement) => (
            <Card key={movement.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      movement.movement_type === 'IN' ? 'bg-green-100' :
                      movement.movement_type === 'OUT' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      {getMovementIcon(movement.movement_type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {movement.reference_number || `حركة ${movement.id.slice(0, 8)}`}
                        </h3>
                        <Badge variant={getMovementTypeVariant(movement.movement_type)}>
                          {getMovementTypeLabel(movement.movement_type)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>النوع: {movement.reference_type || 'غير محدد'}</div>
                        <div className="flex items-center gap-4">
                          <div>الكمية: {movement.quantity} قطعة</div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(movement.created_at).toLocaleDateString('ar-SA')}
                          </div>
                        </div>
                        {movement.notes && (
                          <div>الملاحظات: {movement.notes}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className={`text-lg font-bold ${
                      movement.movement_type === 'IN' ? 'text-green-600' :
                      movement.movement_type === 'OUT' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {movement.movement_type === 'IN' ? '+' : 
                       movement.movement_type === 'OUT' ? '-' : '±'}{movement.quantity}
                    </div>
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