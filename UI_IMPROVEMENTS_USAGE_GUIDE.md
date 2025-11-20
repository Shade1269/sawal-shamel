# 📖 دليل استخدام التحسينات UI الجديدة

**الإصدار:** 1.0
**التاريخ:** 2025-11-20

---

## 🎯 نظرة عامة

تم إضافة **8 تحسينات UI رئيسية** إلى المنصة. هذا الدليل يشرح كيفية استخدام كل مكون.

---

## 1️⃣ نظام المنتجات المشاهدة مؤخراً

### 📍 الموقع
- صفحة المنتج (أسفل الصفحة)
- صفحة المتجر (أسفل قائمة المنتجات)

### 🔧 كيفية الاستخدام

```typescript
// في أي مكون
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { RecentlyViewedProducts } from '@/components/product/RecentlyViewedProducts';

function MyComponent() {
  const { addProduct, viewedProducts } = useRecentlyViewed();

  // إضافة منتج للمشاهدة مؤخراً
  const handleProductView = (product) => {
    addProduct({
      id: product.id,
      name: product.title,
      price: product.price_sar,
      image_url: product.image_urls?.[0],
      category: product.category,
    });
  };

  // عرض المكون
  return <RecentlyViewedProducts />;
}
```

### ✨ الميزات
- ✅ تتبع تلقائي لآخر 10 منتجات
- ✅ carousel أفقي مع تمرير
- ✅ إمكانية حذف منتجات
- ✅ حفظ في localStorage
- ✅ animations سلسة

---

## 2️⃣ Bottom Navigation للموبايل

### 📍 الموقع
- جميع صفحات المتجر (يظهر فقط على الموبايل)

### 🔧 كيفية الاستخدام

```typescript
// في Layout
import { BottomNav } from '@/components/mobile/BottomNav';

function StoreLayout() {
  const cartCount = 5; // عدد المنتجات في السلة
  const wishlistCount = 3; // عدد المنتجات في المفضلة

  return (
    <>
      {/* محتوى الصفحة */}
      <BottomNav
        storeSlug="my-store"
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
    </>
  );
}
```

### ✨ الميزات
- ✅ 5 أيقونات: الرئيسية، بحث، المفضلة، السلة، حسابي
- ✅ badges ديناميكية للسلة والمفضلة
- ✅ مؤشر تفعيل متحرك
- ✅ مخفي تلقائياً على الشاشات الكبيرة
- ✅ دعم RTL/LTR

---

## 3️⃣ Loading Skeletons

### 📍 الموقع
- أي صفحة تحتاج تحميل بيانات

### 🔧 كيفية الاستخدام

```typescript
import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { ProductDetailSkeleton } from '@/components/product/ProductDetailSkeleton';

function MyPage() {
  const { data, isLoading } = useQuery(...);

  if (isLoading) {
    // شبكة من 8 بطاقات
    return <ProductGridSkeleton count={8} />;
  }

  return <ProductGrid products={data} />;
}

// أو بطاقة واحدة
function MyCard() {
  if (loading) {
    return <ProductCardSkeleton />;
  }
  return <ProductCard />;
}

// أو صفحة تفاصيل
function ProductPage() {
  if (loading) {
    return <ProductDetailSkeleton />;
  }
  return <ProductDetails />;
}
```

### ✨ الميزات
- ✅ استبدال spinners التقليدية
- ✅ نسخة عادية ومدمجة
- ✅ تطابق تخطيط المكون الفعلي
- ✅ تحسين UX بشكل كبير

---

## 4️⃣ مؤشر المخزون المحسّن

### 📍 الموقع
- صفحة المنتج (عرض تفصيلي)
- بطاقة المنتج (عرض مدمج)

### 🔧 كيفية الاستخدام

```typescript
import { EnhancedStockIndicator, CompactStockIndicator } from '@/components/product/EnhancedStockIndicator';

// في صفحة المنتج (عرض كامل)
function ProductPage() {
  return (
    <EnhancedStockIndicator
      stock={45}
      totalStock={100}
      viewCount={12}
      showProgress={true}
    />
  );
}

// في بطاقة المنتج (عرض مدمج)
function ProductCard() {
  return (
    <CompactStockIndicator stock={5} />
  );
}
```

