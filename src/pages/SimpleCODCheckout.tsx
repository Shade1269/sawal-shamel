import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/design-system';
import { SimpleCheckout } from '@/features/commerce/components/SimpleCheckout';
import { safeJsonParse } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const SimpleCODCheckout = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem(`cart_${slug}`);
    const parsedCart = safeJsonParse<CartItem[] | null>(savedCart, null);
    
    if (parsedCart && parsedCart.length > 0) {
      setCartItems(parsedCart);
    } else {
      navigate(`/store/${slug}`);
    }
  }, [slug, navigate]);

  const handleOrderComplete = (orderNumber: string) => {
    // Clear cart after successful order
    localStorage.removeItem(`cart_${slug}`);
    
    // سيتم التوجه تلقائياً من مكون SimpleCheckout
  };

  const handleCancel = () => {
    navigate(`/store/${slug}`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل السلة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(`/store/${slug}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للمتجر
            </Button>
            <h1 className="text-xl font-semibold">إتمام الطلب</h1>
            <div></div>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="container mx-auto px-4 py-8">
        <SimpleCheckout
          cartItems={cartItems}
          shopId={slug}
          onOrderComplete={handleOrderComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default SimpleCODCheckout;