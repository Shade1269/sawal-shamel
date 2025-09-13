import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
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
  supplier_id?: string;
  product_name: string;
  product_code: string;
  product_description?: string;
  sku: string;
  description?: string;
  category?: string;
  brand?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  warehouse_product_id: string;
  variant_name: string;
  variant_code: string;
  sku: string;
  size?: string;
  color?: string;
  cost_price: number;
  selling_price: number;
  available_stock: number;
  reserved_stock: number;
  reorder_level: number;
  max_stock_level: number;
  shelf_location?: string;
  batch_number?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data for development
const mockWarehouses: Warehouse[] = [
  {
    id: '1',
    name: 'المخزن الرئيسي',
    code: 'WH001',
    location: 'الرياض',
    address: 'حي الملك فهد، الرياض',
    is_active: true,
    capacity_limit: 1000,
    current_utilization: 650,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'مخزن جدة',
    code: 'WH002',
    location: 'جدة',
    address: 'حي الفيحاء، جدة',
    is_active: true,
    capacity_limit: 800,
    current_utilization: 420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    supplier_name: 'شركة التوريدات المتقدمة',
    supplier_code: 'SUP001',
    contact_person: 'أحمد محمد',
    contact_phone: '+966501234567',
    contact_email: 'ahmed@advanced-supplies.com',
    contact_address: 'الرياض، المملكة العربية السعودية',
    phone: '+966501234567',
    email: 'ahmed@advanced-supplies.com',
    address: 'الرياض، المملكة العربية السعودية',
    city: 'الرياض',
    payment_terms: 'دفع خلال 30 يوم',
    credit_limit: 50000,
    tax_id: '123456789',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    supplier_name: 'مؤسسة الجودة للتجارة',
    supplier_code: 'SUP002',
    contact_person: 'سارة أحمد',
    contact_phone: '+966507654321',
    contact_email: 'sara@quality-trade.com',
    contact_address: 'جدة، المملكة العربية السعودية',
    phone: '+966507654321',
    email: 'sara@quality-trade.com',
    address: 'جدة، المملكة العربية السعودية',
    city: 'جدة',
    payment_terms: 'دفع عند الاستلام',
    credit_limit: 30000,
    tax_id: '987654321',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const mockWarehouseProducts: WarehouseProduct[] = [
  {
    id: '1',
    warehouse_id: '1',
    supplier_id: '1',
    product_name: 'منتج تجريبي 1',
    product_code: 'PROD001',
    product_description: 'وصف المنتج التجريبي الأول',
    sku: 'PROD001',
    description: 'منتج تجريبي للاختبار',
    category: 'إلكترونيات',
    brand: 'ماركة تجارية',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const mockProductVariants: ProductVariant[] = [
  {
    id: '1',
    warehouse_product_id: '1',
    variant_name: 'منتج تجريبي 1 - أحمر كبير',
    variant_code: 'PROD001-RED-L',
    sku: 'PROD001-RED-L',
    size: 'كبير',
    color: 'أحمر',
    cost_price: 25.50,
    selling_price: 35.00,
    available_stock: 150,
    reserved_stock: 20,
    reorder_level: 100,
    max_stock_level: 500,
    shelf_location: 'A1-B2',
    batch_number: 'BATCH001',
    expiry_date: '2025-12-31',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    product_id: '1',
    warehouse_id: '1',
    sku: 'PROD001',
    quantity_available: 150,
    quantity_reserved: 20,
    quantity_on_order: 50,
    reorder_level: 100,
    max_stock_level: 500,
    unit_cost: 25.50,
    location_in_warehouse: 'A1-B2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product: { title: 'منتج تجريبي 1' },
    warehouse: { name: 'المخزن الرئيسي' }
  },
  {
    id: '2',
    product_id: '2',
    warehouse_id: '1',
    sku: 'PROD002',
    quantity_available: 80,
    quantity_reserved: 5,
    quantity_on_order: 0,
    reorder_level: 90,
    max_stock_level: 300,
    unit_cost: 45.00,
    location_in_warehouse: 'A2-B1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    product: { title: 'منتج تجريبي 2' },
    warehouse: { name: 'المخزن الرئيسي' }
  }
];

const mockMovements: InventoryMovement[] = [
  {
    id: '1',
    inventory_item_id: '1',
    movement_type: 'IN',
    quantity: 100,
    reference_type: 'PURCHASE',
    reference_id: 'PO001',
    reference_number: 'PO001',
    reason: 'استلام بضاعة جديدة',
    created_at: new Date().toISOString(),
    inventory_item: {
      id: '1',
      sku: 'PROD001',
      product: { title: 'منتج تجريبي 1' },
      warehouse: { name: 'المخزن الرئيسي' }
    }
  },
  {
    id: '2',
    inventory_item_id: '2',
    movement_type: 'OUT',
    quantity: 25,
    reference_type: 'SALE',
    reference_id: 'SO001',
    reference_number: 'SO001',
    reason: 'بيع للعميل',
    created_at: new Date().toISOString(),
    inventory_item: {
      id: '2',
      sku: 'PROD002',
      product: { title: 'منتج تجريبي 2' },
      warehouse: { name: 'المخزن الرئيسي' }
    }
  }
];

const mockAlerts: StockAlert[] = [
  {
    id: '1',
    inventory_item_id: '2',
    alert_type: 'LOW_STOCK',
    priority: 'HIGH',
    message: 'المخزون أقل من نقطة إعادة الطلب',
    is_resolved: false,
    created_at: new Date().toISOString(),
    inventory_item: {
      id: '2',
      sku: 'PROD002',
      product: { title: 'منتج تجريبي 2' },
      warehouse: { name: 'المخزن الرئيسي' }
    }
  }
];

const mockReservations: InventoryReservation[] = [
  {
    id: '1',
    inventory_item_id: '1',
    order_id: 'ORDER001',
    reserved_quantity: 20,
    status: 'ACTIVE',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    inventory_item: {
      id: '1',
      sku: 'PROD001',
      product: { title: 'منتج تجريبي 1' },
      warehouse: { name: 'المخزن الرئيسي' }
    }
  }
];

export const useInventoryManagement = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Use mock data for now
  const warehouses = mockWarehouses;
  const inventoryItems = mockInventoryItems;
  const movements = mockMovements;
  const alerts = mockAlerts;
  const reservations = mockReservations;
  const suppliers = mockSuppliers;
  const warehouseProducts = mockWarehouseProducts;
  const productVariants = mockProductVariants;

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
    toast({
      title: 'تم إضافة المخزن بنجاح',
      description: 'تم حفظ البيانات'
    });
    return { success: true };
  };

  const updateWarehouse = async (id: string, updates: any) => {
    toast({
      title: 'تم تحديث المخزن بنجاح'
    });
    return { success: true };
  };

  const resolveAlert = async (alertId: string) => {
    toast({
      title: 'تم حل التنبيه بنجاح'
    });
    return { success: true };
  };

  const createReservation = async () => {
    return { success: true };
  };

  const cancelReservation = async () => {
    return { success: true };
  };

  // Mock load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    
    // Backward compatibility aliases
    inventoryMovements: movements,
    
    // Functions
    getInventoryAnalytics,
    createWarehouse,
    updateWarehouse,
    resolveAlert,
    createReservation,
    cancelReservation,
    
    // Refetch functions
    refetch: async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    }
  };
};