### ✨ الميزات
- ✅ 4 حالات: نفذ، محدود جداً، محدود، متوفر
- ✅ progress bar مرئي
- ✅ ألوان وأيقونات مميزة
- ✅ رسائل urgency
- ✅ عداد المشاهدات الحالية

### 🎨 الحالات

| المخزون | الحالة | اللون | الأيقونة |
|---------|--------|-------|----------|
| 0 | نفذ | 🔴 أحمر | XCircle |
| 1-9 | محدود جداً | 🟠 برتقالي | AlertTriangle |
| 10-29 | محدود | 🟡 أصفر | Package |
| 30+ | متوفر | 🟢 أخضر | CheckCircle |

---

## 5️⃣ Breadcrumbs (مسار التصفح)

### 📍 الموقع
- أعلى صفحة المنتج
- أي صفحة تحتاج navigation

### 🔧 كيفية الاستخدام

```typescript
import { Breadcrumbs, CompactBreadcrumbs } from '@/components/navigation/Breadcrumbs';

// عرض كامل
function ProductPage() {
  return (
    <Breadcrumbs
      items={[
        { label: 'متجري', href: '/store' },
        { label: 'ملابس', labelEn: 'Clothing', href: '/store/clothing' },
        { label: 'قميص أزرق', href: '#' },
      ]}
      showHome={true}
    />
  );
}

// عرض مدمج
function SimplePage() {
  return (
    <CompactBreadcrumbs
      currentPage="الإعدادات"
      parentPage={{ label: 'الحساب', href: '/account' }}
    />
  );
}
```

### ✨ الميزات
- ✅ أيقونة Home تلقائية
- ✅ فواصل ديناميكية (ChevronRight/Left)
- ✅ دعم الأيقونات المخصصة
- ✅ دعم RTL/LTR
- ✅ Scrollable على الموبايل

---

## 6️⃣ معرض الصور المحسّن

### 📍 الموقع
- صفحة المنتج

### 🔧 كيفية الاستخدام

```typescript
import { EnhancedImageGallery } from '@/components/product/EnhancedImageGallery';

function ProductPage({ product }) {
  return (
    <EnhancedImageGallery
      images={product.image_urls || []}
      productName={product.title}
    />
  );
}
```

### ✨ الميزات
- ✅ صورة رئيسية كبيرة
- ✅ صور مصغرة للتنقل
- ✅ Lightbox بملء الشاشة
- ✅ Zoom (تكبير/تصغير)
- ✅ أسهم التنقل
- ✅ مؤشر عدد الصور
- ✅ أزرار تحكم عند Hover

### 🎮 التحكم
- **النقر على الصورة:** فتح Lightbox
- **النقر في Lightbox:** Zoom
- **الأسهم:** التنقل بين الصور
- **ESC:** إغلاق Lightbox

---

## 7️⃣ Empty States المحسّنة

### 📍 الموقع
- أي صفحة قد تكون فارغة

### 🔧 كيفية الاستخدام

```typescript
import { EmptyStates } from '@/components/ui/EmptyState';

// سلة فارغة
function CartPage() {
  if (cart.length === 0) {
    return (
      <EmptyStates.EmptyCart
        onBrowseProducts={() => navigate('/products')}
      />
    );
  }
}

// المفضلة فارغة
function WishlistPage() {
  if (wishlist.length === 0) {
    return (
      <EmptyStates.EmptyWishlist
        onBrowseProducts={() => navigate('/products')}
      />
    );
  }
}

// لا توجد منتجات
function StorePage() {
  if (products.length === 0) {
    return (
      <EmptyStates.NoProducts
        canAdd={false}
      />
    );
  }
}

// لا توجد نتائج بحث
function SearchPage() {
  if (results.length === 0) {
    return (
      <EmptyStates.NoSearchResults
        searchQuery={query}
      />
    );
  }
}

// حالة خطأ
function DataPage() {
  if (error) {
    return (
      <EmptyStates.Error
        onRetry={() => refetch()}
        errorMessage={error.message}
      />
    );
  }
}
```

### ✨ Empty States المتاحة

