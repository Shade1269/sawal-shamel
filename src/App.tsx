import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DarkModeProvider } from "@/components/DarkModeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
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
const MerchantDashboard = lazy(() => import("./pages/MerchantDashboard"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const AffiliateStoreFront = lazy(() => import("./pages/AffiliateStoreFront"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FastAuth = lazy(() => import("./pages/FastAuth"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const AboutPage = lazy(() => import("./pages/About"));
const CreateAdminPage = lazy(() => import("./pages/CreateAdmin"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <LanguageProvider>
            <DarkModeProvider>
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
                      <Route path="/" element={<FastIndex />} />
                      <Route path="/auth" element={<AuthForm />} />
                      <Route path="/fast-auth" element={<FastAuth />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/create-admin" element={<CreateAdminPage />} />
                      <Route path="/store/:storeSlug" element={<AffiliateStoreFront />} />
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
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                      </Route>
                      
                      {/* Other Protected Routes */}
                      <Route 
                        path="/merchant" 
                        element={
                          <ProtectedRoute requiredRole="merchant">
                            <MerchantDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/affiliate" 
                        element={
                          <ProtectedRoute requiredRole="affiliate">
                            <AffiliateDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Catch all */}
                      <Route path="*" element={<FastIndex />} />
                    </Routes>
                  </Suspense>
                </div>
              </BrowserRouter>
            </DarkModeProvider>
          </LanguageProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
