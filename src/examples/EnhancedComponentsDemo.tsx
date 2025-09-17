import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  EnhancedButton,
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedCardFooter,
  EnhancedForm,
  EnhancedFormField,
  EnhancedInputField,
  EnhancedTable,
  useDesignSystem
} from '@/components/enhanced';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  User, 
  Heart, 
  Star, 
  Settings, 
  ShoppingCart,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

// Demo data
const sampleProducts = [
  { id: 1, name: 'منتج رقم 1', price: 100, status: 'active', category: 'الكترونيات' },
  { id: 2, name: 'منتج رقم 2', price: 200, status: 'inactive', category: 'ملابس' },
  { id: 3, name: 'منتج رقم 3', price: 150, status: 'active', category: 'كتب' },
  { id: 4, name: 'منتج رقم 4', price: 300, status: 'active', category: 'رياضة' },
];

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  message: z.string().min(10, 'الرسالة يجب أن تكون أكثر من 10 أحرف'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function EnhancedComponentsDemo() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const ds = useDesignSystem();
  
  // Form setup
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  });

  const onSubmit = (data: ContactFormData) => {
    console.log('Form submitted:', data);
    alert('تم إرسال النموذج بنجاح!');
  };

  // Table columns configuration
  const productColumns = [
    {
      key: 'name',
      title: 'اسم المنتج',
      dataIndex: 'name' as keyof typeof sampleProducts[0],
      responsive: { priority: 3 }
    },
    {
      key: 'price',
      title: 'السعر',
      dataIndex: 'price' as keyof typeof sampleProducts[0],
      render: (value: number) => `${value} ريال`,
      responsive: { priority: 2 }
    },
    {
      key: 'category',
      title: 'الفئة',
      dataIndex: 'category' as keyof typeof sampleProducts[0],
      responsive: { hideOnMobile: true }
    },
    {
      key: 'status',
      title: 'الحالة',
      dataIndex: 'status' as keyof typeof sampleProducts[0],
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value === 'active' ? 'نشط' : 'غير نشط'}
        </Badge>
      ),
      responsive: { priority: 1 }
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      <div className="text-center space-y-2 mb-8">
        <h1 className={ds.typography.display['2xl']}>
          مكونات واجهة المستخدم المحسّنة
        </h1>
        <p className={ds.typography.body.lg}>
          مجموعة شاملة من المكونات التكيفية والمتجاوبة
        </p>
      </div>

      {/* Enhanced Buttons Section */}
      <section className="space-y-4">
        <h2 className={ds.typography.heading.h2}>الأزرار المحسّنة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <EnhancedCard variant="outline">
            <EnhancedCardHeader>
              <EnhancedCardTitle>الأزرار الأساسية</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-3">
              <EnhancedButton variant="default" className="w-full">
                <User className="w-4 h-4" />
                زر افتراضي
              </EnhancedButton>
              <EnhancedButton variant="secondary" className="w-full">
                <Settings className="w-4 h-4" />
                زر ثانوي
              </EnhancedButton>
              <EnhancedButton variant="outline" className="w-full">
                <Mail className="w-4 h-4" />
                زر محدد
              </EnhancedButton>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="persian">
            <EnhancedCardHeader>
              <EnhancedCardTitle>أزرار التراث الفارسي</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-3">
              <EnhancedButton variant="hero" className="w-full" animation="glow">
                <Star className="w-4 h-4" />
                زر رئيسي
              </EnhancedButton>
              <EnhancedButton variant="luxury" className="w-full">
                <Heart className="w-4 h-4" />
                زر فاخر
              </EnhancedButton>
              <EnhancedButton variant="persian" className="w-full">
                <ShoppingCart className="w-4 h-4" />
                زر فارسي
              </EnhancedButton>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <EnhancedCardTitle>الأحجام والحالات</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-3">
              <EnhancedButton size="sm" className="w-full">صغير</EnhancedButton>
              <EnhancedButton size="default" className="w-full">متوسط</EnhancedButton>
              <EnhancedButton size="lg" className="w-full">كبير</EnhancedButton>
              <EnhancedButton 
                loading={true} 
                loadingText="جارٍ التحميل..." 
                className="w-full"
              >
                تحميل
              </EnhancedButton>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </section>

      <Separator />

      {/* Enhanced Cards Section */}
      <section className="space-y-4">
        <h2 className={ds.typography.heading.h2}>البطاقات المحسّنة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['default', 'outline', 'filled', 'gradient'].map((variant) => (
            <EnhancedCard
              key={variant}
              variant={variant as any}
              hover="lift"
              clickable={true}
              className={selectedCard === variant ? 'ring-2 ring-primary' : ''}
              onClick={() => setSelectedCard(variant)}
            >
              <EnhancedCardHeader>
                <EnhancedCardTitle>بطاقة {variant}</EnhancedCardTitle>
                <EnhancedCardDescription>
                  وصف البطاقة يوضح المحتوى الأساسي
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <p className="text-sm text-muted-foreground">
                  محتوى البطاقة يمكن أن يحتوي على أي عناصر HTML
                </p>
              </EnhancedCardContent>
              <EnhancedCardFooter>
                <EnhancedButton variant="ghost" size="sm" className="w-full">
                  إجراء
                </EnhancedButton>
              </EnhancedCardFooter>
            </EnhancedCard>
          ))}
        </div>
      </section>

      <Separator />

      {/* Enhanced Form Section */}
      <section className="space-y-4">
        <h2 className={ds.typography.heading.h2}>النماذج المحسّنة</h2>
        
        <EnhancedCard variant="outline" className="max-w-2xl mx-auto">
          <EnhancedCardHeader>
            <EnhancedCardTitle>نموذج الاتصال</EnhancedCardTitle>
            <EnhancedCardDescription>
              املأ النموذج أدناه وسنتواصل معك قريباً
            </EnhancedCardDescription>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <EnhancedForm {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <EnhancedFormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <EnhancedInputField
                      {...field}
                      label="الاسم الكامل"
                      placeholder="أدخل اسمك الكامل"
                      required
                      leftIcon={<User className="w-4 h-4" />}
                    />
                  )}
                />
                
                <EnhancedFormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <EnhancedInputField
                      {...field}
                      type="email"
                      label="البريد الإلكتروني"
                      placeholder="example@domain.com"
                      required
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                  )}
                />
                
                <EnhancedFormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <EnhancedInputField
                      {...field}
                      label="الرسالة"
                      placeholder="اكتب رسالتك هنا..."
                      required
                      description="يرجى كتابة رسالة واضحة ومفصلة"
                    />
                  )}
                />
                
                <div className="flex gap-2 pt-4">
                  <EnhancedButton 
                    type="submit" 
                    variant="hero" 
                    className="flex-1"
                    loading={form.formState.isSubmitting}
                  >
                    إرسال الرسالة
                  </EnhancedButton>
                  <EnhancedButton 
                    type="button" 
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    إعادة تعيين
                  </EnhancedButton>
                </div>
              </form>
            </EnhancedForm>
          </EnhancedCardContent>
        </EnhancedCard>
      </section>

      <Separator />

      {/* Enhanced Table Section */}
      <section className="space-y-4">
        <h2 className={ds.typography.heading.h2}>الجداول المحسّنة</h2>
        
        <EnhancedCard>
          <EnhancedCardHeader>
            <EnhancedCardTitle>جدول المنتجات</EnhancedCardTitle>
            <EnhancedCardDescription>
              عرض تكيفي للبيانات يتغير حسب حجم الشاشة
            </EnhancedCardDescription>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <EnhancedTable
              data={sampleProducts}
              columns={productColumns}
              variant="striped"
              rowActions={{
                view: (record) => alert(`عرض ${record.name}`),
                edit: (record) => alert(`تعديل ${record.name}`),
                delete: (record) => alert(`حذف ${record.name}`)
              }}
              mobileCardTitle={(record) => record.name}
              mobileCardSubtitle={(record) => `${record.price} ريال - ${record.category}`}
              onRowClick={(record) => console.log('Row clicked:', record)}
            />
          </EnhancedCardContent>
        </EnhancedCard>
      </section>

      {/* Design System Showcase */}
      <section className="space-y-4">
        <h2 className={ds.typography.heading.h2}>نظام التصميم</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EnhancedCard variant="outline">
            <EnhancedCardHeader>
              <EnhancedCardTitle>الألوان</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${ds.colors.role.admin}`} />
                <span className="text-sm">لون المدير</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${ds.colors.status.active}`} />
                <span className="text-sm">حالة نشطة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${ds.colors.level.gold.bg}`} />
                <span className="text-sm">مستوى ذهبي</span>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="gradient">
            <EnhancedCardHeader>
              <EnhancedCardTitle>التدرجات</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-2">
              <div className={`h-8 rounded ${ds.components.gradient.primary}`} />
              <div className={`h-8 rounded ${ds.components.gradient.hero}`} />
              <div className={`h-8 rounded ${ds.components.gradient.luxury}`} />
            </EnhancedCardContent>
          </EnhancedCard>

          <EnhancedCard variant="persian">
            <EnhancedCardHeader>
              <EnhancedCardTitle>الطباعة</EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-2">
              <p className={ds.typography.display.xl}>عرض</p>
              <p className={ds.typography.heading.h3}>عنوان</p>
              <p className={ds.typography.body.md}>نص أساسي</p>
              <p className={ds.typography.body.sm}>نص صغير</p>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </section>
    </div>
  );
}

export default EnhancedComponentsDemo;