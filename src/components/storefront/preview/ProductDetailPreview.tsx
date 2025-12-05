import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Star, Truck, ShieldCheck } from 'lucide-react';
import { UnifiedButton } from '@/components/design-system';
import { cn } from '@/lib/utils';

const sizes = [
  { value: 'S', label: 'S', available: true },
  { value: 'M', label: 'M', available: true },
  { value: 'L', label: 'L', available: true },
  { value: 'XL', label: 'XL', available: false }
];

const colors = [
  { value: 'pink', label: 'وردي', hex: '#F5A5B8', available: true },
  { value: 'beige', label: 'بيج', hex: '#F5F1EB', available: true },
  { value: 'blue', label: 'أزرق', hex: '#87CEEB', available: true },
  { value: 'black', label: 'أسود', hex: '#2D2D2D', available: false }
];

export const ProductDetailPreview = () => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('pink');
  const [selectedImage, setSelectedImage] = useState(0);

  const productImages = [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1000&fit=crop'
  ];

  return (
    <section className="py-16 bg-background min-h-screen">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[3/4] bg-card rounded-2xl overflow-hidden shadow-lg"
              >
                <img
                  src={productImages[selectedImage]}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-4 left-4 p-3 bg-card rounded-full shadow-lg hover:bg-muted transition-colors">
                  <Heart className="w-6 h-6 text-muted-foreground" />
                </button>
                <button className="absolute top-4 left-20 p-3 bg-card rounded-full shadow-lg hover:bg-muted transition-colors">
                  <Share2 className="w-6 h-6 text-muted-foreground" />
                </button>
              </motion.div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "aspect-square bg-card rounded-lg overflow-hidden border-2 transition-all",
                        selectedImage === idx
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6 text-right">
              {/* Title & Rating */}
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  فستان صيفي أنيق وردي
                </h1>
                <div className="flex items-center gap-4 justify-end mb-4">
                  <span className="text-muted-foreground">(156 تقييم)</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-foreground">4.8</span>
                </div>
                <p className="text-3xl font-bold text-primary mb-6">299 ر.س</p>
              </div>

              {/* Description */}
              <div className="bg-muted p-6 rounded-xl">
                <h3 className="font-bold text-foreground mb-3 text-lg">الوصف</h3>
                <p className="text-muted-foreground leading-relaxed">
                  فستان صيفي أنيق مصنوع من أجود أنواع الأقمشة الطبيعية. مناسب للمناسبات الخاصة والأيام العادية. تصميم عصري يناسب جميع الأذواق مع خامة مريحة وجودة عالية.
                </p>
              </div>

              {/* Size Selector */}
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-foreground mb-4 text-lg">المقاس</h3>
                <div className="flex gap-3 flex-wrap justify-end">
                  {sizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => size.available && setSelectedSize(size.value)}
                      disabled={!size.available}
                      className={cn(
                        "w-16 h-16 rounded-lg border-2 font-bold text-lg transition-all",
                        selectedSize === size.value
                          ? "border-primary bg-primary text-primary-foreground shadow-lg"
                          : "border-border bg-card text-foreground hover:border-primary/50",
                        !size.available && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selector */}
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-foreground mb-4 text-lg">اللون</h3>
                <div className="flex gap-3 flex-wrap justify-end">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => color.available && setSelectedColor(color.value)}
                      disabled={!color.available}
                      className={cn(
                        "relative w-14 h-14 rounded-full border-2 transition-all",
                        selectedColor === color.value
                          ? "border-primary ring-4 ring-primary/30"
                          : "border-border hover:border-primary/50",
                        !color.available && "opacity-30 cursor-not-allowed"
                      )}
                      style={{ backgroundColor: color.hex }}
                    >
                      {!color.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[2px] h-full bg-foreground rotate-45" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-success/10 p-4 rounded-xl text-center">
                  <Truck className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="font-semibold text-foreground">شحن مجاني</p>
                  <p className="text-sm text-muted-foreground">للطلبات فوق 200 ر.س</p>
                </div>
                <div className="bg-info/10 p-4 rounded-xl text-center">
                  <ShieldCheck className="w-8 h-8 text-info mx-auto mb-2" />
                  <p className="font-semibold text-foreground">ضمان الجودة</p>
                  <p className="text-sm text-muted-foreground">استرجاع خلال 14 يوم</p>
                </div>
              </div>

              {/* Add to Cart */}
              <UnifiedButton className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-7 text-lg shadow-lg">
                <ShoppingCart className="w-6 h-6 ml-2" />
                أضف إلى السلة
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
