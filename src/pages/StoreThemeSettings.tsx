import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StoreThemeSelector } from '@/components/store/StoreThemeSelector';
import { Palette, ArrowRight, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

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
    console.log('تم تطبيق الثيم بنجاح');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
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
          <Button 
            onClick={() => navigate('/theme-studio')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            الاستوديو المتقدم
          </Button>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>نصيحة:</strong> يمكنك تغيير ثيم متجرك في أي وقت. سيتم تطبيق التغييرات فوراً على جميع صفحات متجرك.
          </AlertDescription>
        </Alert>

        {/* Theme Selector */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-background border-b">
            <CardTitle className="text-xl">الثيمات المتاحة</CardTitle>
            <CardDescription>
              اختر من بين الثيمات المصممة خصيصاً لأنواع مختلفة من المتاجر
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <StoreThemeSelector 
              storeId={storeId} 
              onThemeApplied={handleThemeApplied}
            />
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">ألوان متناسقة</h3>
            <p className="text-sm text-muted-foreground">
              نظام ألوان مدروس يناسب طبيعة منتجاتك
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="text-accent text-xl">📱</div>
            </div>
            <h3 className="font-semibold mb-2">تصميم متجاوب</h3>
            <p className="text-sm text-muted-foreground">
              يبدو رائعاً على جميع الأجهزة والشاشات
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="text-secondary-foreground text-xl">⚡</div>
            </div>
            <h3 className="font-semibold mb-2">سرعة التحميل</h3>
            <p className="text-sm text-muted-foreground">
              محسن للأداء وسرعة تحميل الصفحات
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StoreThemeSettings;