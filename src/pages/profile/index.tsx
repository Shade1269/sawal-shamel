import React from "react";
import {
  Activity,
  Bell,
  Globe,
  Lock,
  MapPin,
  Palette,
  ShieldCheck,
  Smartphone,
  User as UserIcon,
  Pencil,
  RefreshCcw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Badge,
  Button,
  Card,
  Skeleton,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTrigger,
} from "@/ui";
import useUserProfile, { type UserProfileHookValue } from "@/hooks/useUserProfile";
import { THEMES } from "@/themes/registry";
import { PaymentInfoTab } from "@/components/profile/PaymentInfoTab";

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  affiliate: "مسوق",
  marketer: "مسوق",
  customer: "عميل",
  moderator: "مشرف",
};

const languageLabels: Record<string, string> = {
  ar: "العربية",
  en: "الإنجليزية",
};

const SkipLink: React.FC<{ targetId: string; label: string }> = ({ targetId, label }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:right-6 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-[color:var(--glass-border)] focus:bg-[color:var(--glass-bg)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[color:var(--glass-fg)]"
  >
    {label}
  </a>
);

const OverviewSection: React.FC<{ hook: UserProfileHookValue; onOpenNotifications: () => void }> = ({ hook, onOpenNotifications }) => {
  const { profile, isLoading } = hook;
  const roleLabel = roleLabels[profile.role] ?? profile.role;

  return (
    <Card
      variant="glass"
      padding="lg"
      className="flex flex-col gap-6 md:flex-row md:items-center"
      data-section="profile-header"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 shadow-[var(--shadow-glass-soft)]">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
          ) : null}
          <AvatarFallback className="text-lg font-semibold">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          {isLoading ? (
            <Skeleton variant="text" width="12rem" height="1.25rem" />
          ) : (
            <h1
              className="text-xl font-semibold text-[color:var(--glass-fg)]"
              data-testid="profile-name"
            >
              {profile.name}
            </h1>
          )}
          {isLoading ? (
            <Skeleton variant="text" width="14rem" height="1rem" />
          ) : (
            <p
              className="text-sm text-[color:var(--muted-foreground)]"
              data-testid="profile-email"
            >
              {profile.email}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="glass"
              leadingIcon={<UserIcon className="h-3.5 w-3.5" />}
              data-testid="profile-role"
            >
              {roleLabel}
            </Badge>
            {profile.joinedAt ? (
              <Badge
                variant="muted"
                leadingIcon={<ShieldCheck className="h-3.5 w-3.5" />}
                aria-label="تاريخ الانضمام"
              >
                انضم في {new Date(profile.joinedAt).toLocaleDateString("ar-SA")}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 md:items-end">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="glass"
            size="sm"
            leftIcon={<Pencil className="h-4 w-4" />}
            aria-label="تعديل الملف الشخصي"
            onClick={() => {
              console.info("[profile] Edit profile action clicked");
            }}
          >
            تعديل الملف الشخصي
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Bell className="h-4 w-4" />}
            aria-label="انتقال إلى مركز الإشعارات"
            onClick={onOpenNotifications}
          >
            مركز الإشعارات
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-[color:var(--muted-foreground)] md:text-right">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[color:var(--accent)]" />
            <span>المصادقة الثنائية</span>
            <strong className="text-[color:var(--glass-fg)]">
              {hook.security.twoFactorEnabled ? "مفعلة" : "معطلة"}
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[color:var(--accent)]" />
            <span>جلسات نشطة</span>
            <strong className="text-[color:var(--glass-fg)]">
              {hook.security.sessions.filter((session) => session.current).length}
            </strong>
          </div>
        </div>
      </div>
    </Card>
  );
};

const OverviewTab: React.FC<{ hook: UserProfileHookValue }> = ({ hook }) => {
  const { profile } = hook;
  return (
    <div className="grid gap-4 lg:grid-cols-2" data-section="profile-overview">
      <Card variant="glass" padding="lg" className="space-y-4" data-block="profile-contact">
        <div className="flex items-center gap-3">
          <UserIcon className="h-5 w-5 text-[color:var(--accent)]" />
          <div>
            <p className="text-sm text-[color:var(--muted-foreground)]">الاسم الكامل</p>
            <p className="text-base font-semibold text-[color:var(--glass-fg)]">{profile.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-[color:var(--accent)]" />
          <div>
            <p className="text-sm text-[color:var(--muted-foreground)]">البريد الإلكتروني</p>
            <p className="text-base font-semibold text-[color:var(--glass-fg)]">{profile.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-[color:var(--accent)]" />
          <div>
            <p className="text-sm text-[color:var(--muted-foreground)]">آخر جلسة</p>
            <p className="text-base font-semibold text-[color:var(--glass-fg)]">
              {hook.security.sessions[0]?.lastActive ?? "قبل قليل"}
            </p>
          </div>
        </div>
      </Card>
      <Card
        variant="glass"
        padding="lg"
        className="space-y-4"
        data-block="profile-activity"
      >
        <h2 className="text-base font-semibold text-[color:var(--glass-fg)]">نصائح سريعة</h2>
        <ul className="space-y-3 text-sm text-[color:var(--muted-foreground)]">
          <li>حدّث صورتك التعريفية ورسالة المتجر العام لتعزيز الثقة مع الزوار.</li>
          <li>فعّل التنبيهات الفورية للبقاء على اطلاع بالطلبات الجديدة.</li>
          <li>راجع الجلسات الموثوقة بانتظام لضمان أمان حسابك.</li>
        </ul>
      </Card>
    </div>
  );
};

const SecurityTab: React.FC<{ hook: UserProfileHookValue }> = ({ hook }) => {
  const { security, toggleTwoFactor, revokeSession, trustSession } = hook;

  return (
    <Card variant="glass" padding="lg" className="space-y-6" data-section="profile-security">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[color:var(--glass-fg)]">أمان الحساب</h2>
          <p className="text-sm text-[color:var(--muted-foreground)]">
            إدارة المصادقة الثنائية والجلسات النشطة للأجهزة المتصلة بحسابك.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm" htmlFor="profile-2fa-toggle">
          <Lock className="h-4 w-4 text-[color:var(--accent)]" aria-hidden="true" />
          <span>تفعيل المصادقة الثنائية</span>
          <Switch
            id="profile-2fa-toggle"
            checked={security.twoFactorEnabled}
            onCheckedChange={() => toggleTwoFactor()}
            aria-label="تفعيل أو إيقاف المصادقة الثنائية"
          />
        </label>
      </div>

      <div className="space-y-3" data-list="sessions">
        {security.sessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-col gap-3 rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70 p-4 transition-colors focus-within:border-[color:var(--accent)]"
            data-session-id={session.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--glass-bg-strong, var(--surface-2))] text-[color:var(--accent)]">
                  <Smartphone className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[color:var(--glass-fg)]">{session.device}</p>
                  <p className="text-xs text-[color:var(--muted-foreground)]">{session.location}</p>
                </div>
              </div>
              <Badge variant={session.current ? "success" : "muted"}>
                {session.current ? "الجلسة الحالية" : "غير نشطة"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--muted-foreground)]">
              <span>آخر نشاط: {session.lastActive}</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
                  aria-label={`تبديل موثوقية الجلسة ${session.device}`}
                  onClick={() => trustSession(session.id, !session.trusted)}
                >
                  {session.trusted ? "موثوقة" : "وضع علامة موثوقة"}
                </Button>
                {!session.current ? (
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<RefreshCcw className="h-3.5 w-3.5" />}
                    aria-label={`إنهاء جلسة ${session.device}`}
                    onClick={() => revokeSession(session.id)}
                  >
                    إنهاء الجلسة
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius-m)] bg-[color:var(--surface)]/60 p-4 text-xs text-[color:var(--muted-foreground)]">
        نصيحة: فعّل إشعارات البريد عند تسجيل الدخول من جهاز جديد لضمان اكتشاف أي نشاط غير مألوف بسرعة.
      </div>
    </Card>
  );
};

const PreferencesTab: React.FC<{ hook: UserProfileHookValue }> = ({ hook }) => {
  const { preferences, updatePreferences } = hook;
  const themeIds = Object.keys(THEMES);

  return (
    <Card variant="glass" padding="lg" className="space-y-6" data-section="profile-preferences">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2" data-field="theme">
          <label className="text-sm font-medium text-[color:var(--glass-fg)]" htmlFor="profile-theme-select">
            ثيم الواجهة
          </label>
          <p className="text-xs text-[color:var(--muted-foreground)]">
            اختر الثيم العام للتجربة الزجاجية عبر المنصة كاملة.
          </p>
          <Select
            value={preferences.themeId}
            onValueChange={(value) => updatePreferences({ themeId: value })}
          >
            <SelectTrigger id="profile-theme-select" className="w-full">
              <SelectValue placeholder="اختر الثيم" />
            </SelectTrigger>
            <SelectContent>
              {themeIds.map((themeId) => (
                <SelectItem key={themeId} value={themeId} data-theme-option={themeId}>
                  <span className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[color:var(--accent)]" aria-hidden="true" />
                    <span>{THEMES[themeId]?.name ?? themeId}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2" data-field="language">
          <label className="text-sm font-medium text-[color:var(--glass-fg)]" htmlFor="profile-language-select">
            لغة الواجهة
          </label>
          <p className="text-xs text-[color:var(--muted-foreground)]">
            التحويل بين العربية والإنجليزية يحفظ في هذا الجهاز فقط.
          </p>
          <Select
            value={preferences.language}
            onValueChange={(value) => updatePreferences({ language: value as typeof preferences.language })}
          >
            <SelectTrigger id="profile-language-select" className="w-full">
              <SelectValue placeholder="اختر اللغة" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(languageLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-[color:var(--accent)]" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-[color:var(--glass-fg)]">تقليل الحركة</p>
            <p className="text-xs text-[color:var(--muted-foreground)]">
              يحترم تفضيلات النظام ويقلل الانتقالات ثلاثية الأبعاد والرسوم المعقدة.
            </p>
          </div>
        </div>
        <Switch
          checked={preferences.reducedMotion}
          onCheckedChange={(value) => updatePreferences({ reducedMotion: value })}
          aria-label="تفعيل أو إيقاف تأثيرات الحركة"
        />
      </div>
    </Card>
  );
};

const ProfilePageBody: React.FC<{ hook: UserProfileHookValue }> = ({ hook }) => {
  const handleOpenNotifications = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.assign('/notifications');
    }
  }, []);
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 lg:py-8" data-page="profile">
      <SkipLink targetId="profile-main" label="تخطي إلى محتوى الملف الشخصي" />
      <OverviewSection hook={hook} onOpenNotifications={handleOpenNotifications} />
      <Tabs defaultValue="overview" className="space-y-6" data-section="profile-tabs">
        <TabsList aria-label="أقسام الملف الشخصي" className="grid gap-2 md:grid-cols-4">
          <TabsTrigger value="overview" data-tab="overview">
            الملخص
          </TabsTrigger>
          <TabsTrigger value="payment" data-tab="payment">
            بيانات السحب
          </TabsTrigger>
          <TabsTrigger value="security" data-tab="security">
            الأمان
          </TabsTrigger>
          <TabsTrigger value="preferences" data-tab="preferences">
            التفضيلات
          </TabsTrigger>
        </TabsList>
        <TabsPanel id="profile-main" value="overview">
          <OverviewTab hook={hook} />
        </TabsPanel>
        <TabsPanel value="payment">
          <PaymentInfoTab />
        </TabsPanel>
        <TabsPanel value="security">
          <SecurityTab hook={hook} />
        </TabsPanel>
        <TabsPanel value="preferences">
          <PreferencesTab hook={hook} />
        </TabsPanel>
      </Tabs>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const hookValue = useUserProfile();
  return <ProfilePageBody hook={hookValue} />;
};

export { ProfilePageBody };
export default ProfilePage;
