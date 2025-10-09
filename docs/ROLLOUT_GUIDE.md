# Unified Orders System - Rollout Guide

## دليل الإطلاق التدريجي

### نظرة عامة

الإطلاق التدريجي (Gradual Rollout) يسمح بتفعيل النظام الموحد تدريجياً لتقليل المخاطر وضمان الاستقرار.

## خطة الإطلاق (4 مراحل)

### المرحلة 1: التحقق الأولي (Week 1) ✅
**الهدف**: التأكد من صحة البيانات والبنية التحتية

**الإجراءات:**
```bash
# 1. فحص جودة البيانات
SELECT * FROM check_data_quality();

# 2. التحقق من الـ Backfill
SELECT 
  source,
  COUNT(*) as count 
FROM order_hub 
GROUP BY source;

# 3. فحص العلاقات
SELECT 
  COUNT(DISTINCT order_hub_id) as linked_orders
FROM product_returns;
```

**معايير النجاح:**
- ✅ جميع الطلبات التاريخية في order_hub
- ✅ العلاقات مربوطة بشكل صحيح
- ✅ لا توجد أخطاء في الـ Database Logs

**Feature Flags:**
```typescript
USE_UNIFIED_ORDERS: false        // لا يزال معطل
SHOW_MIGRATION_TOOLS: true       // للإدارة
ENABLE_DATA_VALIDATION: true     // للفحص
```

---

### المرحلة 2: الاختبار الداخلي (Week 2)
**الهدف**: اختبار النظام مع فريق داخلي محدود

**الإجراءات:**

1. **تفعيل للمطورين فقط:**
```typescript
// src/config/featureFlags.ts
export const isUnifiedOrdersEnabled = () => {
  // تفعيل للمطورين فقط
  const devEmails = ['admin@example.com', 'dev@example.com'];
  const currentUser = getCurrentUser();
  
  if (devEmails.includes(currentUser?.email)) {
    return true;
  }
  
  return FEATURE_FLAGS.USE_UNIFIED_ORDERS;
};
```

2. **مراقبة الأداء:**
```typescript
// إضافة Logging
console.time('[UnifiedOrders] Fetch Orders');
const orders = await UnifiedOrdersService.fetchOrders();
console.timeEnd('[UnifiedOrders] Fetch Orders');
```

3. **جمع Metrics:**
- متوسط وقت الاستجابة
- معدل الأخطاء
- استخدام الذاكرة

**معايير النجاح:**
- ✅ وقت استجابة < 500ms
- ✅ معدل أخطاء < 1%
- ✅ لا توجد شكاوى من الفريق الداخلي

**Feature Flags:**
```typescript
USE_UNIFIED_ORDERS: true (للمطورين فقط)
SHOW_UNIFIED_DASHBOARD: true
ENABLE_DUAL_WRITE: true          // للأمان
```

---

### المرحلة 3: Pilot Launch (Week 3-4)
**الهدف**: إطلاق تجريبي لمجموعة صغيرة من المتاجر

**الإجراءات:**

1. **اختيار متاجر Pilot:**
```sql
-- اختيار 5-10 متاجر نشطة
SELECT id, display_name, total_orders
FROM shops
WHERE is_active = true
  AND total_orders > 10
  AND total_orders < 100
ORDER BY created_at DESC
LIMIT 10;
```

2. **تفعيل تدريجي:**
```typescript
// Feature Flag بناءً على المتجر
export const isUnifiedOrdersEnabledForStore = (storeId: string) => {
  const PILOT_STORES = [
    'store-uuid-1',
    'store-uuid-2',
    'store-uuid-3',
    // ... إضافة المزيد تدريجياً
  ];
  
  return PILOT_STORES.includes(storeId);
};
```

3. **مراقبة مكثفة:**
```typescript
// Log جميع العمليات المهمة
const logUnifiedOrderOperation = (operation: string, data: any) => {
  console.log(`[UnifiedOrders][${operation}]`, {
    timestamp: new Date().toISOString(),
    operation,
    data,
    storeId: data.storeId,
  });
};
```

4. **قناة دعم مباشرة:**
- إنشاء قناة Slack/Discord للـ Pilot users
- الرد السريع على أي مشاكل (< 1 hour)
- جمع Feedback يومي

**معايير النجاح:**
- ✅ رضا المستخدمين > 80%
- ✅ لا توجد مشاكل حرجة (Critical bugs)
- ✅ الأداء مستقر لمدة 7 أيام

**Feature Flags:**
```typescript
USE_UNIFIED_ORDERS: true (لمتاجر Pilot فقط)
SHOW_UNIFIED_DASHBOARD: true
ENABLE_DUAL_WRITE: true
SHOW_SOURCE_INDICATOR: true
```

---

### المرحلة 4: Full Launch (Week 5-6)
**الهدف**: إطلاق كامل لجميع المستخدمين

**الإجراءات:**

1. **إطلاق تدريجي حسب النسبة:**
```typescript
export const isUnifiedOrdersEnabled = () => {
  // Week 5 Day 1: 10% من المستخدمين
  // Week 5 Day 3: 25%
  // Week 5 Day 5: 50%
  // Week 6 Day 1: 75%
  // Week 6 Day 3: 100%
  
  const rolloutPercentage = getRolloutPercentage();
  const userId = getCurrentUserId();
  
  // استخدام hash للتوزيع العشوائي المتسق
  const userHash = hashCode(userId) % 100;
  return userHash < rolloutPercentage;
};
```

