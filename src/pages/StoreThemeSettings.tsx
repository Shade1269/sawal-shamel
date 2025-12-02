import React from 'react';
import { useParams } from 'react-router-dom';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { StoreThemeSelector } from '@/components/store/StoreThemeSelector';
import { Palette, ArrowRight, Info, Sparkles } from 'lucide-react';
import { UnifiedButton } from '@/components/design-system';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import ThemeSystemPreview from '@/components/theme/ThemeSystemPreview';

const StoreThemeSettings: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  if (!storeId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            معرف المتجر مطلوب للوصول لإعدادات الثيمات
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleThemeApplied = () => {
    // يمكن إضافة إجراءات إضافية هنا عند تطبيق الثيم
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <UnifiedButton 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowRight className="w-4 h-4" />}
            >
              رجوع
            </UnifiedButton>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-btn-accent">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                ثيمات المتجر
              </h1>
              <p className="text-muted-foreground mt-1">
                اختر التصميم المناسب لمتجرك من بين الثيمات المتاحة
              </p>
            </div>
          </div>
          
          {/* Advanced Theme Studio Button */}
          <UnifiedButton 
            onClick={() => navigate('/theme-studio')}
            variant="premium"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            الاستوديو المتقدم
          </UnifiedButton>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 bg-gradient-info border-info/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>نصيحة:</strong> يمكنك تغيير ثيم متجرك في أي وقت. سيتم تطبيق التغييرات فوراً على جميع صفحات متجرك.
          </AlertDescription>
        </Alert>

        {/* Theme Selector */}
        <UnifiedCard variant="default" padding="none">
          <UnifiedCardHeader className="gradient-bg-muted border-b p-6">
            <UnifiedCardTitle className="text-xl">الثيمات المتاحة</UnifiedCardTitle>
            <UnifiedCardDescription>
              اختر من بين الثيمات المصممة خصيصاً لأنواع مختلفة من المتاجر
            </UnifiedCardDescription>
          </UnifiedCardHeader>
          <UnifiedCardContent className="p-8">
            <StoreThemeSelector
              storeId={storeId}
              onThemeApplied={handleThemeApplied}
            />
          </UnifiedCardContent>
        </UnifiedCard>

        <ThemeSystemPreview className="mt-8" />

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <UnifiedCard variant="default" padding="md" hover="lift" className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">ألوان متناسقة</h3>
            <p className="text-sm text-muted-foreground">
              نظام ألوان مدروس يناسب طبيعة منتجاتك
            </p>
          </UnifiedCard>

          <UnifiedCard variant="default" padding="md" hover="lift" className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="text-accent text-xl">📱</div>
            </div>
            <h3 className="font-semibold mb-2">تصميم متجاوب</h3>
            <p className="text-sm text-muted-foreground">
              يبدو رائعاً على جميع الأجهزة والشاشات
            </p>
          </UnifiedCard>

          <UnifiedCard variant="default" padding="md" hover="lift" className="text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="text-secondary-foreground text-xl">⚡</div>
            </div>
            <h3 className="font-semibold mb-2">سرعة التحميل</h3>
            <p className="text-sm text-muted-foreground">
              محسن للأداء وسرعة تحميل الصفحات
            </p>
          </UnifiedCard>
        </div>
      </div>
    </div>
  );
};

export default StoreThemeSettings;