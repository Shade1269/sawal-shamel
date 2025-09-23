import { lazy, ComponentType } from 'react';
import { BundleOptimizer } from './bundleOptimization';
import { CodeSplittingProvider } from '@/components/performance/CodeSplittingProvider';

// Optimized route definitions with intelligent loading
export const OptimizedRoutes = {
  // Critical routes (preloaded) - now using unified system
  Dashboard: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/unified/UnifiedDashboardPage'),
    'dashboard',
    'high'
  ),
  
  Home: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/Index'),
    'home',
    'high'
  ),

  // Admin routes (role-based loading) - now using unified system
  AdminDashboard: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/unified/UnifiedDashboardPage'),
    'admin-dashboard',
    'medium'
  ),
  
  AdminUsers: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/AdminUsers'),
    'admin-users',
    'medium'
  ),
  
  AdminSettings: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/AdminSettings'),
    'admin-settings',
    'low'
  ),

  ComprehensiveAdminPanel: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/ComprehensiveAdminPanel'),
    'admin-comprehensive',
    'low'
  ),

  // Affiliate routes - using unified dashboard
  AffiliateStoreFront: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/AffiliateStoreFront'),
    'affiliate-store',
    'medium'
  ),

  // Commerce routes
  ProductManagement: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/ProductManagement'),
    'product-management',
    'medium'
  ),
  
  OrderManagement: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/OrderManagement'),
    'order-management',
    'medium'
  ),
  
  Inventory: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/inventory'),
    'inventory',
    'medium'
  ),

  ShipmentManagement: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/ShipmentManagement'),
    'shipment-management',
    'low'
  ),

  // Store routes - updated
  PublicStorefront: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/PublicStorefront'),
    'public-storefront',
    'high'
  ),

  // Analytics routes
  ExecutiveDashboard: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/ExecutiveDashboard'),
    'executive-dashboard',
    'low'
  ),
  
  MarketingDashboard: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/MarketingDashboard'),
    'marketing-dashboard',
    'low'
  ),
  
  PaymentDashboard: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/PaymentDashboard'),
    'payment-dashboard',
    'low'
  ),

  // Chat routes
  AtlantisSystem: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/AtlantisSystem'),
    'atlantis-system',
    'medium'
  ),
  
  // Security route - chat moved to Atlantis system
  SecurityCenter: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/SecurityCenter'),
    'security-center',
    'low'
  ),

  // Other routes
  About: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/About'),
    'about',
    'low'
  ),
  
  Profile: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/Profile'),
    'profile',
    'medium'
  ),

  // E-commerce specific
  Cart: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/Cart'),
    'cart',
    'high'
  ),
  
  CheckoutPage: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/CheckoutPage'),
    'checkout',
    'high'
  ),
  
  OrderConfirmation: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/OrderConfirmation'),
    'order-confirmation',
    'medium'
  ),

  // Specialized pages
  InvoiceManagement: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/InvoiceManagement'),
    'invoice-management',
    'low'
  ),
  
  RefundManagement: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/RefundManagement'),
    'refund-management',
    'low'
  ),
  
  BrandManagement: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/BrandManagement'),
    'brand-management',
    'low'
  ),

  CategoryManagement: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/CategoryManagement'),
    'category-management',
    'low'
  ),

  // Store-specific routes
  StoreAuth: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/StoreAuth'),
    'store-auth',
    'medium'
  ),
  
  StoreCheckout: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/StoreCheckout'),
    'store-checkout',
    'high'
  ),

  StoreThemeSettings: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/StoreThemeSettings'),
    'store-theme-settings',
    'low'
  ),

  // Payment routes
  Payment: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/Payment'),
    'payment',
    'high'
  ),
  
  PaymentGateways: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/PaymentGateways'),
    'payment-gateways',
    'low'
  ),

  // Shipping routes
  Shipping: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/Shipping'),
    'shipping',
    'medium'
  ),
  
  ShippingManagement: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/ShippingManagement'),
    'shipping-management',
    'low'
  ),

  // Tracking
  OrderTracking: BundleOptimizer.createOptimizedLazyComponent(
    () => import('@/pages/OrderTracking'),
    'order-tracking',
    'medium'
  ),
};

// Route preloading strategies
export const RoutePreloader = {
  // Preload based on user role
  preloadForRole: async (userRole: string) => {
    const roleRoutes = {
      admin: [
        'AdminDashboard',
        'AdminUsers', 
        'ComprehensiveAdminPanel'
      ],
      affiliate: [
        'Dashboard',
        'AffiliateStoreFront'
      ],
      merchant: [
        'PublicStorefront',
        'ProductManagement',
        'OrderManagement',
        'Inventory'
      ],
      customer: [
        'PublicStorefront',
        'Cart',
        'CheckoutPage'
      ]
    };

    const routes = roleRoutes[userRole as keyof typeof roleRoutes] || [];
    
    return Promise.all(
      routes.map(routeName => {
        const routeComponent = OptimizedRoutes[routeName as keyof typeof OptimizedRoutes];
        if (routeComponent) {
          return BundleOptimizer.preloadRoute(
            routeName.toLowerCase(),
            () => import(`@/pages/${routeName}`)
          );
        }
      })
    );
  },

  // Preload based on user behavior
  preloadLikelyRoutes: (currentRoute: string, userHistory: string[]) => {
    const routeProbability = new Map<string, number>();
    
    // Calculate probability based on history
    userHistory.forEach((route, index) => {
      const weight = 1 / (userHistory.length - index); // Recent routes have higher weight
      routeProbability.set(route, (routeProbability.get(route) || 0) + weight);
    });

    // Get top 3 likely routes
    const likelyRoutes = Array.from(routeProbability.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([route]) => route);

    // Preload them
    likelyRoutes.forEach(route => {
      const routeKey = route.split('/')[1]; // Extract component name
      if (routeKey && OptimizedRoutes[routeKey as keyof typeof OptimizedRoutes]) {
        BundleOptimizer.preloadRoute(route, () => import(`@/pages/${routeKey}`));
      }
    });
  },

  // Preload on hover (for navigation links)
  preloadOnHover: (routeName: string) => {
    if (OptimizedRoutes[routeName as keyof typeof OptimizedRoutes]) {
      return BundleOptimizer.preloadRoute(
        routeName,
        () => import(`@/pages/${routeName}`)
      );
    }
  }
};

// Enhanced Suspense wrapper with performance tracking
export const PerformantSuspense: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  chunkName?: string;
}> = ({ children, fallback, chunkName }) => {
  return (
    <CodeSplittingProvider 
      chunkName={chunkName}
      fallback={fallback}
    >
      {children}
    </CodeSplittingProvider>
  );
};

export default OptimizedRoutes;
