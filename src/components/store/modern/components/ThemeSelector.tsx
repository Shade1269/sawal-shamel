import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Palette, Heart, Moon, Sparkles, Check } from 'lucide-react';
import { useStoreThemes } from '@/hooks/useStoreThemes';
import { useToast } from '@/hooks/use-toast';

// Import theme configurations
import feminineTheme from '@/themes/feminine/theme.json';
import nightTheme from '@/themes/night/theme.json';
import legendaryTheme from '@/themes/legendary/theme.json';

interface ThemeSelectorProps {
  storeId: string;
  currentTheme?: string;
  onThemeChange?: (themeId: string) => void;
}

interface ExtendedTheme {
  id: string;
  name: string;
  colors: any;
  icon: JSX.Element;
  preview: string;
  description: string;
  isPremium?: boolean;
  requiresLevel?: string;
}

const themes: ExtendedTheme[] = [
  {
    id: "default",
    name: "Default",
    colors: { primary: "#2563eb", bg: "#ffffff" },
    icon: <Palette className="h-5 w-5" />,
    preview: "bg-gradient-primary",
    description: "ثيم كلاسيكي أنيق ومتوازن للاستخدام العام"
  },
  {
    id: "luxury",
    name: "Luxury", 
    colors: { primary: "#d4af37", bg: "#0c0c0c" },
    icon: <Crown className="h-5 w-5" />,
    preview: "bg-gradient-luxury",
    description: "ثيم فاخر بألوان ذهبية للمنتجات الراقية"
  },
  {
    id: "damascus",
    name: "Damascus",
    colors: { primary: "#d4af37", bg: "#0a1016" },
    icon: <Sparkles className="h-5 w-5" />,
    preview: "bg-gradient-persian",
    description: "ثيم دمشقي تراثي بلمسة عصرية"
  },
  {
    ...feminineTheme,
    icon: <Heart className="h-5 w-5" />,
    preview: "gradient-feminine-preview",
    description: "ثيم أنثوي ناعم بألوان وردية جذابة"
  },
  {
    ...nightTheme,
    icon: <Moon className="h-5 w-5" />,
    preview: "bg-gradient-premium",
    description: "ثيم ليلي داكن مع إضاءة أرجوانية"
  },
  {
    ...legendaryTheme,
    icon: <Crown className="h-5 w-5 text-warning" />,
    preview: "bg-gradient-premium",
    description: "ثيم أسطوري حصري للمسوقات المتميزات",
    isPremium: true,
    requiresLevel: "gold"
  }
];

export const ThemeSelector = ({ storeId, currentTheme, onThemeChange }: ThemeSelectorProps) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'default');
  const [isApplying, setIsApplying] = useState(false);
  const { applyTheme } = useStoreThemes();
  const { toast } = useToast();

  const handleThemeSelect = async (themeId: string) => {
    if (themeId === selectedTheme) return;
    
    setIsApplying(true);
    
    try {
      const success = await applyTheme(storeId, themeId);
      if (success) {
        setSelectedTheme(themeId);
        onThemeChange?.(themeId);
        toast({
          title: "🎨 تم تطبيق الثيم بنجاح",
          description: "تم تحديث مظهر متجرك بالثيم الجديد"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في تطبيق الثيم",
        description: "حدث خطأ أثناء تطبيق الثيم. حاول مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">اختر ثيم متجرك</h2>
        <p className="text-muted-foreground">
          خصص مظهر متجرك بأحد الثيمات المتاحة لإعطائه طابعاً مميزاً
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {themes.map((theme) => (
          <motion.div key={theme.id} variants={item}>
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                selectedTheme === theme.id 
                  ? 'ring-2 ring-primary shadow-xl' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => !theme.isPremium && handleThemeSelect(theme.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-primary">
                      {theme.icon}
                    </div>
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {theme.isPremium && (
                      <Badge variant="secondary" className="bg-warning/20 text-warning">
                        <Crown className="h-3 w-3 mr-1" />
                        حصري
                      </Badge>
                    )}
                    {selectedTheme === theme.id && (
                      <Badge className="bg-success/20 text-success">
                        <Check className="h-3 w-3 mr-1" />
                        مُطبق
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Theme Preview */}
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <div className={`w-full h-full ${theme.preview}`}>
                    <div className="absolute inset-0 bg-foreground/10"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-card/90 backdrop-blur-sm rounded-md p-2 border border-border">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                              <span className="text-muted-foreground">معاينة المتجر</span>
                            </div>
                            <div className="w-4 h-4 bg-primary/20 rounded"></div>
                          </div>
                          <div className="mt-1 flex gap-1">
                            <div className="flex-1 h-1 bg-muted rounded"></div>
                            <div className="flex-1 h-1 bg-muted rounded"></div>
                            <div className="w-8 h-1 bg-primary/40 rounded"></div>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Theme Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {theme.description}
                </p>

                {/* Theme Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: theme.colors.primary }}
                    ></div>
                    <span>لون أساسي: {theme.colors.primary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Palette className="h-3 w-3" />
                    <span>ثيم {theme.name}</span>
                  </div>
                </div>

                {/* Action Button */}
                {theme.isPremium ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    يتطلب عضوية ذهبية
                  </Button>
                ) : selectedTheme === theme.id ? (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full bg-success hover:bg-success/90"
                    disabled
                  >
                    <Check className="h-4 w-4 mr-2" />
                    مُطبق حالياً
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeSelect(theme.id);
                    }}
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        جاري التطبيق...
                      </>
                    ) : (
                      <>
                        <Palette className="h-4 w-4 mr-2" />
                        تطبيق الثيم
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Theme Info */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">معلومات الثيمات</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• يمكن تغيير الثيم في أي وقت بدون تأثير على منتجاتك</p>
                <p>• الثيمات الحصرية متاحة للعضويات المميزة فقط</p>
                <p>• كل ثيم يحتوي على تصميم فريد وألوان متناسقة</p>
                <p>• تطبيق الثيم فوري ويظهر للعملاء مباشرة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};