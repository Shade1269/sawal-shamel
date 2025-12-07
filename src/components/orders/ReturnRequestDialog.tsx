
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useOrderReturns } from '@/hooks/useOrderReturns';
import { Package } from 'lucide-react';

const returnSchema = z.object({
  return_reason: z.string().min(10, 'يجب أن يكون السبب 10 أحرف على الأقل'),
  refund_amount_sar: z.number().min(1, 'المبلغ يجب أن يكون أكبر من صفر'),
  notes: z.string().optional(),
});

type ReturnFormData = z.infer<typeof returnSchema>;

interface ReturnRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderAmount: number;
}

export function ReturnRequestDialog({
  open,
  onOpenChange,
  orderId,
  orderAmount,
}: ReturnRequestDialogProps) {
  const { createReturn, isCreating } = useOrderReturns();

  const form = useForm<ReturnFormData>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      return_reason: '',
      refund_amount_sar: orderAmount,
      notes: '',
    },
  });

  const onSubmit = (data: ReturnFormData) => {
    createReturn({
      order_id: orderId,
      return_reason: data.return_reason,
      returned_items: {},
      refund_amount_sar: data.refund_amount_sar,
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            طلب إرجاع
          </DialogTitle>
          <DialogDescription>
            املأ النموذج أدناه لطلب إرجاع الطلب
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Return Reason */}
            <FormField
              control={form.control}
              name="return_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الإرجاع *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="اذكر سبب الإرجاع بالتفصيل..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Refund Amount */}
            <FormField
              control={form.control}
              name="refund_amount_sar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مبلغ الاسترجاع (ر.س) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={orderAmount}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    قيمة الطلب: {orderAmount.toFixed(2)} ر.س
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أي ملاحظات إضافية..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
