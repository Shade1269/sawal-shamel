import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '../hooks/useProductsData';

interface PricingDialogProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: (productId: string, customPrice: number) => void;
}

/**
 * Dialog لتحديد سعر البيع قبل إضافة المنتج للمتجر
 * يسمح للمسوق بتحديد سعر مخصص أعلى من سعر التاجر
 */
export function PricingDialog({ product, onClose, onConfirm }: PricingDialogProps) {
  const { toast } = useToast();
  const [customPrice, setCustomPrice] = useState('');

  useEffect(() => {
    if (product) {
      setCustomPrice(product.price_sar.toString());
    }
  }, [product]);

  const handleConfirm = () => {
    if (!product) return;

    const price = parseFloat(customPrice);
    if (price >= product.price_sar) {
      onConfirm(product.id, price);
      onClose();
      setCustomPrice('');
    } else {
      toast({
        title: 'خطأ',
        description: 'سعر البيع يجب أن يكون أكبر من أو يساوي سعر التاجر',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تحديد سعر البيع</DialogTitle>
          <DialogDescription>حدد السعر الذي ترغب في بيع المنتج به في متجرك</DialogDescription>
        </DialogHeader>
        {product && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{product.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">سعر التاجر:</span>
                  <p className="font-bold text-lg">{product.price_sar} ر.س</p>
                </div>
                <div>
                  <span className="text-muted-foreground">عمولة افتراضية:</span>
                  <p className="font-bold text-lg">
                    {product.merchants?.default_commission_rate ?? 0}%
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="custom-price">سعر البيع في متجرك (ر.س)</Label>
              <Input
                id="custom-price"
                type="number"
                step="0.01"
                min={product.price_sar}
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder={product.price_sar.toString()}
              />
              <p className="text-xs text-muted-foreground mt-1">
                الحد الأدنى: {product.price_sar} ر.س (سعر التاجر)
              </p>
            </div>

            {customPrice && parseFloat(customPrice) >= product.price_sar && (
              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <p className="text-sm text-green-600">
                  <strong>ربحك المتوقع:</strong>{' '}
                  {(parseFloat(customPrice) - product.price_sar).toFixed(2)} ر.س
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleConfirm}
              disabled={!customPrice || parseFloat(customPrice) < product.price_sar}
            >
              إضافة للمتجر
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
