import { Package } from 'lucide-react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from "@/components/design-system";

export function InventoryAutomation() {
  return (
    <section aria-labelledby="inventory-integration-admin">
      <UnifiedCard className="admin-card-enhanced">
        <UnifiedCardHeader className="pb-6">
          <UnifiedCardTitle id="inventory-integration-admin" className="text-3xl font-black admin-card">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl gradient-icon-wrapper flex items-center justify-center shadow-glow">
                <Package className="h-5 w-5 text-white" />
              </div>
              نظام المخزون الداخلي
            </div>
          </UnifiedCardTitle>
          <UnifiedCardDescription className="text-base admin-text">
            تم إيقاف أي تكاملات خارجية، وتعمل المنصة الآن على إدارة الحجوزات والحركات عبر الجداول الداخلية والوظائف المخزنة في
            Supabase.
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent className="space-y-6">
          <div className="gradient-card-success rounded-xl p-6">
            <p className="admin-text text-emerald-800 dark:text-emerald-200">
              تأكد من تطبيق الملف <code className="text-xs bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-md font-mono">sql/05_internal_inventory.sql</code> وضبط المتغير <code className="text-xs bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-md font-mono">DEFAULT_WAREHOUSE_CODE</code> ليشير إلى المستودع الأساسي.
            </p>
            <p className="admin-text text-emerald-700 dark:text-emerald-300 mt-3">
              بإمكانك مراقبة الحجوزات من جدول <code className="text-xs bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-md font-mono">inventory_reservations</code> والحركات الأخيرة من خلال واجهة <code className="text-xs bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-md font-mono">/inventory</code> الجديدة.
            </p>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
    </section>
  );
}
