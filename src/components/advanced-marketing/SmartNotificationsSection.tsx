import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  Plus, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

export const SmartNotificationsSection: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNotificationData, setNewNotificationData] = useState({
    notification_type: 'email' as const,
    subject: '',
    content: '',
    recipient_email: '',
    scheduled_for: '',
  });

  // بيانات تجريبية للإشعارات
  const notifications = [
    {
      id: '1',
      notification_type: 'email' as const,
      subject: 'عرض خاص لك!',
      content: 'احصل على خصم 20% على جميع المنتجات',
      recipient_email: 'customer@example.com',
      delivery_status: 'delivered' as const,
      sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      clicked_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      notification_type: 'sms' as const,
      content: 'تذكير: سلتك في انتظارك! أكمل عملية الشراء الآن',
      recipient_phone: '+966501234567',
      delivery_status: 'sent' as const,
      sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      notification_type: 'push' as const,
      subject: 'منتج جديد متاح',
      content: 'تفقد أحدث المنتجات في متجرنا',
      delivery_status: 'pending' as const,
      scheduled_for: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      notification_type: 'whatsapp' as const,
      content: 'شكراً لشرائك من متجرنا! تم تأكيد طلبك #12345',
      recipient_phone: '+966507654321',
      delivery_status: 'delivered' as const,
      sent_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const getNotificationIcon = (type: string) => {
    const icons = {
      email: Mail,
      sms: MessageSquare,
      push: Smartphone,
      in_app: Bell,
      whatsapp: MessageSquare
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels = {
      email: 'بريد إلكتروني',
      sms: 'رسالة نصية',
      push: 'إشعار push',
      in_app: 'إشعار في التطبيق',
      whatsapp: 'واتساب'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      bounced: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      sent: Send,
      delivered: CheckCircle,
      failed: XCircle,
      bounced: AlertCircle
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'في الانتظار',
      sent: 'تم الإرسال',
      delivered: 'تم التسليم',
      failed: 'فشل',
      bounced: 'مرتد'
    };
    return labels[status as keyof typeof labels] || status;
  };

  // إحصائيات الإشعارات
  const notificationStats = {
    total: notifications.length,
    delivered: notifications.filter(n => n.delivery_status === 'delivered').length,
    opened: notifications.filter(n => n.read_at).length,
    clicked: notifications.filter(n => n.clicked_at).length,
    pending: notifications.filter(n => n.delivery_status === 'pending').length
  };

  const handleSendNotification = () => {
    // منطق إرسال الإشعار - يمكن إضافة استدعاء API هنا
    setIsDialogOpen(false);
    setNewNotificationData({
      notification_type: 'email',
      subject: '',
      content: '',
      recipient_email: '',
      scheduled_for: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">نظام الإشعارات الذكية</h2>
          <p className="text-muted-foreground">إرسال إشعارات مخصصة عبر قنوات متعددة</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إرسال إشعار جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إرسال إشعار جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notification_type">نوع الإشعار</Label>
                  <Select 
                    value={newNotificationData.notification_type} 
                    onValueChange={(value: any) => 
                      setNewNotificationData(prev => ({ ...prev, notification_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الإشعار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">بريد إلكتروني</SelectItem>
                      <SelectItem value="sms">رسالة نصية</SelectItem>
                      <SelectItem value="push">إشعار Push</SelectItem>
                      <SelectItem value="whatsapp">واتساب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">المستقبل</Label>
                  <Input
                    id="recipient"
                    value={newNotificationData.recipient_email}
                    onChange={(e) => setNewNotificationData(prev => ({ ...prev, recipient_email: e.target.value }))}
                    placeholder={
                      newNotificationData.notification_type === 'email' ? 'email@example.com' : 
                      newNotificationData.notification_type === 'sms' || newNotificationData.notification_type === 'whatsapp' ? '+966501234567' :
                      'معرف المستخدم'
                    }
                  />
                </div>
              </div>
              
              {(newNotificationData.notification_type === 'email' || newNotificationData.notification_type === 'push') && (
                <div className="space-y-2">
                  <Label htmlFor="subject">العنوان</Label>
                  <Input
                    id="subject"
                    value={newNotificationData.subject}
                    onChange={(e) => setNewNotificationData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="عنوان الإشعار"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">المحتوى *</Label>
                <Textarea
                  id="content"
                  value={newNotificationData.content}
                  onChange={(e) => setNewNotificationData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="محتوى الإشعار..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_for">موعد الإرسال (اختياري)</Label>
                <Input
                  id="scheduled_for"
                  type="datetime-local"
                  value={newNotificationData.scheduled_for}
                  onChange={(e) => setNewNotificationData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSendNotification} disabled={!newNotificationData.content}>
                {newNotificationData.scheduled_for ? 'جدولة الإرسال' : 'إرسال الآن'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{notificationStats.total}</p>
            <p className="text-sm text-muted-foreground">إجمالي الإشعارات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{notificationStats.delivered}</p>
            <p className="text-sm text-muted-foreground">تم تسليمها</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{notificationStats.opened}</p>
            <p className="text-sm text-muted-foreground">تم فتحها</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{notificationStats.clicked}</p>
            <p className="text-sm text-muted-foreground">تم النقر عليها</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{notificationStats.pending}</p>
            <p className="text-sm text-muted-foreground">في الانتظار</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            سجل الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.notification_type);
              const StatusIcon = getStatusIcon(notification.delivery_status);
              
              return (
                <div key={notification.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {getNotificationTypeLabel(notification.notification_type)}
                          </Badge>
                          <Badge className={getStatusColor(notification.delivery_status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(notification.delivery_status)}
                          </Badge>
                        </div>
                        
                        {notification.subject && (
                          <h3 className="font-semibold text-sm mb-1">{notification.subject}</h3>
                        )}
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.content}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {notification.recipient_email && (
                            <span>إلى: {notification.recipient_email}</span>
                          )}
                          {notification.recipient_phone && (
                            <span>إلى: {notification.recipient_phone}</span>
                          )}
                          {notification.sent_at && (
                            <span>أرسل: {new Date(notification.sent_at).toLocaleString('ar-SA')}</span>
                          )}
                          {notification.scheduled_for && !notification.sent_at && (
                            <span>مجدول: {new Date(notification.scheduled_for).toLocaleString('ar-SA')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      {notification.read_at && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>فُتح</span>
                        </div>
                      )}
                      {notification.clicked_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span>نُقر</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Engagement Timeline */}
                  {(notification.sent_at || notification.read_at || notification.clicked_at) && (
                    <div className="mt-3 p-2 bg-muted rounded-lg">
                      <div className="flex justify-between text-xs">
                        {notification.sent_at && (
                          <span className="text-blue-600">
                            أرسل: {new Date(notification.sent_at).toLocaleTimeString('ar-SA')}
                          </span>
                        )}
                        {notification.read_at && (
                          <span className="text-purple-600">
                            فُتح: {new Date(notification.read_at).toLocaleTimeString('ar-SA')}
                          </span>
                        )}
                        {notification.clicked_at && (
                          <span className="text-green-600">
                            نُقر: {new Date(notification.clicked_at).toLocaleTimeString('ar-SA')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {notifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد إشعارات</h3>
                <p className="text-muted-foreground mb-4">ابدأ بإرسال إشعارات ذكية لعملائك</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إرسال إشعار جديد
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};