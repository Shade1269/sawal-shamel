import React from 'react';
import { Store } from 'lucide-react';
import { UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardDescription, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';

interface HomeDashboardCardProps {
  onClick: () => void;
}

export const HomeDashboardCard: React.FC<HomeDashboardCardProps> = ({ onClick }) => {
  return (
    <div className="mb-12">
      <UnifiedCard variant="luxury" hover="lift" onClick={onClick}>
        <UnifiedCardHeader className="text-center">
          <div className="mx-auto w-24 h-24 gradient-primary rounded-3xl flex items-center justify-center mb-6 shadow-glow">
            <Store className="h-12 w-12 text-white" />
          </div>
          <UnifiedCardTitle className="text-3xl font-black gradient-text-hero premium-text">
            لوحة التحكم التجارية
          </UnifiedCardTitle>
          <UnifiedCardDescription className="text-lg mt-3 elegant-text">
            إدارة شاملة لمتجرك الإلكتروني ومنتجاتك وطلباتك
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent className="text-center space-y-4">
          <UnifiedButton 
            variant="secondary"
            size="lg" 
            className="w-full"
          >
            دخول لوحة التحكم
          </UnifiedButton>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-button p-3 rounded-xl border border-primary/20">
              <p className="text-sm font-medium text-primary">إدارة المنتجات</p>
            </div>
            <div className="glass-button p-3 rounded-xl border border-luxury/20">
              <p className="text-sm font-medium text-luxury">تتبع المبيعات</p>
            </div>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};

export default HomeDashboardCard;
