import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  RotateCcw, 
  Package, 
  Calendar,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

export const ReturnsManagement: React.FC = () => {
  const { productVariants, loading } = useInventoryManagement();

  const [showDialog, setShowDialog] = useState(false);
  
  // Mock data for returns since we don't have full implementation yet
  const productReturns = [
    {
      id: '1',
      return_number: 'RET-2024-001',
      order_id: 'ORD-2024-001',
      customer_name: 'محمد أحمد',
      return_reason: 'defective',
      status: 'pending',
      total_amount: 250.00,
      created_at: '2024-01-15T10:30:00Z',
      items: [
        {
          id: '1',
          product_name: 'هاتف ذكي',
          variant_name: 'أسود - 128GB',
          quantity: 1,
          unit_price: 250.00,
          return_reason: 'defective'
        }
      ]
    },
    {
      id: '2',
      return_number: 'RET-2024-002',
      order_id: 'ORD-2024-002',
      customer_name: 'فاطمة خالد',
      return_reason: 'wrong_item',
      status: 'approved',
      total_amount: 150.00,
      created_at: '2024-01-14T14:20:00Z',
      items: [
        {
          id: '2',
          product_name: 'قميص قطني',
          variant_name: 'أزرق - مقاس L',
          quantity: 2,
          unit_price: 75.00,
          return_reason: 'wrong_item'
        }
      ]
    }
  ];
  
  const [formData, setFormData] = useState({
    order_id: '',
    customer_name: '',
    return_reason: '',
    notes: '',
    items: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement actual create return functionality
    console.log('Return data:', formData);
    
    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      order_id: '',
      customer_name: '',
      return_reason: '',
      notes: '',
      items: []
    });
  };

  const getReturnReasonLabel = (reason: string) => {
    switch (reason) {
      case 'defective': return 'عيب في المنتج';
      case 'wrong_item': return 'منتج خاطئ';
      case 'not_as_described': return 'لا يطابق الوصف';
      case 'damaged_shipping': return 'تلف أثناء الشحن';
      case 'customer_changed_mind': return 'تغيير رأي العميل';
      default: return reason;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      case 'processed': return 'تم المعالجة';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'processed': return 'secondary';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      case 'processed': return <Package className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل المرتجعات...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RotateCcw className="h-6 w-6" />
          إدارة المرتجعات
        </h1>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              مرتجع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة مرتجع جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="order_id">رقم الطلب</Label>
                <Input
                  id="order_id"
                  value={formData.order_id}
                  onChange={(e) => setFormData({...formData, order_id: e.target.value})}
                  required
                  placeholder="ORD-2024-001"
                />
              </div>
              
              <div>
                <Label htmlFor="customer_name">اسم العميل</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  required
                  placeholder="محمد أحمد"
                />
              </div>
              
              <div>
                <Label htmlFor="return_reason">سبب الإرجاع</Label>
                <Select value={formData.return_reason} onValueChange={(value) => 
                  setFormData({...formData, return_reason: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر السبب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defective">عيب في المنتج</SelectItem>
                    <SelectItem value="wrong_item">منتج خاطئ</SelectItem>
                    <SelectItem value="not_as_described">لا يطابق الوصف</SelectItem>
                    <SelectItem value="damaged_shipping">تلف أثناء الشحن</SelectItem>
                    <SelectItem value="customer_changed_mind">تغيير رأي العميل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="تفاصيل إضافية عن المرتجع"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  إضافة المرتجع
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {productReturns.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">في الانتظار</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {productReturns.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">موافق عليها</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {productReturns.filter(r => r.status === 'rejected').length}
                </div>
                <div className="text-sm text-muted-foreground">مرفوضة</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RotateCcw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{productReturns.length}</div>
                <div className="text-sm text-muted-foreground">إجمالي المرتجعات</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة المرتجعات */}
      {productReturns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مرتجعات</h3>
            <p className="text-muted-foreground mb-4">
              لم يتم تسجيل أي مرتجعات بعد
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {productReturns.map((returnItem) => (
            <Card key={returnItem.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      returnItem.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                      returnItem.status === 'approved' ? 'bg-green-100 text-green-600' :
                      returnItem.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {getStatusIcon(returnItem.status)}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {returnItem.return_number}
                        <Badge variant={getStatusVariant(returnItem.status)}>
                          {getStatusLabel(returnItem.status)}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        طلب رقم: {returnItem.order_id} • العميل: {returnItem.customer_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold">{returnItem.total_amount} ر.س</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(returnItem.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">سبب الإرجاع:</span>
                  <Badge variant="outline">
                    {getReturnReasonLabel(returnItem.return_reason)}
                  </Badge>
                </div>
                
                {/* عناصر المرتجع */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 p-3">
                    <h4 className="font-medium">العناصر المرتجعة</h4>
                  </div>
                  <div className="divide-y">
                    {returnItem.items.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.variant_name} • الكمية: {item.quantity}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {getReturnReasonLabel(item.return_reason)}
                          </Badge>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{item.unit_price} ر.س</div>
                          <div className="text-sm text-muted-foreground">للقطعة</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* أزرار الإجراءات */}
                {returnItem.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      <CheckCircle className="h-4 w-4 ml-1" />
                      موافقة
                    </Button>
                    <Button size="sm" variant="destructive">
                      <AlertTriangle className="h-4 w-4 ml-1" />
                      رفض
                    </Button>
                  </div>
                )}
                
                {returnItem.status === 'approved' && (
                  <Button size="sm" variant="outline">
                    <Package className="h-4 w-4 ml-1" />
                    معالجة الإرجاع
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};