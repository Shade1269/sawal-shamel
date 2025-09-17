// Performance & Optimization Components v5.0
// Advanced performance monitoring, optimization, and error handling system

// Core Performance Components
export { VirtualizedList, VirtualizedListItem } from './VirtualizedList';
export { LazyImage } from './LazyImage';
export { PerformanceMonitor } from './PerformanceMonitor';

// Loading & Skeleton Components
export {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  ProductGridSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  PageSkeleton
} from './SkeletonLoader';

// Error Handling
export { 
  ErrorBoundary, 
  withErrorBoundary, 
  useErrorBoundary 
} from './ErrorBoundary';

// Performance Hook
export { usePerformance } from '@/hooks/usePerformance';