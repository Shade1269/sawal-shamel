import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { Skeleton } from '@/components/ui/skeleton';

interface WalletCardProps {
  onWithdrawClick?: () => void;
}

export const WalletCard = ({ onWithdrawClick }: WalletCardProps) => {
  const { balance, isLoading, canWithdraw } = useWallet();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            المحفظة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!balance) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          المحفظة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Balance */}
        <div className="gradient-card-primary rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">الرصيد المتاح</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-bold text-primary">
            {Number(balance.available_balance_sar).toFixed(2)} ر.س
          </div>
          {canWithdraw && onWithdrawClick && (
            <Button 
              onClick={onWithdrawClick}
              className="w-full mt-4"
              variant="default"
            >
              طلب سحب
            </Button>
          )}
          {!canWithdraw && (
            <p className="text-xs text-muted-foreground mt-2">
              الحد الأدنى للسحب: {Number(balance.minimum_withdrawal_sar).toFixed(2)} ر.س
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending Balance */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">قيد الانتظار</span>
            </div>
            <div className="text-xl font-semibold">
              {Number(balance.pending_balance_sar).toFixed(2)} ر.س
            </div>
          </div>

          {/* Lifetime Earnings */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">إجمالي الأرباح</span>
            </div>
            <div className="text-xl font-semibold">
              {Number(balance.lifetime_earnings_sar).toFixed(2)} ر.س
            </div>
          </div>

          {/* Total Withdrawn */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-info" />
              <span className="text-xs text-muted-foreground">تم سحبه</span>
            </div>
            <div className="text-xl font-semibold">
              {Number(balance.total_withdrawn_sar).toFixed(2)} ر.س
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
