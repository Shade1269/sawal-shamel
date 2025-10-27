import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWithdrawals } from '@/hooks/useWithdrawals';
import { useWallet } from '@/hooks/useWallet';

const withdrawalSchema = z.object({
  amount_sar: z.number().min(100, 'الحد الأدنى للسحب 100 ريال'),
  payment_method: z.enum(['BANK_TRANSFER', 'WALLET', 'CASH']),
  bank_name: z.string().optional(),
  account_holder: z.string().optional(),
  iban: z.string().optional(),
  account_number: z.string().optional(),
  notes: z.string().optional(),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

interface WithdrawalRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WithdrawalRequestForm = ({ open, onOpenChange }: WithdrawalRequestFormProps) => {
  const { createWithdrawal, isCreating } = useWithdrawals();
  const { balance } = useWallet();
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'WALLET' | 'CASH'>('BANK_TRANSFER');

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      payment_method: 'BANK_TRANSFER',
      amount_sar: balance?.minimum_withdrawal_sar || 100,
    },
  });

  const onSubmit = (data: WithdrawalFormData) => {
    const bankDetails = data.payment_method === 'BANK_TRANSFER' ? {
      bank_name: data.bank_name,
      account_holder: data.account_holder,
      iban: data.iban,
      account_number: data.account_number,
    } : undefined;

    createWithdrawal({
      amount_sar: data.amount_sar,
      payment_method: data.payment_method,
      bank_details: bankDetails,
      notes: data.notes,
    }, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>طلب سحب جديد</DialogTitle>
          <DialogDescription>
            الرصيد المتاح: {balance?.available_balance_sar.toFixed(2)} ر.س
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount_sar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ (ريال سعودي)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>طريقة الدفع</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setPaymentMethod(value as any);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                      <SelectItem value="WALLET">محفظة إلكترونية</SelectItem>
                      <SelectItem value="CASH">نقداً</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentMethod === 'BANK_TRANSFER' && (
              <>
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم البنك</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_holder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم صاحب الحساب</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الآيبان (IBAN)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SA..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
