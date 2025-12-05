import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, Loader2, AlertTriangle } from 'lucide-react';

const cycleCountSchema = z.object({
  inventory_item_id: z.string().min(1, 'يجب اختيار المنتج'),
  physical_count: z.number().min(0, 'العدد الفعلي يجب أن يكون أكبر من أو يساوي صفر'),
  notes: z.string().optional(),
});

type CycleCountForm = z.infer<typeof cycleCountSchema>;

interface InventoryItem {
  id: string;
  sku: string;
  quantity_available: number;
  warehouse_id: string;
  location?: string;
  last_counted_at?: string;
}

interface CycleCountDialogProps {
  inventoryItems: InventoryItem[];
  warehouses: Array<{ id: string; name: string; code: string }>;
  onSuccess: () => void;
}

export function CycleCountDialog({ inventoryItems, warehouses, onSuccess }: CycleCountDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CycleCountForm>({
    resolver: zodResolver(cycleCountSchema),
    defaultValues: {
      inventory_item_id: '',
      physical_count: 0,
      notes: '',
    },
  });

  const selectedItem = inventoryItems.find(item => item.id === form.watch('inventory_item_id'));
  const physicalCount = form.watch('physical_count');
  const systemCount = selectedItem?.quantity_available || 0;
  const variance = physicalCount - systemCount;

  const onSubmit = async (values: CycleCountForm) => {
    if (!selectedItem) return;

    setLoading(true);
    try {
      // تحديث الكمية في المخزون
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          quantity_available: values.physical_count,
          last_counted_at: new Date().toISOString(),
        })
        .eq('id', values.inventory_item_id);

      if (updateError) throw updateError;

      // سيتم إضافة حركة المخزون لاحقاً عند إصلاح بنية الجدول

      toast({
        title: "تم إجراء الجرد بنجاح",
        description: variance === 0 
          ? `تم تأكيد كمية ${selectedItem.sku} بدون تعديل`
          : `تم تعديل كمية ${selectedItem.sku} بفرق ${variance > 0 ? '+' : ''}${variance}`,
      });

      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error performing cycle count:', error);
      toast({
        title: "خطأ في إجراء الجرد",
        description: error.message || "حدث خطأ أثناء إجراء الجرد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWarehouseName = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? `${warehouse.name} (${warehouse.code})` : 'غير محدد';
  };

  const getVarianceColor = (variance: number) => {
    if (variance === 0) return 'text-success';
    if (variance > 0) return 'text-info';
    return 'text-destructive';
  };

  const getVarianceBadge = (variance: number) => {
    if (variance === 0) {
      return <Badge variant="outline" className="text-success border-success">متطابق</Badge>;
    }
    if (variance > 0) {
      return <Badge variant="outline" className="text-info border-info">زيادة +{variance}</Badge>;
    }
    return <Badge variant="outline" className="text-destructive border-destructive">نقص {variance}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          جرد دوري
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إجراء جرد دوري للمخزون</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="inventory_item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المنتج</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.sku} - نظام: {item.quantity_available} - {getWarehouseName(item.warehouse_id)}
                          {item.location && ` - ${item.location}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedItem && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">العدد في النظام:</span>
                  <span className="text-lg font-bold">{systemCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">المخزن:</span>
                  <span>{getWarehouseName(selectedItem.warehouse_id)}</span>
                </div>
                {selectedItem.location && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">الموقع:</span>
                    <span>{selectedItem.location}</span>
                  </div>
                )}
                {selectedItem.last_counted_at && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">آخر جرد:</span>
                    <span className="text-sm">
                      {new Date(selectedItem.last_counted_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="physical_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العدد الفعلي (الجرد اليدوي)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="أدخل العدد الفعلي"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedItem && (
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">نتيجة المقارنة:</span>
                  {getVarianceBadge(variance)}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">النظام</p>
                    <p className="font-bold">{systemCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">الفعلي</p>
                    <p className="font-bold">{physicalCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">الفرق</p>
                    <p className={`font-bold ${getVarianceColor(variance)}`}>
                      {variance > 0 ? '+' : ''}{variance}
                    </p>
                  </div>
                </div>
                {Math.abs(variance) > systemCount * 0.1 && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-warning/10 border border-warning/30 rounded">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm text-foreground">
                      تحذير: الفرق كبير ({((Math.abs(variance) / systemCount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أي ملاحظات حول الجرد..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading || !selectedItem}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري التحديث...
                  </>
                ) : (
                  'تأكيد الجرد'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}