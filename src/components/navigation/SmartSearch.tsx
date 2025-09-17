import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Clock, 
  TrendingUp, 
  User, 
  Package, 
  ShoppingCart,
  FileText,
  BarChart3,
  X,
  Filter,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'user' | 'product' | 'order' | 'page' | 'report' | 'general';
  url?: string;
  metadata?: Record<string, any>;
  score?: number;
}

interface SearchCategory {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  results: SearchResult[];
}

export interface SmartSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
  showRecentSearches?: boolean;
  showSuggestions?: boolean;
  showFilters?: boolean;
  maxResults?: number;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  placeholder = "البحث الذكي...",
  onSearch,
  onResultSelect,
  className,
  showRecentSearches = true,
  showSuggestions = true,
  showFilters = true,
  maxResults = 50
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Mock search function
  const mockSearch = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockData: SearchResult[] = [
      {
        id: '1',
        title: 'أحمد محمد علي',
        description: 'مستخدم نشط - آخر نشاط منذ ساعة',
        type: 'user',
        url: '/admin/users/1',
        score: 0.9
      },
      {
        id: '2',
        title: 'هاتف ذكي سامسونج',
        description: 'متوفر - 45 قطعة في المخزن',
        type: 'product',
        url: '/admin/products/2',
        score: 0.85
      },
      {
        id: '3',
        title: 'طلب #12345',
        description: 'مكتمل - بقيمة 850 ريال',
        type: 'order',
        url: '/admin/orders/12345',
        score: 0.8
      },
      {
        id: '4',
        title: 'تقرير المبيعات الشهري',
        description: 'مايو 2024 - 120 عملية بيع',
        type: 'report',
        url: '/admin/reports/monthly-sales',
        score: 0.75
      },
      {
        id: '5',
        title: 'إدارة المستخدمين',
        description: 'صفحة إدارة حسابات المستخدمين',
        type: 'page',
        url: '/admin/users',
        score: 0.7
      }
    ];

    // Filter based on query
    if (!searchQuery.trim()) return [];
    
    return mockData.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, maxResults);
  }, [maxResults]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const searchResults = onSearch ? 
        await onSearch(searchQuery) : 
        await mockSearch(searchQuery);
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
    
    setIsLoading(false);
  }, [onSearch, mockSearch]);

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    // Add to recent searches
    if (showRecentSearches) {
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
        localStorage.setItem('smartSearchRecent', JSON.stringify(updated));
        return updated;
      });
    }
    
    if (onResultSelect) {
      onResultSelect(result);
    } else if (result.url) {
      window.location.href = result.url;
    }
    
    setIsOpen(false);
    setQuery('');
  };

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches) {
      const saved = localStorage.getItem('smartSearchRecent');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, [showRecentSearches]);

  // Group results by type
  const groupedResults = results.reduce((groups, result) => {
    const typeIcons = {
      user: User,
      product: Package,
      order: ShoppingCart,
      report: FileText,
      page: BarChart3,
      general: Search
    };

    const typeLabels = {
      user: 'المستخدمون',
      product: 'المنتجات',
      order: 'الطلبات',
      report: 'التقارير',
      page: 'الصفحات',
      general: 'عام'
    };

    const category = groups.find(g => g.name === typeLabels[result.type]);
    if (category) {
      category.results.push(result);
    } else {
      groups.push({
        name: typeLabels[result.type],
        icon: typeIcons[result.type],
        results: [result]
      });
    }
    
    return groups;
  }, [] as SearchCategory[]);

  // Recent searches suggestions
  const recentSuggestions = showRecentSearches && !query && recentSearches.length > 0 && (
    <CommandGroup heading="عمليات البحث الأخيرة">
      {recentSearches.map((search, index) => (
        <CommandItem
          key={index}
          onSelect={() => {
            setQuery(search);
            performSearch(search);
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{search}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );

  const typeFilters = [
    { id: 'user', label: 'المستخدمون', icon: User },
    { id: 'product', label: 'المنتجات', icon: Package },
    { id: 'order', label: 'الطلبات', icon: ShoppingCart },
    { id: 'report', label: 'التقارير', icon: FileText }
  ];

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !query && "text-muted-foreground"
            )}
            onClick={() => setIsOpen(true)}
          >
            <Search className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {query || placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[400px] p-0 bg-card/95 backdrop-blur-md border-border/50 shadow-luxury z-[100]" 
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchRef.current?.focus();
          }}
        >
          <Command shouldFilter={false}>
            {/* Search Input */}
            <div className="flex items-center border-b border-border/50 px-3 bg-card/50">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                ref={searchRef}
                value={query}
                onValueChange={handleInputChange}
                placeholder={placeholder}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground text-card-foreground"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filters */}
            {showFilters && query && (
              <div className="flex items-center gap-2 p-3 border-b border-border/50">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1 flex-wrap">
                  {typeFilters.map((filter) => (
                    <Badge
                      key={filter.id}
                      variant={selectedFilters.includes(filter.id) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        setSelectedFilters(prev => 
                          prev.includes(filter.id)
                            ? prev.filter(f => f !== filter.id)
                            : [...prev, filter.id]
                        );
                      }}
                    >
                      <filter.icon className="h-3 w-3 mr-1" />
                      {filter.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <CommandList className="max-h-[300px]">
              {!query && recentSuggestions}
              
              {isLoading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  جاري البحث...
                </div>
              )}
              
              {!isLoading && query && results.length === 0 && (
                <CommandEmpty className="py-6 text-center text-sm">
                  لا توجد نتائج للبحث "{query}"
                </CommandEmpty>
              )}
              
              {groupedResults.map((category) => (
                <CommandGroup key={category.name} heading={category.name}>
                  {category.results
                    .filter(result => 
                      selectedFilters.length === 0 || 
                      selectedFilters.includes(result.type)
                    )
                    .map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleResultSelect(result)}
                      className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/50"
                    >
                      <category.icon className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.title}</span>
                          {result.score && result.score > 0.8 && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </div>
                        {result.description && (
                          <p className="text-xs text-muted-foreground">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <TrendingUp className="h-3 w-3 text-muted-foreground/50 mt-1" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export { SmartSearch };