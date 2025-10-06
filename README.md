# 🏛️ منصة أتلانتس للتجارة الإلكترونية  
*(Atlantis E-commerce Platform)*

---

## 🇸🇦 العربية

### 📋 نظرة عامة

منصة أتلانتس هي نظام تجارة إلكترونية متكامل مع نظام تحفيز وتنافس مطور خصيصاً للمسوقين بالعمولة والتجار في المملكة العربية السعودية. يوفر النظام متاجر متعددة، إدارة كاملة للمنتجات، ونظام نقاط وتحفيز متطور.

### ✨ الميزات الرئيسية
- المستويات: برونزي، فضي، ذهبي، أسطوري
- النقاط: نظام نقاط ذكي مربوط بالمبيعات والأنشطة
- التحالفات: إنشاء وإدارة التحالفات بين المسوقين
- المنافسات: تحديات أسبوعية وسيطرة على القلعة
- لوحة المتصدرين: ترتيب فردي وجماعي في الوقت الفعلي

### 🛒 التجارة الإلكترونية
- متاجر متعددة التجار
- إدارة المنتجات والكتالوج
- معالجة الطلبات وتتبع الحالة
- المدفوعات والشحن

### 👥 إدارة المستخدمين والأدوار
- مدير، تاجر، مسوق، عميل
- نظام صلاحيات ومصادقة آمنة

### 🏗️ البنية التقنية
- React 18 مع TypeScript
- Vite للبناء السريع
- Tailwind CSS للتصميم
- Framer Motion للرسوم المتحركة
- React Query لإدارة البيانات
- Supabase قاعدة البيانات والمصادقة
- Edge Functions للمنطق الخلفي

### 🚀 التثبيت والتشغيل
1. استنساخ المشروع
2. تثبيت التبعيات
3. إعداد متغيرات البيئة
4. تشغيل المشروع

### 📁 هيكل المشروع
```
src/
├── components/          # المكونات القابلة لإعادة الاستخدام
├── pages/              # صفحات التطبيق
├── hooks/              # React Hooks مخصصة
├── lib/                # المكتبات والخدمات
├── utils/              # الوظائف المساعدة
├── contexts/           # React Contexts
└── integrations/       # التكاملات الخارجية
```

### 🎮 دليل الاستخدام
- للمسوقين: سجل، أنشئ متجر، اختر منتجات، شارك الروابط، تتبع الأرباح، اكسب النقاط
- للتجار: سجل، أضف منتجات، إدارة المخزون، معالجة الطلبات، تقارير المبيعات
- للعملاء: تسوق، أضف للسلة، ادفع بأمان، تتبع الطلب
 
### 🧭 واجهة التطبيق والتنقل
- **البنية الهرمية**: يتألف الهيكل من `AppShell` الذي يضم `Header`, `SidebarDesktop`, `BottomNavMobile`, `PageTitle`, و`ActionBar` مع وجود `SkipToContent` و`<main id="content">` للوصول السريع.
- **إدارة الأدوار**: المسارات والروابط تتغير وفق الدور (`admin`, `affiliate`, `marketer`) حيث تظهر مجموعات التنقل المناسبة لكل دور ويتم إخفاء العناصر غير المتاحة.
- **تحسين الأداء**: يتم استخدام التحميل الكسول للمسارات الثقيلة مع تنفيذ prefetch عند التحويم أو التركيز على الروابط الأساسية لتسخين الـchunks الضرورية مسبقاً.
- **إتاحة الاستخدام**: يتوفر رابط "تخطي إلى المحتوى"، ومعالم تنقل معنونة (`aria-label`) بالإضافة إلى حالات `focus-visible` واضحة وحلقات تركيز تعتمد على متغيرات الثيم.

### 🏠 لوحات Home
- **بنية المكونات**: كل من `AdminHome` و`MarketerHome` يتم لفهما داخل `AppShell` ويبدآن بـ`PageTitle` ثم شبكة بطاقات `KpiCard` وودجات مثل `MiniChart`، `AdminRecentOrdersTable`، و`SystemAlertsWidget` التي تعتمد على طبقات الزجاج.
- **إدارة الأدوار**: التحويل بين الصفحتين يعتمد على الدور عبر الراوتر (`/admin/dashboard` للمدير و`/affiliate` للمسوق/المسوق بالعمولة) مع إخفاء الروابط غير المصرح بها ضمن الروابط السريعة.
- **التحسين والأداء**: الرسوم المصغرة والجدول يتم تحميلهما كسولياً داخل `Suspense` مع احترام تفضيل `prefers-reduced-motion` لوقف التحريكات، كما يستفيد الرسم من CSS variables للثيمات.
- **الوصولية**: البطاقات تدعم `aria-live` لتحديثات النسب، الروابط السريعة تستخدم أزراراً قابلة للتركيز مع حلقات `focus-visible`، والرسوم تحتوي على أوصاف نصية مختصرة للقرّاء الآليين.

