import React, { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Input,
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
          <Badge variant="glass">Glass UI Kit</Badge>
          <h1 className="mt-2 text-3xl font-bold text-foreground">مجموعة عناصر الواجهة</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            العناصر التالية مبنية بالكامل على نظام التوكنز الزجاجي وتستجيب لحالات الواجهة المختلفة مع دعم كامل لحلقات
            التركيز وإمكانية الوصول.
          </p>
        </div>

        <Toolbar ariaLabel="تحكم سريع" justify="between" className="flex-wrap gap-3">
          <ToolbarGroup className="gap-2">
            <Button size="sm" variant="ghost" leftIcon={<Eye className="h-4 w-4" />}>معاينة</Button>
            <Button size="sm" variant="outline" leftIcon={<Edit3 className="h-4 w-4" />}>تحرير</Button>
            <Button size="sm" variant="danger" leftIcon={<Trash2 className="h-4 w-4" />}>حذف</Button>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup className="gap-2">
            <Badge variant="success" leadingIcon={<CheckCircle2 className="h-3 w-3" />}>جاهز للنشر</Badge>
            <Button size="sm" variant="glass" onClick={() => setModalOpen(true)}>فتح نموذج</Button>
          </ToolbarGroup>
        </Toolbar>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card interactive padding="lg">
          <h2 className="text-lg font-semibold mb-3">أزرار</h2>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button>إجراء أساسي</Button>
              <Button variant="outline">ثانوي</Button>
              <Button variant="ghost">شبح</Button>
              <Button variant="glass">زجاجي</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">صغير</Button>
              <Button size="lg" rightIcon={<Clock className="h-4 w-4" />}>كبير</Button>
              <Button loading loadingText="جاري التحميل">تحميل</Button>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-3">حقول الإدخال</h2>
          <div className="space-y-3">
            <Input placeholder="البريد الإلكتروني" leadingIcon={<Eye className="h-4 w-4" />} />
            <Input placeholder="تاريخ التسليم" trailingIcon={<Clock className="h-4 w-4" />} />
            <Input placeholder="قيمة غير صالحة" invalid />
            <Input placeholder="معطل" disabled />
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-3">الشارات</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>أساسي</Badge>
            <Badge variant="secondary">ثانوي</Badge>
            <Badge variant="success" leadingIcon={<CheckCircle2 className="h-3 w-3" />}>نجاح</Badge>
            <Badge variant="warning">تحذير</Badge>
            <Badge variant="danger">خطر</Badge>
            <Badge variant="muted">هادئ</Badge>
            <Badge variant="glass" pill>زجاج</Badge>
          </div>
        </Card>

        <Card padding="lg" className="md:col-span-2">
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
        </Card>

        <Card padding="lg">
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
        </Card>
      </section>

      <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="نموذج زجاجي"
        description="يمكن إغلاق النموذج بمفتاح الهروب أو بالنقر خارج المحتوى."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>تأكيد</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground mb-4">
          هذا النموذج يحترم توكنز التركيز ويدير الحلقة بشكل صحيح للحفاظ على المستخدم داخل النافذة حتى يتم الإغلاق.
        </p>
        <div className="space-y-3">
          <Input placeholder="العنوان" />
          <Input placeholder="وصف مختصر" />
        </div>
      </Modal>
    </main>
  );
};

export default UiShowcase;
