import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { 
  Settings, 
  Palette, 
  Type, 
  Layout, 
  MousePointer,
  Eye,
  EyeOff
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement?: any;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement
}) => {
  const [properties, setProperties] = React.useState({
    // Layout Properties
    width: '100%',
    height: 'auto',
    margin: 16,
    padding: 24,
    
    // Text Properties
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'right',
    lineHeight: 1.5,
    
    // Color Properties
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#e2e8f0',
    
    // Border Properties
    borderWidth: 1,
    borderRadius: 8,
    
    // Visibility
    isVisible: true,
    opacity: 100,
    
    // Animation
    animationType: 'none',
    animationDuration: 0.3
  });

  if (!selectedElement) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <MousePointer className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">لم يتم تحديد عنصر</h3>
          <p className="text-sm text-muted-foreground">
            اختر عنصراً من الصفحة لتحرير خصائصه
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">خصائص العنصر</h3>
        <p className="text-sm text-muted-foreground mb-4">
          العنصر المحدد: {selectedElement.type}
        </p>
      </div>

      {/* General Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            الخصائص العامة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">العرض</Label>
              <Input
                value={properties.width}
                onChange={(e) => setProperties({...properties, width: e.target.value})}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">الارتفاع</Label>
              <Input
                value={properties.height}
                onChange={(e) => setProperties({...properties, height: e.target.value})}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">الهامش الخارجي</Label>
            <Slider
              value={[properties.margin]}
              onValueChange={(value) => setProperties({...properties, margin: value[0]})}
              max={100}
              step={4}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {properties.margin}px
            </div>
          </div>

          <div>
            <Label className="text-xs">الهامش الداخلي</Label>
            <Slider
              value={[properties.padding]}
              onValueChange={(value) => setProperties({...properties, padding: value[0]})}
              max={100}
              step={4}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {properties.padding}px
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="w-4 h-4" />
            النصوص
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">حجم الخط</Label>
            <Slider
              value={[properties.fontSize]}
              onValueChange={(value) => setProperties({...properties, fontSize: value[0]})}
              min={8}
              max={72}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {properties.fontSize}px
            </div>
          </div>

          <div>
            <Label className="text-xs">وزن الخط</Label>
            <Select value={properties.fontWeight} onValueChange={(value) => setProperties({...properties, fontWeight: value})}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">عادي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="semibold">شبه عريض</SelectItem>
                <SelectItem value="bold">عريض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">محاذاة النص</Label>
            <Select value={properties.textAlign} onValueChange={(value) => setProperties({...properties, textAlign: value})}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="right">يمين</SelectItem>
                <SelectItem value="center">وسط</SelectItem>
                <SelectItem value="left">يسار</SelectItem>
                <SelectItem value="justify">ضبط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="w-4 h-4" />
            الألوان
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">لون الخلفية</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={properties.backgroundColor}
                onChange={(e) => setProperties({...properties, backgroundColor: e.target.value})}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={properties.backgroundColor}
                onChange={(e) => setProperties({...properties, backgroundColor: e.target.value})}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">لون النص</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={properties.textColor}
                onChange={(e) => setProperties({...properties, textColor: e.target.value})}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={properties.textColor}
                onChange={(e) => setProperties({...properties, textColor: e.target.value})}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">لون الحدود</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="color"
                value={properties.borderColor}
                onChange={(e) => setProperties({...properties, borderColor: e.target.value})}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={properties.borderColor}
                onChange={(e) => setProperties({...properties, borderColor: e.target.value})}
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Border & Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Layout className="w-4 h-4" />
            الحدود والتأثيرات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">عرض الحدود</Label>
            <Slider
              value={[properties.borderWidth]}
              onValueChange={(value) => setProperties({...properties, borderWidth: value[0]})}
              max={10}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {properties.borderWidth}px
            </div>
          </div>

          <div>
            <Label className="text-xs">انحناء الزوايا</Label>
            <Slider
              value={[properties.borderRadius]}
              onValueChange={(value) => setProperties({...properties, borderRadius: value[0]})}
              max={50}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {properties.borderRadius}px
            </div>
          </div>

          <div>
            <Label className="text-xs">الشفافية</Label>
            <Slider
              value={[properties.opacity]}
              onValueChange={(value) => setProperties({...properties, opacity: value[0]})}
              max={100}
              step={1}
              className="mt-2"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {properties.opacity}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            {properties.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            الرؤية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label className="text-xs">إظهار العنصر</Label>
            <Switch
              checked={properties.isVisible}
              onCheckedChange={(checked) => setProperties({...properties, isVisible: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Button className="w-full text-xs">
          تطبيق التغييرات
        </Button>
        <Button variant="outline" className="w-full text-xs">
          إعادة تعيين
        </Button>
      </div>
    </div>
  );
};