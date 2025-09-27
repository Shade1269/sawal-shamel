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
import { Plus, Loader2 } from 'lucide-react';

const addInventorySchema = z.object({
  warehouse_id: z.string().min(1, 'يجب اختيار المخزن'),
  sku: z.string().min(1, 'كود المنتج مطلوب'),
  quantity: z.number().min(1, 'الكمية يجب أن تكون أكبر من صفر'),
  unit_cost: z.number().min(0, 'التكلفة يجب أن تكون أكبر من أو تساوي صفر'),
  location: z.string().optional(),
  batch_number: z.string().optional(),
  expiry_date: z.string().optional(),
  reason: z.string().min(1, 'سبب الإضافة مطلوب'),
});

type AddInventoryForm = z.infer<typeof addInventorySchema>;

interface AddInventoryDialogProps {
  warehouses: Array<{ id: string; name: string; code: string }>;
  onSuccess: () => void;
}

export function AddInventoryDialog({ warehouses, onSuccess }: AddInventoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddInventoryForm>({
    resolver: zodResolver(addInventorySchema),
    defaultValues: {
      warehouse_id: '',
      sku: '',
      quantity: 1,
      unit_cost: 0,
      location: '',
      batch_number: '',
      expiry_date: '',
      reason: '',
    },
  });

  const onSubmit = async (values: AddInventoryForm) => {
    setLoading(true);
    try {
      // إضافة المنتج للمخزون
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('inventory_items')
        .insert({
          warehouse_id: values.warehouse_id,
          sku: values.sku,
          quantity_available: values.quantity,
          quantity_reserved: 0,
          quantity_on_order: 0,
          unit_cost: values.unit_cost,
          location: values.location || null,
          batch_number: values.batch_number || null,
          expiry_date: values.expiry_date || null,
        })
        .select()
        .single();

      if (inventoryError) throw inventoryError;

      // سيتم إضافة حركة المخزون لاحقاً عند إصلاح بنية الجدول

      toast({
        title: "تم إضافة المنتج بنجاح",
        description: `تم إضافة ${values.quantity} وحدة من ${values.sku} للمخزون`,
      });

      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error adding inventory:', error);
      toast({
        title: "خطأ في إضافة المنتج",
        description: error.message || "حدث خطأ أثناء إضافة المنتج للمخزون",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة منتج للمخزون
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة منتج جديد للمخزون</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="warehouse_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المخزن</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المخزن" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} ({warehouse.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كود المنتج (SKU)</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل كود المنتج" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكمية</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="الكمية"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التكلفة (ريال)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="التكلفة"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الموقع (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثل: A1-B2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الدفعة (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم الدفعة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ انتهاء الصلاحية (اختياري)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الإضافة</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="مثل: شراء جديد، تحويل من مخزن آخر، تعديل جرد..."
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
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري الإضافة...
                  </>
                ) : (
                  'إضافة للمخزون'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}