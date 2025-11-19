import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * 🧭 مسار التصفح (Breadcrumbs)
 *
 * يعرض مسار التنقل الحالي للمستخدم
 * يحسن SEO والتجربة العامة
 */

export interface BreadcrumbItem {
  label: string;
  labelEn?: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items, className = '', showHome = true }: BreadcrumbsProps) {
  const { language, direction } = useLanguage();

  const ChevronIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;

  const allItems: BreadcrumbItem[] = showHome
    ? [
        {
          label: 'الرئيسية',
          labelEn: 'Home',
          href: '/',
          icon: Home,
        },
        ...items,
      ]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm overflow-x-auto scrollbar-hide', className)}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const Icon = item.icon;
        const label = language === 'ar' ? item.label : item.labelEn || item.label;

        return (
          <div key={index} className="flex items-center gap-2 flex-shrink-0">
            {/* Item Link */}
            {isLast ? (
              // آخر عنصر - نص عادي
              <span className="flex items-center gap-1.5 text-foreground font-medium">
                {Icon && <Icon className="h-4 w-4" />}
                <span className="truncate max-w-[200px]">{label}</span>
              </span>
            ) : (
              // عنصر قابل للنقر
              <Link
                to={item.href}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="truncate max-w-[150px]">{label}</span>
              </Link>
            )}

            {/* Separator */}
            {!isLast && <ChevronIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * 🎯 مسار تصفح مدمج (Compact Breadcrumbs)
 *
 * نسخة أصغر للاستخدام في الصفحات الضيقة
 */

interface CompactBreadcrumbsProps {
  currentPage: string;
  parentPage?: { label: string; href: string };
  className?: string;
}

export function CompactBreadcrumbs({
  currentPage,
  parentPage,
  className = '',
}: CompactBreadcrumbsProps) {
  const { direction } = useLanguage();
  const ChevronIcon = direction === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)}>
      <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>

      {parentPage && (
        <>
          <ChevronIcon className="h-4 w-4 text-muted-foreground" />
          <Link
            to={parentPage.href}
            className="text-muted-foreground hover:text-foreground transition-colors truncate"
          >
            {parentPage.label}
          </Link>
        </>
      )}

      <ChevronIcon className="h-4 w-4 text-muted-foreground" />
      <span className="text-foreground font-medium truncate">{currentPage}</span>
    </nav>
  );
}
