# هيكل مكونات مدير المتجر

## 🎯 نظرة عامة

تم تقسيم ملف `AffiliateStoreManager.tsx` (1,303 سطر) إلى بنية منظمة ومودولية.

## 📊 البنية الهرمية

```
AffiliateStoreManager.tsx (252 سطر) ✨
│
├── store-manager/ (المجلد الرئيسي)
│   │
│   ├── 📄 Types & Utilities
│   │   ├── types.ts                    # جميع الأنواع المشتركة
│   │   └── index.ts                    # Barrel export
│   │
│   ├── 🎣 Custom Hooks
│   │   ├── useStoreManager.ts          # إدارة الحالة الأساسية
│   │   ├── useCategoriesManagement.ts  # إدارة الفئات
│   │   └── useHeroSettings.ts          # إدارة القسم الرئيسي
│   │
│   └── 🧩 Components
│       ├── StoreHeader.tsx             # رأس المتجر
│       ├── TabsNavigation.tsx          # التنقل
│       │
│       └── Tabs/ (التبويبات)
│           ├── GeneralSettingsTab.tsx  # الإعدادات العامة
│           ├── AppearanceTab.tsx       # المظهر
│           ├── HeroSectionTab.tsx      # القسم الرئيسي
│           ├── CategoriesTab.tsx       # الفئات
│           ├── SharingTab.tsx          # المشاركة
│           └── AnalyticsTab.tsx        # الإحصائيات
```

## 🔄 تدفق البيانات

```
┌─────────────────────────────────────────────┐
│     AffiliateStoreManager (Main)            │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Custom Hooks (State Management)      │ │
│  │  • useStoreManager                    │ │
│  │  • useCategoriesManagement            │ │
│  │  • useHeroSettings                    │ │
│  └───────────────────────────────────────┘ │
│              ↓ Props & Callbacks            │
│  ┌───────────────────────────────────────┐ │
│  │  Presentational Components            │ │
│  │  • StoreHeader                        │ │
│  │  • Tabs (8 components)                │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 📦 تفاصيل الملفات

### Types (types.ts)
```typescript
- Store
- HeroSettings
- EditData
- TabValue
- Theme
- AffiliateStoreManagerProps
- CurrentSection
```

### Hooks (3 files)

#### useStoreManager.ts
```typescript
Returns:
- isEditing, setIsEditing
- editData, setEditData
- storeUrl
- handleSaveChanges()
- copyStoreLink()
- shareStore()
```

#### useCategoriesManagement.ts
```typescript
Returns:
- displayStyle, setDisplayStyle
- categories
- storeProducts
- loadingProducts
- toggleCategoryStatus()
- handleCategoryEdit()
- handleAddCategory()
- handleDeleteCategory()
- saveCategorySettings()
```

#### useHeroSettings.ts
```typescript
Returns:
- heroSettings, setHeroSettings
- handleHeroImageUpload()
- saveHeroSettings()
```

### Components (8 files)

#### StoreHeader.tsx
```typescript
Props:
- store
- storeUrl
- isEditing
- onEditToggle
```

#### GeneralSettingsTab.tsx
```typescript
Props:
- store
- isEditing
- editData
- onEditDataChange
- onSave
- onCopyLink
- onCancelEdit
```

#### AppearanceTab.tsx
```typescript
Props:
- store
- isEditing
- onLogoUpload
- onSave
```

#### HeroSectionTab.tsx
```typescript
Props:
- heroSettings
- onSettingsChange
- onImageUpload
- onSave
```

#### CategoriesTab.tsx
```typescript
Props:
- displayStyle
- onDisplayStyleChange
- categories
- storeProducts
- loadingProducts
- onToggleCategoryStatus
- onCategoryEdit
- onCategoryAdd
- onCategoryDelete
- onSave
```

#### SharingTab.tsx
```typescript
Props:
- storeUrl
- qrCodeDataUrl
- isGeneratingQR
- onCopyLink
- onShareStore
- onGenerateQR
- onDownloadQR
- storeSlug
```

#### AnalyticsTab.tsx
```typescript
Props:
- analytics
- loading
- store
```

#### TabsNavigation.tsx
```typescript
Props:
- activeTab
- onTabChange
```

## 🎨 Design Patterns

### 1. Separation of Concerns
- **Hooks:** إدارة الحالة والـ logic
- **Components:** العرض والـ UI فقط

### 2. Single Responsibility
- كل component له مسؤولية واحدة واضحة

### 3. DRY (Don't Repeat Yourself)
- استخدام custom hooks لتجنب التكرار

### 4. Composition over Inheritance
- تجميع components صغيرة لبناء واجهة كاملة

## 🔧 الاستخدام

### استيراد بسيط
```typescript
import {
  StoreHeader,
  GeneralSettingsTab,
  useStoreManager,
  type Store
} from './store-manager';
```

### استيراد شامل
```typescript
import * as StoreManager from './store-manager';
```

## 📈 الفوائد

### قبل:
❌ ملف واحد كبير (1,303 سطر)
❌ صعوبة التنقل والصيانة
❌ لا يمكن إعادة استخدام الأجزاء
❌ صعوبة الاختبار

### بعد:
✅ ملف رئيسي صغير (252 سطر)
✅ سهولة التنقل والصيانة
✅ components قابلة لإعادة الاستخدام
✅ سهولة كتابة الاختبارات
✅ تحسين الأداء (code splitting)

---

**Documentation Version:** 1.0.0
**Last Updated:** 2025-11-23
