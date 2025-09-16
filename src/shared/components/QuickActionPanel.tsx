import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createStoreUrl } from '@/utils/domains';
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Download,
  Upload,
  Settings,
  Share2,
  Copy,
  ExternalLink,
  BookOpen,
  BarChart3,
  Users,
  MessageSquare,
  ShoppingBag,
  Package,
  Truck,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  color: 'primary' | 'luxury' | 'premium' | 'persian' | 'success' | 'warning' | 'destructive';
  href?: string;
  onClick?: () => void;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  disabled?: boolean;
  shortcut?: string;
}

interface QuickActionPanelProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
  columns?: 2 | 3 | 4;
}

const QuickActionPanel: React.FC<QuickActionPanelProps> = ({
  actions,
  title = "الإجراءات السريعة",
  className = "",
  columns = 3
}) => {
  const navigate = useNavigate();

  const getColorClasses = (color: QuickAction['color']) => {
    const colorMap = {
      primary: {
        button: 'bg-gradient-primary hover:shadow-glow border-primary/20',
        icon: 'text-white',
        hover: 'hover:scale-105'
      },
      luxury: {
        button: 'bg-gradient-luxury hover:shadow-luxury border-luxury/20',
        icon: 'text-white',
        hover: 'hover:scale-105'
      },
      premium: {
        button: 'bg-gradient-premium hover:shadow-premium border-premium/20',
        icon: 'text-white',
        hover: 'hover:scale-105'
      },
      persian: {
        button: 'bg-gradient-persian hover:shadow-persian border-persian/20',
        icon: 'text-white',
        hover: 'hover:scale-105'
      },
      success: {
        button: 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-green-500/25 border-green-500/20',
        icon: 'text-white',
        hover: 'hover:scale-105'
      },
      warning: {
        button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-amber-500/25 border-amber-500/20',
        icon: 'text-white',
        hover: 'hover:scale-105'
      },
      destructive: {
        button: 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/25 border-red-500/20',
        icon: 'text-white',
        hover: 'hover:scale-105'
      }
    };
    return colorMap[color];
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.disabled) return;
    
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      if (action.href.startsWith('http')) {
        window.open(action.href, '_blank');
      } else {
        navigate(action.href);
      }
    }
  };

  const gridClass = `grid-cols-1 md:grid-cols-${columns}`;

  return (
    <div className={className}>
      <Card className="border border-border/30 bg-gradient-to-br from-card/60 to-card backdrop-blur-sm shadow-elegant">
        <CardHeader>
          <CardTitle className="text-xl font-bold bg-gradient-persian bg-clip-text text-transparent flex items-center gap-2">
            <Zap className="w-5 h-5 text-persian" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${gridClass} gap-4`}>
            {actions.map((action, index) => {
              const colors = getColorClasses(action.color);
              
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="outline"
                    className={`
                      w-full h-auto p-4 flex flex-col items-center gap-3 
                      ${colors.button} ${colors.hover}
                      transition-all duration-300 border shadow-soft
                      ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => handleActionClick(action)}
                    disabled={action.disabled}
                  >
                    <div className={`p-2 rounded-lg ${colors.icon}`}>
                      {action.icon}
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium text-white mb-1">
                        {action.title}
                      </div>
                      {action.description && (
                        <div className="text-xs text-white/80">
                          {action.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {action.badge && (
                        <Badge variant={action.badge.variant} className="text-xs">
                          {action.badge.text}
                        </Badge>
                      )}
                      {action.shortcut && (
                        <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                          {action.shortcut}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Pre-configured action sets for common use cases
export const getAdminActions = (): QuickAction[] => [
  {
    id: 'add_product',
    title: 'إضافة منتج',
    description: 'إضافة منتج جديد للمتجر',
    icon: <Plus className="w-5 h-5" />,
    color: 'primary',
    href: '/admin/products',
    shortcut: 'Ctrl+N'
  },
  {
    id: 'view_orders',
    title: 'الطلبات',
    description: 'عرض وإدارة الطلبات',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'luxury',
    href: '/admin/orders',
    badge: { text: '12 جديد', variant: 'destructive' }
  },
  {
    id: 'manage_users',
    title: 'المستخدمون',
    description: 'إدارة حسابات المستخدمين',
    icon: <Users className="w-5 h-5" />,
    color: 'premium',
    href: '/admin/users'
  },
  {
    id: 'analytics',
    title: 'التحليلات',
    description: 'عرض تقارير الأداء',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'persian',
    href: '/admin/analytics'
  },
  {
    id: 'inventory',
    title: 'المخزون',
    description: 'إدارة المخزون والمنتجات',
    icon: <Package className="w-5 h-5" />,
    color: 'success',
    href: '/admin/inventory',
    badge: { text: '5 تنبيه', variant: 'outline' }
  },
  {
    id: 'settings',
    title: 'الإعدادات',
    description: 'إعدادات المتجر العامة',
    icon: <Settings className="w-5 h-5" />,
    color: 'warning',
    href: '/admin/settings'
  }
];

export const getMerchantActions = (): QuickAction[] => [
  {
    id: 'add_product',
    title: 'منتج جديد',
    description: 'إضافة منتج للمتجر',
    icon: <Plus className="w-5 h-5" />,
    color: 'primary',
    href: '/merchant/products/new'
  },
  {
    id: 'orders',
    title: 'الطلبات',
    description: 'إدارة طلبات العملاء',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'luxury',
    href: '/merchant/orders',
    badge: { text: '3 جديد', variant: 'destructive' }
  },
  {
    id: 'inventory',
    title: 'المخزون',
    description: 'تتبع المخزون',
    icon: <Package className="w-5 h-5" />,
    color: 'premium',
    href: '/merchant/inventory'
  },
  {
    id: 'shipping',
    title: 'الشحن',
    description: 'إدارة عمليات الشحن',
    icon: <Truck className="w-5 h-5" />,
    color: 'persian',
    href: '/merchant/shipping'
  },
  {
    id: 'payments',
    title: 'المدفوعات',
    description: 'تتبع المدفوعات',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'success',
    href: '/merchant/payments'
  },
  {
    id: 'analytics',
    title: 'التقارير',
    description: 'تحليل الأداء',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'warning',
    href: '/merchant/analytics'
  }
];

export const getAffiliateActions = (): QuickAction[] => [
  {
    id: 'browse_products',
    title: 'تصفح المنتجات',
    description: 'البحث عن منتجات للترويج',
    icon: <Eye className="w-5 h-5" />,
    color: 'primary',
    href: '/products-browser'
  },
  {
    id: 'my_store',
    title: 'متجري',
    description: 'إدارة متجر الأفيليت',
    icon: <Package className="w-5 h-5" />,
    color: 'luxury',
    href: '/affiliate/store'
  },
  {
    id: 'commissions',
    title: 'العمولات',
    description: 'تتبع الأرباح والعمولات',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'premium',
    href: '/affiliate/commissions',
    badge: { text: '245 ر.س', variant: 'default' }
  },
  {
    id: 'atlantis_chat',
    title: 'أتلانتس شات',
    description: 'الدردشة التفاعلية',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'persian',
    href: '/atlantis/chat'
  },
  {
    id: 'leaderboard',
    title: 'المتصدرون',
    description: 'جدول المتصدرين',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'success',
    href: '/atlantis'
  },
  {
    id: 'share_store',
    title: 'مشاركة المتجر',
    description: 'مشاركة رابط المتجر',
    icon: <Share2 className="w-5 h-5" />,
    color: 'warning',
    onClick: () => {
      // Copy store link to clipboard
      navigator.clipboard.writeText(createStoreUrl('my-store'));
    }
  }
];

export const getCustomerActions = (): QuickAction[] => [
  {
    id: 'browse_products',
    title: 'تصفح المنتجات',
    description: 'اكتشف منتجات جديدة',
    icon: <Eye className="w-5 h-5" />,
    color: 'primary',
    href: '/products'
  },
  {
    id: 'my_orders',
    title: 'طلباتي',
    description: 'تتبع طلباتك',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'luxury',
    href: '/orders'
  },
  {
    id: 'favorites',
    title: 'المفضلة',
    description: 'المنتجات المحفوظة',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'premium',
    href: '/favorites'
  },
  {
    id: 'chat',
    title: 'الدردشة',
    description: 'تواصل مع الدعم',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'persian',
    href: '/chat'
  },
  {
    id: 'profile',
    title: 'الملف الشخصي',
    description: 'إدارة حسابك',
    icon: <Settings className="w-5 h-5" />,
    color: 'success',
    href: '/profile'
  }
];

export default QuickActionPanel;