/**
 * يتعامل مع توجيهات المتجر وربط النطاقات المخصصة
 */

// قائمة النطاقات المخصصة للمتاجر
export const STORE_DOMAINS = {
  // مثال: 'store.yourdomain.com': 'your-store-slug'
  // يمكن إضافة نطاقات مخصصة هنا
} as const;

// فحص إذا كان النطاق الحالي متجر
import { ATLANTIS_DOMAIN } from '@/utils/domains';

// ... الكود الموجود ...

export const isStoreDomain = (hostname: string): boolean => {
  return hostname in STORE_DOMAINS || hostname.includes('atlantiss.tech');
};

// استخراج slug المتجر من النطاق
export const getStoreSlugFromDomain = (hostname: string): string | null => {
  // إذا كان نطاق مخصص
  if (hostname in STORE_DOMAINS) {
    return STORE_DOMAINS[hostname as keyof typeof STORE_DOMAINS];
  }
  
  // إذا كان نطاق أتلانتس تيش
  if (hostname.includes('atlantiss.tech')) {
    // استخراج من URL path بدلاً من النطاق
    return null;
  }
  
  return null;
};

// إعادة توجيه للمتجر المناسب
export const redirectToStore = (storeSlug: string): void => {
  const currentPath = window.location.pathname;
  
  // إذا لم نكن في مسار المتجر بالفعل
  if (!currentPath.startsWith(`/store/${storeSlug}`)) {
    window.location.href = `/store/${storeSlug}`;
  }
};

// فحص صحة slug المتجر
export const validateStoreSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 50;
};