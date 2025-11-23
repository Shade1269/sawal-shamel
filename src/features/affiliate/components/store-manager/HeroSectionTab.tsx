/**
 * تبويب القسم الرئيسي - Hero Section Tab
 * تخصيص القسم الرئيسي للمتجر بالصور والنصوص
 */

import { Save, Image as ImageIcon } from 'lucide-react';
import {
  UnifiedCard as Card,
  UnifiedCardContent as CardContent,
  UnifiedCardDescription as CardDescription,
  UnifiedCardHeader as CardHeader,
  UnifiedCardTitle as CardTitle
} from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import type { HeroSettings } from './types';

interface HeroSectionTabProps {
  heroSettings: HeroSettings;
  onSettingsChange: (settings: HeroSettings) => void;
  onImageUpload: (file: File) => Promise<void>;
  onSave: () => void;
}

export function HeroSectionTab({
  heroSettings,
  onSettingsChange,
  onImageUpload,
  onSave
}: HeroSectionTabProps) {
  return (
    <Card className="rounded-none md:rounded-xl border-x-0 md:border-x">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
          إعدادات القسم الرئيسي
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          تخصيص القسم الرئيسي لمتجرك بالصور والنصوص الجذابة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Hero Image */}
        <div className="space-y-3">
          <Label className="text-sm">صورة الخلفية الرئيسية</Label>
          <ImageUpload
            onImageSelect={onImageUpload}
            currentImage={heroSettings.hero_image_url}
            accept="image/*"
            className="h-48 md:h-64"
          />
        </div>

        {/* Hero Text */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">العنوان الرئيسي</Label>
            <Input
              value={heroSettings.hero_title}
              onChange={(e) => onSettingsChange({ ...heroSettings, hero_title: e.target.value })}
              placeholder="مرحباً بكم في متجري"
              className="text-right text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">العنوان الفرعي</Label>
            <Input
              value={heroSettings.hero_subtitle}
              onChange={(e) => onSettingsChange({ ...heroSettings, hero_subtitle: e.target.value })}
              placeholder="أفضل المنتجات بأسعار منافسة"
              className="text-right text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">وصف مختصر</Label>
          <Textarea
            value={heroSettings.hero_description}
            onChange={(e) => onSettingsChange({ ...heroSettings, hero_description: e.target.value })}
            placeholder="اكتشف مجموعة رائعة من المنتجات عالية الجودة..."
            className="min-h-20 text-right text-sm"
          />
        </div>

        {/* Call to Action */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">نص زر العمل</Label>
            <Input
              value={heroSettings.hero_cta_text}
              onChange={(e) => onSettingsChange({ ...heroSettings, hero_cta_text: e.target.value })}
              placeholder="تسوق الآن"
              className="text-right text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">لون زر العمل</Label>
            <Select
              value={heroSettings.hero_cta_color}
              onValueChange={(value) => onSettingsChange({ ...heroSettings, hero_cta_color: value })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="اختر اللون" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">اللون الأساسي</SelectItem>
                <SelectItem value="secondary">اللون الثانوي</SelectItem>
                <SelectItem value="accent">لون مميز</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full md:w-auto" onClick={onSave} size="sm">
          <Save className="h-4 w-4 ml-2" />
          حفظ إعدادات القسم الرئيسي
        </Button>
      </CardContent>
    </Card>
  );
}
