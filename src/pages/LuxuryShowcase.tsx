import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ProductShowcase3D,
  SpecificationPanel,
  InteractiveDashboard,
  LuxuryCardV2,
  LuxuryCardHeader,
  LuxuryCardTitle,
  LuxuryCardDescription,
  LuxuryCardContent,
  LuxuryCardFooter
} from "@/components/luxury";
import {
  Palette,
  Cpu,
  Gauge,
  Shield,
  Award,
  Package,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Zap,
  Plus,
  FileText,
  Settings
} from "lucide-react";

export default function LuxuryShowcase() {
  const [theme, setTheme] = useState<string>(
    document.documentElement.dataset.theme || "default"
  );

  const applyTheme = (themeId: string) => {
    document.documentElement.dataset.theme = themeId;
    setTheme(themeId);
  };

  const sampleProduct = {
    id: "1",
    title: "ساعة Ferrari الفاخرة",
    description: "ساعة فاخرة بتصميم Ferrari الأيقوني مع حركة سويسرية دقيقة",
    price_sar: 12500,
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
      "https://images.unsplash.com/photo-1495856458515-0637185db551?w=800"
    ],
    category: "ساعات فاخرة",
    rating: 4.8,
    reviews: 127,
    stock: 8
  };

  const specificationGroups = [
    {
      id: "performance",
      title: "الأداء والمواصفات",
      icon: Gauge,
      defaultExpanded: true,
      specs: [
        { label: "الحركة", value: "سويسرية أوتوماتيكية", icon: Cpu, highlight: true },
        { label: "احتياطي الطاقة", value: "48 ساعة", progress: 80 },
        { label: "مقاومة الماء", value: "100 متر", badge: "معتمد" },
        { label: "التردد", value: "28,800 vph" }
      ]
    },
    {
      id: "materials",
      title: "المواد والبناء",
      icon: Shield,
      specs: [
        { label: "العلبة", value: "تيتانيوم مصقول", highlight: true },
        { label: "الزجاج", value: "ياقوت مضاد للخدش", badge: "فاخر" },
        { label: "الحزام", value: "جلد إيطالي أصلي" },
        { label: "الإبزيم", value: "فولاذ مقاوم للصدأ" }
      ]
    },
    {
      id: "certifications",
      title: "الشهادات والضمان",
      icon: Award,
      specs: [
        { label: "الضمان الدولي", value: "5 سنوات", highlight: true, badge: "ممتد" },
        { label: "شهادة الأصالة", value: "متضمنة" },
        { label: "الصيانة المجانية", value: "سنتان" }
      ]
    }
  ];

  const dashboardWidgets = [
    {
      id: "sales",
      title: "إجمالي المبيعات",
      value: "847,350",
      change: 12.5,
      changeType: "increase" as const,
      icon: DollarSign,
      description: "ريال سعودي",
      progress: 75,
      target: 1000000,
      trend: [45, 52, 48, 65, 72, 68, 85],
      color: "bg-green-600"
    },
    {
      id: "orders",
      title: "الطلبات الجديدة",
      value: 234,
      change: 8.2,
      changeType: "increase" as const,
      icon: ShoppingCart,
      description: "هذا الشهر",
      trend: [30, 35, 40, 38, 45, 48, 52],
      color: "bg-blue-600"
    },
    {
      id: "customers",
      title: "العملاء النشطون",
      value: "1,847",
      change: -2.4,
      changeType: "decrease" as const,
      icon: Users,
      description: "مستخدم",
      progress: 62,
      color: "bg-purple-600"
    },
    {
      id: "views",
      title: "المشاهدات",
      value: "52.8K",
      change: 15.8,
      changeType: "increase" as const,
      icon: Eye,
      description: "هذا الأسبوع",
      trend: [120, 145, 165, 152, 180, 195, 210],
      color: "bg-yellow-600"
    },
    {
      id: "products",
      title: "المنتجات الفعالة",
      value: 156,
      changeType: "neutral" as const,
      icon: Package,
      description: "متاح للبيع",
      progress: 85,
      target: 200,
      color: "bg-red-600"
    },
    {
      id: "conversion",
      title: "معدل التحويل",
      value: "3.24%",
      change: 0.8,
      changeType: "increase" as const,
      icon: TrendingUp,
      description: "من الزيارات",
      progress: 32,
      color: "bg-indigo-600"
    }
  ];

  const quickActions = [
    {
      id: "add-product",
      title: "إضافة منتج",
      description: "منتج جديد للمتجر",
      icon: Plus,
      onClick: () => alert("إضافة منتج"),
      color: "bg-green-600"
    },
    {
      id: "view-reports",
      title: "عرض التقارير",
      description: "تحليلات مفصلة",
      icon: FileText,
      onClick: () => alert("عرض التقارير"),
      color: "bg-blue-600"
    },
    {
      id: "manage-orders",
      title: "إدارة الطلبات",
      description: "طلبات قيد المعالجة",
      icon: ShoppingCart,
      onClick: () => alert("إدارة الطلبات"),
      color: "bg-purple-600"
    },
    {
      id: "settings",
      title: "الإعدادات",
      description: "تخصيص المتجر",
      icon: Settings,
      onClick: () => alert("الإعدادات"),
      color: "bg-slate-600"
    }
  ];

  return (
    <div className="min-h-screen gradient-page-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Palette className="h-10 w-10 text-red-500" />
              عرض المكونات الفاخرة
            </h1>
            <p className="text-slate-300">
              مكونات Ferrari الفاخرة - المرحلة 2 من تطوير الواجهات
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={theme === "default" ? "default" : "outline"}
              onClick={() => applyTheme("default")}
              size="sm"
            >
              افتراضي
            </Button>
            <Button
              variant={theme === "luxury" ? "default" : "outline"}
              onClick={() => applyTheme("luxury")}
              size="sm"
            >
              فاخر
            </Button>
            <Button
              variant={theme === "ferrari" ? "default" : "outline"}
              onClick={() => applyTheme("ferrari")}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              Ferrari
            </Button>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-red-600 text-white">1</Badge>
            <h2 className="text-2xl font-bold text-white">
              ProductShowcase3D - عرض منتج ثلاثي الأبعاد
            </h2>
          </div>
          <p className="text-slate-300 text-sm">
            عارض منتجات فاخر مع تأثيرات CSS 3D، carousel للصور، وتكبير تفاعلي
          </p>
          <ProductShowcase3D
            product={sampleProduct}
            onAddToCart={() => alert("تم الإضافة للسلة")}
            onToggleFavorite={() => alert("تم الإضافة للمفضلة")}
            onShare={() => alert("مشاركة المنتج")}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-red-600 text-white">2</Badge>
            <h2 className="text-2xl font-bold text-white">
              SpecificationPanel - لوحة المواصفات التقنية
            </h2>
          </div>
          <p className="text-slate-300 text-sm">
            لوحة مواصفات قابلة للتوسيع مع تصميم Ferrari glass morphism
          </p>
          <SpecificationPanel
            title="المواصفات التقنية الكاملة"
            description="جميع التفاصيل التقنية والشهادات"
            groups={specificationGroups}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-red-600 text-white">3</Badge>
            <h2 className="text-2xl font-bold text-white">
              InteractiveDashboard - لوحة التحكم التفاعلية
            </h2>
          </div>
          <p className="text-slate-300 text-sm">
            لوحة تحكم متقدمة مع widgets، مقاييس مباشرة، وإجراءات سريعة
          </p>
          <InteractiveDashboard
            title="لوحة التحكم الرئيسية"
            subtitle="مقاييس وإحصائيات مباشرة"
            widgets={dashboardWidgets}
            quickActions={quickActions}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-red-600 text-white">4</Badge>
            <h2 className="text-2xl font-bold text-white">
              LuxuryCardV2 - البطاقات الفاخرة المحسنة
            </h2>
          </div>
          <p className="text-slate-300 text-sm">
            بطاقات محسنة بتأثيرات Ferrari glass morphism متقدمة
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LuxuryCardV2 variant="default">
              <LuxuryCardHeader>
                <LuxuryCardTitle>البطاقة الافتراضية</LuxuryCardTitle>
                <LuxuryCardDescription>
                  تصميم Ferrari الكلاسيكي مع Navy Blue وFerrari Red
                </LuxuryCardDescription>
              </LuxuryCardHeader>
              <LuxuryCardContent>
                <p className="text-slate-300">
                  بطاقة فاخرة مع glass morphism وتأثيرات glow عند التمرير. مثالية لعرض المحتوى الرئيسي.
                </p>
              </LuxuryCardContent>
              <LuxuryCardFooter>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Zap className="h-4 w-4 ml-2" />
                  إجراء رئيسي
                </Button>
              </LuxuryCardFooter>
            </LuxuryCardV2>

            <LuxuryCardV2 variant="glass" hover="scale">
              <LuxuryCardHeader>
                <LuxuryCardTitle>البطاقة الزجاجية</LuxuryCardTitle>
                <LuxuryCardDescription>
                  Glass morphism متقدم مع شفافية عالية
                </LuxuryCardDescription>
              </LuxuryCardHeader>
              <LuxuryCardContent>
                <p className="text-slate-300">
                  تأثير زجاجي مع backdrop-blur قوي. مناسبة للعناصر الثانوية والمعلومات الإضافية.
                </p>
              </LuxuryCardContent>
              <LuxuryCardFooter>
                <Button variant="outline" className="w-full">
                  استكشاف المزيد
                </Button>
              </LuxuryCardFooter>
            </LuxuryCardV2>

            <LuxuryCardV2 variant="glow" hover="both">
              <LuxuryCardHeader>
                <LuxuryCardTitle>بطاقة التوهج</LuxuryCardTitle>
                <LuxuryCardDescription>
                  تأثير Ferrari glow نابض مع رسوم متحركة
                </LuxuryCardDescription>
              </LuxuryCardHeader>
              <LuxuryCardContent>
                <p className="text-slate-300">
                  توهج Ferrari Red مستمر مع رسوم متحركة. مثالية للعناصر المميزة والعروض الخاصة.
                </p>
              </LuxuryCardContent>
              <LuxuryCardFooter>
                <Button className="w-full gradient-danger">
                  عرض حصري
                </Button>
              </LuxuryCardFooter>
            </LuxuryCardV2>

            <LuxuryCardV2 variant="metallic" hover="lift">
              <LuxuryCardHeader>
                <LuxuryCardTitle>البطاقة المعدنية</LuxuryCardTitle>
                <LuxuryCardDescription>
                  تأثير معدني مع shimmer animation
                </LuxuryCardDescription>
              </LuxuryCardHeader>
              <LuxuryCardContent>
                <p className="text-slate-300">
                  تدرج معدني مع تأثير shimmer. رائعة للمحتوى الفاخر والمنتجات الراقية.
                </p>
              </LuxuryCardContent>
              <LuxuryCardFooter>
                <Button variant="secondary" className="w-full">
                  تفاصيل أكثر
                </Button>
              </LuxuryCardFooter>
            </LuxuryCardV2>
          </div>
        </section>

        <div className="text-center py-8 text-slate-400 text-sm">
          <p>المرحلة 2: مكونات Dashboard الفاخرة - تم التنفيذ ✨</p>
        </div>
      </div>
    </div>
  );
}
