import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  title: string;
  description: string;
  price_sar: number;
  image_urls: string[];
  stock: number;
  category: string;
  variants?: ProductVariant[];
  commission_amount?: number;
  final_price?: number;
  rating?: number;
  reviews_count?: number;
  discount_percentage?: number;
}

interface ProductVariant {
  id: string;
  variant_type: string;
  variant_value: string;
  stock: number;
  price_modifier: number;
}

interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: { [key: string]: string };
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  cartTotal: number;
  shippingCost: number;
  finalTotal: number;
  onCheckout: () => void;
}

export const ShoppingCart = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  cartTotal,
  shippingCost,
  finalTotal,
  onCheckout
}: ShoppingCartProps) => {
  const isEmpty = cart.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5" />
            سلة التسوق ({cart.length})
          </SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl opacity-50">🛒</div>
              <h3 className="text-lg font-medium text-muted-foreground">السلة فارغة</h3>
              <p className="text-sm text-muted-foreground">أضف منتجات لتبدأ التسوق</p>
              <Button onClick={onClose} variant="outline">
                متابعة التسوق
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={`${item.product.id}-${JSON.stringify(item.selectedVariants)}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card rounded-lg p-4 border"
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted/20 shrink-0">
                        {item.product.image_urls?.[0] ? (
                          <img
                            src={item.product.image_urls[0]}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-2xl opacity-50">📦</div>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm leading-tight line-clamp-2">
                            {item.product.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(index)}
                            className="text-muted-foreground hover:text-destructive p-1 h-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Selected Variants */}
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(item.selectedVariants).map(([type, value]) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {value}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">
                                {item.product.final_price || item.product.price_sar} ر.س
                              </span>
                              {item.product.discount_percentage && item.product.discount_percentage > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  -{item.product.discount_percentage}%
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              المجموع: {((item.product.final_price || item.product.price_sar) * item.quantity).toFixed(2)} ر.س
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Separator />

            {/* Cart Summary */}
            <div className="space-y-4 pt-4">
              {/* Shipping Info */}
              <div className="bg-primary/5 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-primary" />
                  {shippingCost === 0 ? (
                    <span className="text-primary font-medium">
                      🎉 شحن مجاني! (طلبك فوق 200 ريال)
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      أضف {(200 - cartTotal).toFixed(2)} ر.س للحصول على شحن مجاني
                    </span>
                  )}
                </div>
              </div>

              {/* Price Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{cartTotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>الشحن:</span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingCost === 0 ? 'مجاني' : `${shippingCost} ر.س`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>الإجمالي:</span>
                  <span className="text-primary">{finalTotal.toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={onCheckout}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                إتمام الطلب ({finalTotal.toFixed(2)} ر.س)
              </Button>

              {/* Continue Shopping */}
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                متابعة التسوق
              </Button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground text-center pt-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-lg">🔒</div>
                  <span>دفع آمن</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-lg">⚡</div>
                  <span>توصيل سريع</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-lg">↩️</div>
                  <span>إرجاع مجاني</span>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};