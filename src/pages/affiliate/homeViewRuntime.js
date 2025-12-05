import React from 'react';
import { Loader2 } from 'lucide-react';
import { MyScoreCard } from '../../features/affiliate/components/MyScoreCard';
import { MySalesGlance } from '../../features/affiliate/components/MySalesGlance';
import { RecentOrders } from '../../features/affiliate/components/RecentOrders';
import { ShareTools } from '../../features/affiliate/components/ShareTools';
import { CreateAffiliateStore } from '../../features/affiliate/components/CreateAffiliateStore';
import { resolveAffiliateHomeStateRuntime } from './homeStateRuntime.js';

export const AffiliateHomeViewRuntime = ({
  loading,
  isAuthorized,
  store,
  shareUrl,
  metrics,
  metricsLoading,
  orders,
  ordersLoading,
  topProducts,
  error,
  onRefresh,
  onStoreCreated,
}) => {
  const state = resolveAffiliateHomeStateRuntime({ loading, isAuthorized, store });

  if (state === 'loading') {
    return React.createElement(
      'div',
      { className: 'flex min-h-screen items-center justify-center bg-background', dir: 'rtl' },
      React.createElement(
        'div',
        { className: 'text-center text-foreground' },
        React.createElement(Loader2, {
          className: 'mx-auto h-8 w-8 animate-spin text-primary',
        }),
        React.createElement('p', { className: 'mt-3 text-sm text-muted-foreground' }, 'جاري تجهيز لوحة المسوّقة...'),
      ),
    );
  }

  if (state === 'unauthorized') {
    return React.createElement(
      'div',
      { className: 'flex min-h-screen items-center justify-center bg-background', dir: 'rtl' },
      React.createElement(
        'div',
        { className: 'max-w-md rounded-3xl bg-card p-8 text-center shadow-xl border border-border' },
        React.createElement('p', { className: 'text-lg font-semibold text-foreground' }, 'هذه الصفحة مخصصة لمسوقات أناقتي.'),
        React.createElement(
          'p',
          { className: 'mt-2 text-sm text-muted-foreground' },
          'يرجى تسجيل الدخول بحساب مسوّقة أو استخدام وضع الانتحال المخصص من فريق الإدارة.',
        ),
      ),
    );
  }

  if (state === 'no-store') {
    return React.createElement(CreateAffiliateStore, { onStoreCreated });
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-background', dir: 'rtl' },
    React.createElement(
      'div',
      { className: 'mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8' },
      error
        ? React.createElement(
            'div',
            { className: 'rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive shadow border border-destructive/20' },
            error,
          )
        : null,
      React.createElement(
        'div',
        { className: 'grid gap-4 md:grid-cols-2' },
        React.createElement(MyScoreCard, { storeName: store.store_name }),
        React.createElement(ShareTools, { store, shareUrl, products: topProducts }),
      ),
      React.createElement(MySalesGlance, { metrics, loading: metricsLoading, onRefresh }),
      React.createElement(RecentOrders, { orders, loading: ordersLoading }),
    ),
  );
};
