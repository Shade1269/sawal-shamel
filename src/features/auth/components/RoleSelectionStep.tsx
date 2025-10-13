import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Users } from "lucide-react";

interface RoleSelectionStepProps {
  onRoleSelect: (role: 'merchant' | 'affiliate') => void;
  onBack?: () => void;
}

export const RoleSelectionStep = ({ onRoleSelect, onBack }: RoleSelectionStepProps) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>اختر نوع حسابك</CardTitle>
        <CardDescription>
          يرجى تحديد نوع الحساب الذي ترغب في إنشائه
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
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
        </Button>

        <Button
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
        </Button>

        {onBack && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={onBack}
          >
            رجوع
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
