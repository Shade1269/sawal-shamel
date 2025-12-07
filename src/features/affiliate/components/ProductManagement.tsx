import { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  price: number;
  commission_rate: number;
  sales_count: number;
  views: number;
  conversion_rate: number;
  is_visible: boolean;
  image_url?: string;
  category: string;
}

interface ProductManagementProps {
  storeId: string;
}

export const ProductManagement = ({ storeId: _storeId }: ProductManagementProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showAddProduct, setShowAddProduct] = useState(false);

  // بيانات وهمية للمنتجات
  const [products] = useState<Product[]>([
    {
      id: '1',
      title: 'فستان أنيق للمناسبات',
      price: 299,
      commission_rate: 15,
      sales_count: 45,
      views: 1250,
      conversion_rate: 3.6,
      is_visible: true,
      category: 'أزياء نسائية'
    },
    {
      id: '2', 
      title: 'حقيبة يد جلدية فاخرة',
      price: 189,
      commission_rate: 12,
      sales_count: 23,
      views: 890,
      conversion_rate: 2.6,
      is_visible: true,
      category: 'حقائب'
    },
    {
      id: '3',
      title: 'حذاء رياضي عصري',
      price: 159,
      commission_rate: 10,
      sales_count: 67,
      views: 2100,
      conversion_rate: 3.2,
      is_visible: false,
      category: 'أحذية'
    }
  ]);

  const categories = ['الكل', 'أزياء نسائية', 'حقائب', 'أحذية', 'إكسسوارات'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const visibleProducts = products.filter(p => p.is_visible).length;
  const totalSales = products.reduce((sum, p) => sum + p.sales_count, 0);
  const avgConversion = products.reduce((sum, p) => sum + p.conversion_rate, 0) / products.length;

  const handleToggleVisibility = (_productId: string) => {
    toast({
      title: "تم التحديث",
      description: "تم تحديث حالة ظهور المنتج بنجاح"
    });
  };

  const handleEditProduct = (_productId: string) => {
    toast({
      title: "قيد التطوير",
      description: "ستتم إضافة وظيفة تعديل المنتج قريباً"
    });
  };

  const handleDeleteProduct = (_productId: string) => {
    toast({
      title: "تم الحذف",
      description: "تم حذف المنتج بنجاح",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">منتجات ظاهرة</p>
                <p className="text-2xl font-bold">{visibleProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                <p className="text-2xl font-bold">{totalSales}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">معدل التحويل</p>
                <p className="text-2xl font-bold">{avgConversion.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              إدارة المنتجات
            </span>
            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة منتج
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>إضافة منتج جديد</DialogTitle>
                  <DialogDescription>
                    أضف منتج جديد لمتجرك لبدء الترويج له
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>رابط المنتج أو ID</Label>
                    <Input placeholder="أدخل رابط المنتج أو معرفه" />
                  </div>
                  <div className="space-y-2">
                    <Label>نسبة العمولة (%)</Label>
                    <Input type="number" placeholder="15" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={() => {
                      setShowAddProduct(false);
                      toast({
                        title: "تم إضافة المنتج",
                        description: "تم إضافة المنتج بنجاح لمتجرك"
                      });
                    }}>
                      إضافة
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-md px-3 py-2 bg-background"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-right p-4 font-medium">المنتج</th>
                    <th className="text-right p-4 font-medium">السعر</th>
                    <th className="text-right p-4 font-medium">العمولة</th>
                    <th className="text-right p-4 font-medium">المبيعات</th>
                    <th className="text-right p-4 font-medium">المشاهدات</th>
                    <th className="text-right p-4 font-medium">التحويل</th>
                    <th className="text-right p-4 font-medium">الحالة</th>
                    <th className="text-right p-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{product.price} ر.س</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{product.commission_rate}%</Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{product.sales_count}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{product.views.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{product.conversion_rate}%</p>
                      </td>
                      <td className="p-4">
                        <Badge variant={product.is_visible ? "default" : "secondary"}>
                          {product.is_visible ? "ظاهر" : "مخفي"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleToggleVisibility(product.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditProduct(product.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد منتجات مطابقة للبحث</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};