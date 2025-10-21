import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface VirtualItem {
  id: string | number;
  height?: number;
  [key: string]: any;
}

interface VirtualizationOptions {
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  gap?: number;
  estimateItemHeight?: number;
}

interface VirtualizedState {
  scrollTop: number;
  visibleRange: { start: number; end: number };
  totalHeight: number;
  itemPositions: Array<{ offset: number; height: number }>;
}

export const useVirtualization = <T extends VirtualItem>(
  items: T[],
  options: VirtualizationOptions
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    gap = 0,
    estimateItemHeight = 50
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate item positions and total height
  const { itemPositions, totalHeight } = useMemo(() => {
    let currentOffset = 0;
    const positions: Array<{ offset: number; height: number }> = [];

    items.forEach((item, index) => {
      const height = typeof itemHeight === 'function' 
        ? itemHeight(index) 
        : item.height || itemHeight || estimateItemHeight;
      
      positions.push({
        offset: currentOffset,
        height: height
      });
      
      currentOffset += height + gap;
    });

    return {
      itemPositions: positions,
      totalHeight: Math.max(currentOffset - gap, 0)
    };
  }, [items, itemHeight, gap, estimateItemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (items.length === 0) {
      return { start: 0, end: 0 };
    }

    let start = 0;
    let end = items.length - 1;

    // Find first visible item
    for (let i = 0; i < itemPositions.length; i++) {
      const { offset, height } = itemPositions[i];
      if (offset + height >= scrollTop) {
        start = Math.max(0, i - overscan);
        break;
      }
    }

    // Find last visible item
    const viewportBottom = scrollTop + containerHeight;
    for (let i = start; i < itemPositions.length; i++) {
      const { offset } = itemPositions[i];
      if (offset >= viewportBottom) {
        end = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { start, end };
  }, [scrollTop, containerHeight, itemPositions, items.length, overscan]);

  // Get visible items with their positions
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      const item = items[i];
      const position = itemPositions[i];
      if (item && position) {
        result.push({
          item,
          index: i,
          style: {
            position: 'absolute' as const,
            top: position.offset,
            left: 0,
            right: 0,
            height: position.height
          }
        });
      }
    }
    return result;
  }, [items, itemPositions, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollingTimeoutRef.current) {
      clearTimeout(scrollingTimeoutRef.current);
    }

    // Set timeout to detect when scrolling stops
    scrollingTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number, alignment: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current || index < 0 || index >= items.length) return;

    const itemPosition = itemPositions[index];
    if (!itemPosition) return;

    let scrollTo = itemPosition.offset;

    if (alignment === 'center') {
      scrollTo = itemPosition.offset - (containerHeight - itemPosition.height) / 2;
    } else if (alignment === 'end') {
      scrollTo = itemPosition.offset - containerHeight + itemPosition.height;
    }

    // Clamp to valid range
    scrollTo = Math.max(0, Math.min(scrollTo, totalHeight - containerHeight));

    containerRef.current.scrollTo({
      top: scrollTo,
      behavior: 'smooth'
    });
  }, [itemPositions, containerHeight, totalHeight, items.length]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    containerRef.current?.scrollTo({ top: totalHeight, behavior: 'smooth' });
  }, [totalHeight]);

  // Get item at specific scroll position
  const getItemAtScrollTop = useCallback((scrollTop: number) => {
    for (let i = 0; i < itemPositions.length; i++) {
      const { offset, height } = itemPositions[i];
      if (scrollTop >= offset && scrollTop < offset + height) {
        return i;
      }
    }
    return 0;
  }, [itemPositions]);

  // Check if item is visible
  const isItemVisible = useCallback((index: number) => {
    return index >= visibleRange.start && index <= visibleRange.end;
  }, [visibleRange]);

  // Get stats
  const stats = useMemo(() => ({
    totalItems: items.length,
    visibleItems: visibleRange.end - visibleRange.start + 1,
    scrollProgress: totalHeight > 0 ? scrollTop / (totalHeight - containerHeight) : 0,
    isAtTop: scrollTop === 0,
    isAtBottom: scrollTop >= totalHeight - containerHeight - 1,
    firstVisibleIndex: visibleRange.start,
    lastVisibleIndex: visibleRange.end
  }), [items.length, visibleRange, scrollTop, totalHeight, containerHeight]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Container props
    containerProps: {
      ref: containerRef,
      style: { height: containerHeight, overflow: 'auto' },
      onScroll: handleScroll
    },

    // Virtual spacer props
    spacerProps: {
      style: { height: totalHeight, position: 'relative' as const }
    },

    // Visible items with positioning
    visibleItems,

    // Scroll methods
    scrollToItem,
    scrollToTop,
    scrollToBottom,

    // Utilities
    getItemAtScrollTop,
    isItemVisible,
    
    // State
    scrollTop,
    isScrolling,
    visibleRange,
    totalHeight,
    stats
  };
};

// Hook for infinite scrolling with virtualization
export const useInfiniteVirtualization = <T extends VirtualItem>(
  items: T[],
  options: VirtualizationOptions & {
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage?: () => void;
    threshold?: number;
  }
) => {
  const {
    hasNextPage = false,
    isFetchingNextPage = false,
    fetchNextPage,
    threshold = 100,
    ...virtualizationOptions
  } = options;

  const virtualization = useVirtualization(items, virtualizationOptions);
  const lastFetchRef = useRef(0);

  // Handle infinite scroll
  useEffect(() => {
    const { scrollTop, totalHeight } = virtualization;
    const { containerHeight } = options;
    
    const scrollBottom = scrollTop + containerHeight;
    const shouldFetch = 
      hasNextPage &&
      !isFetchingNextPage &&
      fetchNextPage &&
      scrollBottom >= totalHeight - threshold &&
      Date.now() - lastFetchRef.current > 1000; // Debounce

    if (shouldFetch) {
      lastFetchRef.current = Date.now();
      fetchNextPage();
    }
  }, [
    virtualization.scrollTop,
    virtualization.totalHeight,
    options.containerHeight,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    threshold
  ]);

  return {
    ...virtualization,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  };
};

// Hook for search with virtualization
export const useSearchVirtualization = <T extends VirtualItem>(
  allItems: T[],
  searchQuery: string,
  searchFn: (items: T[], query: string) => T[],
  options: VirtualizationOptions
) => {
  const [filteredItems, setFilteredItems] = useState<T[]>(allItems);

  // Update filtered items when search changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(allItems);
    } else {
      setFilteredItems(searchFn(allItems, searchQuery));
    }
  }, [allItems, searchQuery, searchFn]);

  const virtualization = useVirtualization(filteredItems, options);

  return {
    ...virtualization,
    filteredItems,
    searchQuery,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length,
    totalCount: allItems.length
  };
};