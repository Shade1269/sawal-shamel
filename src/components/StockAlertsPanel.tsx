import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Package, 
  Clock, 
  TrendingUp, 
  Check,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { useInventoryManagement, type StockAlert } from '@/hooks/useInventoryManagement';

export const StockAlertsPanel: React.FC = () => {
  const { alerts, loading, resolveAlert } = useInventoryManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'OUT_OF_STOCK':
        return <Package className="h-4 w-4" />;
      case 'LOW_STOCK':
        return <TrendingUp className="h-4 w-4" />;
      case 'OVERSTOCK':
        return <Package className="h-4 w-4" />;
      case 'EXPIRING_SOON':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'OUT_OF_STOCK': return 'نفد من المخزون';
      case 'LOW_STOCK': return 'مخزون منخفض';
      case 'OVERSTOCK': return 'مخزون زائد';
      case 'EXPIRING_SOON': return 'ينتهي قريباً';
      default: return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'حرج';
      case 'HIGH': return 'عالي';
      case 'MEDIUM': return 'متوسط';
      case 'LOW': return 'منخفض';
      default: return priority;
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'default';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = !searchTerm || 
      alert.inventory_item?.product?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.inventory_item?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || alert.alert_type === filterType;
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  const alertsByPriority = {
    critical: filteredAlerts.filter(a => a.priority === 'CRITICAL'),
    high: filteredAlerts.filter(a => a.priority === 'HIGH'),
    medium: filteredAlerts.filter(a => a.priority === 'MEDIUM'),
    low: filteredAlerts.filter(a => a.priority === 'LOW')
  };

  const handleResolveAlert = async (alertId: string) => {
    await resolveAlert(alertId);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري تحميل التنبيهات...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" />
          تنبيهات المخزون
        </h1>
        <Badge variant="secondary">
          {alerts.length} تنبيه نشط
        </Badge>
      </div>

      {/* شريط البحث والفلاتر */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="البحث في التنبيهات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="نوع التنبيه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="OUT_OF_STOCK">نفد من المخزون</SelectItem>
                <SelectItem value="LOW_STOCK">مخزون منخفض</SelectItem>
                <SelectItem value="OVERSTOCK">مخزون زائد</SelectItem>
                <SelectItem value="EXPIRING_SOON">ينتهي قريباً</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="CRITICAL">حرج</SelectItem>
                <SelectItem value="HIGH">عالي</SelectItem>
                <SelectItem value="MEDIUM">متوسط</SelectItem>
                <SelectItem value="LOW">منخفض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            الكل ({filteredAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="critical" className="text-red-600">
            حرج ({alertsByPriority.critical.length})
          </TabsTrigger>
          <TabsTrigger value="high" className="text-orange-600">
            عالي ({alertsByPriority.high.length})
          </TabsTrigger>
          <TabsTrigger value="medium">
            متوسط ({alertsByPriority.medium.length})
          </TabsTrigger>
          <TabsTrigger value="low">
            منخفض ({alertsByPriority.low.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AlertsList alerts={filteredAlerts} onResolve={handleResolveAlert} />
        </TabsContent>
        
        <TabsContent value="critical">
          <AlertsList alerts={alertsByPriority.critical} onResolve={handleResolveAlert} />
        </TabsContent>
        
        <TabsContent value="high">
          <AlertsList alerts={alertsByPriority.high} onResolve={handleResolveAlert} />
        </TabsContent>
        
        <TabsContent value="medium">
          <AlertsList alerts={alertsByPriority.medium} onResolve={handleResolveAlert} />
        </TabsContent>
        
        <TabsContent value="low">
          <AlertsList alerts={alertsByPriority.low} onResolve={handleResolveAlert} />
        </TabsContent>
      </Tabs>
    </div>
  );

  function AlertsList({ alerts, onResolve }: { alerts: StockAlert[], onResolve: (id: string) => void }) {
    if (alerts.length === 0) {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد تنبيهات</h3>
            <p className="text-muted-foreground">
              لا توجد تنبيهات تطابق المعايير المحددة
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full ${
                    alert.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                    alert.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                    alert.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getAlertIcon(alert.alert_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {alert.inventory_item?.product?.title || 'منتج غير محدد'}
                      </h3>
                      <Badge variant={getPriorityVariant(alert.priority)}>
                        {getPriorityLabel(alert.priority)}
                      </Badge>
                      <Badge variant="outline">
                        {getAlertTypeLabel(alert.alert_type)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      SKU: {alert.inventory_item?.sku} | 
                      المخزن: {alert.inventory_item?.warehouse?.name}
                    </p>
                    
                    <p className="text-sm mb-3">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(alert.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResolve(alert.id)}
                  className="ml-2"
                >
                  <Check className="h-4 w-4 ml-1" />
                  حل التنبيه
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};