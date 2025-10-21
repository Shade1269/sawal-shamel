import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronUp, RotateCcw } from 'lucide-react';

interface VirtualItem {
  id: string | number;
  height?: number;
  data?: any;
}

interface VirtualizedListProps<T extends VirtualItem> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number | ((item: T, index: number) => number);
  containerHeight: number;
  className?: string;
  gap?: number;
  overscan?: number;
  loading?: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  showScrollToTop?: boolean;
  estimatedItemHeight?: number;
}

const VirtualizedList = <T extends VirtualItem>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className,
  gap = 0,
  overscan = 5,
  loading = false,
  onLoadMore,
  hasNextPage = false,
  searchable = false,
  onSearch,
  searchQuery = '',
  emptyMessage = 'لا توجد عناصر للعرض',
  loadingMessage = 'جاري التحميل...',
  showScrollToTop = true,
  estimatedItemHeight = 60
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState(searchQuery);

  // Calculate item heights and positions
  const itemData = useMemo(() => {
    let currentOffset = 0;
    const positions: Array<{ offset: number; height: number }> = [];

    items.forEach((item, index) => {
      const height = typeof itemHeight === 'function' 
        ? itemHeight(item, index) 
        : itemHeight;
      
      positions.push({
        offset: currentOffset,
        height: height + gap
      });
      
      currentOffset += height + gap;
    });

    return {
      positions,
      totalHeight: Math.max(currentOffset - gap, 0)
    };
  }, [items, itemHeight, gap]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!containerRef || items.length === 0) {
      return { start: 0, end: 0 };
    }

    let start = 0;
    let end = items.length - 1;

    // Find first visible item
    for (let i = 0; i < itemData.positions.length; i++) {
      const { offset, height } = itemData.positions[i];
      if (offset + height >= scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
    }

    // Find last visible item
    for (let i = start; i < itemData.positions.length; i++) {
      const { offset } = itemData.positions[i];
      if (offset >= scrollTop + containerHeight) {
        end = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { start, end };
  }, [scrollTop, containerHeight, itemData.positions, items.length, overscan, containerRef]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setShowScrollToTopButton(newScrollTop > 200);
    
    // Load more when near bottom
    if (
      onLoadMore && 
      hasNextPage && 
      !loading &&
      newScrollTop + containerHeight >= itemData.totalHeight - 100
    ) {
      onLoadMore();
    }
  }, [onLoadMore, hasNextPage, loading, containerHeight, itemData.totalHeight]);

  // Scroll to top
  const scrollToTop = () => {
    containerRef?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  // Render visible items
  const renderVisibleItems = () => {
    const visibleItems = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      const item = items[i];
      const position = itemData.positions[i];
      
      if (item && position) {
        visibleItems.push(
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: position.offset,
              left: 0,
              right: 0,
              height: position.height - gap
            }}
          >
            {renderItem(item, i)}
          </div>
        );
      }
    }
    
    return visibleItems;
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => {
    const skeletonCount = Math.ceil(containerHeight / estimatedItemHeight);
    return Array.from({ length: skeletonCount }, (_, index) => (
      <div key={`skeleton-${index}`} className="p-4">
        <Skeleton className="h-16 w-full" />
      </div>
    ));
  };

  if (loading && items.length === 0) {
    return (
      <div className={cn("space-y-4", className)} style={{ height: containerHeight }}>
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="البحث..."
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10"
              disabled
            />
          </div>
        )}
        <div className="text-center p-8 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          {loadingMessage}
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className={cn("space-y-4", className)} style={{ height: containerHeight }}>
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="البحث..."
              value={searchValue}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        )}
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">{emptyMessage}</p>
            {searchQuery && (
              <div className="flex items-center gap-2 justify-center">
                <p className="text-sm">لا توجد نتائج للبحث عن "{searchQuery}"</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchValue('');
                    onSearch?.('');
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  إعادة تعيين
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative space-y-4", className)}>
      {/* Search Bar */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10"
          />
          {searchQuery && (
            <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2">
              {items.length} نتيجة
            </Badge>
          )}
        </div>
      )}

      {/* Virtualized Container */}
      <div
        ref={setContainerRef}
        className="relative overflow-auto border rounded-lg"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {/* Virtual spacer */}
        <div style={{ height: itemData.totalHeight, position: 'relative' }}>
          {renderVisibleItems()}
        </div>

        {/* Load more indicator */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="p-4 text-center">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">جاري تحميل المزيد...</span>
              </div>
            ) : (
              <Button variant="outline" onClick={onLoadMore}>
                تحميل المزيد
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      {showScrollToTop && showScrollToTopButton && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 shadow-luxury"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          عرض {visibleRange.end - visibleRange.start + 1} من {items.length} عنصر
        </div>
        {loading && (
          <div className="flex items-center gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
            جاري التحميل
          </div>
        )}
      </div>
    </div>
  );
};

export { VirtualizedList };