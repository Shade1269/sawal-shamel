import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package, Search, Filter, ArrowLeft, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price_sar: number;
  image_urls: string[] | null;
  category: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
}

const Inventory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price_sar: '',
    category: '',
    stock: ''
  });

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

  // Add state for user's shop
  const [userShop, setUserShop] = useState<any>(null);

  const addToStore = async (productId: string) => {
    try {
      if (!userShop) {
        toast({
          title: "تنبيه",
          description: "يجب إنشاء متجر أولاً من صفحة إدارة المتجر",
          variant: "destructive"
        });
        return;
      }

      // Check if product is already in store
      const { data: existingItem } = await supabase
        .from('product_library')
        .select('id')
        .eq('shop_id', userShop.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        toast({
          title: "تنبيه",
          description: "المنتج موجود بالفعل في متجرك",
          variant: "destructive"
        });
        return;
      }

      // Get max sort_index for this shop
      const { data: maxSort } = await supabase
        .from('product_library')
        .select('sort_index')
        .eq('shop_id', userShop.id)
        .order('sort_index', { ascending: false })
        .limit(1);

      const nextSortIndex = maxSort && maxSort.length > 0 ? maxSort[0].sort_index + 1 : 0;

      const { error } = await supabase
        .from('product_library')
        .insert({
          shop_id: userShop.id,
          product_id: productId,
          sort_index: nextSortIndex
        });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة المنتج إلى متجرك"
      });

    } catch (error) {
      console.error('Error adding product to store:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المنتج إلى المتجر",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProducts();
    fetchUserShop();
  }, [user, navigate]);

  const fetchUserShop = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (profile) {
        const { data: shop } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', profile.id)
          .single();
        
        setUserShop(shop);
      }
    } catch (error) {
      console.error('Error fetching user shop:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "خطأ",
          description: "فشل في جلب المنتجات",
          variant: "destructive"
        });
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Realtime updates: reflect changes immediately in the Inventory
  useEffect(() => {
    const channel = supabase
      .channel('inventory-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, () => {
        fetchUserShop(); // Refresh shop data when shops table changes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate variants if they exist
    for (const variant of productVariants) {
      if ((variant.size.trim() && !variant.color.trim()) || (!variant.size.trim() && variant.color.trim())) {
        toast({
          title: "مطلوب",
          description: "يجب ملء المقاس واللون معاً أو تركهما فارغين",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      // First check if user has a merchant profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على الملف الشخصي",
          variant: "destructive"
        });
        return;
      }

      // Check if merchant exists
      let { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      // If no merchant exists, create one
      if (!merchant) {
        const { data: newMerchant, error: merchantError } = await supabase
          .from('merchants')
          .insert({
            profile_id: profile.id,
            business_name: 'متجري'
          })
          .select('id')
          .single();

        if (merchantError) {
          toast({
            title: "خطأ",
            description: "فشل في إنشاء حساب التاجر",
            variant: "destructive"
          });
          return;
        }

        merchant = newMerchant;
      }

      const { data: createdProduct, error: productError } = await supabase
        .from('products')
        .insert({
          title: newProduct.title,
          description: newProduct.description || null,
          price_sar: parseFloat(newProduct.price_sar),
          category: newProduct.category || null,
          stock: parseInt(newProduct.stock),
          merchant_id: merchant.id
        })
        .select()
        .single();

      if (productError) {
        toast({
          title: "خطأ",
          description: "فشل في إضافة المنتج",
          variant: "destructive"
        });
        return;
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

      toast({
        title: "تم بنجاح",
        description: "تم إضافة المنتج والصور والمتغيرات بنجاح"
      });

      // Clean up
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setNewProduct({
        title: '',
        description: '',
        price_sar: '',
        category: '',
        stock: ''
      });
      setProductVariants([{ size: '', color: '', stock: 0 }]);
      setProductImages([]);
      setImagePreviewUrls([]);
      setIsAddDialogOpen(false);
      fetchProducts();

    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">المخزون</h1>
              <p className="text-muted-foreground">إدارة كتالوج المنتجات</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="title">اسم المنتج</Label>
                  <Input
                    id="title"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر (ريال)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price_sar}
                      onChange={(e) => setNewProduct({...newProduct, price_sar: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">الكمية</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  />
                </div>

                {/* Product Variants Section */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">تخصيص المنتج (مقاسات وألوان)</Label>
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
                              <X className="h-4 w-4" />
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
                    <Label className="text-sm font-semibold">صور المنتج (حتى 10 صور)</Label>
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
                          document.getElementById('inventory-images-input')?.click();
                        }
                      }}
                    >
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
                        id="inventory-images-input"
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
                              <X className="h-4 w-4" />
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

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    إضافة المنتج
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="min-w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="">جميع الفئات</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground mb-4">
                {products.length === 0 
                  ? "ابدأ بإضافة منتجاتك الأولى" 
                  : "لا توجد منتجات مطابقة للبحث"}
              </p>
              {products.length === 0 && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة منتج
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                {/* Add to Store Button */}
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground border-2"
                    onClick={() => addToStore(product.id)}
                    title="إضافة إلى متجري"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <img
                      src={product.image_urls[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                    {product.category && (
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                  {product.description && (
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {product.price_sar} ريال
                      </div>
                      <div className="text-sm text-muted-foreground">
                        المتوفر: {product.stock}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;