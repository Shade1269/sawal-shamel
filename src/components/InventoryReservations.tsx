import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Plus, 
  Calendar, 
  Package, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';

export const InventoryReservations: React.FC = () => {
  const { 
    inventoryItems,
    loading
  } = useInventoryManagement();

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    variant_id: '',
    quantity: '',
    order_id: '',
    expires_at: '',
    notes: ''
  });

  // Mock data for reservations since we don't have this table yet
  const reservations = [
    {
      id: '1',
      product_name: 'منتج تجريبي',
      variant_name: 'مقاس كبير',
      quantity: 5,
      order_id: 'ORD-2024-001',
      status: 'ACTIVE' as const,
      expires_at: '2024-12-31',
      created_at: '2024-01-15'
    },
    {
      id: '2',
      product_name: 'منتج آخر',
      variant_name: 'لون أزرق',
      quantity: 3,
      order_id: 'ORD-2024-002',
      status: 'ACTIVE' as const,
      expires_at: '2024-12-25',
      created_at: '2024-01-16'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement reservation creation
    console.log('Creating reservation:', formData);
    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      variant_id: '',
      quantity: '',
      order_id: '',
      expires_at: '',
      notes: ''
    });
  };

  const handleCancelReservation = async (reservationId: string) => {
    // TODO: Implement reservation cancellation
    console.log('Cancelling reservation:', reservationId);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'نشط';
      case 'FULFILLED': return 'مكتمل';
      case 'CANCELLED': return 'ملغي';
      case 'EXPIRED': return 'منتهي الصلاحية';
      default: return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'FULFILLED': return 'secondary';
      case 'CANCELLED': return 'destructive';
      case 'EXPIRED': return 'outline';
      default: return 'secondary';
    }
  };

  const availableProducts = inventoryItems.filter(p => p.quantity_available > 0);
  const totalReserved = reservations.reduce((sum, r) => sum + r.quantity, 0);
  const expiringSoon = reservations.filter(r => {
    const expiryDate = new Date(r.expires_at);
    const today = new Date();
    const daysUntilExpiry = (expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }).length;

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل الحجوزات...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Lock className="h-6 w-6" />
          حجوزات المخزون
        </h1>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              حجز جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء حجز مخزون</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product_id">المنتج</Label>
                <Select value={formData.product_id} onValueChange={(value) => 
                  setFormData({...formData, product_id: value, variant_id: ''})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.product?.title || product.sku}
                      </SelectItem>
                    ))}
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
              
              <div>
                <Label htmlFor="order_id">رقم الطلب (اختياري)</Label>
                <Input
                  id="order_id"
                  value={formData.order_id}
                  onChange={(e) => setFormData({...formData, order_id: e.target.value})}
                  placeholder="ORD-2024-001"
                />
              </div>
              
              <div>
                <Label htmlFor="expires_at">تاريخ انتهاء الحجز</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  إنشاء الحجز
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{reservations.length}</div>
                <div className="text-sm text-muted-foreground">حجوزات نشطة</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalReserved}</div>
                <div className="text-sm text-muted-foreground">قطعة محجوزة</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{expiringSoon}</div>
                <div className="text-sm text-muted-foreground">تنتهي قريباً</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الحجوزات */}
      {reservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات</h3>
            <p className="text-muted-foreground mb-4">
              لم يتم إنشاء أي حجوزات مخزون بعد
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Lock className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{reservation.product_name}</h3>
                        <Badge variant={getStatusVariant(reservation.status)}>
                          {getStatusLabel(reservation.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>المتغير: {reservation.variant_name}</div>
                        <div>الكمية المحجوزة: {reservation.quantity} قطعة</div>
                        {reservation.order_id && (
                          <div>رقم الطلب: {reservation.order_id}</div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            تم الإنشاء: {new Date(reservation.created_at).toLocaleDateString('ar-SA')}
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            ينتهي: {new Date(reservation.expires_at).toLocaleDateString('ar-SA')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {reservation.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelReservation(reservation.id)}
                    >
                      إلغاء الحجز
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};