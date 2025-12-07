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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RotateCcw, Loader2 } from 'lucide-react';

const returnInventorySchema = z.object({
  inventory_item_id: z.string().min(1, 'يجب اختيار المنتج'),
  quantity: z.number().min(1, 'الكمية يجب أن تكون أكبر من صفر'),
  return_reason: z.enum(['defective', 'expired', 'damage', 'wrong_item', 'other'], {
    required_error: 'يجب اختيار سبب الاسترجاع'
  }),
  notes: z.string().min(1, 'تفاصيل الاسترجاع مطلوبة'),
});

type ReturnInventoryForm = z.infer<typeof returnInventorySchema>;

interface InventoryItem {
  id: string;
  sku: string;
  quantity_available: number;
  warehouse_id: string;
  location?: string;
}

interface ReturnInventoryDialogProps {
  inventoryItems: InventoryItem[];
  warehouses: Array<{ id: string; name: string; code: string }>;
  onSuccess: () => void;
}

export function ReturnInventoryDialog({ inventoryItems, warehouses, onSuccess }: ReturnInventoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReturnInventoryForm>({
    resolver: zodResolver(returnInventorySchema),
    defaultValues: {
      inventory_item_id: '',
      quantity: 1,
      return_reason: 'defective' as const,
      notes: '',
    },
  });

  const selectedItem = inventoryItems.find(item => item.id === form.watch('inventory_item_id'));
  const maxQuantity = selectedItem?.quantity_available || 0;

  const onSubmit = async (values: ReturnInventoryForm) => {
    if (!selectedItem) return;

    if (values.quantity > maxQuantity) {
      toast({
        title: "خطأ في الكمية",
        description: `الكمية المتاحة هي ${maxQuantity} فقط`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // تقليل الكمية المتاحة في المخزون
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          quantity_available: maxQuantity - values.quantity,
        })
        .eq('id', values.inventory_item_id);

      if (updateError) throw updateError;

      // سيتم إضافة حركة المخزون لاحقاً عند إصلاح بنية الجدول

      toast({
        title: "تم استرجاع المنتج بنجاح",
        description: `تم استرجاع ${values.quantity} وحدة من ${selectedItem.sku}`,
      });

      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error returning inventory:', error);
      toast({
        title: "خطأ في استرجاع المنتج",
        description: error.message || "حدث خطأ أثناء استرجاع المنتج",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          استرجاع منتج
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>استرجاع منتج من المخزون</DialogTitle>
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
                      {inventoryItems
                        .filter(item => item.quantity_available > 0)
                        .map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.sku} - متاح: {item.quantity_available} - {getWarehouseName(item.warehouse_id)}
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
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><span className="font-medium">الكمية المتاحة:</span> {maxQuantity}</p>
                <p><span className="font-medium">المخزن:</span> {getWarehouseName(selectedItem.warehouse_id)}</p>
                {selectedItem.location && (
                  <p><span className="font-medium">الموقع:</span> {selectedItem.location}</p>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الكمية المرتجعة</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="الكمية"
                      max={maxQuantity}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  {maxQuantity > 0 && (
                    <p className="text-xs text-muted-foreground">
                      الحد الأقصى: {maxQuantity}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="return_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الاسترجاع</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر السبب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="defective">معيب</SelectItem>
                      <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                      <SelectItem value="damage">تالف</SelectItem>
                      <SelectItem value="wrong_item">منتج خاطئ</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تفاصيل الاسترجاع</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اكتب تفاصيل سبب الاسترجاع..."
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
                    جاري الاسترجاع...
                  </>
                ) : (
                  'استرجاع المنتج'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}