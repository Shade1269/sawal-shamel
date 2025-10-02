import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Palette, Sparkles, Users, Zap } from 'lucide-react';
import { useStoreThemes, StoreTheme } from '@/hooks/useStoreThemes';
import { Skeleton } from '@/components/ui/skeleton';

interface StoreThemeSelectorProps {
  storeId: string;
  onThemeApplied?: (theme: StoreTheme) => void;
}

const ThemeIcon = ({ themeName }: { themeName: string }) => {
  switch (themeName.toLowerCase()) {
    case 'modern minimalist':
      return <Zap className="w-5 h-5" />;
    case 'luxury premium':
      return <Crown className="w-5 h-5" />;
    case 'traditional arabic':
      return <Palette className="w-5 h-5" />;
    case 'colorful vibrant':
      return <Sparkles className="w-5 h-5" />;
    default:
      return <Palette className="w-5 h-5" />;
  }
};

const ThemePreview = ({ theme }: { theme: StoreTheme }) => {
  const { colors } = theme.theme_config;
  
  return (
    <div className="w-full h-24 rounded-lg border overflow-hidden">
      <div className="flex h-full">
        <div 
          className="flex-1 flex items-center justify-center text-xs font-medium"
          style={{ 
            backgroundColor: colors.background,
            color: colors.foreground,
            borderRight: `1px solid ${colors.border}`
          }}
        >
          خلفية
        </div>
        <div 
          className="flex-1 flex items-center justify-center text-xs font-medium text-white"
          style={{ backgroundColor: colors.primary }}
        >
          أساسي
        </div>
        <div 
          className="flex-1 flex items-center justify-center text-xs font-medium text-white"
          style={{ backgroundColor: colors.accent }}
        >
          مميز
        </div>
      </div>
    </div>
  );
};

export const StoreThemeSelector: React.FC<StoreThemeSelectorProps> = ({
  storeId,
  onThemeApplied
}) => {
  const { themes, currentTheme, isLoading, applyTheme } = useStoreThemes(storeId);

  const handleApplyTheme = async (theme: StoreTheme) => {
    const success = await applyTheme(storeId, theme.id);
    if (success) {
      if (onThemeApplied) {
        onThemeApplied(theme);
      }
      // Reload page to apply theme
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  if (isLoading && themes.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">اختر ثيم متجرك</h2>
        <p className="text-muted-foreground">
          اختر التصميم الذي يناسب طبيعة منتجاتك ويجذب عملاءك
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => {
          const isCurrentTheme = currentTheme?.id === theme.id;
          
          return (
            <Card 
              key={theme.id} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                isCurrentTheme ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
            >
              {isCurrentTheme && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <ThemeIcon themeName={theme.name} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{theme.name_ar}</CardTitle>
                      <CardDescription className="text-sm">
                        {theme.description_ar}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {theme.is_premium && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      مميز
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ThemePreview theme={theme} />
                
                <div className="flex flex-wrap gap-2 text-xs">
                  {theme.theme_config.effects?.gradients && (
                    <Badge variant="outline">متدرجات</Badge>
                  )}
                  {theme.theme_config.effects?.shadows && (
                    <Badge variant="outline">ظلال {theme.theme_config.effects.shadows}</Badge>
                  )}
                  {theme.theme_config.effects?.animations && (
                    <Badge variant="outline">حركات {theme.theme_config.effects.animations}</Badge>
                  )}
                </div>

                <Button 
                  onClick={() => handleApplyTheme(theme)}
                  disabled={isLoading || isCurrentTheme}
                  className="w-full"
                  variant={isCurrentTheme ? "secondary" : "default"}
                >
                  {isLoading ? (
                    "جاري التطبيق..."
                  ) : isCurrentTheme ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      مطبق حالياً
                    </>
                  ) : (
                    <>
                      <Palette className="w-4 h-4 mr-2" />
                      تطبيق الثيم
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentTheme && (
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              الثيم المطبق حالياً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <ThemeIcon themeName={currentTheme.name} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{currentTheme.name_ar}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentTheme.description_ar}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};