import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AdaptiveLayoutProvider, SmartNavigationProvider } from "@/components/layout";
import { DarkModeProvider } from "@/shared/components/DarkModeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { navigationItems } from "@/data/navigationItems";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import DomainManager from "@/components/store/DomainManager";
import AffiliateLayout from "@/layouts/ModernAffiliateLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { cleanupExpiredSessions } from "@/utils/sessionCleanup";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";

const HomePage = lazy(() => import("./pages/Index"));
import AuthPage from "./features/auth/components/AuthPage"
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("./pages/auth/AuthCallbackPage"));
const StorefrontIntegration = lazy(() => import("./pages/public-storefront/StorefrontIntegration"));
const StorefrontPage = lazy(() => import("./pages/public-storefront/StorefrontPage"));
const StorefrontCheckout = lazy(() => import("./pages/storefront/StorefrontCheckout"));
const ProductsBrowser = lazy(() => import("./pages/ProductsBrowser"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationSimple"));
const MarketerHomePage = lazy(() => import("./pages/home/MarketerHome"));
const AffiliateStoreFront = lazy(() => import("./pages/AffiliateStoreFront"));
const AffiliateStoreSettingsPage = lazy(() => import("./pages/affiliate/store/Settings"));
const StoreSetup = lazy(() => import("./pages/affiliate/store/StoreSetup"));
const StoreAuth = lazy(() => import("./pages/StoreAuth"));
const CustomerOrders = lazy(() => import("./pages/customer/CustomerOrders"));
const AffiliateAnalyticsPage = lazy(() => import("./pages/affiliate/AffiliateCommissionsPage"));

// Isolated Store Components
const IsolatedStoreLayout = lazy(() => import("@/components/store/IsolatedStoreLayout").then(m => ({ default: m.IsolatedStoreLayout })));
const IsolatedStorefront = lazy(() => import("./pages/storefront/IsolatedStorefront").then(m => ({ default: m.IsolatedStorefront })));
const IsolatedStoreCart = lazy(() => import("./pages/storefront/IsolatedStoreCart").then(m => ({ default: m.IsolatedStoreCart })));
const IsolatedStoreCheckout = lazy(() => import("./pages/storefront/IsolatedStoreCheckout").then(m => ({ default: m.IsolatedStoreCheckout })));
const WalletPage = lazy(() => import("./pages/affiliate/WalletPage"));
const UnifiedAffiliateOrders = lazy(() => import("./pages/unified/UnifiedAffiliateOrders"));
const StorefrontMyOrders = lazy(() => import("./pages/storefront/StorefrontMyOrders"));
const StoreOrderConfirmation = lazy(() => import("./pages/StoreOrderConfirmation"));
const LuxuryShowcase = lazy(() => import("./pages/LuxuryShowcase"));
const AdminHomePage = lazy(() => import("./pages/home/AdminHome"));
const AdminWithdrawalsPage = lazy(() => import("./pages/admin/AdminWithdrawalsPage"));
const AdminProductApproval = lazy(() => import("./pages/admin/AdminProductApproval"));
const OrdersRouter = lazy(() => import("./pages/admin/OrdersRouter"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminCustomersPage = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminLeaderboardPage = lazy(() => import("./pages/admin/AdminLeaderboard"));
const AdminPage = lazy(() => import("./pages/Admin"));
const InventoryPage = lazy(() => import("./pages/inventory/index"));
const ShippingManagementPage = lazy(() => import("./pages/ShippingManagement"));
const MerchantDashboard = lazy(() => import("./pages/merchant/MerchantDashboard"));
const MerchantProducts = lazy(() => import("./pages/merchant/MerchantProducts"));
const MerchantOrders = lazy(() => import("./pages/merchant/MerchantOrders"));
const MerchantLayout = lazy(() => import("./layouts/MerchantLayout"));
const UiShowcasePage = lazy(() => import("./pages/UiShowcase"));
const ProfilePage = lazy(() => import("./pages/profile"));
const NotificationsPage = lazy(() => import("./pages/notifications"));
const TestingPage = lazy(() => import("./pages/Testing"));
const DocumentationPage = lazy(() => import("./pages/Documentation"));
const RolloutPage = lazy(() => import("./pages/Rollout"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      <p className="text-muted-foreground">جاري التحميل...</p>
    </div>
  </div>
);

const App = () => {
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
            <FirebaseAuthProvider>
              <LanguageProvider>
                <DarkModeProvider>
                <UserDataProvider>
                  <AdaptiveLayoutProvider>
                    <BrowserRouter>
                      <SmartNavigationProvider navigationItems={navigationItems}>
                        <Suspense fallback={<LoadingFallback />}>
                          <DomainManager>
                            <Routes>
                              <Route path="/" element={<HomePage />} />
                              <Route path="/auth" element={<AuthPage />} />
                              <Route path="/auth/reset" element={<ResetPasswordPage />} />
                              <Route path="/auth/callback" element={<AuthCallbackPage />} />
                              <Route path="/ui" element={<UiShowcasePage />} />
                              <Route path="/luxury-showcase" element={<LuxuryShowcase />} />
              <Route
                path="/profile"
                element={(
                  <ProtectedRoute requiredRole={["affiliate", "marketer", "admin", "merchant"]}>
                    <AuthenticatedLayout>
                      <ProfilePage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/notifications"
                element={(
                  <ProtectedRoute requiredRole={["affiliate", "marketer", "admin", "merchant"]}>
                    <AuthenticatedLayout>
                      <NotificationsPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                )}
              />

                              {/* Products browsing - MUST come before /:slug */}
                              <Route 
                                path="/products" 
                                element={(
                                  <ProtectedRoute requiredRole={["affiliate", "marketer", "admin"]}>
                                    <AuthenticatedLayout>
                                      <ProductsBrowser />
                                    </AuthenticatedLayout>
                                  </ProtectedRoute>
                                )}
                              />

               {/* Store Routes - Unified under /:storeSlug */}
               <Route path="/:storeSlug" element={<IsolatedStoreLayout />}>
                 <Route index element={<StorefrontPage />} />
                 <Route path="p/:productId" element={<StorefrontIntegration />} />
                 <Route path="cart" element={<IsolatedStoreCart />} />
                 <Route path="checkout" element={<IsolatedStoreCheckout />} />
                 <Route path="orders" element={<StorefrontMyOrders />} />
                 <Route path="auth" element={<StoreAuth />} />
                 <Route path="order/:orderId/confirmation" element={<StoreOrderConfirmation />} />
               </Route>

              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order/confirmation" element={<OrderConfirmationPage />} />

              <Route
                path="/affiliate/*"
                element={(
                  <ProtectedRoute requiredRole={["affiliate", "marketer", "admin"]}>
                    <AffiliateLayout />
                  </ProtectedRoute>
                )}
              >
                <Route index element={<MarketerHomePage />} />
                <Route path="home" element={<Navigate to="../" replace />} />
                <Route path="storefront" element={<AffiliateStoreFront />} />
                <Route path="store/settings" element={<AffiliateStoreSettingsPage />} />
                <Route path="store/setup" element={<StoreSetup />} />
                <Route path="orders" element={<UnifiedAffiliateOrders />} />
                <Route path="analytics" element={<AffiliateAnalyticsPage />} />
                <Route path="wallet" element={<WalletPage />} />
              </Route>

                              <Route
                                path="/admin/*"
                                element={(
                                  <ProtectedRoute requiredRole="admin">
                                    <AdminLayout />
                                  </ProtectedRoute>
                                )}
                              >
                                <Route index element={<Navigate to="dashboard" replace />} />
                                <Route path="dashboard" element={<AdminHomePage />} />
                                <Route path="orders" element={<OrdersRouter />} />
                                <Route path="analytics" element={<AdminAnalyticsPage />} />
                                <Route path="leaderboard" element={<AdminLeaderboardPage />} />
                                <Route path="customers" element={<AdminCustomersPage />} />
                                <Route path="management" element={<AdminPage />} />
                                <Route path="inventory" element={<InventoryPage />} />
                                <Route path="shipping" element={<ShippingManagementPage />} />
                                <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
                                <Route path="products/approval" element={<AdminProductApproval />} />
                                <Route path="testing" element={<TestingPage />} />
                                <Route path="documentation" element={<DocumentationPage />} />
                                <Route path="rollout" element={<RolloutPage />} />
                              </Route>

                              <Route
                                path="/merchant"
                                element={(
                                  <ProtectedRoute requiredRole={["merchant"]}>
                                    <MerchantLayout />
                                  </ProtectedRoute>
                                )}
                              >
                                <Route index element={<MerchantDashboard />} />
                                <Route path="products" element={<MerchantProducts />} />
                                <Route path="orders" element={<MerchantOrders />} />
                              </Route>

                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </DomainManager>
                        </Suspense>
                      </SmartNavigationProvider>
                    </BrowserRouter>
                  </AdaptiveLayoutProvider>
                </UserDataProvider>
              </DarkModeProvider>
            </LanguageProvider>
            </FirebaseAuthProvider>
          </SupabaseAuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
