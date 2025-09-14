import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DarkModeProvider } from "@/shared/components/DarkModeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import Header from "@/components/common/Header";
import { AuthPage } from "@/features/auth";
import { ProtectedRoute } from "@/shared/components/ProtectedRoute";
import Index from "./pages/Index";

import AdminLayout from "@/layouts/AdminLayout";
import { lazy, Suspense } from "react";

// Lazy load dashboard pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminPermissions = lazy(() => import("./pages/admin/AdminPermissions"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));
const MerchantDashboard = lazy(() => import("./pages/MerchantDashboard"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const AffiliateStoreFront = lazy(() => import("./pages/AffiliateStoreFront"));
// Direct imports for store components to avoid lazy loading issues
import StoreCheckout from "./pages/StoreCheckout";
import StoreOrderConfirmation from "./pages/StoreOrderConfirmation";
import StoreAuth from "./pages/StoreAuth";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminOrderManagement = lazy(() => import("./pages/AdminOrderManagement"));
// FastAuth removed
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const AboutPage = lazy(() => import("./pages/About"));
const CreateAdminPage = lazy(() => import("./pages/CreateAdmin"));

// E-commerce Pages
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
const MarketingDashboard = lazy(() => import("./pages/MarketingDashboard"));
const ComprehensiveAdminPanel = lazy(() => import("./pages/ComprehensiveAdminPanel"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AtlantisSystem = lazy(() => import("./pages/AtlantisSystem"));
const AtlantisGuide = lazy(() => import("./pages/AtlantisGuide"));
const AtlantisChat = lazy(() => import("@/features/chat").then(m => ({ default: m.AtlantisChat })));
const AtlantisChatRooms = lazy(() => import("@/features/chat").then(m => ({ default: m.AtlantisChatRooms })));

// Product Management Pages
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const ProductsBrowser = lazy(() => import("./pages/ProductsBrowser"));
const CategoryManagement = lazy(() => import("./pages/CategoryManagement"));
const BrandManagement = lazy(() => import("./pages/BrandManagement"));

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
                  <BrowserRouter>
                  <div className="min-h-screen bg-gradient-persian-bg">
                    <Header />
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">جاري التحميل...</p>
                        </div>
                      </div>
                    }>
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
          
                        {/* Store Routes */}
                        <Route path="/store/:storeSlug" element={<AffiliateStoreFront />} />
                        <Route path="/store/:storeSlug/auth" element={<StoreAuth />} />
                        <Route path="/store/:storeSlug/checkout" element={<StoreCheckout />} />
                        <Route path="/store/:storeSlug/order-confirmation/:orderId" element={<StoreOrderConfirmation />} />
                       
                       {/* Protected Browser */}
                       <Route path="/products-browser" element={
                         <ProtectedRoute requiredRole={["affiliate"]}>
                           <ProductsBrowser />
                         </ProtectedRoute>
                       } />
                      
                      {/* E-commerce Routes */}
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/simple-checkout" element={<SimpleCODCheckout />} />
                      <Route path="/order-confirmation/:orderId" element={<OrderConfirmationSimple />} />
                      <Route path="/track-order" element={<OrderTracking />} />
                      <Route path="/track-order/:orderId" element={<OrderTracking />} />
                      <Route path="/shipment-management" element={
                        <ProtectedRoute requiredRole={["merchant", "admin"]}>
                          <ShipmentManagement />
                        </ProtectedRoute>
                      } />
                      
                      {/* Analytics Routes */}
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
                      
                      {/* Protected Routes */}
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } />
                      
                      {/* Unified Dashboard */}
                      <Route 
                        path="/dashboard" 
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
        <Route path="marketing" element={<MarketingDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="brands" element={<BrandManagement />} />
        <Route path="analytics-dashboard" element={<AnalyticsDashboard />} />
        <Route path="sales-reports" element={<SalesReports />} />
        <Route path="user-behavior" element={<UserBehaviorAnalytics />} />
                      </Route>
                      
                       {/* Merchant Routes */}
                       <Route 
                         path="/merchant" 
                         element={
                           <ProtectedRoute requiredRole={["merchant", "admin"]}>
                             <MerchantDashboard />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/merchant-dashboard" 
                         element={
                           <ProtectedRoute requiredRole={["merchant", "admin"]}>
                             <MerchantDashboard />
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
                      
                        {/* Affiliate Routes */}
                        <Route 
                          path="/affiliate" 
                          element={
                            <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                              <AffiliateDashboard />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/affiliate-dashboard" 
                          element={
                            <ProtectedRoute requiredRole={["affiliate", "admin"]}>
                              <AffiliateDashboard />
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
                      
                      {/* Catch all */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </div>
              </BrowserRouter>
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
