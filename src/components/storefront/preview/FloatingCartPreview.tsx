import { useState } from 'react';
import { UnifiedButton, UnifiedBadge } from '@/components/design-system';
import { X, Minus, Plus, ShoppingBag, Trash2, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

export const FloatingCartPreview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 1, title: "منتج رائع رقم 1", price: 299, quantity: 2 },
    { id: 2, title: "منتج مميز رقم 2", price: 199, quantity: 1 },
    { id: 3, title: "منتج فاخر رقم 3", price: 349, quantity: 1 },
  ]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 30;
  const total = subtotal + shipping;
  const freeShippingProgress = Math.min((subtotal / 500) * 100, 100);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed left-6 bottom-6 w-16 h-16 bg-gradient-luxury text-primary-foreground rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-luxury/50 transition-shadow"
      >
        <ShoppingBag className="w-6 h-6" />
        {totalItems > 0 && (
          <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center bg-destructive animate-pulse">
            {totalItems}
          </Badge>
        )}
      </motion.button>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-full sm:w-[440px] bg-background shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border gradient-cart-header">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full hover:bg-secondary"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <h2 className="text-2xl font-bold">سلة التسوق</h2>
                </div>

                {/* Free Shipping Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success font-medium">
                      {freeShippingProgress >= 100 ? '🎉 شحن مجاني!' : `${Math.round(500 - subtotal)} ر.س للشحن المجاني`}
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(freeShippingProgress)}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      className="h-full gradient-cart-progress rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">سلة التسوق فارغة</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 gradient-cart-product rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-8 h-8 text-primary/50" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-right mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-background rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-background rounded transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">{item.price * item.quantity} ر.س</div>
                            <div className="text-xs text-muted-foreground">{item.price} ر.س × {item.quantity}</div>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="self-start p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                      </button>
                    </motion.div>
                  ))
                )}

                {/* Promo Code */}
                {cartItems.length > 0 && (
                  <div className="p-4 bg-luxury/5 border border-luxury/20 rounded-xl flex items-center gap-3">
                    <Gift className="w-5 h-5 text-luxury flex-shrink-0" />
                    <div className="flex-1 text-right">
                      <div className="font-medium text-sm">هل لديك كود خصم؟</div>
                      <div className="text-xs text-muted-foreground">استخدمه عند الدفع</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-border gradient-cart-footer space-y-4">
                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{subtotal} ر.س</span>
                      <span className="text-muted-foreground">المجموع الفرعي</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={shipping === 0 ? "text-success font-medium" : ""}>
                        {shipping === 0 ? "مجاني" : `${shipping} ر.س`}
                      </span>
                      <span className="text-muted-foreground">الشحن</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-primary">{total} ر.س</span>
                      <span>الإجمالي</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button size="lg" className="w-full text-lg bg-gradient-luxury hover-scale">
                    <ShoppingBag className="ml-2" />
                    إتمام الطلب
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    الشحن والضرائب محسوبة عند الدفع
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
