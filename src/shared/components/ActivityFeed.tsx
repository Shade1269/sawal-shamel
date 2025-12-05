import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  Eye,
  Heart,
  DollarSign,
  Truck,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useFastAuth } from '@/hooks/useFastAuth';

interface ActivityItem {
  id: string;
  type: 'order' | 'product' | 'user' | 'message' | 'review' | 'payment' | 'inventory' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'failed' | 'in_progress';
  actionRequired?: boolean;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
  title?: string;
  showFilters?: boolean;
  maxItems?: number;
  autoRefresh?: boolean;
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities = [],
  title = "النشاطات الأخيرة",
  showFilters = true,
  maxItems = 20,
  autoRefresh = false,
  className = ""
}) => {
  const { profile } = useFastAuth();
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Apply filters
    let filtered = activities;
    
    if (activeFilter !== 'all') {
      filtered = activities.filter(activity => activity.type === activeFilter);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Limit items
    filtered = filtered.slice(0, maxItems);
    
    setFilteredActivities(filtered);
  }, [activities, activeFilter, maxItems]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconMap = {
      order: <ShoppingBag className="w-4 h-4" />,
      product: <Package className="w-4 h-4" />,
      user: <Users className="w-4 h-4" />,
      message: <MessageSquare className="w-4 h-4" />,
      review: <Star className="w-4 h-4" />,
      payment: <DollarSign className="w-4 h-4" />,
      inventory: <Package className="w-4 h-4" />,
      system: <TrendingUp className="w-4 h-4" />
    };
    return iconMap[type];
  };

  const getActivityColor = (type: ActivityItem['type'], priority: ActivityItem['priority']) => {
    if (priority === 'urgent') return 'text-destructive bg-destructive/10 border-destructive/20';
    if (priority === 'high') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    
    const colorMap = {
      order: 'text-primary bg-primary/10 border-primary/20',
      product: 'text-luxury bg-luxury/10 border-luxury/20',
      user: 'text-premium bg-premium/10 border-premium/20',
      message: 'text-persian bg-persian/10 border-persian/20',
      review: 'text-warning bg-warning/10 border-warning/20',
      payment: 'text-success bg-success/10 border-success/20',
      inventory: 'text-info bg-info/10 border-info/20',
      system: 'text-muted-foreground bg-muted border-border'
    };
    return colorMap[type];
  };

  const getStatusIcon = (status: ActivityItem['status']) => {
    const statusMap = {
      pending: <Clock className="w-3 h-3 text-amber-500" />,
      completed: <CheckCircle className="w-3 h-3 text-success" />,
      failed: <AlertTriangle className="w-3 h-3 text-destructive" />,
      in_progress: <RefreshCw className="w-3 h-3 text-info animate-spin" />
    };
    return statusMap[status];
  };

  const filterOptions = [
    { value: 'all', label: 'الكل', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'order', label: 'الطلبات', icon: <ShoppingBag className="w-4 h-4" /> },
    { value: 'product', label: 'المنتجات', icon: <Package className="w-4 h-4" /> },
    { value: 'user', label: 'المستخدمون', icon: <Users className="w-4 h-4" /> },
    { value: 'message', label: 'الرسائل', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'payment', label: 'المدفوعات', icon: <DollarSign className="w-4 h-4" /> }
  ];

  return (
    <div className={className}>
      <Card className="border border-border/30 gradient-bg-card backdrop-blur-sm shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-persian bg-clip-text text-transparent flex items-center gap-2">
              <Clock className="w-5 h-5 text-persian" />
              {title}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {showFilters && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      تصفية
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>تصفية حسب النوع</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {filterOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setActiveFilter(option.value)}
                        className={activeFilter === option.value ? 'bg-primary/10' : ''}
                      >
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-96">
            <div className="p-4 space-y-4">
              <AnimatePresence>
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 rounded-lg border transition-all duration-300 hover:shadow-sm
                        ${getActivityColor(activity.type, activity.priority)}
                        ${activity.actionRequired ? 'ring-2 ring-amber-500/20' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {activity.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(activity.status)}
                              {activity.actionRequired && (
                                <Badge variant="outline" className="text-xs">
                                  يتطلب إجراء
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-xs opacity-80 mb-2">
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {activity.user && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={activity.user.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {activity.user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs opacity-70">
                                    {activity.user.name}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs opacity-60">
                                {formatDistanceToNow(activity.timestamp, {
                                  addSuffix: true,
                                  locale: ar
                                })}
                              </span>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2">
                                    <Eye className="w-4 h-4" />
                                    عرض التفاصيل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <ExternalLink className="w-4 h-4" />
                                    فتح
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="gap-2 text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                    حذف
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد نشاطات حديثة</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

// Sample activity data generator
export const generateSampleActivities = (): ActivityItem[] => [
  {
    id: '1',
    type: 'order',
    title: 'طلب جديد #1234',
    description: 'طلب جديد بقيمة 450 ريال من العميل أحمد محمد',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    user: { id: '1', name: 'أحمد محمد', avatar: '/avatar1.jpg' },
    priority: 'high',
    status: 'pending',
    actionRequired: true
  },
  {
    id: '2',
    type: 'product',
    title: 'منتج جديد مضاف',
    description: 'تم إضافة منتج "ساعة ذكية" إلى المتجر',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    user: { id: '2', name: 'سارة أحمد', avatar: '/avatar2.jpg' },
    priority: 'medium',
    status: 'completed'
  },
  {
    id: '3',
    type: 'payment',
    title: 'دفعة مستلمة',
    description: 'تم استلام دفعة بقيمة 1,250 ريال',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    priority: 'medium',
    status: 'completed'
  },
  {
    id: '4',
    type: 'inventory',
    title: 'تنبيه مخزون منخفض',
    description: 'المنتج "تيشيرت قطني" أصبح المخزون منخفض (5 قطع متبقية)',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    priority: 'urgent',
    status: 'pending',
    actionRequired: true
  },
  {
    id: '5',
    type: 'user',
    title: 'مستخدم جديد',
    description: 'انضم مستخدم جديد: خالد سعد',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    user: { id: '3', name: 'خالد سعد', avatar: '/avatar3.jpg' },
    priority: 'low',
    status: 'completed'
  }
];

export default ActivityFeed;