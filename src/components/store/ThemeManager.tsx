import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Check, Crown, Sparkles } from 'lucide-react';
import { useStoreThemes, type StoreTheme, type StoreThemeConfig } from '@/hooks/useStoreThemes';
import { cn } from '@/lib/utils';

interface ThemeManagerProps {
  storeId: string;
  onThemeChanged?: (theme: StoreTheme) => void;
}

const ThemePreview = ({ theme, isActive = false }: { theme: StoreTheme; isActive?: boolean }) => {
  const config = theme.theme_config as StoreThemeConfig;
  
  return (
    <div className={cn(
      "relative border-2 rounded-lg p-4 transition-all cursor-pointer",
      isActive 
        ? "border-primary bg-primary/5" 
        : "border-border hover:border-primary/50"
    )}>
      {isActive && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
      )}
      
      {/* معاينة الألوان */}
      <div className="flex gap-2 mb-3">
        <div 
          className="w-6 h-6 rounded-full border-2 border-card shadow-sm"
          style={{ backgroundColor: config?.colors?.primary }}
        />
        <div 
          className="w-6 h-6 rounded-full border-2 border-card shadow-sm"
          style={{ backgroundColor: config?.colors?.secondary }}
        />
        <div 
          className="w-6 h-6 rounded-full border-2 border-card shadow-sm"
          style={{ backgroundColor: config?.colors?.accent }}
        />
      </div>
      
      {/* نموذج مصغر للبطاقة */}
      <div 
        className="mb-3 p-3 rounded border"
        style={{ 
          backgroundColor: config?.colors?.card,
          borderColor: config?.colors?.border,
          borderRadius: config?.layout?.borderRadius 
        }}
      >
        <div 
          className="text-sm font-semibold mb-1"
          style={{ 
            color: config?.colors?.foreground,
            fontFamily: config?.typography?.headingFont?.split(',')[0]
          }}
        >
          {theme.name_ar}
        </div>
        <div 
          className="text-xs opacity-70"
          style={{ color: config?.colors?.foreground }}
        >
          {theme.description_ar}
        </div>
      </div>
      
      {/* الخطوط */}
      <div className="text-xs text-muted-foreground">
        <div>الخط: {config?.typography?.fontFamily?.split(',')[0] || 'افتراضي'}</div>
      </div>
      
      {theme.is_premium && (
        <Badge variant="secondary" className="absolute top-2 right-2">
          <Crown className="h-3 w-3 ml-1" />
          مميز
        </Badge>
      )}
    </div>
  );
};

const ThemeCustomizer = ({ theme, onSave }: { theme: StoreTheme; onSave: (config: any) => void }) => {
  const [customConfig, setCustomConfig] = useState<any>(theme.theme_config || {});
  
  const handleColorChange = (colorKey: string, value: string) => {
    setCustomConfig((prev: any) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5" />
          تخصيص الألوان
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {customConfig?.colors && Object.entries(customConfig.colors).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium capitalize">
                {key === 'primary' ? 'الأساسي' :
                 key === 'secondary' ? 'الثانوي' :
                 key === 'accent' ? 'المميز' :
                 key === 'background' ? 'الخلفية' :
                 key === 'foreground' ? 'النص' :
                 key === 'muted' ? 'الخافت' :
                 key === 'card' ? 'البطاقة' :
                 key === 'border' ? 'الحدود' : key}
              </label>
              <input
                type="color"
                value={value as string}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="w-full h-10 rounded border border-input cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          onClick={() => onSave(customConfig)}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          حفظ التخصيصات
        </Button>
      </div>
    </div>
  );
};

export const ThemeManager = ({ storeId, onThemeChanged }: ThemeManagerProps) => {
  const { themes, currentTheme, isLoading, applyTheme } = useStoreThemes(storeId);
  const [selectedTheme, setSelectedTheme] = useState<StoreTheme | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  const handleApplyTheme = async (theme: StoreTheme, customConfig = {}) => {
    setIsApplying(true);
    try {
      const success = await applyTheme(storeId, theme.id, customConfig);
      if (success) {
        onThemeChanged?.(theme);
        setSelectedTheme(null);
      }
    } finally {
      setIsApplying(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">جاري تحميل الثيمات...</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            إدارة ثيمات المتجر
          </CardTitle>
          <CardDescription>
            اختر الثيم المناسب لمتجرك من بين الثيمات المتاحة
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">تصفح الثيمات</TabsTrigger>
          <TabsTrigger value="customize" disabled={!currentTheme}>
            تخصيص الثيم
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <Card key={theme.id} className="cursor-pointer">
                <CardContent className="p-4">
                  <ThemePreview 
                    theme={theme} 
                    isActive={currentTheme?.id === theme.id}
                  />
                  
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold">{theme.name_ar}</h3>
                    <p className="text-sm text-muted-foreground">
                      {theme.description_ar}
                    </p>
                    
                    <div className="flex gap-2">
                      {currentTheme?.id === theme.id ? (
                        <Button disabled size="sm" className="w-full">
                          <Check className="h-4 w-4 ml-2" />
                          مطبق حالياً
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleApplyTheme(theme)}
                          disabled={isApplying}
                        >
                          {isApplying ? 'جاري التطبيق...' : 'تطبيق الثيم'}
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTheme(theme)}
                      >
                        تخصيص
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="customize">
          {currentTheme ? (
            <Card>
              <CardContent className="p-6">
                <ThemeCustomizer 
                  theme={currentTheme}
                  onSave={(config) => handleApplyTheme(currentTheme, config)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  يجب تطبيق ثيم أولاً قبل التخصيص
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* نافذة التخصيص المنبثقة */}
      {selectedTheme && (
        <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[80vh] overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>تخصيص ثيم: {selectedTheme.name_ar}</CardTitle>
                <CardDescription>
                  قم بتخصيص الثيم حسب احتياجاتك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeCustomizer 
                  theme={selectedTheme}
                  onSave={(config) => {
                    handleApplyTheme(selectedTheme, config);
                    setSelectedTheme(null);
                  }}
                />
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTheme(null)}
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
};