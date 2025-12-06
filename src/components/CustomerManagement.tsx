import { useState, useEffect } from 'react';
import { 
  UnifiedCard as Card, 
  UnifiedCardContent as CardContent, 
  UnifiedCardHeader as CardHeader, 
  UnifiedButton as Button,
  UnifiedBadge as Badge,
  UnifiedInput as Input
} from '@/components/design-system';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  Download, 
  Eye,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  TrendingUp,
  MoreVertical,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { useFastAuth } from '@/hooks/useFastAuth';

interface StoreCustomer {
  id: string;
  customer_id: string;
  first_purchase_at: string | null;
  last_purchase_at?: string | null;
  total_orders: number | null;
  total_spent_sar: number | null;
  customer_status: string | null;
  customers: {
    profile_id: string;
    total_orders: number | null;
    total_spent_sar: number | null;
    loyalty_points: number | null;
    profiles: {
      full_name: string | null;
      phone: string | null;
      email?: string | null;
      created_at: string;
    };
  };
}

interface CustomerStats {
  total_customers: number;
  active_customers: number;
  new_customers_this_month: number;
  total_revenue: number;
  average_order_value: number;
}

interface CustomerManagementProps {
  storeId: string;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ storeId }) => {
  const { toast } = useToast();
  const { goToUserHome } = useSmartNavigation();
  const { profile } = useFastAuth();
  
  const [customers, setCustomers] = useState<StoreCustomer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    total_customers: 0,
    active_customers: 0,
    new_customers_this_month: 0,
    total_revenue: 0,
    average_order_value: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // جلب عملاء المتجر
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('store_customers')
          .select(`
            id,
            customer_id,
            first_purchase_at,
            last_purchase_at,
            total_orders,
            total_spent_sar,
            customer_status,
            customers!customer_id (
              profile_id,
              total_orders,
              total_spent_sar,
              loyalty_points,
              profiles!customers_profile_id_fkey (
                full_name,
                phone,
                email,
                created_at
              )
            )
          `)
          .eq('store_id', storeId)
          .order('first_purchase_at', { ascending: false });

        if (error) throw error;

        const customersData = data || [];
        setCustomers(customersData);

        // حساب الإحصائيات
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const totalCustomers = customersData.length;
        const activeCustomers = customersData.filter(c => c.customer_status === 'active').length;
        const newCustomersThisMonth = customersData.filter(c => 
          new Date(c.first_purchase_at) >= startOfMonth
        ).length;
        const totalRevenue = customersData.reduce((sum, c) => sum + (c.total_spent_sar || 0), 0);
        const averageOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

        setStats({
          total_customers: totalCustomers,
          active_customers: activeCustomers,
          new_customers_this_month: newCustomersThisMonth,
          total_revenue: totalRevenue,
          average_order_value: averageOrderValue
        });

      } catch (error: any) {
        console.error('Error fetching customers:', error);
        toast({
          title: "خطأ في جلب العملاء",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchCustomers();
    }
  }, [storeId, toast]);

  // تصفية العملاء
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.customers.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customers.profiles.phone.includes(searchTerm) ||
      (customer.customers.profiles.email && customer.customers.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || customer.customer_status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // تصدير بيانات العملاء
  const exportCustomers = () => {
    const csvContent = [
      ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'عدد الطلبات', 'إجمالي الإنفاق', 'تاريخ أول شراء', 'الحالة'],
      ...filteredCustomers.map(customer => [
        customer.customers.profiles.full_name,
        customer.customers.profiles.phone,
        customer.customers.profiles.email || '',
        customer.total_orders.toString(),
        customer.total_spent_sar.toFixed(2),
        new Date(customer.first_purchase_at).toLocaleDateString('ar-SA'),
        customer.customer_status === 'active' ? 'نشط' : 'غير نشط'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">إدارة العملاء</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            إدارة ومتابعة عملاء المتجر وإحصائياتهم
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => goToUserHome(profile?.role)} variant="outline" size="sm" className="text-xs sm:text-sm" leftIcon={<Home className="w-3 h-3 sm:w-4 sm:h-4" />}>
            <span className="hidden sm:inline">الرئيسية</span>
            <span className="sm:hidden">الرئيسية</span>
          </Button>
          
          <Button onClick={exportCustomers} variant="outline" size="sm" className="text-xs sm:text-sm" leftIcon={<Download className="w-3 h-3 sm:w-4 sm:h-4" />}>
            <span className="hidden sm:inline">تصدير البيانات</span>
            <span className="sm:hidden">تصدير</span>
          </Button>
        </div>
      </div>

      {/* إحصائيات العملاء */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">إجمالي العملاء</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.total_customers}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">العملاء النشطون</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.active_customers}</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">عملاء جدد</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.new_customers_this_month}</p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">متوسط الإنفاق</p>
                <p className="text-sm sm:text-2xl font-bold">{stats.average_order_value.toFixed(0)} ر.س</p>
              </div>
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-premium" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والتصفية */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="البحث بالاسم أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 text-sm"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="blocked">محظور</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">لا يوجد عملاء</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'لم يتم العثور على عملاء مطابقين للبحث' : 'لا يوجد عملاء في هذا المتجر بعد'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {customer.customers.profiles.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-medium">{customer.customers.profiles.full_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.customers.profiles.phone}
                          </span>
                          {customer.customers.profiles.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.customers.profiles.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="font-medium">{customer.total_orders} طلب</div>
                        <div className="text-muted-foreground">{customer.total_spent_sar.toFixed(2)} ر.س</div>
                      </div>
                      
                      <Badge 
                        variant={customer.customer_status === 'active' ? 'success' : 'secondary'}
                      >
                        {customer.customer_status === 'active' ? 'نشط' : 
                         customer.customer_status === 'inactive' ? 'غير نشط' : 'محظور'}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>أول شراء: {new Date(customer.first_purchase_at).toLocaleDateString('ar-SA')}</span>
                      {customer.last_purchase_at && (
                        <span>آخر شراء: {new Date(customer.last_purchase_at).toLocaleDateString('ar-SA')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};