| State | الاستخدام | الأيقونة |
|-------|----------|----------|
| EmptyCart | سلة فارغة | 🛒 ShoppingCart |
| EmptyWishlist | المفضلة فارغة | ❤️ Heart |
| NoProducts | لا توجد منتجات | 📦 Package |
| NoSearchResults | لا نتائج بحث | 🔍 Search |
| NoOrders | لا توجد طلبات | 🛍️ ShoppingBag |
| EmptyInbox | صندوق فارغ | 📥 Inbox |
| Error | حالة خطأ | ⚠️ AlertCircle |

---

## 8️⃣ Micro-animations

### 📍 الموقع
- بطاقات المنتجات في الشبكة

### 🔧 كيفية الاستخدام

```typescript
import { motion } from 'framer-motion';

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          whileHover={{ y: -4 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}
```

### ✨ Animations المطبقة
- ✅ **Fade in:** opacity من 0 إلى 1
- ✅ **Slide up:** y من 20 إلى 0
- ✅ **Stagger:** تأخير تدريجي (index * 0.05)
- ✅ **Hover lift:** y: -4 عند Hover

---

## 🎨 Best Practices

### 1. استخدام Semantic Tokens

```typescript
// ✅ صحيح
<div className="bg-card text-card-foreground border-border">

// ❌ خطأ
<div className="bg-white text-black border-gray-200">
```

### 2. استخدام Loading Skeletons

```typescript
// ✅ صحيح
if (isLoading) return <ProductGridSkeleton />;

// ❌ خطأ
if (isLoading) return <div>جاري التحميل...</div>;
```

### 3. استخدام Empty States

```typescript
// ✅ صحيح
if (data.length === 0) return <EmptyStates.NoProducts />;

// ❌ خطأ
if (data.length === 0) return <div>لا توجد منتجات</div>;
```

### 4. Animations معتدلة

```typescript
// ✅ صحيح - animations سريعة وسلسة
transition={{ duration: 0.3 }}

// ❌ خطأ - animations بطيئة ومزعجة
transition={{ duration: 2 }}
```

---

## 🧪 الاختبار

### 1. اختبار المتصفح

افتح Console واستخدم:

```javascript
// نسخ محتوى test-ui-improvements.js والصقه في Console
runAllTests();
```

### 2. اختبار Responsive

```javascript
// موبايل
testResponsive(); // يجب أن يظهر BottomNav

// ديسكتوب
// غيّر حجم النافذة > 768px
testResponsive(); // يجب أن يختفي BottomNav
```

### 3. اختبار localStorage

```javascript
testRecentlyViewed();
// تحقق من Application > Local Storage
```

---

## 📋 Checklist التكامل

عند إضافة صفحة جديدة، تأكد من:

- [ ] استخدام `ProductGridSkeleton` عند التحميل
- [ ] استخدام `EmptyState` عند عدم وجود بيانات
- [ ] إضافة `Breadcrumbs` إذا كانت صفحة فرعية
- [ ] تتبع المنتجات المشاهدة في صفحة المنتج
- [ ] استخدام `CompactStockIndicator` في البطاقات
- [ ] إضافة `micro-animations` للقوائم
- [ ] التأكد من دعم RTL/LTR
- [ ] اختبار على الموبايل

---

## 🆘 استكشاف الأخطاء

### المشكلة: BottomNav لا يظهر
**الحل:**
- تأكد أن عرض الشاشة < 768px
- تأكد من وجود `BottomNav` في Layout

### المشكلة: Recently Viewed فارغ
**الحل:**
- تحقق من localStorage
- تأكد من استدعاء `addProduct()` عند مشاهدة منتج

### المشكلة: Skeletons لا تظهر
**الحل:**
- تأكد من حالة `isLoading`
- استخدم `ProductGridSkeleton` بدلاً من spinner

### المشكلة: Animations لا تعمل
**الحل:**
- تأكد من تثبيت `framer-motion`
- تحقق من `motion.div` wrapper

---

## 📞 الدعم

للحصول على المساعدة:
1. راجع `UI_IMPROVEMENTS_TEST_REPORT.md`
2. راجع `DESIGN_IMPROVEMENTS_ROADMAP.md`
3. استخدم سكريبت `test-ui-improvements.js`

---

**آخر تحديث:** 2025-11-20
**الإصدار:** 1.0
**الحالة:** ✅ Production Ready
