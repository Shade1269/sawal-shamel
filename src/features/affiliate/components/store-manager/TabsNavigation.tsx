/**
 * التنقل بين التبويبات - Tabs Navigation
 * عرض قائمة التبويبات للجوال والشاشات الكبيرة
 */

import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import type { TabValue } from './types';

interface TabsNavigationProps {
  activeTab: TabValue;
  onTabChange: (value: TabValue) => void;
}

export function TabsNavigation({ activeTab, onTabChange }: TabsNavigationProps) {
  const { isDarkMode } = useDarkMode();

  const triggerClassName = `transition-colors duration-500 ${
    isDarkMode
      ? 'text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-card-foreground'
      : 'text-foreground data-[state=active]:bg-gradient-hero data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg'
  }`;

  return (
    <>
      {/* قائمة منسدلة للجوال */}
      <div className="md:hidden">
        <Select value={activeTab} onValueChange={onTabChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="اختر القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">⚙️ الإعدادات العامة</SelectItem>
            <SelectItem value="appearance">🎨 المظهر</SelectItem>
            <SelectItem value="hero">🖼️ القسم الرئيسي</SelectItem>
            <SelectItem value="banners">🖼️ إدارة البانرات</SelectItem>
            <SelectItem value="categories">📂 إدارة الفئات</SelectItem>
            <SelectItem value="products">🛍️ إدارة المنتجات</SelectItem>
            <SelectItem value="coupons">🎟️ الكوبونات</SelectItem>
            <SelectItem value="reviews">⭐ المراجعات</SelectItem>
            <SelectItem value="chat">💬 الدردشة</SelectItem>
            <SelectItem value="sharing">📤 المشاركة</SelectItem>
            <SelectItem value="analytics">📊 الإحصائيات</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* تبويبات للشاشات الكبيرة */}
      <TabsList className={`hidden md:grid w-full grid-cols-11 transition-colors duration-500 ${
        isDarkMode
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-gradient-subtle border-border shadow-lg'
      }`}>
        <TabsTrigger value="general" className={triggerClassName}>
          الإعدادات العامة
        </TabsTrigger>
        <TabsTrigger value="appearance" className={triggerClassName}>
          المظهر
        </TabsTrigger>
        <TabsTrigger value="hero" className={triggerClassName}>
          القسم الرئيسي
        </TabsTrigger>
        <TabsTrigger value="banners" className={triggerClassName}>
          البانرات
        </TabsTrigger>
        <TabsTrigger value="categories" className={triggerClassName}>
          الفئات
        </TabsTrigger>
        <TabsTrigger value="products" className={triggerClassName}>
          المنتجات
        </TabsTrigger>
        <TabsTrigger value="coupons" className={triggerClassName}>
          الكوبونات
        </TabsTrigger>
        <TabsTrigger value="reviews" className={triggerClassName}>
          المراجعات
        </TabsTrigger>
        <TabsTrigger value="chat" className={triggerClassName}>
          الدردشة
        </TabsTrigger>
        <TabsTrigger value="sharing" className={triggerClassName}>
          المشاركة
        </TabsTrigger>
        <TabsTrigger value="analytics" className={triggerClassName}>
          الإحصائيات
        </TabsTrigger>
      </TabsList>
    </>
  );
}
