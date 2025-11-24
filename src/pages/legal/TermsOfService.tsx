import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { FileText, Users, ShoppingCart, CreditCard, AlertTriangle, Scale } from "lucide-react";

export default function TermsOfService() {
  const { language, direction } = useLanguage();

  const content = {
    ar: {
      title: "الشروط والأحكام",
      lastUpdated: "آخر تحديث: نوفمبر 2025",
      intro: "مرحباً بك في منصة أتلانتس للتجارة الإلكترونية. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية قبل استخدام خدماتنا.",
      sections: [
        {
          icon: Users,
          title: "1. قبول الشروط",
          content: [
            "بالدخول إلى المنصة أو استخدامها، فإنك توافق على الالتزام بهذه الشروط والأحكام",
            "إذا كنت لا توافق على أي من هذه الشروط، يجب عليك عدم استخدام المنصة",
            "نحتفظ بالحق في تعديل هذه الشروط في أي وقت، وستكون التعديلات سارية فور نشرها",
            "استمرارك في استخدام المنصة بعد التعديلات يعني قبولك لها",
          ]
        },
        {
          icon: FileText,
          title: "2. حسابات المستخدمين",
          content: [
            "يجب أن تكون بعمر 18 عاماً أو أكثر لإنشاء حساب",
            "أنت مسؤول عن الحفاظ على سرية معلومات حسابك",
            "أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك",
            "يجب عليك إبلاغنا فوراً بأي استخدام غير مصرح به لحسابك",
            "نحتفظ بالحق في تعليق أو إنهاء حسابك في حالة انتهاك الشروط",
            "يجب أن تكون جميع المعلومات المقدمة صحيحة ومحدثة",
          ]
        },
        {
          icon: ShoppingCart,
          title: "3. المنتجات والطلبات",
          content: [
            "جميع المنتجات معروضة بريال سعودي (SAR) شاملة ضريبة القيمة المضافة 15%",
            "نبذل قصارى جهدنا لعرض الأسعار الصحيحة، لكن قد تحدث أخطاء",
            "نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب",
            "الطلبات تخضع لتوفر المنتجات في المخزون",
            "سيتم تأكيد الطلب عبر البريد الإلكتروني أو الرسائل النصية",
            "لا يمكن تعديل أو إلغاء الطلب بعد تأكيده (راجع سياسة الاسترجاع)",
          ]
        },
        {
          icon: CreditCard,
          title: "4. الأسعار والدفع",
          content: [
            "جميع الأسعار شاملة ضريبة القيمة المضافة (15%)",
            "تكاليف الشحن تضاف عند الطلب وتختلف حسب المنطقة",
            "طرق الدفع المتاحة: بطاقات الائتمان، Apple Pay، الدفع عند الاستلام",
            "المدفوعات تتم عبر بوابات دفع آمنة ومرخصة من البنك المركزي السعودي",
            "في حالة فشل الدفع، سيتم إلغاء الطلب تلقائياً",
            "الفواتير الإلكترونية متوافقة مع متطلبات هيئة الزكاة والضريبة",
          ]
        },
        {
          icon: Scale,
          title: "5. حقوق الملكية الفكرية",
          content: [
            "جميع محتويات المنصة محمية بحقوق الملكية الفكرية",
            "الشعارات والعلامات التجارية والتصاميم ملك لمنصة أتلانتس",
            "لا يجوز نسخ أو إعادة نشر أي محتوى دون إذن كتابي",
            "المنتجات والعلامات التجارية للتجار تبقى ملكاً لهم",
            "انتهاك حقوق الملكية الفكرية يعرضك للمساءلة القانونية",
          ]
        },
        {
          icon: AlertTriangle,
          title: "6. المسؤولية والضمانات",
          content: [
            "المنصة تعمل كوسيط بين التجار والعملاء",
            "نبذل قصارى جهدنا لضمان جودة المنتجات لكن لا نضمن خلوها من العيوب",
            "مسؤولية المنتجات تقع على عاتق التجار في المقام الأول",
            "لا نتحمل مسؤولية الأضرار الناتجة عن سوء استخدام المنتجات",
            "لا نتحمل مسؤولية التأخير في التوصيل بسبب ظروف خارجة عن إرادتنا",
            "الحد الأقصى لمسؤوليتنا هو قيمة الطلب المدفوعة",
          ]
        },
        {
          icon: FileText,
          title: "7. سلوك المستخدم",
          content: [
            "يحظر استخدام المنصة لأغراض غير قانونية أو احتيالية",
            "يحظر نشر محتوى مسيء أو مخالف للآداب العامة",
            "يحظر محاولة اختراق أو تعطيل أنظمة المنصة",
            "يحظر إنشاء حسابات وهمية أو استخدام معلومات مزورة",
            "يحظر التلاعب بالأسعار أو العروض",
            "مخالفة هذه القواعد قد تؤدي إلى إيقاف حسابك واتخاذ إجراءات قانونية",
          ]
        },
      ],
      compliance: {
        title: "الامتثال القانوني",
        text: "هذه الشروط متوافقة مع:",
        items: [
          "نظام التجارة الإلكترونية السعودي",
          "نظام مكافحة الاحتيال المالي",
          "نظام حماية المستهلك",
          "نظام حماية البيانات الشخصية",
          "اللوائح التنفيذية لهيئة الزكاة والضريبة",
        ]
      },
      contact: {
        title: "التواصل",
        text: "لأي استفسارات حول هذه الشروط، يرجى التواصل معنا:",
        email: "legal@atlantis-platform.com",
        phone: "920000000",
      }
    },
    en: {
      title: "Terms and Conditions",
      lastUpdated: "Last Updated: November 2025",
      intro: "Welcome to Atlantis E-commerce Platform. By using this platform, you agree to comply with the following terms and conditions. Please read them carefully before using our services.",
      sections: [
        {
          icon: Users,
          title: "1. Acceptance of Terms",
          content: [
            "By accessing or using the platform, you agree to be bound by these terms and conditions",
            "If you do not agree with any of these terms, you must not use the platform",
            "We reserve the right to modify these terms at any time, and changes will be effective upon posting",
            "Your continued use of the platform after modifications constitutes acceptance",
          ]
        },
        {
          icon: FileText,
          title: "2. User Accounts",
          content: [
            "You must be 18 years or older to create an account",
            "You are responsible for maintaining the confidentiality of your account information",
            "You are responsible for all activities that occur under your account",
            "You must notify us immediately of any unauthorized use of your account",
            "We reserve the right to suspend or terminate your account for violating terms",
            "All information provided must be accurate and up-to-date",
          ]
        },
        {
          icon: ShoppingCart,
          title: "3. Products and Orders",
          content: [
            "All products are displayed in Saudi Riyal (SAR) including 15% VAT",
            "We strive to display accurate prices, but errors may occur",
            "We reserve the right to refuse or cancel any order for any reason",
            "Orders are subject to product availability",
            "Orders will be confirmed via email or SMS",
            "Orders cannot be modified or cancelled after confirmation (see Return Policy)",
          ]
        },
        {
          icon: CreditCard,
          title: "4. Pricing and Payment",
          content: [
            "All prices include VAT (15%)",
            "Shipping costs are added at checkout and vary by region",
            "Available payment methods: Credit cards, Apple Pay, Cash on Delivery",
            "Payments are processed through secure gateways licensed by SAMA",
            "In case of payment failure, the order will be automatically cancelled",
            "E-invoices comply with ZATCA requirements",
          ]
        },
        {
          icon: Scale,
          title: "5. Intellectual Property Rights",
          content: [
            "All platform content is protected by intellectual property rights",
            "Logos, trademarks, and designs are owned by Atlantis Platform",
            "No content may be copied or republished without written permission",
            "Product and merchant trademarks remain their property",
            "Violation of intellectual property rights may result in legal action",
          ]
        },
        {
          icon: AlertTriangle,
          title: "6. Liability and Warranties",
          content: [
            "The platform acts as an intermediary between merchants and customers",
            "We strive to ensure product quality but do not guarantee defect-free products",
            "Product liability primarily rests with merchants",
            "We are not liable for damages resulting from product misuse",
            "We are not responsible for delivery delays due to circumstances beyond our control",
            "Our maximum liability is limited to the order value paid",
          ]
        },
        {
          icon: FileText,
          title: "7. User Conduct",
          content: [
            "Using the platform for illegal or fraudulent purposes is prohibited",
            "Posting offensive or inappropriate content is prohibited",
            "Attempting to hack or disrupt platform systems is prohibited",
            "Creating fake accounts or using false information is prohibited",
            "Price or offer manipulation is prohibited",
            "Violating these rules may result in account suspension and legal action",
          ]
        },
      ],
      compliance: {
        title: "Legal Compliance",
        text: "These terms comply with:",
        items: [
          "Saudi E-Commerce Law",
          "Anti-Financial Fraud Law",
          "Consumer Protection Law",
          "Personal Data Protection Law",
          "ZATCA Executive Regulations",
        ]
      },
      contact: {
        title: "Contact",
        text: "For any inquiries about these terms, please contact us:",
        email: "legal@atlantis-platform.com",
        phone: "920000000",
      }
    }
  };

  const t = content[language as keyof typeof content];

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t.title}</h1>
          <p className="text-muted-foreground">{t.lastUpdated}</p>
        </div>

        {/* Introduction */}
        <Card className="bg-card text-card-foreground p-6 mb-8">
          <p className="text-lg leading-relaxed">{t.intro}</p>
        </Card>

        {/* Sections */}
        <div className="space-y-6">
          {t.sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card key={index} className="bg-card text-card-foreground p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mt-1">{section.title}</h2>
                </div>
                <ul className="space-y-3 mr-14">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        {/* Compliance */}
        <Card className="bg-card text-card-foreground p-6 mt-8">
          <h2 className="text-xl font-bold text-foreground mb-3">{t.compliance.title}</h2>
          <p className="text-muted-foreground mb-3">{t.compliance.text}</p>
          <ul className="space-y-2">
            {t.compliance.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Contact */}
        <Card className="bg-primary/5 border-primary/20 p-6 mt-6">
          <h2 className="text-2xl font-bold text-foreground mb-3">{t.contact.title}</h2>
          <p className="text-muted-foreground mb-4">{t.contact.text}</p>
          <div className="space-y-2">
            <p>
              <span className="text-muted-foreground">{language === 'ar' ? 'البريد الإلكتروني: ' : 'Email: '}</span>
              <a href={`mailto:${t.contact.email}`} className="text-primary hover:underline">
                {t.contact.email}
              </a>
            </p>
            <p>
              <span className="text-muted-foreground">{language === 'ar' ? 'الهاتف: ' : 'Phone: '}</span>
              <span className="text-foreground">{t.contact.phone}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
