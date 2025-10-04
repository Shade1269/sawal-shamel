# 🎨 دليل نظام الثيمات ثلاثية الأبعاد
*(3D Themes System Guide)*

---

## 📋 نظرة عامة

نظام الثيمات ثلاثية الأبعاد في منصة أتلانتس يوفر تجربة بصرية تفاعلية متطورة لكل متجر. يمكن للتجار اختيار من بين ثيمات متنوعة، كل منها يحتوي على مشهد ثلاثي الأبعاد مخصص مع إعدادات إضاءة وكاميرا وتأثيرات بصرية فريدة.

---

## 🗂️ هيكل النظام

### الثيمات المتاحة حالياً:

#### 1. **Default Horizon** (`default`)
```
src/themes/default/
├── Hero3D.tsx          # مكون العرض ثلاثي الأبعاد
├── theme.json          # تكوين الثيم والإعدادات ثلاثية الأبعاد
└── tokens.css          # متغيرات CSS
```

**الخصائص:**
- 🎲 **النموذج:** مكعب تفاعلي
- 📐 **الكاميرا:** زاوية 45° ومسافة متوازنة
- 💡 **الإضاءة:** ضوء محيطي + موجه + نقطي
- ✨ **التأثيرات:** ضباب خفيف وظلال ناعمة

#### 2. **Damascus Twilight** (`damascus`) 
```
src/themes/damascus/
├── Hero3D.tsx          # مكون مخصص بهوية دمشقية
├── theme.json          # إعدادات الألوان والإضاءة الشرقية
└── tokens.css          # متغيرات بألوان دافئة
```

**الخصائص:**
- 🏺 **النموذج:** منحوتة دمشقية تراثية
- 🎥 **الكاميرا:** موضعة لإبراز التفاصيل التراثية
- 🔆 **الإضاءة:** ضوء ذهبي دافئ + تأثير spot
- 🌫️ **التأثيرات:** bloom مفعل + ضباب ملون

#### 3. **Luxury Mirage** (`luxury`)
```
src/themes/luxury/
├── Hero3D.tsx          # تصميم فاخر بلمسات ذهبية
├── theme.json          # إعدادات الرفاهية والفخامة
└── tokens.css          # متغيرات بألوان ذهبية
```

**الخصائص:**
- 💎 **النموذج:** كرة ذهبية فاخرة
- 📷 **الكاميرا:** زاوية مثالية للعرض الفاخر
- ✨ **الإضاءة:** ثلاثة مصادر ضوء لتدرجات ذهبية
- 🎆 **التأثيرات:** bloom عالي الكثافة + ظلال دقيقة

---

## ⚙️ مكونات النظام الأساسية

### 1. محرك العرض الرئيسي
```typescript
// src/three/SimpleScene.tsx
export const SimpleScene = memo(function SimpleScene({
  config,           // تكوين الثيم من theme.json
  enabled = true,   // تفعيل/إلغاء تفعيل العرض
  className,        // CSS classes
  accentColor,      // لون مميز للثيم
})
```

### 2. تحميل النماذج
```typescript
// src/three/loaders.ts
export const GLB_EXAMPLES = {
  cube: "/models/cube.glb",      // مكعب بسيط
  sphere: "/models/sphere.glb",  // كرة
  model: "/models/model.glb",    // نموذج دمشقي
};
```

### 3. أنواع البيانات
```typescript
// src/themes/types.d.ts
export type ThemeThree = {
  background?: string;
  camera: {
    position: [number, number, number];
    fov?: number;
  };
  lights: Array<{
    type: 'ambient' | 'directional' | 'point' | 'spot';
    intensity: number;
    position?: [number, number, number];
    color?: string;
  }>;
  model?: ThemeThreeModel;
  effects?: ThemeThreeEffects;
};
```

---

## 🛠️ إنشاء ثيم جديد

### الخطوة 1: إنشاء مجلد الثيم
```bash
mkdir src/themes/my-theme
```

### الخطوة 2: ملف التكوين
```json
// src/themes/my-theme/theme.json
{
  "id": "my-theme",
  "name": "اسم الثيم",
  "colors": {
    "bg": "#1a1a1a",
    "fg": "#ffffff",
    "primary": "#ff6b6b",
    // ... باقي الألوان
  },
  "three": {
    "background": "#000000",
    "camera": {
      "position": [0, 1, 3],
      "fov": 50
    },
    "lights": [
      {
        "type": "ambient",
        "intensity": 0.6
      },
      {
        "type": "directional",
        "intensity": 1.0,
        "position": [2, 2, 2],
        "color": "#ffffff"
      }
    ],
    "model": {
      "example": "cube",
      "scale": [1, 1, 1],
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "autoRotate": true,
      "rotationSpeed": 0.5
    },
    "effects": {
      "bloom": { "enabled": false },
      "fog": { "color": "#000000", "near": 5, "far": 15 },
      "shadow": { "enabled": true }
    }
  }
}
```

