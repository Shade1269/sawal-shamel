/**
 * 🧪 سكريبت اختبار التحسينات UI
 *
 * استخدم هذا السكريبت في Console المتصفح لاختبار المكونات الجديدة
 */

console.log('🎨 اختبار التحسينات UI - Atlantis E-commerce');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ============================================
// 1️⃣ اختبار localStorage - Recently Viewed
// ============================================
function testRecentlyViewed() {
  console.log('\n1️⃣ اختبار Recently Viewed...');

  // إضافة منتج تجريبي
  const testProduct = {
    id: 'test-123',
    name: 'منتج تجريبي',
    price: 199,
    image_url: 'https://via.placeholder.com/300',
    viewedAt: Date.now()
  };

  // قراءة البيانات الحالية
  const current = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
  console.log('✅ المنتجات المشاهدة حالياً:', current.length);

  // إضافة منتج جديد
  const updated = [testProduct, ...current.filter(p => p.id !== testProduct.id)].slice(0, 10);
  localStorage.setItem('recently_viewed_products', JSON.stringify(updated));
  console.log('✅ تم إضافة منتج تجريبي');
  console.log('✅ إجمالي المنتجات:', updated.length);

  return updated;
}

// ============================================
// 2️⃣ اختبار المكونات في الصفحة
// ============================================
function testComponentsExist() {
  console.log('\n2️⃣ اختبار وجود المكونات...');

  const components = {
    'BottomNav': document.querySelector('[class*="BottomNav"]') || document.querySelector('nav[class*="bottom"]'),
    'Breadcrumbs': document.querySelector('nav[aria-label="Breadcrumb"]'),
    'ProductCard': document.querySelectorAll('[class*="Card"]').length > 0,
    'Skeleton': document.querySelectorAll('[class*="skeleton"]').length > 0 || document.querySelectorAll('[class*="animate-pulse"]').length > 0,
  };

  Object.entries(components).forEach(([name, exists]) => {
    console.log(exists ? `✅ ${name} موجود` : `⚠️  ${name} غير موجود (ممكن يكون في صفحة أخرى)`);
  });

  return components;
}

// ============================================
// 3️⃣ اختبار Responsive
// ============================================
function testResponsive() {
  console.log('\n3️⃣ اختبار Responsive...');

  const width = window.innerWidth;
  const breakpoints = {
    mobile: width < 768,
    tablet: width >= 768 && width < 1024,
    desktop: width >= 1024
  };

  console.log('📱 عرض الشاشة:', width + 'px');

  if (breakpoints.mobile) {
    console.log('✅ وضع الموبايل - BottomNav يجب أن يظهر');
  } else if (breakpoints.tablet) {
    console.log('✅ وضع التابلت - BottomNav يجب أن يختفي');
  } else {
    console.log('✅ وضع الديسكتوب - BottomNav يجب أن يختفي');
  }

  return breakpoints;
}

// ============================================
// 4️⃣ اختبار Theme Variables
// ============================================
function testThemeVariables() {
  console.log('\n4️⃣ اختبار Theme Variables...');

  const root = document.documentElement;
  const style = getComputedStyle(root);

  const variables = [
    '--background',
    '--foreground',
    '--primary',
    '--card',
    '--border',
  ];

  variables.forEach(varName => {
    const value = style.getPropertyValue(varName).trim();
    console.log(value ? `✅ ${varName}: ${value}` : `❌ ${varName} غير موجود`);
  });
}

// ============================================
// 5️⃣ اختبار Performance
// ============================================
function testPerformance() {
  console.log('\n5️⃣ اختبار Performance...');

  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;

    console.log('⏱️  وقت التحميل الكلي:', (loadTime / 1000).toFixed(2) + 's');
    console.log('⏱️  DOM Ready:', (domReady / 1000).toFixed(2) + 's');

    if (loadTime < 3000) {
      console.log('✅ Performance ممتاز!');
    } else if (loadTime < 5000) {
      console.log('⚠️  Performance مقبول');
    } else {
      console.log('❌ Performance بطيء');
    }
  }
}

// ============================================
// 6️⃣ تشغيل جميع الاختبارات
// ============================================
function runAllTests() {
  console.log('\n🚀 تشغيل جميع الاختبارات...\n');

  const results = {
    recentlyViewed: testRecentlyViewed(),
    components: testComponentsExist(),
    responsive: testResponsive(),
    theme: testThemeVariables(),
    performance: testPerformance()
  };

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ اكتملت جميع الاختبارات!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return results;
}

// ============================================
// 📋 أوامر مساعدة
// ============================================
console.log('\n📋 الأوامر المتاحة:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('runAllTests()           - تشغيل جميع الاختبارات');
console.log('testRecentlyViewed()    - اختبار Recently Viewed');
console.log('testComponentsExist()   - اختبار وجود المكونات');
console.log('testResponsive()        - اختبار Responsive');
console.log('testThemeVariables()    - اختبار Theme Variables');
console.log('testPerformance()       - اختبار Performance');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// تشغيل تلقائي
runAllTests();