### 🗂️ مديرا الأدمن (الطلبات والعملاء)
- **الفلترة والبحث**: صفحات `/admin/orders` و`/admin/customers` تقدم فلاتر زجاجية لحالة الطلب، نطاق التاريخ (اليوم/7 أيام/30 يوم/مخصص)، وحد الإنفاق مع بحث نصي؛ جميع القيم تندمج في مفتاح استعلام واحد لضمان التخزين المؤقت الذكي.
- **التجربة الزجاجية والأداء**: الجداول تعتمد `var(--surface)` و`var(--glass-border)` مع أزرار محاطة بحلقات تركيز AA، بينما يتم تقسيم مكونات الـDrawer كسولياً واحترام `prefers-reduced-motion` للحركة.
- **تفاصيل قابلة للتصدير**: كل صفحة تحتوي زر تصدير CSV يحترم الفلاتر الحالية، مع تحميل خفيف (`Blob`) وروابط نسخ سريعة (رقم الطلب، رابط التأكيد) داخل السحب الجانبية.
- **الوصولية**: الصفوف تستخدم تنقل تركيزي متجدد (`ArrowUp`/`ArrowDown`) وحصر `Tab` داخل الـDrawer، ويغلق `Escape` اللوحات مع سماح للوحة المفاتيح بنسخ الروابط والأوامر.
- **الترابط بين الشاشات**: زر "عرض في الطلبات" داخل بطاقة العميل يفتح `/admin/orders?customer=...` مع إعادة استخدام المخزن نفسه، مما يبقي الأداء متماسكاً عبر الأدوار.

### 🛍️ المتجر العام للمسوّقات
- **المسار العام**: يتم تقديم المتجر عبر `/:slug` داخل غلاف زجاجي خفيف مع رأس ثابت يعرض الشعار، اسم المسوّقة، وزر واضح للتوجه نحو `/checkout`.
- **الواجهة الزجاجية**: يدعم البطل Hero ثلاثي الأبعاد لكل ثيم مع fallback يحترم `prefers-reduced-motion`، بينما تعتمد شبكة المنتجات على بطاقات `Card` المزودة بمتغيرات `--surface` و`--accent` وصور Lazy.
- **تكامل السلة**: كل عملية "أضف للسلة" ترتبط بجلسة العميل وتُظهر حالة السلة الحالية مع ربط مباشر بمسار الدفع `/checkout` وتأكيد الطلب في `/order/confirmation`.
- **الإعدادات**: صفحة `Affiliate → Store → Settings` تحفظ اسم المتجر، الوصف القصير، الشعار، وخيار الـHero عبر `useStorefrontSettings` لتغذية الواجهة العامة حالياً قبل ربط واجهات Supabase.
- **الاختبارات واللقطات**: تتوفر اختبارات للعرض، حالة السلة، واستمرارية الإعدادات بالإضافة إلى لقطات عبر الثيمات الثلاث لضمان التوافق الزجاجي.

### 💳 Checkout UX
- **ملخص زجاجي تفاعلي**: صفحة `/checkout` تعرض بطاقة زجاجية للملخص مع إمكانية تعديل الكمية (أزرار + سحب على الجوال) وتحديثات `aria-live` للإجماليات، مع تنبيهات للمخزون أو الأسماء الطويلة.
- **نماذج محسّنة**: حقول العميل والشحن تعتمد `Input`/`Textarea` من طقم الزجاج، وتظهر رسائل الخطأ أسفل الحقول مع تعقب `focus-visible` و`aria-invalid` لضمان الوضوح.
- **طرق الدفع**: يتم تحميل خيارات الدفع عبر مكوّن كسول `CheckoutPaymentSection` مع إشارة أن الطرق الإلكترونية Placeholder الآن، بينما يبقى الدفع عند الاستلام مفعلاً.
- **حالات الفراغ/الخطأ**: عند فراغ العربة يتم حفظ آخر متجر تمت زيارته عبر `localStorage` لتقديم CTA سريع، ويُعرض شريط خطأ موحد مع `aria-live="assertive"` وإمكانية المحاولة مجدداً.
- **تأكيد محسن**: صفحة `/order/confirmation` تولد إيصالاً زجاجياً يتضمن رقم الطلب، الإجمالي، حالة الدفع، وأزرار "نسخ الرقم" و"العودة للمتجر"، مع دعم `prefers-reduced-motion` وروابط قابلة للمشاركة.
- **ملاحظات الدفع**: الطرق الإلكترونية (بطاقة/محفظة) معروضة كواجهات UI فقط حالياً، وستُفعّل بعد ربط مزوّد الدفع الحالي؛ لا تغييرات على مزود Supabase أو التدفق الخلفي.

