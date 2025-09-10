import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider, useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { FirebaseAuthProvider, useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { DarkModeProvider } from "@/components/DarkModeProvider";
import AuthPage from "@/components/AuthPage";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import ChatRoom from "./pages/ChatRoom";
import Inventory from "./pages/Inventory";
import StoreManagementFirestore from "./pages/StoreManagementFirestore";
import StoreFront from "./pages/StoreFront";
import Cart from "./pages/Cart";
import Shipping from "./pages/Shipping";
import Payment from "./pages/Payment";
import OrderConfirmation from "./pages/OrderConfirmation";
import StoreAuth from "./pages/StoreAuth";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminPageLazy = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

const AppContent = () => {
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth();

  const loading = supabaseLoading || firebaseLoading;
  const user = firebaseUser || supabaseUser; // Firebase user takes priority

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chat/:channelId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/store-management" element={<ProtectedRoute><StoreManagementFirestore /></ProtectedRoute>} />
      <Route path="/store/:slug" element={<StoreFront />} />
      <Route path="/store/:slug/auth" element={<StoreAuth />} />
      <Route path="/store/:slug/cart" element={<Cart />} />
      <Route path="/store/:slug/shipping" element={<Shipping />} />
      <Route path="/store/:slug/payment" element={<Payment />} />
      <Route path="/store/:slug/order-confirmation/:orderId" element={<OrderConfirmation />} />
      <Route path="/admin" element={<ProtectedRoute><AdminPageLazy /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SupabaseAuthProvider>
          <FirebaseAuthProvider>
            <UserDataProvider>
              <DarkModeProvider>
                <BrowserRouter>
                  <Suspense fallback={<div className="p-6">جارٍ التحميل...</div>}>
                    <AppContent />
                  </Suspense>
                </BrowserRouter>
              </DarkModeProvider>
            </UserDataProvider>
          </FirebaseAuthProvider>
        </SupabaseAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
