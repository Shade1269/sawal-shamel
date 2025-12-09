import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Shipment = Database['public']['Tables']['shipments']['Row'];
type ShipmentInsert = Database['public']['Tables']['shipments']['Insert'];
/* eslint-disable @typescript-eslint/no-unused-vars */
type ShipmentEvent = Database['public']['Tables']['shipment_events']['Row'];
/* eslint-enable @typescript-eslint/no-unused-vars */

export interface ShipmentHistory {
  event_id: string;
  event_type: string;
  event_description: string;
  location: string | null;
  event_timestamp: string;
  created_at: string;
}

export class ShipmentRepository {
  /**
   * Get shipment by ID
   */
  static async getShipmentById(shipmentId: string): Promise<Shipment | null> {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Get shipment history using security definer function
   */
  static async getShipmentHistory(shipmentId: string): Promise<ShipmentHistory[]> {
    const { data, error } = await supabase
      .rpc('get_shipment_history', {
        p_shipment_id: shipmentId
      });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get latest shipment location using security definer function
   */
  static async getLatestLocation(shipmentId: string): Promise<string | null> {
    const { data, error } = await supabase
      .rpc('get_latest_shipment_location', {
        p_shipment_id: shipmentId
      });

    if (error) throw error;
    return data;
  }

  /**
   * Get latest shipment event
   */
  static async getLatestEvent(shipmentId: string) {
    const { data, error } = await supabase
      .rpc('get_latest_shipment_event', {
        p_shipment_id: shipmentId
      });

    if (error) throw error;
    return data;
  }

  /**
   * Create a new shipment
   */
  static async createShipment(shipment: ShipmentInsert): Promise<Shipment> {
    const { data, error } = await supabase
      .from('shipments')
      .insert(shipment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update shipment status
   */
  static async updateShipmentStatus(
    shipmentId: string,
    status: string,
    location?: string
  ): Promise<Shipment> {
    const updates: Partial<Shipment> = { 
      status: status as any,
      updated_at: new Date().toISOString()
    };
    
    if (location) {
      updates.current_location = location;
    }

    const { data, error } = await supabase
      .from('shipments')
      .update(updates)
      .eq('id', shipmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get shipments for an order
   */
  static async getOrderShipments(orderHubId: string): Promise<Shipment[]> {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_hub_id', orderHubId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
