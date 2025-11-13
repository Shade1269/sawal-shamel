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
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">الملابس</h2>

          {/* Products Grid - 3 columns like reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleProducts.map((product) => (
              <ProductCardPreview
                key={product.id}
                {...product}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
