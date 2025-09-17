import React, { useState } from 'react';
import { 
  EnhancedContainer,
  EnhancedSection,
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardContent,
  ResponsiveLayout,
  ResponsiveGrid,
  ResponsiveColumn,
  ShowOnMobile,
  ShowOnDesktop,
  MegaMenu,
  MegaMenuTrigger,
  MobileNavigation,
  BottomNavigation,
  EnhancedPagination,
  VirtualizedList,
  FloatingActionButton,
  ScrollToTopFAB
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResponsiveLayout, useVirtualization } from '@/hooks/useResponsiveLayout';
import { 
  Layout,
  Smartphone,
  Monitor,
  Tablet,
  Menu,
  Grid3x3,
  List,
  Zap,
  Star,
  Heart,
  User,
  Settings,
  Home,
  Search,
  Package,
  ShoppingCart,
  BarChart3,
  FileText,
  Plus,
  MessageCircle,
  Share,
  Bookmark
} from 'lucide-react';

// Mock data for demos
const generateMockItems = (count: number) => 
  Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    title: `عنصر رقم ${index + 1}`,
    description: `وصف تفصيلي للعنصر رقم ${index + 1} في القائمة المحسنة`,
    category: ['عام', 'مهم', 'جديد'][index % 3],
    height: 60 + Math.random() * 40
  }));

const megaMenuSections = [
  {
    id: 'admin',
    title: 'الإدارة',
    description: 'أدوات إدارة النظام',
    featured: true,
    items: [
      { id: 'users', title: 'المستخدمون', href: '/admin/users', badge: '150' },
      { id: 'analytics', title: 'التحليلات', href: '/admin/analytics', featured: true },
      { id: 'settings', title: 'الإعدادات', href: '/admin/settings' }
    ]
  },
  {
    id: 'commerce',
    title: 'التجارة الإلكترونية',
    description: 'إدارة المتجر والمنتجات',
    items: [
      { id: 'products', title: 'المنتجات', href: '/admin/products', badge: '450' },
      { id: 'orders', title: 'الطلبات', href: '/admin/orders', badge: '23' },
      { id: 'inventory', title: 'المخزون', href: '/admin/inventory' }
    ]
  }
];

const mobileNavItems = [
  { id: 'home', title: 'الرئيسية', href: '/', icon: Home },
  { id: 'products', title: 'المنتجات', href: '/products', icon: Package, badge: 'جديد' },
  { id: 'orders', title: 'الطلبات', href: '/orders', icon: ShoppingCart, badge: 5 },
  { id: 'analytics', title: 'التحليلات', href: '/analytics', icon: BarChart3 },
  { id: 'settings', title: 'الإعدادات', href: '/settings', icon: Settings, divider: true },
  { id: 'profile', title: 'الملف الشخصي', href: '/profile', icon: User }
];

const bottomNavItems = [
  { id: 'home', title: 'الرئيسية', icon: Home, href: '/' },
  { id: 'search', title: 'البحث', icon: Search, href: '/search' },
  { id: 'cart', title: 'السلة', icon: ShoppingCart, href: '/cart', badge: 3 },
  { id: 'profile', title: 'الحساب', icon: User, href: '/profile' }
];

const fabActions = [
  { id: 'message', label: 'رسالة جديدة', icon: MessageCircle, onClick: () => console.log('Message') },
  { id: 'share', label: 'مشاركة', icon: Share, onClick: () => console.log('Share') },
  { id: 'bookmark', label: 'حفظ', icon: Bookmark, onClick: () => console.log('Bookmark') }
];

