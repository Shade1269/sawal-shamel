import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  Search,
  Download,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  User,
  Calendar,
  Filter
} from "lucide-react";
import { useFastAuth } from "@/hooks/useFastAuth";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  items_count: number;
  created_at: string;
  updated_at: string;
  shipping_address?: string;
  payment_method?: string;
  commission_amount?: number;
}

interface OrdersConfig {
  title: string;
  description: string;
  canEdit: boolean;
  canCancel: boolean;
  showCommissions: boolean;
  showCustomerDetails: boolean;
  allowStatusChange: boolean;
  statusOptions: OrderStatus[];
  actions: ActionButton[];
  tabs: TabConfig[];
}

interface OrderStatus {
  value: string;
  label: string;
  color: string;
  icon: any;
}

interface ActionButton {
  label: string;
  icon: any;
  action: string;
  variant: 'default' | 'outline' | 'secondary' | 'destructive';
}

interface TabConfig {
  id: string;
  title: string;
  filter?: (order: Order) => boolean;
}

const orderStatuses: OrderStatus[] = [
  { value: 'pending', label: 'في الانتظار', color: 'bg-yellow-500', icon: Clock },
  { value: 'confirmed', label: 'مؤكد', color: 'bg-blue-500', icon: CheckCircle },
  { value: 'processing', label: 'قيد المعالجة', color: 'bg-purple-500', icon: Package },
  { value: 'shipped', label: 'تم الشحن', color: 'bg-indigo-500', icon: Truck },
  { value: 'delivered', label: 'تم التسليم', color: 'bg-green-500', icon: CheckCircle },
  { value: 'cancelled', label: 'ملغي', color: 'bg-red-500', icon: XCircle }
];

const ordersConfigs: Record<string, OrdersConfig> = {
  admin: {
    title: "إدارة الطلبات",
    description: "إدارة شاملة لجميع الطلبات في النظام",
    canEdit: true,
    canCancel: true,
    showCommissions: true,
    showCustomerDetails: true,
    allowStatusChange: true,
    statusOptions: orderStatuses,
    actions: [
      { label: 'تصدير', icon: Download, action: 'export', variant: 'outline' },
      { label: 'تحديث', icon: Package, action: 'refresh', variant: 'outline' }
    ],
    tabs: [
      { id: 'all', title: 'جميع الطلبات' },
      { id: 'pending', title: 'في الانتظار', filter: (order) => order.status === 'pending' },
      { id: 'processing', title: 'قيد المعالجة', filter: (order) => ['confirmed', 'processing'].includes(order.status) },
      { id: 'shipped', title: 'مشحون', filter: (order) => order.status === 'shipped' },
      { id: 'delivered', title: 'مكتمل', filter: (order) => order.status === 'delivered' }
    ]
  },

  affiliate: {
    title: "طلباتي",
    description: "تتبع الطلبات التي تم إنجازها من خلال روابطك",
    canEdit: false,
    canCancel: false,
    showCommissions: true,
    showCustomerDetails: false,
    allowStatusChange: false,
    statusOptions: orderStatuses,
    actions: [
      { label: 'تصدير', icon: Download, action: 'export', variant: 'outline' }
    ],
    tabs: [
      { id: 'all', title: 'جميع الطلبات' },
      { id: 'confirmed', title: 'مؤكدة', filter: (order) => order.status === 'confirmed' },
      { id: 'delivered', title: 'مكتملة', filter: (order) => order.status === 'delivered' }
    ]
  },

  merchant: {
    title: "طلبات المتجر",
    description: "إدارة طلبات متجرك ومتابعة حالتها",
    canEdit: true,
    canCancel: true,
    showCommissions: false,
    showCustomerDetails: true,
    allowStatusChange: true,
    statusOptions: orderStatuses,
    actions: [
      { label: 'تصدير', icon: Download, action: 'export', variant: 'outline' }
    ],
    tabs: [
      { id: 'all', title: 'جميع الطلبات' },
      { id: 'new', title: 'طلبات جديدة', filter: (order) => order.status === 'pending' },
      { id: 'processing', title: 'قيد التنفيذ', filter: (order) => ['confirmed', 'processing'].includes(order.status) },
      { id: 'completed', title: 'مكتملة', filter: (order) => order.status === 'delivered' }
    ]
  },

  customer: {
    title: "طلباتي",
    description: "تتبع حالة طلباتك وتاريخ الشراء",
    canEdit: false,
    canCancel: true,
    showCommissions: false,
    showCustomerDetails: false,
    allowStatusChange: false,
    statusOptions: orderStatuses,
    actions: [],
    tabs: [
      { id: 'all', title: 'جميع الطلبات' },
      { id: 'active', title: 'نشطة', filter: (order) => !['delivered', 'cancelled'].includes(order.status) },
      { id: 'completed', title: 'مكتملة', filter: (order) => order.status === 'delivered' }
    ]
  }
};

