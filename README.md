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

## 🎨 Theme System
- Theme definitions live in `src/themes/<id>/theme.json`.
- CSS custom properties for every theme are declared in `src/themes/<id>/tokens.css`.
- To create a new theme copy the entire `src/themes/default` folder, tweak the JSON values, and adjust the corresponding `tokens.css` file.
- Core primitives in `src/ui` (`Button`, `Card`, `Input`, `Badge`) read CSS variables and the active `ThemeProvider` context.
- Homepage exposes `<ThemeSwitcher />` and component gallery.
- Heavy 3D assets should be lazy loaded; the default, luxury, Damascus heroes ship with lightweight GLB examples.
- Shared sample GLB files live in `public/models`.
- “Damascus Twilight” preset demonstrates bloom, fog, and shadow tuning.

### 🗃️ Binary-safe assets via Base64
- Lightweight GLB samples are committed as Base64 text under `assets/base64`.
- A `postinstall` script runs after `npm install` to decode assets.

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
