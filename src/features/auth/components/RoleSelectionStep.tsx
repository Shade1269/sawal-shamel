import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Store, Users } from "lucide-react";

interface RoleSelectionStepProps {
  onRoleSelect: (role: 'merchant' | 'affiliate') => void;
  onBack?: () => void;
}

export const RoleSelectionStep = ({ onRoleSelect, onBack }: RoleSelectionStepProps) => {
  return (
    <UnifiedCard className="w-full max-w-md mx-auto">
      <UnifiedCardHeader className="text-center">
        <UnifiedCardTitle>اختر نوع حسابك</UnifiedCardTitle>
        <UnifiedCardDescription>
          يرجى تحديد نوع الحساب الذي ترغب في إنشائه
        </UnifiedCardDescription>
      </UnifiedCardHeader>
      <UnifiedCardContent className="space-y-4">
        <UnifiedButton
          variant="outline"
          className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5"
          onClick={() => onRoleSelect('merchant')}
        >
          <Store className="w-10 h-10 text-primary" />
          <div className="text-center">
            <div className="font-semibold text-lg">حساب تاجر</div>
            <div className="text-sm text-muted-foreground">
              لبيع المنتجات وإدارة المتجر
            </div>
          </div>
        </UnifiedButton>

        <UnifiedButton
          variant="outline"
          className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5"
          onClick={() => onRoleSelect('affiliate')}
        >
          <Users className="w-10 h-10 text-primary" />
          <div className="text-center">
            <div className="font-semibold text-lg">حساب مسوق</div>
            <div className="text-sm text-muted-foreground">
              للتسويق بالعمولة وكسب الأرباح
            </div>
          </div>
        </UnifiedButton>

        {onBack && (
          <UnifiedButton
            variant="ghost"
            className="w-full"
            onClick={onBack}
          >
            رجوع
          </UnifiedButton>
        )}
      </UnifiedCardContent>
    </UnifiedCard>
  );
};
