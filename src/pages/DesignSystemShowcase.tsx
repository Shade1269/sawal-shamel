import React, { useState, useEffect } from 'react';
import { UnifiedButton, UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardDescription, UnifiedCardContent } from '@/components/design-system';
import { ThemeSwitcher } from '@/components/theme';
import { Heart, Star, Sparkles, Zap, Shield, Award, Moon, Sun } from 'lucide-react';

/**
 * Design System Showcase Page
 * Interactive demonstration of all unified components with all variants
 */

const DesignSystemShowcase: React.FC = () => {
  const [clickedButton, setClickedButton] = useState<string>('');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleButtonClick = (variant: string) => {
    setClickedButton(variant);
    setTimeout(() => setClickedButton(''), 1000);
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold heading-ar gradient-text-luxury">
                معرض نظام التصميم الموحد
              </h1>
              <p className="text-sm text-muted-foreground mt-1 elegant-text">
                جميع المكونات والأنماط المتاحة في نظام التصميم
              </p>
            </div>
            <div className="flex items-center gap-4">
              <UnifiedButton
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                aria-label={isDark ? 'التبديل للوضع المشمس' : 'التبديل للوضع الليلي'}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-foreground/70" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground/70" />
                )}
              </UnifiedButton>
              <div className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium">
                {isDark ? '🌙 ليلي' : '☀️ مشمس'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Buttons Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold heading-ar mb-2">UnifiedButton - 14 Variants</h2>
            <p className="text-muted-foreground elegant-text">
              جميع أنماط الأزرار المتاحة مع تأثيرات تفاعلية
            </p>
          </div>

          {/* Primary & Special Buttons */}
          <UnifiedCard variant="elegant" padding="lg">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Primary & Special Variants</UnifiedCardTitle>
              <UnifiedCardDescription>الأزرار الرئيسية والخاصة</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <UnifiedButton 
                    variant="primary" 
                    onClick={() => handleButtonClick('primary')}
                    leftIcon={<Star className="h-4 w-4" />}
                    fullWidth
                  >
                    Primary Button
                  </UnifiedButton>
                  {clickedButton === 'primary' && (
                    <p className="text-xs text-center text-primary animate-fade-in">تم النقر! ✓</p>
                  )}
                </div>

                <div className="space-y-3">
                  <UnifiedButton 
                    variant="luxury" 
                    onClick={() => handleButtonClick('luxury')}
                    leftIcon={<Sparkles className="h-4 w-4" />}
                    fullWidth
                  >
                    Luxury Button
                  </UnifiedButton>
                  {clickedButton === 'luxury' && (
                    <p className="text-xs text-center text-primary animate-fade-in">فاخر! ✨</p>
                  )}
                </div>

                <div className="space-y-3">
                  <UnifiedButton 
                    variant="persian" 
                    onClick={() => handleButtonClick('persian')}
                    leftIcon={<Award className="h-4 w-4" />}
                    fullWidth
                  >
                    Persian Button
                  </UnifiedButton>
                  {clickedButton === 'persian' && (
                    <p className="text-xs text-center text-primary animate-fade-in">تراثي! 🏺</p>
                  )}
                </div>

                <div className="space-y-3">
                  <UnifiedButton 
                    variant="premium" 
                    onClick={() => handleButtonClick('premium')}
                    leftIcon={<Shield className="h-4 w-4" />}
                    fullWidth
                  >
                    Premium Button
                  </UnifiedButton>
                  {clickedButton === 'premium' && (
                    <p className="text-xs text-center text-primary animate-fade-in">مميز! 🌟</p>
                  )}
                </div>

                <div className="space-y-3">
                  <UnifiedButton 
                    variant="hero" 
                    onClick={() => handleButtonClick('hero')}
                    leftIcon={<Zap className="h-4 w-4" />}
                    fullWidth
                  >
                    Hero Button
                  </UnifiedButton>
                  {clickedButton === 'hero' && (
                    <p className="text-xs text-center text-primary animate-fade-in">بطولي! ⚡</p>
                  )}
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Status Buttons */}
          <UnifiedCard variant="glass" padding="lg">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Status Variants</UnifiedCardTitle>
              <UnifiedCardDescription>أزرار الحالات</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <UnifiedButton variant="success" fullWidth>
                  Success
                </UnifiedButton>
                <UnifiedButton variant="warning" fullWidth>
                  Warning
                </UnifiedButton>
                <UnifiedButton variant="danger" fullWidth>
                  Danger
                </UnifiedButton>
                <UnifiedButton variant="glass-primary" fullWidth>
                  Glass Primary
                </UnifiedButton>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Neutral Buttons */}
          <UnifiedCard variant="default" padding="lg">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Neutral Variants</UnifiedCardTitle>
              <UnifiedCardDescription>الأزرار المحايدة</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <UnifiedButton variant="secondary" fullWidth>
                  Secondary
                </UnifiedButton>
                <UnifiedButton variant="outline" fullWidth>
                  Outline
                </UnifiedButton>
                <UnifiedButton variant="ghost" fullWidth>
                  Ghost
                </UnifiedButton>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Glass Buttons */}
          <UnifiedCard variant="glass-strong" padding="lg">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Glass Variants</UnifiedCardTitle>
              <UnifiedCardDescription>أزرار الزجاج الشفاف</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UnifiedButton variant="glass" fullWidth>
                  Glass Button
                </UnifiedButton>
                <UnifiedButton variant="glass-primary" fullWidth>
                  Glass Primary
                </UnifiedButton>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Button Sizes & Animations */}
          <UnifiedCard variant="elegant" padding="lg">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Sizes & Animations</UnifiedCardTitle>
              <UnifiedCardDescription>الأحجام والتحريكات</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <UnifiedButton size="sm" variant="primary">Small</UnifiedButton>
                  <UnifiedButton size="md" variant="primary">Medium</UnifiedButton>
                  <UnifiedButton size="lg" variant="primary">Large</UnifiedButton>
                  <UnifiedButton size="icon" variant="primary">
                    <Heart className="h-4 w-4" />
                  </UnifiedButton>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Animations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <UnifiedButton animation="none" variant="secondary">No Animation</UnifiedButton>
                  <UnifiedButton animation="glow" variant="secondary">Glow</UnifiedButton>
                  <UnifiedButton animation="float" variant="secondary">Float</UnifiedButton>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">States</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <UnifiedButton loading loadingText="جاري التحميل..." variant="primary" fullWidth>
                    Loading State
                  </UnifiedButton>
                  <UnifiedButton disabled variant="primary" fullWidth>
                    Disabled State
                  </UnifiedButton>
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold heading-ar mb-2">UnifiedCard - 8 Variants</h2>
            <p className="text-muted-foreground elegant-text">
              جميع أنماط البطاقات المتاحة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default Card */}
            <UnifiedCard variant="default" padding="md">
              <UnifiedCardHeader>
                <UnifiedCardTitle>Default Card</UnifiedCardTitle>
                <UnifiedCardDescription>البطاقة الافتراضية</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <p className="text-sm elegant-text">
                  تصميم بسيط وواضح مع حدود وظل خفيف
                </p>
              </UnifiedCardContent>
            </UnifiedCard>

            {/* Glass Card */}
            <UnifiedCard variant="glass" padding="md">
              <UnifiedCardHeader>
                <UnifiedCardTitle>Glass Card</UnifiedCardTitle>
                <UnifiedCardDescription>بطاقة زجاجية</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <p className="text-sm elegant-text">
                  تأثير زجاجي شفاف مع ضبابية خلفية
                </p>
              </UnifiedCardContent>
            </UnifiedCard>

            {/* Glass Strong Card */}
            <UnifiedCard variant="glass-strong" padding="md">
              <UnifiedCardHeader>
                <UnifiedCardTitle>Glass Strong</UnifiedCardTitle>
                <UnifiedCardDescription>زجاج قوي</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <p className="text-sm elegant-text">
                  زجاج أقوى مع ضبابية أكثر كثافة
                </p>
              </UnifiedCardContent>
            </UnifiedCard>

            {/* Luxury Card */}
            <UnifiedCard variant="luxury" padding="md">
              <UnifiedCardHeader>
                <UnifiedCardTitle>Luxury Card</UnifiedCardTitle>
                <UnifiedCardDescription>بطاقة فاخرة</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <p className="text-sm elegant-text">
                  تدرج ذهبي فاخر مع ظل مميز
                </p>
              </UnifiedCardContent>
            </UnifiedCard>

            {/* Persian Card */}
            <UnifiedCard variant="persian" padding="md">
              <UnifiedCardHeader>
                <UnifiedCardTitle>Persian Card</UnifiedCardTitle>
                <UnifiedCardDescription>بطاقة تراثية</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <p className="text-sm elegant-text">
                  تدرج تراثي بألوان غنية
                </p>
              </UnifiedCardContent>
            </UnifiedCard>

            {/* Premium Card */}
            <UnifiedCard variant="premium" padding="md">
              <UnifiedCardHeader>
                <UnifiedCardTitle>Premium Card</UnifiedCardTitle>
                <UnifiedCardDescription>بطاقة مميزة</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <p className="text-sm elegant-text">
                  تدرج مميز مع تأثيرات احترافية
                </p>
              </UnifiedCardContent>
            </UnifiedCard>

            {/* Elegant Card */}
            <UnifiedCard variant="elegant" padding="md">
              <UnifiedCardHeader>
                <UnifiedCardTitle>Elegant Card</UnifiedCardTitle>
                <UnifiedCardDescription>بطاقة أنيقة</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <p className="text-sm elegant-text">
                  تصميم أنيق مع ضبابية خفيفة
                </p>
              </UnifiedCardContent>
            </UnifiedCard>

            {/* Flat Card */}
            <UnifiedCard variant="flat" padding="md">
              <UnifiedCardHeader>
                <UnifiedCardTitle>Flat Card</UnifiedCardTitle>
                <UnifiedCardDescription>بطاقة مسطحة</UnifiedCardDescription>
              </UnifiedCardHeader>
              <UnifiedCardContent>
                <p className="text-sm elegant-text">
                  تصميم مسطح بدون حدود أو ظلال
                </p>
              </UnifiedCardContent>
            </UnifiedCard>
          </div>

          {/* Interactive Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold heading-ar">Interactive Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UnifiedCard variant="default" hover="lift" clickable padding="md">
                <UnifiedCardHeader>
                  <UnifiedCardTitle>Lift Effect</UnifiedCardTitle>
                </UnifiedCardHeader>
                <UnifiedCardContent>
                  <p className="text-sm elegant-text">حرك الماوس للرفع</p>
                </UnifiedCardContent>
              </UnifiedCard>

              <UnifiedCard variant="glass" hover="glow" clickable padding="md">
                <UnifiedCardHeader>
                  <UnifiedCardTitle>Glow Effect</UnifiedCardTitle>
                </UnifiedCardHeader>
                <UnifiedCardContent>
                  <p className="text-sm elegant-text">حرك الماوس للتوهج</p>
                </UnifiedCardContent>
              </UnifiedCard>

              <UnifiedCard variant="elegant" hover="scale" clickable padding="md">
                <UnifiedCardHeader>
                  <UnifiedCardTitle>Scale Effect</UnifiedCardTitle>
                </UnifiedCardHeader>
                <UnifiedCardContent>
                  <p className="text-sm elegant-text">حرك الماوس للتكبير</p>
                </UnifiedCardContent>
              </UnifiedCard>
            </div>
          </div>
        </section>

        {/* Design Tokens */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold heading-ar mb-2">Design Tokens</h2>
            <p className="text-muted-foreground elegant-text">
              الألوان والتدرجات والظلال والمؤثرات الزجاجية
            </p>
          </div>

          {/* Gradients */}
          <UnifiedCard variant="default" padding="lg">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Gradients</UnifiedCardTitle>
              <UnifiedCardDescription>التدرجات اللونية</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="gradient-luxury h-24 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Luxury</span>
                </div>
                <div className="gradient-persian h-24 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Persian</span>
                </div>
                <div className="gradient-premium h-24 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Premium</span>
                </div>
                <div className="gradient-success h-24 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Success</span>
                </div>
                <div className="gradient-info h-24 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Info</span>
                </div>
                <div className="gradient-sunset h-24 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Sunset</span>
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Glass Effects */}
          <UnifiedCard variant="default" padding="lg">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Glass Effects</UnifiedCardTitle>
              <UnifiedCardDescription>المؤثرات الزجاجية</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted border-2 border-white h-32 rounded-full flex items-center justify-center">
                  <span className="font-bold text-white">Glass Card</span>
                </div>
                <div className="bg-muted border-2 border-white h-32 rounded-full flex items-center justify-center">
                  <span className="font-bold text-white">Glass Card Strong</span>
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>

          {/* Interactive States */}
          <UnifiedCard variant="glass-strong" padding="lg">
            <UnifiedCardHeader>
              <UnifiedCardTitle>Interactive States</UnifiedCardTitle>
              <UnifiedCardDescription>الحالات التفاعلية</UnifiedCardDescription>
            </UnifiedCardHeader>
            <UnifiedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="interactive-lift bg-muted border-2 border-white rounded-full p-8 text-center cursor-pointer shadow-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-bold text-white">Lift</p>
                    <p className="text-xs text-white/70">حرك الماوس</p>
                  </div>
                </div>
                <div className="interactive-glow bg-muted border-2 border-white rounded-full p-8 text-center cursor-pointer shadow-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-bold text-white">Glow</p>
                    <p className="text-xs text-white/70">حرك الماوس</p>
                  </div>
                </div>
                <div className="interactive-scale bg-muted border-2 border-white rounded-full p-8 text-center cursor-pointer shadow-sm">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-bold text-white">Scale</p>
                    <p className="text-xs text-white/70">حرك الماوس</p>
                  </div>
                </div>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold heading-ar mb-2">Typography</h2>
            <p className="text-muted-foreground elegant-text">
              نظام الخطوط والنصوص
            </p>
          </div>

          <UnifiedCard variant="elegant" padding="lg">
            <UnifiedCardContent className="space-y-4">
              <div className="space-y-2">
                <h1 className="heading-ar text-4xl">عنوان رئيسي - Heading AR</h1>
                <p className="elegant-text text-lg">نص أنيق - Elegant Text</p>
                <p className="text-muted-foreground">نص ثانوي - Muted Text</p>
              </div>

              <div className="space-y-2">
                <p className="gradient-text-luxury text-2xl font-bold">Luxury Gradient Text</p>
                <p className="gradient-text-persian text-2xl font-bold">Persian Gradient Text</p>
                <p className="gradient-text-premium text-2xl font-bold">Premium Gradient Text</p>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground elegant-text">
            نظام التصميم الموحد - Unified Design System v1.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DesignSystemShowcase;
