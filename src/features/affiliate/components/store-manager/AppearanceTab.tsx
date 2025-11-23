/**
 * تبويب المظهر - Appearance Tab
 * إدارة الثيم والشعار
 */

import { Store, Upload, Save, Image as ImageIcon } from 'lucide-react';
import {
  UnifiedCard as Card,
  UnifiedCardContent as CardContent,
  UnifiedCardDescription as CardDescription,
  UnifiedCardHeader as CardHeader,
  UnifiedCardTitle as CardTitle
} from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { StoreThemeSelector } from '@/components/store/StoreThemeSelector';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { useToast } from '@/hooks/use-toast';
import type { Store as StoreType } from './types';

interface AppearanceTabProps {
  store: StoreType;
  isEditing: boolean;
  onLogoUpload: (file: File) => Promise<void>;
  onSave: () => void;
}

export function AppearanceTab({
  store,
  isEditing,
  onLogoUpload,
  onSave
}: AppearanceTabProps) {
  const { isDarkMode } = useDarkMode();
  const { toast } = useToast();

  return (
    <div className="space-y-4 md:space-y-6">
      <StoreThemeSelector
        storeId={store.id}
        onThemeApplied={(theme) => {
          toast({
            title: "✨ تم تحديث الثيم!",
            description: `تم تطبيق ثيم "${theme.name_ar}" بنجاح على متجرك`
          });
        }}
      />

      <Card className={`rounded-none md:rounded-xl border-x-0 md:border-x transition-colors duration-500 ${
        isDarkMode
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-white/95 border-slate-300/60 shadow-lg'
      }`}>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className={`flex items-center gap-2 text-base md:text-lg transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
            إعدادات إضافية
          </CardTitle>
          <CardDescription className={`text-xs md:text-sm transition-colors duration-500 ${
            isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
          }`}>
            تخصيص الشعار والإعدادات الأخرى
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 md:p-6">
          <div className="space-y-2">
            <Label className={`text-sm font-semibold transition-colors duration-500 ${
              isDarkMode ? 'text-slate-200' : 'text-slate-900'
            }`}>شعار المتجر</Label>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                {store.logo_url ? (
                  <img src={store.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <Store className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <ImageUpload
                onImageSelect={onLogoUpload}
                currentImage={store.logo_url}
                accept="image/*"
                className="w-full md:w-auto"
              >
                <Button variant="outline" disabled={!isEditing} className="w-full md:w-auto" size="sm">
                  <Upload className="h-4 w-4 ml-2" />
                  رفع شعار
                </Button>
              </ImageUpload>
            </div>
          </div>

          {isEditing && (
            <Button onClick={onSave} className="w-full md:w-auto" size="sm">
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