2. **مراقبة على مستوى النظام:**
```typescript
// Dashboard للمراقبة
interface SystemMetrics {
  totalOrders: number;
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  unifiedOrdersUsage: number;
}
```

3. **خطة Rollback:**
```typescript
// إذا حدثت مشاكل، rollback فوري
if (errorRate > 5% || avgResponseTime > 2000) {
  FEATURE_FLAGS.USE_UNIFIED_ORDERS = false;
  alertAdmins('Unified Orders rolled back due to high error rate');
}
```

**معايير النجاح:**
- ✅ 95% من المستخدمين على النظام الجديد
- ✅ معدل أخطاء < 2%
- ✅ رضا المستخدمين > 85%
- ✅ استقرار لمدة 14 يوم

**Feature Flags:**
```typescript
USE_UNIFIED_ORDERS: true (الكل)
SHOW_UNIFIED_DASHBOARD: true
ENABLE_DUAL_WRITE: false         // إيقاف للأداء
SHOW_SOURCE_INDICATOR: true
```

---

## مراقبة الإطلاق

### Metrics المهمة

```typescript
interface RolloutMetrics {
  // Performance
  avgResponseTime: number;      // < 500ms
  p95ResponseTime: number;      // < 1000ms
  p99ResponseTime: number;      // < 2000ms
  
  // Reliability
  errorRate: number;            // < 2%
  successRate: number;          // > 98%
  
  // Usage
  activeUsers: number;
  ordersPerDay: number;
  unifiedOrdersPercentage: number;
  
  // User Satisfaction
  feedbackScore: number;        // 1-5 stars
  supportTickets: number;
}
```

### Dashboard للمراقبة

```typescript
// src/components/rollout/RolloutDashboard.tsx
function RolloutDashboard() {
  const metrics = useRolloutMetrics();
  
  return (
    <div>
      <MetricsCard title="الأداء" metrics={metrics.performance} />
      <MetricsCard title="الموثوقية" metrics={metrics.reliability} />
      <MetricsCard title="الاستخدام" metrics={metrics.usage} />
      <AlertsPanel alerts={metrics.alerts} />
    </div>
  );
}
```

### Alerts التلقائية

```typescript
const ALERTS_CONFIG = {
  highErrorRate: {
    threshold: 5,
    action: 'Rollback immediately',
    notify: ['admin@example.com'],
  },
  slowResponse: {
    threshold: 2000, // ms
    action: 'Investigate performance',
    notify: ['dev@example.com'],
  },
  lowSatisfaction: {
    threshold: 3.5, // stars
    action: 'Collect feedback',
    notify: ['product@example.com'],
  },
};
```

---

## Rollback Plan

### متى نحتاج Rollback؟

1. **معدل أخطاء > 5%**
2. **وقت استجابة > 3 seconds**
3. **شكاوى مستخدمين > 10 في الساعة**
4. **مشاكل في البيانات** (data inconsistency)

### كيفية Rollback

```typescript
// 1. تعطيل Feature Flag فوراً
FEATURE_FLAGS.USE_UNIFIED_ORDERS = false;

// 2. إعلام المستخدمين
notifyUsers({
  title: 'صيانة طارئة',
  message: 'نعتذر عن الإزعاج، سنعود قريباً',
});

// 3. فحص المشكلة
const issues = await diagnoseIssues();

// 4. إصلاح وإعادة الإطلاق
await fixIssues(issues);
await testThoroughly();
FEATURE_FLAGS.USE_UNIFIED_ORDERS = true;
```

---

## Checklist قبل كل مرحلة

### قبل المرحلة 2 (الاختبار الداخلي)
- [ ] جميع الاختبارات تمر بنجاح
- [ ] Data Quality Report نظيف
- [ ] Documentation محدّث
- [ ] فريق الدعم مستعد

### قبل المرحلة 3 (Pilot)
- [ ] اختيار Pilot stores
- [ ] إنشاء قناة دعم
- [ ] تجهيز Rollback plan
- [ ] Monitoring dashboard جاهز

### قبل المرحلة 4 (Full Launch)
- [ ] Pilot ناجح لمدة 7 أيام
- [ ] Performance مستقر
- [ ] Zero critical bugs
- [ ] موافقة من الإدارة

---

## Communication Plan

### للفريق الداخلي
- Daily standups خلال الإطلاق
- Slack channel مخصص
- تقارير يومية

### للمستخدمين
- إعلان قبل أسبوع من الإطلاق
- دليل استخدام للميزات الجديدة
- دعم فني جاهز

### للإدارة
- تقارير أسبوعية
- Dashboard للـ Metrics
- Escalation plan واضح

---

## نصائح مهمة

✅ **ابدأ صغيراً**: لا تطلق للجميع مرة واحدة
✅ **راقب بشدة**: Metrics في الوقت الحقيقي
✅ **استمع للمستخدمين**: Feedback مهم جداً
✅ **كن مستعداً للـ Rollback**: خطة واضحة دائماً
✅ **وثّق كل شيء**: كل مشكلة وحل
✅ **تواصل بشفافية**: أخبر المستخدمين بما يحدث

---

## Resources

- [Rollout Dashboard](/rollout)
- [System Metrics](/metrics)
- [Support Channel](slack://channel/unified-orders)
- [Incident Response Plan](./INCIDENT_RESPONSE.md)
