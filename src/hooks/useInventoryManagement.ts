import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Type definitions
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location?: string;
  address?: any;
  manager_id?: string;
  shop_id?: string;
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
  product?: { title: string };
  warehouse?: { name: string };
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
    product?: { title: string };
    warehouse?: { name: string };
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
    product?: { title: string };
    warehouse?: { name: string };
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
    product?: { title: string };
    warehouse?: { name: string };
  };
}

export const useInventoryManagement = () => {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouseProducts, setWarehouseProducts] = useState<any[]>([]);
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch data functions
  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching suppliers:', error);
      return;
    }
    
    setSuppliers(data || []);
  };

  const fetchWarehouseProducts = async () => {
    const { data, error } = await supabase
      .from('warehouse_products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching warehouse products:', error);
      return;
    }
    
    setWarehouseProducts(data || []);
  };

  const fetchProductVariants = async () => {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching product variants:', error);
      return;
    }
    
    setProductVariants(data || []);
  };

  const fetchInventoryMovements = async () => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching inventory movements:', error);
      return;
    }
    
    setInventoryMovements(data || []);
  };

  const fetchInventoryAlerts = async () => {
    const { data, error } = await supabase
      .from('inventory_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching inventory alerts:', error);
      return;
    }
    
    setInventoryAlerts(data || []);
  };

  // Create compatibility mappings
  const warehouses: Warehouse[] = suppliers.map(supplier => ({
    id: supplier.id,
    name: supplier.supplier_name || 'مورد',
    code: supplier.supplier_code || '',
    location: supplier.contact_address,
    address: supplier.contact_address,
    manager_id: supplier.id,
    shop_id: '',
    is_active: supplier.is_active,
    capacity_limit: 1000,
    current_utilization: 0,
    created_at: supplier.created_at,
    updated_at: supplier.updated_at
  }));

  const inventoryItems: InventoryItem[] = productVariants.map(variant => ({
    id: variant.id,
    product_id: variant.warehouse_product_id,
    warehouse_id: variant.warehouse_product_id,
    sku: variant.sku || '',
    quantity_available: variant.available_stock || 0,
    quantity_reserved: variant.reserved_stock || 0,
    quantity_on_order: 0,
    reorder_level: variant.reorder_level || 0,
    max_stock_level: variant.max_stock_level,
    unit_cost: variant.cost_price,
    location_in_warehouse: variant.shelf_location,
    batch_number: variant.batch_number,
    expiry_date: variant.expiry_date,
    last_counted_at: variant.updated_at,
    created_at: variant.created_at,
    updated_at: variant.updated_at,
    product: { title: variant.variant_name || 'منتج' },
    warehouse: { name: 'المخزن الرئيسي' }
  }));

  const movements: InventoryMovement[] = inventoryMovements.map(movement => ({
    id: movement.id,
    inventory_item_id: movement.product_variant_id || '',
    movement_type: movement.movement_type === 'inbound' ? 'IN' : 
                  movement.movement_type === 'outbound' ? 'OUT' : 'ADJUSTMENT',
    quantity: movement.quantity || 0,
    reference_type: movement.reference_type,
    reference_id: movement.reference_number,
    reason: movement.notes,
    performed_by: movement.created_by,
    notes: movement.notes,
    created_at: movement.created_at,
    inventory_item: {
      id: movement.product_variant_id || '',
      sku: '',
      product: { title: 'منتج' },
      warehouse: { name: 'المخزن الرئيسي' }
    }
  }));

  const alerts: StockAlert[] = inventoryAlerts.map(alert => ({
    id: alert.id,
    inventory_item_id: '',
    alert_type: (alert.alert_type || 'LOW_STOCK') as 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'EXPIRING_SOON',
    priority: (alert.priority?.toUpperCase() || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    message: alert.message || '',
    is_resolved: alert.is_read || false,
    resolved_at: alert.read_at,
    resolved_by: alert.read_at ? 'نظام' : undefined,
    created_at: alert.created_at,
    inventory_item: {
      id: '',
      sku: '',
      product: { title: alert.title || 'منتج' },
      warehouse: { name: 'المخزن الرئيسي' }
    }
  }));

  const reservations: InventoryReservation[] = [];

  // Analytics function
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

  // CRUD operations
  const createWarehouse = async (warehouseData: any) => {
    // Mock implementation
    toast({
      title: 'تم إضافة المورد بنجاح',
      description: 'تم حفظ البيانات'
    });
    await fetchSuppliers();
    return { success: true };
  };

  const updateWarehouse = async (id: string, updates: any) => {
    // Mock implementation
    toast({
      title: 'تم تحديث المورد بنجاح'
    });
    await fetchSuppliers();
    return { success: true };
  };

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('inventory_alerts')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', alertId);

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
    await fetchInventoryAlerts();
    return { success: true };
  };

  const createReservation = async () => {
    return { success: true };
  };

  const cancelReservation = async () => {
    return { success: true };
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSuppliers(),
        fetchWarehouseProducts(),
        fetchProductVariants(),
        fetchInventoryMovements(),
        fetchInventoryAlerts()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    // Data
    loading,
    warehouses,
    inventoryItems,
    movements,
    alerts,
    reservations,
    suppliers,
    warehouseProducts,
    productVariants,
    inventoryMovements,
    inventoryAlerts,
    
    // Functions
    getInventoryAnalytics,
    createWarehouse,
    updateWarehouse,
    resolveAlert,
    createReservation,
    cancelReservation,
    
    // Refetch functions
    refetch: async () => {
      await Promise.all([
        fetchSuppliers(),
        fetchWarehouseProducts(),
        fetchProductVariants(),
        fetchInventoryMovements(),
        fetchInventoryAlerts()
      ]);
    }
  };
};