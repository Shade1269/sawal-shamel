
import { ComponentType } from 'react';
import { BundleOptimizer } from './bundleOptimization';
import { CodeSplittingProvider } from '@/components/performance/CodeSplittingProvider';

type RouteDefinition = {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  chunk: string;
  priority: 'high' | 'medium' | 'low';
};

const routeDefinitions: Record<string, RouteDefinition> = {
  Dashboard: {
    importFn: () => import('@/pages/unified/UnifiedDashboardPage'),
    chunk: 'dashboard',
    priority: 'high',
  },
  AdminDashboard: {
    importFn: () => import('@/pages/unified/UnifiedDashboardPage'),
    chunk: 'admin-dashboard',
    priority: 'medium',
  },
  AdminLeaderboard: {
    importFn: () => import('@/pages/admin/AdminLeaderboard'),
    chunk: 'admin-leaderboard',
    priority: 'medium',
  },
  AdminUsers: {
    importFn: () => import('@/pages/AdminUsers'),
    chunk: 'admin-users',
    priority: 'medium',
  },
  AdminSettings: {
    importFn: () => import('@/pages/AdminSettings'),
    chunk: 'admin-settings',
    priority: 'low',
  },
  AdminOrders: {
    importFn: () => import('@/pages/Admin'),
    chunk: 'admin-orders',
    priority: 'medium',
  },
  AffiliateHome: {
    importFn: () => import('@/pages/affiliate/home'),
    chunk: 'affiliate-home',
    priority: 'medium',
  },
  AffiliateCommissions: {
    importFn: () => import('@/pages/affiliate/AffiliateCommissionsPage'),
    chunk: 'affiliate-commissions',
    priority: 'medium',
  },
  ProductManagement: {
    importFn: () => import('@/pages/ProductManagement'),
    chunk: 'product-management',
    priority: 'medium',
  },
  Inventory: {
    importFn: () => import('@/pages/inventory'),
    chunk: 'inventory',
    priority: 'medium',
  },
  PublicStorefront: {
    importFn: () => import('@/pages/PublicStorefront'),
    chunk: 'public-storefront',
    priority: 'high',
  },
  Profile: {
    importFn: () => import('@/pages/profile'),
    chunk: 'profile',
    priority: 'medium',
  },
  Notifications: {
    importFn: () => import('@/pages/notifications'),
    chunk: 'notifications',
    priority: 'medium',
  },
  Cart: {
    importFn: () => import('@/pages/Cart'),
    chunk: 'cart',
    priority: 'high',
  },
  CheckoutPage: {
    importFn: () => import('@/pages/CheckoutPage'),
    chunk: 'checkout',
    priority: 'high',
  },
  OrderConfirmation: {
    importFn: () => import('@/pages/OrderConfirmationSimple'),
    chunk: 'order-confirmation',
    priority: 'medium',
  },
  OrderTracking: {
    importFn: () => import('@/pages/OrderTracking'),
    chunk: 'order-tracking',
    priority: 'medium',
  },
  BrandManagement: {
    importFn: () => import('@/pages/BrandManagement'),
    chunk: 'brand-management',
    priority: 'low',
  },
  CategoryManagement: {
    importFn: () => import('@/pages/CategoryManagement'),
    chunk: 'category-management',
    priority: 'low',
  },
  StoreAuth: {
    importFn: () => import('@/pages/StoreAuth'),
    chunk: 'store-auth',
    priority: 'medium',
  },
  StoreCheckout: {
    importFn: () => import('@/pages/StoreCheckout'),
    chunk: 'store-checkout',
    priority: 'high',
  },
  StoreOrderConfirmation: {
    importFn: () => import('@/pages/StoreOrderConfirmation'),
    chunk: 'store-order-confirmation',
    priority: 'medium',
  },
};

type RouteKey = keyof typeof routeDefinitions;

type LazyComponentType = ReturnType<typeof BundleOptimizer.createOptimizedLazyComponent<ComponentType<any>>>;

const buildOptimizedRoutes = () => {
  const routes = {} as Record<RouteKey, LazyComponentType>;
  (Object.keys(routeDefinitions) as RouteKey[]).forEach((key) => {
    const config = routeDefinitions[key];
    routes[key] = BundleOptimizer.createOptimizedLazyComponent(config.importFn, config.chunk, config.priority);
  });
  return routes;
};

export const OptimizedRoutes = buildOptimizedRoutes();

const routeImports: Record<RouteKey, RouteDefinition['importFn']> = Object.fromEntries(
  (Object.keys(routeDefinitions) as RouteKey[]).map((key) => [key, routeDefinitions[key].importFn]),
) as Record<RouteKey, RouteDefinition['importFn']>;

const preloadByKey = (key: RouteKey) => BundleOptimizer.preloadRoute(key, routeImports[key]);

export const RoutePreloader = {
  preloadForRole: async (userRole: string) => {
    const roleRoutes: Partial<Record<string, RouteKey[]>> = {
      admin: ['AdminDashboard', 'AdminLeaderboard', 'AdminUsers', 'AdminOrders', 'Inventory'],
      affiliate: ['Dashboard', 'AffiliateHome', 'AffiliateCommissions'],
      customer: ['PublicStorefront', 'Cart', 'CheckoutPage'],
    };

    const routes = roleRoutes[userRole] || [];
    await Promise.all(routes.map((route) => preloadByKey(route)));
    return [];
  },

  preloadLikelyRoutes: (_currentRoute: string, _userHistory: string[]) => {
    // Simplified preloading - handled by role-based preload
    return [];
  },

  preloadOnHover: (routeName: string) => {
    const key = routeName as RouteKey;
    if (routeImports[key]) {
      return preloadByKey(key);
    }
    return Promise.resolve();
  },
};

export const PerformantSuspense: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  chunkName?: string;
}> = ({ children, fallback, chunkName }) => {
  return (
    <CodeSplittingProvider chunkName={chunkName} fallback={fallback}>
      {children}
    </CodeSplittingProvider>
  );
};

export default OptimizedRoutes;
