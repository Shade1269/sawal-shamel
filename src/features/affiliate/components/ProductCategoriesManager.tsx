import { useState, useEffect } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package, ArrowRight } from 'lucide-react';

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
  slug: string;
  subcategories?: ProductCategory[];
}

interface ProductCategoriesManagerProps {
  storeId: string;
}

export const ProductCategoriesManager = ({ storeId }: ProductCategoriesManagerProps) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parent_id: null as string | null,
    sort_order: 0,
    slug: ''
  });
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      // Mock data since the exact relationship might not exist
      const mockCategories: ProductCategory[] = [];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "خطأ في تحميل الفئات",
        description: "حدث خطأ أثناء تحميل فئات المنتجات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchCategories();
    }
  }, [storeId]);

  const handleSaveCategory = async () => {
    try {
      toast({
        title: "قريباً",
        description: "ميزة إدارة فئات المنتجات ستكون متاحة قريباً",
      });

      setDialogOpen(false);
      setEditingCategory(null);
      setNewCategory({
        name: '',
        description: '',
        parent_id: null,
        sort_order: 0,
        slug: ''
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الفئة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      toast({
        title: "قريباً",
        description: "ميزة حذف الفئات ستكون متاحة قريباً",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الفئة",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: ProductCategory) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      parent_id: category.parent_id,
      sort_order: category.sort_order,
      slug: category.slug
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة فئات المنتجات</h2>
          <p className="text-muted-foreground">تنظيم منتجاتك في فئات لسهولة التصفح</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setNewCategory({
                name: '',
                description: '',
                parent_id: null,
                sort_order: 0,
                slug: ''
              });
            }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الفئة لتنظيم منتجاتك بشكل أفضل
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">اسم الفئة</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: ملابس نسائية"
                />
              </div>
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مختصر للفئة"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="sort_order">ترتيب العرض</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={newCategory.sort_order}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveCategory} className="flex-1">
                  {editingCategory ? 'تحديث' : 'إنشاء'}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">الفئات الرئيسية</TabsTrigger>
          <TabsTrigger value="analytics">تحليلات الفئات</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد فئات بعد</h3>
                <p className="text-muted-foreground mb-4">
                  ابدأ بإنشاء فئات لتنظيم منتجاتك
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة أول فئة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{category.name}</h3>
                          <Badge variant="secondary">
                            {category.product_count} منتج
                          </Badge>
                          {!category.is_active && (
                            <Badge variant="error">غير نشط</Badge>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-muted-foreground mb-3">
                            {category.description}
                          </p>
                        )}
                        {category.subcategories && category.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-sm text-muted-foreground">الفئات الفرعية:</span>
                            {category.subcategories.map((sub) => (
                              <Badge key={sub.id} variant="outline" className="text-xs">
                                {sub.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>إجمالي الفئات</span>
                    <Badge>{categories.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>إجمالي المنتجات</span>
                    <Badge>{categories.reduce((sum, cat) => sum + cat.product_count, 0)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>متوسط المنتجات لكل فئة</span>
                    <Badge>
                      {categories.length > 0 
                        ? Math.round(categories.reduce((sum, cat) => sum + cat.product_count, 0) / categories.length)
                        : 0
                      }
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أكثر الفئات نشاطاً</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories
                    .sort((a, b) => b.product_count - a.product_count)
                    .slice(0, 5)
                    .map((category, index) => (
                      <div key={category.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <Badge variant="secondary">{category.product_count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};