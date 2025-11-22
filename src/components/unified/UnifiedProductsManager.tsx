import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from "@/components/design-system";
import { UnifiedButton } from "@/components/design-system";
import { UnifiedInput } from "@/components/design-system";
import { UnifiedBadge } from "@/components/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Edit,
  Trash2,
  Eye,
  Star,
  ShoppingCart,
  BarChart3,
  Download,
  Upload,
  Tag,
  Image as ImageIcon
} from "lucide-react";
import { useFastAuth } from "@/hooks/useFastAuth";
import { ProductVariantDisplay } from "@/components/products/ProductVariantDisplay";
import { supabase } from "@/integrations/supabase/client";

interface ProductVariant {
  color?: string;
  size?: string;
  sku?: string;
  stock?: number;
}

interface ProductVariant {
  color?: string;
  size?: string;
  sku?: string;
  stock?: number;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  price_sar: number;
  category?: string;
  stock: number;
  image_urls?: string[];
  is_active: boolean;
  commission_rate?: number;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
}

interface ProductsConfig {
  title: string;
  description: string;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  showCommission: boolean;
  showAnalytics: boolean;
  viewModes: ('grid' | 'list' | 'table')[];
  filters: FilterOption[];
  actions: ActionButton[];
}

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'range' | 'search';
  options?: { value: string; label: string }[];
}

interface ActionButton {
  label: string;
  icon: any;
  action: string;
  variant: 'default' | 'outline' | 'secondary' | 'destructive';
}

const productsConfigs: Record<string, ProductsConfig> = {
  admin: {
    title: "إدارة المنتجات",
    description: "إدارة شاملة لجميع المنتجات في النظام",
    canAdd: true,
    canEdit: true,
    canDelete: true,
    showCommission: true,
    showAnalytics: true,
    viewModes: ['grid', 'list', 'table'],
    filters: [
      {
        key: 'category',
        label: 'الفئة',
        type: 'select',
        options: [
          { value: 'electronics', label: 'إلكترونيات' },
          { value: 'fashion', label: 'أزياء' },
          { value: 'home', label: 'منزل وحديقة' }
        ]
      },
      {
        key: 'price',
        label: 'السعر',
        type: 'range'
      },
      {
        key: 'status',
        label: 'الحالة',
        type: 'select',
        options: [
          { value: 'active', label: 'نشط' },
          { value: 'inactive', label: 'غير نشط' }
        ]
      }
    ],
    actions: [
      { label: 'إضافة منتج', icon: Plus, action: 'add', variant: 'default' },
      { label: 'استيراد', icon: Upload, action: 'import', variant: 'outline' },
      { label: 'تصدير', icon: Download, action: 'export', variant: 'outline' }
    ]
  },

  affiliate: {
    title: "متصفح المنتجات",
    description: "استعرض واختر المنتجات للترويج لها",
    canAdd: false,
    canEdit: false,
    canDelete: false,
    showCommission: true,
    showAnalytics: false,
    viewModes: ['grid', 'list'],
    filters: [
      {
        key: 'category',
        label: 'الفئة',
        type: 'select',
        options: [
          { value: 'electronics', label: 'إلكترونيات' },
          { value: 'fashion', label: 'أزياء' },
          { value: 'home', label: 'منزل وحديقة' }
        ]
      },
      {
        key: 'commission',
        label: 'العمولة',
        type: 'range'
      }
    ],
    actions: [
      { label: 'إضافة للمتجر', icon: Plus, action: 'addToStore', variant: 'default' }
    ]
  },

};

