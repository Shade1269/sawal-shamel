import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Eye, Star, Package, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabasePublic } from '@/integrations/supabase/publicClient';
import ShoppingCartDrawer from '@/components/storefront/ShoppingCartDrawer';

interface StoreData {
  id: string;
  store_name: string;
  store_slug: string;
  bio?: string;
  logo_url?: string;
  theme: string;
  profile_id: string;
}

interface ProductData {
  id: string;
  product_id: string;
  is_visible: boolean;
  sort_order: number;
  commission_rate: number;
  products: {
    id: string;
    title: string;
    description?: string;
    price_sar: number;
    image_urls?: string[];
    category?: string;
  };
}

interface CartSession {
  sessionId: string;
  storeId: string;
}

const PublicStorefront = () => {
  const { store_slug = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<number>(0);
  const [session, setSession] = useState<CartSession | null>(null);

  // إنشاء جلسة عامة للمتجر
  useEffect(() => {
    if (store?.id) {
      const existingSession = localStorage.getItem(`ea_session_${store_slug}`);
      if (existingSession) {
        setSession(JSON.parse(existingSession));
      } else {
        const newSession: CartSession = {
          sessionId: crypto.randomUUID(),
          storeId: store.id
        };
        localStorage.setItem(`ea_session_${store_slug}`, JSON.stringify(newSession));
        setSession(newSession);
      }
    }
  }, [store, store_slug]);

  // جلب بيانات المتجر والمنتجات
  useEffect(() => {
    const fetchStoreData = async () => {
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

        // جلب منتجات المتجر
        const { data: productsData, error: productsError } = await supabasePublic
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
          .eq('is_visible', true)
          .order('sort_order', { ascending: true });

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // جلب عدد عناصر السلة الحالية
        const sessionData = localStorage.getItem(`ea_session_${store_slug}`);
        if (sessionData) {
          const sessionInfo = JSON.parse(sessionData);
          const { data: cart } = await supabasePublic
            .from('shopping_carts')
            .select('id')
            .eq('session_id', sessionInfo.sessionId)
            .eq('affiliate_store_id', storeData.id)
            .maybeSingle();

          if (cart) {
            const { data: items } = await supabasePublic
              .from('cart_items')
              .select('quantity')
              .eq('cart_id', cart.id);
            
            const totalItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            setCartItems(totalItems);
          }
        }

      } catch (error: any) {
        console.error('Error fetching store data:', error);
        toast({
          title: "خطأ في جلب البيانات",
          description: error.message || "حدث خطأ في تحميل بيانات المتجر",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (store_slug) {
      fetchStoreData();
    }
  }, [store_slug, toast]);

  const addToCart = async (productData: ProductData) => {
    if (!session || !store) return;

    try {
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

      // التحقق من وجود المنتج في السلة
      const { data: existingItem } = await supabasePublic
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', productData.product_id)
        .maybeSingle();

      if (existingItem) {
        // زيادة الكمية
        const newQuantity = existingItem.quantity + 1;
        const { error: updateError } = await supabasePublic
          .from('cart_items')
          .update({
            quantity: newQuantity,
            total_price_sar: newQuantity * productData.products.price_sar
          })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // إضافة منتج جديد
        const { error: itemError } = await supabasePublic
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productData.product_id,
            quantity: 1,
            unit_price_sar: productData.products.price_sar,
            total_price_sar: productData.products.price_sar
          });

        if (itemError) throw itemError;
      }

      setCartItems(prev => prev + 1);
      toast({
        title: "تم إضافة المنتج",
        description: `تم إضافة ${productData.products.title} إلى السلة`,
      });

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
            <p>جاري تحميل المتجر...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">المتجر غير موجود</h2>
            <p className="text-muted-foreground mb-4">
              لم يتم العثور على المتجر المطلوب أو قد يكون غير نشط
            </p>
            <Button asChild>
              <Link to="/">العودة للصفحة الرئيسية</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header المتجر */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {store.logo_url && (
                <img
                  src={store.logo_url}
                  alt={store.store_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold">{store.store_name}</h1>
                {store.bio && (
                  <p className="text-sm text-muted-foreground">{store.bio}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ShoppingCartDrawer 
                storeSlug={store_slug} 
                onItemsChange={setCartItems}
              />
              
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/s/${store_slug}/my-orders`}>
                  طلباتي
                </Link>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <Link to={`/s/${store_slug}/track-order`}>
                  تتبع الطلب
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* محتوى المتجر */}
      <main className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">
                هذا المتجر لا يحتوي على منتجات متاحة حالياً
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <div 
                  className="aspect-square relative overflow-hidden rounded-t-lg"
                  onClick={() => navigate(`/s/${store_slug}/product/${item.product_id}`)}
                >
                  {item.products.image_urls && item.products.image_urls.length > 0 ? (
                    <img
                      src={item.products.image_urls[0]}
                      alt={item.products.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  
                  {item.products.category && (
                    <Badge className="absolute top-2 right-2">
                      {item.products.category}
                    </Badge>
                  )}

                  {/* زر العرض السريع */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 
                    className="font-semibold line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/s/${store_slug}/product/${item.product_id}`)}
                  >
                    {item.products.title}
                  </h3>
                  
                  {item.products.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.products.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-primary">
                        {item.products.price_sar} ر.س
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">4.5</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/s/${store_slug}/product/${item.product_id}`)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        عرض
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        إضافة
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicStorefront;