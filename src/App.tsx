import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DarkModeProvider } from "@/shared/components/DarkModeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { AdaptiveLayoutProvider, SmartNavigationProvider } from "@/components/layout";
import { navigationItems } from "@/data/navigationItems";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import Header from "@/components/common/Header";
import StoreLayout from "@/layouts/StoreLayout";
import { StoreRouteGuard } from "@/components/guards/StoreRouteGuard";
import { PlatformRouteGuard } from "@/components/guards/PlatformRouteGuard";
import { AuthPage } from "@/features/auth";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import { UnifiedLayout } from "@/components/layout";
import Index from "./pages/Index";
import DomainManager from "@/components/store/DomainManager";
import { cleanupExpiredSessions } from "@/utils/sessionCleanup";

import AdminLayout from "@/layouts/EnhancedAdminLayout";
import { lazy, Suspense, useEffect } from "react";
import RedirectToPrimaryStore from "./pages/redirects/RedirectToPrimaryStore";

// Unified Pages - المكونات الموحدة الجديدة
const UnifiedDashboardPage = lazy(() => import("./pages/unified/UnifiedDashboardPage"));
const UnifiedProductsPage = lazy(() => import("./pages/unified/UnifiedProductsPage"));
const UnifiedOrdersPage = lazy(() => import("./pages/unified/UnifiedOrdersPage"));

// Legacy Dashboard pages - سيتم إزالتها تدريجياً
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminPermissions = lazy(() => import("./pages/admin/AdminPermissions"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));

// Demo Pages
const NavigationDemo = lazy(() => import("./components/demos/NavigationDemo"));
const AdvancedNavigationDemo = lazy(() => import("./components/demos/AdvancedNavigationDemo"));
const DesignSystemDemo = lazy(() => import("./components/demos/DesignSystemDemo"));
const InteractiveDemo = lazy(() => import("./components/demos/InteractiveDemo"));