export function UnifiedProductsManager() {
  const { profile } = useFastAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const managerType = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/admin/inventory') || path.includes('/product-management')) return 'admin';
    if (path.includes('/products-browser')) return 'affiliate';
    if (path === '/products' || path.startsWith('/products')) return 'affiliate';

    // تحديد النوع حسب دور المستخدم
    if (profile?.role === 'admin') return 'admin';
    if (profile?.role === 'affiliate' || profile?.role === 'merchant' || profile?.role === 'marketer') return 'affiliate';

    return 'affiliate'; // افتراضي
  }, [location.pathname, profile?.role]);

  const config = productsConfigs[managerType];
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  // تحميل المنتجات من قاعدة البيانات
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // للمسوقين والعملاء: فقط المنتجات الموافق عليها والنشطة
        // للأدمن: جميع المنتجات
        let query = supabase.from('products').select('*');
        
        if (managerType !== 'admin') {
          query = query
            .eq('approval_status', 'approved')
            .eq('is_active', true);
        }
        
        const { data: productsData, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading products:', error);
          setProducts([]);
          return;
        }

        // جلب المتغيرات لكل منتج
        const productsWithVariants = await Promise.all(
          (productsData || []).map(async (product) => {
            const { data: variants, error: variantsError } = await supabase
              .from('product_variants_advanced')
              .select('color, size, sku, quantity, is_active')
              .eq('product_id', product.id)
              .eq('is_active', true);

            if (variantsError) {
              console.error('Error loading variants for product', product.id, variantsError);
            }

            return {
              ...product,
              variants: variants?.map(v => ({
                color: v.color,
                size: v.size,
                sku: v.sku,
                stock: v.quantity
              })) || []
            };
          })
        );

        setProducts(productsWithVariants as Product[]);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // تصفية المنتجات
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // فتح dialog الإضافة عند وجود المعامل في URL
  useEffect(() => {
    if (config?.canAdd && searchParams.get('action') === 'add') {
      setShowAddDialog(true);
    }
  }, [searchParams, config?.canAdd]);

  if (!config) {
    return null;
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'add':
        setShowAddDialog(true);
        break;
      case 'addToStore':
        // منطق إضافة للمتجر
        break;
      case 'import':
        // منطق الاستيراد
        break;
      case 'export':
        // منطق التصدير
        break;
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <UnifiedCard className="group hover:shadow-lg transition-shadow">
      <UnifiedCardContent className="p-3 md:p-4">
        <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
          {product.image_urls?.[0] ? (
            <img 
              src={product.image_urls[0]} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <UnifiedBadge variant={product.is_active ? 'success' : 'secondary'} size="sm">
              {product.is_active ? 'نشط' : 'غير نشط'}
            </UnifiedBadge>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-sm md:text-base truncate" title={product.title}>
            {product.title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg font-bold text-primary">
              {product.price_sar} ر.س
            </span>
            {config.showCommission && product.commission_rate && (
              <UnifiedBadge variant="outline" className="text-xs">
                عمولة {product.commission_rate}%
              </UnifiedBadge>
            )}
          </div>
          
          {/* عرض المتغيرات */}
          {product.variants && product.variants.length > 0 && (
            <div className="pt-2">
              <ProductVariantDisplay 
                variants={product.variants.flatMap(v => {
                  const result: Array<{type: string; value: string; stock: number}> = [];
                  if (v.color) result.push({ type: 'color', value: v.color, stock: v.stock || 0 });
                  if (v.size) result.push({ type: 'size', value: v.size, stock: v.stock || 0 });
                  return result;
                })} 
                compact={true} 
              />
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>المخزون: {product.stock}</span>
            <span>الفئة: {product.category}</span>
          </div>
        </div>
        
        {/* Mobile-first Action Buttons */}
        <div className="flex gap-1 md:gap-2 mt-3 md:mt-4 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity">
          <UnifiedButton 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs md:text-sm h-8 md:h-9"
            onClick={() => {
              setSelectedProduct(product);
              setShowViewDialog(true);
            }}
          >
            <Eye className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
            <span className="hidden sm:inline">عرض</span>
          </UnifiedButton>
          {config.canEdit && (
            <UnifiedButton size="sm" variant="outline" className="flex-1 text-xs md:text-sm h-8 md:h-9">
              <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
              <span className="hidden sm:inline">تعديل</span>
            </UnifiedButton>
          )}
          {managerType === 'affiliate' && (
            <UnifiedButton size="sm" className="flex-1 text-xs md:text-sm h-8 md:h-9">
              <Plus className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
              <span className="hidden sm:inline">إضافة</span>
            </UnifiedButton>
          )}
        </div>
      </UnifiedCardContent>
    </UnifiedCard>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold truncate">{config.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{config.description}</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {config.actions.map((action, index) => {
            const ActionIcon = action.icon;
            return (
              <UnifiedButton
                key={index}
                variant={action.variant as any}
                onClick={() => handleAction(action.action)}
                size="sm"
                className="flex-shrink-0"
              >
                <ActionIcon className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{action.label}</span>
                <span className="md:hidden text-xs">{action.label.split(' ')[0]}</span>
              </UnifiedButton>
            );
          })}
        </div>
      </div>

      {/* Filters and Search - Enhanced Mobile */}
      <UnifiedCard>
        <UnifiedCardContent className="p-3 md:p-4">
          <div className="space-y-3 md:space-y-0 md:flex md:items-center md:gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <UnifiedInput
                  placeholder="البحث في المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="min-w-0 md:min-w-[160px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 h-10 border border-input rounded-md bg-background text-sm"
              >
                <option value="">جميع الفئات</option>
                <option value="electronics">إلكترونيات</option>
                <option value="fashion">أزياء</option>
                <option value="home">منزل وحديقة</option>
              </select>
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center gap-1 md:gap-2 justify-center md:justify-start">
              {config.viewModes.includes('grid') && (
                <UnifiedButton
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1 md:flex-none min-w-[44px] h-10"
                >
                  <Grid className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline text-xs">شبكة</span>
                </UnifiedButton>
              )}
              {config.viewModes.includes('list') && (
                <UnifiedButton
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1 md:flex-none min-w-[44px] h-10"
                >
                  <List className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline text-xs">قائمة</span>
                </UnifiedButton>
              )}
            </div>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>

      {/* Products Grid - Enhanced Responsive */}
      {filteredProducts.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
            : "space-y-3 md:space-y-4"
        }>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <UnifiedCard>
          <UnifiedCardContent className="p-6 md:p-12 text-center">
            <Package className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">لا توجد منتجات</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              {searchQuery ? "لم يتم العثور على منتجات تطابق البحث" : "لا توجد منتجات متاحة حالياً"}
            </p>
            {config.canAdd && (
              <UnifiedButton onClick={() => setShowAddDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                إضافة منتج جديد
              </UnifiedButton>
            )}
          </UnifiedCardContent>
        </UnifiedCard>
      )}

      {/* Add Product Dialog - Mobile Responsive */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">إضافة منتج جديد</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              املأ البيانات التالية لإضافة منتج جديد
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-6 md:py-8 text-muted-foreground text-sm md:text-base">
            نموذج إضافة المنتج قيد التطوير
          </div>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">تفاصيل المنتج</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              {/* صور المنتج */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {selectedProduct.image_urls && selectedProduct.image_urls.length > 0 ? (
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={selectedProduct.image_urls[0]} 
                        alt={selectedProduct.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* صور إضافية */}
                  {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.image_urls.slice(1, 5).map((url, index) => (
                        <div key={index} className="aspect-square bg-muted rounded-md overflow-hidden">
                          <img src={url} alt={`${selectedProduct.title} ${index + 2}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedProduct.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <UnifiedBadge variant={selectedProduct.is_active ? 'success' : 'secondary'}>
                        {selectedProduct.is_active ? 'نشط' : 'غير نشط'}
                      </UnifiedBadge>
                      {selectedProduct.category && (
                        <UnifiedBadge variant="outline">{selectedProduct.category}</UnifiedBadge>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-3xl font-bold text-primary">
                      {selectedProduct.price_sar} ر.س
                    </span>
                    {config.showCommission && selectedProduct.commission_rate && (
                      <div className="mt-2">
                        <UnifiedBadge variant="outline">
                          عمولة {selectedProduct.commission_rate}%
                        </UnifiedBadge>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      <strong>المخزون:</strong> {selectedProduct.stock} وحدة
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">الوصف</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.description || 'لا يوجد وصف'}
                    </p>
                  </div>

                  {/* عرض المتغيرات بشكل مفصل */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">المتغيرات المتاحة</h4>
                      <ProductVariantDisplay 
                        variants={selectedProduct.variants.flatMap(v => {
                          const result: Array<{type: string; value: string; stock: number}> = [];
                          if (v.color) result.push({ type: 'color', value: v.color, stock: v.stock || 0 });
                          if (v.size) result.push({ type: 'size', value: v.size, stock: v.stock || 0 });
                          return result;
                        })} 
                        compact={false} 
                      />
                      
                      <div className="mt-3 space-y-2">
                        {selectedProduct.variants.map((variant, index) => (
                          <div key={index} className="p-3 bg-muted rounded-md text-sm">
                            <div className="flex justify-between items-center">
                              <div>
                                {variant.color && <span className="font-medium">اللون: {variant.color}</span>}
                                {variant.color && variant.size && <span className="mx-2">•</span>}
                                {variant.size && <span className="font-medium">المقاس: {variant.size}</span>}
                              </div>
                              <div className="text-muted-foreground">
                                المخزون: {variant.stock || 0}
                              </div>
                            </div>
                            {variant.sku && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                SKU: {variant.sku}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-3 border-t">
                    <p>تاريخ الإنشاء: {new Date(selectedProduct.created_at).toLocaleDateString('ar-SA')}</p>
                    <p>آخر تحديث: {new Date(selectedProduct.updated_at).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}