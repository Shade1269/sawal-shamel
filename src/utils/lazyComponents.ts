import { lazy, ComponentType } from 'react';

// Lazy loading wrapper with error boundary
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  _fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFn);
  
  return LazyComponent;
};

// Pre-defined lazy components for major sections
export const LazyComponents = {
  // Admin Components - using unified system
  AdminUsers: createLazyComponent(() => import('@/pages/AdminUsers')),
  AdminSettings: createLazyComponent(() => import('@/pages/AdminSettings')),
  AdminOrders: createLazyComponent(() => import('@/pages/Admin')),

  // Affiliate Components - using unified system
  AffiliateStoreFront: createLazyComponent(() => import('@/pages/affiliate/home')),

  // Commerce Components
  ProductManagement: createLazyComponent(() => import('@/pages/ProductManagement')),
  Inventory: createLazyComponent(() => import('@/pages/inventory')),

  BrandManagement: createLazyComponent(() => import('@/pages/BrandManagement')),
  CategoryManagement: createLazyComponent(() => import('@/pages/CategoryManagement')),

  // Analytics Components

  // Store Components - updated
  PublicStorefront: createLazyComponent(() => import('@/pages/PublicStorefront')),
};

// Route-based code splitting helper
export const createRouteComponent = (componentName: keyof typeof LazyComponents) => {
  return LazyComponents[componentName];
};