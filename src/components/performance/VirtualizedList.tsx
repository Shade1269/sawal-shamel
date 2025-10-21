import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePerformance } from '@/hooks/usePerformance';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 0.8,
  loading = false,
  loadingComponent,
  emptyComponent
}: VirtualizedListProps<T>) {
  const { shouldUseVirtualScrolling, isLowPerformanceMode } = usePerformance();
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!shouldUseVirtualScrolling && !isLowPerformanceMode) {
      return { start: 0, end: items.length };
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);

    return { start, end };
  }, [shouldUseVirtualScrolling, isLowPerformanceMode, scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      top: (visibleRange.start + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);

    // Mark as scrolling
    isScrollingRef.current = true;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to mark as not scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);

    // Check if we've reached the end
    if (onEndReached) {
      const scrollHeight = e.currentTarget.scrollHeight;
      const clientHeight = e.currentTarget.clientHeight;
      const scrolledPercentage = (newScrollTop + clientHeight) / scrollHeight;

      if (scrolledPercentage >= endReachedThreshold) {
        onEndReached();
      }
    }
  }, [onEndReached, endReachedThreshold]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // If not using virtualization, render all items
  if (!shouldUseVirtualScrolling && !isLowPerformanceMode) {
    return (
      <div 
        ref={containerRef}
        className={cn("overflow-auto", className)}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        {items.length === 0 ? (
          emptyComponent || (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              لا توجد عناصر للعرض
            </div>
          )
        ) : (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div key={index} style={{ height: itemHeight }}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        )}
        {loading && (
          <div className="p-4">
            {loadingComponent || (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">جاري التحميل...</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Virtualized rendering
  return (
    <div 
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {items.length === 0 ? (
        emptyComponent || (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            لا توجد عناصر للعرض
          </div>
        )
      ) : (
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(({ item, index, top }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: top,
                left: 0,
                right: 0,
                height: itemHeight
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      )}
      {loading && (
        <div className="p-4">
          {loadingComponent || (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">جاري التحميل...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Performance-optimized list item wrapper
interface VirtualizedListItemProps {
  children: React.ReactNode;
  index: number;
  isScrolling?: boolean;
  className?: string;
}

export const VirtualizedListItem = React.memo<VirtualizedListItemProps>(({ 
  children, 
  index, 
  isScrolling = false,
  className 
}) => {
  return (
    <div 
      className={cn(
        "transition-opacity duration-200",
        isScrolling && "pointer-events-none", // Disable interactions while scrolling
        className
      )}
      data-index={index}
    >
      {children}
    </div>
  );
});

VirtualizedListItem.displayName = "VirtualizedListItem";