import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, ShoppingCart, Star, Plus, Minus, Share2, Zap, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, variants?: { [key: string]: string }) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

export const ProductModal = ({ 
  product, 
  onClose, 
  onAddToCart, 
  wishlist, 
  onToggleWishlist 
}: ProductModalProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});

  const isInWishlist = wishlist.includes(product.id);

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedVariants);
    onClose();
  };

  const handleVariantChange = (variantType: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantType]: value
    }));
  };

  // Group variants by type
  const variantGroups = product.variants?.reduce((acc, variant) => {
    if (!acc[variant.variant_type]) {
      acc[variant.variant_type] = [];
    }
    acc[variant.variant_type].push(variant);
    return acc;
  }, {} as { [key: string]: ProductVariant[] }) || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Images Section */}
          <div className="lg:w-1/2 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline">{product.category}</Badge>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Main Image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-muted/20 relative group">
              {product.image_urls?.[selectedImage] ? (
                <img
                  src={product.image_urls[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="text-6xl mb-4">📦</div>
                    <p>لا توجد صورة</p>
                  </div>
                </div>
              )}
              
              {/* Discount Badge */}
              {product.discount_percentage && product.discount_percentage > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute top-4 left-4 animate-pulse"
                >
                  -{product.discount_percentage}%
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.image_urls.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="lg:w-1/2 p-6 space-y-6 overflow-y-auto">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold leading-tight">{product.title}</h1>
              
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating!) 
                            ? 'fill-warning text-warning' 
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.reviews_count} تقييم)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {product.final_price || product.price_sar} ر.س
                  </span>
                  {product.discount_percentage && product.discount_percentage > 0 && (
                    <span className="text-lg text-muted-foreground line-through">
                      {Math.round(product.price_sar / (1 - product.discount_percentage / 100))} ر.س
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`flex items-center gap-1 ${product.stock > 5 ? 'text-success' : 'text-warning'}`}>
                    <Package className="h-4 w-4" />
                    {product.stock > 0 ? `متوفر ${product.stock} قطعة` : 'نفد المخزون'}
                  </span>
                  {product.stock < 5 && product.stock > 0 && (
                    <Badge variant="outline" className="text-warning border-warning/50">
                      <Zap className="h-3 w-3 mr-1" />
                      كمية محدودة
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold">وصف المنتج</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'لا يوجد وصف متاح لهذا المنتج.'}
              </p>
            </div>

            {/* Variants */}
            {Object.keys(variantGroups).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">خيارات المنتج</h3>
                {Object.entries(variantGroups).map(([variantType, variants]) => (
                  <div key={variantType} className="space-y-2">
                    <label className="text-sm font-medium">{variantType}</label>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <Button
                          key={variant.id}
                          variant={selectedVariants[variantType] === variant.variant_value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleVariantChange(variantType, variant.variant_value)}
                          className="text-sm"
                        >
                          {variant.variant_value}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">الكمية</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 h-12 text-lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? 'نفد المخزون' : `إضافة للسلة (${quantity})`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleWishlist(product.id)}
                  className="px-4 h-12"
                >
                  <Heart 
                    className={`h-5 w-5 ${isInWishlist ? 'fill-destructive text-destructive' : ''}`} 
                  />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  مشاركة
                </Button>
              </div>
            </div>

            {/* Features */}
            <Card className="bg-muted/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    ضمان جودة
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    شحن سريع
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    دفع آمن
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    خدمة عملاء
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};