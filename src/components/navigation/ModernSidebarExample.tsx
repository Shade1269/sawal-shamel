/**
 * Modern Sidebar v4.0 - Usage Example
 * 
 * يمكنك استخدام هذا الكومبوننت في أي صفحة تريد إضافة السيدبار الحديث لها
 * 
 * Example usage in your layout:
 * 
 * import { ModernSidebar } from '@/components/navigation/ModernSidebar';
 * 
 * export function YourLayout() {
 *   return (
 *     <div className="flex min-h-screen">
 *       <ModernSidebar />
 *       <main className="flex-1 mr-64">
 *         {your content here}
 *       </main>
 *     </div>
 *   );
 * }
 * 
 * Features:
 * ✨ Glass morphism effect
 * 🎨 Beautiful gradients and animations
 * 🔍 Real-time search
 * ⭐ Favorites system
 * 🕐 Recent pages
 * 📱 Responsive & collapsible
 * 🎯 Color-coded sections
 * 💫 Smooth transitions
 * 🌙 Dark/Light mode support
 */

import { ModernSidebar } from './ModernSidebar';

export function ModernSidebarExample() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Modern Sidebar */}
      <ModernSidebar />
      
      {/* Main Content - Adjust margin based on sidebar state */}
      <main className="flex-1 mr-64 transition-all duration-300">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-4">مرحباً بك!</h1>
          <p className="text-muted-foreground">
            هذا مثال على استخدام السيدبار الحديث. جرب الميزات التالية:
          </p>
          
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-lg bg-card border">
              <h3 className="font-semibold mb-2">🔍 البحث</h3>
              <p className="text-sm text-muted-foreground">
                ابحث في القوائم باستخدام مربع البحث في أعلى السيدبار
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border">
              <h3 className="font-semibold mb-2">⭐ المفضلة</h3>
              <p className="text-sm text-muted-foreground">
                قم بحفظ صفحاتك المفضلة بالنقر على النجمة عند التحويم على أي عنصر
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border">
              <h3 className="font-semibold mb-2">🕐 الصفحات الأخيرة</h3>
              <p className="text-sm text-muted-foreground">
                يتم حفظ آخر 5 صفحات زرتها تلقائياً في قسم "الأخيرة"
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-card border">
              <h3 className="font-semibold mb-2">📱 الوضع المضغوط</h3>
              <p className="text-sm text-muted-foreground">
                انقر على زر القائمة في الأعلى لتصغير أو توسيع السيدبار
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}