const AdvancedNavigationDemo: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { currentBreakpoint, breakpoint } = useResponsiveLayout();
  
  const mockItems = generateMockItems(500);
  const totalPages = Math.ceil(mockItems.length / itemsPerPage);

  const VirtualListItem: React.FC<{ item: any; index: number }> = ({ item, index }) => (
    <div className="p-4 border-b border-border/50 hover:bg-accent/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{item.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        </div>
        <Badge variant="outline" size="sm">
          {item.category}
        </Badge>
      </div>
    </div>
  );

  return (
    <ResponsiveLayout variant="glass" maxWidth="2xl" centerContent>
      <div className="space-y-12 py-8">
        {/* Header */}
        <EnhancedSection variant="persian" size="sm" animation="fade">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Layout className="h-8 w-8 text-white animate-persian-glow" />
              <h1 className="text-3xl font-bold text-white">
                Advanced Navigation v2.3
              </h1>
            </div>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              نظام تنقل متقدم مع مكونات متجاوبة وتحسينات الأداء
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Badge variant="glass" className="gap-1 text-white border-white/30">
                <Monitor className="h-3 w-3" />
                متجاوب كلياً
              </Badge>
              <Badge variant="glass" className="gap-1 text-white border-white/30">
                <Zap className="h-3 w-3" />
                أداء محسن
              </Badge>
              <Badge variant="glass" className="gap-1 text-white border-white/30">
                <Star className="h-3 w-3" />
                تجربة متقدمة
              </Badge>
            </div>
          </div>
        </EnhancedSection>

        {/* Current Breakpoint Indicator */}
        <EnhancedCard variant="luxury" hover="glow">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-white">
              {breakpoint.isMobile && <Smartphone className="h-5 w-5" />}
              {breakpoint.isTablet && <Tablet className="h-5 w-5" />}
              {(breakpoint.isDesktop || breakpoint.isWide) && <Monitor className="h-5 w-5" />}
              الجهاز الحالي: {currentBreakpoint === 'mobile' ? 'محمول' : 
                           currentBreakpoint === 'tablet' ? 'لوحي' : 'سطح مكتب'}
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <ResponsiveGrid 
              columns={{ mobile: 1, tablet: 2, desktop: 4 }}
              gap={{ mobile: 4, tablet: 6, desktop: 8 }}
            >
              <ResponsiveColumn span={{ mobile: 12, tablet: 6, desktop: 3 }}>
                <div className="text-center text-white">
                  <Smartphone className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">محمول</p>
                  <Badge variant={breakpoint.isMobile ? "secondary" : "outline"} size="sm">
                    {breakpoint.isMobile ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </ResponsiveColumn>
              
              <ResponsiveColumn span={{ mobile: 12, tablet: 6, desktop: 3 }}>
                <div className="text-center text-white">
                  <Tablet className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">لوحي</p>
                  <Badge variant={breakpoint.isTablet ? "secondary" : "outline"} size="sm">
                    {breakpoint.isTablet ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </ResponsiveColumn>
              
              <ResponsiveColumn span={{ mobile: 12, tablet: 12, desktop: 6 }}>
                <div className="text-center text-white">
                  <Monitor className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">سطح مكتب</p>
                  <Badge variant={breakpoint.isDesktop || breakpoint.isWide ? "secondary" : "outline"} size="sm">
                    {breakpoint.isDesktop || breakpoint.isWide ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </ResponsiveColumn>
            </ResponsiveGrid>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* MegaMenu Demo */}
        <ShowOnDesktop>
          <EnhancedCard variant="glass" hover="lift">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5 text-primary" />
                MegaMenu - القائمة الموسعة
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  قوائم منسدلة كبيرة ومنظمة للتنقل في الأقسام المختلفة.
                </p>
                
                <div className="flex gap-4">
                  <MegaMenu
                    trigger={
                      <MegaMenuTrigger variant="luxury">
                        إدارة النظام
                      </MegaMenuTrigger>
                    }
                    sections={megaMenuSections}
                    variant="glass"
                    showDescription={true}
                    featuredContent={
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h3 className="font-semibold text-primary mb-2">ميزة مميزة</h3>
                        <p className="text-sm text-muted-foreground">
                          اكتشف الأدوات الجديدة في لوحة الإدارة
                        </p>
                      </div>
                    }
                  />
                  
                  <MegaMenu
                    trigger={
                      <MegaMenuTrigger variant="persian">
                        المنتجات والخدمات
                      </MegaMenuTrigger>
                    }
                    sections={megaMenuSections}
                    variant="luxury"
                  />
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </ShowOnDesktop>

        {/* Mobile Navigation Demo */}
        <ShowOnMobile>
          <EnhancedCard variant="glass" hover="lift">
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Mobile Navigation - التنقل المحمول
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  تنقل محمول محسن مع دعم الأدراج والقوائم الجانبية.
                </p>
                
                <div className="flex gap-4">
                  <MobileNavigation
                    items={mobileNavItems}
                    variant="glass"
                    title="القائمة الرئيسية"
                    searchEnabled={true}
                    trigger={
                      <Button variant="outline">
                        <Menu className="h-4 w-4 mr-2" />
                        فتح القائمة
                      </Button>
                    }
                  />
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </ShowOnMobile>

        {/* Enhanced Pagination Demo */}
        <EnhancedCard variant="outline" hover="glow">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-accent" />
              Enhanced Pagination - ترقيم متقدم
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-6">
              <p className="text-muted-foreground">
                ترقيم صفحات محسن مع خيارات متقدمة وتحكم كامل.
              </p>
              
              {/* Default Pagination */}
              <div className="space-y-3">
                <h4 className="font-semibold">ترقيم كامل:</h4>
                <EnhancedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={mockItems.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                  variant="glass"
                  showInfo={true}
                  showItemsPerPage={true}
                  showFirstLast={true}
                  showJumpToPage={true}
                />
              </div>
              
              {/* Compact Pagination */}
              <div className="space-y-3">
                <h4 className="font-semibold">ترقيم مختصر:</h4>
                <EnhancedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={mockItems.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  compact={true}
                />
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Virtualized List Demo */}
        <EnhancedCard variant="persian" hover="persian">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2 text-white">
              <Grid3x3 className="h-5 w-5" />
              Virtualized List - قائمة محسنة الأداء
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-4">
              <p className="text-white/90">
                قوائم محسنة الأداء لعرض آلاف العناصر بسلاسة.
              </p>
              
              <VirtualizedList
                items={mockItems}
                renderItem={VirtualListItem}
                itemHeight={80}
                containerHeight={300}
                searchable={true}
                emptyMessage="لا توجد عناصر للعرض"
                loadingMessage="جاري تحميل العناصر..."
                showScrollToTop={true}
                className="border border-white/20 rounded-lg bg-white/10"
              />
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Floating Action Buttons Demo */}
        <EnhancedCard variant="filled" hover="lift">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Floating Action Buttons - أزرار العمل العائمة
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">الميزات:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• أزرار عائمة في مواضع مختلفة</li>
                  <li>• دعم الإجراءات المتعددة</li>
                  <li>• إخفاء تلقائي عند التمرير</li>
                  <li>• تأثيرات بصرية محسنة</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">الأنواع:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="luxury">فاخر</Badge>
                  <Badge variant="persian">فارسي</Badge>
                  <Badge variant="glass">زجاجي</Badge>
                  <Badge variant="outline">تقليدي</Badge>
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>

      {/* Fixed Components */}
      
      {/* Bottom Navigation for Mobile */}
      <ShowOnMobile>
        <BottomNavigation items={bottomNavItems} variant="glass" />
      </ShowOnMobile>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        variant="luxury"
        position="bottom-right"
        animation="float"
        tooltip="إجراءات سريعة"
        expandDirection="up"
      />

      {/* Scroll to Top FAB */}
      <ScrollToTopFAB showThreshold={300} />
    </ResponsiveLayout>
  );
};

export default AdvancedNavigationDemo;