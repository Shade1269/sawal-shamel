import React from 'react';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardContent } from '@/components/ui/enhanced-card';
import { LoadingSpinner, Skeleton, LoadingCard } from '@/components/ui/loading-states';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Sparkles, 
  Zap, 
  Heart, 
  Star, 
  Crown,
  Gem,
  Wand2
} from 'lucide-react';

const DesignSystemDemo: React.FC = () => {
  const { 
    patterns, 
    typography, 
    colors, 
    animations,
    helpers 
  } = useDesignSystem();

  return (
    <div className={patterns.container}>
      <div className="space-y-12 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gem className="h-8 w-8 text-luxury animate-persian-glow" />
            <h1 className={helpers.combineClasses(
              typography.display['2xl'],
              "bg-gradient-luxury bg-clip-text text-transparent"
            )}>
              نظام التصميم الفارسي المطور
            </h1>
          </div>
          <p className={typography.body.lg}>
            Enhanced Persian Luxury Design System v2.0
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="default" className="bg-luxury/10 text-luxury">
              ✨ Persian Heritage
            </Badge>
            <Badge variant="default" className="bg-premium/10 text-premium">
              🎨 Enhanced UI
            </Badge>
            <Badge variant="default" className="bg-persian/10 text-persian">
              🚀 Performance
            </Badge>
          </div>
        </div>

        {/* Enhanced Buttons Section */}
        <EnhancedCard variant="glass" hover="glow" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Enhanced Buttons - الأزرار المطورة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h4 className={typography.heading.h6}>Persian Heritage</h4>
                <div className="space-y-2">
                  <EnhancedButton variant="luxury" leftIcon={<Crown />}>
                    Luxury Button
                  </EnhancedButton>
                  <EnhancedButton variant="premium" rightIcon={<Star />}>
                    Premium Button
                  </EnhancedButton>
                  <EnhancedButton variant="persian" leftIcon={<Gem />}>
                    Persian Button
                  </EnhancedButton>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className={typography.heading.h6}>Interactive States</h4>
                <div className="space-y-2">
                  <EnhancedButton variant="hero" animation="glow">
                    Animated Glow
                  </EnhancedButton>
                  <EnhancedButton variant="glass" animation="float">
                    Floating Effect
                  </EnhancedButton>
                  <EnhancedButton variant="commerce" loading>
                    Loading State
                  </EnhancedButton>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className={typography.heading.h6}>Status Variants</h4>
                <div className="space-y-2">
                  <EnhancedButton variant="success" leftIcon={<Heart />}>
                    Success
                  </EnhancedButton>
                  <EnhancedButton variant="warning" rightIcon={<Zap />}>
                    Warning
                  </EnhancedButton>
                  <EnhancedButton variant="info" leftIcon={<Sparkles />}>
                    Info
                  </EnhancedButton>
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Enhanced Cards Section */}
        <EnhancedCard variant="heritage" hover="persian" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-white">
              <Palette className="h-5 w-5" />
              Enhanced Cards - البطاقات المطورة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <EnhancedCard variant="luxury" hover="lift" size="sm" clickable>
                <div className="text-center text-white">
                  <Crown className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-bold">Luxury</h4>
                  <p className="text-sm opacity-90">Premium Experience</p>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="glass" hover="glow" size="sm" clickable>
                <div className="text-center">
                  <Gem className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-bold">Glass</h4>
                  <p className="text-sm text-muted-foreground">Modern Design</p>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="success" hover="scale" size="sm" clickable>
                <div className="text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-status-online" />
                  <h4 className="font-bold">Success</h4>
                  <p className="text-sm text-muted-foreground">Positive State</p>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="persian" hover="luxury" size="sm" clickable>
                <div className="text-center text-white">
                  <Star className="h-8 w-8 mx-auto mb-2" />
                  <h4 className="font-bold">Persian</h4>
                  <p className="text-sm opacity-90">Heritage Style</p>
                </div>
              </EnhancedCard>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Loading States Section */}
        <EnhancedCard variant="gradient" hover="lift" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent animate-pulse-glow" />
              Loading States - حالات التحميل
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className={typography.heading.h6}>Loading Spinners</h4>
                <div className="flex items-center gap-4">
                  <LoadingSpinner size="sm" variant="default" />
                  <LoadingSpinner size="md" variant="luxury" />
                  <LoadingSpinner size="lg" variant="persian" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={typography.heading.h6}>Skeleton Loading</h4>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={typography.heading.h6}>Loading Cards</h4>
                <LoadingCard lines={2} showAvatar className="scale-75" />
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Typography Section */}
        <EnhancedCard variant="outline" hover="glow" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle>Typography System - نظام الخطوط</EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={typography.heading.h6}>Display Headings</h4>
                  <div className="space-y-2">
                    <h1 className={typography.display.xl}>Display XL</h1>
                    <h2 className={typography.display['2xl']}>Display 2XL</h2>
                  </div>
                </div>
                
                <div>
                  <h4 className={typography.heading.h6}>Body Text</h4>
                  <div className="space-y-2">
                    <p className={typography.body.lg}>Large body text for better readability</p>
                    <p className={typography.body.md}>Medium body text for main content</p>
                    <p className={typography.special.lead}>Lead text for introductions</p>
                  </div>
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Color System */}
        <EnhancedCard variant="filled" hover="lift" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle>Color Palette - لوحة الألوان</EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries({
                Primary: 'bg-primary',
                Luxury: 'bg-luxury',
                Premium: 'bg-premium', 
                Persian: 'bg-persian',
                Turquoise: 'bg-turquoise',
                Success: 'bg-status-online'
              }).map(([name, bg]) => (
                <div key={name} className="text-center">
                  <div className={`${bg} h-16 w-full rounded-lg shadow-soft mb-2`} />
                  <p className="text-sm font-medium">{name}</p>
                </div>
              ))}
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Animation Showcase */}
        <EnhancedCard variant="luxury" hover="persian" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 animate-persian-glow" />
              Animations - الحركات والتأثيرات
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center text-white">
                <div className="bg-white/20 p-4 rounded-lg mb-2 animate-persian-float">
                  <Gem className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm">Persian Float</p>
              </div>
              
              <div className="text-center text-white">
                <div className="bg-white/20 p-4 rounded-lg mb-2 animate-pulse-glow">
                  <Star className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm">Pulse Glow</p>
              </div>
              
              <div className="text-center text-white">
                <div className="bg-white/20 p-4 rounded-lg mb-2 animate-fade-in">
                  <Heart className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm">Fade In</p>
              </div>
              
              <div className="text-center text-white">
                <div className="bg-white/20 p-4 rounded-lg mb-2 animate-bounce-in">
                  <Crown className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-sm">Bounce In</p>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </div>
  );
};

export default DesignSystemDemo;