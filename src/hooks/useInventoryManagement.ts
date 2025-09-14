import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Type definitions matching the database schema
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
  reference_number?: string;
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

export interface Supplier {
  id: string;
  supplier_name: string;
  supplier_code: string;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_address?: string;
  payment_terms?: string;
  credit_limit?: number;
  tax_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarehouseProduct {
  id: string;
  warehouse_id: string;
  product_name: string;
  sku: string;
  supplier_id?: string;
  purchase_price?: number;
  selling_price?: number;
  is_active: boolean;
  minimum_stock_level: number;
  maximum_stock_level?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  warehouse_product_id: string;
  variant_name: string;
  sku: string;
  barcode?: string;
  cost_price?: number;
  selling_price?: number;
  available_stock: number;
  reserved_stock: number;
  reorder_level: number;
  max_stock_level?: number;
  shelf_location?: string;
  batch_number?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data for backwards compatibility (suppliers, warehouseProducts, variants)
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    supplier_name: 'مؤسسة الرياض للتجارة',
    supplier_code: 'SUP001',
    contact_person: 'أحمد محمد',
    contact_phone: '+966501234567',
    contact_email: 'ahmed@riyadh-trade.com',
    contact_address: 'الرياض، حي العليا',
    payment_terms: '30 يوم',
    credit_limit: 100000,
    tax_id: '123456789012345',
    is_active: true,
    created_at: '2024-01-15',
    updated_at: '2024-01-15'
  },
  {
    id: '2',
    supplier_name: 'شركة جدة للمواد الغذائية',
    supplier_code: 'SUP002',
    contact_person: 'فاطمة أحمد',
    contact_phone: '+966502345678',
    contact_email: 'fatima@jeddah-foods.com',
    contact_address: 'جدة، حي الحمراء',
    payment_terms: '15 يوم',
    credit_limit: 75000,
    tax_id: '987654321098765',
    is_active: true,
    created_at: '2024-01-20',
    updated_at: '2024-01-20'
  }
];

const mockWarehouseProducts: WarehouseProduct[] = [
  {
    id: '1',
    warehouse_id: 'warehouse1',
    product_name: 'منتج تجريبي 1',
    sku: 'PROD001',
    supplier_id: '1',
    purchase_price: 50,
    selling_price: 75,
    is_active: true,
    minimum_stock_level: 10,
    maximum_stock_level: 100,
    created_at: '2024-01-15',
    updated_at: '2024-01-15'
  }
];

const mockProductVariants: ProductVariant[] = [
  {
    id: '1',
    warehouse_product_id: '1',
    variant_name: 'مقاس كبير - أزرق',
    sku: 'PROD001-L-BLUE',
    barcode: '1234567890123',
    cost_price: 45,
    selling_price: 70,
    available_stock: 25,
    reserved_stock: 5,
    reorder_level: 10,
    max_stock_level: 50,
    shelf_location: 'A1-B2',
    is_active: true,
    created_at: '2024-01-15',
    updated_at: '2024-01-15'
  }
];