### الخطوة 3: مكون Hero3D
```tsx
// src/themes/my-theme/Hero3D.tsx
import React, { memo } from "react";
import { SimpleScene } from "@/three/SimpleScene";
import theme from "./theme.json" with { type: "json" };

const themeConfig = theme;

export const Hero3D = memo(function MyThemeHero3D() {
  const borderColor = themeConfig.colors.border ?? "rgba(255, 107, 107, 0.3)";
  
  return (
    <section
      style={{
        width: "100%",
        minHeight: "320px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.5rem",
        background: "linear-gradient(135deg, rgba(26,26,26,0.9), rgba(26,26,26,0.7))",
        color: "var(--fg)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${borderColor}`,
        padding: "1.5rem",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ position: "relative", minHeight: "280px" }} data-hero-canvas>
        <SimpleScene
          config={themeConfig.three}
          accentColor={themeConfig.colors.primary}
          className="hero-3d__canvas my-theme"
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.75rem" }}>
        <p style={{ fontSize: "1.75rem", fontWeight: 700 }}>عنوان الثيم</p>
        <p style={{ lineHeight: 1.6, fontSize: "1rem", opacity: 0.85 }}>
          وصف تفصيلي للثيم وميزاته ثلاثية الأبعاد.
        </p>
        <ul style={{ margin: 0, paddingInlineStart: "1.1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {["ميزة أولى", "ميزة ثانية", "ميزة ثالثة"].map((item, index) => (
            <li key={index} style={{ opacity: 0.82 }}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
});

export default Hero3D;
```

### الخطوة 4: ملف CSS
```css
/* src/themes/my-theme/tokens.css */
[data-theme="my-theme"] {
  --bg: #1a1a1a;
  --fg: #ffffff;
  --primary: #ff6b6b;
  --primary-fg: #ffffff;
  /* ... باقي المتغيرات */
}
```

---

## 🎛️ إعدادات متقدمة

### إعدادات الكاميرا
```json
"camera": {
  "position": [x, y, z],  // موضع الكاميرا في الفضاء ثلاثي الأبعاد
  "fov": 45               // زاوية الرؤية (مجال الرؤية)
}
```

### أنواع الإضاءة
```json
"lights": [
  {
    "type": "ambient",      // إضاءة محيطية عامة
    "intensity": 0.6        // شدة الإضاءة
  },
  {
    "type": "directional",  // إضاءة موجهة (مثل الشمس)
    "intensity": 1.0,
    "position": [x, y, z],
    "color": "#ffffff"
  },
  {
    "type": "point",        // إضاءة نقطية
    "intensity": 0.8,
    "position": [x, y, z],
    "color": "#58a6ff"
  },
  {
    "type": "spot",         // إضاءة كشاف
    "intensity": 0.9,
    "position": [x, y, z],
    "color": "#ff6b6b"
  }
]
```

### تأثيرات بصرية
```json
"effects": {
  "bloom": {
    "enabled": true,        // تفعيل تأثير التوهج
    "intensity": 1.0        // شدة التوهج
  },
  "fog": {
    "color": "#000000",     // لون الضباب
    "near": 5,              // بداية الضباب
    "far": 15               // نهاية الضباب
  },
  "shadow": {
    "enabled": true,        // تفعيل الظلال
    "bias": -0.0004,        // تعديل موضع الظل
    "mapSize": [1024, 1024], // دقة خريطة الظل
    "radius": 2.5           // نعومة حواف الظل
  }
}
```

---

## 🔧 استخدام النظام

### في المكونات
```tsx
import { Hero3D } from "@/themes/default/Hero3D";

function MyPage() {
  return (
    <div>
      <Hero3D />
    </div>
  );
}
```

### مع إدارة الثيمات
```tsx
import { ThemeManager } from "@/components/store/ThemeManager";

function StoreSettings({ storeId }) {
  return (
    <ThemeManager 
      storeId={storeId}
      onThemeChanged={(theme) => {
        console.log('تم تغيير الثيم إلى:', theme.name);
      }}
    />
  );
}
```

---

## 🚀 نصائح الأداء

### 1. **تحميل الموارد**
- النماذج GLB يتم تحميلها بشكل تلقائي
- يتم حفظها في cache لتحسين الأداء
- دعم للتحميل المتقطع (lazy loading)

### 2. **دعم المتصفحات**
- يتطلب دعم WebGL 2
- يتم عرض نص بديل في حالة عدم الدعم
- اختبار تلقائي لقدرات المتصفح

### 3. **الأداء**
```javascript
// التحقق من دعم WebGL
import { detectWebGLSupport } from "@/three/simpleSceneRuntime";

if (detectWebGLSupport()) {
  // عرض المشهد ثلاثي الأبعاد
} else {
  // عرض محتوى بديل
}
```

---

## 📝 الاختبارات

### اختبار المكونات
```javascript
// tests/hero.3d.test.js
test('Hero3D renders a canvas surface when WebGL is available', async () => {
  const { Hero3D } = await import('../src/themes/default/Hero3D.tsx');
  const html = renderToStaticMarkup(React.createElement(Hero3D));
  assert.ok(html.includes('data-hero-canvas'));
});
```

---

## ❓ الأسئلة الشائعة

### س: كيف أضيف نموذج GLB جديد؟
ج: ضع الملف في `public/models/` وأضف المسار في `loaders.ts`

### س: هل يمكن تخصيص الألوان بشكل ديناميكي؟
ج: نعم، من خلال تمرير `accentColor` لمكون `SimpleScene`

### س: ماذا لو لم يدعم المتصفح WebGL؟
ج: يتم عرض نص بديل تلقائياً دون أخطاء

### س: كيف أحسن الأداء؟
ج: استخدم نماذج GLB مضغوطة وتجنب التأثيرات المعقدة غير الضرورية

---

## 📞 الدعم الفني

للمساعدة في إنشاء أو تخصيص الثيمات ثلاثية الأبعاد:
- 📧 البريد الإلكتروني: support@atlantis-platform.com
- 📖 الوثائق: قسم "Theme System" في README.md
- 🐛 الأخطاء: افتح issue على GitHub

---

*تم إنشاء هذا الدليل لمساعدة المطورين في فهم واستخدام نظام الثيمات ثلاثية الأبعاد بكفاءة.*