import React from 'react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { Button as ThemeButton } from '@/ui/Button';
import { Card as ThemeCard } from '@/ui/Card';
import { Input as ThemeInput } from '@/ui/Input';
import { Badge as ThemeBadge } from '@/ui/Badge';
import { cn } from '@/lib/utils';

interface ThemeSystemPreviewProps {
  className?: string;
  heading?: string;
  description?: string;
  showSwitcher?: boolean;
}

export const ThemeSystemPreview: React.FC<ThemeSystemPreviewProps> = ({
  className,
  heading = 'نظام الثيمات',
  description = 'جرّب العناصر الأساسية لكل ثيم ولاحظ تأثير تغيير الألوان والهوية البصرية.',
  showSwitcher = true,
}) => {
  return (
    <section className={cn('space-y-6', className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{heading}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {showSwitcher ? <ThemeSwitcher /> : null}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <ThemeCard>
          <h3 className="text-base font-semibold mb-3 text-foreground">الأزرار</h3>
          <div className="flex flex-wrap gap-3">
            <ThemeButton size="sm">إجراء سريع</ThemeButton>
            <ThemeButton variant="outline">إجراء ثانوي</ThemeButton>
            <ThemeButton variant="ghost">إجراء خفي</ThemeButton>
          </div>
        </ThemeCard>
        <ThemeCard>
          <h3 className="text-base font-semibold mb-3 text-foreground">حقول الإدخال</h3>
          <ThemeInput placeholder="أدخل بريدك الإلكتروني" />
          <ThemeInput placeholder="تنبيه للتحقق" invalid className="mt-3" />
        </ThemeCard>
        <ThemeCard>
          <h3 className="text-base font-semibold mb-3 text-foreground">الشارات</h3>
          <div className="flex flex-wrap gap-2">
            <ThemeBadge>أساسي</ThemeBadge>
            <ThemeBadge variant="success">نجاح</ThemeBadge>
            <ThemeBadge variant="warning">تحذير</ThemeBadge>
            <ThemeBadge variant="danger">خطر</ThemeBadge>
            <ThemeBadge variant="muted">هادئ</ThemeBadge>
          </div>
        </ThemeCard>
      </div>
    </section>
  );
};

export default ThemeSystemPreview;
