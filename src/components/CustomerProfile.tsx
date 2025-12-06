import { useState, useEffect } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedBadge } from '@/components/design-system';
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
  Phone,
  Mail,
  ShoppingBag,
  Award,
  LogOut,
  Home
} from 'lucide-react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  order_number: string | null;
  status: string | null;
  total_sar: number | null;
  created_at: string;
  store_name?: string | null;
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

  // جلب الطلبات من order_hub الموحد
  useEffect(() => {
    if (!customer?.profile_id) return;

    const fetchOrders = async () => {
      try {
        // جلب الطلبات من order_hub
        const { data: hubOrders, error: hubError } = await supabase
          .from('order_hub')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (hubError) throw hubError;

        // جلب أسماء المتاجر للطلبات التي لها affiliate_store_id
        const ordersWithStores = await Promise.all(
          (hubOrders || []).map(async (order) => {
            let storeName = null;
            
            if (order.affiliate_store_id) {
              const { data: store } = await supabase
                .from('affiliate_stores')
                .select('store_name')
                .eq('id', order.affiliate_store_id)
                .maybeSingle();
              
              storeName = store?.store_name || null;
            }

            return {
              id: order.id,
              order_number: order.order_number,
              status: order.status,
              total_sar: order.total_amount_sar,
              created_at: order.created_at,
              store_name: storeName,
            };
          })
        );

        setOrders(ordersWithStores);
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
        <UnifiedCard variant="glass">
          <UnifiedCardContent className="p-6 text-center">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">يرجى تسجيل الدخول للوصول إلى ملفك الشخصي</p>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
      {/* رأس الملف الشخصي */}
      <UnifiedCard className="mb-6 sm:mb-8" variant="premium">
        <UnifiedCardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto sm:mx-0">
                <AvatarFallback className="bg-primary/10 text-primary text-lg sm:text-xl">
                  {customer.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center sm:text-right">
                <UnifiedCardTitle className="text-xl sm:text-2xl">{customer.full_name}</UnifiedCardTitle>
                <UnifiedCardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm">
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
                </UnifiedCardDescription>
              </div>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              <UnifiedButton
                variant="outline"
                size="sm"
                onClick={() => goToUserHome(profile?.role)}
                disabled={isLoading}
                className="text-xs sm:text-sm"
                leftIcon={<Home className="w-3 h-3 sm:w-4 sm:h-4" />}
              >
                <span className="hidden sm:inline">الرئيسية</span>
              </UnifiedButton>
              
              <UnifiedButton
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isLoading}
                className="text-xs sm:text-sm"
                leftIcon={isEditing ? <X className="w-3 h-3 sm:w-4 sm:h-4" /> : <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />}
              >
                <span className="hidden sm:inline">{isEditing ? 'إلغاء' : 'تعديل'}</span>
              </UnifiedButton>
              
              <UnifiedButton
                variant="outline"
                size="sm"
                onClick={signOut}
                className="text-destructive hover:text-destructive/80 text-xs sm:text-sm"
                leftIcon={<LogOut className="w-3 h-3 sm:w-4 sm:h-4" />}
              >
                <span className="hidden sm:inline">خروج</span>
              </UnifiedButton>
            </div>
          </div>
        </UnifiedCardHeader>

        {isEditing && (
          <UnifiedCardContent className="space-y-3 sm:space-y-4">
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
              <UnifiedButton onClick={handleSaveProfile} disabled={isLoading} size="sm" className="text-sm" leftIcon={<Save className="w-3 h-3 sm:w-4 sm:h-4" />}>
                حفظ التغييرات
              </UnifiedButton>
              <UnifiedButton variant="outline" onClick={handleCancelEdit} disabled={isLoading} size="sm" className="text-sm">
                إلغاء
              </UnifiedButton>
            </div>
          </UnifiedCardContent>
        )}
      </UnifiedCard>

      {/* إحصائيات العميل */}
      {customer && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <UnifiedCard variant="glass">
            <UnifiedCardContent className="p-4 sm:p-6 text-center">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-primary mb-2" />
              <div className="text-xl sm:text-2xl font-bold">{customer.total_orders}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">إجمالي الطلبات</div>
            </UnifiedCardContent>
          </UnifiedCard>
          
          <UnifiedCard variant="glass">
            <UnifiedCardContent className="p-4 sm:p-6 text-center">
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-success mb-2" />
              <div className="text-lg sm:text-2xl font-bold">{customer.total_spent_sar.toFixed(2)} ر.س</div>
              <div className="text-xs sm:text-sm text-muted-foreground">إجمالي المشتريات</div>
            </UnifiedCardContent>
          </UnifiedCard>
          
          <UnifiedCard variant="glass">
            <UnifiedCardContent className="p-6 text-center">
              <Award className="w-8 h-8 mx-auto text-warning mb-2" />
              <div className="text-2xl font-bold">{customer.loyalty_points}</div>
              <div className="text-sm text-muted-foreground">نقاط الولاء</div>
            </UnifiedCardContent>
          </UnifiedCard>
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
          <UnifiedCard variant="premium">
            <UnifiedCardHeader>
              <UnifiedCardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                طلباتي
              </UnifiedCardTitle>
            </UnifiedCardHeader>
            <UnifiedCardContent>
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
                          <UnifiedBadge variant="secondary">{order.status}</UnifiedBadge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </UnifiedCardContent>
          </UnifiedCard>
        </TabsContent>

        {/* تبويب العناوين */}
        <TabsContent value="addresses" className="space-y-4">
          <UnifiedCard variant="premium">
            <UnifiedCardHeader>
              <div className="flex items-center justify-between">
                <UnifiedCardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  عناويني
                </UnifiedCardTitle>
                <UnifiedButton size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  إضافة عنوان
                </UnifiedButton>
              </div>
            </UnifiedCardHeader>
            <UnifiedCardContent>
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
                              <UnifiedBadge variant="success" className="text-xs">افتراضي</UnifiedBadge>
                            )}
                            <UnifiedBadge variant="outline" className="text-xs">
                              {address.address_type === 'shipping' ? 'شحن' :
                               address.address_type === 'billing' ? 'فواتير' : 'شحن وفواتير'}
                            </UnifiedBadge>
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
                        
                        <UnifiedButton variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </UnifiedButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </UnifiedCardContent>
          </UnifiedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};