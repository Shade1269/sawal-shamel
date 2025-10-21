# دليل الإطلاق: النظام الموحد

## 🚀 البدء السريع

### للمطورين - استخدام Repository Layer
```typescript
import { OrderRepository } from '@/services/repositories';

// الطلبات الموحدة
const orders = await OrderRepository.getStoreOrders(storeId);
const stats = await OrderRepository.getOrderStats(storeId);
```

### للمسؤولين - التنظيف التلقائي
```sql
-- تشغيل التنظيف الشامل
SELECT * FROM run_full_cleanup();
```

## 📋 ما تغير؟
- ✅ order_hub للطلبات الموحدة
- ✅ profiles للهوية الموحدة
- ✅ shipments مع تتبع كامل
- ✅ Repository Layer للكود النظيف

## 📚 المراجع
- `DATABASE_CONSOLIDATION_PROGRESS.md` - التقرير الشامل
- `RUNBOOK.md` - العمليات اليومية
- `ERD.md` - بنية قاعدة البيانات
