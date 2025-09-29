import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit, Plus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type StoreCategory } from '@/hooks/useStoreSettings';

interface CategoryEditDialogProps {
  category?: StoreCategory;
  isNew?: boolean;
  onSave: (category: Partial<StoreCategory>) => void;
  children?: React.ReactNode;
}

export const CategoryEditDialog = ({ 
  category, 
  isNew = false, 
  onSave, 
  children 
}: CategoryEditDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
    isActive: category?.isActive ?? true,
    productCount: category?.productCount || 0
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive"
      });
      return;
    }

    onSave({
      id: category?.id || Date.now().toString(),
      name: formData.name,
      isActive: formData.isActive,
      productCount: formData.productCount
    });

    setOpen(false);
    toast({
      title: "تم الحفظ",
      description: isNew ? "تم إضافة الفئة بنجاح" : "تم تحديث الفئة بنجاح"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            {isNew ? <Plus className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'إضافة فئة جديدة' : 'تعديل الفئة'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">اسم الفئة</Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="مثال: أزياء نسائية"
              className="text-right"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product-count">عدد المنتجات</Label>
            <Input
              id="product-count"
              type="number"
              value={formData.productCount}
              onChange={(e) => setFormData(prev => ({ ...prev, productCount: parseInt(e.target.value) || 0 }))}
              min="0"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="category-active">فئة نشطة</Label>
            <Switch
              id="category-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            حفظ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};