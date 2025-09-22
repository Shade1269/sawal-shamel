import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Boxes, CheckCircle2, Package } from "lucide-react";

const migrationSteps = [
  "تطبيق ملفات SQL بالترتيب 01 → 05 داخل مجلد sql/",
  "ضبط المتغير DEFAULT_WAREHOUSE_CODE=MAIN أو أي رمز مناسب",
  "التأكد من نجاح وظائف الحجز والتثبيت عبر الاختبارات أو صفحة /inventory",
];

const benefits = [
  {
    icon: <Package className="h-4 w-4" />,
    title: "إدارة مخزون داخلية",
    description:
      "تعمل الطلبات المدفوعة الآن على خصم الكميات مباشرةً من الجداول الداخلية دون الاعتماد على Zoho.",
  },
  {
    icon: <Boxes className="h-4 w-4" />,
    title: "حجوزات موثوقة",
    description:
      "يتم إنشاء حجوزات لكل عنصر عند إنشاء الطلب، وتتحول إلى FULFILLED أو تُلغى آليًا بحسب حالة الدفع.",
  },
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "تدفق موحد",
    description:
      "جميع الخدمات تعتمد على جداول ecommerce_* مع فهارس وسياسات RLS جديدة لحماية البيانات.",
  },
];

export const ZohoIntegration: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تم إيقاف تكامل Zoho</CardTitle>
        <CardDescription>
          تم استبدال التكامل الخارجي بنظام مخزون داخلي كامل يعتمد على Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">
            إذا كنت ما زلت تحتفظ بإعدادات Zoho القديمة، فيُرجى إزالة المفاتيح والاعتماد على الوظائف
            المخزنة الجديدة. التحقق من حالة النظام يتم عبر صفحة <code className="text-xs bg-muted px-1 py-0.5 rounded">/inventory</code>
            ولوحة إدارة المهام التلقائية في لوحة الإدارة.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              دعم Zoho متوقف
            </Badge>
            <Badge variant="default" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              المخزون الداخلي مفعل
            </Badge>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="font-semibold text-sm">خطوات ضرورية بعد الدمج</h3>
          <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
            {migrationSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                {item.icon}
                <span className="font-medium text-sm">{item.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </section>
      </CardContent>
    </Card>
  );
};

export default ZohoIntegration;
