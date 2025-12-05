import React from 'react';
import { UnifiedCard as Card, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle, UnifiedCardContent as CardContent } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, Calendar, Phone, User } from 'lucide-react';
import { ShipmentTracking, useShipmentTracking } from '@/hooks/useShipmentTracking';

interface ShipmentTrackingCardProps {
  shipment: ShipmentTracking;
  showEvents?: boolean;
  onViewDetails?: (shipmentId: string) => void;
}

const ShipmentTrackingCard: React.FC<ShipmentTrackingCardProps> = ({
  shipment,
  showEvents = false,
  onViewDetails
}) => {
  const { getStatusLabel, getStatusColor } = useShipmentTracking();

  return (
    <Card className="w-full" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {shipment.shipment_number}
          </CardTitle>
          <Badge className={getStatusColor(shipment.current_status)}>
            {getStatusLabel(shipment.current_status)}
          </Badge>
        </div>
        {shipment.tracking_number && (
          <div className="text-sm text-muted-foreground">
            رقم التتبع: {shipment.tracking_number}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* معلومات العميل */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{shipment.customer_name}</span>
          <Phone className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">{shipment.customer_phone}</span>
        </div>

        {/* الموقع الحالي */}
        {shipment.current_location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{shipment.current_location}</span>
          </div>
        )}

        {/* عنوان التسليم */}
        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-medium mb-2">عنوان التسليم</h4>
          <div className="text-sm text-muted-foreground">
            {typeof shipment.delivery_address === 'string' 
              ? shipment.delivery_address 
              : JSON.stringify(shipment.delivery_address)}
          </div>
        </div>

        {/* التواريخ */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          {shipment.estimated_delivery_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>التسليم المتوقع: {new Date(shipment.estimated_delivery_date).toLocaleDateString('ar-SA')}</span>
            </div>
          )}
          
          {shipment.actual_delivery_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span>تم التسليم: {new Date(shipment.actual_delivery_date).toLocaleDateString('ar-SA')}</span>
            </div>
          )}
        </div>

        {/* تفاصيل إضافية */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">تكلفة الشحن:</span>
            <span className="font-medium mr-2">{shipment.shipping_cost_sar} ر.س</span>
          </div>
          
          {shipment.cod_amount_sar > 0 && (
            <div>
              <span className="text-muted-foreground">الدفع عند التسليم:</span>
              <span className="font-medium mr-2">{shipment.cod_amount_sar} ر.س</span>
            </div>
          )}
        </div>

        {shipment.special_instructions && (
          <div className="bg-warning/10 p-3 rounded-lg border-l-4 border-warning">
            <h4 className="font-medium text-foreground mb-1">تعليمات خاصة</h4>
            <p className="text-sm text-muted-foreground">{shipment.special_instructions}</p>
          </div>
        )}

        <Separator />

        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            تم الإنشاء: {new Date(shipment.created_at).toLocaleDateString('ar-SA')}
          </div>
          
          {onViewDetails && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails(shipment.id)}
            >
              عرض التفاصيل
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentTrackingCard;