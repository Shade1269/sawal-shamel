import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Palette, Sparkles } from 'lucide-react';
import { getAllThemes, type ThemeType, type StoreTheme } from '@/config/storeThemes';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
  currentTheme?: ThemeType;
  onThemeSelect: (themeId: ThemeType) => void;
  isUpdating?: boolean;
}

export const ThemeSelector = ({ currentTheme, onThemeSelect, isUpdating }: ThemeSelectorProps) => {
  const themes = getAllThemes();
  const [hoveredTheme, setHoveredTheme] = useState<ThemeType | null>(null);

  const renderThemePreview = (theme: StoreTheme) => {
    const isSelected = currentTheme === theme.id;
    const isHovered = hoveredTheme === theme.id;
    
    return (
      <Card 
        key={theme.id}
        className={cn(
          "relative overflow-hidden transition-all duration-300 cursor-pointer group",
          isSelected && "ring-2 ring-primary shadow-lg scale-105",
          isHovered && !isSelected && "shadow-xl scale-102"
        )}
        onMouseEnter={() => setHoveredTheme(theme.id)}
        onMouseLeave={() => setHoveredTheme(null)}
        onClick={() => onThemeSelect(theme.id)}
      >
        <CardContent className="p-0">
          {/* Theme Preview Box */}
          <div 
            className="h-48 relative flex items-center justify-center overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, 
                rgb(${theme.colors.background}), 
                rgb(${theme.colors.surface}))`
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute top-4 right-4 w-24 h-24 rounded-full"
                style={{ background: `rgb(${theme.colors.primary})` }}
              />
              <div 
                className="absolute bottom-4 left-4 w-32 h-32 rounded-full"
                style={{ background: `rgb(${theme.colors.secondary})` }}
              />
            </div>

            {/* Theme Name Display */}
            <div className="relative z-10 text-center px-6">
              <div 
                className="text-3xl font-bold mb-2 transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  color: `rgb(${theme.colors.text})`,
                  fontFamily: theme.fonts.heading 
                }}
              >
                {theme.nameAr}
              </div>
              <div 
                className="text-sm"
                style={{ 
                  color: `rgb(${theme.colors.textMuted})`,
                  fontFamily: theme.fonts.body 
                }}
              >
                {theme.descriptionAr}
              </div>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg animate-in zoom-in">
                <Check className="h-5 w-5" />
              </div>
            )}

            {/* Hover Overlay */}
            {isHovered && !isSelected && (
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Button size="lg" className="shadow-xl">
                  <Palette className="h-5 w-5 ml-2" />
                  تطبيق هذا الثيم
                </Button>
              </div>
            )}
          </div>

          {/* Theme Info */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{theme.nameAr}</h3>
              {isSelected && (
                <Badge variant="default" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  مُفعّل
                </Badge>
              )}
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">الألوان:</span>
              <div className="flex gap-1.5">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ background: `rgb(${theme.colors.primary})` }}
                  title="اللون الأساسي"
                />
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ background: `rgb(${theme.colors.secondary})` }}
                  title="اللون الثانوي"
                />
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ background: `rgb(${theme.colors.accent})` }}
                  title="لون التمييز"
                />
              </div>
            </div>

            {/* Theme Features */}
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs">
                {theme.styles.layoutStyle === 'classic' && 'كلاسيكي'}
                {theme.styles.layoutStyle === 'modern' && 'عصري'}
                {theme.styles.layoutStyle === 'minimal' && 'بسيط'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {theme.components.productCard.hoverEffect === 'lift' && 'تأثيرات متقدمة'}
                {theme.components.productCard.hoverEffect === 'zoom' && 'تكبير عند التحويم'}
                {theme.components.productCard.hoverEffect === 'none' && 'بسيط'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">اختيار مظهر المتجر</h2>
          <p className="text-sm text-muted-foreground">
            اختر من بين 4 قوالب احترافية مصممة خصيصاً لمتجرك
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map(theme => renderThemePreview(theme))}
      </div>

      {isUpdating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm">
            <CardContent className="flex flex-col items-center gap-4 p-0">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
              <div className="text-center">
                <h3 className="font-semibold mb-1">جاري تطبيق الثيم...</h3>
                <p className="text-sm text-muted-foreground">
                  الرجاء الانتظار بضع ثوان
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
