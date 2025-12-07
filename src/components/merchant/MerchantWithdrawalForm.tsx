import { useState } from 'react';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MerchantWithdrawalFormProps {
  availableBalance: number;
  minimumWithdrawal: number;
  onSubmit: (data: {
    amount_sar: number;
    payment_method: 'bank_transfer' | 'stc_pay' | 'wallet';
    bank_details?: any;
  }) => void;
  isSubmitting: boolean;
}

export const MerchantWithdrawalForm = ({
  availableBalance,
  minimumWithdrawal,
  onSubmit,
  isSubmitting
}: MerchantWithdrawalFormProps) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'stc_pay' | 'wallet'>('bank_transfer');
  const [bankDetails, setBankDetails] = useState({
    bank_name: '',
    account_number: '',
    iban: '',
    account_holder_name: ''
  });
  const [stcPayNumber, setStcPayNumber] = useState('');

  const canWithdraw = parseFloat(amount) >= minimumWithdrawal && parseFloat(amount) <= availableBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let details = {};
    if (paymentMethod === 'bank_transfer') {
      details = bankDetails;
    } else if (paymentMethod === 'stc_pay') {
      details = { stc_pay_number: stcPayNumber };
    }

    onSubmit({
      amount_sar: parseFloat(amount),
      payment_method: paymentMethod,
      bank_details: details
    });
  };

  return (
    <UnifiedCard>
      <UnifiedCardHeader>
        <UnifiedCardTitle>طلب سحب جديد</UnifiedCardTitle>
        <UnifiedCardDescription>
          الحد الأدنى للسحب: {minimumWithdrawal} ريال
        </UnifiedCardDescription>
      </UnifiedCardHeader>
      <UnifiedCardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ المراد سحبه (ريال)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={minimumWithdrawal}
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`مثال: ${minimumWithdrawal}`}
              required
            />
            <p className="text-sm text-muted-foreground">
              الرصيد المتاح: {availableBalance.toFixed(2)} ريال
            </p>
          </div>

          <div className="space-y-3">
            <Label>طريقة الدفع</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="bank_transfer" id="bank" />
                <Label htmlFor="bank" className="cursor-pointer">تحويل بنكي</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="stc_pay" id="stc" />
                <Label htmlFor="stc" className="cursor-pointer">STC Pay</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="cursor-pointer">محفظة إلكترونية</Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="bank_name">اسم البنك</Label>
                <Input
                  id="bank_name"
                  value={bankDetails.bank_name}
                  onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                  placeholder="مثال: الراجحي"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_holder">اسم صاحب الحساب</Label>
                <Input
                  id="account_holder"
                  value={bankDetails.account_holder_name}
                  onChange={(e) => setBankDetails({ ...bankDetails, account_holder_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">رقم الآيبان (IBAN)</Label>
                <Input
                  id="iban"
                  value={bankDetails.iban}
                  onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                  placeholder="SA0000000000000000000000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_number">رقم الحساب</Label>
                <Input
                  id="account_number"
                  value={bankDetails.account_number}
                  onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {paymentMethod === 'stc_pay' && (
            <div className="space-y-2">
              <Label htmlFor="stc_number">رقم STC Pay</Label>
              <Input
                id="stc_number"
                type="tel"
                value={stcPayNumber}
                onChange={(e) => setStcPayNumber(e.target.value)}
                placeholder="05xxxxxxxx"
                required
              />
            </div>
          )}

          {parseFloat(amount) > 0 && parseFloat(amount) < minimumWithdrawal && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                المبلغ أقل من الحد الأدنى للسحب ({minimumWithdrawal} ريال)
              </AlertDescription>
            </Alert>
          )}

          {parseFloat(amount) > availableBalance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                المبلغ أكبر من الرصيد المتاح ({availableBalance.toFixed(2)} ريال)
              </AlertDescription>
            </Alert>
          )}

          <UnifiedButton 
            type="submit"
            variant="primary"
            className="w-full" 
            disabled={!canWithdraw || isSubmitting}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال طلب السحب'}
          </UnifiedButton>
        </form>
      </UnifiedCardContent>
    </UnifiedCard>
  );
};
