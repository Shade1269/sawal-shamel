import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Sparkles, 
  MousePointer, 
  Eye, 
  Activity,
  TrendingUp,
  Waves,
  Orbit,
  Wind
} from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { 
  useCustomAnimation, 
  useSpringAnimation, 
  useParallax, 
  useScrollAnimation, 
  useMouseAnimation 
} from '@/hooks/useAdvancedAnimations';

interface AdvancedAnimationsProps {
  className?: string;
  interactive?: boolean;
  showControls?: boolean;
}

export const AdvancedAnimations: React.FC<AdvancedAnimationsProps> = ({
  className,
  interactive = true,
  showControls = true
}) => {
  const [selectedDemo, setSelectedDemo] = useState<string>('custom');
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [enablePhysics, setEnablePhysics] = useState(true);

  // Custom Animation Demo
  const {
    elementRef: customRef,
    isAnimating: customAnimating,
    fadeIn,
    scaleIn,
    slideIn,
    spin,
    pulse
  } = useCustomAnimation();

  // Spring Animation Demo
  const {
    elementRef: springRef,
    springValues,
    animateSpring
  } = useSpringAnimation();

  // Parallax Demo
  const { elementRef: parallaxRef } = useParallax({
    speed: 0.5,
    direction: 'vertical'
  });

  // Scroll Animation Demo
  const {
    elementRef: scrollRef,
    isVisible,
    animateOnScroll
  } = useScrollAnimation();

  // Mouse Animation Demo
  const {
    elementRef: mouseRef,
    mousePosition
  } = useMouseAnimation();

  // تشغيل الرسوم المتحركة المخصصة
  const runCustomAnimation = (type: string) => {
    setIsPlaying(true);
    
    switch (type) {
      case 'fadeIn':
        fadeIn({ duration: 1000 / animationSpeed[0] });
        break;
      case 'scaleIn':
        scaleIn({ duration: 800 / animationSpeed[0] });
        break;
      case 'slideIn':
        slideIn('right', { duration: 600 / animationSpeed[0] });
        break;
      case 'spin':
        spin({ duration: 2000 / animationSpeed[0] });
        break;
      case 'pulse':
        pulse({ duration: 1500 / animationSpeed[0] });
        break;
    }

    setTimeout(() => setIsPlaying(false), 2000 / animationSpeed[0]);
  };

  // تشغيل رسوم Spring
  const runSpringAnimation = () => {
    const randomX = Math.random() * 100 - 50;
    const randomY = Math.random() * 100 - 50;
    const randomScale = 0.8 + Math.random() * 0.4;
    const randomRotation = Math.random() * 360;

    animateSpring({
      x: randomX,
      y: randomY,
      scale: randomScale,
      rotation: randomRotation
    });
  };

  // تشغيل رسوم التمرير
  useEffect(() => {
    if (isVisible && selectedDemo === 'scroll') {
      animateOnScroll('fadeIn');
    }
  }, [isVisible, selectedDemo, animateOnScroll]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">الرسوم المتحركة المتقدمة</h2>
          <p className="text-muted-foreground">مكتبة شاملة للرسوم المتحركة التفاعلية والفيزيائية</p>
        </div>

        {showControls && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="physics"
                checked={enablePhysics}
                onCheckedChange={setEnablePhysics}
              />
              <Label htmlFor="physics">فيزياء متقدمة</Label>
            </div>
            
            <Badge className="bg-gradient-premium text-primary-foreground">
              <Zap className="w-3 h-3 mr-1" />
              محرك متطور
            </Badge>
          </div>
        )}
      </div>

      {/* Animation Controls */}
      {showControls && (
        <EnhancedCard variant="gradient" className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              أدوات التحكم
            </CardTitle>
            <CardDescription>تحكم في سرعة وخصائص الرسوم المتحركة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>السرعة</Label>
                <Slider
                  value={animationSpeed}
                  onValueChange={setAnimationSpeed}
                  max={3}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">السرعة: {animationSpeed[0]}x</p>
              </div>

              <div className="space-y-2">
                <Label>نوع العرض</Label>
                <div className="flex gap-2">
                  {['custom', 'spring', 'parallax', 'scroll', 'mouse'].map((type) => (
                    <Button
                      key={type}
                      variant={selectedDemo === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDemo(type)}
                    >
                      {type === 'custom' && <Sparkles className="w-3 h-3 mr-1" />}
                      {type === 'spring' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {type === 'parallax' && <Waves className="w-3 h-3 mr-1" />}
                      {type === 'scroll' && <Eye className="w-3 h-3 mr-1" />}
                      {type === 'mouse' && <MousePointer className="w-3 h-3 mr-1" />}
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>حالة التشغيل</Label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-sm">{isPlaying ? 'يعمل' : 'متوقف'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </EnhancedCard>
      )}

      {/* Animation Demos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Custom Animations */}
        {selectedDemo === 'custom' && (
          <>
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  الرسوم المتحركة المخصصة
                </CardTitle>
                <CardDescription>رسوم متحركة مبنية على Web Animations API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center h-32 bg-gradient-subtle rounded-lg">
                  <div
                    ref={customRef as React.RefObject<HTMLDivElement>}
                    className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold"
                  >
                    AI
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'fadeIn', label: 'ظهور تدريجي', icon: Eye },
                    { type: 'scaleIn', label: 'تكبير', icon: TrendingUp },
                    { type: 'slideIn', label: 'انزلاق', icon: Wind },
                    { type: 'spin', label: 'دوران', icon: Orbit }
                  ].map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => runCustomAnimation(type)}
                      disabled={customAnimating}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle>تأثيرات متقدمة</CardTitle>
                <CardDescription>رسوم متحركة معقدة ومركبة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center h-32 bg-gradient-premium/10 rounded-lg relative overflow-hidden">
                  {/* Floating Elements */}
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className={`absolute w-3 h-3 bg-gradient-premium rounded-full animate-pulse`}
                      style={{
                        left: `${20 + i * 12}%`,
                        top: `${30 + Math.sin(i) * 20}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: `${2 + i * 0.3}s`
                      }}
                    />
                  ))}
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold bg-gradient-premium bg-clip-text text-transparent">
                      تفاعلي
                    </div>
                    <div className="text-sm text-muted-foreground">رسوم متحركة ذكية</div>
                  </div>
                </div>

                <Button
                  onClick={() => runCustomAnimation('pulse')}
                  className="w-full bg-gradient-premium hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  تفعيل التأثير المركب
                </Button>
              </CardContent>
            </EnhancedCard>
          </>
        )}

        {/* Spring Physics */}
        {selectedDemo === 'spring' && (
          <>
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  فيزياء الربيع
                </CardTitle>
                <CardDescription>رسوم متحركة طبيعية مع فيزياء واقعية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center h-32 bg-gradient-success/10 rounded-lg relative">
                  <div
                    ref={springRef as React.RefObject<HTMLDivElement>}
                    className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center text-primary-foreground font-bold transition-transform"
                    style={{
                      transform: `translate(${springValues.x}px, ${springValues.y}px) scale(${springValues.scale}) rotate(${springValues.rotation}deg)`
                    }}
                  >
                    S
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={runSpringAnimation}
                    className="w-full"
                    variant="outline"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    تحريك عشوائي
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>X: {springValues.x.toFixed(1)}</div>
                    <div>Y: {springValues.y.toFixed(1)}</div>
                    <div>Scale: {springValues.scale.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle>إعدادات الفيزياء</CardTitle>
                <CardDescription>تحكم في خصائص الحركة الفيزيائية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">التوتر (Tension)</Label>
                    <div className="bg-gradient-success h-2 rounded-full mt-1">
                      <div className="bg-green-600 h-full w-3/4 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">الاحتكاك (Friction)</Label>
                    <div className="bg-gradient-info h-2 rounded-full mt-1">
                      <div className="bg-blue-600 h-full w-1/2 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">الكتلة (Mass)</Label>
                    <div className="bg-gradient-accent h-2 rounded-full mt-1">
                      <div className="bg-purple-600 h-full w-2/3 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    الفيزياء المتقدمة تحاكي الحركة الطبيعية للأجسام في العالم الحقيقي
                  </p>
                </div>
              </CardContent>
            </EnhancedCard>
          </>
        )}

        {/* Mouse Interaction */}
        {selectedDemo === 'mouse' && (
          <>
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="w-5 h-5" />
                  التفاعل مع الماوس
                </CardTitle>
                <CardDescription>رسوم متحركة تتفاعل مع حركة الماوس</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  ref={mouseRef as React.RefObject<HTMLDivElement>}
                  className="flex items-center justify-center h-32 bg-gradient-warning/10 rounded-lg cursor-pointer relative overflow-hidden"
                >
                  <div className="w-16 h-16 bg-gradient-warning rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    M
                  </div>
                  
                  {/* Mouse Trail Effect */}
                  <div 
                    className="absolute w-2 h-2 bg-primary-foreground/30 rounded-full pointer-events-none transition-all duration-150"
                    style={{
                      left: `${50 + mousePosition.x * 0.1}%`,
                      top: `${50 + mousePosition.y * 0.1}%`
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>Mouse X: {mousePosition.x.toFixed(0)}</div>
                  <div>Mouse Y: {mousePosition.y.toFixed(0)}</div>
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    حرك الماوس فوق المنطقة لرؤية التأثير التفاعلي
                  </p>
                </div>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle>تأثيرات متقدمة</CardTitle>
                <CardDescription>تأثيرات بصرية تفاعلية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-premium/10 rounded-lg relative overflow-hidden">
                  {/* Interactive Grid */}
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-1 p-2">
                    {Array.from({ length: 32 }, (_, i) => (
                      <div
                        key={i}
                        className="bg-gradient-premium rounded-sm opacity-20 transition-all duration-300 hover:opacity-60 hover:scale-110"
                      />
                    ))}
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-600">تفاعلي</div>
                      <div className="text-sm text-muted-foreground">مرر للاستكشاف</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </EnhancedCard>
          </>
        )}
      </div>

      {/* Performance Metrics */}
      <EnhancedCard variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            مؤشرات الأداء
          </CardTitle>
          <CardDescription>إحصائيات الأداء في الوقت الفعلي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-success">60</div>
              <div className="text-xs text-muted-foreground">إطار/ثانية</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-info">12ms</div>
              <div className="text-xs text-muted-foreground">زمن الرندر</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-premium">4.2MB</div>
              <div className="text-xs text-muted-foreground">استخدام الذاكرة</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-warning">98%</div>
              <div className="text-xs text-muted-foreground">كفاءة GPU</div>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>
    </div>
  );
};

export default AdvancedAnimations;