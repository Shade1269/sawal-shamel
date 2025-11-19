import { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  count: number;
}

interface StorefrontFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice?: number;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  onClearFilters: () => void;
  activeFiltersCount?: number;
}

export const StorefrontFilters = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice = 10000,
  sortBy,
  onSortByChange,
  onClearFilters,
  activeFiltersCount = 0,
}: StorefrontFiltersProps) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const sortOptions = [
    { value: "newest", label: "الأحدث" },
    { value: "price-low", label: "السعر: من الأقل" },
    { value: "price-high", label: "السعر: من الأعلى" },
    { value: "name", label: "الاسم (أ-ي)" },
    { value: "rating", label: "الأعلى تقييماً" },
    { value: "discount", label: "الأكثر خصماً" },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar - Always visible */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ابحث عن منتجات..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 pl-4 h-12 text-base border-border/50 focus:border-primary transition-colors"
        />
        {searchQuery && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        {/* Category Dropdown */}
        <div className="flex-1 min-w-[200px]">
          <Button
            variant="outline"
            className="w-full justify-between h-11"
            onClick={() => setShowCategories(!showCategories)}
          >
            <span className="truncate">
              {selectedCategory === "all"
                ? "جميع الفئات"
                : categories.find((c) => c.name === selectedCategory)?.name ||
                  "اختر فئة"}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showCategories ? "rotate-180" : ""
              }`}
            />
          </Button>
          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 mt-2 w-64 bg-popover border rounded-lg shadow-lg p-2 max-h-80 overflow-y-auto"
              >
                <button
                  className={`w-full text-right px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => {
                    onCategoryChange("all");
                    setShowCategories(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>جميع الفئات</span>
                    <Badge variant="secondary">
                      {categories.reduce((sum, c) => sum + c.count, 0)}
                    </Badge>
                  </div>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`w-full text-right px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category.name
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                    onClick={() => {
                      onCategoryChange(category.name);
                      setShowCategories(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Range */}
        <div className="flex-1 min-w-[250px]">
          <div className="border rounded-lg p-3 space-y-2">
            <Label className="text-sm font-medium">
              النطاق السعري: {priceRange[0]} - {priceRange[1]} ر.س
            </Label>
            <Slider
              min={0}
              max={maxPrice}
              step={50}
              value={priceRange}
              onValueChange={(value) =>
                onPriceRangeChange(value as [number, number])
              }
              className="w-full"
            />
          </div>
        </div>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[200px] h-11">
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            إزالة الفلاتر ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Mobile Filters Button */}
      <div className="md:hidden flex items-center gap-2">
        <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1 h-11 gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              الفلاتر
              {activeFiltersCount > 0 && (
                <Badge className="mr-2">{activeFiltersCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>الفلاتر</SheetTitle>
              <SheetDescription>
                اختر الفئة والسعر المناسب
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">الفئات</Label>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className="w-full justify-between"
                    onClick={() => onCategoryChange("all")}
                  >
                    <span>جميع الفئات</span>
                    <Badge variant="secondary">
                      {categories.reduce((sum, c) => sum + c.count, 0)}
                    </Badge>
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.name
                          ? "default"
                          : "outline"
                      }
                      className="w-full justify-between"
                      onClick={() => onCategoryChange(category.name)}
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  النطاق السعري: {priceRange[0]} - {priceRange[1]} ر.س
                </Label>
                <Slider
                  min={0}
                  max={maxPrice}
                  step={50}
                  value={priceRange}
                  onValueChange={(value) =>
                    onPriceRangeChange(value as [number, number])
                  }
                  className="w-full"
                />
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">ترتيب حسب</Label>
                <Select value={sortBy} onValueChange={onSortByChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر طريقة الترتيب" />
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

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onClearFilters();
                    setShowMobileFilters(false);
                  }}
                  className="w-full"
                >
                  إزالة جميع الفلاتر
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Sort */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="flex-1 h-11">
            <SelectValue placeholder="ترتيب" />
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

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {selectedCategory}
              <button
                onClick={() => onCategoryChange("all")}
                className="mr-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              {priceRange[0]} - {priceRange[1]} ر.س
              <button
                onClick={() => onPriceRangeChange([0, maxPrice])}
                className="mr-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
