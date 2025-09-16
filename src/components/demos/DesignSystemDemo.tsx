import React, { useState } from 'react';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { 
  EnhancedButton, 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardTitle, 
  EnhancedCardContent,
  Badge,
  Input,
  Alert,
  AlertDescription,
  EnhancedDialog,
  EnhancedDialogTrigger,
  EnhancedDialogContent,
  EnhancedDialogHeader,
  EnhancedDialogTitle,
  EnhancedDialogDescription,
  EnhancedDialogFooter,
  EnhancedDialogClose,
  ConfirmationDialog,
  EnhancedTooltip,
  QuickTooltip,
  InfoTooltip,
  LoadingSpinner, 
  Skeleton, 
  LoadingCard 
} from '@/components/ui';
import { 
  Palette, 
  Sparkles, 
  Zap, 
  Heart, 
  Star, 
  Crown,
  Gem,
  Wand2,
  Search,
  Mail,
  User,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Eye,
  Download
} from 'lucide-react';

const DesignSystemDemo: React.FC = () => {
  const { 
    patterns, 
    typography, 
    colors, 
    animations,
    helpers 
  } = useDesignSystem();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

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
              نظام التصميم الفارسي المطور v2.0
            </h1>
          </div>
          <p className={typography.body.lg}>
            Enhanced Persian Luxury Design System - Component Library
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="luxury" icon={<Crown className="h-3 w-3" />}>
              ✨ Persian Heritage
            </Badge>
            <Badge variant="premium" animation="glow">
              🎨 Enhanced UI
            </Badge>
            <Badge variant="success" size="lg">
              🚀 Performance
            </Badge>
            <Badge variant="glass" closeable onClose={() => console.log('Badge closed')}>
              Interactive
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

        {/* Enhanced Inputs & Forms Section */}
        <EnhancedCard variant="premium" hover="glow" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-white">
              <Mail className="h-5 w-5" />
              Enhanced Inputs & Forms - النماذج المطورة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
              <div className="space-y-4">
                <h4 className="font-semibold">Input Variants</h4>
                <div className="space-y-3">
                  <Input 
                    placeholder="Default input..." 
                    leftIcon={<Search className="h-4 w-4" />}
                  />
                  <Input 
                    variant="luxury" 
                    placeholder="Luxury input..." 
                    leftIcon={<User className="h-4 w-4" />}
                    size="lg"
                  />
                  <Input 
                    variant="success" 
                    placeholder="Success state..." 
                    rightIcon={<CheckCircle className="h-4 w-4" />}
                  />
                  <Input 
                    variant="error" 
                    placeholder="Error state..." 
                    rightIcon={<AlertTriangle className="h-4 w-4" />}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Enhanced Badges</h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="luxury" size="sm">Luxury</Badge>
                    <Badge variant="premium" size="default">Premium</Badge>
                    <Badge variant="persian" size="lg">Persian</Badge>
                    <Badge variant="glass" animation="float">Glass</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success" icon={<CheckCircle className="h-3 w-3" />}>
                      Success
                    </Badge>
                    <Badge variant="warning" closeable onClose={() => {}}>
                      Closeable
                    </Badge>
                    <Badge variant="gradient" animation="glow">
                      Gradient
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Enhanced Alerts Section */}
        <EnhancedCard variant="glass" hover="lift" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Enhanced Alerts - التنبيهات المطورة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-4">
              <Alert variant="success" animation="fade" closeable onClose={() => {}}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Success!</strong> Your changes have been saved successfully.
                </AlertDescription>
              </Alert>

              <Alert variant="warning" size="lg" animation="bounce">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> This action cannot be undone.
                </AlertDescription>
              </Alert>

              <Alert variant="luxury" animation="glow">
                <Crown className="h-4 w-4" />
                <AlertDescription>
                  <strong>Premium Feature:</strong> You have access to luxury components.
                </AlertDescription>
              </Alert>

              <Alert variant="glass">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Glass effect alert with backdrop blur for modern UI.
                </AlertDescription>
              </Alert>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Enhanced Dialogs & Interactions */}
        <EnhancedCard variant="heritage" hover="persian" size="lg">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5" />
              Enhanced Dialogs & Tooltips - التفاعلات المطورة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Dialog Variants</h4>
                <div className="space-y-3">
                  <EnhancedDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <EnhancedDialogTrigger asChild>
                      <EnhancedButton variant="luxury" leftIcon={<Eye className="h-4 w-4" />}>
                        Open Luxury Dialog
                      </EnhancedButton>
                    </EnhancedDialogTrigger>
                    <EnhancedDialogContent variant="luxury" size="lg">
                      <EnhancedDialogHeader>
                        <EnhancedDialogTitle className="text-white">Luxury Dialog</EnhancedDialogTitle>
                        <EnhancedDialogDescription className="text-white/80">
                          This is a premium dialog with luxury styling and animations.
                        </EnhancedDialogDescription>
                      </EnhancedDialogHeader>
                      <div className="py-4 text-white">
                        <p>Premium content goes here with luxury background and styling.</p>
                      </div>
                      <EnhancedDialogFooter>
                        <EnhancedDialogClose asChild>
                          <EnhancedButton variant="outline">Close</EnhancedButton>
                        </EnhancedDialogClose>
                        <EnhancedButton variant="success">Confirm</EnhancedButton>
                      </EnhancedDialogFooter>
                    </EnhancedDialogContent>
                  </EnhancedDialog>

                  <ConfirmationDialog
                    open={confirmDialogOpen}
                    onOpenChange={setConfirmDialogOpen}
                    title="Confirm Action"
                    description="Are you sure you want to proceed? This action cannot be undone."
                    variant="warning"
                    onConfirm={async () => {
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      console.log('Action confirmed!');
                    }}
                  >
                    <EnhancedButton variant="warning" leftIcon={<AlertTriangle className="h-4 w-4" />}>
                      Show Confirmation
                    </EnhancedButton>
                  </ConfirmationDialog>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-white">Enhanced Tooltips</h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <QuickTooltip text="This is a quick tooltip" variant="luxury">
                      <EnhancedButton variant="glass" size="sm">Hover me</EnhancedButton>
                    </QuickTooltip>

                    <EnhancedTooltip 
                      content="Enhanced tooltip with custom styling" 
                      variant="glass"
                      side="top"
                    >
                      <EnhancedButton variant="outline" size="sm">Glass Tooltip</EnhancedButton>
                    </EnhancedTooltip>

                    <InfoTooltip 
                      title="Persian Heritage"
                      description="This component uses Persian-inspired design patterns with luxury gradients and animations."
                      variant="persian"
                    >
                      <EnhancedButton variant="persian" size="sm" rightIcon={<Info className="h-3 w-3" />}>
                        Info
                      </EnhancedButton>
                    </InfoTooltip>
                  </div>
                </div>
              </div>
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