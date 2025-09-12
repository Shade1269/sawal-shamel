import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DarkModeProvider } from "@/components/DarkModeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import Header from "@/components/common/Header";
import AuthForm from "@/components/auth/AuthForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import FastIndex from "./pages/FastIndex";
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
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminOrderManagement = lazy(() => import("./pages/AdminOrderManagement"));
const FastAuth = lazy(() => import("./pages/FastAuth"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const AboutPage = lazy(() => import("./pages/About"));
const CreateAdminPage = lazy(() => import("./pages/CreateAdmin"));

// Payment System Pages
const PaymentDashboard = lazy(() => import("./pages/PaymentDashboard"));
const InvoiceManagement = lazy(() => import("./pages/InvoiceManagement"));
const PaymentGateways = lazy(() => import("./pages/PaymentGateways"));
const RefundManagement = lazy(() => import("./pages/RefundManagement"));
const Inventory = lazy(() => import("./pages/Inventory"));
const ExecutiveDashboard = lazy(() => import("./pages/ExecutiveDashboard"));
const SecurityCenter = lazy(() => import("./pages/SecurityCenter"));
const MarketingDashboard = lazy(() => import("./pages/MarketingDashboard"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SupabaseAuthProvider>
          <FirebaseAuthProvider>
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
                      <Route path="/" element={<FastIndex />} />
                      <Route path="/home" element={<FastIndex />} />
                      <Route path="/index" element={<Index />} />
                      <Route path="/auth" element={<AuthForm />} />
                      <Route path="/fast-auth" element={<FastAuth />} />
                      <Route path="/login" element={<AuthForm />} />
                      <Route path="/signup" element={<AuthForm />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/create-admin" element={<CreateAdminPage />} />
                      <Route path="/store/:storeSlug" element={<AffiliateStoreFront />} />
                      
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
                      </Route>
                      
                      {/* Payment System Routes */}
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
                      
                      {/* Store Management */}
                      <Route 
                        path="/store-management" 
                        element={
                          <ProtectedRoute requiredRole={["merchant", "admin"]}>
                            <MerchantDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Admin Dashboard with different path */}
                      <Route 
                        path="/admin-dashboard" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Users Management */}
                      <Route 
                        path="/admin-users" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminUsers />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Catch all */}
                      <Route path="*" element={<FastIndex />} />
                    </Routes>
                  </Suspense>
                </div>
              </BrowserRouter>
              </UserDataProvider>
            </DarkModeProvider>
          </LanguageProvider>
      </FirebaseAuthProvider>
    </SupabaseAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
