import React from 'react';
import { cn } from '@/lib/utils';
import { usePerformance } from '@/hooks/usePerformance';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = false,
  animation = 'pulse'
}) => {
  const { shouldReduceAnimations } = usePerformance();
  
  const finalAnimation = shouldReduceAnimations ? 'none' : animation;
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer gradient-shimmer bg-size-200',
    none: ''
  };

  return (
    <div
      className={cn(
        "bg-muted",
        rounded && "rounded-full",
        !rounded && "rounded",
        animationClasses[finalAnimation],
        className
      )}
      style={{ width, height }}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-4 border border-border rounded-lg space-y-3", className)}>
    <Skeleton height="20px" width="60%" />
    <Skeleton height="16px" width="100%" />
    <Skeleton height="16px" width="80%" />
    <div className="flex gap-2 pt-2">
      <Skeleton height="32px" width="80px" rounded />
      <Skeleton height="32px" width="80px" rounded />
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4,
  className 
}) => (
  <div className={cn("w-full space-y-3", className)}>
    {/* Header */}
    <div className="flex gap-4 p-4 border-b">
      {Array.from({ length: columns }, (_, i) => (
        <Skeleton key={i} height="20px" width="120px" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-4">
        {Array.from({ length: columns }, (_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            height="16px" 
            width={colIndex === 0 ? "150px" : "100px"} 
          />
        ))}
      </div>
    ))}
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ 
  items?: number;
  showAvatar?: boolean;
  className?: string;
}> = ({ 
  items = 5,
  showAvatar = false,
  className 
}) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center gap-3">
        {showAvatar && <Skeleton width="40px" height="40px" rounded />}
        <div className="flex-1 space-y-2">
          <Skeleton height="16px" width="70%" />
          <Skeleton height="14px" width="40%" />
        </div>
      </div>
    ))}
  </div>
);

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ 
  items?: number;
  columns?: number;
  className?: string;
}> = ({ 
  items = 8,
  columns = 4,
  className 
}) => (
  <div 
    className={cn("grid gap-4", className)}
    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
  >
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="border rounded-lg overflow-hidden">
        <Skeleton height="200px" width="100%" />
        <div className="p-4 space-y-2">
          <Skeleton height="16px" width="80%" />
          <Skeleton height="14px" width="60%" />
          <Skeleton height="20px" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

// Dashboard Skeleton
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton height="14px" width="80px" />
              <Skeleton height="24px" width="60px" />
            </div>
            <Skeleton width="40px" height="40px" rounded />
          </div>
        </div>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 border rounded-lg">
        <Skeleton height="20px" width="150px" className="mb-4" />
        <Skeleton height="300px" width="100%" />
      </div>
      <div className="p-6 border rounded-lg">
        <Skeleton height="20px" width="150px" className="mb-4" />
        <Skeleton height="300px" width="100%" />
      </div>
    </div>
    
    {/* Recent Activity */}
    <div className="p-6 border rounded-lg">
      <Skeleton height="20px" width="150px" className="mb-4" />
      <ListSkeleton items={5} showAvatar />
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ 
  fields?: number;
  className?: string;
}> = ({ 
  fields = 6,
  className 
}) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: fields }, (_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton height="14px" width="100px" />
        <Skeleton height="40px" width="100%" />
      </div>
    ))}
    <div className="flex gap-2 pt-4">
      <Skeleton height="40px" width="100px" />
      <Skeleton height="40px" width="80px" />
    </div>
  </div>
);

// Page Skeleton
export const PageSkeleton: React.FC<{ 
  type?: 'dashboard' | 'table' | 'form' | 'grid';
  className?: string;
}> = ({ 
  type = 'dashboard',
  className 
}) => {
  const skeletonComponents = {
    dashboard: <DashboardSkeleton />,
    table: <TableSkeleton />,
    form: <FormSkeleton />,
    grid: <ProductGridSkeleton />
  };

  return (
    <div className={cn("p-6", className)}>
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton height="32px" width="200px" />
        <Skeleton height="16px" width="300px" />
      </div>
      
      {/* Content */}
      {skeletonComponents[type]}
    </div>
  );
};