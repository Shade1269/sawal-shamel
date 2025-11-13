import { ProductCardPreview } from './ProductCardPreview';

const sampleProducts = [
  {
    id: 1,
    title: "منتج فاخر رقم 1",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviews: 156,
    badge: "جديد",
    inStock: true
  },
  {
    id: 2,
    title: "منتج مميز رقم 2",
    price: 199,
    rating: 4.5,
    reviews: 89,
    badge: "الأكثر مبيعاً",
    inStock: true
  },
  {
    id: 3,
    title: "منتج حصري رقم 3",
    price: 349,
    originalPrice: 449,
    rating: 4.9,
    reviews: 234,
    badge: "خصم 25%",
    inStock: true
  },
  {
    id: 4,
    title: "منتج عصري رقم 4",
    price: 249,
    rating: 4.6,
    reviews: 112,
    inStock: false
  },
  {
    id: 5,
    title: "منتج أنيق رقم 5",
    price: 179,
    rating: 4.7,
    reviews: 78,
    badge: "عرض محدود",
    inStock: true
  },
  {
    id: 6,
    title: "منتج راقي رقم 6",
    price: 399,
    originalPrice: 499,
    rating: 5.0,
    reviews: 345,
    badge: "الأعلى تقييماً",
    inStock: true
  }
];

export const ProductGridPreview = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-l from-primary via-luxury to-premium bg-clip-text text-transparent">
            منتجاتنا المميزة
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            مجموعة مختارة بعناية من أفضل المنتجات لتناسب ذوقك الرفيع
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.map((product, index) => (
            <ProductCardPreview
              key={product.id}
              {...product}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-luxury text-primary-foreground rounded-full font-semibold hover-scale shadow-lg">
            عرض المزيد من المنتجات
          </button>
        </div>
      </div>
    </section>
  );
};
