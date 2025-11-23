import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Truck, MapPin, Clock, DollarSign, Package, AlertCircle } from "lucide-react";

export default function ShippingPolicy() {
  const { language, direction } = useLanguage();

  const content = {
    ar: {
      title: "سياسة الشحن والتوصيل",
      lastUpdated: "آخر تحديث: نوفمبر 2025",
      intro: "نحرص في منصة أتلانتس على توصيل طلباتك بأسرع وقت وبأفضل جودة. تعرف على سياسة الشحن والتوصيل لدينا:",
      sections: [
        {
          icon: MapPin,
          title: "1. مناطق التوصيل",
          content: [
            "نغطي جميع مناطق المملكة العربية السعودية",
            "التوصيل متاح لجميع المدن الرئيسية والمحافظات",
            "المناطق النائية قد تتطلب وقتاً إضافياً (1-2 يوم)",
            "نعمل مع شركات شحن موثوقة: SMSA، Aramex، Saudi Post",
          ]
        },
        {
          icon: Clock,
          title: "2. مدة التوصيل",
          content: [
            "الرياض وجدة والدمام: 1-2 يوم عمل",
            "المدن الرئيسية الأخرى: 2-4 أيام عمل",
            "المناطق النائية: 3-5 أيام عمل",
            "التوصيل السريع (نفس اليوم): متاح في الرياض وجدة والدمام (مقابل رسوم إضافية)",
            "الطلبات المؤكدة قبل الساعة 12 ظهراً تشحن في نفس اليوم",
            "الطلبات بعد الساعة 12 ظهراً تشحن في اليوم التالي",
            "لا يتم الشحن أيام الجمعة والعطلات الرسمية",
          ]
        },
        {
          icon: DollarSign,
          title: "3. تكلفة الشحن",
          content: [
            "الشحن العادي:",
            "• داخل المدن الرئيسية: 15 ريال",
            "• خارج المدن الرئيسية: 25 ريال",
            "• المناطق النائية: 35 ريال",
            "",
            "الشحن المجاني:",
            "• للطلبات بقيمة 200 ريال فأكثر داخل المدن الرئيسية",
            "• للطلبات بقيمة 300 ريال فأكثر لباقي المناطق",
            "",
            "الشحن السريع (نفس اليوم):",
            "• 40 ريال داخل الرياض وجدة والدمام",
            "• متاح للطلبات المؤكدة قبل الساعة 10 صباحاً",
          ]
        },
        {
          icon: Package,
          title: "4. تعبئة وتغليف المنتجات",
          content: [
            "جميع المنتجات تعبأ بعناية فائقة لضمان وصولها سليمة",
            "نستخدم مواد تغليف عالية الجودة",
            "المنتجات الهشة والقابلة للكسر تعبأ بحماية إضافية",
            "العبوة تحتوي على الفاتورة الإلكترونية مع رمز QR",
            "يتم وضع ملصق \"هش - احذر\" على الطرود التي تحتوي منتجات هشة",
          ]
        },
        {
          icon: Truck,
          title: "5. تتبع الشحنة",
          content: [
            "سيصلك رقم تتبع الشحنة عبر رسالة نصية (SMS) وبريد إلكتروني",
            "يمكنك تتبع طلبك من صفحة \"طلباتي\" في حسابك",
            "سيصلك تحديثات فورية عن حالة الشحنة:",
            "• تم تأكيد الطلب",
            "• تم تجهيز الطلب",
            "• خرج للتوصيل",
            "• تم التسليم",
            "يمكنك التواصل مع شركة الشحن مباشرة باستخدام رقم التتبع",
          ]
        },
        {
          icon: AlertCircle,
          title: "6. التسليم والاستلام",
          content: [
            "سيتواصل معك مندوب التوصيل قبل الوصول بـ 30 دقيقة",
            "يجب التأكد من هوية المستلم عند التسليم",
            "يجب فحص الطرد للتأكد من سلامته قبل الاستلام",
            "في حالة وجود ضرر واضح في العبوة، يمكنك رفض الاستلام",
            "إذا لم تكن متواجداً، سيحاول المندوب التواصل معك مرتين",
            "إذا لم يتم التسليم، سيتم إعادة الطرد للمستودع وستتحمل رسوم إعادة الشحن",
            "خيار \"اترك على الباب\" غير متاح لضمان الأمان",
          ]
        },
      ],
      specialCases: {
        title: "حالات خاصة",
        items: [
          {
            title: "التأخير في التوصيل",
            desc: "إذا تأخر التوصيل أكثر من المدة المحددة، يمكنك:",
            points: [
              "التواصل مع خدمة العملاء",
              "طلب تتبع الشحنة",
              "إلغاء الطلب واسترداد المبلغ كاملاً (إذا تأخر أكثر من 7 أيام)",
            ]
          },
          {
            title: "المنتج المفقود",
            desc: "في حالة فقدان المنتج أثناء الشحن:",
            points: [
              "نتحمل كامل المسؤولية",
              "استرداد كامل المبلغ خلال 3 أيام عمل",
              "أو إرسال منتج بديل فوراً (إن كان متوفراً)",
            ]
          },
          {
            title: "المنتج التالف",
            desc: "إذا وصلك المنتج تالفاً:",
            points: [
              "التقط صوراً للعبوة والمنتج التالف",
              "تواصل معنا خلال 24 ساعة",
              "استبدال فوري أو استرداد كامل",
              "لا نتحمل تكاليف الإرجاع",
            ]
          },
        ]
      },
      tips: {
        title: "نصائح لاستلام آمن",
        items: [
          "تأكد من صحة عنوان التوصيل عند الطلب",
          "احتفظ برقم هاتفك مفتوحاً لتلقي اتصال المندوب",
          "افحص العبوة جيداً قبل الاستلام",
          "لا تستلم طرد به أضرار واضحة",
          "احتفظ بالفاتورة ورقم التتبع حتى تتأكد من سلامة المنتج",
          "تواصل معنا فوراً في حالة أي مشكلة",
        ]
      },
      contact: {
        title: "التواصل",
        text: "لأي استفسارات حول الشحن:",
        whatsapp: "966500000000",
        email: "shipping@atlantis-platform.com",
        hours: "الأحد - الخميس: 9 صباحاً - 9 مساءً",
      }
    },
    en: {
      title: "Shipping and Delivery Policy",
      lastUpdated: "Last Updated: November 2025",
      intro: "At Atlantis Platform, we ensure your orders are delivered quickly and with the best quality. Learn about our shipping and delivery policy:",
      sections: [
        {
          icon: MapPin,
          title: "1. Delivery Areas",
          content: [
            "We cover all regions of Saudi Arabia",
            "Delivery available to all major cities and provinces",
            "Remote areas may require additional time (1-2 days)",
            "We work with trusted shipping companies: SMSA, Aramex, Saudi Post",
          ]
        },
        {
          icon: Clock,
          title: "2. Delivery Time",
          content: [
            "Riyadh, Jeddah, and Dammam: 1-2 business days",
            "Other major cities: 2-4 business days",
            "Remote areas: 3-5 business days",
            "Express delivery (same day): Available in Riyadh, Jeddah, and Dammam (additional fees)",
            "Orders confirmed before 12 PM ship same day",
            "Orders after 12 PM ship next day",
            "No shipping on Fridays and public holidays",
          ]
        },
        {
          icon: DollarSign,
          title: "3. Shipping Cost",
          content: [
            "Standard shipping:",
            "• Within major cities: 15 SAR",
            "• Outside major cities: 25 SAR",
            "• Remote areas: 35 SAR",
            "",
            "Free shipping:",
            "• Orders 200 SAR and above within major cities",
            "• Orders 300 SAR and above for other areas",
            "",
            "Express shipping (same day):",
            "• 40 SAR within Riyadh, Jeddah, and Dammam",
            "• Available for orders confirmed before 10 AM",
          ]
        },
        {
          icon: Package,
          title: "4. Product Packaging",
          content: [
            "All products are carefully packed to ensure safe arrival",
            "We use high-quality packaging materials",
            "Fragile items are packed with extra protection",
            "Package contains e-invoice with QR code",
            "\"Fragile - Handle with Care\" label on packages with fragile items",
          ]
        },
        {
          icon: Truck,
          title: "5. Shipment Tracking",
          content: [
            "You'll receive tracking number via SMS and email",
            "Track your order from \"My Orders\" page in your account",
            "You'll receive instant updates about shipment status:",
            "• Order confirmed",
            "• Order prepared",
            "• Out for delivery",
            "• Delivered",
            "You can contact shipping company directly using tracking number",
          ]
        },
        {
          icon: AlertCircle,
          title: "6. Delivery and Receipt",
          content: [
            "Delivery agent will contact you 30 minutes before arrival",
            "Recipient ID must be verified upon delivery",
            "Inspect package to ensure integrity before receipt",
            "In case of visible damage to package, you can refuse delivery",
            "If you're not available, agent will try to contact you twice",
            "If delivery fails, package will be returned to warehouse and you'll bear re-shipping fees",
            "\"Leave at door\" option not available for security reasons",
          ]
        },
      ],
      specialCases: {
        title: "Special Cases",
        items: [
          {
            title: "Delivery Delay",
            desc: "If delivery is delayed beyond specified time, you can:",
            points: [
              "Contact customer service",
              "Request shipment tracking",
              "Cancel order and receive full refund (if delayed more than 7 days)",
            ]
          },
          {
            title: "Lost Product",
            desc: "In case of product loss during shipping:",
            points: [
              "We take full responsibility",
              "Full refund within 3 business days",
              "Or send replacement product immediately (if available)",
            ]
          },
          {
            title: "Damaged Product",
            desc: "If you receive damaged product:",
            points: [
              "Take photos of package and damaged product",
              "Contact us within 24 hours",
              "Immediate replacement or full refund",
              "We cover return costs",
            ]
          },
        ]
      },
      tips: {
        title: "Tips for Safe Receipt",
        items: [
          "Ensure delivery address is correct when ordering",
          "Keep your phone available to receive agent's call",
          "Inspect package carefully before receipt",
          "Don't accept package with obvious damage",
          "Keep invoice and tracking number until you verify product integrity",
          "Contact us immediately in case of any issue",
        ]
      },
      contact: {
        title: "Contact",
        text: "For any shipping inquiries:",
        whatsapp: "966500000000",
        email: "shipping@atlantis-platform.com",
        hours: "Sunday - Thursday: 9 AM - 9 PM",
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
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t.title}</h1>
          <p className="text-muted-foreground">{t.lastUpdated}</p>
        </div>

        {/* Introduction */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 p-6 mb-8">
          <div className="flex items-start gap-4">
            <Package className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <p className="text-lg leading-relaxed text-foreground">{t.intro}</p>
          </div>
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
                <ul className="space-y-2 mr-14">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {item.trim() ? (
                        <>
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground flex-1">{item}</span>
                        </>
                      ) : (
                        <span className="h-2"></span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        {/* Special Cases */}
        <Card className="bg-card text-card-foreground p-6 mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t.specialCases.title}</h2>
          <div className="space-y-6">
            {t.specialCases.items.map((item, i) => (
              <div key={i} className="bg-primary/5 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                <ul className="space-y-1">
                  {item.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">✓</span>
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card className="bg-card text-card-foreground p-6 mt-6">
          <h2 className="text-xl font-bold text-foreground mb-4">{t.tips.title}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {t.tips.items.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span className="text-muted-foreground text-sm">{tip}</span>
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
              <span className="text-muted-foreground">{language === 'ar' ? 'واتساب: ' : 'WhatsApp: '}</span>
              <a href={`https://wa.me/${t.contact.whatsapp}`} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                +{t.contact.whatsapp}
              </a>
            </p>
            <p>
              <span className="text-muted-foreground">{language === 'ar' ? 'البريد الإلكتروني: ' : 'Email: '}</span>
              <a href={`mailto:${t.contact.email}`} className="text-primary hover:underline">
                {t.contact.email}
              </a>
            </p>
            <p className="text-muted-foreground">
              <Clock className="h-4 w-4 inline-block mr-2" />
              {t.contact.hours}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
