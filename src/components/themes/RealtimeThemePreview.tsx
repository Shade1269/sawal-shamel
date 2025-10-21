import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Eye, 
  User,
  Search,
  Menu,
  Bell,
  Package,
  CreditCard,
  Truck,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';

interface RealtimeThemePreviewProps {
  themeConfig: any;
  isActive?: boolean;
  showControls?: boolean;
  onConfigChange?: (config: any) => void;
}

export const RealtimeThemePreview: React.FC<RealtimeThemePreviewProps> = ({
  themeConfig,
  isActive = false,
  showControls = true,
  onConfigChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'product' | 'cart' | 'checkout'>('home');
  const previewRef = useRef<HTMLDivElement>(null);

  // تطبيق الثيم على المعاينة
  useEffect(() => {
    if (!previewRef.current || !themeConfig) return;

    const preview = previewRef.current;
    const { colors, typography, layout, effects } = themeConfig;

    // تطبيق متغيرات CSS
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        preview.style.setProperty(`--preview-${key}`, value as string);
      });
    }

    if (typography) {
      if (typography.fontFamily) {
        preview.style.setProperty('--preview-font', typography.fontFamily);
      }
      if (typography.fontSize) {
        preview.style.setProperty('--preview-font-size', `${typography.fontSize}px`);
      }
    }

    if (layout) {
      if (layout.borderRadius) {
        preview.style.setProperty('--preview-radius', layout.borderRadius);
      }
      if (layout.spacing) {
        preview.style.setProperty('--preview-spacing', getSpacingValue(layout.spacing));
      }
    }

    if (effects) {
      if (effects.shadows) {
        preview.style.setProperty('--preview-shadow', getShadowValue(effects.shadows));
      }
    }
  }, [themeConfig]);

  // تشغيل العرض التوضيحي
  const startDemo = () => {
    setIsPlaying(true);
    const views: typeof currentView[] = ['home', 'product', 'cart', 'checkout'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % views.length;
      setCurrentView(views[currentIndex]);
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
      setIsPlaying(false);
      setCurrentView('home');
    }, 12000);
  };

  const stopDemo = () => {
    setIsPlaying(false);
    setCurrentView('home');
  };

  const getSpacingValue = (spacing: string): string => {
    const values: Record<string, string> = {
      tight: '0.5rem',
      medium: '1rem',
      comfortable: '1.5rem',
      spacious: '2rem'
    };
    return values[spacing] || '1rem';
  };

  const getShadowValue = (shadow: string): string => {
    const values: Record<string, string> = {
      none: 'none',
      subtle: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      strong: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      elegant: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    };
    return values[shadow] || values.subtle;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isPlaying ? "destructive" : "default"}
              onClick={isPlaying ? stopDemo : startDemo}
              className="gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'إيقاف' : 'عرض توضيحي'}
            </Button>
            <Badge variant="outline" className="ml-2">
              {getCurrentViewName(currentView)}
            </Badge>
          </div>

          <div className="flex gap-1">
            {['home', 'product', 'cart', 'checkout'].map((view) => (
              <Button
                key={view}
                size="sm"
                variant={currentView === view ? "default" : "outline"}
                onClick={() => !isPlaying && setCurrentView(view as any)}
                disabled={isPlaying}
                className="px-2"
              >
                {getViewIcon(view)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Preview Frame */}
      <div 
        ref={previewRef}
        className="preview-frame relative w-full h-[600px] bg-white rounded-lg border-2 border-muted shadow-lg overflow-hidden"
        style={{
          fontFamily: 'var(--preview-font, Inter)',
          fontSize: 'var(--preview-font-size, 14px)',
          '--primary': 'var(--preview-primary, #0066FF)',
          '--secondary': 'var(--preview-secondary, #F0F4F8)',
          '--accent': 'var(--preview-accent, #0052CC)',
          '--background': 'var(--preview-background, #FFFFFF)',
          '--foreground': 'var(--preview-foreground, #1A1D21)',
          '--muted': 'var(--preview-muted, #F8F9FA)',
          '--radius': 'var(--preview-radius, 8px)',
          '--spacing': 'var(--preview-spacing, 1rem)',
          '--shadow': 'var(--preview-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1))'
        } as React.CSSProperties}
      >
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {renderCurrentView()}
        </motion.div>
      </div>
    </div>
  );

  function renderCurrentView() {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'product':
        return <ProductView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      default:
        return <HomeView />;
    }
  }

  function HomeView() {
    return (
      <div className="w-full h-full" style={{ backgroundColor: 'var(--background)' }}>
        {/* Header */}
        <div 
          className="h-16 px-4 flex items-center justify-between border-b"
          style={{ 
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}
        >
          <div className="flex items-center gap-3">
            <Menu className="w-5 h-5" />
            <span className="font-bold text-lg">متجري</span>
          </div>
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5" />
            <Bell className="w-5 h-5" />
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Hero Section */}
        <div 
          className="h-32 flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, var(--primary), var(--accent))`,
            color: 'white'
          }}
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">مرحباً بك في متجرنا</h1>
            <p className="opacity-90">اكتشف أحدث المنتجات والعروض</p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-4 grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i}
              className="border rounded-lg p-3 transition-transform hover:scale-105"
              style={{ 
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)',
                backgroundColor: 'var(--background)',
                borderColor: 'var(--muted)'
              }}
            >
              <div 
                className="h-20 rounded mb-2"
                style={{ backgroundColor: 'var(--muted)' }}
              />
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--foreground)' }}>
                منتج رائع {i + 1}
              </h3>
              <div className="flex items-center justify-between">
                <span className="font-bold" style={{ color: 'var(--primary)' }}>
                  {(99 + i * 50)} ر.س
                </span>
                <div className="flex gap-1">
                  <Heart className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <ShoppingCart className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ProductView() {
    return (
      <div className="w-full h-full" style={{ backgroundColor: 'var(--background)' }}>
        {/* Header */}
        <div 
          className="h-12 px-4 flex items-center gap-3 border-b"
          style={{ 
            backgroundColor: 'var(--background)',
            borderColor: 'var(--muted)',
            color: 'var(--foreground)'
          }}
        >
          <span>← رجوع</span>
          <span className="font-semibold">تفاصيل المنتج</span>
        </div>

        <div className="p-4 space-y-4">
          {/* Product Image */}
          <div 
            className="h-32 rounded-lg"
            style={{ 
              backgroundColor: 'var(--muted)',
              borderRadius: 'var(--radius)'
            }}
          />

          {/* Product Info */}
          <div className="space-y-3">
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              منتج مميز جداً
            </h1>
            
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4 fill-current" 
                    style={{ color: i < 4 ? '#FFD700' : 'var(--muted)' }}
                  />
                ))}
              </div>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                (124 تقييم)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                299 ر.س
              </span>
              <Badge 
                className="px-2 py-1 text-xs"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'white'
                }}
              >
                متوفر
              </Badge>
            </div>

            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              وصف مفصل للمنتج وخصائصه المميزة التي تجعله الخيار الأمثل لك.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              className="flex-1 gap-2"
              style={{ 
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: 'var(--radius)'
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              أضف للسلة
            </Button>
            <Button 
              variant="outline"
              style={{ 
                borderColor: 'var(--muted)',
                borderRadius: 'var(--radius)'
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function CartView() {
    return (
      <div className="w-full h-full" style={{ backgroundColor: 'var(--background)' }}>
        {/* Header */}
        <div 
          className="h-12 px-4 flex items-center justify-between border-b"
          style={{ 
            backgroundColor: 'var(--background)',
            borderColor: 'var(--muted)',
            color: 'var(--foreground)'
          }}
        >
          <span className="font-semibold">سلة التسوق (3)</span>
          <ShoppingCart className="w-5 h-5" />
        </div>

        <div className="p-4 space-y-4">
          {/* Cart Items */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className="flex gap-3 p-3 border rounded-lg"
              style={{ 
                borderColor: 'var(--muted)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow)'
              }}
            >
              <div 
                className="w-16 h-16 rounded"
                style={{ backgroundColor: 'var(--muted)' }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                  منتج {i + 1}
                </h3>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  وصف مختصر
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold" style={{ color: 'var(--primary)' }}>
                    {(99 + i * 30)} ر.س
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span>الكمية: {i + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Separator />

          {/* Total */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span>387 ر.س</span>
            </div>
            <div className="flex justify-between">
              <span>الشحن:</span>
              <span>25 ر.س</span>
            </div>
            <div className="flex justify-between font-bold text-lg" style={{ color: 'var(--primary)' }}>
              <span>الإجمالي:</span>
              <span>412 ر.س</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button 
            className="w-full gap-2"
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius)'
            }}
          >
            <CreditCard className="w-4 h-4" />
            إتمام الطلب
          </Button>
        </div>
      </div>
    );
  }

  function CheckoutView() {
    return (
      <div className="w-full h-full" style={{ backgroundColor: 'var(--background)' }}>
        {/* Header */}
        <div 
          className="h-12 px-4 flex items-center gap-3 border-b"
          style={{ 
            backgroundColor: 'var(--background)',
            borderColor: 'var(--muted)',
            color: 'var(--foreground)'
          }}
        >
          <span>← رجوع</span>
          <span className="font-semibold">إتمام الطلب</span>
        </div>

        <div className="p-4 space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {['العنوان', 'الدفع', 'التأكيد'].map((step, i) => (
              <div key={step} className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ 
                    backgroundColor: i <= 1 ? 'var(--primary)' : 'var(--muted)',
                    color: i <= 1 ? 'white' : 'var(--foreground)'
                  }}
                >
                  {i < 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="mr-2 text-xs">{step}</span>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--muted)',
              borderColor: 'var(--muted)',
              borderRadius: 'var(--radius)'
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              ملخص الطلب
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>3 منتجات</span>
                <span>387 ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>الشحن</span>
                <span>25 ر.س</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold" style={{ color: 'var(--primary)' }}>
                <span>الإجمالي</span>
                <span>412 ر.س</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
              طريقة الدفع
            </h3>
            <div 
              className="p-3 border rounded-lg cursor-pointer"
              style={{ 
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius)'
              }}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                <span>الدفع عند الاستلام</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <Button 
            className="w-full gap-2"
            style={{ 
              backgroundColor: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius)'
            }}
          >
            <Package className="w-4 h-4" />
            تأكيد الطلب
          </Button>
        </div>
      </div>
    );
  }
};

// Helper functions
const getCurrentViewName = (view: string): string => {
  const names: Record<string, string> = {
    home: 'الرئيسية',
    product: 'المنتج',
    cart: 'السلة',
    checkout: 'الدفع'
  };
  return names[view] || view;
};

const getViewIcon = (view: string) => {
  const icons: Record<string, React.ReactNode> = {
    home: <Eye className="w-4 h-4" />,
    product: <Package className="w-4 h-4" />,
    cart: <ShoppingCart className="w-4 h-4" />,
    checkout: <CreditCard className="w-4 h-4" />
  };
  return icons[view] || <Eye className="w-4 h-4" />;
};

export default RealtimeThemePreview;