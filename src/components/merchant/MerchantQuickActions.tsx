import { useNavigate } from 'react-router-dom';
import { UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Plus, Wallet, ShoppingCart, Package } from 'lucide-react';

export const MerchantQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { icon: Plus, label: 'إضافة منتج', path: '/merchant/products', color: 'text-primary' },
    { icon: Wallet, label: 'المحفظة', path: '/merchant/wallet', color: 'text-success' },
    { icon: ShoppingCart, label: 'الطلبات', path: '/merchant/orders', color: 'text-info' },
    { icon: Package, label: 'المنتجات', path: '/merchant/products', color: 'text-warning' },
  ];

  return (
    <UnifiedCard variant="glass">
      <UnifiedCardHeader>
        <UnifiedCardTitle>إجراءات سريعة</UnifiedCardTitle>
      </UnifiedCardHeader>
      <UnifiedCardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <UnifiedButton
              key={index}
              variant="outline"
              className="flex flex-col items-center justify-center h-20 gap-2"
              onClick={() => navigate(action.path)}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs">{action.label}</span>
            </UnifiedButton>
          ))}
        </div>
      </UnifiedCardContent>
    </UnifiedCard>
  );
};
