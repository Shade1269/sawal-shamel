import { useState, useCallback, useEffect } from 'react';

// Advanced Notifications Hook v3.3
// خطاف الإشعارات المتقدم - النسخة الثالثة المحسّنة

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'security' | 'business' | 'user';
  channels: ('email' | 'push' | 'sms' | 'in-app')[];
  variables: Record<string, string>;
}

export interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  template_id: string;
  enabled: boolean;
  throttle_minutes: number;
  target_roles: string[];
  target_users: string[];
}

export interface NotificationHistory {
  id: string;
  template_id: string;
  recipient: string;
  channel: string;
  status: 'sent' | 'delivered' | 'failed' | 'opened';
  sent_at: Date;
  delivered_at?: Date;
  opened_at?: Date;
  error_message?: string;
}

export interface NotificationStats {
  total_sent: number;
  delivered: number;
  opened: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  by_channel: Record<string, number>;
  by_type: Record<string, number>;
}

export const useAdvancedNotifications = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Security Alert',
      title: 'Security Alert: {{threat_type}}',
      message: 'A {{threat_type}} threat has been detected from {{source_ip}}. Immediate attention required.',
      type: 'error',
      priority: 'urgent',
      category: 'security',
      channels: ['email', 'push', 'sms'],
      variables: { threat_type: 'string', source_ip: 'string' }
    },
    {
      id: '2',
      name: 'System Maintenance',
      title: 'Scheduled Maintenance: {{service_name}}',
      message: 'System maintenance for {{service_name}} is scheduled on {{date}} at {{time}}.',
      type: 'info',
      priority: 'medium',
      category: 'system',
      channels: ['email', 'in-app'],
      variables: { service_name: 'string', date: 'date', time: 'time' }
    },
    {
      id: '3',
      name: 'Sales Target Achieved',
      title: 'Congratulations! Sales Target Achieved',
      message: 'Great news! You have achieved {{percentage}}% of your monthly sales target.',
      type: 'success',
      priority: 'medium',
      category: 'business',
      channels: ['email', 'push', 'in-app'],
      variables: { percentage: 'number' }
    }
  ]);

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Critical Security Threats',
      condition: 'threat.severity === "critical"',
      template_id: '1',
      enabled: true,
      throttle_minutes: 5,
      target_roles: ['admin', 'security'],
      target_users: []
    },
    {
      id: '2',
      name: 'Maintenance Notifications',
      condition: 'system.maintenance_scheduled === true',
      template_id: '2',
      enabled: true,
      throttle_minutes: 60,
      target_roles: ['admin', 'user'],
      target_users: []
    }
  ]);

  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total_sent: 0,
    delivered: 0,
    opened: 0,
    failed: 0,
    delivery_rate: 0,
    open_rate: 0,
    by_channel: {},
    by_type: {}
  });

  // Create notification template
  const createTemplate = useCallback((template: Omit<NotificationTemplate, 'id'>) => {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: Date.now().toString()
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, []);

  // Update notification template
  const updateTemplate = useCallback((id: string, updates: Partial<NotificationTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ));
  }, []);

  // Delete notification template
  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
    // Also disable any rules using this template
    setRules(prev => prev.map(rule => 
      rule.template_id === id ? { ...rule, enabled: false } : rule
    ));
  }, []);

  // Create notification rule
  const createRule = useCallback((rule: Omit<NotificationRule, 'id'>) => {
    const newRule: NotificationRule = {
      ...rule,
      id: Date.now().toString()
    };
    setRules(prev => [...prev, newRule]);
    return newRule;
  }, []);

  // Update notification rule
  const updateRule = useCallback((id: string, updates: Partial<NotificationRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  }, []);

  // Delete notification rule
  const deleteRule = useCallback((id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  // Send notification
  const sendNotification = useCallback(async (
    templateId: string,
    variables: Record<string, any>,
    recipients: string[],
    channels?: string[]
  ) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    // Replace variables in title and message
    let title = template.title;
    let message = template.message;
    
    Object.entries(variables).forEach(([key, value]) => {
      title = title.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    const targetChannels = channels || template.channels;
    const notifications: NotificationHistory[] = [];

    for (const recipient of recipients) {
      for (const channel of targetChannels) {
        const notification: NotificationHistory = {
          id: Date.now().toString() + Math.random(),
          template_id: templateId,
          recipient,
          channel,
          status: 'sent',
          sent_at: new Date()
        };

        // Simulate sending
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Simulate delivery success/failure
          const success = Math.random() > 0.1; // 90% success rate
          
          if (success) {
            notification.status = 'delivered';
            notification.delivered_at = new Date();
            
            // Simulate opening (30% open rate)
            if (Math.random() < 0.3) {
              setTimeout(() => {
                notification.status = 'opened';
                notification.opened_at = new Date();
                setHistory(prev => prev.map(h => 
                  h.id === notification.id ? notification : h
                ));
              }, Math.random() * 10000);
            }
          } else {
            notification.status = 'failed';
            notification.error_message = 'Delivery failed';
          }
        } catch (error) {
          notification.status = 'failed';
          notification.error_message = 'Send failed';
        }

        notifications.push(notification);
      }
    }

    setHistory(prev => [...notifications, ...prev.slice(0, 999)]);
    updateStats();
    
    return notifications;
  }, [templates]);

  // Trigger notification based on conditions
  const triggerNotifications = useCallback(async (eventData: any) => {
    const activeRules = rules.filter(rule => rule.enabled);
    
    for (const rule of activeRules) {
      try {
        // Simple condition evaluation (in real app, use a proper expression parser)
        const shouldTrigger = eval(rule.condition.replace(/\./g, '?.'));
        
        if (shouldTrigger) {
          const template = templates.find(t => t.id === rule.template_id);
          if (template) {
            // Determine recipients
            const recipients = [
              ...rule.target_users,
              // In real app, resolve role-based targets
              ...(rule.target_roles.length > 0 ? ['admin@example.com'] : [])
            ];
            
            await sendNotification(rule.template_id, eventData, recipients);
          }
        }
      } catch (error) {
        console.error(`Failed to evaluate rule ${rule.name}:`, error);
      }
    }
  }, [rules, templates, sendNotification]);

  // Update statistics
  const updateStats = useCallback(() => {
    const recentHistory = history.slice(0, 100); // Last 100 notifications
    
    const total = recentHistory.length;
    const delivered = recentHistory.filter(h => h.status === 'delivered' || h.status === 'opened').length;
    const opened = recentHistory.filter(h => h.status === 'opened').length;
    const failed = recentHistory.filter(h => h.status === 'failed').length;
    
    const byChannel: Record<string, number> = {};
    const byType: Record<string, number> = {};
    
    recentHistory.forEach(h => {
      byChannel[h.channel] = (byChannel[h.channel] || 0) + 1;
      const template = templates.find(t => t.id === h.template_id);
      if (template) {
        byType[template.type] = (byType[template.type] || 0) + 1;
      }
    });
    
    setStats({
      total_sent: total,
      delivered,
      opened,
      failed,
      delivery_rate: total > 0 ? (delivered / total) * 100 : 0,
      open_rate: delivered > 0 ? (opened / delivered) * 100 : 0,
      by_channel: byChannel,
      by_type: byType
    });
  }, [history, templates]);

  // Update stats when history changes
  useEffect(() => {
    updateStats();
  }, [history, updateStats]);

  // Get template by ID
  const getTemplate = useCallback((id: string) => {
    return templates.find(t => t.id === id);
  }, [templates]);

  // Get rule by ID
  const getRule = useCallback((id: string) => {
    return rules.find(r => r.id === id);
  }, [rules]);

  // Get notification analytics
  const getAnalytics = useCallback((days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentHistory = history.filter(h => h.sent_at >= cutoff);
    
    const dailyStats = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayHistory = recentHistory.filter(h => 
        h.sent_at.toDateString() === date.toDateString()
      );
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        sent: dayHistory.length,
        delivered: dayHistory.filter(h => h.status === 'delivered' || h.status === 'opened').length,
        opened: dayHistory.filter(h => h.status === 'opened').length,
        failed: dayHistory.filter(h => h.status === 'failed').length
      });
    }
    
    return dailyStats.reverse();
  }, [history]);

  return {
    // State
    templates,
    rules,
    history,
    stats,
    
    // Template management
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    
    // Rule management
    createRule,
    updateRule,
    deleteRule,
    getRule,
    
    // Sending
    sendNotification,
    triggerNotifications,
    
    // Analytics
    getAnalytics,
    updateStats
  };
};