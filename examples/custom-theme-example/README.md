# مثال ثيم "نسيم المحيط"
*(Ocean Breeze Theme Example)*

هذا مثال كامل على كيفية إنشاء ثيم مخصص ثلاثي الأبعاد من الصفر.

## 📁 الملفات المطلوبة:

### 1. `theme.json` - تكوين الثيم
يحتوي على جميع إعدادات الثيم من ألوان وخطوط وإعدادات ثلاثية الأبعاد.

**الميزات الرئيسية:**
- ألوان زرقاء محيطية هادئة
- إضاءة تحاكي ضوء الماء
- تأثير bloom للتوهج الطبيعي
- كاميرا موضعة لأفضل عرض

### 2. `Hero3D.tsx` - مكون العرض
المكون الأساسي الذي يعرض المشهد ثلاثي الأبعاد مع الوصف.

**الميزات:**
- تخطيط متجاوب (responsive)
- نصوص وصفية مخصصة
- ألوان ديناميكية من التكوين
- تأثيرات CSS متقدمة

### 3. `tokens.css` - متغيرات CSS
يحتوي على جميع متغيرات CSS وتأثيرات الثيم.

**يتضمن:**
- متغيرات الألوان والظلال
- تأثيرات الحركة
- تخصيص شريط التمرير
- تأثيرات hover للعناصر

## 🚀 كيفية الاستخدام:

### الخطوة 1: النسخ
```bash
cp -r examples/custom-theme-example src/themes/ocean-breeze
```

### الخطوة 2: التسجيل
أضف الثيم في نظام إدارة الثيمات:

```typescript
// src/themes/registry.ts
import { Hero3D as OceanBreezeHero3D } from './ocean-breeze/Hero3D';

export const themeComponents = {
  // ... الثيمات الموجودة
  'ocean-breeze': {
    Hero3D: OceanBreezeHero3D,
  },
};
```

### الخطوة 3: إضافة CSS
استورد ملف CSS في التطبيق الرئيسي:

```css
/* src/index.css */
@import './themes/ocean-breeze/tokens.css';
```

### الخطوة 4: الاختبار
```tsx
import { Hero3D } from '@/themes/ocean-breeze/Hero3D';

function TestPage() {
  return (
    <div data-theme="ocean-breeze">
      <Hero3D />
    </div>
  );
}
```

## 🎨 التخصيص:

### تغيير الألوان
عدل الألوان في `theme.json`:
```json
{
  "colors": {
    "primary": "#your-color",
    "bg": "#your-background"
  }
}
```

### تعديل المشهد ثلاثي الأبعاد
```json
{
  "three": {
    "camera": {
      "position": [x, y, z],
      "fov": 45
    },
    "model": {
      "example": "cube|sphere|model",
      "rotationSpeed": 0.5
    }
  }
}
```

### إضافة تأثيرات جديدة
```json
{
  "effects": {
    "bloom": { "enabled": true, "intensity": 1.2 },
    "fog": { "color": "#color", "near": 5, "far": 15 }
  }
}
```

## 📝 ملاحظات مهمة:

1. **الأداء**: احرص على استخدام قيم معقولة للتأثيرات
2. **التوافق**: تأكد من دعم WebGL في المتصفحات المستهدفة  
3. **الألوان**: استخدم ألوان متناسقة مع هوية العلامة التجارية
4. **النماذج**: استخدم ملفات GLB مضغوطة لتحسين الأداء

## 🔗 روابط مفيدة:

- [دليل الثيمات الكامل](../THEMES_3D_GUIDE.md)
- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Compatibility](https://caniuse.com/webgl2)

---

*هذا المثال يوضح جميع المفاهيم الأساسية لإنشاء ثيم ثلاثي الأبعاد احترافي.*