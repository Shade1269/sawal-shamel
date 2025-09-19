import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  X,
  Check,
  Archive,
  Filter,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface SmartNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'achievement' | 'update';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isImportant: boolean;
  category: 'sales' | 'users' | 'products' | 'system' | 'marketing' | 'analytics';
  actionUrl?: string;
  actionLabel?: string;
  data?: any;
}

interface SmartNotificationsProps {
  notifications: SmartNotification[];
  onNotificationRead?: (id: string) => void;
  onNotificationDismiss?: (id: string) => void;
  onNotificationAction?: (notification: SmartNotification) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  maxHeight?: number;
  showFilters?: boolean;
}

const notificationIcons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertTriangle,
  info: Info,
  achievement: TrendingUp,
  update: Bell
};

const categoryIcons = {
  sales: DollarSign,
  users: Users,
  products: Package,
  system: Settings,
  marketing: TrendingUp,
  analytics: TrendingDown
};

const typeColors = {
  success: 'text-green-500 bg-green-50 border-green-200',
  warning: 'text-yellow-500 bg-yellow-50 border-yellow-200', 
  error: 'text-red-500 bg-red-50 border-red-200',
  info: 'text-blue-500 bg-blue-50 border-blue-200',
  achievement: 'text-purple-500 bg-purple-50 border-purple-200',
  update: 'text-gray-500 bg-gray-50 border-gray-200'
};

export function SmartNotifications({
  notifications,
  onNotificationRead,
  onNotificationDismiss,
  onNotificationAction,
  onMarkAllRead,
  onClearAll,
  maxHeight = 400,
  showFilters = true
}: SmartNotificationsProps) {
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const importantCount = notifications.filter(n => n.isImportant && !n.isRead).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'important' && !notification.isImportant) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const today = new Date();
    const notifDate = notification.timestamp;
    
    let groupKey = '';
    if (notifDate.toDateString() === today.toDateString()) {
      groupKey = 'اليوم';
    } else if (notifDate.getTime() > today.getTime() - 24 * 60 * 60 * 1000) {
      groupKey = 'أمس';
    } else if (notifDate.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      groupKey = 'هذا الأسبوع';
    } else {
      groupKey = 'سابقاً';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
    return groups;
  }, {} as Record<string, SmartNotification[]>);

  const handleNotificationClick = (notification: SmartNotification) => {
    if (!notification.isRead && onNotificationRead) {
      onNotificationRead(notification.id);
    }
    
    if (notification.actionUrl && onNotificationAction) {
      onNotificationAction(notification);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-sm md:text-base">الإشعارات الذكية</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {unreadCount > 0 
                  ? `${unreadCount} إشعار جديد${importantCount > 0 ? ` (${importantCount} مهم)` : ''}`
                  : 'جميع الإشعارات مقروءة'
                }
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && onMarkAllRead && (
              <Button variant="ghost" size="sm" onClick={onMarkAllRead} className="h-8 w-8 p-0 md:h-9 md:w-9 touch-target">
                <Check className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            )}
            {notifications.length > 0 && onClearAll && (
              <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 w-8 p-0 md:h-9 md:w-9 touch-target">
                <Archive className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:h-9 md:w-9 touch-target">
              <Settings className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col space-y-2 pt-2 md:space-y-0">
            <div className="flex flex-wrap gap-1 md:gap-2">
              {[
                { key: 'all', label: 'الكل' },
                { key: 'unread', label: 'غير مقروء' },
                { key: 'important', label: 'مهم' }
              ].map(option => (
                <Button
                  key={option.key}
                  variant={filter === option.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(option.key)}
                  className="text-xs h-7 px-2 md:h-8 md:px-3 touch-target"
                >
                  {option.label}
                </Button>
              ))}
            </div>
            
            <Separator className="my-2 md:hidden" />
            
            <div className="flex flex-wrap gap-1 md:gap-2">
              {[
                { key: 'all', label: 'الكل' },
                { key: 'success', label: 'نجاح' },
                { key: 'warning', label: 'تحذير' },
                { key: 'error', label: 'خطأ' }
              ].map(option => (
                <Button
                  key={option.key}
                  variant={typeFilter === option.key ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setTypeFilter(option.key)}
                  className="text-xs h-7 px-2 md:h-8 md:px-3 touch-target"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-80 md:h-96">
          <div className="p-3 md:p-4 space-y-3 md:space-y-4">
            <AnimatePresence>
              {Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                <div key={group}>
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <h4 className="text-xs font-medium text-muted-foreground">{group}</h4>
                    <Separator className="flex-1" />
                  </div>
                  
                  <div className="space-y-2">
                    {groupNotifications.map((notification, index) => {
                      const IconComponent = notificationIcons[notification.type];
                      const CategoryIcon = categoryIcons[notification.category];
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "group relative p-3 md:p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm touch-target",
                            !notification.isRead && "bg-muted/30 border-l-4 border-l-primary",
                            notification.isImportant && "ring-1 ring-orange-200",
                            typeColors[notification.type]
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-2 md:gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <IconComponent className="h-3 w-3 md:h-4 md:w-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 md:gap-2 mb-1">
                                    <p className="text-xs md:text-sm font-medium truncate">
                                      {notification.title}
                                    </p>
                                    {notification.isImportant && (
                                      <Badge variant="outline" className="text-xs px-1 py-0 flex-shrink-0">
                                        مهم
                                      </Badge>
                                    )}
                                    <CategoryIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  </div>
                                  
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  
                                  <div className="flex flex-col space-y-1 md:flex-row md:items-center md:gap-2 md:space-y-0 mt-2">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        {formatTimestamp(notification.timestamp)}
                                      </span>
                                    </div>
                                    
                                    {notification.actionLabel && (
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="h-auto p-0 text-xs touch-target"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (onNotificationAction) {
                                            onNotificationAction(notification);
                                          }
                                        }}
                                      >
                                        {notification.actionLabel}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  {!notification.isRead && onNotificationRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 touch-target"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onNotificationRead(notification.id);
                                      }}
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                  
                                  {onNotificationDismiss && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 touch-target"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onNotificationDismiss(notification.id);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </AnimatePresence>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-6 md:py-8">
                <Bell className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                <h3 className="font-medium mb-2 text-sm md:text-base">لا توجد إشعارات</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {filter === 'unread' 
                    ? 'جميع الإشعارات مقروءة'
                    : 'لا توجد إشعارات لعرضها'
                  }
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}