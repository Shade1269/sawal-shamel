/**
 * مدير المتجر التابع - Affiliate Store Manager
 * المكون الرئيسي لإدارة المتجر التابع
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UnifiedButton as Button } from '@/components/design-system';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useQRGenerator } from '@/hooks/useQRGenerator';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { useToast } from '@/hooks/use-toast';
import { ProductManagement } from './ProductManagement';
import { OrderCommissionManagement } from './OrderCommissionManagement';
import { AffiliateProductsManager } from './AffiliateProductsManager';
import AffiliateCouponManager from '@/components/marketing/AffiliateCouponManager';
import { BannerManagement } from './BannerManagement';
import { ReviewManagement } from './ReviewManagement';
import { StoreOwnerChatPanel } from './StoreOwnerChatPanel';

// استيراد المكونات الفرعية الجديدة
import {
  StoreHeader,
  GeneralSettingsTab,
  AppearanceTab,
  HeroSectionTab,
  CategoriesTab,
  SharingTab,
  AnalyticsTab,
  TabsNavigation,
  useStoreManager,
  useCategoriesManagement,
  useHeroSettings,
  type AffiliateStoreManagerProps,
  type CurrentSection,
  type TabValue
} from './store-manager';

export const AffiliateStoreManager = ({
  store,
  onUpdateStore,
  onGenerateQR
}: AffiliateStoreManagerProps) => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = (searchParams.get('tab') || 'general') as TabValue;
  const [activeTab, setActiveTab] = useState<TabValue>(tabFromUrl);
  const [currentSection, setCurrentSection] = useState<CurrentSection>('main');

  // Custom Hooks
  const { settings, updateSettings, uploadImage, refetch } = useStoreSettings(store.id);
  const { generateQR, downloadQR, qrCodeDataUrl, isGenerating } = useQRGenerator();
  const { analytics, loading: analyticsLoading } = useStoreAnalytics(store.id);

  const {
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    storeUrl,
    handleSaveChanges,
    copyStoreLink,
    shareStore
  } = useStoreManager(store, onUpdateStore);

  const {
    heroSettings,
    setHeroSettings,
    handleHeroImageUpload,
    saveHeroSettings
  } = useHeroSettings(settings, updateSettings, refetch, uploadImage);

  const {
    displayStyle,
    setDisplayStyle,
    categories,
    storeProducts,
    loadingProducts,
    toggleCategoryStatus,
    handleCategoryEdit,
    handleAddCategory,
    handleDeleteCategory,
    saveCategorySettings
  } = useCategoriesManagement(store.id, settings, updateSettings, refetch);

  // تحديث URL عند تغيير التبويب
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    setSearchParams({ tab: value });
  };

  // رفع الشعار
  const handleLogoUpload = async (file: File) => {
    const result = await uploadImage(file, 'logos');
    if (result.success && onUpdateStore) {
      onUpdateStore({ logo_url: result.url });
    }
  };

  // توليد وتحميل رمز QR
  const handleGenerateQR = async () => {
    const result = await generateQR(storeUrl, 512);
    if (result.success && result.downloadUrl) {
      toast({
        title: 'تم إنتاج رمز QR',
        description: 'يمكنك الآن تحميل الرمز'
      });
    }
  };

  // عرض قسم المنتجات
  if (currentSection === 'products') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentSection('main')}>
            ← العودة لإدارة المتجر
          </Button>
          <h2 className="text-xl font-semibold">إدارة المنتجات</h2>
        </div>
        <ProductManagement storeId={store.id} />
      </div>
    );
  }

  // عرض قسم الطلبات
  if (currentSection === 'orders') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setCurrentSection('main')}>
            ← العودة لإدارة المتجر
          </Button>
          <h2 className="text-xl font-semibold">الطلبات والعمولات</h2>
        </div>
        <OrderCommissionManagement storeId={store.id} />
      </div>
    );
  }

  // العرض الرئيسي
  return (
    <div className="space-y-4 md:space-y-6">
      {/* رأس المتجر */}
      <StoreHeader
        store={store}
        storeUrl={storeUrl}
        isEditing={isEditing}
        onEditToggle={() => setIsEditing(!isEditing)}
      />

      {/* تبويبات إدارة المتجر */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* تبويب الإعدادات العامة */}
        <TabsContent value="general" className="space-y-4 md:space-y-6">
          <GeneralSettingsTab
            store={store}
            isEditing={isEditing}
            editData={editData}
            onEditDataChange={setEditData}
            onSave={handleSaveChanges}
            onCopyLink={copyStoreLink}
            onCancelEdit={() => setIsEditing(false)}
          />
        </TabsContent>

        {/* تبويب المظهر */}
        <TabsContent value="appearance" className="space-y-4 md:space-y-6">
          <AppearanceTab
            store={store}
            isEditing={isEditing}
            onLogoUpload={handleLogoUpload}
            onSave={handleSaveChanges}
          />
        </TabsContent>

        {/* تبويب القسم الرئيسي */}
        <TabsContent value="hero" className="space-y-4 md:space-y-6">
          <HeroSectionTab
            heroSettings={heroSettings}
            onSettingsChange={setHeroSettings}
            onImageUpload={handleHeroImageUpload}
            onSave={saveHeroSettings}
          />
        </TabsContent>

        {/* تبويب البانرات */}
        <TabsContent value="banners" className="space-y-4 md:space-y-6">
          <BannerManagement storeId={store.id} />
        </TabsContent>

        {/* تبويب الفئات */}
        <TabsContent value="categories" className="space-y-4 md:space-y-6">
          <CategoriesTab
            displayStyle={displayStyle}
            onDisplayStyleChange={setDisplayStyle}
            categories={categories}
            storeProducts={storeProducts}
            loadingProducts={loadingProducts}
            onToggleCategoryStatus={toggleCategoryStatus}
            onCategoryEdit={handleCategoryEdit}
            onCategoryAdd={handleAddCategory}
            onCategoryDelete={handleDeleteCategory}
            onSave={saveCategorySettings}
          />
        </TabsContent>

        {/* تبويب المنتجات */}
        <TabsContent value="products" className="space-y-6">
          <AffiliateProductsManager storeId={store.id} />
        </TabsContent>

        {/* تبويب الكوبونات */}
        <TabsContent value="coupons" className="space-y-6">
          <AffiliateCouponManager />
        </TabsContent>

        {/* تبويب المراجعات */}
        <TabsContent value="reviews" className="space-y-4 md:space-y-6">
          <ReviewManagement storeId={store.id} />
        </TabsContent>

        {/* تبويب الدردشة */}
        <TabsContent value="chat" className="space-y-4 md:space-y-6">
          <StoreOwnerChatPanel storeId={store.id} />
        </TabsContent>

        {/* تبويب المشاركة */}
        <TabsContent value="sharing" className="space-y-4 md:space-y-6">
          <SharingTab
            storeUrl={storeUrl}
            qrCodeDataUrl={qrCodeDataUrl}
            isGeneratingQR={isGenerating}
            onCopyLink={copyStoreLink}
            onShareStore={shareStore}
            onGenerateQR={handleGenerateQR}
            onDownloadQR={downloadQR}
            storeSlug={store.store_slug}
          />
        </TabsContent>

        {/* تبويب الإحصائيات */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab analytics={analytics} loading={analyticsLoading} store={store} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
