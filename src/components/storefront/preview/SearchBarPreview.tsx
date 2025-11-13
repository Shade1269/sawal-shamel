import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const trendingSearches = [
  "إلكترونيات",
  "أزياء نسائية",
  "أدوات منزلية",
  "مستحضرات تجميل",
  "إكسسوارات"
];

const recentSearches = [
  "هواتف ذكية",
  "أحذية رياضية",
  "حقائب",
];

export const SearchBarPreview = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const suggestions = query.length > 0 
    ? [
        `${query} - منتجات فاخرة`,
        `${query} - أفضل الأسعار`,
        `${query} - عروض حصرية`,
      ]
    : [];

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="ابحثي عن منتجاتك المفضلة..."
          className="h-14 pr-12 pl-12 text-lg rounded-2xl border-2 focus-visible:border-primary transition-all"
          dir="rtl"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={clearSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4 border-b border-border">
                <h4 className="text-sm font-semibold mb-3 text-right text-muted-foreground">
                  النتائج المقترحة
                </h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="w-full text-right px-4 py-3 hover:bg-secondary rounded-lg transition-colors flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-4 border-b border-border">
                <h4 className="text-sm font-semibold mb-3 text-right text-muted-foreground flex items-center justify-end gap-2">
                  <span>عمليات البحث الأخيرة</span>
                  <Clock className="w-4 h-4" />
                </h4>
                <div className="space-y-1">
                  {recentSearches.map((search, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="w-full text-right px-4 py-3 hover:bg-secondary rounded-lg transition-colors flex items-center gap-3 justify-end"
                    >
                      <span>{search}</span>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {query.length === 0 && (
              <div className="p-4">
                <h4 className="text-sm font-semibold mb-3 text-right text-muted-foreground flex items-center justify-end gap-2">
                  <span>الأكثر بحثاً</span>
                  <TrendingUp className="w-4 h-4" />
                </h4>
                <div className="flex flex-wrap gap-2 justify-end">
                  {trendingSearches.map((trend, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge variant="secondary" className="hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                        {trend}
                      </Badge>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
