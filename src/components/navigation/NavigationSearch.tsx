import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartNavigation } from './SmartNavigationProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Search, X, Star, Clock, TrendingUp } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

const RECENT_SEARCHES_STORAGE_KEY = 'recent-searches';

const sanitizeRecentSearches = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

const readRecentSearchesFromStorage = (): string[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return sanitizeRecentSearches(parsed).slice(0, 10);
  } catch {
    return [];
  }
};

const persistRecentSearches = (searches: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      RECENT_SEARCHES_STORAGE_KEY,
      JSON.stringify(searches)
    );
  } catch {
    // Ignore write errors (e.g., storage disabled)
  }
};

export function NavigationSearch() {
  const navigate = useNavigate();
  const device = useDeviceDetection();
  const {
    state, 
    searchNavigation, 
    addToFavorites,
    addToRecent
  } = useSmartNavigation();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSearches(readRecentSearchesFromStorage());
  }, []);

  const searchResults = searchQuery ? searchNavigation(searchQuery) : [];
  const hasResults = searchResults.length > 0;
  const recentSearchesToDisplay = recentSearches.slice(0, 5);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setRecentSearches((previous) => {
        const updated = [
          query,
          ...previous.filter((storedQuery) => storedQuery !== query)
        ].slice(0, 10);
        persistRecentSearches(updated);
        return updated;
      });
    }
  };

  const handleItemSelect = (item: any) => {
    navigate(item.href);
    addToRecent(item);
    setOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    persistRecentSearches([]);
  };

  // Mobile-optimized search
  if (device.isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Search className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-screen p-0 max-h-[80vh] overflow-hidden" 
          side="bottom"
          align="start"
        >
          <div className="flex flex-col h-full">
            {/* Search Header */}
            <div className="flex items-center gap-2 p-4 border-b">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="ابحث عن الصفحات..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-auto">
              {searchQuery ? (
                <div className="p-2">
                  {hasResults ? (
                    <div className="space-y-1">
                      {searchResults.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                            onClick={() => handleItemSelect(item)}
                          >
                            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{item.title}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToFavorites(item);
                              }}
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>لا توجد نتائج لـ "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2 space-y-4">
                  {/* Favorites */}
                  {state.favoritePages.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-2">
                        <Star className="h-3 w-3" />
                        المفضلة
                      </h3>
                      <div className="space-y-1">
                        {state.favoritePages.slice(0, 5).map((item) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                              onClick={() => handleItemSelect(item)}
                            >
                              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                              <span className="text-sm">{item.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearchesToDisplay.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          البحث الأخير
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={clearRecentSearches}
                        >
                          مسح
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {recentSearchesToDisplay.map((query: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                            onClick={() => handleSearch(query)}
                          >
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{query}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Desktop search
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Search className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              placeholder="ابحث عن الصفحات..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <CommandList className="max-h-72">
            {searchQuery ? (
              <>
                <CommandEmpty>لا توجد نتائج</CommandEmpty>
                <CommandGroup heading="نتائج البحث">
                  {searchResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <CommandItem
                        key={item.id}
                        onSelect={() => handleItemSelect(item)}
                        className="flex items-center gap-2"
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                        {item.badge && item.badge > 0 && (
                          <Badge variant="secondary" className="h-5 text-xs">
                            {item.badge > 9 ? '9+' : item.badge}
                          </Badge>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            ) : (
              <>
                {state.favoritePages.length > 0 && (
                  <CommandGroup heading="المفضلة">
                    {state.favoritePages.slice(0, 5).map((item) => {
                      const Icon = item.icon;
                      return (
                        <CommandItem
                          key={item.id}
                          onSelect={() => handleItemSelect(item)}
                        >
                          {Icon ? <Icon className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
                          <span>{item.title}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
                
                {recentSearchesToDisplay.length > 0 && (
                  <CommandGroup heading="البحث الأخير">
                    {recentSearchesToDisplay.map((query: string, index: number) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSearch(query)}
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        <span>{query}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}