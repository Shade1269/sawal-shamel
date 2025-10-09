import { isFeatureEnabled } from "@/config/featureFlags";
import AdminOrdersPage from "./AdminOrders";
import UnifiedAdminOrdersPage from "./UnifiedAdminOrders";

/**
 * Router للطلبات - يختار بين النظام القديم والموحد بناءً على Feature Flag
 */
export default function OrdersRouter() {
  const useUnified = isFeatureEnabled('USE_UNIFIED_ORDERS');
  
  return useUnified ? <UnifiedAdminOrdersPage /> : <AdminOrdersPage />;
}
