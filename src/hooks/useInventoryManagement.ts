import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location?: string;
  address?: any;
  manager_id?: string;
  shop_id: string;
  is_active: boolean;
  capacity_limit?: number;
  current_utilization: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  sku: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_on_order: number;
  reorder_level: number;
  max_stock_level?: number;
  unit_cost?: number;
  location_in_warehouse?: string;
  batch_number?: string;
  expiry_date?: string;
  last_counted_at?: string;
  created_at: string;
  updated_at: string;
  product?: any;
  warehouse?: any;
}

export interface InventoryMovement {
  id: string;
  inventory_item_id: string;
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  reason?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
  inventory_item?: {
    id: string;
    sku: string;
    product?: {
      title: string;
    };
    warehouse?: {
      name: string;
    };
  };
}

export interface StockAlert {
  id: string;
  inventory_item_id: string;
  alert_type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'EXPIRING_SOON';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  inventory_item?: {
    id: string;
    sku: string;
    product?: {
      title: string;
    };
    warehouse?: {
      name: string;
    };
  };
}

export interface InventoryReservation {
  id: string;
  inventory_item_id: string;
  order_id?: string;
  reserved_quantity: number;
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
  expires_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  inventory_item?: {
    id: string;
    sku: string;
    product?: {
      title: string;
    };
    warehouse?: {
      name: string;
    };
  };
}

export const useInventoryManagement = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [reservations, setReservations] = useState<InventoryReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // جلب البيانات
  const fetchWarehouses = async () => {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: 'خطأ في تحميل المخازن',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }
    
    setWarehouses(data || []);
  };

  const fetchInventoryItems = async () => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        product:products(id, title, sku),
        warehouse:warehouses(id, name, code)
      `)
      .order('updated_at', { ascending: false });
    
    if (error) {
      toast({
        title: 'خطأ في تحميل عناصر المخزون',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }
    
    setInventoryItems(data || []);
  };

  const fetchMovements = async () => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select(`
        *,
        inventory_item:inventory_items(
          id, sku, 
          product:products(title),
          warehouse:warehouses(name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      toast({
        title: 'خطأ في تحميل حركات المخزون',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }
    
    setMovements(data as InventoryMovement[] || []);
  };

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('stock_alerts')
      .select(`
        *,
        inventory_item:inventory_items(
          id, sku,
          product:products(title),
          warehouse:warehouses(name)
        )
      `)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: 'خطأ في تحميل التنبيهات',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }
    
    setAlerts(data as StockAlert[] || []);
  };

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('inventory_reservations')
      .select(`
        *,
        inventory_item:inventory_items(
          id, sku,
          product:products(title),
          warehouse:warehouses(name)
        )
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: 'خطأ في تحميل الحجوزات',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }
    
    setReservations(data as InventoryReservation[] || []);
  };

  // إدارة المخازن
  const createWarehouse = async (warehouseData: any) => {
    const { data, error } = await supabase
      .from('warehouses')
      .insert([warehouseData])
      .select()
      .single();

    if (error) {
      toast({
        title: 'خطأ في إضافة المخزن',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم إضافة المخزن بنجاح',
      description: 'تم حفظ البيانات'
    });

    await fetchWarehouses();
    return { success: true, data };
  };

  const updateWarehouse = async (id: string, updates: Partial<Warehouse>) => {
    const { data, error } = await supabase
      .from('warehouses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'خطأ في تحديث المخزن',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم تحديث المخزن بنجاح'
    });

    await fetchWarehouses();
    return { success: true, data };
  };

  // إدارة عناصر المخزون
  const createInventoryItem = async (itemData: any) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([itemData])
      .select()
      .single();

    if (error) {
      toast({
        title: 'خطأ في إضافة عنصر المخزون',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم إضافة عنصر المخزون بنجاح'
    });

    await fetchInventoryItems();
    return { success: true, data };
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        title: 'خطأ في تحديث عنصر المخزون',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم تحديث عنصر المخزون بنجاح'
    });

    await fetchInventoryItems();
    return { success: true, data };
  };

  // حركات المخزون
  const addMovement = async (movementData: any) => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert([movementData])
      .select()
      .single();

    if (error) {
      toast({
        title: 'خطأ في تسجيل حركة المخزون',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    // تحديث كمية المخزون
    const inventoryItem = inventoryItems.find(item => item.id === movementData.inventory_item_id);
    if (inventoryItem) {
      let newQuantity = inventoryItem.quantity_available;
      
      if (movementData.movement_type === 'IN') {
        newQuantity += movementData.quantity || 0;
      } else if (movementData.movement_type === 'OUT') {
        newQuantity -= movementData.quantity || 0;
      }

      await updateInventoryItem(inventoryItem.id, { quantity_available: newQuantity });
    }

    toast({
      title: 'تم تسجيل حركة المخزون بنجاح'
    });

    await fetchMovements();
    return { success: true, data };
  };

  // حل التنبيهات
  const resolveAlert = async (alertId: string) => {
    const { data, error } = await supabase
      .from('stock_alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      toast({
        title: 'خطأ في حل التنبيه',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم حل التنبيه بنجاح'
    });

    await fetchAlerts();
    return { success: true, data };
  };

  // حجز المخزون
  const createReservation = async (reservationData: any) => {
    const { data, error } = await supabase
      .from('inventory_reservations')
      .insert([reservationData])
      .select()
      .single();

    if (error) {
      toast({
        title: 'خطأ في حجز المخزون',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم حجز المخزون بنجاح'
    });

    await fetchReservations();
    return { success: true, data };
  };

  const cancelReservation = async (reservationId: string) => {
    const { data, error } = await supabase
      .from('inventory_reservations')
      .update({ status: 'CANCELLED' })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) {
      toast({
        title: 'خطأ في إلغاء الحجز',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error };
    }

    toast({
      title: 'تم إلغاء الحجز بنجاح'
    });

    await fetchReservations();
    return { success: true, data };
  };

  // تحليلات المخزون
  const getInventoryAnalytics = () => {
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(item => 
      item.quantity_available <= item.reorder_level && item.reorder_level > 0
    ).length;
    const outOfStockItems = inventoryItems.filter(item => 
      item.quantity_available === 0
    ).length;
    const totalValue = inventoryItems.reduce((sum, item) => 
      sum + (item.quantity_available * (item.unit_cost || 0)), 0
    );

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      criticalAlerts: alerts.filter(alert => alert.priority === 'CRITICAL').length,
      activeReservations: reservations.length
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchWarehouses(),
        fetchInventoryItems(),
        fetchMovements(),
        fetchAlerts(),
        fetchReservations()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    // البيانات
    warehouses,
    inventoryItems,
    movements,
    alerts,
    reservations,
    loading,
    
    // وظائف المخازن
    createWarehouse,
    updateWarehouse,
    
    // وظائف المخزون
    createInventoryItem,
    updateInventoryItem,
    addMovement,
    
    // وظائف التنبيهات
    resolveAlert,
    
    // وظائف الحجوزات
    createReservation,
    cancelReservation,
    
    // تحليلات
    getInventoryAnalytics,
    
    // إعادة تحميل البيانات
    refetch: async () => {
      await Promise.all([
        fetchWarehouses(),
        fetchInventoryItems(),
        fetchMovements(),
        fetchAlerts(),
        fetchReservations()
      ]);
    }
  };
};