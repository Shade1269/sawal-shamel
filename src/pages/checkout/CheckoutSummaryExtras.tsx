import React from "react";

import Card from "@/ui/Card";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";

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
    <Card className="space-y-[var(--spacing-md)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/90 p-[var(--spacing-xl)] shadow-[var(--shadow-glass-soft)]" data-component="checkout-summary-extras">
      <div className="flex items-center gap-[var(--spacing-sm)]">
        <Badge variant="glass">نصائح سريعة</Badge>
        <span className="text-xs text-[color:var(--fg-muted)]">تأكد من بياناتك قبل الإرسال</span>
      </div>
      <ul className="list-disc space-y-[var(--spacing-sm)] pr-5 text-sm text-[color:var(--fg-muted)]">
        <li>يمكنك تتبع طلبك من صفحة التأكيد أو من لوحة الطلبات.</li>
        <li>في حال رغبتك بتعديل العنوان تواصل معنا خلال ساعتين من إنشاء الطلب.</li>
        <li>الدفع الإلكتروني والبطاقات سيتوفران قريباً.</li>
      </ul>
      <div className="flex flex-wrap items-center gap-[var(--spacing-sm)]">
        <Button variant="glass" size="sm" onClick={openSupport}>
          مركز المساعدة
        </Button>
        <Button variant="ghost" size="sm" onClick={scrollToTop}>
          مراجعة البيانات
        </Button>
      </div>
    </Card>
  );
};

export default CheckoutSummaryExtras;
