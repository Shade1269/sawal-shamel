import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Star,
  Package,
  Eye,
  Heart,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StatItem {
  id: string;
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  color: 'primary' | 'luxury' | 'premium' | 'persian' | 'success' | 'warning';
  description?: string;
}

interface StatsOverviewProps {
  stats: StatItem[];
  title?: string;
  className?: string;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  title = "نظرة عامة على الإحصائيات",
  className = ""
}) => {
  const getColorClasses = (color: StatItem['color']) => {
    const colorMap = {
      primary: {
        bg: 'gradient-card-primary',
        border: 'border-primary/20',
        icon: 'gradient-btn-primary text-white',
        text: 'text-primary'
      },
      luxury: {
        bg: 'gradient-card-luxury',
        border: 'border-luxury/20',
        icon: 'gradient-btn-luxury text-white',
        text: 'text-luxury'
      },
      premium: {
        bg: 'gradient-card-premium',
        border: 'border-premium/20',
        icon: 'gradient-btn-premium text-white',
        text: 'text-premium'
      },
      persian: {
        bg: 'gradient-card-persian',
        border: 'border-persian/20',
        icon: 'gradient-btn-persian text-white',
        text: 'text-persian'
      },
      success: {
        bg: 'gradient-card-success',
        border: 'border-success/20',
        icon: 'gradient-btn-success text-white',
        text: 'text-success'
      },
      warning: {
        bg: 'gradient-card-warning',
        border: 'border-warning/20',
        icon: 'gradient-btn-warning text-white',
        text: 'text-warning'
      }
    };
    return colorMap[color];
  };

  const formatValue = (value: string | number): string => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}م`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}ك`;
      }
      return value.toLocaleString('ar-SA');
    }
    return value;
  };

  return (
    <div className={className}>
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-persian bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`group hover:shadow-lg transition-all duration-300 ${colors.bg} ${colors.border} border backdrop-blur-sm`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${colors.icon} group-hover:scale-110 transition-transform duration-300 shadow-soft`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${colors.text} mb-1`}>
                    {formatValue(stat.value)}
                  </div>
                  
                  {stat.change && (
                    <div className="flex items-center gap-1 text-xs">
                      {stat.change.type === 'increase' ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <Badge
                        variant={stat.change.type === 'increase' ? 'default' : 'destructive'}
                        className="px-1 py-0 text-xs"
                      >
                        {stat.change.value > 0 && '+'}
                        {stat.change.value}%
                      </Badge>
                      <span className="text-muted-foreground">
                        {stat.change.period}
                      </span>
                    </div>
                  )}
                  
                  {stat.description && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {stat.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Pre-configured stat sets for common use cases
export const getDashboardStats = (): StatItem[] => [
  {
    id: 'revenue',
    title: 'الإيرادات الشهرية',
    value: 45280,
    change: { value: 12.5, type: 'increase', period: 'من الشهر الماضي' },
    icon: <DollarSign className="w-4 h-4" />,
    color: 'primary',
    description: 'ريال سعودي'
  },
  {
    id: 'orders',
    title: 'إجمالي الطلبات',
    value: 324,
    change: { value: 8.2, type: 'increase', period: 'هذا الأسبوع' },
    icon: <ShoppingBag className="w-4 h-4" />,
    color: 'luxury',
    description: 'طلب جديد'
  },
  {
    id: 'customers',
    title: 'العملاء النشطون',
    value: 156,
    change: { value: 3.1, type: 'decrease', period: 'آخر 30 يوم' },
    icon: <Users className="w-4 h-4" />,
    color: 'premium',
    description: 'عميل مسجل'
  },
  {
    id: 'rating',
    title: 'تقييم المتجر',
    value: '4.8',
    change: { value: 0.3, type: 'increase', period: 'آخر تحديث' },
    icon: <Star className="w-4 h-4" />,
    color: 'persian',
    description: 'من 5 نجوم'
  }
];

export const getInventoryStats = (): StatItem[] => [
  {
    id: 'total_products',
    title: 'إجمالي المنتجات',
    value: 1247,
    icon: <Package className="w-4 h-4" />,
    color: 'primary',
    description: 'منتج في المخزون'
  },
  {
    id: 'low_stock',
    title: 'مخزون منخفض',
    value: 23,
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'warning',
    description: 'منتج يحتاج إعادة تخزين'
  },
  {
    id: 'views',
    title: 'مشاهدات المنتجات',
    value: 12580,
    change: { value: 15.3, type: 'increase', period: 'هذا الشهر' },
    icon: <Eye className="w-4 h-4" />,
    color: 'luxury',
    description: 'مشاهدة'
  },
  {
    id: 'favorites',
    title: 'المفضلة',
    value: 892,
    change: { value: 7.8, type: 'increase', period: 'آخر أسبوع' },
    icon: <Heart className="w-4 h-4" />,
    color: 'premium',
    description: 'إضافة للمفضلة'
  }
];

export const getEngagementStats = (): StatItem[] => [
  {
    id: 'messages',
    title: 'الرسائل',
    value: 567,
    change: { value: 22.1, type: 'increase', period: 'هذا الأسبوع' },
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'primary',
    description: 'رسالة جديدة'
  },
  {
    id: 'engagement_rate',
    title: 'معدل التفاعل',
    value: '68%',
    change: { value: 4.5, type: 'increase', period: 'آخر 30 يوم' },
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'success',
    description: 'من إجمالي الزوار'
  }
];

export default StatsOverview;