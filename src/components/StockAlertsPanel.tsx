import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function StockAlertsPanel() {
  const { alerts, loading } = useInventoryManagement();

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">تنبيهات المخزون</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            التنبيهات النشطة ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-sm font-medium">{alert.title || alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.alert_type}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{alert.priority}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
              <p className="text-muted-foreground">لا توجد تنبيهات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}