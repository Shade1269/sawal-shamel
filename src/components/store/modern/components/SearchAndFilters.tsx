import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onClearFilters: () => void;
}

export const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  onClearFilters
}: SearchAndFiltersProps) => {
  const sortOptions = [
    { value: 'newest', label: 'الأحدث' },
    { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
    { value: 'price-high', label: 'السعر: من الأعلى للأقل' },
    { value: 'name', label: 'الاسم: أ-ي' },
    { value: 'rating', label: 'الأعلى تقييماً' },
    { value: 'discount', label: 'الأكثر خصماً' }
  ];

  const activeFiltersCount = [
    searchQuery && searchQuery.length > 0,
    selectedCategory !== 'all',
    priceRange[0] > 0 || priceRange[1] < 1000
  ].filter(Boolean).length;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Search Bar */}
      <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border-2 border-primary/10 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="🔍 ابحث عن المنتجات المفضلة لديك..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 pl-4 h-14 text-lg border-2 focus:border-primary/50 rounded-xl bg-background/70 backdrop-blur-sm shadow-inner"
                />
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 hover:bg-destructive/20 hover:text-destructive p-2 h-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="rounded-full"
                >
                  جميع المنتجات
                </Button>
                {categories.slice(0, 4).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
                {categories.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="rounded-full text-muted-foreground"
                  >
                    +{categories.length - 4} المزيد
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card/50 backdrop-blur-sm p-4 rounded-xl border">
        <div className="flex items-center gap-3">
          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            فلاتر متقدمة
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              مسح الفلاتر
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">ترتيب:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent className="space-y-0">
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-card/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm">الفئة</h3>
                    <div className="space-y-2">
                      <Button
                        variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                        className="w-full justify-start"
                      >
                        جميع الفئات
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="w-full justify-start"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm">نطاق السعر</h3>
                    <div className="space-y-4">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={1000}
                        min={0}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{priceRange[0]} ر.س</span>
                        <span>{priceRange[1]} ر.س</span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="الحد الأدنى"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="h-8 text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="الحد الأعلى"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm">فلاتر سريعة</h3>
                    <div className="space-y-2">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        🔥 المنتجات الأكثر مبيعاً
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        ⭐ تقييم 4+ نجوم
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        🎯 عروض خاصة
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        ⚡ توصيل سريع
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Apply Filters */}
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={onClearFilters}>
                    مسح الكل
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    تطبيق الفلاتر
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              البحث: {searchQuery}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="p-0 h-auto ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              الفئة: {selectedCategory}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="p-0 h-auto ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(priceRange[0] > 0 || priceRange[1] < 1000) && (
            <Badge variant="secondary" className="gap-1">
              السعر: {priceRange[0]}-{priceRange[1]} ر.س
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPriceRange([0, 1000])}
                className="p-0 h-auto ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </motion.section>
  );
};