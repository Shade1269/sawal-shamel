import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type Breadcrumb = {
  label: string;
  href: string;
};

export interface PageTitleProps {
  actions?: React.ReactNode;
  className?: string;
}

const LABEL_MAP: Record<string, string> = {
  '': 'الرئيسية',
  admin: 'لوحة الإدارة',
  dashboard: 'نظرة عامة',
  inventory: 'المخزون',
  orders: 'الطلبات',
  analytics: 'التحليلات',
  affiliate: 'لوحة المسوق',
  storefront: 'واجهة المتجر',
  home: 'الرئيسية',
  profile: 'الملف الشخصي',
  checkout: 'إتمام الشراء',
  order: 'الطلبات',
  confirmation: 'تأكيد الطلب',
  store: 'المتجر العام',
};

const toTitle = (breadcrumbs: Breadcrumb[]): string => {
  if (breadcrumbs.length === 0) return LABEL_MAP[''] ?? 'الرئيسية';
  return breadcrumbs[breadcrumbs.length - 1]?.label ?? LABEL_MAP[''];
};

const buildBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return [
      {
        label: LABEL_MAP[''] ?? 'الرئيسية',
        href: '/',
      },
    ];
  }

  const crumbs: Breadcrumb[] = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = LABEL_MAP[segment] || segment;

    if (segment === 'store' && segments[index + 1]) {
      crumbs.push({
        label: LABEL_MAP[segment] ?? 'المتجر',
        href: currentPath,
      });
      const slug = segments[index + 1];
      crumbs.push({
        label: slug,
        href: `${currentPath}/${slug}`,
      });
    } else {
      crumbs.push({
        label,
        href: currentPath,
      });
    }
  });

  return crumbs;
};

export const PageTitle: React.FC<PageTitleProps> = React.memo(({ actions, className }) => {
  const location = useLocation();
  const breadcrumbs = React.useMemo(() => buildBreadcrumbs(location.pathname), [location.pathname]);
  const title = React.useMemo(() => toTitle(breadcrumbs), [breadcrumbs]);
  const reduceMotion = usePrefersReducedMotion();

  return (
    <header
      className={cn(
        'mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-l)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/92 px-4 py-4 text-[color:var(--glass-fg)] shadow-[var(--shadow-glass-soft)] backdrop-blur-xl',
        className
      )}
      data-component="page-title"
    >
      <div className="space-y-2">
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
          {breadcrumbs.map((breadcrumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={breadcrumb.href}>
                <Link
                  to={breadcrumb.href}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--glass-bg)]',
                    isLast
                      ? 'bg-[color:var(--glass-bg-strong, var(--surface-2))] text-[color:var(--glass-fg)]'
                      : 'hover:text-[color:var(--glass-fg)]'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  <span>{breadcrumb.label}</span>
                </Link>
                {!isLast && (
                  <ChevronLeft className={cn('h-3 w-3 opacity-70', reduceMotion ? 'transition-none' : 'transition-opacity duration-200')} aria-hidden />
                )}
              </React.Fragment>
            );
          })}
        </nav>
        <h1 className="text-xl font-semibold text-[color:var(--glass-fg)] lg:text-2xl">{title}</h1>
      </div>

      {actions ? <div className="flex-shrink-0">{actions}</div> : null}
    </header>
  );
});

PageTitle.displayName = 'PageTitle';

export default PageTitle;
