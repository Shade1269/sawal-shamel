import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, SlidersHorizontal, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { id: 'electronics', label: 'إلكترونيات', count: 234 },
  { id: 'fashion', label: 'أزياء', count: 567 },
  { id: 'home', label: 'منزل', count: 189 },
  { id: 'beauty', label: 'تجميل', count: 345 },
  { id: 'sports', label: 'رياضة', count: 123 },
];

const brands = [
  { id: 'brand1', label: 'ماركة أ', count: 45 },
  { id: 'brand2', label: 'ماركة ب', count: 67 },
  { id: 'brand3', label: 'ماركة ج', count: 23 },
  { id: 'brand4', label: 'ماركة د', count: 89 },
];

export const FiltersPreview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedBrands.length + 
    (selectedRating ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 1000 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRating(null);
    setInStockOnly(false);
    setPriceRange([0, 1000]);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: string) => {
    setSelectedBrands(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-24 left-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 bg-gradient-luxury text-primary-foreground rounded-full shadow-2xl flex items-center justify-center"
        >
          <SlidersHorizontal className="w-6 h-6" />
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center bg-destructive animate-pulse">
              {activeFiltersCount}
            </Badge>
          )}
        </motion.button>
      </div>

      {/* Desktop Filters Sidebar */}
      <div className="hidden lg:block">
        <FiltersSidebar
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          selectedBrands={selectedBrands}
          toggleBrand={toggleBrand}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          activeFiltersCount={activeFiltersCount}
          clearAllFilters={clearAllFilters}
        />
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-full sm:w-[400px] bg-background shadow-2xl z-50 flex flex-col lg:hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
                <h2 className="text-xl font-bold">الفلاتر</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                <FiltersSidebar
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  selectedBrands={selectedBrands}
                  toggleBrand={toggleBrand}
                  selectedRating={selectedRating}
                  setSelectedRating={setSelectedRating}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  activeFiltersCount={activeFiltersCount}
                  clearAllFilters={clearAllFilters}
                />
              </div>

              <div className="p-6 border-t border-border">
                <Button
                  size="lg"
                  className="w-full bg-gradient-luxury"
                  onClick={() => setIsOpen(false)}
                >
                  عرض النتائج
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Filters Sidebar Component
const FiltersSidebar = ({
  priceRange,
  setPriceRange,
  selectedCategories,
  toggleCategory,
  selectedBrands,
  toggleBrand,
  selectedRating,
  setSelectedRating,
  inStockOnly,
  setInStockOnly,
  activeFiltersCount,
  clearAllFilters,
}: any) => {
  return (
    <div className="space-y-6 p-6">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-destructive hover:text-destructive"
          >
            مسح الكل
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{activeFiltersCount}</Badge>
            <span className="text-sm font-medium">فلاتر نشطة</span>
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-right">السعر</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{priceRange[1]} ر.س</span>
            <span>-</span>
            <span>{priceRange[0]} ر.س</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-right">التصنيفات</h3>
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">({category.count})</span>
            <Label
              htmlFor={category.id}
              className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
            >
              <span>{category.label}</span>
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
            </Label>
          </div>
        ))}
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-right">الماركات</h3>
        {brands.map((brand) => (
          <div key={brand.id} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">({brand.count})</span>
            <Label
              htmlFor={brand.id}
              className="flex items-center gap-3 cursor-pointer hover:text-primary transition-colors"
            >
              <span>{brand.label}</span>
              <Checkbox
                id={brand.id}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => toggleBrand(brand.id)}
              />
            </Label>
          </div>
        ))}
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-right">التقييم</h3>
        {[5, 4, 3].map((rating) => (
          <button
            key={rating}
            onClick={() => setSelectedRating(rating === selectedRating ? null : rating)}
            className={`w-full flex items-center justify-end gap-2 p-2 rounded-lg transition-colors ${
              selectedRating === rating ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
            }`}
          >
            <span className="text-sm">فأكثر</span>
            <div className="flex items-center gap-1">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-luxury text-luxury" />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Stock Filter */}
      <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
        <span className="text-sm font-medium">متوفر في المخزون فقط</span>
        <Checkbox
          checked={inStockOnly}
          onCheckedChange={setInStockOnly}
        />
      </div>
    </div>
  );
};
