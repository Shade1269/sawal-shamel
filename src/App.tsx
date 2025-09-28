import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AdaptiveLayoutProvider, SmartNavigationProvider } from "@/components/layout";
import { DarkModeProvider } from "@/shared/components/DarkModeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { navigationItems } from "@/data/navigationItems";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import DomainManager from "@/components/store/DomainManager";
import AffiliateLayout from "@/layouts/ModernAffiliateLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { cleanupExpiredSessions } from "@/utils/sessionCleanup";

const HomePage = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./features/auth/components/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("./pages/auth/AuthCallbackPage"));
const PublicStorefront = lazy(() => import("./pages/public-storefront/StorefrontPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationSimple"));
const MarketerHomePage = lazy(() => import("./pages/home/MarketerHome"));
const AffiliateStoreFront = lazy(() => import("./pages/AffiliateStoreFront"));
const ModernStorefront = lazy(() => import("./components/store/modern/ModernStorefront"));
const AffiliateStoreSettingsPage = lazy(() => import("./pages/affiliate/store/Settings"));
const LegacyStoreRedirect = lazy(() => import("./pages/redirects/LegacyStoreRedirect"));
const AffiliateAnalyticsPage = lazy(() => import("./pages/affiliate/AffiliateCommissionsPage"));
const UnifiedAffiliateOrders = lazy(() => import("./pages/unified/UnifiedAffiliateOrders"));
const AdminHomePage = lazy(() => import("./pages/home/AdminHome"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrders"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminCustomersPage = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminLeaderboardPage = lazy(() => import("./pages/admin/AdminLeaderboard"));
const AdminPage = lazy(() => import("./pages/Admin"));
const InventoryPage = lazy(() => import("./pages/inventory/index"));
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
                                    <ProfilePage />
                                  </ProtectedRoute>
                                )}
                              />
                              <Route
                                path="/notifications"
                                element={(
                                  <ProtectedRoute requiredRole={["affiliate", "marketer", "admin"]}>
                                    <NotificationsPage />
                                  </ProtectedRoute>
                                )}
                              />

                              <Route path="/:slug" element={<PublicStorefront />} />
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
                <Route path="storefront/modern" element={<ModernStorefront />} />
                <Route path="storefront/:storeSlug" element={<ModernStorefront />} />
                <Route path="store/settings" element={<AffiliateStoreSettingsPage />} />
                <Route path="store/setup" element={<AffiliateStoreSettingsPage />} />
                <Route path="orders" element={<UnifiedAffiliateOrders />} />
                <Route path="analytics" element={<AffiliateAnalyticsPage />} />
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
          </SupabaseAuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
