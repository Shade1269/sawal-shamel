import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Simplified types matching actual database schema
export interface SimpleWarehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  storage_capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SimpleInventoryItem {
  id: string;
  warehouse_id?: string;
  product_variant_id?: string;
  sku: string;
  quantity_available?: number;
  quantity_reserved?: number;
  quantity_on_order?: number;
  reorder_level?: number;
  max_stock_level?: number;
  unit_cost?: number;
  location?: string;
  expiry_date?: string;
  batch_number?: string;
  last_counted_at?: string;
  created_at: string;
  updated_at: string;
}

export function useRealInventoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real warehouse data
  const { data: realWarehouses = [], isLoading: warehousesLoading } = useQuery({
    queryKey: ['real_warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Real inventory items
  const { data: realInventoryItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['real_inventory_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Add inventory item mutation
  const addInventoryItem = useMutation({
    mutationFn: async (itemData: {
      warehouse_id: string;
      sku: string;
      quantity_available: number;
      unit_cost: number;
      location?: string;
      batch_number?: string;
      expiry_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(itemData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real_inventory_items'] });
      toast({
        title: "تم إضافة المنتج",
        description: "تم إضافة المنتج للمخزون بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإضافة",
        description: error.message || "حدث خطأ أثناء إضافة المنتج",
        variant: "destructive",
      });
    }
  });

  // Update inventory item mutation
  const updateInventoryItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SimpleInventoryItem> }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real_inventory_items'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المنتج بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث المنتج",
        variant: "destructive",
      });
    }
  });

  // Create default warehouse and inventory items
  const initializeSystem = useMutation({
    mutationFn: async () => {
      // Create default warehouse
      const { data: warehouse, error: warehouseError } = await supabase
        .from('warehouses')
        .insert({
          name: 'المخزن الرئيسي',
          code: 'WH001',
          address: 'الرياض',
          city: 'الرياض',
          country: 'السعودية',
          is_active: true,
          storage_capacity: 10000
        })
        .select()
        .single();

      if (warehouseError) throw warehouseError;

      // Get existing products to create inventory items
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, title, sku, stock')
        .eq('is_active', true)
        .limit(20);

      if (productsError) throw productsError;

      // Create inventory items for each product
      if (products && products.length > 0) {
        const inventoryItems = products.map(product => ({
          warehouse_id: warehouse.id,
          sku: product.sku || `SKU-${product.title.slice(0, 3).toUpperCase()}-${Math.random().toString(36).substr(2, 4)}`,
          quantity_available: product.stock || Math.floor(Math.random() * 50) + 10,
          quantity_reserved: 0,
          quantity_on_order: 0,
          reorder_level: Math.floor(Math.random() * 10) + 5,
          unit_cost: Math.floor(Math.random() * 100) + 20,
          location: `A${Math.floor(Math.random() * 5) + 1}-B${Math.floor(Math.random() * 5) + 1}`
        }));

        const { error: itemsError } = await supabase
          .from('inventory_items')
          .insert(inventoryItems);

        if (itemsError) throw itemsError;
      }

      return { warehouse, itemsCount: products?.length || 0 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['real_warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['real_inventory_items'] });
      toast({
        title: "تم إعداد المخزون!",
        description: `تم إنشاء المخزن الرئيسي و ${data.itemsCount} عنصر مخزون`,
      });
    },
    onError: (error) => {
      console.error('Error initializing inventory:', error);
      toast({
        title: "خطأ في الإعداد",
        description: "حدث خطأ في إعداد نظام المخزون",
        variant: "destructive",
      });
    }
  });

  // Create warehouse mutation
  const createWarehouse = useMutation({
    mutationFn: async (warehouseData: any) => {
      const { data, error } = await supabase
        .from('warehouses')
        .insert({
          name: warehouseData.name,
          code: warehouseData.code,
          address: warehouseData.address,
          city: warehouseData.location,
          is_active: warehouseData.is_active,
          storage_capacity: warehouseData.capacity_limit
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['real_warehouses'] });
      toast({
        title: "نجح!",
        description: "تم إنشاء المخزن بنجاح",
      });
    }
  });

  const loading = warehousesLoading || itemsLoading;

  return {
    warehouses: realWarehouses,
    inventoryItems: realInventoryItems,
    loading,
    initializeSystem: () => initializeSystem.mutateAsync(),
    createWarehouse: (data: any) => createWarehouse.mutateAsync(data),
    addInventoryItem: (data: any) => addInventoryItem.mutateAsync(data),
    updateInventoryItem: (data: any) => updateInventoryItem.mutateAsync(data),
    isInitializing: initializeSystem.isPending,
    isAddingItem: addInventoryItem.isPending,
    isUpdatingItem: updateInventoryItem.isPending,
  };
}