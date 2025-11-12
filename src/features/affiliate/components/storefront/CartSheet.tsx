import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LuxuryCardV2, LuxuryCardContent } from "@/components/luxury/LuxuryCardV2";

interface CartItem {
  id: string;
  product_title: string;
  product_image_url: string;
  quantity: number;
  unit_price_sar: number;
  total_price_sar: number;
  selected_variants?: { [key: string]: string };
}

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: {
    items: CartItem[];
    total: number;
  } | null;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export const CartSheet = ({
  open,
  onOpenChange,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartSheetProps) => {
  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const cartTotal = cart?.total || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md bg-gradient-card-muted border-red-600/15">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl text-white">
            <ShoppingCart className="h-6 w-6 text-red-500" />
            سلة التسوق
            {cartItemsCount > 0 && (
              <Badge className="ml-2 bg-red-600/20 text-red-400 border-red-600/30">{cartItemsCount} منتج</Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-24 h-24 bg-gradient-card-muted rounded-full flex items-center justify-center mx-auto border-2 border-red-600/20 shadow-lg shadow-red-600/10">
                <ShoppingCart className="h-12 w-12 text-red-500/50" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-white">السلة فارغة</h3>
                <p className="text-slate-400 text-sm">
                  ابدأ بإضافة المنتجات التي تعجبك
                </p>
              </div>
              <Button 
                onClick={() => onOpenChange(false)} 
                variant="outline"
                className="border-2 border-red-600/30 text-red-400 bg-slate-900/80 hover:bg-red-950/20 hover:border-red-600/50"
              >
                متابعة التسوق
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                <AnimatePresence>
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LuxuryCardV2 
                        variant="glass" 
                        size="sm" 
                        hover="scale"
                        className="border-red-600/20 hover:border-red-600/30"
                      >
                        <LuxuryCardContent className="p-1">
                          <div className="flex items-center gap-3 p-3">
                            <div className="relative group">
                              <img 
                                src={item.product_image_url || '/placeholder.svg'} 
                                alt={item.product_title}
                                className="w-20 h-20 object-cover rounded-lg border border-red-600/20 group-hover:border-red-600/40 transition-all duration-300"
                              />
                              <div className="absolute inset-0 gradient-overlay rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            <div className="flex-1 min-w-0 space-y-2">
                              <h4 className="font-semibold text-sm line-clamp-2 text-white">{item.product_title}</h4>
                              
                              {item.selected_variants && Object.keys(item.selected_variants).length > 0 && (
                                <div className="flex flex-wrap gap-1" dir="rtl">
                                  {Object.entries(item.selected_variants).map(([type, value]) => (
                                    <Badge 
                                      key={type} 
                                      variant="outline" 
                                      className="text-xs border-red-600/30 bg-red-950/20 text-red-300"
                                    >
                                      {type === 'size' ? 'المقاس' : type === 'color' ? 'اللون' : type}: {value}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <span className="text-red-500 font-bold text-lg">
                                  {item.total_price_sar.toFixed(0)} ريال
                                </span>
                                <span className="text-xs text-slate-400">
                                  {item.unit_price_sar.toFixed(0)} × {item.quantity}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 border border-red-600/10">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  className="h-7 w-7 p-0 hover:bg-red-950/30 hover:text-red-400 transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="h-7 w-7 p-0 hover:bg-red-950/30 hover:text-red-400 transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => onRemoveItem(item.id)}
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </LuxuryCardContent>
                      </LuxuryCardV2>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="border-t border-red-600/15 pt-4 space-y-4">
                <div className="bg-gradient-card-muted rounded-xl p-4 border border-red-600/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-300">المجموع الفرعي:</span>
                    <span className="text-white font-medium">{cartTotal.toFixed(0)} ريال</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>الشحن:</span>
                    <span>يتم حسابه عند الدفع</span>
                  </div>
                  <div className="h-px bg-gradient-muted my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">المجموع:</span>
                    <span className="text-2xl font-bold bg-gradient-danger bg-clip-text text-transparent">
                      {cartTotal.toFixed(0)} ریال
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full h-14 text-lg bg-gradient-danger hover:opacity-90 shadow-elegant border border-danger/20 transition-all duration-500 group"
                  onClick={onCheckout}
                >
                  <ArrowRight className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  إتمام الطلب
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-red-600/30 text-red-400 bg-slate-900/80 backdrop-blur-sm hover:bg-red-950/20 hover:border-red-600/50 transition-all duration-300"
                  onClick={() => onOpenChange(false)}
                >
                  متابعة التسوق
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
