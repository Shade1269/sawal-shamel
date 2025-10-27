import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useWithdrawals } from '@/hooks/useWithdrawals';

export const WalletStats = () => {
  const { balance, transactions } = useWallet();
  const { totalPending, totalCompleted } = useWithdrawals();

  // حساب إحصائيات الشهر الحالي
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyEarnings = monthlyTransactions
    .filter(t => t.transaction_type === 'COMMISSION')
    .reduce((sum, t) => sum + Number(t.amount_sar), 0);

  const monthlyWithdrawals = monthlyTransactions
    .filter(t => t.transaction_type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + Number(t.amount_sar), 0);

  const stats = [
    {
      title: 'الرصيد المتاح',
      value: `${balance?.available_balance_sar.toFixed(2) || '0.00'} ر.س`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'الرصيد المعلق',
      value: `${balance?.pending_balance_sar.toFixed(2) || '0.00'} ر.س`,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'أرباح هذا الشهر',
      value: `${monthlyEarnings.toFixed(2)} ر.س`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'سحوبات هذا الشهر',
      value: `${monthlyWithdrawals.toFixed(2)} ر.س`,
      icon: TrendingDown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
