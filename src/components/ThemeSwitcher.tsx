import React, { useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { THEMES } from '@/themes/registry';
import { cn } from '@/lib/utils';

interface ThemePreviewOption {
  id: string;
  label: string;
  description: string;
  swatch: {
    primary: string;
    accent: string;
    background: string;
  };
}

export function ThemeSwitcher() {
  const { themeId, setThemeId } = useTheme();

  const options = useMemo<ThemePreviewOption[]>(() => {
    return Object.values(THEMES).map((theme) => ({
      id: theme.id,
      label: theme.name,
      description: theme?.meta?.tagline ?? 'معاينة حية للوحة الألوان الزجاجية',
      swatch: {
        primary: theme.colors?.primary ?? '#ffffff',
        accent: theme.colors?.secondary ?? '#c084fc',
        background: theme.colors?.bg ?? '#0f172a',
      },
    }));
  }, []);

  const handleSelect = (id: string) => {
    setThemeId(id);
  };

  return (
    <div className="space-y-[var(--spacing-sm)]" aria-label="تبديل الثيمات">
      <span className="text-sm font-semibold text-[color:var(--fg,#111827)]">اختر الثيم</span>
      <div className="grid gap-[var(--spacing-sm)] sm:grid-cols-3">
        {options.map((option) => {
          const isActive = option.id === themeId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              aria-pressed={isActive}
              aria-label={`تفعيل ثيم ${option.label}`}
              data-theme-option={option.id}
              className={cn(
                'group relative flex h-full flex-col gap-[var(--spacing-sm)] rounded-[var(--radius-md)] border px-[var(--spacing-md)] py-[var(--spacing-sm)] text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--glass-bg,var(--surface))]',
                isActive
                  ? 'border-[color:var(--accent)] bg-[color:var(--glass-bg-strong,var(--surface-2))] shadow-[var(--shadow-glass-strong,0_20px_45px_rgba(15,23,42,0.18))]'
                  : 'border-[color:var(--glass-border,rgba(15,23,42,0.08))] bg-[color:var(--glass-bg,var(--surface))]/70 shadow-[var(--shadow-glass-soft,0_12px_32px_rgba(15,23,42,0.12))] hover:border-[color:var(--accent)]'
              )}
            >
              <div className="flex items-center justify-between gap-[var(--spacing-sm)]">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-[color:var(--fg,#111827)]">{option.label}</span>
                  <span className="text-xs text-[color:var(--muted-foreground,#6b7280)]">{option.description}</span>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--glass-border,rgba(15,23,42,0.08))] bg-[color:var(--glass-bg,var(--surface))]/80">
                  <span
                    className="block h-6 w-6 rounded-full shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${option.swatch.primary}, ${option.swatch.accent})`,
                      boxShadow: '0 0 0 1px rgba(255,255,255,0.35)',
                    }}
                    aria-hidden="true"
                  />
                </span>
              </div>
              <span
                className="relative block h-16 w-full overflow-hidden rounded-[var(--radius-sm)] border border-dashed border-[color:var(--glass-border,rgba(15,23,42,0.08))] bg-[color:var(--glass-bg,var(--surface))]"
                aria-hidden="true"
              >
                <span
                  className="absolute inset-0 block opacity-80"
                  style={{ background: `radial-gradient(circle at top, ${option.swatch.primary}, transparent 60%)` }}
                />
                <span
                  className="absolute inset-0 block opacity-70"
                  style={{ background: `linear-gradient(135deg, transparent, ${option.swatch.background})` }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeSwitcher;
