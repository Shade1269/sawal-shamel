import { AdminMerchantWithdrawals } from '@/components/admin/AdminMerchantWithdrawals';

export default function AdminMerchantWithdrawalsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إدارة سحوبات التجار</h1>
        <p className="text-muted-foreground">مراجعة والموافقة على طلبات سحب التجار</p>
      </div>
      
      <AdminMerchantWithdrawals />
    </div>
  );
}
