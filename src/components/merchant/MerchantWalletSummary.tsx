import { useNavigate } from 'react-router-dom';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Wallet, ArrowLeft, TrendingUp, Clock } from 'lucide-react';

interface WalletSummaryProps {
  balance: {
    available: number;
    pending: number;
    lifetime: number;
  };
}

export const MerchantWalletSummary = ({ balance }: WalletSummaryProps) => {
  const navigate = useNavigate();

  return (
    <UnifiedCard variant="glass" className="bg-gradient-to-br from-primary/5 to-primary/10">
      <UnifiedCardHeader className="flex flex-row items-center justify-between">
        <UnifiedCardTitle className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          ملخص المحفظة
        </UnifiedCardTitle>
        <UnifiedButton variant="ghost" size="sm" onClick={() => navigate('/merchant/wallet')}>
          إدارة المحفظة
          <ArrowLeft className="h-4 w-4 mr-1" />
        </UnifiedButton>
      </UnifiedCardHeader>
      <UnifiedCardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-success mb-1">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold">{balance.available.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">متاح للسحب</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-warning mb-1">
              <Clock className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold">{balance.pending.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">قيد التحصيل</p>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-xl font-bold">{balance.lifetime.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">إجمالي الأرباح</p>
          </div>
        </div>
      </UnifiedCardContent>
    </UnifiedCard>
  );
};
