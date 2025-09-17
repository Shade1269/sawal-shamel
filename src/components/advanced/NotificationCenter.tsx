import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle, Info, X, Settings, Filter } from 'lucide-react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesignSystem } from '@/hooks/useDesignSystem';

// Advanced Notification Center v3.3
// مركز الإشعارات المتطور - النسخة الثالثة المحسّنة

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'security' | 'business' | 'user';
  actionable: boolean;
  persistent: boolean;
}

interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  categories: {
    system: boolean;
    security: boolean;
    business: boolean;
    user: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
}

export const NotificationCenter: React.FC = () => {
  const { patterns, colors } = useDesignSystem();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'error',
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected from unknown IP address',
      timestamp: '2024-12-17 15:45',
      read: false,
      priority: 'urgent',
      category: 'security',
      actionable: true,
      persistent: true
    },
    {
      id: '2',
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily system backup completed successfully at 3:00 AM',
      timestamp: '2024-12-17 03:00',
      read: false,
      priority: 'low',
      category: 'system',
      actionable: false,
      persistent: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'High CPU Usage',
      message: 'Server CPU usage has exceeded 85% for the past 10 minutes',
      timestamp: '2024-12-17 14:30',
      read: true,
      priority: 'high',
      category: 'system',
      actionable: true,
      persistent: false
    },
    {
      id: '4',
      type: 'info',
      title: 'New User Registration',
      message: '5 new users registered in the past hour',
      timestamp: '2024-12-17 14:00',
      read: true,
      priority: 'medium',
      category: 'business',
      actionable: false,
      persistent: false
    },
    {
      id: '5',
      type: 'warning',
      title: 'Payment Failed',
      message: 'Payment processing failed for invoice #INV-2024-001',
      timestamp: '2024-12-17 13:15',
      read: false,
      priority: 'high',
      category: 'business',
      actionable: true,
      persistent: true
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    categories: {
      system: true,
      security: true,
      business: true,
      user: true
    },
    priorities: {
      low: true,
      medium: true,
      high: true,
      urgent: true
    }
  });

  const [filter, setFilter] = useState<{
    category: string;
    priority: string;
    read: string;
  }>({
    category: 'all',
    priority: 'all',
    read: 'all'
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-primary text-primary-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security':
        return 'bg-destructive/20 text-destructive';
      case 'system':
        return 'bg-primary/20 text-primary';
      case 'business':
        return 'bg-success/20 text-success';
      case 'user':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter.category !== 'all' && notification.category !== filter.category) return false;
    if (filter.priority !== 'all' && notification.priority !== filter.priority) return false;
    if (filter.read === 'unread' && notification.read) return false;
    if (filter.read === 'read' && !notification.read) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  return (
    <div className="space-y-6">
      {/* Notification Overview */}
      <EnhancedCard variant="gradient" className={`${patterns.card} border-primary/20`}>
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notification Center
            <Badge variant="outline" className="ml-auto">
              {unreadCount} unread
            </Badge>
          </EnhancedCardTitle>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <Bell className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <AlertCircle className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold text-warning">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive">{urgentCount}</div>
              <div className="text-sm text-muted-foreground">Urgent</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">
                {notifications.filter(n => n.actionable).length}
              </div>
              <div className="text-sm text-muted-foreground">Actionable</div>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters and Actions */}
          <EnhancedCard>
            <EnhancedCardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select value={filter.category} onValueChange={(value) => setFilter(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Select value={filter.priority} onValueChange={(value) => setFilter(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filter.read} onValueChange={(value) => setFilter(prev => ({ ...prev, read: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Read Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
                <EnhancedButton size="sm" variant="outline" onClick={markAllAsRead}>
                  Mark All Read
                </EnhancedButton>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>

          {/* Notifications */}
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <EnhancedCard 
                key={notification.id} 
                className={`transition-all duration-200 ${
                  !notification.read ? 'border-primary/50 bg-primary/5' : ''
                } ${notification.persistent ? 'border-l-4 border-l-destructive' : ''}`}
              >
                <EnhancedCardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          <Badge className={getPriorityColor(notification.priority)} size="sm">
                            {notification.priority}
                          </Badge>
                          <Badge variant="outline" className={getCategoryColor(notification.category)} size="sm">
                            {notification.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                          <div className="flex items-center gap-2">
                            {notification.actionable && (
                              <EnhancedButton size="sm" variant="outline">
                                Take Action
                              </EnhancedButton>
                            )}
                            {!notification.read && (
                              <EnhancedButton 
                                size="sm" 
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark Read
                              </EnhancedButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <EnhancedButton
                      size="sm"
                      variant="ghost"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </EnhancedButton>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            ))}
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <EnhancedCard>
            <EnhancedCardHeader>
              <EnhancedCardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </EnhancedCardTitle>
            </EnhancedCardHeader>
            <EnhancedCardContent className="space-y-6">
              {/* Delivery Methods */}
              <div>
                <h4 className="font-medium mb-3">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email</span>
                    <Switch 
                      checked={settings.emailEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push Notifications</span>
                    <Switch 
                      checked={settings.pushEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushEnabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS</span>
                    <Switch 
                      checked={settings.smsEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsEnabled: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-3">
                  {Object.entries(settings.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{category}</span>
                      <Switch 
                        checked={enabled}
                        onCheckedChange={(checked) => setSettings(prev => ({ 
                          ...prev, 
                          categories: { ...prev.categories, [category]: checked }
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Priorities */}
              <div>
                <h4 className="font-medium mb-3">Priorities</h4>
                <div className="space-y-3">
                  {Object.entries(settings.priorities).map(([priority, enabled]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{priority}</span>
                      <Switch 
                        checked={enabled}
                        onCheckedChange={(checked) => setSettings(prev => ({ 
                          ...prev, 
                          priorities: { ...prev.priorities, [priority]: checked }
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
};