import { Navigate } from 'react-router-dom';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStoreGamingSettings } from '@/hooks/useStoreGamingSettings';
import { Loader2, Zap, Sparkles, Rocket, Settings, Palette, Cpu } from 'lucide-react';
import type { GamingTheme, PerformanceMode } from '@/contexts/GamingSettingsContext';

const themes: { id: GamingTheme; name: string; emoji: string; preview: string }[] = [
  { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🌆', preview: 'linear-gradient(135deg, #00f0ff, #ff006e)' },
  { id: 'synthwave', name: 'Synthwave', emoji: '🌅', preview: 'linear-gradient(135deg, #ff0099, #9d00ff)' },
  { id: 'matrix', name: 'Matrix', emoji: '🟩', preview: 'linear-gradient(135deg, #00ff00, #00cc00)' },
  { id: 'retro', name: 'Retro', emoji: '🕹️', preview: 'linear-gradient(135deg, #ff00ff, #ffff00)' },
  { id: 'neon-tokyo', name: 'Neon Tokyo', emoji: '🗼', preview: 'linear-gradient(135deg, #ff1744, #e040fb)' },
];

const performanceModes: { id: PerformanceMode; name: string; icon: any; description: string }[] = [
  { id: 'low', name: 'منخفض', icon: Cpu, description: 'للأجهزة الضعيفة - تأثيرات أقل' },
  { id: 'medium', name: 'متوسط', icon: Settings, description: 'متوازن - تأثيرات معتدلة' },
  { id: 'high', name: 'عالي', icon: Zap, description: 'موصى به - تأثيرات كاملة' },
  { id: 'ultra', name: 'فائق', icon: Rocket, description: 'للأجهزة القوية - كل التأثيرات' },
];

export default function GamingSettingsPage() {
  // Get store from the affiliate store hook
  const { store, isLoading: storeLoading } = useAffiliateStore();

  const {
    settings,
    loading,
    saving,
    updateFeature,
    toggleGamingMode,
    changeTheme,
    changePerformanceMode,
    resetToDefaults,
  } = useStoreGamingSettings(store?.id || '');

  if (storeLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return <Navigate to="/affiliate/store/setup" replace />;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            إعدادات Gaming Mode
          </h1>
          <p className="text-muted-foreground mt-2">
            تحكم بتجربة Gaming الخيالية لمتجرك
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={settings.enabled ? 'default' : 'secondary'} className="text-sm">
            {settings.enabled ? '🎮 مفعّل' : '⏸️ معطّل'}
          </Badge>
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={saving}
          >
            إعادة تعيين
          </Button>
        </div>
      </div>

      {/* Main Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            تفعيل Gaming Mode
          </CardTitle>
          <CardDescription>
            تفعيل/تعطيل كل ميزات Gaming في متجرك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gaming-mode" className="text-base font-semibold">
                Gaming Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                عند التفعيل، سيظهر متجرك بتصميم gaming خيالي للزوار
              </p>
            </div>
            <Switch
              id="gaming-mode"
              checked={settings.enabled}
              onCheckedChange={toggleGamingMode}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            الثيم
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Cpu className="h-4 w-4 mr-2" />
            الأداء
          </TabsTrigger>
          <TabsTrigger value="visual">
            <Sparkles className="h-4 w-4 mr-2" />
            التأثيرات البصرية
          </TabsTrigger>
          <TabsTrigger value="ultra">
            <Rocket className="h-4 w-4 mr-2" />
            Ultra Effects
          </TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>اختر الثيم</CardTitle>
              <CardDescription>
                اختر التصميم الافتراضي لمتجرك (الزوار يمكنهم تغييره)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => changeTheme(theme.id)}
                    disabled={saving}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${settings.theme === theme.id
                        ? 'border-primary shadow-lg scale-105'
                        : 'border-border hover:border-primary/50'
                      }
                      ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div
                      className="w-full h-24 rounded-md mb-3"
                      style={{ background: theme.preview }}
                    />
                    <div className="text-center">
                      <div className="text-2xl mb-1">{theme.emoji}</div>
                      <div className="font-semibold text-sm">{theme.name}</div>
                    </div>
                    {settings.theme === theme.id && (
                      <Badge className="absolute top-2 right-2">
                        ✓
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>مستوى الأداء</CardTitle>
              <CardDescription>
                اختر مستوى الأداء حسب جمهورك المستهدف
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => changePerformanceMode(mode.id)}
                    disabled={saving}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-right
                      ${settings.performanceMode === mode.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                      }
                      ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {mode.name}
                          {settings.performanceMode === mode.id && (
                            <Badge variant="default" className="text-xs">مفعّل</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {mode.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visual Effects Tab */}
        <TabsContent value="visual">
          <Card>
            <CardHeader>
              <CardTitle>التأثيرات البصرية الأساسية</CardTitle>
              <CardDescription>
                فعّل أو عطّل التأثيرات البصرية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureToggle
                label="Mouse Trail Effect"
                description="تأثير نيون يتبع حركة الماوس"
                checked={settings.features.mouseTrail}
                onChange={(value) => updateFeature('mouseTrail', value)}
                disabled={saving}
              />
              <Separator />
              <FeatureToggle
                label="3D Tilt Effect"
                description="تأثير ميلان ثلاثي الأبعاد على البطاقات"
                checked={settings.features.tilt3D}
                onChange={(value) => updateFeature('tilt3D', value)}
                disabled={saving}
              />
              <Separator />
              <FeatureToggle
                label="Particles"
                description="جزيئات متحركة في الخلفية"
                checked={settings.features.particles}
                onChange={(value) => updateFeature('particles', value)}
                disabled={saving}
              />
              <Separator />
              <FeatureToggle
                label="Scan Lines"
                description="خطوط scan على الشاشة"
                checked={settings.features.scanLines}
                onChange={(value) => updateFeature('scanLines', value)}
                disabled={saving}
              />
              <Separator />
              <FeatureToggle
                label="Grid Background"
                description="شبكة متحركة في الخلفية"
                checked={settings.features.gridBackground}
                onChange={(value) => updateFeature('gridBackground', value)}
                disabled={saving}
              />
              <Separator />
              <FeatureToggle
                label="Glow Effects"
                description="تأثيرات توهج neon"
                checked={settings.features.glowEffects}
                onChange={(value) => updateFeature('glowEffects', value)}
                disabled={saving}
              />

              <Separator className="my-6" />

              {/* Sound Settings */}
              <div className="space-y-4 pt-4">
                <h3 className="font-semibold">إعدادات الصوت</h3>
                <FeatureToggle
                  label="Sound Effects"
                  description="أصوات gaming عند التفاعل"
                  checked={settings.features.soundEffects}
                  onChange={(value) => updateFeature('soundEffects', value)}
                  disabled={saving}
                />
                {settings.features.soundEffects && (
                  <div className="pr-6">
                    <Label>مستوى الصوت: {settings.features.soundVolume}%</Label>
                    <Slider
                      value={[settings.features.soundVolume]}
                      onValueChange={([value]) => updateFeature('soundVolume', value)}
                      max={100}
                      step={10}
                      className="mt-2"
                      disabled={saving}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ultra Effects Tab */}
        <TabsContent value="ultra">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Ultra Sci-Fi Effects
              </CardTitle>
              <CardDescription>
                تأثيرات خيال علمي متقدمة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureToggle
                label="Holographic Cards"
                description="بطاقات منتجات هولوغرافية"
                checked={settings.features.holographic}
                onChange={(value) => updateFeature('holographic', value)}
                disabled={saving}
                badge="WOW"
              />
              <Separator />
              <FeatureToggle
                label="Laser Click Effects"
                description="ليزر يطلع من كل نقرة"
                checked={settings.features.laserClicks}
                onChange={(value) => updateFeature('laserClicks', value)}
                disabled={saving}
                badge="COOL"
              />
              <Separator />
              <FeatureToggle
                label="Nebula Background"
                description="خلفية سديم فضائي مع نجوم"
                checked={settings.features.nebulaBackground}
                onChange={(value) => updateFeature('nebulaBackground', value)}
                disabled={saving}
                badge="EPIC"
              />
              <Separator />
              <FeatureToggle
                label="Portal Transitions"
                description="انتقالات عبر بوابات"
                checked={settings.features.portalTransitions}
                onChange={(value) => updateFeature('portalTransitions', value)}
                disabled={saving}
              />
              <Separator />
              <FeatureToggle
                label="Quantum Glitch"
                description="تأثير glitch كمي (قد يكون مزعج)"
                checked={settings.features.quantumGlitch}
                onChange={(value) => updateFeature('quantumGlitch', value)}
                disabled={saving}
                badge="⚠️"
              />
              <Separator />
              <FeatureToggle
                label="Energy Shield"
                description="درع طاقة على المنتجات"
                checked={settings.features.energyShield}
                onChange={(value) => updateFeature('energyShield', value)}
                disabled={saving}
              />
              <Separator />
              <FeatureToggle
                label="Warp Speed Scroll"
                description="تأثير سرعة الضوء عند السكرول"
                checked={settings.features.warpSpeed}
                onChange={(value) => updateFeature('warpSpeed', value)}
                disabled={saving}
                badge="NEW"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Link */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">معاينة المتجر</h3>
              <p className="text-sm text-muted-foreground">
                شاهد التغييرات مباشرة على متجرك
              </p>
            </div>
            <Button asChild>
              <a href={`/${store.store_slug}`} target="_blank" rel="noopener noreferrer">
                <Sparkles className="h-4 w-4 mr-2" />
                فتح المتجر
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Feature Toggle Component
interface FeatureToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  badge?: string;
}

function FeatureToggle({ label, description, checked, onChange, disabled, badge }: FeatureToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <Label htmlFor={label} className="flex items-center gap-2">
          <span className="font-semibold">{label}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={label}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
