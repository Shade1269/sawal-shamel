import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Award,
  MessageSquare,
  ShoppingBag,
  ShoppingCart,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Crown,
  Star,
  Home,
  Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createStoreUrl } from '@/utils/domains';

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
      <Card className="border border-border/30 gradient-bg-card backdrop-blur-sm shadow-elegant">
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
    id: 'admin_dashboard',
    title: 'لوحة التحكم',
    description: 'نظرة شاملة على الأداء',
    icon: <Crown className="w-5 h-5" />,
    color: 'primary',
    href: '/admin/dashboard'
  },
  {
    id: 'view_orders',
    title: 'إدارة الطلبات',
    description: 'عرض ومعالجة طلبات العملاء',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'luxury',
    href: '/admin/orders',
    badge: { text: '12 جديد', variant: 'destructive' }
  },
  {
    id: 'inventory',
    title: 'مركز المخزون',
    description: 'إدارة المنتجات والمستويات',
    icon: <Package className="w-5 h-5" />,
    color: 'success',
    href: '/admin/inventory',
    badge: { text: '5 تنبيه', variant: 'outline' }
  },
  {
    id: 'analytics',
    title: 'تحليلات الإدارة',
    description: 'تقارير الأداء والأرباح',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'persian',
    href: '/admin/analytics'
  }
];

export const getAffiliateActions = (): QuickAction[] => [
  {
    id: 'affiliate_home',
    title: 'لوحة المسوق',
    description: 'متابعة الأداء العام',
    icon: <Star className="w-5 h-5" />,
    color: 'primary',
    href: '/affiliate'
  },
  {
    id: 'storefront',
    title: 'واجهة المتجر',
    description: 'ضبط إعدادات المتجر وتجربته',
    icon: <Package className="w-5 h-5" />,
    color: 'luxury',
    href: '/affiliate/storefront'
  },
  {
    id: 'affiliate_orders',
    title: 'طلبات العملاء',
    description: 'تتبع الطلبات المرتبطة بحملاتك',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'success',
    href: '/affiliate/orders'
  },
  {
    id: 'commissions',
    title: 'التحليلات',
    description: 'عرض العمولات ومؤشرات الأداء',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'premium',
    href: '/affiliate/analytics',
    badge: { text: '245 ر.س', variant: 'default' }
  },
  {
    id: 'share_store',
    title: 'مشاركة المتجر',
    description: 'انسخ رابط متجرك للزوار',
    icon: <Share2 className="w-5 h-5" />,
    color: 'warning',
    onClick: () => {
      navigator.clipboard.writeText(createStoreUrl('my-store'));
    }
  }
];

export const getCustomerActions = (): QuickAction[] => [
  {
    id: 'home',
    title: 'الصفحة الرئيسية',
    description: 'استكشف عروض ومنتجات المنصة',
    icon: <Home className="w-5 h-5" />,
    color: 'primary',
    href: '/'
  },
  {
    id: 'checkout',
    title: 'إتمام الطلب',
    description: 'أكمل عملية الشراء الحالية',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'luxury',
    href: '/checkout'
  },
  {
    id: 'order_confirmation',
    title: 'تأكيد الطلب',
    description: 'عرض تفاصيل الطلب الأخير',
    icon: <Receipt className="w-5 h-5" />,
    color: 'premium',
    href: '/order/confirmation'
  },
  {
    id: 'support',
    title: 'الدعم والمساعدة',
    description: 'تواصل مع فريق الدعم',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'persian',
    href: '/auth'
  },
  {
    id: 'profile',
    title: 'حسابي',
    description: 'إدارة بياناتك الشخصية',
    icon: <Settings className="w-5 h-5" />,
    color: 'success',
    href: '/profile'
  }
];

export default QuickActionPanel;