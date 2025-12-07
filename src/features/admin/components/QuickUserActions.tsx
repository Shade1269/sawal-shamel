import React, { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  Bell, 
  Activity,
  Search,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface QuickUserActionsProps {
  onBulkNotification: (message: string, targetRole?: string) => void;
  onExportUsers: () => void;
  onImportUsers: () => void;
  onQuickSearch: (term: string) => void;
  onFilterChange: (filters: any) => void;
  userStats: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: Record<string, number>;
  };
}

export const QuickUserActions: React.FC<QuickUserActionsProps> = ({
  onBulkNotification,
  onExportUsers,
  onImportUsers,
  onQuickSearch,
  onFilterChange,
  userStats
}) => {
  const [bulkMessage, setBulkMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [quickSearchTerm, setQuickSearchTerm] = useState('');

  const handleBulkNotificationSend = () => {
    if (bulkMessage.trim()) {
      onBulkNotification(bulkMessage, selectedRole === 'all' ? undefined : selectedRole);
      setBulkMessage('');
      setSelectedRole('all');
    }
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickSearch(quickSearchTerm);
  };

  const roleNames = {
    admin: 'المديرين',
    affiliate: 'المسوقين',
    customer: 'العملاء',
    moderator: 'المشرفين'
  } as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* إحصائيات سريعة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            إحصائيات المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{userStats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي المستخدمين</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-lg dark:bg-success/20">
              <div className="text-2xl font-bold text-success">{userStats.active}</div>
              <div className="text-sm text-muted-foreground">المستخدمين النشطين</div>
            </div>
          </div>
          
          <div className="text-center p-3 bg-info/10 rounded-lg dark:bg-info/20">
            <div className="text-xl font-bold text-info flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {userStats.newThisMonth}
            </div>
            <div className="text-sm text-muted-foreground">مستخدمين جدد هذا الشهر</div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">توزيع الأدوار:</Label>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(userStats.byRole).map(([role, count]) => (
                <div key={role} className="flex justify-between">
                  <span>{roleNames[role as keyof typeof roleNames] || role}:</span>
                  <Badge variant="outline" className="h-5 px-2">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* بحث وفلترة سريعة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            بحث وفلترة سريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleQuickSearchSubmit} className="space-y-3">
            <div>
              <Label htmlFor="quick-search" className="text-sm">البحث السريع</Label>
              <Input
                id="quick-search"
                placeholder="ابحث بالاسم، الإيميل، أو الهاتف..."
                value={quickSearchTerm}
                onChange={(e) => setQuickSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Button type="submit" className="w-full" variant="outline">
              <Search className="h-4 w-4 ml-2" />
              بحث
            </Button>
          </form>

          <div className="pt-2 border-t">
            <Label className="text-sm font-medium">فلاتر سريعة:</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onFilterChange({ status: 'active' })}
              >
                المستخدمين النشطين
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onFilterChange({ status: 'inactive' })}
              >
                المستخدمين المعطلين
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onFilterChange({ role: 'affiliate' })}
              >
                المسوقين فقط
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إجراءات سريعة */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* إشعار جماعي */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">إرسال إشعار جماعي:</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المجموعة المستهدفة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستخدمين</SelectItem>
                <SelectItem value="admin">المديرين</SelectItem>
                <SelectItem value="affiliate">المسوقين</SelectItem>
                <SelectItem value="customer">العملاء</SelectItem>
                <SelectItem value="moderator">المشرفين</SelectItem>
              </SelectContent>
            </Select>
            
            <Textarea
              placeholder="اكتب رسالة الإشعار..."
              value={bulkMessage}
              onChange={(e) => setBulkMessage(e.target.value)}
              className="min-h-[80px]"
            />
            
            <Button 
              onClick={handleBulkNotificationSend}
              disabled={!bulkMessage.trim()}
              className="w-full"
              size="sm"
            >
              <Bell className="h-4 w-4 ml-2" />
              إرسال الإشعار
            </Button>
          </div>

          <div className="pt-2 border-t space-y-2">
            <Button onClick={onExportUsers} variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 ml-2" />
              تصدير قائمة المستخدمين
            </Button>
            
            <Button onClick={onImportUsers} variant="outline" size="sm" className="w-full">
              <Upload className="h-4 w-4 ml-2" />
              استيراد مستخدمين
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};