export function useInventoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real data from database
  const { data: warehouses = [], isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Warehouse[];
    }
  });

  const { data: inventoryItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          product:products!inventory_items_product_id_fkey(title),
          warehouse:warehouses!inventory_items_warehouse_id_fkey(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InventoryItem[];
    }
  });

  const { data: movements = [], isLoading: movementsLoading } = useQuery({
    queryKey: ['inventory_movements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          inventory_item:inventory_items!inventory_movements_inventory_item_id_fkey(
            id,
            sku,
            product:products!inventory_items_product_id_fkey(title),
            warehouse:warehouses!inventory_items_warehouse_id_fkey(name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InventoryMovement[];
    }
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['inventory_alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_alerts')
        .select(`
          *,
          inventory_item:inventory_items!inventory_alerts_inventory_item_id_fkey(
            id,
            sku,
            product:products!inventory_items_product_id_fkey(title),
            warehouse:warehouses!inventory_items_warehouse_id_fkey(name)
          )
        `)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StockAlert[];
    }
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ['inventory_reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_reservations')
        .select(`
          *,
          inventory_item:inventory_items!inventory_reservations_inventory_item_id_fkey(
            id,
            sku,
            product:products!inventory_items_product_id_fkey(title),
            warehouse:warehouses!inventory_items_warehouse_id_fkey(name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InventoryReservation[];
    }
  });

  // For backwards compatibility - using mock data for now
  const [suppliers] = useState<Supplier[]>(mockSuppliers);
  const [warehouseProducts] = useState<WarehouseProduct[]>(mockWarehouseProducts);
  const [productVariants] = useState<ProductVariant[]>(mockProductVariants);
  const inventoryMovements = movements;

  const loading = warehousesLoading || itemsLoading || movementsLoading || alertsLoading || reservationsLoading;

  const getInventoryAnalytics = () => {
    const totalItems = inventoryItems.reduce((sum, item) => sum + item.quantity_available, 0);
    const lowStockItems = inventoryItems.filter(item => 
      item.quantity_available <= item.reorder_level && item.reorder_level > 0
    ).length;
    const outOfStockItems = inventoryItems.filter(item => item.quantity_available === 0).length;
    const totalValue = inventoryItems.reduce((sum, item) => 
      sum + (item.quantity_available * (item.unit_cost || 0)), 0
    );
    const criticalAlerts = alerts.filter(alert => alert.priority === 'CRITICAL').length;
    const activeReservations = reservations.filter(res => res.status === 'ACTIVE').length;

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      criticalAlerts,
      activeReservations
    };
  };

  // Mutations for database operations
  const createWarehouseMutation = useMutation({
    mutationFn: async (warehouseData: any) => {
      const { data, error } = await supabase
        .from('warehouses')
        .insert({
          name: warehouseData.name,
          code: warehouseData.code,
          location: warehouseData.location,
          address: warehouseData.address,
          capacity_limit: warehouseData.capacity_limit,
          is_active: warehouseData.is_active,
          current_utilization: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast({
        title: "نجح!",
        description: "تم إنشاء المخزن بنجاح",
      });
    },
    onError: (error) => {
      console.error('Error creating warehouse:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إنشاء المخزن",
        variant: "destructive",
      });
    }
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('warehouses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast({
        title: "نجح!",
        description: "تم تحديث المخزن بنجاح",
      });
    },
    onError: (error) => {
      console.error('Error updating warehouse:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث المخزن",
        variant: "destructive",
      });
    }
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('inventory_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_alerts'] });
      toast({
        title: "نجح!",
        description: "تم حل التنبيه بنجاح",
      });
    },
    onError: (error) => {
      console.error('Error resolving alert:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حل التنبيه",
        variant: "destructive",
      });
    }
  });

  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: any) => {
      const { data, error } = await supabase
        .from('inventory_reservations')
        .insert(reservationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_reservations'] });
      toast({
        title: "نجح!",
        description: "تم إنشاء الحجز بنجاح",
      });
    },
    onError: (error) => {
      console.error('Error creating reservation:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إنشاء الحجز",
        variant: "destructive",
      });
    }
  });

  // Helper functions to setup initial warehouse and inventory items
  const initializeInventorySystem = async () => {
    try {
      // Create default warehouse if none exists
      if (warehouses.length === 0) {
        const { data: defaultWarehouse, error: warehouseError } = await supabase
          .from('warehouses')
          .insert({
            name: 'المخزن الرئيسي',
            code: 'WH001',
            location: 'الرياض، المملكة العربية السعودية',
            is_active: true,
            current_utilization: 0,
            capacity_limit: 10000
          })
          .select()
          .single();

        if (warehouseError) throw warehouseError;

        // Create inventory items for existing products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, title, sku, stock')
          .eq('is_active', true);

        if (productsError) throw productsError;

        if (products && products.length > 0) {
          const inventoryItemsToInsert = products.map(product => ({
            product_id: product.id,
            warehouse_id: defaultWarehouse.id,
            sku: product.sku || `SKU-${product.id.slice(0, 8)}`,
            quantity_available: product.stock || 0,
            quantity_reserved: 0,
            quantity_on_order: 0,
            reorder_level: Math.max(5, Math.floor((product.stock || 0) * 0.2)),
            unit_cost: 0
          }));

          const { error: itemsError } = await supabase
            .from('inventory_items')
            .insert(inventoryItemsToInsert);

          if (itemsError) throw itemsError;
        }

        queryClient.invalidateQueries({ queryKey: ['warehouses'] });
        queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
        
        toast({
          title: "تم الإعداد بنجاح!",
          description: "تم إنشاء المخزن الرئيسي وربط المنتجات الموجودة",
        });
      }
    } catch (error) {
      console.error('Error initializing inventory system:', error);
      toast({
        title: "خطأ في الإعداد",
        description: "حدث خطأ في إعداد نظام المخزون",
        variant: "destructive",
      });
    }
  };

  // Wrapper functions for backwards compatibility
  const createWarehouse = async (warehouseData: any) => {
    return createWarehouseMutation.mutateAsync(warehouseData);
  };

  const updateWarehouse = async (id: string, updates: any) => {
    return updateWarehouseMutation.mutateAsync({ id, updates });
  };

  const resolveAlert = async (alertId: string) => {
    return resolveAlertMutation.mutateAsync(alertId);
  };

  const createReservation = async (reservationData: any) => {
    return createReservationMutation.mutateAsync(reservationData);
  };

  const cancelReservation = async (reservationId: string) => {
    try {
      const { data, error } = await supabase
        .from('inventory_reservations')
        .update({ status: 'CANCELLED' })
        .eq('id', reservationId)
        .select()
        .single();
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['inventory_reservations'] });
      toast({
        title: "نجح!",
        description: "تم إلغاء الحجز بنجاح",
      });
      return { success: true };
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إلغاء الحجز",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const refetch = async () => {
    queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
    queryClient.invalidateQueries({ queryKey: ['inventory_movements'] });
    queryClient.invalidateQueries({ queryKey: ['inventory_alerts'] });
    queryClient.invalidateQueries({ queryKey: ['inventory_reservations'] });
  };

  return {
    // Data
    warehouses,
    suppliers,
    warehouseProducts, 
    productVariants,
    inventoryItems,
    movements,
    inventoryMovements,
    alerts,
    reservations,
    loading,
    
    // Analytics
    getInventoryAnalytics,
    
    // Actions
    createWarehouse,
    updateWarehouse,
    resolveAlert,
    createReservation,
    cancelReservation,
    refetch,
    initializeInventorySystem
  };
}