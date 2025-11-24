import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { RotateCcw, Clock, CheckCircle, XCircle, Package, CreditCard } from "lucide-react";

export default function ReturnPolicy() {
  const { language, direction } = useLanguage();

  const content = {
    ar: {
      title: "سياسة الاسترجاع والاستبدال",
      lastUpdated: "آخر تحديث: نوفمبر 2025",
      intro: "نحن في منصة أتلانتس نسعى لضمان رضاك الكامل. إذا لم تكن راضياً عن مشترياتك، يمكنك إرجاعها أو استبدالها وفقاً للشروط التالية:",
      sections: [
        {
          icon: Clock,
          title: "1. المدة الزمنية",
          content: [
            "يمكنك إرجاع أو استبدال المنتجات خلال 14 يوماً من تاريخ الاستلام",
            "يبدأ احتساب المدة من يوم استلامك للمنتج وليس من تاريخ الطلب",
            "طلبات الإرجاع بعد 14 يوماً لن يتم قبولها إلا في حالات خاصة",
            "الإرجاع المجاني متاح لجميع المنتجات المؤهلة",
          ]
        },
        {
          icon: CheckCircle,
          title: "2. شروط الإرجاع المقبولة",
          content: [
            "المنتج في حالته الأصلية ولم يتم استخدامه",
            "المنتج في العبوة الأصلية مع جميع الملحقات والأوراق",
            "الفواتير والأوراق الرسمية موجودة",
            "لم يتعرض المنتج للتلف بسبب سوء الاستخدام",
            "الأختام والملصقات الأمنية سليمة (إن وجدت)",
            "المنتج غير مخصص (مثل الملابس الداخلية أو المنتجات الصحية)",
          ]
        },
        {
          icon: XCircle,
          title: "3. المنتجات غير القابلة للإرجاع",
          content: [
            "المنتجات الغذائية القابلة للتلف",
            "منتجات العناية الشخصية والصحية المفتوحة",
            "الملابس الداخلية ومنتجات النظافة الشخصية",
            "المنتجات المخصصة أو المصنوعة حسب الطلب",
            "البطاقات الرقمية والاشتراكات الإلكترونية بعد الاستخدام",
            "المنتجات المعروضة للبيع النهائي (Final Sale)",
            "المنتجات التالفة بسبب سوء الاستخدام من العميل",
          ]
        },
        {
          icon: RotateCcw,
          title: "4. إجراءات الإرجاع",
          content: [
            "تواصل مع خدمة العملاء عبر الواتساب أو البريد الإلكتروني",
            "قدم رقم الطلب وسبب الإرجاع مع صور للمنتج",
            "انتظر الموافقة على طلب الإرجاع (عادة خلال 24 ساعة)",
            "سيتم إرسال شركة الشحن لاستلام المنتج من عنوانك",
            "تعبئة المنتج بشكل آمن في العبوة الأصلية",
            "سيتم فحص المنتج عند الاستلام للتأكد من مطابقة الشروط",
          ]
        },
        {
          icon: Package,
          title: "5. الاستبدال",
          content: [
            "يمكنك استبدال المنتج بآخر من نفس القيمة أو أعلى",
            "في حالة الاستبدال بمنتج أعلى قيمة، يجب دفع الفرق",
            "في حالة الاستبدال بمنتج أقل قيمة، سيتم إرجاع الفرق",
            "استبدال المقاسات واللون متاح حسب التوفر",
            "إجراءات الاستبدال تتم خلال 3-5 أيام عمل",
            "تكلفة الشحن للاستبدال مجانية",
          ]
        },
        {
          icon: CreditCard,
          title: "6. استرداد المبلغ",
          content: [
            "بعد قبول الإرجاع، سيتم استرداد المبلغ خلال 7-14 يوم عمل",
            "الاسترداد يتم بنفس طريقة الدفع الأصلية:",
            "• البطاقة الائتمانية: 7-14 يوم عمل حسب البنك",
            "• الدفع عند الاستلام: تحويل بنكي خلال 5-7 أيام",
            "• Apple Pay: 5-10 أيام عمل",
            "تكلفة الشحن الأصلية غير قابلة للاسترداد (ما لم يكن المنتج معيباً)",
            "في حالة الإرجاع بسبب عيب في المنتج، سيتم استرداد المبلغ كاملاً",
          ]
        },
      ],
      exceptions: {
        title: "حالات خاصة",
        items: [
          {
            title: "المنتجات المعيبة",
            desc: "إذا وصلك منتج معيب أو تالف، نتحمل كامل التكلفة ونوفر استبدالاً فورياً أو استرداد كامل"
          },
          {
            title: "خطأ في الشحن",
            desc: "إذا وصلك منتج خاطئ، نتحمل تكلفة الإرجاع ونرسل المنتج الصحيح فوراً"
          },
          {
            title: "التأخير في الشحن",
            desc: "إذا تأخر الشحن أكثر من 7 أيام، يمكنك إلغاء الطلب واسترداد المبلغ كاملاً"
          },
        ]
      },
      contact: {
        title: "التواصل",
        text: "لطلبات الإرجاع والاستبدال:",
        whatsapp: "966500000000",
        email: "returns@atlantis-platform.com",
        hours: "الأحد - الخميس: 9 صباحاً - 9 مساءً",
      }
    },
    en: {
      title: "Return and Exchange Policy",
      lastUpdated: "Last Updated: November 2025",
      intro: "At Atlantis Platform, we strive to ensure your complete satisfaction. If you're not happy with your purchase, you can return or exchange it according to the following terms:",
      sections: [
        {
          icon: Clock,
          title: "1. Time Frame",
          content: [
            "You can return or exchange products within 14 days of receipt",
            "The period starts from the day you receive the product, not the order date",
            "Return requests after 14 days will not be accepted except in special cases",
            "Free returns available for all eligible products",
          ]
        },
        {
          icon: CheckCircle,
          title: "2. Accepted Return Conditions",
          content: [
            "Product is in original condition and unused",
            "Product is in original packaging with all accessories and documents",
            "Invoices and official papers are included",
            "Product has not been damaged due to misuse",
            "Security seals and stickers are intact (if applicable)",
            "Product is not personalized (e.g., underwear or hygiene products)",
          ]
        },
        {
          icon: XCircle,
          title: "3. Non-Returnable Products",
          content: [
            "Perishable food products",
            "Opened personal care and health products",
            "Underwear and personal hygiene products",
            "Customized or made-to-order products",
            "Digital cards and electronic subscriptions after use",
            "Final Sale items",
            "Products damaged due to customer misuse",
          ]
        },
        {
          icon: RotateCcw,
          title: "4. Return Process",
          content: [
            "Contact customer service via WhatsApp or email",
            "Provide order number and reason for return with product photos",
            "Wait for return approval (usually within 24 hours)",
            "Shipping company will be sent to collect the product from your address",
            "Pack the product safely in original packaging",
            "Product will be inspected upon receipt to ensure compliance",
          ]
        },
        {
          icon: Package,
          title: "5. Exchange",
          content: [
            "You can exchange product for another of same or higher value",
            "If exchanging for higher value product, pay the difference",
            "If exchanging for lower value product, difference will be refunded",
            "Size and color exchanges available subject to availability",
            "Exchange process takes 3-5 business days",
            "Shipping cost for exchange is free",
          ]
        },
        {
          icon: CreditCard,
          title: "6. Refund",
          content: [
            "After return approval, refund will be processed within 7-14 business days",
            "Refund will be made using the same original payment method:",
            "• Credit card: 7-14 business days depending on bank",
            "• Cash on delivery: Bank transfer within 5-7 days",
            "• Apple Pay: 5-10 business days",
            "Original shipping cost is non-refundable (unless product is defective)",
            "In case of defective product return, full amount will be refunded",
          ]
        },
      ],
      exceptions: {
        title: "Special Cases",
        items: [
          {
            title: "Defective Products",
            desc: "If you receive a defective or damaged product, we cover full cost and provide immediate replacement or full refund"
          },
          {
            title: "Shipping Error",
            desc: "If you receive wrong product, we cover return cost and send correct product immediately"
          },
          {
            title: "Shipping Delay",
            desc: "If shipping is delayed more than 7 days, you can cancel order and receive full refund"
          },
        ]
      },
      contact: {
        title: "Contact",
        text: "For return and exchange requests:",
        whatsapp: "966500000000",
        email: "returns@atlantis-platform.com",
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
            <RotateCcw className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t.title}</h1>
          <p className="text-muted-foreground">{t.lastUpdated}</p>
        </div>

        {/* Introduction */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 p-6 mb-8">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
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

        {/* Special Cases */}
        <Card className="bg-card text-card-foreground p-6 mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t.exceptions.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {t.exceptions.items.map((item, i) => (
              <div key={i} className="bg-primary/5 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
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
