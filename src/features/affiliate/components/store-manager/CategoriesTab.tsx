/**
 * تبويب إدارة الفئات - Categories Tab
 * تنظيم وعرض الفئات بطريقة جذابة
 */

import { Grid, AlignLeft, Star, Heart, Plus, Edit, Trash2, Save } from 'lucide-react';
import {
  UnifiedCard as Card,
  UnifiedCardContent as CardContent,
  UnifiedCardDescription as CardDescription,
  UnifiedCardHeader as CardHeader,
  UnifiedCardTitle as CardTitle
} from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CategoryEditDialog } from '../CategoryEditDialog';
import type { StoreCategory, StoreCategoryBannerProduct } from '@/hooks/useStoreSettings';

interface CategoriesTabProps {
  displayStyle: string;
  onDisplayStyleChange: (style: string) => void;
  categories: StoreCategory[];
  storeProducts: any[];
  loadingProducts: boolean;
  onToggleCategoryStatus: (categoryId: string) => void;
  onCategoryEdit: (category: Partial<StoreCategory>) => void;
  onCategoryAdd: (category: Partial<StoreCategory>) => void;
  onCategoryDelete: (categoryId: string) => void;
  onSave: () => void;
}

export function CategoriesTab({
  displayStyle,
  onDisplayStyleChange,
  categories,
  storeProducts,
  loadingProducts,
  onToggleCategoryStatus,
  onCategoryEdit,
  onCategoryAdd,
  onCategoryDelete,
  onSave
}: CategoriesTabProps) {
  const getDisplayStyleLabel = (style: string) => {
    switch (style) {
      case 'grid': return 'شبكة مع صور';
      case 'horizontal': return 'قائمة أفقية';
      case 'circular': return 'دائرية مميزة';
      default: return 'شبكة مع صور';
    }
  };

  return (
    <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Grid className="h-4 w-4 md:h-5 md:w-5" />
          إدارة الفئات المرئية
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          تنظيم وعرض الفئات بطريقة جذابة للعملاء
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Category Display Style */}
        <div className="space-y-3">
          <Label className="text-sm">طريقة عرض الفئات</Label>
          <p className="text-xs md:text-sm text-muted-foreground mb-3">
            النمط الحالي: {getDisplayStyleLabel(displayStyle)}
          </p>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <Card
              className={`cursor-pointer border-2 hover:border-primary transition-colors ${
                displayStyle === 'grid' ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onDisplayStyleChange('grid')}
            >
              <CardContent className="p-3 md:p-4 text-center">
                <Grid className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2" />
                <p className="text-xs md:text-sm font-medium">شبكة مع صور</p>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer border-2 hover:border-primary transition-colors ${
                displayStyle === 'horizontal' ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onDisplayStyleChange('horizontal')}
            >
              <CardContent className="p-3 md:p-4 text-center">
                <AlignLeft className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2" />
                <p className="text-xs md:text-sm font-medium">قائمة أفقية</p>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer border-2 hover:border-primary transition-colors ${
                displayStyle === 'circular' ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onDisplayStyleChange('circular')}
            >
              <CardContent className="p-3 md:p-4 text-center">
                <Star className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 md:mb-2" />
                <p className="text-xs md:text-sm font-medium">دائرية مميزة</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <Label className="text-sm">الفئات المميزة</Label>
            <CategoryEditDialog
              isNew
              onSave={onCategoryAdd}
              products={storeProducts}
              isLoadingProducts={loadingProducts}
            >
              <Button variant="outline" size="sm" className="w-full md:w-auto">
                <Plus className="h-4 w-4 ml-2" />
                إضافة فئة
              </Button>
            </CategoryEditDialog>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">
            فعل أو ألغ الفئات التي تريد عرضها في متجرك
          </p>
          <div className="space-y-3">
            {categories.length === 0 ? (
              <div className="text-center text-muted-foreground border border-dashed rounded-lg py-6">
                لا توجد فئات مفعلة بعد، قم بإضافة فئات أو فعلها لعرضها في متجرك.
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      category.isActive ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Heart className={`h-5 w-5 ${
                        category.isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        category.isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}>{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.productCount} منتج</p>
                      {category.bannerProducts && category.bannerProducts.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {category.bannerProducts.slice(0, 3).map((product: StoreCategoryBannerProduct) => (
                            <Badge key={product.id} variant="secondary" className="text-xs">
                              {product.title}
                            </Badge>
                          ))}
                          {category.bannerProducts.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{category.bannerProducts.length - 3} منتج
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.isActive}
                      onCheckedChange={() => onToggleCategoryStatus(category.id)}
                    />
                    <CategoryEditDialog
                      category={category}
                      onSave={onCategoryEdit}
                      products={storeProducts}
                      isLoadingProducts={loadingProducts}
                    >
                      <Button variant="outline" size="sm" disabled={!category.isActive}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CategoryEditDialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCategoryDelete(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Button className="w-full md:w-auto" onClick={onSave} size="sm">
          <Save className="h-4 w-4 ml-2" />
          حفظ إعدادات الفئات
        </Button>
      </CardContent>
    </Card>
  );
}
