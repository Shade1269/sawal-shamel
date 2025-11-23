import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  const { language, direction } = useLanguage();

  const content = {
    ar: {
      title: "سياسة الخصوصية",
      lastUpdated: "آخر تحديث: نوفمبر 2025",
      intro: "نحن في منصة أتلانتس ملتزمون بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحماية معلوماتك الشخصية وفقاً لنظام حماية البيانات الشخصية في المملكة العربية السعودية.",
      sections: [
        {
          icon: Database,
          title: "1. المعلومات التي نجمعها",
          content: [
            "المعلومات الشخصية: الاسم، رقم الهاتف، البريد الإلكتروني، العنوان",
            "معلومات الحساب: اسم المستخدم، كلمة المرور المشفرة، تفضيلات الحساب",
            "معلومات الطلبات: تفاصيل الطلبات، سجل المشتريات، طرق الدفع",
            "البيانات التقنية: عنوان IP، نوع المتصفح، نظام التشغيل، سجلات الاستخدام",
            "معلومات الموقع: موقعك الجغرافي لتحسين خدمة التوصيل",
          ]
        },
        {
          icon: Eye,
          title: "2. كيف نستخدم معلوماتك",
          content: [
            "معالجة وتنفيذ طلباتك والمدفوعات",
            "التواصل معك بخصوص طلباتك والخدمات",
            "تحسين تجربتك على المنصة وتخصيص المحتوى",
            "إرسال إشعارات العروض والتحديثات (يمكنك إلغاء الاشتراك)",
            "كشف ومنع الاحتيال والأنشطة المشبوهة",
            "الامتثال للمتطلبات القانونية والتنظيمية",
          ]
        },
        {
          icon: Lock,
          title: "3. حماية معلوماتك",
          content: [
            "تشفير SSL/TLS لجميع البيانات المنقولة",
            "تشفير البيانات الحساسة في قواعد البيانات",
            "مصادقة ثنائية العامل للحسابات",
            "قيود صارمة على الوصول إلى البيانات الشخصية",
            "مراجعات أمنية دورية واختبارات اختراق",
            "النسخ الاحتياطي المنتظم وخطط استرداد البيانات",
          ]
        },
        {
          icon: UserCheck,
          title: "4. مشاركة المعلومات",
          content: [
            "شركات الشحن: لتوصيل طلباتك فقط",
            "بوابات الدفع: لمعالجة المدفوعات بشكل آمن",
            "مقدمو الخدمات: الذين يساعدوننا في تشغيل المنصة",
            "الجهات الحكومية: عند الطلب القانوني فقط",
            "لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة أبداً",
          ]
        },
        {
          icon: Shield,
          title: "5. حقوقك",
          content: [
            "الوصول إلى بياناتك الشخصية ومراجعتها",
            "تصحيح أو تحديث معلوماتك",
            "حذف حسابك وبياناتك (مع مراعاة الالتزامات القانونية)",
            "الاعتراض على معالجة بياناتك في حالات معينة",
            "تحميل نسخة من بياناتك الشخصية",
            "إلغاء الاشتراك في الرسائل التسويقية",
          ]
        },
        {
          icon: Mail,
          title: "6. ملفات تعريف الارتباط (Cookies)",
          content: [
            "نستخدم ملفات تعريف الارتباط لتحسين تجربتك",
            "ملفات تعريف ضرورية: للحفاظ على جلستك وأمان الحساب",
            "ملفات تحليلية: لفهم كيفية استخدام المنصة",
            "ملفات تسويقية: لعرض إعلانات ملائمة (يمكن تعطيلها)",
            "يمكنك إدارة تفضيلات ملفات تعريف الارتباط من إعدادات المتصفح",
          ]
        },
      ],
      contact: {
        title: "التواصل معنا",
        text: "إذا كان لديك أي أسئلة حول سياسة الخصوصية أو ترغب في ممارسة حقوقك، يرجى التواصل معنا:",
        email: "privacy@atlantis-platform.com",
        phone: "920000000",
      },
      compliance: {
        title: "الامتثال القانوني",
        text: "هذه السياسة متوافقة مع:",
        items: [
          "نظام حماية البيانات الشخصية في المملكة العربية السعودية",
          "نظام التجارة الإلكترونية السعودي",
          "اللائحة التنفيذية لنظام حماية البيانات الشخصية",
        ]
      }
    },
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: November 2025",
      intro: "At Atlantis Platform, we are committed to protecting your privacy and personal data. This policy explains how we collect, use, and protect your personal information in accordance with Saudi Arabia's Personal Data Protection Law.",
      sections: [
        {
          icon: Database,
          title: "1. Information We Collect",
          content: [
            "Personal Information: Name, phone number, email, address",
            "Account Information: Username, encrypted password, account preferences",
            "Order Information: Order details, purchase history, payment methods",
            "Technical Data: IP address, browser type, operating system, usage logs",
            "Location Information: Your geographic location to improve delivery service",
          ]
        },
        {
          icon: Eye,
          title: "2. How We Use Your Information",
          content: [
            "Process and fulfill your orders and payments",
            "Communicate with you about your orders and services",
            "Improve your experience and personalize content",
            "Send promotional notifications and updates (you can unsubscribe)",
            "Detect and prevent fraud and suspicious activities",
            "Comply with legal and regulatory requirements",
          ]
        },
        {
          icon: Lock,
          title: "3. Protecting Your Information",
          content: [
            "SSL/TLS encryption for all transmitted data",
            "Encryption of sensitive data in databases",
            "Two-factor authentication for accounts",
            "Strict access controls to personal data",
            "Regular security audits and penetration testing",
            "Regular backups and data recovery plans",
          ]
        },
        {
          icon: UserCheck,
          title: "4. Information Sharing",
          content: [
            "Shipping companies: For order delivery only",
            "Payment gateways: For secure payment processing",
            "Service providers: Who help us operate the platform",
            "Government authorities: Upon legal request only",
            "We never sell or rent your personal information to third parties",
          ]
        },
        {
          icon: Shield,
          title: "5. Your Rights",
          content: [
            "Access and review your personal data",
            "Correct or update your information",
            "Delete your account and data (subject to legal obligations)",
            "Object to data processing in certain cases",
            "Download a copy of your personal data",
            "Unsubscribe from marketing messages",
          ]
        },
        {
          icon: Mail,
          title: "6. Cookies",
          content: [
            "We use cookies to improve your experience",
            "Essential cookies: To maintain your session and account security",
            "Analytics cookies: To understand platform usage",
            "Marketing cookies: To show relevant ads (can be disabled)",
            "You can manage cookie preferences from your browser settings",
          ]
        },
      ],
      contact: {
        title: "Contact Us",
        text: "If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:",
        email: "privacy@atlantis-platform.com",
        phone: "920000000",
      },
      compliance: {
        title: "Legal Compliance",
        text: "This policy complies with:",
        items: [
          "Saudi Arabia's Personal Data Protection Law",
          "Saudi E-Commerce Law",
          "Personal Data Protection Executive Regulations",
        ]
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
            <Shield className="h-8 w-8 text-primary" />
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

        {/* Contact Section */}
        <Card className="bg-primary/5 border-primary/20 p-6 mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">{t.contact.title}</h2>
          <p className="text-muted-foreground mb-4">{t.contact.text}</p>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <a href={`mailto:${t.contact.email}`} className="text-primary hover:underline">
                {t.contact.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-foreground">{t.contact.phone}</span>
            </p>
          </div>
        </Card>

        {/* Compliance */}
        <Card className="bg-card text-card-foreground p-6 mt-6">
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
      </div>
    </div>
  );
}
