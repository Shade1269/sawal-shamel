import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { UnifiedButton, UnifiedCard, UnifiedCardContent, UnifiedCardHeader, UnifiedCardTitle, UnifiedBadge } from '@/components/design-system';
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useIsolatedStoreCart } from '@/hooks/useIsolatedStoreCart';
import { LuxuryCardV2, LuxuryCardContent } from '@/components/luxury/LuxuryCardV2';
import { motion, AnimatePresence } from 'framer-motion';

interface StoreContextType {
  store: {
    id: string;
    store_name: string;
    store_slug: string;
    shop_id: string;
  };
}

export const IsolatedStoreCart: React.FC = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const { store } = useOutletContext<StoreContextType>();
  const { cart, loading, updateQuantity, removeFromCart } = useIsolatedStoreCart(store?.id || '');

  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity(itemId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen gradient-dark-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
          <p className="text-slate-400">جاري تحميل السلة...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen gradient-dark-page p-6">
        <div className="flex items-center gap-4 mb-8">
          <UnifiedButton 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/${storeSlug}`)}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للمتجر
          </UnifiedButton>
        </div>

        <UnifiedCard variant="glass" hover="none" className="max-w-md mx-auto">
          <UnifiedCardContent className="text-center py-16">
            <div className="w-32 h-32 gradient-dark-card rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-600/20 shadow-lg shadow-red-600/10">
              <ShoppingCart className="h-16 w-16 text-red-500/50" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">السلة فارغة</h3>
            <p className="text-slate-400 mb-6 text-lg">
              لم تقم بإضافة أي منتجات للسلة بعد
            </p>
            <UnifiedButton 
              onClick={() => navigate(`/${storeSlug}`)}
              variant="primary"
              size="lg"
            >
              تسوق الآن
            </UnifiedButton>
          </UnifiedCardContent>
        </UnifiedCard>
      </div>
    );
  }

  const shipping = 25; // Fixed shipping cost
  const total = cart.total + shipping;

  return (
    <div className="space-y-6 min-h-screen gradient-dark-page p-4 md:p-6">
      <div className="flex items-center gap-4">
        <UnifiedButton 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(`/${storeSlug}`)}
          className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للمتجر
        </UnifiedButton>
        <h1 className="text-3xl font-bold bg-gradient-danger bg-clip-text text-transparent">
          سلة التسوق
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <LuxuryCardV2 variant="glass" hover="lift" className="border-red-600/20">
                  <LuxuryCardContent className="p-6">
                    <div className="flex gap-6">
                      {item.product_image_url && (
                        <div className="relative group w-24 h-24 flex-shrink-0">
                          <img
                            src={item.product_image_url}
                            alt={item.product_title}
                            className="w-full h-full object-cover rounded-xl border-2 border-red-600/20 group-hover:border-red-600/40 transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-3">
                        <h3 className="font-bold text-lg text-white">{item.product_title}</h3>
                        
                        {item.selected_variants && Object.keys(item.selected_variants).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.selected_variants).map(([type, value]) => (
                              <UnifiedBadge 
                                key={type} 
                                variant="outline" 
                                className="border-red-600/30 bg-red-950/20 text-red-300"
                              >
                                {type === 'size' ? 'المقاس' : type === 'color' ? 'اللون' : type}: {value}
                              </UnifiedBadge>
                            ))}
                          </div>
                        )}
                        
                        <p className="text-sm text-slate-400">
                          {item.unit_price_sar.toFixed(0)} ر.س للقطعة
                        </p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 border border-red-600/10">
                            <UnifiedButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingItems.has(item.id)}
                              className="h-9 w-9 p-0 hover:bg-red-950/30 hover:text-red-400"
                            >
                              <Minus className="h-4 w-4" />
                            </UnifiedButton>
                            
                            <UnifiedBadge
                              variant="secondary"
                              className="min-w-[3rem] justify-center gradient-cart-quantity text-white border border-red-600/20 text-base font-bold"
                            >
                              {item.quantity}
                            </UnifiedBadge>
                            
                            <UnifiedButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItems.has(item.id)}
                              className="h-9 w-9 p-0 hover:bg-red-950/30 hover:text-red-400"
                            >
                              <Plus className="h-4 w-4" />
                            </UnifiedButton>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold text-2xl bg-gradient-danger bg-clip-text text-transparent">
                              {item.total_price_sar.toFixed(0)} ر.س
                            </span>
                            
                            <UnifiedButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={updatingItems.has(item.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-9 w-9 p-0"
                            >
                              <Trash2 className="h-5 w-5" />
                            </UnifiedButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </LuxuryCardContent>
                </LuxuryCardV2>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <UnifiedCard 
            variant="luxury" 
            hover="lift" 
            className="sticky top-4"
          >
            <UnifiedCardHeader className="border-b border-red-600/15">
              <UnifiedCardTitle className="text-2xl bg-gradient-danger bg-clip-text text-transparent">
                ملخص الطلب
              </UnifiedCardTitle>
            </UnifiedCardHeader>
            <UnifiedCardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-base text-slate-300">
                  <span>المجموع الفرعي</span>
                  <span className="font-semibold text-white">{cart.total.toFixed(0)} ر.س</span>
                </div>
                <div className="flex justify-between text-base text-slate-300">
                  <span>الشحن</span>
                  <span className="font-semibold text-white">{shipping} ر.س</span>
                </div>
                <div className="h-px gradient-cart-divider" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-xl font-bold text-white">المجموع الكلي</span>
                  <span className="text-3xl font-bold bg-gradient-danger bg-clip-text text-transparent">
                    {total.toFixed(0)} ر.س
                  </span>
                </div>
              </div>

              <UnifiedButton 
                fullWidth
                size="lg"
                variant="primary"
                onClick={() => navigate(`/${storeSlug}/checkout`)}
                className="h-14 text-lg group"
              >
                إتمام الطلب
                <ArrowRight className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
              </UnifiedButton>

              <div className="gradient-dark-section rounded-lg p-3 border border-red-600/10">
                <p className="text-xs text-slate-400 text-center">
                  الدفع عند الاستلام متاح
                </p>
              </div>
            </UnifiedCardContent>
          </UnifiedCard>
        </div>
      </div>
    </div>
  );
};
