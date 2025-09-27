import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/ui/Card";
import Input from "@/ui/Input";
import Button from "@/ui/Button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useStorefrontSettings, type StorefrontSettingsOptions } from "@/hooks/useStorefrontSettings";
import { useModernStorefront } from "@/hooks/useModernStorefront";
import { useUserDataContext } from "@/contexts/UserDataContext";
import { cn } from "@/lib/utils";
import ThemeSystemPreview from "@/components/theme/ThemeSystemPreview";
import { Sparkles, Palette, Eye, Settings2 } from "lucide-react";

interface AffiliateStoreSettingsProps {
  slugOverride?: string;
  settingsOverride?: StorefrontSettingsOptions["initialSettings"];
}

const accentOptions = [
  { value: "var(--accent)", label: "لون التوكيد" },
  { value: "var(--primary)", label: "اللون الأساسي" },
  { value: "var(--success)", label: "لون النجاح" },
  { value: "var(--warning)", label: "لون التنبيه" },
];

const AffiliateStoreSettingsPage: React.FC<AffiliateStoreSettingsProps> = ({
  slugOverride,
  settingsOverride,
}) => {
  const { userShop } = useUserDataContext();
  const navigate = useNavigate();
  const slug = slugOverride ?? userShop?.slug ?? "demo-store";

  // Modern storefront integration
  const {
    config,
    isModernMode,
    currentTheme,
    toggleModernMode,
    changeTheme,
    combinedSettings
  } = useModernStorefront(slug);

  const initialSettings = useMemo(
    () => ({
      storeName: ((userShop as any)?.store_name || (userShop as any)?.display_name) ?? "",
      shortDescription: ((userShop as any)?.bio || (userShop as any)?.tagline) ?? "",
      logoUrl: (userShop as any)?.logo_url ?? "",
      accentColor: "var(--accent)",
      useThemeHero: true,
      ...(settingsOverride ?? {}),
    }),
    [settingsOverride, userShop]
  );

  const { settings, updateSettings, resetSettings } = useStorefrontSettings(slug, {
    initialSettings,
  });

  const previewAccent = settings.accentColor || "var(--accent)";

  return (
    <div className="space-y-[var(--spacing-xl)]" data-page="affiliate-store-settings">
      <header className="flex flex-col gap-[var(--spacing-sm)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[color:var(--glass-fg)]">إعدادات المتجر المتقدم</h1>
            <p className="text-sm text-[color:var(--fg-muted)]">
              إدارة شاملة لمتجرك مع الثيمات والميزات المتقدمة
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/affiliate/storefront')}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              معاينة المتجر القديم
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/affiliate/storefront/modern')}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              المتجر المتقدم
            </Button>
          </div>
        </div>
      </header>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="gap-2">
            <Settings2 className="h-4 w-4" />
            الإعدادات الأساسية
          </TabsTrigger>
          <TabsTrigger value="themes" className="gap-2">
            <Palette className="h-4 w-4" />
            الثيمات المتقدمة
          </TabsTrigger>
          <TabsTrigger value="modern" className="gap-2">
            <Sparkles className="h-4 w-4" />
            النظام المتقدم
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            المعاينة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">

      <section className="grid gap-[var(--spacing-xl)] lg:grid-cols-[2fr,1fr]">
        <Card className="space-y-[var(--spacing-lg)] rounded-[var(--radius-xl)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]">
          <div className="grid gap-[var(--spacing-lg)] sm:grid-cols-2">
            <div className="space-y-[var(--spacing-sm)]">
              <Label htmlFor="store-name">اسم المتجر</Label>
              <Input
                id="store-name"
                value={settings.storeName}
                placeholder="متجري الزجاجي"
                onChange={(event) => updateSettings({ storeName: event.target.value })}
              />
            </div>
            <div className="space-y-[var(--spacing-sm)]">
              <Label htmlFor="store-slug">رابط المتجر</Label>
              <Input
                id="store-slug"
                value={`/${slug}`}
                readOnly
                aria-readonly="true"
              />
            </div>
            <div className="space-y-[var(--spacing-sm)]">
              <Label htmlFor="logo-url">رابط الشعار</Label>
              <Input
                id="logo-url"
                value={settings.logoUrl}
                placeholder="https://cdn.example.com/logo.png"
                onChange={(event) => updateSettings({ logoUrl: event.target.value })}
              />
            </div>
            <div className="space-y-[var(--spacing-sm)]">
              <Label>لون التمييز</Label>
              <Select
                value={settings.accentColor}
                onValueChange={(value) => updateSettings({ accentColor: value })}
              >
                <SelectTrigger className="rounded-[var(--radius-lg)] border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80">
                  <SelectValue placeholder="اختر اللون" />
                </SelectTrigger>
                <SelectContent>
                  {accentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-[var(--spacing-sm)]">
            <Label htmlFor="store-description">وصف قصير</Label>
            <Textarea
              id="store-description"
              value={settings.shortDescription}
              placeholder="جملة قصيرة تعرف عن متجرك وتجذب المتسوقين"
              onChange={(event) => updateSettings({ shortDescription: event.target.value })}
              rows={4}
              className="rounded-[var(--radius-lg)] border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/75"
            />
          </div>

          <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 px-[var(--spacing-lg)] py-[var(--spacing-md)]">
            <div>
              <p className="font-medium text-[color:var(--glass-fg)]">تفعيل Hero ثلاثي الأبعاد</p>
              <p className="text-sm text-[color:var(--fg-muted)]">يستخدم Hero ثلاثي الأبعاد الخاص بالثيم الحالي مع احترام تفضيلات الحركة للمستخدم.</p>
            </div>
            <Switch
              checked={settings.useThemeHero}
              onCheckedChange={(checked) => updateSettings({ useThemeHero: checked })}
              aria-label="تفعيل عرض Hero ثلاثي الأبعاد"
            />
          </div>

          <div className="flex flex-wrap gap-[var(--spacing-sm)]">
            <Button type="button" variant="glass" disabled>
              يتم الحفظ تلقائيًا
            </Button>
            <Button type="button" variant="ghost" onClick={() => resetSettings()}>
              إعادة الضبط للقيم الافتراضية
            </Button>
          </div>
        </Card>

        <aside className="space-y-[var(--spacing-md)]">
          <Card className="space-y-[var(--spacing-md)] rounded-[var(--radius-xl)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 p-[var(--spacing-lg)]">
            <div className="flex items-center gap-[var(--spacing-sm)]">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="شعار المتجر"
                  loading="lazy"
                  className="h-12 w-12 rounded-full border border-[color:var(--glass-border)] object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-bg-strong, var(--surface-2))] text-[color:var(--accent)]">
                  {settings.storeName.slice(0, 2) || "مت"}
                </div>
              )}
              <div>
                <p className="text-sm text-[color:var(--fg-muted)]">رابط العرض العام</p>
                <p className="font-medium text-[color:var(--glass-fg)]">{`https://anaqati.com/${slug}`}</p>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70 p-[var(--spacing-lg)]">
              <p className="text-sm text-[color:var(--fg-muted)]">معاينة سريعة</p>
              <div
                className={cn(
                  "mt-[var(--spacing-sm)] rounded-[var(--radius-lg)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/80 p-[var(--spacing-md)] text-[color:var(--glass-fg)]",
                  "shadow-[var(--shadow-glass-soft)]"
                )}
                style={{ accentColor: previewAccent as string }}
              >
                <p className="text-base font-semibold" style={{ color: previewAccent }}>
                  {settings.storeName || "متجري الزجاجي"}
                </p>
                <p className="mt-1 text-sm text-[color:var(--fg-muted)]">
                  {settings.shortDescription || "أضف وصفاً قصيراً ليظهر هنا في الواجهة العامة."}
                </p>
              </div>
            </div>

            <a
              href={`/${slug}`}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-[color:var(--glass-border)]",
                "bg-[color:var(--glass-bg)]/75 px-[var(--spacing-lg)] py-[var(--spacing-sm)] text-sm font-medium text-[color:var(--glass-fg)]",
                "shadow-[var(--shadow-glass-soft)] transition hover:bg-[color:var(--glass-bg-strong, var(--surface-2))]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus-ring)]"
              )}
            >
              افتح المتجر العام
            </a>
          </Card>
        </aside>
      </section>

        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          <Card className="space-y-6 rounded-[var(--radius-xl)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--glass-fg)]">الثيمات المتقدمة</h3>
                <p className="text-sm text-[color:var(--fg-muted)]">اختر من مجموعة الثيمات المميزة</p>
              </div>
              <Badge variant={isModernMode ? "default" : "secondary"}>
                {isModernMode ? "نظام متقدم" : "نظام كلاسيكي"}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { id: 'damascus', name: 'الدمشقي', color: 'from-amber-500 to-orange-600', description: 'تراثي فخم' },
                { id: 'luxury', name: 'الفخامة', color: 'from-purple-500 to-pink-600', description: 'أنيق وراقي' },
                { id: 'feminine', name: 'الأنثوي', color: 'from-pink-400 to-rose-500', description: 'ناعم ورقيق' },
                { id: 'night', name: 'الليلي', color: 'from-gray-800 to-black', description: 'عصري وجذاب' },
                { id: 'legendary', name: 'الأسطوري', color: 'from-indigo-500 to-purple-600', description: 'للمسوقين المتميزين' }
              ].map((theme) => (
                <Card
                  key={theme.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    currentTheme === theme.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => changeTheme(theme.id as any)}
                >
                  <div className={`h-20 rounded-lg bg-gradient-to-r ${theme.color} mb-3`}></div>
                  <h4 className="font-semibold text-[color:var(--glass-fg)]">{theme.name}</h4>
                  <p className="text-sm text-[color:var(--fg-muted)]">{theme.description}</p>
                  {currentTheme === theme.id && (
                    <Badge className="mt-2" size="sm">مُحدد</Badge>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="modern" className="space-y-6">
          <Card className="space-y-6 rounded-[var(--radius-xl)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--glass-fg)]">النظام المتقدم</h3>
                <p className="text-sm text-[color:var(--fg-muted)]">ميزات حديثة ومتطورة لمتجرك</p>
              </div>
              <Switch
                checked={isModernMode}
                onCheckedChange={toggleModernMode}
                aria-label="تفعيل النظام المتقدم"
              />
            </div>

            {isModernMode && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60">
                  <h4 className="font-semibold text-[color:var(--glass-fg)] mb-2">✨ ميزات متقدمة</h4>
                  <ul className="text-sm text-[color:var(--fg-muted)] space-y-1">
                    <li>• سلة تسوق ذكية مع حفظ تلقائي</li>
                    <li>• نظام دفع متعدد الخيارات</li>
                    <li>• تحليلات متقدمة للأداء</li>
                    <li>• تحسين محركات البحث</li>
                    <li>• إشعارات تفاعلية</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60">
                  <h4 className="font-semibold text-[color:var(--glass-fg)] mb-2">🎨 تخصيص متقدم</h4>
                  <ul className="text-sm text-[color:var(--fg-muted)] space-y-1">
                    <li>• 5 ثيمات احترافية</li>
                    <li>• تخصيص الألوان والخطوط</li>
                    <li>• تجربة مستخدم محسنة</li>
                    <li>• تصميم متجاوب بالكامل</li>
                    <li>• انتقالات سلسة ومتحركة</li>
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <ThemeSystemPreview
            className="rounded-[var(--radius-xl)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/85 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateStoreSettingsPage;
