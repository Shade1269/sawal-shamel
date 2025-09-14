import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Clock,
  TrendingUp,
  Hash,
  User,
  Package,
  MessageSquare,
  X,
  ArrowRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useFastAuth } from '@/hooks/useFastAuth';

// Simple debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SearchResult {
  id: string;
  type: 'product' | 'user' | 'message' | 'alliance' | 'order';
  title: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
  url: string;
}

interface SearchCategory {
  type: string;
  label: string;
  icon: React.ReactNode;
  count: number;
}

interface SmartSearchBarProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  allowedCategories?: string[];
  maxResults?: number;
}

const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onResultClick,
  placeholder = "ابحث في كل شيء...",
  allowedCategories = ['product', 'user', 'message', 'alliance'],
  maxResults = 20
}) => {
  const { profile, isAuthenticated } = useFastAuth();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchCategories, setSearchCategories] = useState<SearchCategory[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setSearchCategories([]);
    }
  }, [debouncedQuery]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const categoryMap = new Map<string, number>();

      // Search products if category is enabled
      if (allowedCategories.includes('product')) {
        const { data: products } = await supabase
          .from('products')
          .select('id, title, description, image_urls, price_sar')
          .ilike('title', `%${searchQuery}%`)
          .limit(maxResults / allowedCategories.length);

        if (products) {
          products.forEach(product => {
            searchResults.push({
              id: product.id,
              type: 'product',
              title: product.title,
              description: `${product.price_sar} ريال`,
              image: product.image_urls?.[0],
              url: `/product/${product.id}`
            });
          });
          categoryMap.set('product', products.length);
        }
      }

      // Search users/profiles if category is enabled
      if (allowedCategories.includes('user')) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .ilike('full_name', `%${searchQuery}%`)
          .limit(maxResults / allowedCategories.length);

        if (profiles) {
          profiles.forEach(profile => {
            searchResults.push({
              id: profile.id,
              type: 'user',
              title: profile.full_name,
              description: profile.role,
              image: profile.avatar_url,
              url: `/user/${profile.id}`
            });
          });
          categoryMap.set('user', profiles.length);
        }
      }

      // Search alliances if category is enabled
      if (allowedCategories.includes('alliance')) {
        const { data: alliances } = await supabase
          .from('alliances')
          .select('id, name, description, logo_url, member_count')
          .ilike('name', `%${searchQuery}%`)
          .limit(maxResults / allowedCategories.length);

        if (alliances) {
          alliances.forEach(alliance => {
            searchResults.push({
              id: alliance.id,
              type: 'alliance',
              title: alliance.name,
              description: `${alliance.member_count} عضو`,
              image: alliance.logo_url,
              url: `/alliance/${alliance.id}`
            });
          });
          categoryMap.set('alliance', alliances.length);
        }
      }

      // Update search categories with counts
      const categories: SearchCategory[] = [
        {
          type: 'all',
          label: 'الكل',
          icon: <Search className="w-4 h-4" />,
          count: searchResults.length
        },
        {
          type: 'product',
          label: 'المنتجات',
          icon: <Package className="w-4 h-4" />,
          count: categoryMap.get('product') || 0
        },
        {
          type: 'user',
          label: 'المستخدمون',
          icon: <User className="w-4 h-4" />,
          count: categoryMap.get('user') || 0
        },
        {
          type: 'alliance',
          label: 'التحالفات',
          icon: <Hash className="w-4 h-4" />,
          count: categoryMap.get('alliance') || 0
        }
      ];

      setResults(searchResults);
      setSearchCategories(categories);

    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, allowedCategories, maxResults]);

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    setShowResults(false);
    if (onResultClick) {
      onResultClick(result);
    } else {
      window.location.href = result.url;
    }
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    setShowResults(true);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  const filteredResults = selectedCategory === 'all' 
    ? results 
    : results.filter(result => result.type === selectedCategory);

  const getResultIcon = (type: string) => {
    const iconMap = {
      product: <Package className="w-4 h-4" />,
      user: <User className="w-4 h-4" />,
      message: <MessageSquare className="w-4 h-4" />,
      alliance: <Hash className="w-4 h-4" />,
      order: <TrendingUp className="w-4 h-4" />
    };
    return iconMap[type as keyof typeof iconMap] || <Search className="w-4 h-4" />;
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-12 h-12 text-lg"
          dir="rtl"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                setQuery('');
                setShowResults(false);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="shadow-lg border-0 bg-card/95 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Categories Filter */}
                {searchCategories.length > 0 && (
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2 flex-wrap">
                      {searchCategories.map(category => (
                        <Button
                          key={category.type}
                          variant={selectedCategory === category.type ? "default" : "outline"}
                          size="sm"
                          className="gap-2"
                          onClick={() => setSelectedCategory(category.type)}
                        >
                          {category.icon}
                          {category.label}
                          {category.count > 0 && (
                            <Badge variant="secondary" className="ml-1">
                              {category.count}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <ScrollArea className="max-h-96">
                  {/* Search Results */}
                  {query.trim().length >= 2 ? (
                    <div className="p-2">
                      {filteredResults.length > 0 ? (
                        <div className="space-y-1">
                          {filteredResults.map((result, index) => (
                            <motion.div
                              key={result.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => handleResultClick(result)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {result.image ? (
                                    <img 
                                      src={result.image} 
                                      alt={result.title}
                                      className="w-10 h-10 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                      {getResultIcon(result.type)}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium truncate">{result.title}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {result.type}
                                    </Badge>
                                  </div>
                                  {result.description && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {result.description}
                                    </p>
                                  )}
                                </div>
                                
                                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>لا توجد نتائج لـ "{query}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Recent Searches */
                    recentSearches.length > 0 && (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            عمليات البحث الأخيرة
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={clearRecentSearches}
                          >
                            مسح
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.slice(0, 5).map((searchTerm, index) => (
                            <div
                              key={index}
                              className="p-2 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => handleRecentSearchClick(searchTerm)}
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span>{searchTerm}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside handler */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default SmartSearchBar;