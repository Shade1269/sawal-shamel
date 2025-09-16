import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Plus, Minus, ArrowLeft, Star, Heart, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabasePublic } from '@/integrations/supabase/publicClient';

interface ProductVariant {
  type: string;
  name: string;
  value: string;
  price_adjustment: number;
  stock: number;
}

interface ProductData {
  id: string;
  product_id: string; // إضافة معرف المنتج
  products: {
    id: string;
    title: string;
    description?: string;
    price_sar: number;
    image_urls?: string[];
    category?: string;
  };
  commission_rate: number;
  variants?: ProductVariant[];
}

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  bio?: string;
  logo_url?: string;
}

const ProductDetailPage = () => {
  const { store_slug, product_id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // جلب بيانات المتجر
        const { data: storeData, error: storeError } = await supabasePublic
          .from('affiliate_stores')
          .select('*')
          .eq('store_slug', store_slug)
          .eq('is_active', true)
          .maybeSingle();

        if (storeError) throw storeError;
        if (!storeData) {
          toast({
            title: "المتجر غير موجود",
            description: "لم يتم العثور على المتجر المطلوب",
            variant: "destructive"
          });
          return;
        }

        setStore(storeData);

        // جلب تفاصيل المنتج
        const { data: productData, error: productError } = await supabasePublic
          .from('affiliate_products')
          .select(`
            *,
            products (
              id,
              title,
              description,
              price_sar,
              image_urls,
              category
            )
          `)
          .eq('affiliate_store_id', storeData.id)
          .eq('product_id', product_id)
          .eq('is_visible', true)
          .maybeSingle();

        if (productError) throw productError;
        if (!productData) {
          toast({
            title: "المنتج غير موجود",
            description: "لم يتم العثور على المنتج المطلوب",
            variant: "destructive"
          });
          return;
        }

        // إضافة متغيرات وهمية للعرض (سيتم تطويرها لاحقاً)
        const mockVariants: ProductVariant[] = [
          { type: 'color', name: 'اللون', value: 'أحمر', price_adjustment: 0, stock: 5 },
          { type: 'color', name: 'اللون', value: 'أزرق', price_adjustment: 10, stock: 3 },
          { type: 'size', name: 'الحجم', value: 'متوسط', price_adjustment: 0, stock: 8 },
          { type: 'size', name: 'الحجم', value: 'كبير', price_adjustment: 20, stock: 2 },
        ];

        setProduct({ ...productData, variants: mockVariants });

      } catch (error: any) {
        console.error('Error fetching product:', error);
        toast({
          title: "خطأ في جلب البيانات",
          description: error.message || "حدث خطأ في تحميل المنتج",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (store_slug && product_id) {
      fetchData();
    }
  }, [store_slug, product_id, toast]);

  const getVariantsByType = (type: string) => {
    return product?.variants?.filter(v => v.type === type) || [];
  };

  const getSelectedVariantPrice = () => {
    if (!product?.variants) return 0;
    
    return Object.values(selectedVariants).reduce((total, variantValue) => {
      const variant = product.variants?.find(v => v.value === variantValue);
      return total + (variant?.price_adjustment || 0);
    }, 0);
  };

  const getFinalPrice = () => {
    const basePrice = product?.products.price_sar || 0;
    const variantPrice = getSelectedVariantPrice();
    return basePrice + variantPrice;
  };

  const addToCart = async () => {
    if (!product || !store) return;

    try {
      const sessionData = localStorage.getItem(`ea_session_${store_slug}`);
      if (!sessionData) {
        toast({
          title: "خطأ في الجلسة",
          description: "يرجى إعادة تحميل الصفحة",
          variant: "destructive"
        });
        return;
      }

      const session = JSON.parse(sessionData);

      // البحث عن السلة الحالية أو إنشاء واحدة جديدة
      let { data: cart } = await supabasePublic
        .from('shopping_carts')
        .select('id')
        .eq('session_id', session.sessionId)
        .eq('affiliate_store_id', store.id)
        .maybeSingle();

      if (!cart) {
        const { data: newCart, error: cartError } = await supabasePublic
          .from('shopping_carts')
          .insert({
            session_id: session.sessionId,
            affiliate_store_id: store.id,
            user_id: null
          })
          .select('id')
          .single();

        if (cartError) throw cartError;
        cart = newCart;
      }

      // إضافة المنتج مع المتغيرات المختارة
      const { error: itemError } = await supabasePublic
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: product.product_id,
          quantity: quantity,
          unit_price_sar: getFinalPrice(),
          total_price_sar: getFinalPrice() * quantity
        });

      if (itemError) throw itemError;

      toast({
        title: "تم إضافة المنتج",
        description: `تم إضافة ${product.products.title} إلى السلة`,
      });

      // العودة للمتجر
      navigate(`/s/${store_slug}`);

    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "خطأ في الإضافة",
        description: "تعذر إضافة المنتج إلى السلة",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>جاري تحميل المنتج...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">المنتج غير موجود</h2>
            <p className="text-muted-foreground mb-4">
              لم يتم العثور على المنتج المطلوب
            </p>
            <Button onClick={() => navigate(`/s/${store_slug}`)}>
              العودة للمتجر
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = product.products.image_urls || [];
  const currentImage = images[currentImageIndex] || '/placeholder.svg';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/s/${store_slug}`)}
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للمتجر
            </Button>
            
            <div className="flex items-center gap-2">
              {store.logo_url && (
                <img
                  src={store.logo_url}
                  alt={store.store_name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <span className="font-semibold">{store.store_name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* محتوى المنتج */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* صور المنتج */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={currentImage}
                alt={product.products.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.products.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل المنتج */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.products.title}</h1>
              
              {product.products.category && (
                <Badge variant="secondary" className="mb-4">
                  {product.products.category}
                </Badge>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold text-primary">
                  {getFinalPrice()} ر.س
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">4.5 (120 تقييم)</span>
                </div>
              </div>

              {product.products.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.products.description}
                </p>
              )}
            </div>

            <Separator />

            {/* المتغيرات */}
            <div className="space-y-4">
              {['color', 'size'].map(type => {
                const variants = getVariantsByType(type);
                if (variants.length === 0) return null;

                const typeName = type === 'color' ? 'اللون' : 'الحجم';

                return (
                  <div key={type}>
                    <label className="text-sm font-medium mb-2 block">
                      {typeName}
                    </label>
                    <Select
                      value={selectedVariants[type] || ''}
                      onValueChange={(value) => setSelectedVariants(prev => ({
                        ...prev,
                        [type]: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`اختر ${typeName}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((variant) => (
                          <SelectItem key={variant.value} value={variant.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{variant.value}</span>
                              {variant.price_adjustment > 0 && (
                                <span className="text-xs text-muted-foreground mr-2">
                                  +{variant.price_adjustment} ر.س
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* الكمية والإضافة للسلة */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">الكمية</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={addToCart}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 ml-2" />
                  إضافة للسلة • {(getFinalPrice() * quantity).toFixed(2)} ر.س
                </Button>
                
                <Button variant="outline" size="lg">
                  <Heart className="h-5 w-5" />
                </Button>
                
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;