### 🔧 المساهمة
1. Fork المشروع
2. أنشئ فرع
3. Commit
4. Push
5. فتح Pull Request

### 📝 الترخيص
المشروع مرخص تحت رخصة MIT

### 🤝 الدعم
للمساعدة: support@atlantis-platform.com

---

## 🇬🇧 English

# Atlantis E-commerce Platform

## 🚀 Project Overview
**Lovable Project URL**: https://lovable.dev/projects/bcb1c4b5-98be-4432-b045-2bf9a24e6860

An integrated e-commerce system with affiliate marketing and multi-store support built with React, TypeScript, and Supabase.

## 🛠️ Local Development Setup
### Prerequisites
- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or yarn
- Modern browser with WebGL 2 support (Chrome 113+, Edge 113+, Safari 16+)
### Quick Start
```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
# 2. Install dependencies
npm install
# 3. Setup environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials
# 4. Start development server
npm run dev
```

### 🌌 WebGL & 3D Theme Requirements
- The lightweight 3D hero scenes rely on [`three`](https://threejs.org/) and [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber).
- Ensure WebGL is enabled in the browser; headless or server-only environments fall back to a textual placeholder automatically.
- When embedding the hero elsewhere, wrap your UI with the shared `ThemeProvider` so the correct theme-specific camera and lighting presets are applied.

## 🎨 3D Theme System *(نظام الثيمات ثلاثية الأبعاد)*

### 📍 **الثيمات المتاحة حالياً:**
- **Default Horizon** (`src/themes/default/`) - مكعب تفاعلي مع إضاءة متوازنة
- **Damascus Twilight** (`src/themes/damascus/`) - منحوتة دمشقية مع تأثيرات bloom
- **Luxury Mirage** (`src/themes/luxury/`) - كرة ذهبية فاخرة مع إضاءة متطورة

### 🛠️ **كيفية إنشاء ثيم جديد:**
1. انسخ مجلد `src/themes/default` إلى `src/themes/your-theme-name`
2. عدل `theme.json` لتخصيص الألوان والإعدادات ثلاثية الأبعاد
3. عدل `Hero3D.tsx` لتخصيص المحتوى والتصميم
4. عدل `tokens.css` لتخصيص متغيرات CSS

### 📚 **للمزيد من التفاصيل:**
- **[📖 دليل الثيمات الكامل](THEMES_3D_GUIDE.md)** - شرح شامل للنظام
- **[🎯 مثال عملي](examples/custom-theme-example/)** - ثيم "نسيم المحيط" كمثال

### 🔧 **مكونات النظام الأساسية:**
- `src/three/SimpleScene.tsx` - محرك العرض ثلاثي الأبعاد
- `src/three/loaders.ts` - تحميل نماذج GLB
- `src/themes/types.d.ts` - تعريفات TypeScript
- `public/models/` - النماذج ثلاثية الأبعاد (cube.glb, sphere.glb, model.glb)

### 🎛️ **الميزات التقنية:**
- Theme definitions live in `src/themes/<id>/theme.json`
- CSS custom properties for every theme are declared in `src/themes/<id>/tokens.css`
- To create a new theme copy the entire `src/themes/default` folder, tweak the JSON values, and adjust the corresponding `tokens.css` file.
- Core primitives in `src/ui` (`Button`, `Card`, `Input`, `Badge`) read CSS variables and the active `ThemeProvider` context
- Homepage exposes `<ThemeSwitcher />` and component gallery
- Heavy 3D assets should be lazy loaded; the default, luxury, Damascus heroes ship with lightweight GLB examples
- Shared sample GLB files live in `public/models`
- “Damascus Twilight” preset demonstrates bloom, fog, and shadow tuning.

### 🗃️ Binary-safe assets via Base64
- The repository stays text-only: icons, favicons, and GLB samples are encoded inside `assets/asset-manifest.json`.
- `npm install` triggers `scripts/decodeAssets.mjs`, which rebuilds `/public/models` and other binary assets from the Base64 manifest.
- Missing assets regenerate automatically—delete `/public/models` or `/public/*.png`, rerun the script (or reinstall), and the files are decoded again.

## 🧭 App Shell & Navigation
- **Component hierarchy**: The shell orchestrates `Header`, `SidebarDesktop`, `BottomNavMobile`, `PageTitle`, and `ActionBar` inside `AppShell`, with `SkipToContent` wired to `<main id="content">` for screen readers.
- **Role-aware menus**: Admins see management groups while affiliates/marketers see storefront and performance destinations; hidden routes never surface across roles.
- **Performance strategy**: Core routes are lazy loaded and prefetched on hover/focus so drawer/sidebars remain responsive within the glass UI.
- **Accessibility guarantees**: Labeled navigation landmarks, AA-compliant focus rings, and the skip link keep keyboard traversal predictable on both desktop and mobile.

## 🏠 Home Dashboards
- **Component structure**: Both `AdminHome` and `MarketerHome` render inside the glass `AppShell`, layering a `PageTitle`, KPI grids via `KpiCard`, and lazy widgets like `MiniChart`, `AdminRecentOrdersTable`, and `SystemAlertsWidget` that pull from theme tokens.
- **Role routing**: Routing guards keep `/admin/dashboard` reserved for admins while `/affiliate` serves affiliates/marketers, and quick links only surface destinations allowed by the active role.
- **Performance notes**: Charts and tables are code-split with `React.lazy` + `Suspense`, respecting `prefers-reduced-motion` before animating paths, and SVG styling is bound to the current theme variables.
- **Accessibility guidance**: KPI deltas announce via `aria-live`, quick actions expose keyboard-friendly focus states, and chart captions summarize data trends for assistive technologies.

## 🗂️ Admin Managers (Orders & Customers)
- **Filters & search**: `/admin/orders` and `/admin/customers` expose glass filter toolbars for status, date presets (today/7d/30d/custom), spend ranges, and text search. All inputs join a single query key so cached Supabase-ready responses can be reused without redundant fetches.
- **Drawers & performance**: Detail drawers are lazy loaded, respect `prefers-reduced-motion`, and reuse a shared focus trap so keyboard users can cycle fields and close with `Escape`.
- **CSV export**: Each manager ships a CSV exporter that serializes the currently filtered dataset, generating lightweight blobs and download links without blocking the UI.
- **Cross navigation**: The customer drawer includes a "view in orders" action that routes to `/admin/orders?customer=...`, reusing the cached store to surface the same filter state instantly.

## 🛍️ Public Storefront for Marketers
- **Route & layout**: The public store lives at `/:slug`, presenting a glass header with store branding, marketer attribution, and a persistent CTA to `/checkout`.
- **Glass hero & grid**: A theme-aware 3D hero (with reduced-motion fallback) leads into a lazy product grid that reuses the glass `Card` primitive, `var(--surface)` layers, and lazy-loaded imagery.
- **Cart flow**: Adding a product keeps state in the isolated storefront cart session and surfaces the basket total, guiding shoppers into `/checkout` and `/order/confirmation` without breaking the flow.
- **Marketer settings**: Affiliates can configure store name, tagline, logo, accent color, and hero mode inside `Affiliate → Store → Settings`, persisted locally through `useStorefrontSettings` until Supabase APIs are connected.
- **Testing & snapshots**: Dedicated render, cart, settings, and theme snapshot tests ensure the storefront honors all themes and keeps marketer choices consistent.

## 💳 Checkout UX
- **Glass summary**: `/checkout` renders a responsive glass card summarising cart items with quantity controls, swipe-to-remove gestures, and polite `aria-live` announcements for total updates.
- **Form validation**: Customer and shipping inputs rely on the glass UI kit with inline error hints, focus-visible rings, and button states that keep "Pay now" disabled until required fields pass validation.
- **Payment placeholders**: `CheckoutPaymentSection` lazy loads the payment options; cash on delivery is active today while card/wallet entries remain UI-only placeholders awaiting the existing provider wiring.
- **Empty/error states**: When the cart is empty the flow reads the last visited storefront slug from `localStorage` to route shoppers back quickly, and shared error banners expose retry actions with `aria-live="assertive"` messaging.
- **Confirmation receipt**: `/order/confirmation` shows a glass receipt with order number, totals, payment status, shipping address, copy/share actions, and reduced-motion friendly markup so notifications can deep-link into the page confidently.
- **No gateway changes**: Payment provider integrations remain untouched—UI polish only—so the Supabase order/payment tables continue working without migrations.

## 👤 Unified Profile & Activity Center
- **Routes & entry points**: The account menu now links to `/profile` and `/notifications`, both rendered inside the glass `AppShell` with skip links targeting `#profile-main` and `#notifications-main` for keyboard users.
- **Profile structure**: `ProfilePage` composes a hero card with avatar/name/role badges, then exposes tabs (`overview`, `security`, `preferences`) built on the in-house `Tabs` component. Security management lists trusted sessions with glass cards, while preferences surface theme, language, and reduced-motion toggles wired to CSS variables.
- **Activity center**: `/notifications` reuses the kit `Card`, `Badge`, and `Button` primitives to present notifications and a timeline. Lists implement roving focus via `getNextFocusIndex` and honor ENTER/SPACE for marking items as read, while the drawer badge stays in sync with `useInbox`.
- **Hooks & state**: `useUserProfile` wraps `useFastAuth` to normalise profile data, persist preferences/security to localStorage, and fan-out updates to the `ThemeProvider` plus `document.lang`. `useInbox` exposes a namespaced store with SSR-friendly fallbacks, marking items read, clearing, and lazy-loading activity.
- **Extensibility**: Both hooks return reset methods so future Supabase integration can swap the persistence layer without changing the UI. New sections (e.g., payment methods, notification filters) can slot into additional `TabsTrigger` entries while reusing the same glass cards and keyboard helpers.
- **Tests & docs**: Render checks, theme snapshots, inbox unit tests, and keyboard a11y tests live under `tests/profile.*`, `tests/notifications.*`, and `tests/a11y.keyboard.nav.test.js` to guarantee consistent markup across themes and correct state transitions.

## 📱 Progressive Web App & الأداء
- **التثبيت (Add to Home Screen)**: المتصفح يرصد `manifest.webmanifest` الجديد ويعرض زر "تثبيت التطبيق" على Chrome وEdge وSafari (iOS 17+). على سطح المكتب تظهر أيقونة التثبيت ضمن شريط العنوان، وعلى الموبايل يمكن الضغط على القائمة ثم "إضافة إلى الشاشة الرئيسية" للحصول على تجربة `standalone` بدون شريط المتصفح.
- **العمل دون اتصال**: `sw.js` يستخدم استراتيجيات cache-first للأصول (JS/CSS/الخطوط) وstale-while-revalidate للصور، مع fallback `offline.html` بزجاج tokens يعرض رسالة "أنت غير متصل الآن" وزر إعادة المحاولة. يتم تسخين المسارات الأساسية (`/`, `/affiliate`, `/admin`, `/checkout`, `/order/confirmation`) أثناء التثبيت لضمان عرض سريع حتى في حالة ضعف الشبكة.
- **إدارة الإصدارات وتفريغ الكاش**: يتم تمييز الذاكرة المؤقتة بالمعرّف `anaqati-pwa-v2`. عند نشر نسخة جديدة يكفي تحديث رقم الإصدار داخل service worker؛ سيحذف الإصدار السابق ويطبّق `skipWaiting` تلقائياً. لمسح الكاش يدوياً انتقل إلى DevTools → Application → Service Workers واختر "Unregister" ثم أعد تحميل الصفحة.
- **تعطيل/تحديث الخدمة أثناء التطوير**: استدعاء `unregisterServiceWorker()` (من `src/pwa/registerServiceWorker`) أو تشغيل `npm run dev` سيمنع التسجيل. يمكن أيضاً استخدام DevTools → Application لتعطيل خيار "Update on reload" أثناء التطوير.
- **مؤشرات الويب الحيوية**: يتم تسجيل قيم CLS/LCP/INP في الـConsole عبر `web-vitals`. المقاييس على أجهزة أندرويد متوسطة انخفضت تقريباً من LCP ≈ ‎3.1s إلى ‎1.9s، وCLS من ‎0.12 إلى ‎0.03 بفضل التحميل الكسول للـHero ثلاثي الأبعاد وتقسيم حزم `/checkout` و`/public-storefront`.
- **تحسينات الصور والأصول**: تم إنشاء أيقونات PWA بمقاسات 192/256/512، استخدام `srcset` في الأبطال (عبر المكونات القائمة) مع cache headers الافتراضية من Vite، والاستعداد لدمج CDN لاحقاً عبر بنية `public/` المجزأة. احترام `prefers-reduced-motion` يوقف دورات WebGL على الأجهزة الحساسة ويوفر بطاريات أفضل.
- **شريط الثيم في الأنظمة**: يتم تحديث `<meta name="theme-color">` عند تبديل الثيم ليطابق `--primary` الفعال، ما يجعل شريط الحالة على أندرويد و iOS يعكس ألوان (default/luxury/damascus) فورياً حتى في وضع `standalone`.

## 📊 Admin Core
- **Dashboard overview**: `/admin/dashboard` now reads the shared `useAdminAnalytics` store so the KPI row stays in sync with sales-day, seven-day, and thirty-day metrics. The hero mini-chart reuses the 14-day order trend while respecting `prefers-reduced-motion`, and placeholders fall back to the user data context if the analytics store has not warmed.
- **Analytics dashboard**: `/admin/analytics` composes glass `Card` widgets for daily/weekly/monthly sales, top products/affiliates, and a two-week order trend rendered with a lightweight SVG line chart. Metrics and rankings pull from the `useAdminAnalytics` store which seeds mock values today and exposes a `refresh` method for future Supabase wiring.
- **Orders management**: `/admin/orders` surfaces a searchable, filterable table with status badges, sort toggles (total/date), pagination, and a glass side drawer for full order details. State comes from `useAdminOrders`, an external store that handles filtering, sorting, paging, and refresh transitions while returning derived slices for the UI and tests.
- **Customers workspace**: `/admin/customers` offers segment filters, quick search, and a detail drawer summarising contact info, spend, and recent orders. The `useAdminCustomers` hook manages the mock dataset, search/filter combinations, pagination, and exposes reset/refresh helpers so Supabase data can drop-in later.
- **Leaderboard & commissions**: `/admin/leaderboard` introduces a glass leaderboard fed by the new `useAdminLeaderboard` store. Summary KPIs, a dual-line SVG chart, and twin tables show top affiliates by points and commission with cached snapshots and deterministic refresh steps ready for Supabase swaps.
- **Skeletons & accessibility**: Each page shows glass-aligned skeleton placeholders while stores report `isLoading`, respects `prefers-reduced-motion` by avoiding forced transitions, and keeps keyboard focus states visible across tables, filters, and drawers.
- **Testing & theming**: Dedicated render, table-interaction, and snapshot tests live under `tests/admin.*` to verify the three surfaces across default/luxury/damascus themes without needing live data sources.

### 🔐 Environment Variables
**IMPORTANT SECURITY NOTES:**
- NEVER commit `.env` files to git
- Use `.env.example` as a template
- In production, use Supabase Secrets

## 📝 Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🗃️ Database Policies & Indexes
- Row-level security policies and indexes in `sql/01_policies.sql` and `sql/02_indexes.sql`.
- Apply them via Supabase CLI or dashboard.

## 💸 Commissions Pipeline
- Payment completion wired to affiliate payouts in `sql/03_commissions_pipeline.sql`.

## 🏆 Points & Monthly Leaderboard
- Paid orders emit gamified point events plugged into the leaderboard in `sql/04_points_leaderboard.sql`.

## 🎯 Minimal Affiliate Dashboard
- `/affiliate` route renders a dashboard for affiliates.
- Access limited to authenticated affiliates.

## 📦 Internal Inventory
- Run `sql/05_internal_inventory.sql` to enable new inventory tables.

## 🔄 Development Workflow
- Using Lovable (Recommended): https://lovable.dev/projects/bcb1c4b5-98be-4432-b045-2bf9a24e6860
- Using Local IDE
- Branch & PR Workflow
- GitHub Integration

## What technologies are used for this project?
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?
Open Lovable and click Share -> Publish.

## Can I connect a custom domain to my Lovable project?
Yes, you can!
- Go to Project > Settings > Domains
- Click Connect Domain
- [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
