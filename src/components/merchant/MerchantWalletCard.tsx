import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { Wallet, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { MerchantWalletBalance } from '@/hooks/useMerchantWallet';

interface MerchantWalletCardProps {
  balance: MerchantWalletBalance;
}

export const MerchantWalletCard = ({ balance }: MerchantWalletCardProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <UnifiedCard>
        <UnifiedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <UnifiedCardTitle className="text-sm font-medium">الرصيد المتاح</UnifiedCardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="text-2xl font-bold">
            {balance.available_balance_sar.toFixed(2)} ريال
          </div>
          <p className="text-xs text-muted-foreground">
            متاح للسحب الآن
          </p>
        </UnifiedCardContent>
      </UnifiedCard>

      <UnifiedCard>
        <UnifiedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <UnifiedCardTitle className="text-sm font-medium">الرصيد المعلق</UnifiedCardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="text-2xl font-bold">
            {balance.pending_balance_sar.toFixed(2)} ريال
          </div>
          <p className="text-xs text-muted-foreground">
            قيد الانتظار للتوصيل
          </p>
        </UnifiedCardContent>
      </UnifiedCard>

      <UnifiedCard>
        <UnifiedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <UnifiedCardTitle className="text-sm font-medium">إجمالي الأرباح</UnifiedCardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="text-2xl font-bold">
            {balance.lifetime_earnings_sar.toFixed(2)} ريال
          </div>
          <p className="text-xs text-muted-foreground">
            منذ البداية
          </p>
        </UnifiedCardContent>
      </UnifiedCard>

      <UnifiedCard>
        <UnifiedCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <UnifiedCardTitle className="text-sm font-medium">إجمالي المسحوب</UnifiedCardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <div className="text-2xl font-bold">
            {balance.total_withdrawn_sar.toFixed(2)} ريال
          </div>
          <p className="text-xs text-muted-foreground">
            المبالغ المسحوبة
          </p>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};