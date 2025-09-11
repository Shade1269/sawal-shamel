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
import HomePage from "./pages/Home";
import { lazy, Suspense } from "react";

// Lazy load dashboard pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const MerchantDashboard = lazy(() => import("./pages/MerchantDashboard"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));

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
                      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthForm />} />
                      <Route path="/products" element={<ProductsPage />} />
                      
                      {/* Protected Routes */}
                      <Route 
                        path="/admin" 
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
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
                      
                      {/* Catch all - redirect to home */}
                      <Route path="*" element={<HomePage />} />
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
