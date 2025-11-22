import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface UploadComponentDialogProps {
  onSubmit: (data: any) => void;
}

/**
 * Dialog لرفع قالب مكون جديد
 * يتيح للمستخدم إدخال تفاصيل المكون ورفع صورة معاينة
 *
 * تم استخراجه من ComponentLibrary.tsx في 2025-11-22
 */
export const UploadComponentDialog: React.FC<UploadComponentDialogProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'products',
    tags: '',
    preview: '',
    code: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.code) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>رفع مكون جديد</DialogTitle>
        <DialogDescription>
          شارك مكونك مع المجتمع
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">اسم المكون *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="مثال: بطاقة منتج حديثة"
            />
          </div>

          <div>
            <Label htmlFor="category">الفئة *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="products">المنتجات</SelectItem>
                <SelectItem value="hero">الأقسام الرئيسية</SelectItem>
                <SelectItem value="layout">التخطيط</SelectItem>
                <SelectItem value="forms">النماذج</SelectItem>
                <SelectItem value="navigation">التنقل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">الوصف *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="وصف مختصر للمكون وما يقوم به"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="tags">العلامات</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="منتج، بطاقة، تجارة إلكترونية (مفصولة بفواصل)"
          />
        </div>

        <div>
          <Label htmlFor="preview">رابط صورة المعاينة</Label>
          <Input
            id="preview"
            value={formData.preview}
            onChange={(e) => setFormData(prev => ({ ...prev, preview: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label htmlFor="code">كود المكون *</Label>
          <Textarea
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="أدخل كود React/JSX للمكون"
            rows={10}
            className="font-mono text-sm"
          />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} className="gap-2">
          <Upload className="h-4 w-4" />
          رفع المكون
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
