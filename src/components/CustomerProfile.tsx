import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Plus, 
  Package, 
  CreditCard, 
  Star,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  Award,
  LogOut,
  Home
} from 'lucide-react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { useFastAuth } from '@/hooks/useFastAuth';

interface CustomerAddress {
  id: string;
  full_name: string;
  phone?: string;
  city: string;
  district?: string;
  street_address: string;
  building_number?: string;
  apartment_number?: string;
  additional_info?: string;
  is_default: boolean;
  address_type: 'shipping' | 'billing' | 'both';
}

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  total_sar: number;
  created_at: string;
  store_name?: string;
}

export const CustomerProfile: React.FC = () => {
  const { customer, updateCustomerProfile, signOut, isLoading } = useCustomerAuth();
  const { toast } = useToast();
  const { goToUserHome } = useSmartNavigation();
  const { profile } = useFastAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: customer?.full_name || '',
    email: customer?.email || ''
  });
  
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // جلب العناوين
  useEffect(() => {
    if (!customer?.id) return;

    const fetchAddresses = async () => {
      try {
        const { data, error } = await supabase
          .from('customer_addresses')
          .select('*')
          .eq('customer_id', customer.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAddresses((data as CustomerAddress[]) || []);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, [customer?.id]);

  // جلب الطلبات
  useEffect(() => {
    if (!customer?.profile_id) return;

    const fetchOrders = async () => {
      try {
        const { data: ecommerceOrders, error: ecommerceError } = await supabase
          .from('ecommerce_orders')
          .select(`
            id,
            order_number,
            total_sar,
            status,
            created_at,
            affiliate_stores (
              store_name
            )
          `)
          .eq('user_id', customer.profile_id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (ecommerceError) throw ecommerceError;

        const formattedOrders = ecommerceOrders?.map(order => ({
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_sar: order.total_sar,
          created_at: order.created_at,
          store_name: (order as any)?.affiliate_stores?.store_name || null
        })) || [];

        setOrders(formattedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [customer?.profile_id]);

  // حفظ التعديلات
  const handleSaveProfile = async () => {
    const result = await updateCustomerProfile(editedProfile);
    if (result.success) {
      setIsEditing(false);
    }
  };

  // إلغاء التعديل
  const handleCancelEdit = () => {
    setEditedProfile({
      full_name: customer?.full_name || '',
      email: customer?.email || ''
    });
    setIsEditing(false);
  };

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">يرجى تسجيل الدخول للوصول إلى ملفك الشخصي</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
      {/* رأس الملف الشخصي */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto sm:mx-0">
                <AvatarFallback className="bg-primary/10 text-primary text-lg sm:text-xl">
                  {customer.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center sm:text-right">
                <CardTitle className="text-xl sm:text-2xl">{customer.full_name}</CardTitle>
                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm">
                  <span className="flex items-center justify-center sm:justify-start gap-1">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    {customer.phone}
                  </span>
                  {customer.email && (
                    <span className="flex items-center justify-center sm:justify-start gap-1">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      {customer.email}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToUserHome(profile?.role)}
                disabled={isLoading}
                className="text-xs sm:text-sm"
              >
                <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">الرئيسية</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
                className="text-xs sm:text-sm"
              >
                {isEditing ? <X className="w-3 h-3 sm:w-4 sm:h-4" /> : <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline ml-1">{isEditing ? 'إلغاء' : 'تعديل'}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">خروج</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {isEditing && (
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="fullName" className="text-sm">الاسم الكامل</Label>
                <Input
                  id="fullName"
                  value={editedProfile.full_name}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleSaveProfile} disabled={isLoading} size="sm" className="text-sm">
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                حفظ التغييرات
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading} size="sm" className="text-sm">
                إلغاء
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* إحصائيات العميل */}
      {customer && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-primary mb-2" />
              <div className="text-xl sm:text-2xl font-bold">{customer.total_orders}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">إجمالي الطلبات</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-green-600 mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{customer.total_spent_sar.toFixed(2)} ر.س</div>
              <div className="text-xs sm:text-sm text-muted-foreground">إجمالي المشتريات</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold">{customer.loyalty_points}</div>
              <div className="text-sm text-muted-foreground">نقاط الولاء</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* التبويبات */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="addresses">العناوين</TabsTrigger>
        </TabsList>

        {/* تبويب الطلبات */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                طلباتي
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-muted-foreground mt-2">جاري تحميل الطلبات...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.store_name && `${order.store_name} • `}
                            {new Date(order.created_at).toLocaleDateString('ar-SA')}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{order.total_sar.toFixed(2)} ر.س</div>
                          <Badge variant="secondary">{order.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب العناوين */}
        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  عناويني
                </CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة عنوان
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-muted-foreground mt-2">جاري تحميل العناوين...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد عناوين محفوظة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{address.full_name}</span>
                            {address.is_default && (
                              <Badge variant="default" className="text-xs">افتراضي</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {address.address_type === 'shipping' ? 'شحن' :
                               address.address_type === 'billing' ? 'فواتير' : 'شحن وفواتير'}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>{address.street_address}</div>
                            <div>
                              {address.district && `${address.district}، `}
                              {address.city}
                            </div>
                            {address.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {address.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};