// Legacy - سيتم دمجها في النظام الموحد
const MerchantDashboard = lazy(() => import("./pages/MerchantDashboard"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const AffiliateStoreFront = lazy(() => import("./pages/AffiliateStoreFront"));

// Affiliate Dashboard Pages - سيتم دمجها
const AffiliateDashboardLayout = lazy(() => import("./layouts/AffiliateDashboardLayout"));
const AffiliateDashboardOverview = lazy(() => import("./pages/affiliate/AffiliateDashboardOverview"));
const AffiliateProductsPage = lazy(() => import("./pages/affiliate/AffiliateProductsPage"));
const AffiliateOrdersPage = lazy(() => import("./pages/affiliate/AffiliateOrdersPage"));
const AffiliateCommissionsPage = lazy(() => import("./pages/affiliate/AffiliateCommissionsPage"));
const StoreThemeSettings = lazy(() => import("./pages/StoreThemeSettings"));
const ThemeStudioPage = lazy(() => import("./pages/ThemeStudioPage"));

// Public Storefront (no auth required)
const PublicStorefront = lazy(() => import("./pages/PublicStorefront"));
const ProductDetailPage = lazy(() => import("./pages/storefront/ProductDetailPage"));
const OrderTrackingPage = lazy(() => import("./pages/storefront/OrderTrackingPage"));
const MyOrders = lazy(() => import("./pages/storefront/MyOrders"));

// Layouts
import { PublicStorefrontLayout } from "./layouts/PublicStorefrontLayout";
// Direct imports for store components to avoid lazy loading issues
import StoreCheckout from "./pages/StoreCheckout";
import { IsolatedStoreLayout } from '@/components/store/IsolatedStoreLayout';
import { IsolatedStorefront } from '@/pages/storefront/IsolatedStorefront';
import { IsolatedStoreCart } from '@/pages/storefront/IsolatedStoreCart';
import { IsolatedStoreCheckout } from '@/pages/storefront/IsolatedStoreCheckout';
import { MyStoreOrders } from '@/pages/storefront/MyStoreOrders';
import StoreOrderConfirmation from "./pages/StoreOrderConfirmation";
import StoreAuth from "./pages/StoreAuth";
import StoreTestPage from "./components/store/StoreTestPage";
// Legacy - سيتم دمجها في النظام الموحد
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminOrderManagement = lazy(() => import("./pages/AdminOrderManagement"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const AboutPage = lazy(() => import("./pages/About"));
const CreateAdminPage = lazy(() => import("./pages/CreateAdmin"));

// E-commerce Pages - سيتم توحيدها
const Cart = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const SimpleCODCheckout = lazy(() => import("./pages/SimpleCODCheckout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const OrderConfirmationSimple = lazy(() => import("./pages/OrderConfirmationSimple"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const OrderManagement = lazy(() => import("./pages/OrderManagement"));

// Analytics Pages
const AnalyticsDashboard = lazy(() => import("@/features/analytics").then(m => ({ default: m.AnalyticsDashboard })));
const SalesReports = lazy(() => import("@/features/analytics").then(m => ({ default: m.SalesReports })));
const UserBehaviorAnalytics = lazy(() => import("@/features/analytics").then(m => ({ default: m.UserBehaviorAnalytics })));

// Payment System Pages
const PaymentDashboard = lazy(() => import("./pages/PaymentDashboard"));
const InvoiceManagement = lazy(() => import("./pages/InvoiceManagement"));
const PaymentGateways = lazy(() => import("./pages/PaymentGateways"));
const RefundManagement = lazy(() => import("./pages/RefundManagement"));
const Inventory = lazy(() => import("./pages/Inventory"));
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));
const SecurityCenter = lazy(() => import("./pages/SecurityCenter"));
const SEOManagement = lazy(() => import("./pages/SEOManagement"));
const MonitoringPage = lazy(() => import("./pages/MonitoringPage"));
const MarketingDashboard = lazy(() => import("./pages/MarketingDashboard"));
const ComprehensiveAdminPanel = lazy(() => import("./pages/ComprehensiveAdminPanel"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AtlantisSystem = lazy(() => import("./pages/AtlantisSystem"));
const AtlantisGuide = lazy(() => import("./pages/AtlantisGuide"));
const AtlantisChat = lazy(() => import("@/features/chat").then(m => ({ default: m.AtlantisChat })));
const AtlantisChatRooms = lazy(() => import("@/features/chat").then(m => ({ default: m.AtlantisChatRooms })));

// Legacy Product Management Pages - سيتم دمجها
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const ProductsBrowser = lazy(() => import("./pages/ProductsBrowser"));
const CategoryManagement = lazy(() => import("./pages/CategoryManagement"));
const BrandManagement = lazy(() => import("./pages/BrandManagement"));

// CMS Management
const CMSManagement = lazy(() => import("./pages/CMSManagement"));

// Banner Management
const BannerManagementPage = lazy(() => import("./pages/BannerManagementPage"));

// Promotions Management
const PromotionsPage = lazy(() => import("./pages/PromotionsPage"));

// Advanced Marketing
const AdvancedMarketingPage = lazy(() => import("./pages/AdvancedMarketingPage"));

// Content Management
const ContentManagementPage = lazy(() => import("./pages/ContentManagementPage"));

// Visual Page Builder  
const VisualPageBuilderPage = lazy(() => import("./pages/VisualPageBuilderPage"));

// UX Enhancements
const UXEnhancementsPage = lazy(() => import("./pages/UXEnhancementsPage"));

// Shipping and Tracking Pages
const ShipmentManagement = lazy(() => import("./pages/ShipmentManagement"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  // تنظيف الجلسات المنتهية عند تحميل التطبيق
  useEffect(() => {
    cleanupExpiredSessions();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
            <SupabaseAuthProvider>
              <LanguageProvider>
                <DarkModeProvider>
                  <UserDataProvider>
                    <AdaptiveLayoutProvider>
                      <SmartNavigationProvider navigationItems={navigationItems}>
                        <BrowserRouter>
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">جاري التحميل...</p>
                        </div>
                      </div>
                    }>
                       <DomainManager>
                        <Routes>
                          {/* Public Storefront Routes - No Auth Required */}
                          <Route path="/s/:store_slug" element={
                            <PublicStorefrontLayout>
                              <PublicStorefront />
                            </PublicStorefrontLayout>
                          } />
                          <Route path="/s/:store_slug/product/:product_id" element={
                            <PublicStorefrontLayout>
                              <ProductDetailPage />
                            </PublicStorefrontLayout>
                          } />
                          <Route path="/s/:store_slug/track-order" element={
                            <PublicStorefrontLayout>
                              <OrderTrackingPage />
                            </PublicStorefrontLayout>
                          } />
                          <Route path="/s/:store_slug/my-orders" element={
                            <PublicStorefrontLayout>
                              <MyOrders />
                            </PublicStorefrontLayout>
                          } />
                          <Route path="/store/:store_slug" element={
                            <PublicStorefrontLayout>
                              <PublicStorefront />
                            </PublicStorefrontLayout>
                          } />
                          
                          {/* Store Routes - نظام منفصل 100% للعملاء */}
                          <Route path="/store/app/*" element={
                            <StoreRouteGuard>
                              <StoreLayout>
                                <Routes>
                                  <Route path=":storeSlug" element={<AffiliateStoreFront />} />
                                  <Route path=":storeSlug/test" element={<StoreTestPage />} />
                                  <Route path=":storeSlug/auth" element={<StoreAuth />} />
                                  <Route path=":storeSlug/checkout" element={<StoreCheckout />} />
                                  <Route path=":storeSlug/order-confirmation/:orderId" element={<StoreOrderConfirmation />} />
                                </Routes>
                              </StoreLayout>
                            </StoreRouteGuard>
                          } />
                         
                          {/* Platform Routes - محمية من عملاء المتجر */}
                          <Route path="/*" element={
                            <PlatformRouteGuard>
                              <UnifiedLayout>
                                <Routes>
                                   {/* Public Routes */}
                                   <Route path="/" element={<Index />} />
                                   <Route path="/home" element={<Navigate to="/" replace />} />
                                   <Route path="/auth" element={<AuthPage />} />
                                   <Route path="/login" element={<AuthPage />} />
                                   <Route path="/signup" element={<AuthPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                                    <Route path="/about" element={<AboutPage />} />
                                    <Route path="/create-admin" element={<CreateAdminPage />} />
                    
                    {/* Demo Pages */}
                    <Route path="/navigation-demo" element={<NavigationDemo />} />
                    <Route path="/advanced-navigation" element={<AdvancedNavigationDemo />} />
                    <Route path="/design-demo" element={<DesignSystemDemo />} />
                    <Route path="/interactive-demo" element={<InteractiveDemo />} />
                       {/* الصفحات الموحدة الجديدة */}
                       
                       {/* Dashboard الموحد - يعمل لجميع الأدوار */}
                       <Route path="/dashboard" element={
                         <ProtectedRoute requiredRole={["affiliate", "admin", "merchant"]}>
                           <UnifiedDashboardPage />
                         </ProtectedRoute>
                       } />
                       <Route path="/admin" element={
                         <ProtectedRoute requiredRole={["admin"]}>
                           <UnifiedDashboardPage />
                         </ProtectedRoute>
                       } />
                       <Route path="/merchant" element={
                         <ProtectedRoute requiredRole={["merchant", "admin"]}>
                           <UnifiedDashboardPage />
                         </ProtectedRoute>
                       } />

                       {/* Products الموحد */}
                       <Route path="/products" element={<UnifiedProductsPage />} />
                       <Route path="/products-browser" element={
                         <ProtectedRoute requiredRole={["affiliate"]}>
                           <UnifiedProductsPage />
                         </ProtectedRoute>
                       } />
                       <Route path="/admin/products" element={
                         <ProtectedRoute requiredRole={["admin"]}>
                           <UnifiedProductsPage />
                         </ProtectedRoute>
                       } />
                       <Route path="/merchant/products" element={
                         <ProtectedRoute requiredRole={["merchant", "admin"]}>
                           <UnifiedProductsPage />
                         </ProtectedRoute>
                       } />

                       {/* Orders الموحد */}
                       <Route path="/orders" element={
                         <ProtectedRoute requiredRole={["merchant", "admin"]}>
                           <UnifiedOrdersPage />
                         </ProtectedRoute>
                       } />
                       <Route path="/dashboard/orders" element={
                         <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                           <UnifiedOrdersPage />
                         </ProtectedRoute>
                       } />
                       <Route path="/admin/orders" element={
                         <ProtectedRoute requiredRole={["admin"]}>
                           <UnifiedOrdersPage />
                         </ProtectedRoute>
                       } />
                       <Route path="/my-orders" element={<UnifiedOrdersPage />} />

                       {/* Legacy Routes - للتوافق مع الروابط القديمة */}
                       <Route path="/affiliate-dashboard" element={<Navigate to="/dashboard" replace />} />
                       <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
                       <Route path="/merchant-dashboard" element={<Navigate to="/merchant" replace />} />
                       <Route path="/product-management" element={<Navigate to="/products" replace />} />
                       <Route path="/order-management" element={<Navigate to="/orders" replace />} />

                       
                       {/* الصفحات المحددة التي لم يتم دمجها بعد */}
                       {/* E-commerce Routes - نظام التسوق */}
                       <Route path="/cart" element={<Cart />} />
                       <Route path="/checkout" element={<CheckoutPage />} />
                       <Route path="/simple-checkout" element={<SimpleCODCheckout />} />
                       <Route path="/order-confirmation/:orderId" element={<OrderConfirmationSimple />} />
                       <Route path="/track-order" element={<OrderTracking />} />
                       <Route path="/track-order/:orderId" element={<OrderTracking />} />
                       {/* الإدارة والأنشطة المتقدمة */}
                       <Route path="/shipment-management" element={
                         <ProtectedRoute requiredRole={["merchant", "admin"]}>
                           <ShipmentManagement />
                         </ProtectedRoute>
                       } />
                       
                       {/* Analytics Routes - التحليلات */}
                       <Route path="/analytics" element={
                         <ProtectedRoute requiredRole={["merchant", "admin"]}>
                           <AnalyticsDashboard />
                         </ProtectedRoute>
                       } />
                       <Route path="/sales-reports" element={
                         <ProtectedRoute requiredRole={["merchant", "admin"]}>
                           <SalesReports />
                         </ProtectedRoute>
                       } />
                       <Route path="/user-behavior" element={
                         <ProtectedRoute requiredRole={["merchant", "admin"]}>
                           <UserBehaviorAnalytics />
                         </ProtectedRoute>
                       } />
                      
                       {/* الأنظمة المحددة والمتقدمة */}
                       <Route path="/profile" element={
                         <ProtectedRoute>
                           <ProfilePage />
                         </ProtectedRoute>
                       } />
                       
                       {/* Legacy Affiliate Dashboard Routes - إعادة توجيه للنظام الموحد */}
                       <Route path="/dashboard/*" element={
                         <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                           <Routes>
                             <Route index element={<UnifiedDashboardPage />} />
                             <Route path="products" element={<UnifiedProductsPage />} />
                             <Route path="orders" element={<UnifiedOrdersPage />} />
                             <Route path="commissions" element={<AffiliateCommissionsPage />} />
                           </Routes>
                         </ProtectedRoute>
                       } />
                        
                         {/* CMS Management Route */}
                         <Route path="/cms-management" element={
                           <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                             <CMSManagement />
                           </ProtectedRoute>
                         } />
                        
                         {/* Banner Management Route */}
                           <Route path="/banner-management/:storeId" element={
                             <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                               <BannerManagementPage />
                             </ProtectedRoute>
                           } />
                          
                         {/* Promotions Management Route */}
                         <Route path="/promotions" element={
                           <ProtectedRoute requiredRole={["affiliate", "merchant", "admin"]}>
                             <PromotionsPage />
                           </ProtectedRoute>
                         } />
                          
                          {/* Advanced Marketing Route */}
                          <Route path="/advanced-marketing" element={
                            <ProtectedRoute requiredRole={["affiliate", "merchant", "admin"]}>
                              <AdvancedMarketingPage />
                            </ProtectedRoute>
                          } />
                           
                          {/* Content Management Route */}
                          <Route path="/content-management" element={
                            <ProtectedRoute requiredRole={["affiliate", "merchant", "admin"]}>
                              <ContentManagementPage />
                            </ProtectedRoute>
                          } />
                           
                          {/* Visual Page Builder Route */}
                          <Route path="/page-builder" element={
                            <ProtectedRoute requiredRole={["affiliate", "merchant", "admin"]}>
                              <VisualPageBuilderPage />
                            </ProtectedRoute>
                          } />
                          
                          {/* UX Enhancements Route */}
                          <Route path="/ux-enhancements" element={
                            <ProtectedRoute requiredRole={["affiliate", "merchant", "admin"]}>
                              <UXEnhancementsPage />
                            </ProtectedRoute>
                          } />
                          
                         {/* Theme Studio Route */}
                        <Route path="/theme-studio" element={
                          <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                            <ThemeStudioPage />
                          </ProtectedRoute>
                        } />

                        {/* Convenience Redirects (resolve primary store automatically) */}
                        <Route path="/store-themes" element={
                          <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                            <RedirectToPrimaryStore to="store-themes" />
                          </ProtectedRoute>
                        } />
                        <Route path="/banner-management" element={
                          <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                            <RedirectToPrimaryStore to="banner-management" />
                          </ProtectedRoute>
                        } />
                       
                       {/* Store Theme Settings */}
                       <Route path="/store-themes/:storeId" element={
                         <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                           <StoreThemeSettings />
                         </ProtectedRoute>
                       } />
                      
                      {/* Legacy Dashboard Route */}
                      <Route 
                        path="/old-dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Admin Routes with Sidebar Layout */}
                      <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="permissions" element={<AdminPermissions />} />
                        <Route path="activity" element={<AdminActivity />} />
                        <Route path="payments" element={<PaymentDashboard />} />
                        <Route path="invoices" element={<InvoiceManagement />} />
                        <Route path="payment-gateways" element={<PaymentGateways />} />
        <Route path="refunds" element={<RefundManagement />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="executive" element={<ExecutiveDashboard />} />
        <Route path="security" element={<SecurityCenter />} />
        <Route path="seo" element={<SEOManagement />} />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="marketing" element={<MarketingDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="brands" element={<BrandManagement />} />
        <Route path="analytics-dashboard" element={<AnalyticsDashboard />} />
        <Route path="sales-reports" element={<SalesReports />} />
        <Route path="user-behavior" element={<UserBehaviorAnalytics />} />
                      </Route>
                      
                       {/* Merchant Routes - Redirect to unified dashboard */}
                       <Route 
                         path="/merchant" 
                         element={
                           <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                             <Navigate to="/dashboard" replace />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/merchant-dashboard" 
                         element={
                           <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                             <Navigate to="/dashboard" replace />
                           </ProtectedRoute>
                         } 
                       />
                       
                       {/* Payment Routes for Merchants */}
                       <Route 
                         path="/payments" 
                         element={
                           <ProtectedRoute requiredRole={["merchant", "admin"]}>
                             <PaymentDashboard />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/invoices" 
                         element={
                           <ProtectedRoute requiredRole={["merchant", "admin"]}>
                             <InvoiceManagement />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/payment-gateways" 
                         element={
                           <ProtectedRoute requiredRole={["merchant", "admin"]}>
                             <PaymentGateways />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/refunds" 
                         element={
                           <ProtectedRoute requiredRole={["merchant", "admin"]}>
                             <RefundManagement />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/order-management" 
                         element={
                           <ProtectedRoute requiredRole={["merchant", "admin"]}>
                             <OrderManagement />
                           </ProtectedRoute>
                         } 
                       />
                      <Route 
                        path="/admin-orders" 
                        element={
                          <ProtectedRoute requiredRole="admin" fallback="/dashboard">
                            <AdminOrderManagement />
                          </ProtectedRoute>
                        } 
                      />
                      
                         {/* Affiliate Routes - Redirect to unified dashboard */}
                         <Route 
                           path="/affiliate" 
                           element={
                             <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                               <Navigate to="/dashboard" replace />
                             </ProtectedRoute>
                           } 
                         />
                         <Route 
                           path="/affiliate-dashboard" 
                           element={
                             <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                               <Navigate to="/dashboard" replace />
                             </ProtectedRoute>
                           } 
                         />
                       
                        {/* Atlantis System */}
                       <Route 
                         path="/atlantis" 
                         element={
                           <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                             <AtlantisSystem />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/atlantis-guide" 
                         element={
                           <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                             <AtlantisGuide />
                           </ProtectedRoute>
                         } 
                       />
                       
                       {/* Atlantis Chat */}
                       <Route 
                         path="/atlantis/chat" 
                         element={
                           <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                             <AtlantisChatRooms />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/atlantis/chat/:roomId" 
                         element={
                           <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                             <AtlantisChat />
                           </ProtectedRoute>
                         } 
                        />
                        
                                    {/* Catch all for Platform */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                              </UnifiedLayout>
                            </PlatformRouteGuard>
                          } />
                         </Routes>
                       </DomainManager>
                   </Suspense>
                        </BrowserRouter>
                      </SmartNavigationProvider>
                    </AdaptiveLayoutProvider>
                  </UserDataProvider>
                </DarkModeProvider>
              </LanguageProvider>
            </SupabaseAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
