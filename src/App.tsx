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

const HomePage = lazy(() => import("./pages/Index"));
import AuthPage from "./features/auth/components/AuthPage"
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("./pages/auth/AuthCallbackPage"));
const StorefrontIntegration = lazy(() => import("./pages/public-storefront/StorefrontIntegration"));
const StorefrontCheckout = lazy(() => import("./pages/storefront/StorefrontCheckout"));
const ProductsBrowser = lazy(() => import("./pages/ProductsBrowser"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationSimple"));
const MarketerHomePage = lazy(() => import("./pages/home/MarketerHome"));
const AffiliateStoreFront = lazy(() => import("./pages/AffiliateStoreFront"));
const AffiliateStoreSettingsPage = lazy(() => import("./pages/affiliate/store/Settings"));
const StoreSetup = lazy(() => import("./pages/affiliate/store/StoreSetup"));
const LegacyStoreRedirect = lazy(() => import("./pages/redirects/LegacyStoreRedirect"));
const AffiliateAnalyticsPage = lazy(() => import("./pages/affiliate/AffiliateCommissionsPage"));
const AffiliateWalletPage = lazy(() => import("./pages/affiliate/AffiliateWalletPage"));
const UnifiedAffiliateOrders = lazy(() => import("./pages/unified/UnifiedAffiliateOrders"));
const AdminHomePage = lazy(() => import("./pages/home/AdminHome"));
const AdminWithdrawalsPage = lazy(() => import("./pages/admin/AdminWithdrawalsPage"));
const AdminProductApproval = lazy(() => import("./pages/admin/AdminProductApproval"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrders"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminCustomersPage = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminLeaderboardPage = lazy(() => import("./pages/admin/AdminLeaderboard"));
const AdminPage = lazy(() => import("./pages/Admin"));
const InventoryPage = lazy(() => import("./pages/inventory/index"));
const MerchantDashboard = lazy(() => import("./pages/merchant/MerchantDashboard"));
const MerchantProducts = lazy(() => import("./pages/merchant/MerchantProducts"));
const MerchantLayout = lazy(() => import("./layouts/MerchantLayout"));
const UiShowcasePage = lazy(() => import("./pages/UiShowcase"));
const ProfilePage = lazy(() => import("./pages/profile"));
const NotificationsPage = lazy(() => import("./pages/notifications"));

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
                              <Route
                                path="/profile"
                                element={(
                                  <ProtectedRoute requiredRole={["affiliate", "marketer", "admin"]}>
                                    <AuthenticatedLayout>
                                      <ProfilePage />
                                    </AuthenticatedLayout>
                                  </ProtectedRoute>
                                )}
                              />
                              <Route
                                path="/notifications"
                                element={(
                                  <ProtectedRoute requiredRole={["affiliate", "marketer", "admin"]}>
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

              <Route path="/:slug" element={<StorefrontIntegration />} />
              <Route path="/:slug/checkout" element={<StorefrontCheckout />} />
              <Route path="/store/:slug/*" element={<LegacyStoreRedirect />} />

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
                <Route path="wallet" element={<AffiliateWalletPage />} />
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
                                <Route path="orders" element={<AdminOrdersPage />} />
                                <Route path="analytics" element={<AdminAnalyticsPage />} />
                                <Route path="leaderboard" element={<AdminLeaderboardPage />} />
                                <Route path="customers" element={<AdminCustomersPage />} />
                                <Route path="management" element={<AdminPage />} />
                                <Route path="inventory" element={<InventoryPage />} />
                                <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
                                <Route path="products/approval" element={<AdminProductApproval />} />
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
