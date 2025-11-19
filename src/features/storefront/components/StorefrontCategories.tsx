import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  count: number;
  emoji?: string;
  image?: string;
}

interface StorefrontCategoriesProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryName: string) => void;
  layout?: "grid" | "horizontal" | "carousel";
}

export const StorefrontCategories = ({
  categories,
  selectedCategory,
  onCategorySelect,
  layout = "grid",
}: StorefrontCategoriesProps) => {
  const handleSelect = (categoryName: string) => {
    onCategorySelect(categoryName === selectedCategory ? "all" : categoryName);
  };

  if (categories.length === 0) return null;

  // Horizontal/Carousel Layout
  if (layout === "horizontal" || layout === "carousel") {
    return (
      <div className="py-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {/* All Categories Button */}
          <button
            onClick={() => onCategorySelect("all")}
            className={cn(
              "flex-shrink-0 px-5 py-3 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-200",
              selectedCategory === "all"
                ? "border-primary bg-primary/10 text-primary shadow-md"
                : "border-border bg-background hover:border-primary/40 hover:bg-secondary"
            )}
          >
            جميع الفئات
          </button>

          {/* Category Buttons */}
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(category.name)}
              className={cn(
                "flex-shrink-0 px-5 py-3 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2",
                selectedCategory === category.name
                  ? "border-primary bg-primary/10 text-primary shadow-md"
                  : "border-border bg-background hover:border-primary/40 hover:bg-secondary"
              )}
            >
              {category.emoji && <span className="text-lg">{category.emoji}</span>}
              <span>{category.name}</span>
              <Badge
                variant={selectedCategory === category.name ? "default" : "secondary"}
                className="mr-1"
              >
                {category.count}
              </Badge>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Grid Layout (Default)
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-foreground">تصفح حسب الفئة</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* All Categories Card */}
            <motion.button
              whileHover={{ y: -4 }}
              onClick={() => onCategorySelect("all")}
              className={cn(
                "group relative aspect-square bg-surface rounded-xl overflow-hidden border transition-all duration-300",
                selectedCategory === "all"
                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-border/50 hover:border-primary/50 hover:shadow-md"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-4xl opacity-30">🛍️</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-white text-lg mb-1">جميع الفئات</h3>
                  <Badge className="bg-white/20 text-white">
                    {categories.reduce((sum, c) => sum + c.count, 0)} منتج
                  </Badge>
                </div>
              </div>
            </motion.button>

            {/* Category Cards */}
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ y: -4 }}
                onClick={() => handleSelect(category.name)}
                className={cn(
                  "group relative aspect-square bg-surface rounded-xl overflow-hidden border transition-all duration-300",
                  selectedCategory === category.name
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-border/50 hover:border-primary/50 hover:shadow-md"
                )}
              >
                {/* Background Image or Emoji */}
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <span className="text-5xl opacity-30">
                      {category.emoji || "📦"}
                    </span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-white text-base md:text-lg mb-1">
                      {category.name}
                    </h3>
                    <Badge className="bg-white/20 text-white text-xs">
                      {category.count} منتج
                    </Badge>
                  </div>
                </div>

                {/* Selected Indicator */}
                {selectedCategory === category.name && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary-foreground"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
