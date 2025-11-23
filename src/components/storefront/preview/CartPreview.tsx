import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { UnifiedButton } from '@/components/design-system';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export const CartPreview = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: 'فستان أنيق وردي',
      price: 299,
      quantity: 1,
      size: 'M',
      color: 'وردي',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'حقيبة جلدية فاخرة',
      price: 499,
      quantity: 1,
      size: '-',
      color: 'بني',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop'
    }
  ]);

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

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 50;
  const total = subtotal + shipping;

  return (
    <section className="py-16 bg-background min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-blue-100 px-6 py-3 rounded-full mb-4">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">سلة التسوق</h1>
            </div>
            <p className="text-foreground/70">
              لديك {cartItems.length} {cartItems.length === 1 ? 'منتج' : 'منتجات'} في السلة
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-12 text-center shadow-lg"
                >
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">السلة فارغة</h3>
                  <p className="text-gray-600 mb-6">لم تضف أي منتجات بعد</p>
                  <UnifiedButton className="bg-blue-600 hover:bg-blue-700 text-white">
                    تسوق الآن
                  </UnifiedButton>
                </motion.div>
              ) : (
                cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-32 h-32 object-cover rounded-xl"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 text-right">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <p className="text-gray-600">
                            <span className="font-semibold">المقاس:</span> {item.size}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">اللون:</span> {item.color}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {item.price} ر.س
                        </p>
                      </div>

                      {/* Quantity & Remove */}
                      <div className="flex flex-col items-center justify-between">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>

                        <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-white rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-white rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-right">
                  ملخص الطلب
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-right">
                    <span className="text-gray-600">المجموع الفرعي</span>
                    <span className="font-semibold text-gray-900">{subtotal} ر.س</span>
                  </div>
                  <div className="flex justify-between text-right">
                    <span className="text-gray-600">الشحن</span>
                    <span className="font-semibold text-gray-900">{shipping} ر.س</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-right">
                      <span className="text-lg font-bold text-gray-900">المجموع</span>
                      <span className="text-2xl font-bold text-blue-600">{total} ر.س</span>
                    </div>
                  </div>
                </div>

                <UnifiedButton
                  disabled={cartItems.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg mb-3"
                >
                  إتمام الطلب
                  <ArrowRight className="w-5 h-5 mr-2" />
                </UnifiedButton>

                <UnifiedButton
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-bold py-6"
                >
                  متابعة التسوق
                </UnifiedButton>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