export function UnifiedOrdersManager() {
  const { profile } = useFastAuth();
  const location = useLocation();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const managerType = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/dashboard/orders')) return 'affiliate';
    if (path.includes('/merchant') || path.includes('/orders')) return 'merchant';
    if (path.includes('/my-orders')) return 'customer';
    
    // تحديد النوع حسب دور المستخدم
    if (profile?.role === 'admin') return 'admin';
    if (profile?.role === 'affiliate') return 'affiliate';
    if (profile?.role === 'merchant') return 'merchant';
    
    return 'customer'; // افتراضي
  }, [location.pathname, profile?.role]);

  const config = ordersConfigs[managerType];
  if (!config) return null;

  // تحميل الطلبات (مؤقت - بيانات وهمية)
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      // محاكاة تحميل البيانات
      setTimeout(() => {
        const mockOrders: Order[] = [
          {
            id: '1',
            order_number: 'ORD-2024-001',
            customer_name: 'أحمد محمد',
            customer_email: 'ahmed@example.com',
            customer_phone: '+966501234567',
            status: 'pending',
            total_amount: 1299,
            items_count: 3,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
            commission_amount: 104
          },
          {
            id: '2',
            order_number: 'ORD-2024-002',
            customer_name: 'فاطمة علي',
            customer_email: 'fatima@example.com',
            customer_phone: '+966507654321',
            status: 'delivered',
            total_amount: 599,
            items_count: 1,
            created_at: '2024-01-14T15:45:00Z',
            updated_at: '2024-01-16T09:20:00Z',
            commission_amount: 60
          },
          {
            id: '3',
            order_number: 'ORD-2024-003',
            customer_name: 'خالد سعد',
            customer_email: 'khalid@example.com',
            customer_phone: '+966555123456',
            status: 'shipped',
            total_amount: 2150,
            items_count: 5,
            created_at: '2024-01-13T08:15:00Z',
            updated_at: '2024-01-15T14:30:00Z',
            commission_amount: 172
          }
        ];
        setOrders(mockOrders);
        setLoading(false);
      }, 1000);
    };

    loadOrders();
  }, []);

  // تصفية الطلبات
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // تصفية حسب التبويب النشط
    const activeTabConfig = config.tabs.find(tab => tab.id === activeTab);
    if (activeTabConfig?.filter) {
      filtered = filtered.filter(activeTabConfig.filter);
    }

    // تصفية حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // تصفية حسب الحالة
    if (selectedStatus) {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    return filtered;
  }, [orders, activeTab, searchQuery, selectedStatus, config.tabs]);

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ر.س`;
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'export':
        // منطق التصدير
        break;
      case 'refresh':
        // منطق التحديث
        break;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus as Order['status'], updated_at: new Date().toISOString() }
        : order
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {config.actions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant}
                onClick={() => handleAction(action.action)}
              >
                <ActionIcon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الطلبات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">جميع الحالات</option>
              {config.statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {config.tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.title}
              {tab.filter && (
                <Badge variant="secondary" className="ml-2">
                  {orders.filter(tab.filter).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {config.tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {tab.title}
                  <Badge variant="outline">
                    {filteredOrders.length} طلب
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الطلب</TableHead>
                        {config.showCustomerDetails && <TableHead>العميل</TableHead>}
                        <TableHead>الحالة</TableHead>
                        <TableHead>المبلغ</TableHead>
                        {config.showCommissions && <TableHead>العمولة</TableHead>}
                        <TableHead>العناصر</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map(order => {
                        const statusInfo = getStatusInfo(order.status);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.order_number}
                            </TableCell>
                            
                            {config.showCustomerDetails && (
                              <TableCell>
                                <div>
                                  <div className="font-medium">{order.customer_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {order.customer_phone}
                                  </div>
                                </div>
                              </TableCell>
                            )}
                            
                            <TableCell>
                              <Badge className={`${statusInfo.color} text-white`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="font-medium">
                              {formatCurrency(order.total_amount)}
                            </TableCell>
                            
                            {config.showCommissions && (
                              <TableCell>
                                {order.commission_amount ? (
                                  <span className="text-green-600 font-medium">
                                    {formatCurrency(order.commission_amount)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            )}
                            
                            <TableCell>
                              {order.items_count} عنصر
                            </TableCell>
                            
                            <TableCell>
                              {formatDate(order.created_at)}
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                {config.allowStatusChange && (
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    className="text-xs px-2 py-1 border rounded"
                                  >
                                    {config.statusOptions.map(status => (
                                      <option key={status.value} value={status.value}>
                                        {status.label}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                
                                {config.canCancel && order.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                                  >
                                    إلغاء
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">لا توجد طلبات</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? "لم يتم العثور على طلبات تطابق البحث" : "لا توجد طلبات في هذا القسم"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}