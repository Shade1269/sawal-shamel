import React from 'react';
import { Store } from 'lucide-react';
import { UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardDescription, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';

interface HomeAuthCardProps {
  onNavigate: (path: string) => void;
}

export const HomeAuthCard: React.FC<HomeAuthCardProps> = ({ onNavigate }) => {
  return (
    <div className="text-center">
      <UnifiedCard variant="glass" className="max-w-lg mx-auto" hover="glow">
        <UnifiedCardHeader className="text-center">
          <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow">
            <Store className="h-8 w-8 text-white" />
          </div>
          <UnifiedCardTitle className="text-2xl font-bold gradient-text premium-text">
            انضم إلى أتلانتس
          </UnifiedCardTitle>
          <UnifiedCardDescription className="text-lg mt-2 elegant-text">
            سجل حساب جديد واستمتع بتجربة تسوق لا تُنسى
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent className="space-y-4">
          <UnifiedButton 
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => onNavigate('/auth')}
          >
            بدء رحلة التسوق
          </UnifiedButton>
          <UnifiedButton
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => onNavigate('/store/demo-store')}
          >
            جرب المتجر التجريبي
          </UnifiedButton>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="glass-button p-2 rounded-lg border border-primary/15">
              <p className="font-medium text-primary">تسوق آمن</p>
            </div>
            <div className="glass-button p-2 rounded-lg border border-luxury/15">
              <p className="font-medium text-luxury">شحن مجاني</p>
            </div>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};

export default HomeAuthCard;
