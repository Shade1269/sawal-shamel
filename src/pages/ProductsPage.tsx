import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Filter,
  Heart,
  Star,
  ShoppingCart,
  Eye,
  Grid,
  List,
  TrendingUp,
  Award,
  Package
} from 'lucide-react';

const ProductsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  // Mock data - في التطبيق الحقيقي سيأتي من API
  const categories = [
    { value: 'all', label: 'جميع الفئات' },
    { value: 'dresses', label: 'فساتين' },
    { value: 'abayas', label: 'عبايات' },
    { value: 'accessories', label: 'إكسسوارات' },
    { value: 'embroidery', label: 'مطرزات' },
    { value: 'casual', label: 'كاجوال' }
  ];

  const products = [
    {
      id: 1,
      name: "فستان مطرز أزرق فاخر",
      price: 450,
      originalPrice: 520,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 156,
      sales: 320,
      commission: 68,
      merchant: "بوتيك الأناقة",
      category: "فساتين",
      isNew: true,
      isTrending: true,
      inWishlist: false
    },
    {
      id: 2,
      name: "عباءة كاجوال عملية",
      price: 280,
      originalPrice: 320,
      image: "/placeholder.svg",
      rating: 4.6,
      reviews: 89,
      sales: 150,
      commission: 42,
      merchant: "دار الأزياء",
      category: "عبايات",
      isNew: false,
      isTrending: false,
      inWishlist: true
    },
    {
      id: 3,
      name: "طقم تطريز متنوع",
      price: 120,
      originalPrice: 140,
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 234,
      sales: 480,
      commission: 18,
      merchant: "عالم التطريز",
      category: "مطرزات",
      isNew: false,
      isTrending: true,
      inWishlist: false
    },
    {
      id: 4,
      name: "شال حريري ذهبي",
      price: 95,
      originalPrice: 110,
      image: "/placeholder.svg",
      rating: 4.4,
      reviews: 67,
      sales: 89,
      commission: 14,
      merchant: "أناقة الحرير",
      category: "إكسسوارات",
      isNew: true,
      isTrending: false,
      inWishlist: false
    },
    {
      id: 5,
      name: "فستان سهرة أنيق",
      price: 680,
      originalPrice: 750,
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 134,
      sales: 67,
      commission: 102,
      merchant: "قصر الموضة",
      category: "فساتين",
      isNew: false,
      isTrending: true,
      inWishlist: true
    },
    {
      id: 6,
      name: "عباءة مطرزة فاخرة",
      price: 390,
      originalPrice: 450,
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 198,
      sales: 245,
      commission: 59,
      merchant: "تراث الأناقة",
      category: "عبايات",
      isNew: true,
      isTrending: false,
      inWishlist: false
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_low': return a.price - b.price;
      case 'price_high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'sales': return b.sales - a.sales;
      case 'commission': return b.commission - a.commission;
      default: return b.id - a.id; // latest
    }
  });

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="group border-0 bg-card/50 backdrop-blur-sm hover:shadow-luxury transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <Badge className="bg-green-500 text-white text-xs">جديد</Badge>
          )}
          {product.isTrending && (
            <Badge className="bg-orange-500 text-white text-xs flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              رائج
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
        >
          <Heart className={`h-4 w-4 ${product.inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </Button>

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button size="sm" className="bg-white text-black hover:bg-gray-100">
            <Eye className="h-4 w-4 ml-1" />
            عرض
          </Button>
          <Button size="sm" className="bg-primary text-white">
            <ShoppingCart className="h-4 w-4 ml-1" />
            شراء
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
            <CardDescription className="text-sm">
              {product.merchant}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{product.sales} مبيعة</span>
          <span className="text-green-600 font-medium">{product.commission} ريال عمولة</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">{product.price} ريال</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {product.originalPrice} ريال
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-gradient-primary hover:opacity-90" size="sm">
            شراء الآن
          </Button>
          <Button variant="outline" size="sm" className="px-3">
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            المنتجات
          </h1>
          <p className="text-muted-foreground mt-2">
            اكتشف آلاف المنتجات المميزة من أفضل التجار
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ابحث عن المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">الأحدث</SelectItem>
                  <SelectItem value="price_low">السعر: من الأقل للأعلى</SelectItem>
                  <SelectItem value="price_high">السعر: من الأعلى للأقل</SelectItem>
                  <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                  <SelectItem value="sales">الأكثر مبيعاً</SelectItem>
                  <SelectItem value="commission">أعلى عمولة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          عرض {sortedProducts.length} منتج من أصل {products.length}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{products.length} منتج</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>من أكثر من 50 تاجر</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
        : 'grid-cols-1'
      }`}>
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More */}
      {sortedProducts.length > 0 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            تحميل المزيد من المنتجات
          </Button>
        </div>
      )}

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد منتجات</h3>
          <p className="text-muted-foreground">
            لم نجد منتجات تطابق البحث الخاص بك
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;