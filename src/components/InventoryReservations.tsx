import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Lock, 
  Clock, 
  Package, 
  X,
  Calendar,
  User
} from 'lucide-react';
import { useInventoryManagement, type InventoryReservation } from '@/hooks/useInventoryManagement';

export const InventoryReservations: React.FC = () => {
  const {
    reservations,
    inventoryItems,
    loading,
    createReservation,
    cancelReservation
  } = useInventoryManagement();

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    inventory_item_id: '',
    reserved_quantity: 1,
    order_id: '',
    expires_at: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const reservationData = {
      ...formData,
      expires_at: formData.expires_at || undefined
    };

    const result = await createReservation(reservationData);
    
    if (result.success) {
      setShowDialog(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      inventory_item_id: '',
      reserved_quantity: 1,
      order_id: '',
      expires_at: ''
    });
  };

  const handleCancelReservation = async (reservationId: string) => {
    await cancelReservation(reservationId);
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

  const availableItems = inventoryItems.filter(item => item.quantity_available > 0);
  
  // حساب إحصائيات الحجوزات
  const totalReserved = reservations.reduce((sum, res) => sum + res.reserved_quantity, 0);
  const expiringSoon = reservations.filter(res => {
    if (!res.expires_at) return false;
    const expiryDate = new Date(res.expires_at);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return expiryDate <= tomorrow;
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
              <DialogTitle>إنشاء حجز جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="inventory_item_id">المنتج</Label>
                <Select
                  value={formData.inventory_item_id}
                  onValueChange={(value) => setFormData({...formData, inventory_item_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المنتج" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.product?.title} - متوفر: {item.quantity_available}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reserved_quantity">الكمية المحجوزة</Label>
                <Input
                  id="reserved_quantity"
                  type="number"
                  min="1"
                  value={formData.reserved_quantity}
                  onChange={(e) => setFormData({...formData, reserved_quantity: parseInt(e.target.value) || 1})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="order_id">رقم الطلب (اختياري)</Label>
                <Input
                  id="order_id"
                  value={formData.order_id}
                  onChange={(e) => setFormData({...formData, order_id: e.target.value})}
                  placeholder="ORD-001"
                />
              </div>
              
              <div>
                <Label htmlFor="expires_at">تاريخ انتهاء الحجز (اختياري)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
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

      {/* إحصائيات الحجوزات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{reservations.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي الحجوزات النشطة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalReserved}</div>
            <div className="text-sm text-muted-foreground">إجمالي القطع المحجوزة</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{expiringSoon}</div>
            <div className="text-sm text-muted-foreground">تنتهي خلال 24 ساعة</div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الحجوزات */}
      {reservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد حجوزات نشطة</h3>
            <p className="text-muted-foreground mb-4">
              لم يتم إنشاء أي حجوزات للمخزون بعد
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                      <Lock className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {reservation.inventory_item?.product?.title || 'منتج غير محدد'}
                        </h3>
                        <Badge variant={getStatusVariant(reservation.status)}>
                          {getStatusLabel(reservation.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        SKU: {reservation.inventory_item?.sku} | 
                        المخزن: {reservation.inventory_item?.warehouse?.name}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>الكمية المحجوزة: {reservation.reserved_quantity}</span>
                        </div>
                        
                        {reservation.order_id && (
                          <div className="flex items-center gap-2 text-sm">
                            <span>رقم الطلب: {reservation.order_id}</span>
                          </div>
                        )}
                      </div>

                      <Separator className="my-3" />
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>تم الإنشاء: {new Date(reservation.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                        
                        {reservation.expires_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>ينتهي في: {new Date(reservation.expires_at).toLocaleDateString('ar-SA')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {reservation.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 ml-1" />
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