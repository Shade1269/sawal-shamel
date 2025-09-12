import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShipmentTracking {
  id: string;
  shipment_number: string;
  order_id: string;
  shipping_provider_id?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  current_status: string;
  current_location?: string;
  pickup_address: any;
  delivery_address: any;
  weight_kg?: number;
  dimensions?: any;
  insurance_amount_sar: number;
  cod_amount_sar: number;
  shipping_cost_sar: number;
  special_instructions?: string;
  customer_name: string;
  customer_phone: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  event_type: string;
  event_description: string;
  location?: string;
  coordinates?: any;
  event_timestamp: string;
  source: string;
  metadata: any;
  created_at: string;
}

export const useShipmentTracking = () => {
  const [shipments, setShipments] = useState<ShipmentTracking[]>([]);
  const [events, setEvents] = useState<ShipmentEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchShipmentsByShop = async (shopId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipments_tracking')
        .select(`
          *,
          ecommerce_orders!inner(
            id,
            shop_id
          )
        `)
        .eq('ecommerce_orders.shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error: any) {
      toast({
        title: 'خطأ في تحميل الشحنات',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentByTracking = async (trackingNumber: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipments_tracking')
        .select('*')
        .eq('shipment_number', trackingNumber)
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message === 'No rows returned' ? 'رقم الشحنة غير موجود' : error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentEvents = async (shipmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('shipment_events')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('event_timestamp', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: 'خطأ في تحميل أحداث الشحنة',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const createShipment = async (shipmentData: any) => {
    try {
      const { data, error } = await supabase
        .from('shipments_tracking')
        .insert([shipmentData])
        .select()
        .maybeSingle();

      if (error) throw error;

      // إضافة حدث بداية الشحنة
      await addShipmentEvent(data.id, {
        event_type: 'CREATED',
        event_description: 'تم إنشاء الشحنة'
      });

      toast({
        title: 'تم إنشاء الشحنة بنجاح',
        description: `رقم الشحنة: ${data.shipment_number}`
      });

      return { success: true, data };
    } catch (error: any) {
      toast({
        title: 'خطأ في إنشاء الشحنة',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  const updateShipment = async (id: string, updates: Partial<ShipmentTracking>) => {
    try {
      const { data, error } = await supabase
        .from('shipments_tracking')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;

      toast({
        title: 'تم تحديث الشحنة بنجاح'
      });

      return { success: true, data };
    } catch (error: any) {
      toast({
        title: 'خطأ في تحديث الشحنة',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  const addShipmentEvent = async (shipmentId: string, eventData: {
    event_type: string;
    event_description: string;
    location?: string;
    coordinates?: any;
  }) => {
    try {
      const { data, error } = await supabase
        .from('shipment_events')
        .insert([{
          shipment_id: shipmentId,
          ...eventData
        }])
        .select()
        .maybeSingle();

      if (error) throw error;

      toast({
        title: 'تم إضافة حدث الشحنة'
      });

      return { success: true, data };
    } catch (error: any) {
      toast({
        title: 'خطأ في إضافة حدث الشحنة',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      'PREPARING': 'قيد التحضير',
      'PICKED_UP': 'تم الاستلام',
      'IN_TRANSIT': 'في الطريق',
      'OUT_FOR_DELIVERY': 'خرج للتوصيل',
      'DELIVERED': 'تم التوصيل',
      'FAILED_DELIVERY': 'فشل التوصيل',
      'RETURNED': 'مُرتجع',
      'CANCELLED': 'مُلغى'
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'PREPARING': 'bg-yellow-100 text-yellow-800',
      'PICKED_UP': 'bg-blue-100 text-blue-800',
      'IN_TRANSIT': 'bg-purple-100 text-purple-800',
      'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'FAILED_DELIVERY': 'bg-red-100 text-red-800',
      'RETURNED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return {
    shipments,
    events,
    loading,
    fetchShipmentsByShop,
    fetchShipmentByTracking,
    fetchShipmentEvents,
    createShipment,
    updateShipment,
    addShipmentEvent,
    getStatusLabel,
    getStatusColor
  };
};