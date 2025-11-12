import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, TicketPercent, ExternalLink } from 'lucide-react';
import { Button } from '@/ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDarkMode } from '@/shared/components/DarkModeProvider';

interface MarketerQuickActionsProps {
  publicStoreUrl: string;
  storeSlug: string;
}

export const MarketerQuickActions: React.FC<MarketerQuickActionsProps> = ({
  publicStoreUrl,
  storeSlug,
}) => {
  const { isDarkMode } = useDarkMode();

  const quickActions = React.useMemo(
    () => [
      {
        id: 'share-store',
        label: 'زر مشاركة المتجر',
        description: 'انسخ رابط المتجر أو شاركه مباشرة مع عملائك',
        icon: Share2,
        action: () => {
          if (typeof navigator !== 'undefined') {
            if (navigator.share) {
              navigator
                .share({
                  title: 'متجري في منصة أناقتي',
                  text: 'اكتشف تشكيلتي المختارة من الأزياء عبر منصة أناقتي.',
                  url: publicStoreUrl,
                })
                .catch(() => {
                  navigator.clipboard?.writeText(publicStoreUrl).catch(() => undefined);
                  toast.success('تم نسخ رابط المتجر');
                });
              return;
            }

            if (navigator.clipboard?.writeText) {
              void navigator.clipboard.writeText(publicStoreUrl);
              toast.success('تم نسخ رابط المتجر');
              return;
            }
          }
        },
      },
      {
        id: 'create-coupon',
        label: 'كوّن كوبون',
        description: 'أنشئ رمز خصم مخصص لحملة هذا الأسبوع',
        icon: TicketPercent,
        to: '/affiliate/store/settings?tab=coupons',
      },
      {
        id: 'open-public-store',
        label: 'اذهب لمتجري العام',
        description: 'استعرض واجهة المتجر كما يراها العملاء',
        icon: ExternalLink,
        action: () => {
          window.open(`/${storeSlug}`, '_blank');
        },
      },
    ],
    [publicStoreUrl, storeSlug]
  );

  const quickActionLinkClass = `flex items-center justify-between gap-[var(--spacing-md)] rounded-[var(--radius-m)] border px-[var(--spacing-md)] py-[var(--spacing-sm)] text-right transition-all duration-500 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 gradient-hover-accent ${
    isDarkMode 
      ? 'border-border bg-card/80 text-foreground'
      : 'border-border bg-card text-foreground'
  }`;

  return (
    <div className="gradient-card-muted flex h-full flex-col gap-[var(--spacing-md)] rounded-[var(--radius-l)] p-[var(--spacing-lg)] backdrop-blur-xl transition-colors duration-500">
      <h2 className="text-sm font-semibold heading-ar transition-colors duration-500 text-foreground">
        روابط سريعة
      </h2>
      <nav aria-label="روابط عمليات المسوق" className="flex flex-col gap-[var(--spacing-sm)]">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const content = (
            <span className="flex flex-1 flex-col text-right">
              <span className="text-sm font-medium premium-text transition-colors duration-500 text-foreground">
                {action.label}
              </span>
              <span className="text-xs elegant-text transition-colors duration-500 text-muted-foreground">
                {action.description}
              </span>
            </span>
          );

          return action.to ? (
            <Link key={action.id} to={action.to} className={cn(quickActionLinkClass, 'w-full')}>
              <Icon className="h-5 w-5 transition-colors duration-500 text-primary" aria-hidden />
              {content}
            </Link>
          ) : (
            <Button
              key={action.id}
              type="button"
              variant="ghost"
              onClick={action.action}
              className={cn(quickActionLinkClass, 'group w-full')}
            >
              <Icon className="h-5 w-5 transition-all duration-200 group-hover:scale-110 text-primary" aria-hidden />
              {content}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
