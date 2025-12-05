import React from 'react';
import { Star, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  preview: string;
  code: string;
  props: Record<string, any>;
  rating: number;
  downloads: number;
  created_at: string;
  updated_at: string;
  featured: boolean;
  premium: boolean;
}

interface ComponentPreviewDialogProps {
  component: ComponentTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
  userRole: string;
}

/**
 * Dialog لمعاينة المكون بشكل مباشر
 * يعرض preview live + code + إحصائيات
 *
 * تم استخراجه من ComponentLibrary.tsx في 2025-11-22
 */
export const ComponentPreviewDialog: React.FC<ComponentPreviewDialogProps> = ({
  component,
  isOpen,
  onClose,
  onSelect,
  userRole
}) => {
  const isLocked = component.premium && userRole === 'basic';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {component.name}
              {component.premium && <Badge className="bg-warning text-warning-foreground">Premium</Badge>}
              {component.featured && <Badge className="bg-destructive text-destructive-foreground">مميز</Badge>}
            </DialogTitle>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-warning" />
                <span>{component.rating}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{component.downloads}</span>
              </div>
            </div>
          </div>

          <DialogDescription>{component.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">المعاينة</TabsTrigger>
            <TabsTrigger value="code">الكود</TabsTrigger>
            <TabsTrigger value="info">التفاصيل</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <img
                src={component.preview}
                alt={component.name}
                className="w-full rounded-lg"
              />
            </div>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <div className="border rounded-lg">
              <pre className="p-4 text-sm font-mono bg-muted/50 overflow-x-auto">
                <code>{isLocked ? 'كود المكون متاح للأعضاء المميزين فقط' : component.code}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium">المؤلف</Label>
              <p className="text-sm text-muted-foreground">{component.author.name}</p>
            </div>

            <div>
              <Label className="text-sm font-medium">الفئة</Label>
              <Badge variant="outline" className="mr-2">{component.category}</Badge>
            </div>

            <div>
              <Label className="text-sm font-medium">العلامات</Label>
              <div className="flex gap-2 mt-1">
                {component.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">تاريخ الإنشاء</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(component.created_at).toLocaleDateString('ar-SA')}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">آخر تحديث</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(component.updated_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {isLocked ? (
            <Button disabled className="gap-2">
              <Star className="h-4 w-4" />
              يتطلب عضوية مميزة
            </Button>
          ) : (
            <Button onClick={onSelect} className="gap-2">
              <Download className="h-4 w-4" />
              استخدام المكون
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
