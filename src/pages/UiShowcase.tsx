import React, { useState } from "react";
import {
  UnifiedBadge,
  UnifiedButton,
  UnifiedCard,
  UnifiedInput,
} from "@/components/design-system";
import {
  Loader,
  Modal,
  Skeleton,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTrigger,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/ui";
import { CheckCircle2, Clock, Edit3, Eye, Trash2 } from "lucide-react";

const UiShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <main className="container mx-auto px-4 py-12 space-y-12">
      <section className="space-y-4">
        <div>
          <UnifiedBadge variant="glass">Glass UI Kit</UnifiedBadge>
          <h1 className="mt-2 text-3xl font-bold text-foreground">مجموعة عناصر الواجهة</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            العناصر التالية مبنية بالكامل على نظام التوكنز الزجاجي وتستجيب لحالات الواجهة المختلفة مع دعم كامل لحلقات
            التركيز وإمكانية الوصول.
          </p>
        </div>

        <Toolbar ariaLabel="تحكم سريع" justify="between" className="flex-wrap gap-3">
          <ToolbarGroup className="gap-2">
            <UnifiedButton size="sm" variant="ghost" leftIcon={<Eye className="h-4 w-4" />}>معاينة</UnifiedButton>
            <UnifiedButton size="sm" variant="outline" leftIcon={<Edit3 className="h-4 w-4" />}>تحرير</UnifiedButton>
            <UnifiedButton size="sm" variant="primary" leftIcon={<Trash2 className="h-4 w-4" />}>حذف</UnifiedButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup className="gap-2">
            <UnifiedBadge variant="success" leadingIcon={<CheckCircle2 className="h-3 w-3" />}>جاهز للنشر</UnifiedBadge>
            <UnifiedButton size="sm" variant="glass" onClick={() => setModalOpen(true)}>فتح نموذج</UnifiedButton>
          </ToolbarGroup>
        </Toolbar>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <UnifiedCard hover="lift" padding="lg">
          <h2 className="text-lg font-semibold mb-3">أزرار</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <UnifiedButton>إجراء أساسي</UnifiedButton>
              <UnifiedButton variant="outline">ثانوي</UnifiedButton>
              <UnifiedButton variant="ghost">شبح</UnifiedButton>
              <UnifiedButton variant="glass">زجاجي</UnifiedButton>
            </div>
            <div className="flex flex-wrap gap-2">
              <UnifiedButton size="sm">صغير</UnifiedButton>
              <UnifiedButton size="lg" rightIcon={<Clock className="h-4 w-4" />}>كبير</UnifiedButton>
              <UnifiedButton loading loadingText="جاري التحميل">تحميل</UnifiedButton>
            </div>
          </div>
        </UnifiedCard>

        <UnifiedCard padding="lg">
          <h2 className="text-lg font-semibold mb-3">حقول الإدخال</h2>
          <div className="space-y-3">
            <UnifiedInput placeholder="البريد الإلكتروني" leftIcon={<Eye className="h-4 w-4" />} />
            <UnifiedInput placeholder="تاريخ التسليم" rightIcon={<Clock className="h-4 w-4" />} />
            <UnifiedInput placeholder="قيمة غير صالحة" state="error" />
            <UnifiedInput placeholder="معطل" disabled />
          </div>
        </UnifiedCard>

        <UnifiedCard padding="lg">
          <h2 className="text-lg font-semibold mb-3">الشارات</h2>
          <div className="flex flex-wrap gap-2">
            <UnifiedBadge>أساسي</UnifiedBadge>
            <UnifiedBadge variant="secondary">ثانوي</UnifiedBadge>
            <UnifiedBadge variant="success" leadingIcon={<CheckCircle2 className="h-3 w-3" />}>نجاح</UnifiedBadge>
            <UnifiedBadge variant="warning">تحذير</UnifiedBadge>
            <UnifiedBadge variant="error">خطر</UnifiedBadge>
            <UnifiedBadge variant="secondary">هادئ</UnifiedBadge>
            <UnifiedBadge variant="glass" pill>زجاج</UnifiedBadge>
          </div>
        </UnifiedCard>

        <UnifiedCard padding="lg" className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">علامات التبويب</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList aria-label="تجربة المكونات">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="analytics">التحليلات</TabsTrigger>
              <TabsTrigger value="settings" disabled>الإعدادات</TabsTrigger>
            </TabsList>
            <TabsPanel value="overview">
              <p className="text-sm text-muted-foreground">
                اللوحة تستخدم تأثير الزجاج وتستجيب للتمركز الديناميكي مع حلقة تركيز واضحة.
              </p>
            </TabsPanel>
            <TabsPanel value="analytics">
              <div className="space-y-3">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton height={120} radius="var(--radius-lg)" />
              </div>
            </TabsPanel>
          </Tabs>
        </UnifiedCard>

        <UnifiedCard padding="lg">
          <h2 className="text-lg font-semibold mb-3">الحالات الهيكلية</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="85%" />
              <Skeleton variant="text" width="40%" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" width={48} height={48} />
              <div className="space-y-2 flex-1">
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="65%" />
              </div>
            </div>
            <Loader label="يجري مزامنة البيانات" subLabel="بقي القليل لإنهاء العملية" />
          </div>
        </UnifiedCard>
      </section>

      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="نموذج زجاجي"
        description="يمكن إغلاق النموذج بمفتاح الهروب أو بالنقر خارج المحتوى."
        footer={
          <>
            <UnifiedButton variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</UnifiedButton>
            <UnifiedButton variant="secondary" onClick={() => setModalOpen(false)}>تأكيد</UnifiedButton>
          </>
        }
      >
        <p className="text-sm text-muted-foreground mb-4">
          هذا النموذج يحترم توكنز التركيز ويدير الحلقة بشكل صحيح للحفاظ على المستخدم داخل النافذة حتى يتم الإغلاق.
        </p>
        <div className="space-y-3">
          <UnifiedInput placeholder="العنوان" />
          <UnifiedInput placeholder="وصف مختصر" />
        </div>
      </Modal>
    </main>
  );
};

export default UiShowcase;
