import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, MapPin, Package } from 'lucide-react';
import { ShipmentEvent } from '@/hooks/useShipmentTracking';

interface ShipmentEventsTimelineProps {
  events: ShipmentEvent[];
}

const ShipmentEventsTimeline: React.FC<ShipmentEventsTimelineProps> = ({ events }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'CREATED':
        return <Package className="h-4 w-4" />;
      case 'PICKED_UP':
      case 'IN_TRANSIT':
        return <MapPin className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'DELIVERED':
        return 'bg-success/10 border-success/30 text-success';
      case 'FAILED_DELIVERY':
      case 'CANCELLED':
        return 'bg-destructive/10 border-destructive/30 text-destructive';
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return 'bg-info/10 border-info/30 text-info';
      case 'PICKED_UP':
        return 'bg-premium/10 border-premium/30 text-premium';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground" dir="rtl">
          لا توجد أحداث متاحة لهذه الشحنة
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <h3 className="text-lg font-semibold">تتبع الشحنة</h3>
      
      <div className="relative">
        {/* الخط الزمني */}
        <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-border"></div>
        
        <div className="space-y-6">
          {events.map((event, _index) => (
            <div key={event.id} className="relative flex items-start gap-4">
              {/* أيقونة الحدث */}
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${getEventColor(event.event_type)}`}>
                {getEventIcon(event.event_type)}
              </div>
              
              {/* محتوى الحدث */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{event.event_description}</h4>
                  <Badge variant="outline" className="text-xs">
                    {event.source}
                  </Badge>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                  {new Date(event.event_timestamp).toLocaleString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 p-2 bg-muted rounded text-xs">
                    <details>
                      <summary className="cursor-pointer">تفاصيل إضافية</summary>
                      <pre className="mt-1 text-xs overflow-auto">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipmentEventsTimeline;