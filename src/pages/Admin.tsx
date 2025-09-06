import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileDialog from "@/components/UserProfileDialog";
import UserSettingsMenu from "@/components/UserSettingsMenu";
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
  const { user, session } = useAuth();
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
  
  // Payment Providers States
  const [paymentProviders, setPaymentProviders] = useState<{name: string, apiKey: string}[]>([]);
  const [newPaymentProvider, setNewPaymentProvider] = useState({name: '', apiKey: ''});
  
  // Shipping Companies States
  const [shippingCompanies, setShippingCompanies] = useState<{name: string, apiKey: string, price: number}[]>([]);
  const [newShippingCompany, setNewShippingCompany] = useState({name: '', apiKey: '', price: 0});

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

  const uploadProductImages = async (productId: string): Promise<string[]> => {
    if (productImages.length === 0) return [];

    const uploadedUrls: string[] = [];

    for (let i = 0; i < productImages.length; i++) {
      const file = productImages[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}_${i}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
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
    if (!session?.access_token) {
      toast({ title: "غير مصرح", description: "سجل دخولك أولاً", variant: "destructive" });
      return { error: "unauthorized" };
    }
    try {
      // Removed sensitive body logging for security
      console.log('Calling admin API:', action);
      const { data, error } = await supabase.functions.invoke('admin-actions', {
        body: { action, ...body },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || "خطأ في الخادم");
      }
      
      console.log('Admin API response received');
      return { data };
    } catch (e: any) {
      console.error('API call failed:', e.message);
      toast({ title: "فشل التنفيذ", description: e.message, variant: "destructive" });
      return { error: e.message };
    }
  };

  const loadLists = async () => {
    setLoading(true);
    const [uc, ch, profile] = await Promise.all([
      callAdminApi("list_users", { query: search }),
      callAdminApi("list_channels"),
      // Get current user profile for role checking
      supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user?.id)
        .single()
    ]);
    
    // Load products and categories
    await loadProducts();
    if (!uc.error) setUsers(uc.data.data || []);
    if (!ch.error) {
      setChannels(ch.data.data || []);
      // Load member count for each channel
      const memberCounts: Record<string, number> = {};
      for (const channel of ch.data.data || []) {
        try {
          const { count } = await supabase
            .from('channel_members')
            .select('*', { count: 'exact' })
            .eq('channel_id', channel.id);
          memberCounts[channel.id] = count || 0;
        } catch (error) {
          console.error('Error loading member count:', error);
          memberCounts[channel.id] = 0;
        }
      }
      setChannelMembers(memberCounts);
    }
    if (!profile.error) setCurrentUserProfile(profile.data);
    setLoading(false);
  };

  // Load and save payment providers and shipping companies
  const loadProviders = () => {
    const savedPaymentProviders = localStorage.getItem('admin_payment_providers');
    const savedShippingCompanies = localStorage.getItem('admin_shipping_companies');
    
    if (savedPaymentProviders) {
      setPaymentProviders(JSON.parse(savedPaymentProviders));
    }
    
    if (savedShippingCompanies) {
      setShippingCompanies(JSON.parse(savedShippingCompanies));
    }
  };

  const saveProviders = () => {
    localStorage.setItem('admin_payment_providers', JSON.stringify(paymentProviders));
    localStorage.setItem('admin_shipping_companies', JSON.stringify(shippingCompanies));
  };

  // تم إيقاف الحفظ التلقائي - استخدم زر الحفظ اليدوي في الأسفل

  const loadProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!productsError && productsData) {
        setProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(productsData.map(p => p.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.title.trim() || !newProduct.price_sar) {
      toast({ title: "مطلوب", description: "اسم المنتج والسعر مطلوبان", variant: "destructive" });
      return;
    }

    // Validate variants if they exist
    for (const variant of productVariants) {
      if ((variant.size.trim() && !variant.color.trim()) || (!variant.size.trim() && variant.color.trim())) {
        toast({ title: "مطلوب", description: "يجب ملء المقاس واللون معاً أو تركهما فارغين", variant: "destructive" });
        return;
      }
    }

    try {
      // Ensure merchant profile exists
      let { data: merchant } = await supabase
        .from('merchants')
        .select('*')
        .eq('profile_id', currentUserProfile?.id)
        .single();

      if (!merchant && currentUserProfile) {
        const { data: newMerchant, error: merchantError } = await supabase
          .from('merchants')
          .insert({
            profile_id: currentUserProfile.id,
            business_name: `متجر ${currentUserProfile.full_name || currentUserProfile.email}`,
            default_commission_rate: 10
          })
          .select()
          .single();

        if (merchantError) {
          console.error('Error creating merchant:', merchantError);
          toast({ title: "خطأ", description: "فشل في إنشاء ملف التاجر", variant: "destructive" });
          return;
        }
        merchant = newMerchant;
      }

      const productData = {
        title: newProduct.title.trim(),
        description: newProduct.description.trim() || null,
        price_sar: parseFloat(newProduct.price_sar),
        category: newProduct.category.trim() || null,
        stock: parseInt(newProduct.stock) || 0,
        commission_rate: parseFloat(newProduct.commission_rate) || merchant?.default_commission_rate || 10,
        merchant_id: merchant?.id,
        is_active: true
      };

      const { data: createdProduct, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) {
        throw productError;
      }

      // Upload images first
      const imageUrls = await uploadProductImages(createdProduct.id);
      
      // Update product with image URLs if we have any
      if (imageUrls.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_urls: imageUrls })
          .eq('id', createdProduct.id);

        if (updateError) {
          console.error('Error updating product with images:', updateError);
        }
      }

      // Add product variants if they exist and have values
      const validVariants = productVariants.filter(v => v.size.trim() && v.color.trim());
      if (validVariants.length > 0) {
        // Create separate entries for size and color variants
        const variantsData = [];
        for (const variant of validVariants) {
          // Add size variant
          variantsData.push({
            product_id: createdProduct.id,
            variant_type: 'size',
            variant_value: variant.size.trim(),
            stock: variant.stock || 0
          });
          // Add color variant with same stock
          variantsData.push({
            product_id: createdProduct.id,
            variant_type: 'color',
            variant_value: variant.color.trim(),
            stock: variant.stock || 0
          });
        }

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsData);

        if (variantsError) {
          console.error('Error adding variants:', variantsError);
          toast({ title: "تحذير", description: "تم إضافة المنتج لكن فشل في حفظ بعض المتغيرات", variant: "destructive" });
        }
      }

      toast({ title: "تم الإضافة", description: "تم إضافة المنتج والصور والمتغيرات بنجاح" });
      
      // Clean up
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setNewProduct({ title: '', description: '', price_sar: '', category: '', stock: '', commission_rate: '' });
      setProductVariants([{ size: '', color: '', stock: 0 }]);
      setProductImages([]);
      setImagePreviewUrls([]);
      setShowAddProduct(false);
      loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({ title: "خطأ", description: "فشل في إضافة المنتج", variant: "destructive" });
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
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

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
      
      // Get current user's profile ID
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (!currentProfile) {
        throw new Error('لم يتم العثور على ملف المستخدم');
      }
      
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
        const { error } = await supabase.from('user_mutes').insert(insertData);
        if (error) throw error;
      } else {
        insertData = {
          user_id: targetUser.id,
          banned_by: currentProfile.id,
          channel_id: action === 'tempban' ? channels[0]?.id : null,
          reason: moderationReason,
          expires_at: expiresAt,
          is_active: true
        };
        const { error } = await supabase.from('user_bans').insert(insertData);
        if (error) throw error;
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
        toast({ 
          title: "تم تغيير الدور", 
          description: `تم تغيير دور ${user.full_name || user.email} إلى ${newRole === 'admin' ? 'مدير' : newRole === 'moderator' ? 'مشرف' : newRole === 'merchant' ? 'تاجر' : 'مسوق'}` 
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
      loadProviders(); // Load saved providers
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <header className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">لوحة الإدارة العامة</h1>
        </div>
        <p className="text-muted-foreground">إدارة شاملة للمستخدمين والغرف والصلاحيات</p>
      </header>

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
                          <Button onClick={handleAddProduct} disabled={loading}>
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
                  <h3 className="font-semibold">إضافة شركة دفع</h3>
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="اسم شركة الدفع"
                    value={newPaymentProvider.name}
                    onChange={(e) => setNewPaymentProvider({...newPaymentProvider, name: e.target.value})}
                  />
                  <Input
                    placeholder="API Key"
                    value={newPaymentProvider.apiKey}
                    onChange={(e) => setNewPaymentProvider({...newPaymentProvider, apiKey: e.target.value})}
                  />
                  <Button
                    onClick={() => {
                      if (!newPaymentProvider.name.trim()) {
                        toast({ title: "مطلوب", description: "اسم الشركة مطلوب", variant: "destructive" });
                        return;
                      }
                      const updatedProviders = [...paymentProviders, {...newPaymentProvider}];
                      setPaymentProviders(updatedProviders);
                      setNewPaymentProvider({name: '', apiKey: ''});
                      toast({ title: "تم الإضافة", description: "تم إضافة شركة الدفع بنجاح" });
                    }}
                    className="w-full"
                  >
                    إضافة شركة دفع
                  </Button>
                </div>
              </div>

              {/* Payment Providers List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">شركات الدفع</h3>
                  <Badge variant="outline">{paymentProviders.length}</Badge>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {paymentProviders.map((provider, index) => (
                    <div key={index} className="bg-card border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{provider.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            API Key: {provider.apiKey ? '••••••••' : 'غير محدد'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPaymentProviders(prev => prev.filter((_, i) => i !== index));
                            toast({ title: "تم الحذف", description: "تم حذف شركة الدفع بنجاح" });
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {paymentProviders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد شركات دفع محددة
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
                    placeholder="اسم شركة الشحن"
                    value={newShippingCompany.name}
                    onChange={(e) => setNewShippingCompany({...newShippingCompany, name: e.target.value})}
                  />
                  <Input
                    placeholder="API Key"
                    value={newShippingCompany.apiKey}
                    onChange={(e) => setNewShippingCompany({...newShippingCompany, apiKey: e.target.value})}
                  />
                  <Input
                    type="number"
                    placeholder="سعر الشحن (ريال)"
                    value={newShippingCompany.price}
                    onChange={(e) => setNewShippingCompany({...newShippingCompany, price: parseFloat(e.target.value) || 0})}
                  />
                  <Button
                    onClick={() => {
                      if (!newShippingCompany.name.trim()) {
                        toast({ title: "مطلوب", description: "اسم الشركة مطلوب", variant: "destructive" });
                        return;
                      }
                      const updatedCompanies = [...shippingCompanies, {...newShippingCompany}];
                      setShippingCompanies(updatedCompanies);
                      setNewShippingCompany({name: '', apiKey: '', price: 0});
                      toast({ title: "تم الإضافة", description: "تم إضافة شركة الشحن بنجاح" });
                    }}
                    className="w-full"
                  >
                    إضافة شركة شحن
                  </Button>
                </div>
              </div>

              {/* Shipping Companies List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">شركات الشحن</h3>
                  <Badge variant="outline">{shippingCompanies.length}</Badge>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3">
                  {shippingCompanies.map((company, index) => (
                    <div key={index} className="bg-card border rounded-lg p-4">
                       <div className="flex items-start justify-between mb-2">
                         <div className="flex-1">
                           <h4 className="font-medium">{company.name}</h4>
                           <p className="text-sm text-muted-foreground">
                             API Key: {company.apiKey ? '••••••••' : 'غير محدد'}
                           </p>
                           <p className="text-sm font-medium text-primary">
                             سعر الشحن: {company.price} ريال
                           </p>
                         </div>
                         <div className="flex items-center gap-2">
                           <Input
                             type="number"
                             placeholder="سعر جديد"
                             className="w-24 h-8"
                             onChange={(e) => {
                               const newPrice = parseFloat(e.target.value) || 0;
                               setShippingCompanies(prev => 
                                 prev.map((comp, i) => 
                                   i === index ? { ...comp, price: newPrice } : comp
                                 )
                               );
                             }}
                           />
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => {
                               const updatedCompanies = shippingCompanies.filter((_, i) => i !== index);
                               setShippingCompanies(updatedCompanies);
                               toast({ title: "تم الحذف", description: "تم حذف شركة الشحن بنجاح" });
                             }}
                             className="text-destructive hover:text-destructive"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                    </div>
                  ))}
                  {shippingCompanies.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      لا توجد شركات شحن محددة
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <Button
              onClick={() => {
                saveProviders();
                toast({ title: "تم الحفظ", description: "تم حفظ إعدادات الدفع والشحن" });
              }}
            >
              حفظ إعدادات الدفع والشحن
            </Button>
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
                               user.role === 'merchant' ? 'تاجر' :
                               'مسوق'}
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
                      const { error } = await supabase
                        .from('products')
                        .update({
                          title: editingProduct.title,
                          description: editingProduct.description,
                          price_sar: editingProduct.price_sar,
                          stock: editingProduct.stock,
                          category: editingProduct.category,
                          commission_rate: editingProduct.commission_rate
                        })
                        .eq('id', editingProduct.id);

                      if (error) throw error;

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