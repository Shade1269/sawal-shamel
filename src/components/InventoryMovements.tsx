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
  Search,
  ArrowUpDown,
  FileText,
  Hash
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
      case 'IN': return <ArrowDown className="h-4 w-4" />;
      case 'OUT': return <ArrowUp className="h-4 w-4" />;
      case 'ADJUSTMENT': return <RotateCcw className="h-4 w-4" />;
      case 'TRANSFER': return <ArrowUpDown className="h-4 w-4" />;
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

  const getMovementCardClass = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20';
      case 'OUT': return 'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20';
      case 'ADJUSTMENT': return 'bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20';
      case 'TRANSFER': return 'bg-gradient-to-r from-muted/50 to-muted/20 border-muted-foreground/20';
      default: return 'bg-card border-border/50';
    }
  };

  const filteredMovements = inventoryMovements.filter((movement) => {
    const matchesType = filterType === 'all' || movement.movement_type === filterType;
    const matchesSearch = !searchTerm || 
      movement.movement_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const getAvailableVariants = (productId: string) => {
    return productVariants.filter(variant => variant.warehouse_product_id === productId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل حركات المخزون...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
            <ArrowUpDown className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">حركات المخزون</h2>
            <p className="text-muted-foreground">تسجيل ومتابعة حركات دخول وخروج المخزون</p>
          </div>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow transition-all duration-300"
            >
              <Plus className="h-4 w-4 ml-2" />
              حركة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">إضافة حركة مخزون جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="warehouse_product_id">المنتج</Label>
                <Select value={formData.warehouse_product_id} onValueChange={(value) => 
                  setFormData({...formData, warehouse_product_id: value, product_variant_id: ''})
                }>
                  <SelectTrigger className="border-border/50 focus:border-primary">
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
                    <SelectTrigger className="border-border/50 focus:border-primary">
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
                    <SelectTrigger className="border-border/50 focus:border-primary">
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
                    className="border-border/50 focus:border-primary"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reference_type">نوع المرجع</Label>
                  <Select value={formData.reference_type} onValueChange={(value) => 
                    setFormData({...formData, reference_type: value})
                  }>
                    <SelectTrigger className="border-border/50 focus:border-primary">
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
                    className="border-border/50 focus:border-primary"
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
                  className="border-border/50 focus:border-primary"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                  إضافة الحركة
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* شريط البحث والفلاتر */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في الحركات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border/50 focus:border-primary"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48 border-border/50 focus:border-primary">
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
        <Card className="border-dashed border-2 border-muted-foreground/30 bg-muted/20">
          <CardContent className="text-center py-12">
            <div className="p-4 rounded-full bg-muted mb-4 mx-auto w-fit">
              <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد حركات مخزون</h3>
            <p className="text-muted-foreground mb-4">
              لم يتم تسجيل أي حركات مخزون بعد
            </p>
            <Button onClick={resetForm} variant="outline" className="border-primary hover:bg-primary hover:text-primary-foreground">
              إضافة حركة جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMovements.map((movement) => (
            <Card key={movement.id} className={`relative overflow-hidden border transition-all duration-300 hover:shadow-luxury hover:-translate-y-1 ${getMovementCardClass(movement.movement_type)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${
                      movement.movement_type === 'IN' ? 'bg-primary/20 text-primary' :
                      movement.movement_type === 'OUT' ? 'bg-destructive/20 text-destructive' :
                      movement.movement_type === 'ADJUSTMENT' ? 'bg-accent/20 text-accent' :
                      'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {getMovementIcon(movement.movement_type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-bold text-lg text-foreground">
                          {movement.movement_number || `حركة ${movement.id.slice(0, 8)}`}
                        </h3>
                        <Badge variant={getMovementTypeVariant(movement.movement_type)} className="font-medium">
                          {getMovementTypeLabel(movement.movement_type)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>النوع: {movement.reference_type || 'غير محدد'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            <span>الكمية: {movement.quantity} قطعة</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(movement.created_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        {movement.notes && (
                          <div className="p-3 bg-card/50 rounded-lg border border-border/30">
                            <div className="text-xs text-muted-foreground mb-1">الملاحظات:</div>
                            <div className="text-sm text-foreground">{movement.notes}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className={`text-2xl font-bold ${
                      movement.movement_type === 'IN' ? 'text-primary' :
                      movement.movement_type === 'OUT' ? 'text-destructive' :
                      'text-accent'
                    }`}>
                      {movement.movement_type === 'IN' ? '+' : 
                       movement.movement_type === 'OUT' ? '-' : '±'}{movement.quantity.toLocaleString('ar')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(movement.created_at).toLocaleTimeString('ar-SA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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