import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryManagement } from '@/hooks/useInventoryManagement';
import { BarChart, FileText } from 'lucide-react';

export function InventoryReports() {
  const { inventoryItems, loading } = useInventoryManagement();

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">تقارير المخزون</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تقرير المخزون
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3">SKU</th>
                    <th className="text-right p-3">الكمية المتاحة</th>
                    <th className="text-right p-3">الموقع</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{item.sku}</td>
                      <td className="p-3">{item.quantity_available || 0}</td>
                      <td className="p-3">{item.location || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">لا توجد بيانات للعرض</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}