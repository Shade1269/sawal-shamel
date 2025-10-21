import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExecutiveKPIs {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  monthlyGrowth: number;
  averageOrderValue: number;
  customerRetention: number;
  conversionRate: number;
}

export interface FinancialMetrics {
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  revenueByPaymentMethod: { method: string; amount: number; percentage: number }[];
  profitMargins: { category: string; profit: number; margin: number }[];
}

export interface CustomerAnalytics {
  newCustomers: { month: string; count: number }[];
  customerSegments: { segment: string; count: number; value: number }[];
  topCustomers: { name: string; orders: number; total: number }[];
  customerLifetime: { cohort: string; value: number }[];
}

export interface BusinessInsights {
  topProducts: { name: string; sales: number; revenue: number }[];
  performingStores: { name: string; revenue: number; orders: number }[];
  salesChannels: { channel: string; revenue: number; growth: number }[];
  regionalPerformance: { region: string; revenue: number; customers: number }[];
}

export const useExecutiveAnalytics = () => {
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null);
  const [financial, setFinancial] = useState<FinancialMetrics | null>(null);
  const [customer, setCustomer] = useState<CustomerAnalytics | null>(null);
  const [business, setBusiness] = useState<BusinessInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchKPIs = async () => {
    try {
      // Fetch from order_hub instead
      const [ordersResult, usersResult, productsResult] = await Promise.all([
        supabase.from('order_hub').select('total_amount_sar, created_at, customer_phone'),
        supabase.from('profiles').select('id, created_at').eq('is_active', true),
        supabase.from('products').select('id').eq('is_active', true)
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (usersResult.error) throw usersResult.error;
      if (productsResult.error) throw productsResult.error;

      const orders = ordersResult.data || [];
      const users = usersResult.data || [];
      const products = productsResult.data || [];

      const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_amount_sar) || 0), 0);
      const totalOrders = orders.length;
      const totalCustomers = users.length;
      const totalProducts = products.length;

      // Calculate monthly growth
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      });
      
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
      });

      const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (Number(order.total_amount_sar) || 0), 0);
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (Number(order.total_amount_sar) || 0), 0);
      const monthlyGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Calculate customer metrics
      const uniqueCustomers = new Set(orders.map(order => order.customer_phone)).size;
      const repeatCustomers = orders.reduce((acc, order) => {
        acc[order.customer_phone] = (acc[order.customer_phone] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const returningCustomers = Object.values(repeatCustomers).filter(count => count > 1).length;
      const customerRetention = uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;
      const conversionRate = totalCustomers > 0 ? (uniqueCustomers / totalCustomers) * 100 : 0;

      setKpis({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        monthlyGrowth,
        averageOrderValue,
        customerRetention,
        conversionRate
      });
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setError('فشل في جلب المؤشرات الرئيسية');
    }
  };

  const fetchFinancialMetrics = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('order_hub')
        .select('total_amount_sar, created_at, source, source_order_id');

      if (error) throw error;

      // جلب payment_method من الجداول الأصلية
      const ordersWithPayment = await Promise.all(
        (orders || []).map(async (order) => {
          if (order.source === 'ecommerce') {
            const { data } = await supabase
              .from('ecommerce_orders')
              .select('payment_method')
              .eq('id', order.source_order_id)
              .single();
            return { ...order, payment_method: data?.payment_method || 'غير محدد' };
          }
          return { ...order, payment_method: 'CASH_ON_DELIVERY' };
        })
      );

      // Monthly revenue
      const monthlyData = ordersWithPayment.reduce((acc, order) => {
        const month = new Date(order.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
        if (!acc[month]) {
          acc[month] = { revenue: 0, orders: 0 };
        }
        acc[month].revenue += Number(order.total_amount_sar) || 0;
        acc[month].orders += 1;
        return acc;
      }, {} as Record<string, { revenue: number; orders: number }>);

      const monthlyRevenue = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      // Revenue by payment method
      const paymentData = ordersWithPayment.reduce((acc, order) => {
        const method = order.payment_method || 'غير محدد';
        if (!acc[method]) {
          acc[method] = 0;
        }
        acc[method] += Number(order.total_amount_sar) || 0;
        return acc;
      }, {} as Record<string, number>);

      const totalRevenue = Object.values(paymentData).reduce((sum, amount) => sum + amount, 0);
      const revenueByPaymentMethod = Object.entries(paymentData).map(([method, amount]) => ({
        method,
        amount,
        percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0
      }));

      // Mock profit margins (would come from product cost data)
      const profitMargins = [
        { category: 'إلكترونيات', profit: 45000, margin: 25 },
        { category: 'ملابس', profit: 32000, margin: 35 },
        { category: 'كتب', profit: 12000, margin: 15 },
        { category: 'أخرى', profit: 8000, margin: 20 }
      ];

      setFinancial({
        monthlyRevenue,
        revenueByPaymentMethod,
        profitMargins
      });
    } catch (err) {
      console.error('Error fetching financial metrics:', err);
      setError('فشل في جلب المقاييس المالية');
    }
  };

  const fetchCustomerAnalytics = async () => {
    try {
      const [ordersResult, profilesResult] = await Promise.all([
        supabase.from('order_hub').select('customer_phone, customer_name, total_amount_sar, created_at'),
        supabase.from('profiles').select('id, created_at, total_earnings')
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (profilesResult.error) throw profilesResult.error;

      const orders = ordersResult.data || [];
      const profiles = profilesResult.data || [];

      // New customers by month
      const customersByMonth = profiles.reduce((acc, profile) => {
        const month = new Date(profile.created_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const newCustomers = Object.entries(customersByMonth)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

      // Customer segments
      const customerOrders = orders.reduce((acc, order) => {
        const phone = order.customer_phone;
        if (!acc[phone]) {
          acc[phone] = { orders: 0, total: 0, name: order.customer_name };
        }
        acc[phone].orders += 1;
        acc[phone].total += Number(order.total_amount_sar) || 0;
        return acc;
      }, {} as Record<string, { orders: number; total: number; name: string }>);

      const customerSegments = [
        { segment: 'عملاء VIP (> 10000 ريال)', count: 0, value: 0 },
        { segment: 'عملاء متميزون (5000-10000 ريال)', count: 0, value: 0 },
        { segment: 'عملاء عاديون (1000-5000 ريال)', count: 0, value: 0 },
        { segment: 'عملاء جدد (< 1000 ريال)', count: 0, value: 0 }
      ];

      Object.values(customerOrders).forEach(customer => {
        if (customer.total > 10000) {
          customerSegments[0].count += 1;
          customerSegments[0].value += customer.total;
        } else if (customer.total > 5000) {
          customerSegments[1].count += 1;
          customerSegments[1].value += customer.total;
        } else if (customer.total > 1000) {
          customerSegments[2].count += 1;
          customerSegments[2].value += customer.total;
        } else {
          customerSegments[3].count += 1;
          customerSegments[3].value += customer.total;
        }
      });

      // Top customers
      const topCustomers = Object.entries(customerOrders)
        .map(([phone, data]) => ({
          name: data.name || phone,
          orders: data.orders,
          total: data.total
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      // Mock customer lifetime data
      const customerLifetime = [
        { cohort: 'يناير 2024', value: 1250 },
        { cohort: 'فبراير 2024', value: 1180 },
        { cohort: 'مارس 2024', value: 1320 },
        { cohort: 'أبريل 2024', value: 1450 },
        { cohort: 'مايو 2024', value: 1380 },
        { cohort: 'يونيو 2024', value: 1520 }
      ];

      setCustomer({
        newCustomers,
        customerSegments,
        topCustomers,
        customerLifetime
      });
    } catch (err) {
      console.error('Error fetching customer analytics:', err);
      setError('فشل في جلب تحليلات العملاء');
    }
  };

  const fetchBusinessInsights = async () => {
    try {
      const [productsResult, ordersResult, shopsResult] = await Promise.all([
        supabase.from('products').select('id, title, sales_count').eq('is_active', true),
        supabase.from('order_hub').select('total_amount_sar, shop_id'),
        supabase.from('shops').select('id, display_name')
      ]);

      if (productsResult.error) throw productsResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (shopsResult.error) throw shopsResult.error;

      const products = productsResult.data || [];
      const orders = ordersResult.data || [];
      const shops = shopsResult.data || [];

      // Top products
      const topProducts = products
        .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
        .slice(0, 10)
        .map(product => ({
          name: product.title,
          sales: product.sales_count || 0,
          revenue: (product.sales_count || 0) * 150 // Mock average price
        }));

      // Performing stores
      const storeRevenue = orders.reduce((acc, order) => {
        const shopId = order.shop_id;
        if (!acc[shopId]) {
          acc[shopId] = { revenue: 0, orders: 0 };
        }
        acc[shopId].revenue += Number(order.total_amount_sar) || 0;
        acc[shopId].orders += 1;
        return acc;
      }, {} as Record<string, { revenue: number; orders: number }>);

      const performingStores = Object.entries(storeRevenue)
        .map(([shopId, data]) => {
          const shop = shops.find(s => s.id === shopId);
          return {
            name: shop?.display_name || 'متجر غير معروف',
            revenue: data.revenue,
            orders: data.orders
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Mock data for other insights
      const salesChannels = [
        { channel: 'التجارة الإلكترونية', revenue: 250000, growth: 15.5 },
        { channel: 'التطبيق المحمول', revenue: 180000, growth: 25.2 },
        { channel: 'وسائل التواصل', revenue: 95000, growth: 18.7 },
        { channel: 'الشركاء التابعون', revenue: 65000, growth: 32.1 }
      ];

      const regionalPerformance = [
        { region: 'الرياض', revenue: 320000, customers: 1250 },
        { region: 'جدة', revenue: 280000, customers: 980 },
        { region: 'الدمام', revenue: 150000, customers: 650 },
        { region: 'مكة', revenue: 120000, customers: 520 },
        { region: 'المدينة', revenue: 95000, customers: 420 }
      ];

      setBusiness({
        topProducts,
        performingStores,
        salesChannels,
        regionalPerformance
      });
    } catch (err) {
      console.error('Error fetching business insights:', err);
      setError('فشل في جلب رؤى الأعمال');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchKPIs(),
        fetchFinancialMetrics(),
        fetchCustomerAnalytics(),
        fetchBusinessInsights()
      ]);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء جلب بيانات التحليلات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    kpis,
    financial,
    customer,
    business,
    loading,
    error,
    refetch: fetchAllData
  };
};