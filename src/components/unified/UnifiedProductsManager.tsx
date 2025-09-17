import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

  merchant: {
    title: "منتجاتي",
    description: "إدارة منتجات متجرك",
    canAdd: true,
    canEdit: true,
    canDelete: true,
    showCommission: false,
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
        key: 'stock',
        label: 'المخزون',
        type: 'range'
      }
    ],
    actions: [
      { label: 'إضافة منتج', icon: Plus, action: 'add', variant: 'default' },
      { label: 'تصدير', icon: Download, action: 'export', variant: 'outline' }
    ]
  }
};

export function UnifiedProductsManager() {
  const { profile } = useFastAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const managerType = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/admin/products') || path.includes('/product-management')) return 'admin';
    if (path.includes('/products-browser')) return 'affiliate';
    if (path.includes('/merchant/products') || path.includes('/products')) return 'merchant';
    
    // تحديد النوع حسب دور المستخدم
    if (profile?.role === 'admin') return 'admin';
    if (profile?.role === 'affiliate') return 'affiliate';
    if (profile?.role === 'merchant') return 'merchant';
    
    return 'merchant'; // افتراضي
  }, [location.pathname, profile?.role]);

  const config = productsConfigs[managerType];
  if (!config) return null;

  // تحميل المنتجات (مؤقت - بيانات وهمية)
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      // محاكاة تحميل البيانات
      setTimeout(() => {
        const mockProducts: Product[] = [
          {
            id: '1',
            title: 'iPhone 15 Pro',
            description: 'أحدث إصدار من آيفون',
            price_sar: 4999,
            category: 'electronics',
            stock: 50,
            image_urls: ['/placeholder.svg'],
            is_active: true,
            commission_rate: 8,
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          },
          {
            id: '2',
            title: 'قميص رجالي كلاسيكي',
            description: 'قميص عالي الجودة',
            price_sar: 299,
            category: 'fashion',
            stock: 100,
            image_urls: ['/placeholder.svg'],
            is_active: true,
            commission_rate: 15,
            created_at: '2024-01-02',
            updated_at: '2024-01-02'
          },
          {
            id: '3',
            title: 'كرسي مكتبي مريح',
            description: 'كرسي بتصميم эргономي',
            price_sar: 899,
            category: 'home',
            stock: 25,
            image_urls: ['/placeholder.svg'],
            is_active: false,
            commission_rate: 12,
            created_at: '2024-01-03',
            updated_at: '2024-01-03'
          }
        ];
        setProducts(mockProducts);
        setLoading(false);
      }, 1000);
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
    if (searchParams.get('action') === 'add' && config.canAdd) {
      setShowAddDialog(true);
    }
  }, [searchParams, config.canAdd]);

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
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
          {product.image_urls?.[0] ? (
            <img 
              src={product.image_urls[0]} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={product.is_active ? 'default' : 'secondary'}>
              {product.is_active ? 'نشط' : 'غير نشط'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold truncate">{product.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {product.price_sar} ر.س
            </span>
            {config.showCommission && product.commission_rate && (
              <Badge variant="outline">
                عمولة {product.commission_rate}%
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>المخزون: {product.stock}</span>
            <span>الفئة: {product.category}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            عرض
          </Button>
          {config.canEdit && (
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              تعديل
            </Button>
          )}
          {managerType === 'affiliate' && (
            <Button size="sm" className="flex-1">
              <Plus className="h-4 w-4 mr-1" />
              إضافة
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">جميع الفئات</option>
              <option value="electronics">إلكترونيات</option>
              <option value="fashion">أزياء</option>
              <option value="home">منزل وحديقة</option>
            </select>

            <div className="flex items-center gap-2">
              {config.viewModes.includes('grid') && (
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              )}
              {config.viewModes.includes('list') && (
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
        }>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "لم يتم العثور على منتجات تطابق البحث" : "لا توجد منتجات متاحة حالياً"}
            </p>
            {config.canAdd && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة منتج جديد
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة منتج جديد</DialogTitle>
            <DialogDescription>
              املأ البيانات التالية لإضافة منتج جديد
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8 text-muted-foreground">
            نموذج إضافة المنتج قيد التطوير
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}