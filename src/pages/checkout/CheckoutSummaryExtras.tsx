import React from "react";

import { UnifiedCard, UnifiedBadge, UnifiedButton } from "@/components/design-system";

interface SummaryExtrasProps {
  affiliateStoreId?: string;
}

const CheckoutSummaryExtras: React.FC<SummaryExtrasProps> = ({ affiliateStoreId }) => {
  const supportHref = affiliateStoreId ? `/affiliate/store/${affiliateStoreId}` : "/profile";

  const openSupport = () => {
    if (typeof window === "undefined") return;
    window.open(supportHref, "_self");
  };

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <UnifiedCard className="space-y-[var(--spacing-md)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]" data-component="checkout-summary-extras">
      <div className="flex items-center gap-[var(--spacing-sm)]">
        <UnifiedBadge variant="glass">نصائح سريعة</UnifiedBadge>
        <span className="text-xs text-[color:var(--fg-muted)]">تأكد من بياناتك قبل الإرسال</span>
      </div>
      <ul className="list-disc space-y-[var(--spacing-sm)] pr-5 text-sm text-[color:var(--fg-muted)]">
        <li>يمكنك تتبع طلبك من صفحة التأكيد أو من لوحة الطلبات.</li>
        <li>في حال رغبتك بتعديل العنوان تواصل معنا خلال ساعتين من إنشاء الطلب.</li>
        <li>الدفع الإلكتروني والبطاقات سيتوفران قريباً.</li>
      </ul>
      <div className="flex flex-wrap items-center gap-[var(--spacing-sm)]">
        <UnifiedButton variant="glass" size="sm" onClick={openSupport}>
          مركز المساعدة
        </UnifiedButton>
        <UnifiedButton variant="ghost" size="sm" onClick={scrollToTop}>
          مراجعة البيانات
        </UnifiedButton>
      </div>
    </UnifiedCard>
  );
};

export default CheckoutSummaryExtras;
