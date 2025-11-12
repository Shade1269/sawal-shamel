import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, SlidersHorizontal, Package, TrendingUp, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  categories: string[];
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export const ProductFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortByChange,
  showFilters,
  onToggleFilters,
  categories,
  filteredCount,
  totalCount,
  onClearFilters
}: ProductFiltersProps) => {
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-glass backdrop-blur-sm p-8 rounded-3xl border-2 border-primary/10 shadow-2xl"
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
            <Input
              placeholder="🔍 ابحث عن المنتجات المفضلة لديك..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-14 pl-4 h-16 text-lg border-2 focus:border-primary/50 rounded-2xl bg-background/70 backdrop-blur-sm shadow-inner text-center"
            />
            {searchQuery && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSearchChange("")}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={onToggleFilters}
              className="hover:shadow-lg transition-all duration-300"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              فلاتر متقدمة
              {showFilters ? <span className="mr-2">▲</span> : <span className="mr-2">▼</span>}
            </Button>
            
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4 mr-2" />
                مسح جميع الفلاتر
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Badge variant="secondary" className="px-3 py-1.5">
              {filteredCount} منتج متاح
            </Badge>
            <span className="text-muted-foreground">
              من أصل {totalCount} منتج
            </span>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-background/60 backdrop-blur-sm rounded-2xl border border-primary/20 mt-4">
                {/* Category Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <Package className="h-4 w-4" />
                    التصنيف
                  </Label>
                  <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-full h-12 border-2 hover:border-primary/40 transition-colors">
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌟 جميع التصنيفات</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          📦 {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" />
                    ترتيب حسب
                  </Label>
                  <Select value={sortBy} onValueChange={onSortByChange}>
                    <SelectTrigger className="w-full h-12 border-2 hover:border-primary/40 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">🆕 الأحدث</SelectItem>
                      <SelectItem value="price-low">💰 السعر: من الأقل للأعلى</SelectItem>
                      <SelectItem value="price-high">💎 السعر: من الأعلى للأقل</SelectItem>
                      <SelectItem value="name">🔤 الاسم أبجدياً</SelectItem>
                      <SelectItem value="rating">⭐ الأعلى تقييماً</SelectItem>
                      <SelectItem value="discount">🔥 الأعلى خصماً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2 text-primary">
                    <Percent className="h-4 w-4" />
                    نطاق السعر: {priceRange[0]} - {priceRange[1]} ريال
                  </Label>
                  <div className="px-3 py-4">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                      max={1000}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>0 ريال</span>
                      <span>1000+ ريال</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};
