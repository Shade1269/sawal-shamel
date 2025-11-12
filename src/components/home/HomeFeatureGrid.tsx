import React from 'react';
import { MessageCircle, Package, Users, Store, ExternalLink, AlertCircle, Hash } from 'lucide-react';
import { HomeFeatureCard } from '@/components/home';
import { UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardDescription, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';

interface HomeFeatureGridProps {
  userRole?: string;
  affiliateStore?: any;
  affiliateStoreLoading: boolean;
  onNavigate: (path: string) => void;
}

export const HomeFeatureGrid: React.FC<HomeFeatureGridProps> = ({
  userRole,
  affiliateStore,
  affiliateStoreLoading,
  onNavigate
}) => {
  const isAffiliate = userRole === 'affiliate' || userRole === 'marketer';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {/* Chat Feature */}
      <HomeFeatureCard
        title="دردشة العملاء"
        description="تواصل مع فريق الدعم والعملاء الآخرين في الوقت الفعلي"
        icon={MessageCircle}
        gradientClass="gradient-ocean"
        buttonText="بدء المحادثة"
        buttonVariant="primary"
        onClick={() => onNavigate('/atlantis/chat')}
        badge={{ color: 'success', pulse: true }}
      />

      {/* Products Catalog */}
      <HomeFeatureCard
        title="كتالوج المنتجات"
        description="استكشف 152+ منتج فاخر وحصري من متاجرنا المتنوعة"
        icon={Package}
        gradientClass="gradient-sunset"
        buttonText="تصفح المنتجات"
        buttonVariant="luxury"
        onClick={() => onNavigate('/products')}
        badge={{ color: 'warning', pulse: true }}
      >
        <div className="mt-4 text-sm text-muted-foreground">
          🔥 منتجات جديدة كل يوم
        </div>
      </HomeFeatureCard>

      {/* Store/Community Card */}
      {isAffiliate ? (
        <AffiliateStoreCard
          store={affiliateStore}
          isLoading={affiliateStoreLoading}
          onNavigate={onNavigate}
        />
      ) : (
        <CommunityCard />
      )}
    </div>
  );
};

const AffiliateStoreCard: React.FC<{
  store: any;
  isLoading: boolean;
  onNavigate: (path: string) => void;
}> = ({ store, isLoading, onNavigate }) => {
  return (
    <UnifiedCard variant="glass" hover="lift">
      <UnifiedCardHeader className="text-center">
        <div className="mx-auto w-24 h-24 gradient-purple rounded-3xl flex items-center justify-center mb-6 shadow-soft interactive-scale-110 relative overflow-hidden">
          <Store className="h-12 w-12 text-white relative z-10" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-bounce"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full"></div>
        </div>
        <UnifiedCardTitle className="text-2xl gradient-text premium-text">
          متجري الإلكتروني
        </UnifiedCardTitle>
        <UnifiedCardDescription className="text-lg elegant-text">
          {isLoading 
            ? 'جاري التحميل...' 
            : store 
              ? 'اذهب لمتجرك وشارك منتجاتك مع العملاء'
              : 'أنشئ متجرك الإلكتروني وابدأ التسويق'}
        </UnifiedCardDescription>
      </UnifiedCardHeader>
      <UnifiedCardContent className="text-center space-y-3">
        {isLoading ? (
          <div className="glass-button p-3 rounded-xl border border-border/20">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-2"></div>
            <span className="text-sm">جاري التحقق...</span>
          </div>
        ) : store ? (
          <>
            <div className="glass-button-strong border border-success/20 p-3 rounded-xl">
              <Store className="h-5 w-5 mx-auto mb-2 text-success" />
              <span className="text-sm font-medium text-success">المتجر نشط ✓</span>
            </div>
            <UnifiedButton 
              variant="premium"
              size="lg" 
              className="w-full"
              onClick={() => window.open(`/${store.store_slug}`, '_blank')}
            >
              <ExternalLink className="h-5 w-5 ml-2" />
              اذهب للمتجر
            </UnifiedButton>
          </>
        ) : (
          <>
            <div className="glass-button-strong border border-warning/20 p-3 rounded-xl">
              <AlertCircle className="h-5 w-5 mx-auto mb-2 text-warning" />
              <span className="text-sm font-medium">المتجر لم ينشأ بعد</span>
            </div>
            <UnifiedButton 
              variant="premium"
              size="lg" 
              className="w-full"
              onClick={() => onNavigate('/affiliate/store/setup')}
            >
              إنشاء متجر
            </UnifiedButton>
          </>
        )}
      </UnifiedCardContent>
    </UnifiedCard>
  );
};

const CommunityCard: React.FC = () => {
  return (
    <UnifiedCard variant="glass" hover="lift">
      <UnifiedCardHeader className="text-center">
        <div className="mx-auto w-24 h-24 gradient-forest rounded-3xl flex items-center justify-center mb-6 shadow-soft interactive-scale-110">
          <Users className="h-12 w-12 text-white" />
        </div>
        <UnifiedCardTitle className="text-2xl gradient-text premium-text">
          مجتمع أتلانتس
        </UnifiedCardTitle>
        <UnifiedCardDescription className="text-lg elegant-text">
          انضم لـ 25+ مستخدم نشط في منصة التجارة والأفيليت
        </UnifiedCardDescription>
      </UnifiedCardHeader>
      <UnifiedCardContent className="text-center">
        <div className="glass-button p-3 rounded-xl">
          <Hash className="h-5 w-5 mx-auto mb-2" />
          <span className="text-sm font-medium">تجربة تسوق حصرية 24/7</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="glass-button p-2 rounded-lg">
            <div className="font-bold text-primary">7</div>
            <div className="text-muted-foreground">متاجر</div>
          </div>
          <div className="glass-button p-2 rounded-lg">
            <div className="font-bold text-luxury">4</div>
            <div className="text-muted-foreground">تجار</div>
          </div>
        </div>
      </UnifiedCardContent>
    </UnifiedCard>
  );
};

export default HomeFeatureGrid;
