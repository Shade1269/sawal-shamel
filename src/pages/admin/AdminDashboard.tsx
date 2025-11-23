import React, { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { UnifiedButton } from "@/components/design-system";
import { UnifiedInput } from "@/components/design-system";
import { Label } from "@/components/ui/label";
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from "@/components/design-system";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UnifiedBadge } from "@/components/design-system";
import { useToast } from "@/hooks/use-toast";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileDialog from "@/shared/components/UserProfileDialog";
import UserSettingsMenu from "@/components/UserSettingsMenu";
import EmkanIntegration from "@/components/EmkanIntegration";
import { useSupabaseUserData } from "@/hooks/useSupabaseUserData";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { BackButton } from '@/components/ui/back-button';
import { useShippingManagement } from '@/hooks/useShippingManagement';
import { usePaymentGateways } from '@/hooks/usePaymentGateways';
import { InventoryAutomation } from './components/InventoryAutomation';
import { CronJobsMonitoring } from './components/CronJobsMonitoring';
import { ProductsSection } from './components/ProductsSection';
import { PaymentProvidersSection } from './components/PaymentProvidersSection';
import { ShippingSection } from './components/ShippingSection';
import { ChannelsSection } from './components/ChannelsSection';
import { ModeratorsSection } from './components/ModeratorsSection';
import { UsersSection } from './components/UsersSection';


import { 
  Shield, 
  Ban, 
  VolumeX, 
  Clock, 
  AlertTriangle,
  User,
  Users,
  MessageSquare,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  MessageCircle,
  Package,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com";

const Admin = () => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { addProduct, getShopProducts, addProductToLibrary } = useSupabaseUserData();
  const { toast } = useToast();

  const isAllowed = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const [users, setUsers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [channelMembers, setChannelMembers] = useState<Record<string, number>>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [moderationDuration, setModerationDuration] = useState("24h");
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Inventory automation admin state
  const [cronLogs, setCronLogs] = useState<any[]>([]);

  // Products Management States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // استخدام Hooks لإدارة الشحن والدفع من قاعدة البيانات
  const {
    providers: shippingProviders,
    loading: shippingLoading,
    createProvider: createShippingProvider,
    updateProvider: updateShippingProvider,
    refetch: refetchShipping
  } = useShippingManagement();

  const {
    gateways: paymentGateways,
    loading: paymentLoading,
    createGateway: createPaymentGateway,
    deleteGateway: deletePaymentGateway
  } = usePaymentGateways();

  // Upload images to Supabase Storage
  const uploadImagesToSupabase = async (productId: string, images: File[]): Promise<string[]> => {
    if (images.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    try {
      // Import Firebase Storage functions
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { getFirebaseApp } = await import('@/lib/firebase');
      const app = await getFirebaseApp();
      
      const storage = getStorage(app);

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `products/${productId}/${Date.now()}_${i}.${fileExt}`;
        const storageRef = ref(storage, fileName);

        try {
          // Upload file to Firebase Storage
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          uploadedUrls.push(downloadURL);
        } catch (error) {
          console.error(`Error uploading image ${i}:`, error);
        }
      }
    } catch (error) {
      console.error('Error with Firebase Storage:', error);
    }

    return uploadedUrls;
  };

  // Update product with new data
  const updateProduct = async (productId: string, updates: any) => {
    try {
      // Update product via Supabase
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };


  const callAdminApi = async (action: string, body: any = {}) => {
    if (!user) {
      toast({ title: "غير مصرح", description: "سجل دخولك أولاً", variant: "destructive" });
      return { error: "unauthorized" };
    }
    try {
      console.log('Admin action:', action);
      // For now, return mock data since we're moving to Firestore
      return { data: { data: [] } };
    } catch (e: any) {
      console.error('API call failed:', e.message);
      toast({ title: "فشل التنفيذ", description: e.message, variant: "destructive" });
      return { error: e.message };
    }
  };

  const loadLists = async () => {
    setLoading(true);
    // Load data from Firestore instead
    await loadProducts();
    await loadCronLogs();
    
    // Mock data for now
    setUsers([]);
    setChannels([]);
    setChannelMembers({});
    setCurrentUserProfile(null);
    setLoading(false);
  };

  // لا حاجة لـ loadProviders و saveProviders - البيانات تأتي مباشرة من قاعدة البيانات

  const loadProducts = async () => {
    try {
      if (!user) return;
      
      const products = await getShopProducts();
      setProducts(products);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(products.map((p: any) => p.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCronLogs = async () => {
    try {
      // Mock cron logs for Supabase setup
      setCronLogs([]);
    } catch (error) {
      console.error('Error loading cron logs:', error);
    }
  };

  // معالجات قسم المنتجات
  const handleAddProductToLibrary = async (productData: any, images: File[], variants: any[]) => {
    try {
      const productId = await addProduct(productData) as string;

      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImagesToSupabase(productId, images);
      }

      if (imageUrls.length > 0) {
        await updateProduct(productId, { image_urls: imageUrls });
      }

      toast({ title: "تم الحفظ", description: "تم إضافة المنتج إلى المخزون العام" });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({ title: "خطأ", description: "فشل في إضافة المنتج", variant: "destructive" });
      throw error;
    }
  };

  const handleAddCategoryToList = (category: string) => {
    setCategories([...categories, category]);
    toast({ title: "تم الإضافة", description: "تم إضافة الصنف بنجاح" });
  };

  // معالجات قسم القنوات
  const handleCreateChannel = async (name: string, description: string) => {
    const res = await callAdminApi("create_channel", { name, description });
    if (!res.error) {
      toast({ title: "تم إنشاء الغرفة", description: "تم إنشاء الغرفة بنجاح" });
      loadLists();
    }
  };

  // معالجات قسم المشرفين
  const handleAssignModerator = async (email: string) => {
    const res = await callAdminApi("assign_moderator", { email });
    if (!res.error) {
      return;
    }
    throw new Error(res.error);
  };

  const handleRevokeModerator = async (email: string) => {
    const res = await callAdminApi("revoke_moderator", { email });
    if (!res.error) {
      return;
    }
    throw new Error(res.error);
  };

  const handleCreateModeratorUser = async (email: string, password: string) => {
    const res = await callAdminApi("create_user", { email, password, role: "moderator" });
    if (!res.error) {
      return;
    }
    throw new Error(res.error);
  };


  const handleToggleProductVisibility = async (product: any) => {
    try {
      const res = await callAdminApi('update_product_visibility', {
        product_id: product.id,
        is_active: !product.is_active,
      });

      if ((res as any).error) throw new Error((res as any).error);

      toast({ 
        title: product.is_active ? "تم الإخفاء" : "تم الإظهار", 
        description: `تم ${product.is_active ? 'إخفاء' : 'إظهار'} المنتج بنجاح` 
      });

      // Update local state immediately for snappier UI
      setProducts((prev) => prev.map(p => p.id === product.id ? { ...p, is_active: !product.is_active } : p));
    } catch (error) {
      console.error('Error toggling product visibility (admin):', error);
      toast({ title: "خطأ", description: "فشل في تغيير حالة المنتج", variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (product: any) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${product.title}"؟`)) return;

    try {
      if (!user) throw new Error('المستخدم غير مسجل');
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      const { getFirebaseApp } = await import('@/lib/firebase');
      const app = await getFirebaseApp();
      const db = getFirestore(app);
      const productRef = doc(db, 'users', user.id, 'products', product.id);
      await deleteDoc(productRef);

      toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح" });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: "خطأ", description: "فشل في حذف المنتج", variant: "destructive" });
    }
  };


  const handleModerationAction = async (action: 'ban' | 'mute' | 'tempban', targetUser: any) => {
    if (!targetUser || !moderationReason.trim()) {
      toast({ title: "مطلوب", description: "الرجاء إدخال سبب الإجراء", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      
      // Mock profile data for Firebase setup
      const currentProfile = { id: user?.id };
      
      let expiresAt = null;
      if (action === 'mute' || action === 'tempban') {
        const hours = moderationDuration === '24h' ? 24 : 1;
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }

      let insertData;
      if (action === 'mute') {
        insertData = {
          user_id: targetUser.id,
          muted_by: currentProfile.id,
          channel_id: channels[0]?.id || null,
          reason: moderationReason,
          expires_at: expiresAt,
          is_active: true
        };
        // Firebase moderation logic will be implemented here
        console.log('Mute action:', insertData);
      } else {
        insertData = {
          user_id: targetUser.id,
          banned_by: currentProfile.id,
          channel_id: action === 'tempban' ? channels[0]?.id : null,
          reason: moderationReason,
          expires_at: expiresAt,
          is_active: true
        };
        // Firebase ban logic will be implemented here
        console.log('Ban action:', insertData);
      }

      toast({
        title: `تم ${action === 'ban' ? 'حظر' : action === 'tempban' ? 'حظر مؤقت' : 'إسكات'} المستخدم`,
        description: `تم ${action === 'ban' ? 'حظر' : action === 'tempban' ? 'حظر مؤقت' : 'إسكات'} ${targetUser.full_name || targetUser.email} بنجاح`
      });

      setSelectedUser(null);
      setModerationReason("");
      loadLists();
    } catch (error) {
      console.error('Moderation action error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تنفيذ الإجراء",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserProfileClick = (user: any) => {
    console.log('Profile clicked for user:', user?.email || user?.id);
    if (!user) {
      toast({ 
        title: "خطأ", 
        description: "لا يمكن عرض البروفايل", 
        variant: "destructive" 
      });
      return;
    }
    setSelectedUserForProfile(user);
    setShowUserProfile(true);
  };

  const handleRoleChange = async (user: any, newRole: string) => {
    try {
      const res = await callAdminApi(newRole === 'moderator' ? 'assign_moderator' : 'update_role', { 
        email: user.email.toLowerCase(),
        role: newRole
      });
      if (!res.error) {
        const roleLabel =
          newRole === 'admin'
            ? 'مدير'
            : newRole === 'moderator'
              ? 'مشرف'
              : newRole === 'affiliate' || newRole === 'merchant'
                ? 'مسوق'
                : 'مستخدم';

        toast({
          title: "تم تغيير الدور",
          description: `تم تغيير دور ${user.full_name || user.email} إلى ${roleLabel}`
        });
        loadLists();
      }
    } catch (error) {
      console.error('Role change error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تغيير الدور",
        variant: "destructive"
      });
    }
  };

  const clearChannelMessages = async (channelId: string, channelName: string) => {
    if (!confirm(`هل أنت متأكد من حذف جميع رسائل غرفة "${channelName}"؟`)) return;
    
    try {
      setLoading(true);
      console.log('Clearing messages for channel:', channelId, channelName);
      
      const res = await callAdminApi("clear_channel_messages", { channel_id: channelId });
      
      if (!res.error) {
        toast({ 
          title: "تم المسح بنجاح", 
          description: `تم مسح جميع رسائل غرفة ${channelName}` 
        });
        // Reload the lists to refresh data
        setTimeout(() => loadLists(), 500);
      } else {
        console.error('Clear messages error:', res.error);
        toast({ 
          title: "خطأ في المسح", 
          description: `فشل في مسح الرسائل: ${res.error}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Clear messages exception:', error);
      toast({ 
        title: "خطأ", 
        description: "فشل في مسح الرسائل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAllowed) {
      loadLists();
      // البيانات تأتي مباشرة من قاعدة البيانات عبر Hooks
    }
  }, [isAllowed]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">الرجاء تسجيل الدخول للوصول إلى لوحة الإدارة</p>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">غير مصرح بالوصول إلى هذه الصفحة</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-8 space-y-8" data-admin-layout>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <BackButton />
          <div>
            <h1 className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent tracking-tight">
              لوحة الإدارة
            </h1>
            <p className="text-lg text-muted-foreground/80 font-medium mt-2">نظام إدارة شامل ومتطور</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow ring-2 ring-primary/20">
            <Shield className="h-6 w-6 text-white drop-shadow-sm" />
          </div>
        </div>
      </div>


      <InventoryAutomation />

      {/* Cron Jobs Monitoring Section */}
      <CronJobsMonitoring
        cronLogs={cronLogs}
        loading={loading}
        onRefresh={loadCronLogs}
      />

      {/* Emkan Integration Section */}
      <section aria-labelledby="emkan-integration-admin">
        <Card>
          <CardHeader>
            <CardTitle id="emkan-integration-admin" className="text-2xl">تكامل إمكان - اشتري الآن وادفع لاحقاً</CardTitle>
          </CardHeader>
          <CardContent>
            <EmkanIntegration />
          </CardContent>
        </Card>
      </section>

      <Card className="admin-card-enhanced">
        <CardContent className="p-8">
          {/* قسم إدارة المنتجات */}
          <ProductsSection
            products={products}
            categories={categories}
            loading={loading}
            onRefresh={loadProducts}
            onAddProduct={handleAddProductToLibrary}
            onUpdateProduct={updateProduct}
            onDeleteProduct={handleDeleteProduct}
            onToggleVisibility={handleToggleProductVisibility}
            onAddCategory={handleAddCategoryToList}
          />

          {/* قسم إدارة وسائل الدفع */}
          <PaymentProvidersSection
            paymentGateways={paymentGateways}
            loading={paymentLoading}
            onCreate={createPaymentGateway}
            onDelete={deletePaymentGateway}
          />

          {/* قسم إدارة شركات الشحن */}
          <ShippingSection
            providers={shippingProviders}
            loading={shippingLoading}
            onCreate={createShippingProvider}
            onUpdate={updateShippingProvider}
            onRefetch={refetchShipping}
          />

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
            <p className="text-sm text-primary">
              ✓ جميع التغييرات يتم حفظها تلقائياً في قاعدة البيانات
              <br />
              ✓ وسائل الدفع وشركات الشحن متاحة الآن لجميع المتاجر
              <br />
              ✓ لتحديد أسعار ومناطق الشحن، استخدم <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/admin/shipping')}>صفحة إدارة الشحن</Button>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* قسم إدارة الغرف */}
            <ChannelsSection
              channels={channels}
              channelMembers={channelMembers}
              loading={loading}
              onCreate={handleCreateChannel}
              onClearMessages={clearChannelMessages}
            />

            {/* قسم إدارة المشرفين */}
            <ModeratorsSection
              users={users}
              loading={loading}
              onAssign={handleAssignModerator}
              onRevoke={handleRevokeModerator}
              onCreateModerator={handleCreateModeratorUser}
              onRefresh={loadLists}
            />

            {/* قسم إدارة المستخدمين */}
            <UsersSection
              users={users}
              loading={loading}
              currentUserRole={currentUserProfile?.role || 'affiliate'}
              onSearch={loadLists}
              onProfileClick={handleUserProfileClick}
              onModerationAction={handleModerationAction}
              onRoleChange={handleRoleChange}
            />

          </div>
        </CardContent>
      </Card>

      {/* User Profile Dialog */}
      <UserProfileDialog
        user={selectedUserForProfile}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setSelectedUserForProfile(null);
        }}
        showNotificationSettings={false}
      />
    </main>
  );
};

export default Admin;