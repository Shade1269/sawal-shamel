import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdaptiveLayoutProvider, SmartNavigationProvider } from "@/components/layout";
import { DarkModeProvider } from "@/shared/components/DarkModeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { navigationItems } from "@/data/navigationItems";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
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
import {
  Suspense,
  lazy,
  useEffect,
  type ComponentProps,
  type ReactElement,
} from "react";
import RedirectToPrimaryStore from "./pages/redirects/RedirectToPrimaryStore";
import { AdaptiveDemo } from "./components/adaptive-demo/AdaptiveDemo";
import EnhancedComponentsDemo from "./examples/EnhancedComponentsDemo";
import PerformanceDemo from "./examples/PerformanceDemo";
import UnifiedSystemDemo from "./examples/UnifiedSystemDemo";
import MobileNavigationTest from "./examples/MobileNavigationTest";

const UnifiedDashboardPage = lazy(() => import("./pages/unified/UnifiedDashboardPage"));
const UnifiedProductsPage = lazy(() => import("./pages/unified/UnifiedProductsPage"));
const UnifiedOrdersPage = lazy(() => import("./pages/unified/UnifiedOrdersPage"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminPermissions = lazy(() => import("./pages/admin/AdminPermissions"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const NavigationDemo = lazy(() => import("./components/demos/NavigationDemo"));
const AdvancedNavigationDemo = lazy(() => import("./components/demos/AdvancedNavigationDemo"));
const DesignSystemDemo = lazy(() => import("./components/demos/DesignSystemDemo"));
const InteractiveDemo = lazy(() => import("./components/demos/InteractiveDemo"));
const AffiliateStoreFront = lazy(() => import("./pages/AffiliateStoreFront"));
const AffiliateCommissionsPage = lazy(() => import("./pages/affiliate/AffiliateCommissionsPage"));
const AffiliateHomePage = lazy(() => import("./pages/affiliate/home"));
const StoreThemeSettings = lazy(() => import("./pages/StoreThemeSettings"));
const ThemeStudioPage = lazy(() => import("./pages/ThemeStudioPage"));
const PublicStorefront = lazy(() => import("./pages/PublicStorefront"));
const ProductDetailPage = lazy(() => import("./pages/storefront/ProductDetailPage"));
const OrderTrackingPage = lazy(() => import("./pages/storefront/OrderTrackingPage"));
const MyOrders = lazy(() => import("./pages/storefront/MyOrders"));
const PublicStorefrontLayout = lazy(() => import("./layouts/PublicStorefrontLayout"));
const StoreCheckout = lazy(() => import("./pages/StoreCheckout"));
const StoreOrderConfirmation = lazy(() => import("./pages/StoreOrderConfirmation"));
const StoreAuth = lazy(() => import("./pages/StoreAuth"));
const StoreTestPage = lazy(() => import("./components/store/StoreTestPage"));
const AdminOrderManagement = lazy(() => import("./pages/AdminOrderManagement"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const LeaderboardPage = lazy(() => import("./pages/leaderboard"));
const AboutPage = lazy(() => import("./pages/About"));
const CreateAdminPage = lazy(() => import("./pages/CreateAdmin"));
const Cart = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const SimpleCODCheckout = lazy(() => import("./pages/SimpleCODCheckout"));
const OrderConfirmationSimple = lazy(() => import("./pages/OrderConfirmationSimple"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const OrderManagement = lazy(() => import("./pages/OrderManagement"));
const AnalyticsDashboard = lazy(() =>
  import("@/features/analytics").then((module) => ({ default: module.AnalyticsDashboard })),
);
const SalesReports = lazy(() =>
  import("@/features/analytics").then((module) => ({ default: module.SalesReports })),
);
const UserBehaviorAnalytics = lazy(() =>
  import("@/features/analytics").then((module) => ({ default: module.UserBehaviorAnalytics })),
);
const PaymentDashboard = lazy(() => import("./pages/PaymentDashboard"));
const InvoiceManagement = lazy(() => import("./pages/InvoiceManagement"));
const PaymentGateways = lazy(() => import("./pages/PaymentGateways"));
const RefundManagement = lazy(() => import("./pages/RefundManagement"));
const Inventory = lazy(() => import("./pages/inventory"));
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));
const SecurityCenter = lazy(() => import("./pages/SecurityCenter"));
const SEOManagement = lazy(() => import("./pages/SEOManagement"));
const MonitoringPage = lazy(() => import("./pages/MonitoringPage"));
const MarketingDashboard = lazy(() => import("./pages/MarketingDashboard"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AtlantisSystem = lazy(() => import("./pages/AtlantisSystem"));
const AtlantisGuide = lazy(() => import("./pages/AtlantisGuide"));
const AtlantisChat = lazy(() => import("@/features/chat").then((module) => ({ default: module.AtlantisChat })));
const AtlantisChatRooms = lazy(() =>
  import("@/features/chat").then((module) => ({ default: module.AtlantisChatRooms })),
);
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const CategoryManagement = lazy(() => import("./pages/CategoryManagement"));
const BrandManagement = lazy(() => import("./pages/BrandManagement"));
const CMSManagement = lazy(() => import("./pages/CMSManagement"));
const BannerManagementPage = lazy(() => import("./pages/BannerManagementPage"));
const PromotionsPage = lazy(() => import("./pages/PromotionsPage"));
const AdvancedMarketingPage = lazy(() => import("./pages/AdvancedMarketingPage"));
const ContentManagementPage = lazy(() => import("./pages/ContentManagementPage"));
const VisualPageBuilderPage = lazy(() => import("./pages/VisualPageBuilderPage"));
const UXEnhancementsPage = lazy(() => import("./pages/UXEnhancementsPage"));
const ShipmentManagement = lazy(() => import("./pages/ShipmentManagement"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

type ProtectedRouteProps = ComponentProps<typeof ProtectedRoute>;
type RoleRequirement = ProtectedRouteProps["requiredRole"];

type BasicRouteConfig = {
  path: string;
  render: () => ReactElement;
};

type GuardedRouteConfig = BasicRouteConfig & {
  roles?: RoleRequirement;
  fallback?: ProtectedRouteProps["fallback"];
  allowInactive?: ProtectedRouteProps["allowInactive"];
  authOnly?: boolean;
};

type RouteVariant = Omit<GuardedRouteConfig, "render">;

type RouteDefinition = {
  id: string;
  render: () => ReactElement;
  variants: RouteVariant[];
};

const PLATFORM_REDIRECTS: Array<{ from: string; to: string }> = [
  { from: "/home", to: "/" },
  { from: "/affiliate-dashboard", to: "/dashboard" },
  { from: "/admin-dashboard", to: "/admin" },
  { from: "/merchant-dashboard", to: "/merchant" },
  { from: "/product-management", to: "/products" },
  { from: "/old-dashboard", to: "/dashboard" },
];

const ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    id: "auth",
    render: () => <AuthPage />,
    variants: ["/auth", "/login", "/signup"].map((path) => ({ path })),
  },
  {
    id: "marketing",
    render: () => <Index />,
    variants: [{ path: "/" }],
  },
  {
    id: "components-demo",
    render: () => <EnhancedComponentsDemo />,
    variants: [
      { path: "/components" },
      { path: "/design-demo" },
    ],
  },
  {
    id: "adaptive-demo",
    render: () => <AdaptiveDemo />,
    variants: [{ path: "/adaptive" }],
  },
  {
    id: "performance-demo",
    render: () => <PerformanceDemo />,
    variants: [{ path: "/performance" }],
  },
  {
    id: "unified-demo",
    render: () => <UnifiedSystemDemo />,
    variants: [{ path: "/unified" }],
  },
  {
    id: "mobile-demo",
    render: () => <MobileNavigationTest />,
    variants: [{ path: "/mobile-test" }],
  },
  {
    id: "about",
    render: () => <AboutPage />,
    variants: [{ path: "/about" }],
  },
  {
    id: "create-admin",
    render: () => <CreateAdminPage />,
    variants: [{ path: "/create-admin" }],
  },
  {
    id: "navigation-demos",
    render: () => <NavigationDemo />,
    variants: [
      { path: "/navigation-demo" },
      { path: "/advanced-navigation" },
    ],
  },
  {
    id: "interactive-demo",
    render: () => <InteractiveDemo />,
    variants: [{ path: "/interactive-demo" }],
  },
  {
    id: "catalog-public",
    render: () => <UnifiedProductsPage />,
    variants: [{ path: "/products" }],
  },
  {
    id: "commerce-public",
    render: () => <Cart />,
    variants: [{ path: "/cart" }],
  },
  {
    id: "checkout",
    render: () => <CheckoutPage />,
    variants: [{ path: "/checkout" }],
  },
  {
    id: "checkout-simple",
    render: () => <SimpleCODCheckout />,
    variants: [{ path: "/simple-checkout" }],
  },
  {
    id: "order-confirmation",
    render: () => <OrderConfirmationSimple />,
    variants: [{ path: "/order-confirmation/:orderId" }],
  },
  {
    id: "order-tracking",
    render: () => <OrderTracking />,
    variants: [
      { path: "/track-order" },
      { path: "/track-order/:orderId" },
    ],
  },
  {
    id: "my-orders",
    render: () => <UnifiedOrdersPage />,
    variants: [{ path: "/my-orders", authOnly: true }],
  },
  {
    id: "dashboard",
    render: () => <UnifiedDashboardPage />,
    variants: [
      { path: "/dashboard", roles: ["affiliate", "admin", "merchant"] },
      { path: "/merchant", roles: ["merchant", "admin"] },
    ],
  },
  {
    id: "affiliate-catalog",
    render: () => <UnifiedProductsPage />,
    variants: [
      { path: "/products-browser", roles: ["affiliate"] },
      { path: "/dashboard/products", roles: ["affiliate", "admin"] },
      { path: "/merchant/products", roles: ["merchant", "admin"] },
      { path: "/admin/products", roles: ["admin"] },
    ],
  },
  {
    id: "orders",
    render: () => <UnifiedOrdersPage />,
    variants: [
      { path: "/orders", roles: ["merchant", "admin"] },
      { path: "/dashboard/orders", roles: ["affiliate", "admin"] },
      { path: "/admin/orders", roles: ["admin"] },
    ],
  },
  {
    id: "commissions",
    render: () => <AffiliateCommissionsPage />,
    variants: [{ path: "/dashboard/commissions", roles: ["affiliate", "admin"] }],
  },
  {
    id: "shipments",
    render: () => <ShipmentManagement />,
    variants: [{ path: "/shipment-management", roles: ["merchant", "admin"] }],
  },
  {
    id: "analytics",
    render: () => <AnalyticsDashboard />,
    variants: [{ path: "/analytics", roles: ["merchant", "admin"] }],
  },
  {
    id: "sales-reports",
    render: () => <SalesReports />,
    variants: [{ path: "/sales-reports", roles: ["merchant", "admin"] }],
  },
  {
    id: "user-behavior",
    render: () => <UserBehaviorAnalytics />,
    variants: [{ path: "/user-behavior", roles: ["merchant", "admin"] }],
  },
  {
    id: "profile",
    render: () => <ProfilePage />,
    variants: [{ path: "/profile", authOnly: true }],
  },
  {
    id: "leaderboard",
    render: () => <LeaderboardPage />,
    variants: [{ path: "/leaderboard", authOnly: true }],
  },
  {
    id: "cms",
    render: () => <CMSManagement />,
    variants: [{ path: "/cms-management", roles: ["affiliate", "admin"] }],
  },
  {
    id: "banner-management",
    render: () => <BannerManagementPage />,
    variants: [{ path: "/banner-management/:storeId", roles: ["affiliate", "admin"] }],
  },
  {
    id: "marketing-suite",
    render: () => <PromotionsPage />,
    variants: [{ path: "/promotions", roles: ["affiliate", "merchant", "admin"] }],
  },
  {
    id: "advanced-marketing",
    render: () => <AdvancedMarketingPage />,
    variants: [{ path: "/advanced-marketing", roles: ["affiliate", "merchant", "admin"] }],
  },
  {
    id: "content-management",
    render: () => <ContentManagementPage />,
    variants: [{ path: "/content-management", roles: ["affiliate", "merchant", "admin"] }],
  },
  {
    id: "page-builder",
    render: () => <VisualPageBuilderPage />,
    variants: [{ path: "/page-builder", roles: ["affiliate", "merchant", "admin"] }],
  },
  {
    id: "ux-enhancements",
    render: () => <UXEnhancementsPage />,
    variants: [{ path: "/ux-enhancements", roles: ["affiliate", "merchant", "admin"] }],
  },
  {
    id: "theme-studio",
    render: () => <ThemeStudioPage />,
    variants: [{ path: "/theme-studio", roles: ["affiliate", "admin"] }],
  },
  {
    id: "theme-redirects",
    render: () => <RedirectToPrimaryStore to="store-themes" />,
    variants: [
      { path: "/store-themes", roles: ["affiliate", "admin"], allowInactive: true },
      { path: "/banner-management", roles: ["affiliate", "admin"], allowInactive: true },
    ],
  },
  {
    id: "store-theme-settings",
    render: () => <StoreThemeSettings />,
    variants: [{ path: "/store-themes/:storeId", roles: ["affiliate", "admin"] }],
  },
  {
    id: "payments",
    render: () => <PaymentDashboard />,
    variants: [{ path: "/payments", roles: ["merchant", "admin"] }],
  },
  {
    id: "invoices",
    render: () => <InvoiceManagement />,
    variants: [{ path: "/invoices", roles: ["merchant", "admin"] }],
  },
  {
    id: "payment-gateways",
    render: () => <PaymentGateways />,
    variants: [{ path: "/payment-gateways", roles: ["merchant", "admin"] }],
  },
  {
    id: "refunds",
    render: () => <RefundManagement />,
    variants: [{ path: "/refunds", roles: ["merchant", "admin"] }],
  },
  {
    id: "order-management",
    render: () => <OrderManagement />,
    variants: [{ path: "/order-management", roles: ["merchant", "admin"] }],
  },
  {
    id: "admin-orders",
    render: () => <AdminOrderManagement />,
    variants: [{ path: "/admin-orders", roles: "admin", fallback: "/dashboard" }],
  },
  {
    id: "affiliate-hub",
    render: () => <AffiliateHomePage />,
    variants: [
      { path: "/affiliate", roles: ["affiliate", "admin"] },
      { path: "/affiliate/home", roles: ["affiliate", "admin"] },
    ],
  },
  {
    id: "atlantis",
    render: () => <AtlantisSystem />,
    variants: [{ path: "/atlantis", roles: ["affiliate", "admin"] }],
  },
  {
    id: "atlantis-guide",
    render: () => <AtlantisGuide />,
    variants: [{ path: "/atlantis-guide", roles: ["affiliate", "admin"] }],
  },
  {
    id: "atlantis-chat",
    render: () => <AtlantisChatRooms />,
    variants: [{ path: "/atlantis/chat", roles: ["affiliate", "admin"] }],
  },
  {
    id: "atlantis-room",
    render: () => <AtlantisChat />,
    variants: [{ path: "/atlantis/chat/:roomId", roles: ["affiliate", "admin"] }],
  },
];

const PLATFORM_ROUTES: GuardedRouteConfig[] = ROUTE_DEFINITIONS.flatMap(({ render, variants }) =>
  variants.map((variant) => ({
    ...variant,
    render,
  })),
);

const ADMIN_CHILD_ROUTES: BasicRouteConfig[] = [
  { path: "dashboard", render: () => <UnifiedDashboardPage /> },
  { path: "users", render: () => <AdminUsers /> },
  { path: "analytics", render: () => <AdminAnalytics /> },
  { path: "reports", render: () => <AdminReports /> },
  { path: "permissions", render: () => <AdminPermissions /> },
  { path: "activity", render: () => <AdminActivity /> },
  { path: "payments", render: () => <PaymentDashboard /> },
  { path: "invoices", render: () => <InvoiceManagement /> },
  { path: "payment-gateways", render: () => <PaymentGateways /> },
  { path: "refunds", render: () => <RefundManagement /> },
  { path: "inventory", render: () => <Inventory /> },
  { path: "executive", render: () => <ExecutiveDashboard /> },
  { path: "security", render: () => <SecurityCenter /> },
  { path: "seo", render: () => <SEOManagement /> },
  { path: "monitoring", render: () => <MonitoringPage /> },
  { path: "marketing", render: () => <MarketingDashboard /> },
  { path: "settings", render: () => <AdminSettings /> },
  { path: "products", render: () => <ProductManagement /> },
  { path: "categories", render: () => <CategoryManagement /> },
  { path: "brands", render: () => <BrandManagement /> },
  { path: "analytics-dashboard", render: () => <AnalyticsDashboard /> },
  { path: "sales-reports", render: () => <SalesReports /> },
  { path: "user-behavior", render: () => <UserBehaviorAnalytics /> },
];

const renderGuardedRoute = ({ path, render, roles, fallback, allowInactive, authOnly }: GuardedRouteConfig) => {
  const element = render();
  const shouldProtect = authOnly || Boolean(roles);

  if (!shouldProtect) {
    return <Route key={path} path={path} element={element} />;
  }

  return (
    <Route
      key={path}
      path={path}
      element={
        <ProtectedRoute requiredRole={roles} fallback={fallback} allowInactive={allowInactive}>
          {element}
        </ProtectedRoute>
      }
    />
  );
};

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
                        <Suspense
                          fallback={
                            <div className="min-h-screen flex items-center justify-center">
                              <div className="text-center space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                                <p className="text-muted-foreground">جاري التحميل...</p>
                              </div>
                            </div>
                          }
                        >
                          <DomainManager>
                            <Routes>
                              <Route
                                path="/s/:store_slug"
                                element={
                                  <PublicStorefrontLayout>
                                    <PublicStorefront />
                                  </PublicStorefrontLayout>
                                }
                              />
                              <Route
                                path="/s/:store_slug/product/:product_id"
                                element={
                                  <PublicStorefrontLayout>
                                    <ProductDetailPage />
                                  </PublicStorefrontLayout>
                                }
                              />
                              <Route
                                path="/s/:store_slug/track-order"
                                element={
                                  <PublicStorefrontLayout>
                                    <OrderTrackingPage />
                                  </PublicStorefrontLayout>
                                }
                              />
                              <Route
                                path="/s/:store_slug/my-orders"
                                element={
                                  <PublicStorefrontLayout>
                                    <MyOrders />
                                  </PublicStorefrontLayout>
                                }
                              />
                              <Route
                                path="/store/:store_slug"
                                element={
                                  <PublicStorefrontLayout>
                                    <PublicStorefront />
                                  </PublicStorefrontLayout>
                                }
                              />
                              <Route
                                path="/store/app/*"
                                element={
                                  <StoreRouteGuard>
                                    <StoreLayout>
                                      <Routes>
                                        <Route path=":storeSlug" element={<AffiliateStoreFront />} />
                                        <Route path=":storeSlug/test" element={<StoreTestPage />} />
                                        <Route path=":storeSlug/auth" element={<StoreAuth />} />
                                        <Route path=":storeSlug/checkout" element={<StoreCheckout />} />
                                        <Route
                                          path=":storeSlug/order-confirmation/:orderId"
                                          element={<StoreOrderConfirmation />}
                                        />
                                      </Routes>
                                    </StoreLayout>
                                  </StoreRouteGuard>
                                }
                              />
                              <Route
                                path="/*"
                                element={
                                  <PlatformRouteGuard>
                                    <UnifiedLayout>
                                      <Routes>
                                        {PLATFORM_ROUTES.map(renderGuardedRoute)}
                                        {PLATFORM_REDIRECTS.map(({ from, to }) => (
                                          <Route
                                            key={from}
                                            path={from}
                                            element={<Navigate to={to} replace />}
                                          />
                                        ))}
                                        <Route
                                          path="/admin/*"
                                          element={
                                            <ProtectedRoute requiredRole="admin">
                                              <AdminLayout />
                                            </ProtectedRoute>
                                          }
                                        >
                                          <Route index element={<UnifiedDashboardPage />} />
                                          {ADMIN_CHILD_ROUTES.map(({ path, render }) => (
                                            <Route key={path} path={path} element={render()} />
                                          ))}
                                        </Route>
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                      </Routes>
                                    </UnifiedLayout>
                                  </PlatformRouteGuard>
                                }
                              />
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
