import React, { useState, useEffect } from 'react';
import { 
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardHeader,
  EnhancedCardTitle,
  ResponsiveLayout,
  ResponsiveGrid,
  EnhancedButton,
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Edit, Eye, Truck, MapPin } from 'lucide-react';
import { useShipmentTracking } from '@/hooks/useShipmentTracking';
import { useShippingManagement } from '@/hooks/useShippingManagement';
import ShipmentTrackingCard from '@/components/ShipmentTrackingCard';
import ShipmentEventsTimeline from '@/components/ShipmentEventsTimeline';

const ShipmentManagement: React.FC = () => {
  const { 
    shipments, 
    events, 
    loading, 
    fetchShipmentsByShop, 
    fetchShipmentEvents,
    createShipment, 
    addShipmentEvent 
  } = useShipmentTracking();
  
  const { providers } = useShippingManagement();

  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const [newShipment, setNewShipment] = useState({
    order_id: '',
    shipping_provider_id: '',
    customer_name: '',
    customer_phone: '',
    pickup_address: {
      address: '',
      city: '',
      postal_code: ''
    },
    delivery_address: {
      address: '',
      city: '',
      postal_code: ''
    },
    weight_kg: 0,
    cod_amount_sar: 0,
    shipping_cost_sar: 0,
    special_instructions: ''
  });

  const [newEvent, setNewEvent] = useState({
    event_type: '',
    event_description: '',
    location: ''
  });

  // Mock shop ID - في التطبيق الحقيقي سيأتي من السياق
  const shopId = '123e4567-e89b-12d3-a456-426614174000';

  useEffect(() => {
    fetchShipmentsByShop(shopId);
  }, []);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createShipment({
      ...newShipment,
      pickup_address: JSON.stringify(newShipment.pickup_address),
      delivery_address: JSON.stringify(newShipment.delivery_address)
    });

    if (result.success) {
      setShowCreateDialog(false);
      resetNewShipment();
      fetchShipmentsByShop(shopId);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShipment) return;

    const result = await addShipmentEvent(selectedShipment.id, newEvent);
    
    if (result.success) {
      setShowEventDialog(false);
      resetNewEvent();
      fetchShipmentEvents(selectedShipment.id);
      fetchShipmentsByShop(shopId);
    }
  };

  const resetNewShipment = () => {
    setNewShipment({
      order_id: '',
      shipping_provider_id: '',
      customer_name: '',
      customer_phone: '',
      pickup_address: {
        address: '',
        city: '',
        postal_code: ''
      },
      delivery_address: {
        address: '',
        city: '',
        postal_code: ''
      },
      weight_kg: 0,
      cod_amount_sar: 0,
      shipping_cost_sar: 0,
      special_instructions: ''
    });
  };

  const resetNewEvent = () => {
    setNewEvent({
      event_type: '',
      event_description: '',
      location: ''
    });
  };

  const handleViewDetails = async (shipmentId: string) => {
    const shipment = shipments.find(s => s.id === shipmentId);
    if (shipment) {
      setSelectedShipment(shipment);
      await fetchShipmentEvents(shipmentId);
      setShowDetailsDialog(true);
    }
  };

  if (loading && shipments.length === 0) {
    return <div className="p-4 text-center">جاري تحميل الشحنات...</div>;
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الشحنات</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetNewShipment}>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء شحنة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء شحنة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateShipment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">اسم العميل</Label>
                  <Input
                    id="customer_name"
                    value={newShipment.customer_name}
                    onChange={(e) => setNewShipment({...newShipment, customer_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">رقم الهاتف</Label>
                  <Input
                    id="customer_phone"
                    value={newShipment.customer_phone}
                    onChange={(e) => setNewShipment({...newShipment, customer_phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="provider">شركة الشحن</Label>
                <Select
                  value={newShipment.shipping_provider_id}
                  onValueChange={(value) => setNewShipment({...newShipment, shipping_provider_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر شركة الشحن" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>عنوان الاستلام</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="العنوان"
                    value={newShipment.pickup_address.address}
                    onChange={(e) => setNewShipment({
                      ...newShipment,
                      pickup_address: {...newShipment.pickup_address, address: e.target.value}
                    })}
                    required
                  />
                  <Input
                    placeholder="المدينة"
                    value={newShipment.pickup_address.city}
                    onChange={(e) => setNewShipment({
                      ...newShipment,
                      pickup_address: {...newShipment.pickup_address, city: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>عنوان التسليم</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="العنوان"
                    value={newShipment.delivery_address.address}
                    onChange={(e) => setNewShipment({
                      ...newShipment,
                      delivery_address: {...newShipment.delivery_address, address: e.target.value}
                    })}
                    required
                  />
                  <Input
                    placeholder="المدينة"
                    value={newShipment.delivery_address.city}
                    onChange={(e) => setNewShipment({
                      ...newShipment,
                      delivery_address: {...newShipment.delivery_address, city: e.target.value}
                    })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">الوزن (كجم)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={newShipment.weight_kg}
                    onChange={(e) => setNewShipment({...newShipment, weight_kg: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="cod_amount">دفع عند التسليم (ر.س)</Label>
                  <Input
                    id="cod_amount"
                    type="number"
                    step="0.01"
                    value={newShipment.cod_amount_sar}
                    onChange={(e) => setNewShipment({...newShipment, cod_amount_sar: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_cost">تكلفة الشحن (ر.س)</Label>
                  <Input
                    id="shipping_cost"
                    type="number"
                    step="0.01"
                    value={newShipment.shipping_cost_sar}
                    onChange={(e) => setNewShipment({...newShipment, shipping_cost_sar: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">تعليمات خاصة</Label>
                <Textarea
                  id="instructions"
                  value={newShipment.special_instructions}
                  onChange={(e) => setNewShipment({...newShipment, special_instructions: e.target.value})}
                  placeholder="أي تعليمات خاصة للتسليم..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  إنشاء الشحنة
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">جميع الشحنات</TabsTrigger>
          <TabsTrigger value="preparing">قيد التحضير</TabsTrigger>
          <TabsTrigger value="transit">في الطريق</TabsTrigger>
          <TabsTrigger value="delivered">مُسلمة</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {shipments.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد شحنات حالياً
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {shipments.map((shipment) => (
                <ShipmentTrackingCard
                  key={shipment.id}
                  shipment={shipment}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preparing">
          <div className="grid gap-4">
            {shipments.filter(s => s.current_status === 'PREPARING').map((shipment) => (
              <ShipmentTrackingCard
                key={shipment.id}
                shipment={shipment}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transit">
          <div className="grid gap-4">
            {shipments.filter(s => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s.current_status)).map((shipment) => (
              <ShipmentTrackingCard
                key={shipment.id}
                shipment={shipment}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="delivered">
          <div className="grid gap-4">
            {shipments.filter(s => s.current_status === 'DELIVERED').map((shipment) => (
              <ShipmentTrackingCard
                key={shipment.id}
                shipment={shipment}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* نافذة تفاصيل الشحنة */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedShipment && (
            <>
              <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle>تفاصيل الشحنة {selectedShipment.shipment_number}</DialogTitle>
                <Button
                  onClick={() => {
                    setShowEventDialog(true);
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة حدث
                </Button>
              </DialogHeader>
              
              <div className="space-y-6">
                <ShipmentTrackingCard shipment={selectedShipment} />
                <ShipmentEventsTimeline events={events} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة إضافة حدث */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة حدث جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <Label htmlFor="event_type">نوع الحدث</Label>
              <Select
                value={newEvent.event_type}
                onValueChange={(value) => setNewEvent({...newEvent, event_type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الحدث" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PICKED_UP">تم الاستلام</SelectItem>
                  <SelectItem value="IN_TRANSIT">في الطريق</SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">خرج للتوصيل</SelectItem>
                  <SelectItem value="DELIVERED">تم التوصيل</SelectItem>
                  <SelectItem value="FAILED_DELIVERY">فشل التوصيل</SelectItem>
                  <SelectItem value="RETURNED">مُرتجع</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="event_description">وصف الحدث</Label>
              <Input
                id="event_description"
                value={newEvent.event_description}
                onChange={(e) => setNewEvent({...newEvent, event_description: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                placeholder="الموقع الحالي"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEventDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit">
                إضافة الحدث
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShipmentManagement;