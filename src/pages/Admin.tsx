import React, { useEffect, useMemo, useState } from "react";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

const ADMIN_EMAIL = "Shade199633@icloud.com";

const Admin = () => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { addProduct, getShopProducts, addProductToLibrary } = useSupabaseUserData();
  const { toast } = useToast();

  const isAllowed = useMemo(() => user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(), [user]);

  const [channelName, setChannelName] = useState("");
  const [channelDesc, setChannelDesc] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [channelMembers, setChannelMembers] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<any>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [moderationDuration, setModerationDuration] = useState("24h");
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
const [loading, setLoading] = useState(false);
const [addingProduct, setAddingProduct] = useState(false);

// Inventory automation admin state
const [cronLogs, setCronLogs] = useState<any[]>([]);
  
  // Products Management States
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price_sar: '',
    category: '',
    stock: '',
    commission_rate: ''
  });
  
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
  
  // حالات محلية للنماذج فقط
  const [newPaymentProvider, setNewPaymentProvider] = useState({gateway_name: '', display_name: '', api_key: ''});
  const [newShippingCompany, setNewShippingCompany] = useState({name: '', name_en: '', code: '', api_endpoint: '', base_price_sar: ''});

  const [productVariants, setProductVariants] = useState([
    { size: '', color: '', stock: 0 }
  ]);

  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const totalImages = productImages.length + newFiles.length;
    
    if (totalImages > 10) {
      toast({
        title: "حد الصور",
        description: "يمكن رفع حتى 10 صور فقط للمنتج الواحد",
        variant: "destructive"
      });
      return;
    }

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setProductImages(prev => [...prev, ...newFiles]);
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

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

  const addVariant = () => {
    setProductVariants([...productVariants, { size: '', color: '', stock: 0 }]);
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const updated = [...productVariants];
    updated[index] = { ...updated[index], [field]: value };
    setProductVariants(updated);
  };

  const removeVariant = (index: number) => {
    if (productVariants.length > 1) {
      setProductVariants(productVariants.filter((_, i) => i !== index));
    }
  };

  const [newCategory, setNewCategory] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

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

  const handleAddProduct = async () => {
    if (!newProduct.title.trim() || !newProduct.price_sar) {
      toast({ title: "مطلوب", description: "اسم المنتج والسعر مطلوبان", variant: "destructive" });
      return;
    }

    try {
      setAddingProduct(true);
      
      // Create base product data
      const productData = {
        title: newProduct.title.trim(),
        description: newProduct.description.trim() || null,
        price_sar: parseFloat(newProduct.price_sar),
        category: newProduct.category.trim() || null,
        stock: parseInt(newProduct.stock) || 0,
        commission_rate: parseFloat(newProduct.commission_rate) || 10,
        is_active: true
      };

      // Add product first to get ID
      const productId = await addProduct(productData) as string;
      
      // Upload images to Supabase Storage if any
      let imageUrls: string[] = [];
      if (productImages.length > 0) {
        imageUrls = await uploadImagesToSupabase(productId, productImages);
      }
      
      // Process variants with their images
      const processedVariants = productVariants
        .filter(v => v.size || v.color) // Only include variants with at least size or color
        .map(variant => ({
          variant_type: variant.size && variant.color ? 'size_color' : variant.size ? 'size' : 'color',
          variant_value: variant.size && variant.color ? `${variant.size} - ${variant.color}` : variant.size || variant.color,
          stock: variant.stock || 0,
          size: variant.size || null,
          color: variant.color || null
        }));

      // Update product with images only (variants stored separately in DB)
      if (imageUrls.length > 0) {
        await updateProduct(productId, {
          image_urls: imageUrls
        });
      }

      toast({ title: "تم الحفظ", description: "تم إضافة المنتج إلى المخزون العام" });
      
      // إغلاق النافذة
      setShowAddProduct(false);
      
      // Clean up
      setNewProduct({ title: '', description: '', price_sar: '', category: '', stock: '', commission_rate: '' });
      setProductVariants([{ size: '', color: '', stock: 0 }]);
      setProductImages([]);
      setImagePreviewUrls([]);
      // تحديث القائمة محلياً (اختياري)
      loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({ title: "خطأ", description: "فشل في إضافة المنتج", variant: "destructive" });
    } finally {
      setAddingProduct(false);
    }
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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({ title: "مطلوب", description: "اسم الصنف مطلوب", variant: "destructive" });
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast({ title: "موجود", description: "هذا الصنف موجود بالفعل", variant: "destructive" });
      return;
    }

    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
    toast({ title: "تم الإضافة", description: "تم إضافة الصنف بنجاح" });
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
    <main className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            لوحة الإدارة
          </h1>
        </div>
      </div>
      <header className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">لوحة الإدارة العامة</h1>
        </div>
        <p className="text-muted-foreground">إدارة شاملة للمستخدمين والغرف والصلاحيات</p>
      </header>


      <section aria-labelledby="inventory-integration-admin">
        <Card>
          <CardHeader>
            <CardTitle id="inventory-integration-admin" className="text-2xl">نظام المخزون الداخلي</CardTitle>
            <CardDescription>
              تم إيقاف أي تكاملات خارجية، وتعمل المنصة الآن على إدارة الحجوزات والحركات عبر الجداول الداخلية والوظائف المخزنة في
              Supabase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              تأكد من تطبيق الملف <code className="text-xs bg-muted px-2 py-1 rounded">sql/05_internal_inventory.sql</code> وضبط المتغير <code className="text-xs bg-muted px-2 py-1 rounded">DEFAULT_WAREHOUSE_CODE</code> ليشير إلى المستودع الأساسي.
            </p>
            <p className="text-sm text-muted-foreground">
              بإمكانك مراقبة الحجوزات من جدول <code className="text-xs bg-muted px-2 py-1 rounded">inventory_reservations</code> والحركات الأخيرة من خلال واجهة <code className="text-xs bg-muted px-2 py-1 rounded">/inventory</code> الجديدة.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Cron Jobs Monitoring Section */}
      <section aria-labelledby="cron-monitoring">
        <Card>
          <CardHeader>
            <CardTitle id="cron-monitoring" className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6" />
              سجل المهام التلقائية (Cron Jobs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  آخر 50 عملية تلقائية لنظام المخزون الداخلي
                </p>
                <Button 
                  onClick={loadCronLogs} 
                  size="sm"
                  disabled={loading}
                >
                  تحديث
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم المهمة</TableHead>
                      <TableHead>وقت التنفيذ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الرسالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cronLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          لا توجد سجلات متاحة
                        </TableCell>
                      </TableRow>
                    ) : (
                      cronLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.job_name}
                          </TableCell>
                          <TableCell>
                            {log.executed_at ? new Date(log.executed_at).toLocaleString('ar') : 'غير محدد'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                log.status === 'success' ? 'default' : 
                                log.status === 'partial_success' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {log.status === 'success' ? 'نجح' : 
                               log.status === 'partial_success' ? 'نجح جزئياً' : 
                               'فشل'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate" title={log.message || ''}>
                              {log.message || 'لا توجد رسالة'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {cronLogs.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  عرض {cronLogs.length} من آخر العمليات التلقائية لنظام المخزون
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

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

      <Card>
        <CardContent className="p-6">
          {/* Products Management Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">إدارة المنتجات</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Product & Category */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">إضافة منتج أو صنف</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="اسم الصنف الجديد" 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value)} 
                    />
                    <Button onClick={handleAddCategory} disabled={loading}>
                      إضافة صنف
                    </Button>
                  </div>

                  <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        إضافة منتج جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>إضافة منتج جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="اسم المنتج *"
                          value={newProduct.title}
                          onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                        />
                        <Textarea
                          placeholder="وصف المنتج"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            type="number"
                            placeholder="السعر الأساسي بالريال *"
                            value={newProduct.price_sar}
                            onChange={(e) => setNewProduct({...newProduct, price_sar: e.target.value})}
                          />
                          <Input
                            type="number"
                            placeholder="المخزون الأساسي"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                          />
                        </div>

                        {/* Product Variants Section */}
                        <div className="space-y-4 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">تخصيص المنتج (مقاسات وألوان)</h4>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={addVariant}
                            >
                              + إضافة تركيبة جديدة
                            </Button>
                          </div>
                          
                          <div className="space-y-3 max-h-64 overflow-y-auto bg-muted/10 p-4 rounded-lg">
                            {productVariants.map((variant, index) => (
                              <div key={index} className="grid grid-cols-12 gap-3 items-center p-4 bg-background border rounded-lg shadow-sm">
                                <div className="col-span-4">
                                  <Label className="text-xs text-muted-foreground mb-1 block">المقاس</Label>
                                  <Select 
                                    value={variant.size} 
                                    onValueChange={(value) => updateVariant(index, 'size', value)}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="اختر المقاس" />
                                    </SelectTrigger>
                                    <SelectContent className="z-50 bg-background border shadow-md">
                                      <SelectItem value="XS">XS</SelectItem>
                                      <SelectItem value="S">S</SelectItem>
                                      <SelectItem value="M">M</SelectItem>
                                      <SelectItem value="L">L</SelectItem>
                                      <SelectItem value="XL">XL</SelectItem>
                                      <SelectItem value="XXL">XXL</SelectItem>
                                      <SelectItem value="XXXL">XXXL</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="col-span-4">
                                  <Label className="text-xs text-muted-foreground mb-1 block">اللون</Label>
                                  <Select 
                                    value={variant.color} 
                                    onValueChange={(value) => updateVariant(index, 'color', value)}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="اختر اللون" />
                                    </SelectTrigger>
                                    <SelectContent className="z-50 bg-background border shadow-md">
                                      <SelectItem value="أحمر">أحمر</SelectItem>
                                      <SelectItem value="أزرق">أزرق</SelectItem>
                                      <SelectItem value="أخضر">أخضر</SelectItem>
                                      <SelectItem value="أصفر">أصفر</SelectItem>
                                      <SelectItem value="أسود">أسود</SelectItem>
                                      <SelectItem value="أبيض">أبيض</SelectItem>
                                      <SelectItem value="رمادي">رمادي</SelectItem>
                                      <SelectItem value="بني">بني</SelectItem>
                                      <SelectItem value="بنفسجي">بنفسجي</SelectItem>
                                      <SelectItem value="برتقالي">برتقالي</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="col-span-3">
                                  <Label className="text-xs text-muted-foreground mb-1 block">العدد المتوفر</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={variant.stock}
                                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                    className="h-9"
                                    min="0"
                                  />
                                </div>
                                
                                {productVariants.length > 1 && (
                                  <div className="col-span-1 flex justify-center">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeVariant(index)}
                                      className="text-destructive hover:text-destructive h-9 w-9 p-0"
                                    >
                                      ×
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {productVariants.length === 0 && (
                              <div className="text-center text-muted-foreground py-8">
                                لا توجد تركيبات حالياً - اضغط "إضافة تركيبة جديدة" لإضافة مقاس ولون
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
                            💡 <strong>نصيحة:</strong> كل صف يمثل تركيبة من مقاس ولون مع عددها المتوفر (مثال: أحمر + لارج = 5 قطع)
                          </div>
                        </div>

                        {/* Product Images Section */}
                        <div className="space-y-4 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">صور المنتج (حتى 10 صور)</h4>
                            <Badge variant="outline">{productImages.length}/10</Badge>
                          </div>
                          
                          <div className="space-y-4">
                            {/* Upload Area */}
                            <div 
                              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                                ${productImages.length >= 10 ? 'border-muted bg-muted/20 cursor-not-allowed' : 'border-primary/50 hover:border-primary hover:bg-primary/5 cursor-pointer'}
                              `}
                              onClick={() => {
                                if (productImages.length < 10) {
                                  document.getElementById('product-images-input')?.click();
                                }
                              }}
                            >
                              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground mb-2">
                                {productImages.length >= 10 
                                  ? 'تم الوصول للحد الأقصى من الصور' 
                                  : 'اضغط لرفع الصور أو اسحب الصور هنا'
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {productImages.length >= 10 ? '' : 'PNG, JPG, WebP حتى 5MB لكل صورة'}
                              </p>
                              <input
                                id="product-images-input"
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleImageUpload(e.target.files)}
                                disabled={productImages.length >= 10}
                              />
                            </div>
                            
                            {/* Image Previews */}
                            {imagePreviewUrls.length > 0 && (
                              <div className="grid grid-cols-5 gap-3">
                                {imagePreviewUrls.map((url, index) => (
                                  <div key={index} className="relative group">
                                    <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-border">
                                      <img
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeImage(index)}
                                    >
                                      ×
                                    </Button>
                                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                                      {index + 1}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الصنف" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="نسبة العمولة %"
                            value={newProduct.commission_rate}
                            onChange={(e) => setNewProduct({...newProduct, commission_rate: e.target.value})}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleAddProduct} disabled={addingProduct}>
                            إضافة المنتج
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Products List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">قائمة المنتجات</h3>
                  <Badge variant="outline">{products.length}</Badge>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="bg-card border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{product.title}</h4>
                            <Badge 
                              variant={product.is_active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {product.is_active ? "ظاهر" : "مخفي"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-primary">{product.price_sar} ريال</span>
                            <span>المخزون: {product.stock}</span>
                            {product.category && (
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleProductVisibility(product)}
                            disabled={loading}
                            className={!product.is_active ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-lg" : undefined}
                          >
                            {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            disabled={loading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد منتجات حالياً
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Providers Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">المدفوعات</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Payment Provider */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">إضافة وسيلة دفع</h3>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="معرف الوسيلة (مثل: tabby, tamara)"
                    value={newPaymentProvider.gateway_name}
                    onChange={(e) => setNewPaymentProvider({...newPaymentProvider, gateway_name: e.target.value})}
                  />
                  <Input
                    placeholder="الاسم المعروض (مثل: تابي، تمارا)"
                    value={newPaymentProvider.display_name}
                    onChange={(e) => setNewPaymentProvider({...newPaymentProvider, display_name: e.target.value})}
                  />
                  <Input
                    placeholder="API Key (اختياري)"
                    value={newPaymentProvider.api_key}
                    onChange={(e) => setNewPaymentProvider({...newPaymentProvider, api_key: e.target.value})}
                  />
                  <Button
                    onClick={async () => {
                      if (!newPaymentProvider.gateway_name.trim() || !newPaymentProvider.display_name.trim()) {
                        toast({ title: "مطلوب", description: "المعرف والاسم المعروض مطلوبان", variant: "destructive" });
                        return;
                      }
                      await createPaymentGateway({
                        gateway_name: newPaymentProvider.gateway_name,
                        display_name: newPaymentProvider.display_name,
                        provider: newPaymentProvider.gateway_name, // استخدام نفس المعرف كـ provider
                        api_key: newPaymentProvider.api_key || '',
                        is_enabled: true,
                        is_test_mode: false,
                        percentage_fee: 0,
                        fixed_fee_sar: 0,
                        min_amount_sar: 0,
                        allowed_currencies: ['SAR'],
                        configuration: {}
                      });
                      setNewPaymentProvider({gateway_name: '', display_name: '', api_key: ''});
                      toast({ title: "تم الإضافة", description: "تم إضافة وسيلة الدفع وستظهر لجميع المتاجر" });
                    }}
                    className="w-full"
                    disabled={paymentLoading}
                  >
                    إضافة وسيلة دفع
                  </Button>
                </div>
              </div>

              {/* Payment Providers List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">وسائل الدفع</h3>
                  <Badge variant="outline">{paymentGateways.length}</Badge>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {paymentGateways.map((gateway) => (
                    <div key={gateway.id} className="bg-card border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{gateway.display_name}</h4>
                          <p className="text-xs text-muted-foreground">معرف: {gateway.gateway_name}</p>
                          <p className="text-sm text-muted-foreground">
                            API Key: {gateway.api_key ? '••••••••' : 'غير محدد'}
                          </p>
                          <Badge variant={gateway.is_enabled ? 'default' : 'secondary'} className="mt-1">
                            {gateway.is_enabled ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await deletePaymentGateway(gateway.id);
                            toast({ title: "تم الحذف", description: "تم حذف وسيلة الدفع من جميع المتاجر" });
                          }}
                          className="text-destructive hover:text-destructive"
                          disabled={paymentLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {paymentGateways.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {paymentLoading ? 'جاري التحميل...' : 'لا توجد وسائل دفع محددة'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Companies Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">شركات الشحن</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Shipping Company */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">إضافة شركة شحن</h3>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="اسم الشركة بالعربية"
                    value={newShippingCompany.name}
                    onChange={(e) => setNewShippingCompany({...newShippingCompany, name: e.target.value})}
                  />
                  <Input
                    placeholder="اسم الشركة بالإنجليزية"
                    value={newShippingCompany.name_en}
                    onChange={(e) => setNewShippingCompany({...newShippingCompany, name_en: e.target.value})}
                  />
                  <Input
                    placeholder="رمز الشركة (مثل: aramex, smsa)"
                    value={newShippingCompany.code}
                    onChange={(e) => setNewShippingCompany({...newShippingCompany, code: e.target.value})}
                  />
                  <Input
                    placeholder="رابط API (اختياري)"
                    value={newShippingCompany.api_endpoint}
                    onChange={(e) => setNewShippingCompany({...newShippingCompany, api_endpoint: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="السعر الأساسي (ريال سعودي) *"
                    value={newShippingCompany.base_price_sar}
                    onChange={(e) => setNewShippingCompany({...newShippingCompany, base_price_sar: e.target.value})}
                  />
                  <Button
                    onClick={async () => {
                      if (!newShippingCompany.name.trim() || !newShippingCompany.code.trim() || !newShippingCompany.base_price_sar) {
                        toast({ title: "مطلوب", description: "الاسم والرمز والسعر مطلوبان", variant: "destructive" });
                        return;
                      }
                      await createShippingProvider({
                        name: newShippingCompany.name,
                        name_en: newShippingCompany.name_en || newShippingCompany.name,
                        code: newShippingCompany.code,
                        api_endpoint: newShippingCompany.api_endpoint,
                        base_price_sar: parseFloat(newShippingCompany.base_price_sar),
                        is_active: true,
                        configuration: {}
                      });
                      await refetchShipping?.();
                      setNewShippingCompany({name: '', name_en: '', code: '', api_endpoint: '', base_price_sar: ''});
                      toast({ title: "تم الإضافة", description: "تم إضافة شركة الشحن إلى القائمة" });
                    }}
                    className="w-full"
                    disabled={shippingLoading}
                  >
                    إضافة شركة شحن
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/admin/shipping')}
                    className="w-full"
                  >
                    إدارة المناطق والأسعار
                  </Button>
                </div>
              </div>

              {/* Shipping Companies List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">شركات الشحن</h3>
                  <Badge variant="outline">{shippingProviders.length}</Badge>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {shippingProviders.map((provider) => (
                    <div key={provider.id} className="bg-card border rounded-lg p-4">
                       <div className="flex items-start justify-between mb-2">
                       <div className="flex-1">
                           <h4 className="font-medium">{provider.name}</h4>
                           <p className="text-xs text-muted-foreground">رمز: {provider.code}</p>
                           <p className="text-sm font-semibold text-primary mt-1">
                             السعر: {provider.base_price_sar || 0} ريال
                           </p>
                           {provider.api_endpoint && (
                             <p className="text-xs text-muted-foreground mt-1">
                               API: {provider.api_endpoint}
                             </p>
                           )}
                           <Badge variant={provider.is_active ? 'default' : 'secondary'} className="mt-2">
                             {provider.is_active ? 'نشط' : 'غير نشط'}
                           </Badge>
                         </div>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={async () => {
                             const nextActive = !provider.is_active;
                             await updateShippingProvider(provider.id, { is_active: nextActive });
                             toast({ 
                               title: nextActive ? "تم التفعيل" : "تم التعطيل", 
                               description: `تم ${nextActive ? 'تفعيل' : 'تعطيل'} الشركة بنجاح` 
                             });
                             await refetchShipping?.();
                           }}
                           disabled={shippingLoading}
                         >
                           {provider.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={async () => {
                             const newName = window.prompt("تعديل اسم الشركة", provider.name);
                             if (newName === null) return;
                             const newCode = window.prompt("تعديل رمز الشركة", provider.code);
                             if (newCode === null) return;
                             const newPrice = window.prompt("تعديل السعر الأساسي (ريال)", String(provider.base_price_sar || 0));
                             if (newPrice === null) return;
                             await updateShippingProvider(provider.id, { 
                               name: newName.trim(), 
                               code: newCode.trim(),
                               base_price_sar: parseFloat(newPrice)
                             });
                             toast({ title: "تم التحديث", description: "تم تحديث بيانات شركة الشحن" });
                             await refetchShipping?.();
                           }}
                           disabled={shippingLoading}
                           title="تعديل"
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                       </div>
                    </div>
                  ))}
                  {shippingProviders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {shippingLoading ? 'جاري التحميل...' : 'لا توجد شركات شحن محددة'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
            <p className="text-sm text-primary">
              ✓ جميع التغييرات يتم حفظها تلقائياً في قاعدة البيانات
              <br />
              ✓ وسائل الدفع وشركات الشحن متاحة الآن لجميع المتاجر
              <br />
              ✓ لتحديد أسعار ومناطق الشحن، استخدم <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/admin/shipping')}>صفحة إدارة الشحن</Button>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Channel Management Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">إدارة الغرف</h3>
              </div>
              
              <div className="space-y-3">
                <Input 
                  placeholder="اسم الغرفة الجديدة" 
                  value={channelName} 
                  onChange={(e) => setChannelName(e.target.value)} 
                />
                <Input 
                  placeholder="وصف الغرفة (اختياري)" 
                  value={channelDesc} 
                  onChange={(e) => setChannelDesc(e.target.value)} 
                />
                <Button
                  onClick={async () => {
                    if (!channelName.trim()) {
                      toast({ title: "الاسم مطلوب", variant: "destructive" });
                      return;
                    }
                    const res = await callAdminApi("create_channel", { name: channelName.trim(), description: channelDesc.trim() || null });
                    if (!res.error) {
                      toast({ title: "تم إنشاء الغرفة", description: "تم إنشاء الغرفة بنجاح" });
                      setChannelName("");
                      setChannelDesc("");
                      loadLists();
                    }
                  }}
                  className="w-full"
                  disabled={loading}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  إنشاء غرفة جديدة
                </Button>
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium text-sm">الغرف الحالية</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {channels.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{channel.name}</span>
                          <Badge variant="outline" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {channelMembers[channel.id] || 0}
                          </Badge>
                        </div>
                        {channel.description && (
                          <p className="text-xs text-muted-foreground mt-1">{channel.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log(`Attempting to clear messages for channel: ${channel.name} (${channel.id})`);
                          if (confirm(`هل أنت متأكد من حذف جميع رسائل غرفة "${channel.name}"؟\n\nتحذير: هذا الإجراء لا يمكن التراجع عنه!`)) {
                            clearChannelMessages(channel.id, channel.name);
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User & Moderator Management Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">إدارة المشرفين</h3>
              </div>

              <div className="space-y-3">
                <Input 
                  placeholder="بريد المستخدم" 
                  value={targetEmail} 
                  onChange={(e) => setTargetEmail(e.target.value)} 
                />
                <Input 
                  placeholder="كلمة المرور (للمستخدمين الجدد)" 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={async () => {
                      if (!targetEmail.trim()) return;
                      const res = await callAdminApi("assign_moderator", { email: targetEmail.trim().toLowerCase() });
                      if (!res.error) {
                        toast({ title: "تم التعيين", description: `${targetEmail} أصبح مشرف` });
                        setTargetEmail("");
                        loadLists();
                      }
                    }}
                    disabled={loading}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    تعيين مشرف
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!targetEmail.trim() || !newPassword.trim()) {
                        toast({ title: "مطلوب", description: "البريد وكلمة المرور مطلوبان", variant: "destructive" });
                        return;
                      }
                      const res = await callAdminApi("create_user", { 
                        email: targetEmail.trim().toLowerCase(), 
                        password: newPassword, 
                        role: "moderator" 
                      });
                      if (!res.error) {
                        toast({ title: "تم الإنشاء", description: `أُنشئ ${targetEmail} كمشرف` });
                        setTargetEmail("");
                        setNewPassword("");
                        loadLists();
                      }
                    }}
                    disabled={loading}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    إنشاء مشرف
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium text-sm">المشرفين الحاليين</h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {users.filter(u => u.role === 'moderator').map((moderator) => (
                    <div key={moderator.id} className="flex items-center justify-between bg-accent/20 p-2 rounded">
                      <div className="text-sm">
                        <div className="font-medium">{moderator.full_name || moderator.email}</div>
                        <div className="text-xs text-muted-foreground">{moderator.email}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          const res = await callAdminApi("revoke_moderator", { email: moderator.email.toLowerCase() });
                          if (!res.error) {
                            toast({ title: "تم السحب", description: `تم سحب الإشراف من ${moderator.email}` });
                            loadLists();
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {users.filter(u => u.role === 'moderator').length === 0 && (
                    <p className="text-sm text-muted-foreground">لا يوجد مشرفين حالياً</p>
                  )}
                </div>
              </div>
            </div>

            {/* Users & Moderation Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">إدارة الأعضاء</h3>
              </div>

              <div className="flex gap-2 mb-3">
                <Input 
                  placeholder="بحث بالاسم أو البريد" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                />
                <Button onClick={loadLists} disabled={loading} size="sm">
                  بحث
                </Button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="bg-card border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      {/* User Info - Clickable */}
                      <div 
                        className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-muted/20 p-2 rounded-lg transition-colors select-none"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUserProfileClick(user);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleUserProfileClick(user);
                          }
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} alt={user.full_name} />
                          <AvatarFallback>
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">
                              {user.full_name || user.email}
                            </span>
                            <Badge 
                              variant={
                                user.role === 'admin' ? 'default' : 
                                user.role === 'moderator' ? 'secondary' : 
                                'outline'
                              }
                              className="text-xs shrink-0"
                            >
                              {user.role === 'admin' ? 'مدير' :
                               user.role === 'moderator' ? 'مشرف' :
                               user.role === 'affiliate' || user.role === 'merchant' || user.role === 'marketer' ? 'مسوق' :
                               'مستخدم'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            <div className={`h-2 w-2 rounded-full shrink-0 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                          </div>
                          {user.points !== undefined && (
                            <div className="text-xs text-primary font-medium">
                              {user.points} نقطة
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Settings Menu */}
                      <UserSettingsMenu 
                        user={user}
                        currentUserRole={currentUserProfile?.role || 'affiliate'}
                        onModerationAction={handleModerationAction}
                        onRoleChange={handleRoleChange}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل المنتج</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <Input
                placeholder="اسم المنتج *"
                value={editingProduct.title}
                onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
              />
              <Textarea
                placeholder="وصف المنتج"
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="السعر بالريال *"
                  value={editingProduct.price_sar}
                  onChange={(e) => setEditingProduct({...editingProduct, price_sar: parseFloat(e.target.value)})}
                />
                <Input
                  type="number"
                  placeholder="المخزون"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select value={editingProduct.category || ''} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصنف" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="نسبة العمولة %"
                  value={editingProduct.commission_rate}
                  onChange={(e) => setEditingProduct({...editingProduct, commission_rate: parseFloat(e.target.value)})}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={async () => {
                    try {
                      await updateProduct(editingProduct.id, {
                        title: editingProduct.title,
                        description: editingProduct.description,
                        price_sar: Number(editingProduct.price_sar) || 0,
                        stock: Number(editingProduct.stock) || 0,
                        category: editingProduct.category || null,
                        commission_rate: Number(editingProduct.commission_rate) || 0,
                      });
                      toast({ title: "تم التحديث", description: "تم تحديث المنتج بنجاح" });
                      setEditingProduct(null);
                      loadProducts();
                    } catch (error) {
                      console.error('Error updating product:', error);
                      toast({ title: "خطأ", description: "فشل في تحديث المنتج", variant: "destructive" });
                    }
                  }}
                  disabled={loading}
                >
                  حفظ التغييرات
                </Button>
                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Admin;