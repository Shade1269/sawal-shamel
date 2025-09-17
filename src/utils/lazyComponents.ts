import { lazy, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-states';

// Lazy loading wrapper with error boundary
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFn);
  
  return LazyComponent;
};

// Pre-defined lazy components for major sections
export const LazyComponents = {
  // Admin Components
  AdminDashboard: createLazyComponent(() => import('@/pages/AdminDashboard')),
  AdminUsers: createLazyComponent(() => import('@/pages/AdminUsers')),
  AdminSettings: createLazyComponent(() => import('@/pages/AdminSettings')),
  ComprehensiveAdminPanel: createLazyComponent(() => import('@/pages/ComprehensiveAdminPanel')),
  
  // Affiliate Components  
  AffiliateDashboard: createLazyComponent(() => import('@/pages/AffiliateDashboard')),
  AffiliateStoreFront: createLazyComponent(() => import('@/pages/AffiliateStoreFront')),
  AffiliateDashboardNew: createLazyComponent(() => import('@/pages/AffiliateDashboardNew')),
  
  // Commerce Components
  ProductManagement: createLazyComponent(() => import('@/pages/ProductManagement')),
  OrderManagement: createLazyComponent(() => import('@/pages/OrderManagement')),
  Inventory: createLazyComponent(() => import('@/pages/Inventory')),
  ShipmentManagement: createLazyComponent(() => import('@/pages/ShipmentManagement')),
  
  // Analytics Components
  ExecutiveDashboard: createLazyComponent(() => import('@/pages/ExecutiveDashboard')),
  MarketingDashboard: createLazyComponent(() => import('@/pages/MarketingDashboard')),
  PaymentDashboard: createLazyComponent(() => import('@/pages/PaymentDashboard')),
  
  // Store Components
  StoreFront: createLazyComponent(() => import('@/pages/StoreFront')),
  PublicStorefront: createLazyComponent(() => import('@/pages/PublicStorefront')),
  StoreManagementNew: createLazyComponent(() => import('@/pages/StoreManagementNew')),
  
  // Chat Components
  AtlantisSystem: createLazyComponent(() => import('@/pages/AtlantisSystem')),
  Chat: createLazyComponent(() => import('@/pages/Chat')),
  ChatRoom: createLazyComponent(() => import('@/pages/ChatRoom')),
  
  // Advanced Features
  SecurityCenter: createLazyComponent(() => import('@/pages/SecurityCenter')),
  
  // Heavy Components
  ThemeBuilder: createLazyComponent(() => import('@/components/customization/ThemeBuilder')),
  DragDropBuilder: createLazyComponent(() => import('@/components/customization/DragDropBuilder')),
  ComponentLibrary: createLazyComponent(() => import('@/components/customization/ComponentLibrary')),
  
  // Real-time Components
  LiveChatWidget: createLazyComponent(() => import('@/components/realtime/LiveChatWidget')),
  ActivityFeedWidget: createLazyComponent(() => import('@/components/realtime/ActivityFeedWidget')),
  NotificationCenter: createLazyComponent(() => import('@/components/realtime/NotificationCenter')),
};

// Route-based code splitting helper
export const createRouteComponent = (componentName: keyof typeof LazyComponents) => {
  return LazyComponents[componentName];
};