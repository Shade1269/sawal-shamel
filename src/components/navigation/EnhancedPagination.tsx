import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal,
  List,
  Grid
} from 'lucide-react';

const paginationVariants = cva(
  "flex items-center justify-between w-full gap-4",
  {
    variants: {
      variant: {
        default: "bg-background border border-border rounded-lg p-4",
        minimal: "",
        glass: "glass-effect backdrop-blur-sm border border-border/30 rounded-lg p-4",
        luxury: "luxury-effect text-luxury-foreground rounded-lg p-4",
        persian: "persian-effect text-persian-foreground rounded-lg p-4"
      },
      size: {
        sm: "text-sm gap-2 p-2",
        md: "text-sm gap-4 p-4", 
        lg: "text-base gap-6 p-6"
      },
      alignment: {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
        between: "justify-between"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      alignment: "between"
    }
  }
);

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
}

export interface EnhancedPaginationProps 
  extends VariantProps<typeof paginationVariants> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showInfo?: boolean;
  showItemsPerPage?: boolean;
  showFirstLast?: boolean;
  showJumpToPage?: boolean;
  maxVisiblePages?: number;
  itemsPerPageOptions?: number[];
  className?: string;
  loading?: boolean;
  compact?: boolean;
}

const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  variant,
  size,
  alignment,
  showInfo = true,
  showItemsPerPage = true,
  showFirstLast = true,
  showJumpToPage = false,
  maxVisiblePages = 7,
  itemsPerPageOptions = [10, 20, 50, 100],
  className,
  loading = false,
  compact = false
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem,
    endItem
  };

  // Generate visible page numbers
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    
    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('ellipsis');
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm whitespace-nowrap">
          صفحة {currentPage} من {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(paginationVariants({ variant, size, alignment }), className)}>
      {/* Left Side - Info */}
      <div className="flex items-center gap-4 min-w-0">
        {showInfo && (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            عرض {startItem.toLocaleString('ar')} إلى {endItem.toLocaleString('ar')} من {totalItems.toLocaleString('ar')} عنصر
          </div>
        )}
        
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm">عرض:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Center - Pagination Controls */}
      <div className="flex items-center gap-1">
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1 || loading}
            className="hidden sm:flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <Button
                  key={`ellipsis-${index}`}
                  variant="ghost"
                  size="sm"
                  disabled
                  className="w-8 h-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              );
            }

            const isCurrentPage = page === currentPage;
            return (
              <Button
                key={page}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={cn(
                  "w-8 h-8 p-0",
                  isCurrentPage && "pointer-events-none"
                )}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages || loading}
            className="hidden sm:flex"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Right Side - Additional Controls */}
      <div className="flex items-center gap-2">
        {showJumpToPage && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm">الانتقال إلى:</span>
            <Select
              value=""
              onValueChange={(value) => handlePageChange(parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue placeholder="صفحة" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <SelectItem key={page} value={page.toString()}>
                    {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">جاري التحميل...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Summary Component
interface PaginationSummaryProps {
  info: PaginationInfo;
  className?: string;
  variant?: 'default' | 'detailed' | 'minimal';
}

const PaginationSummary: React.FC<PaginationSummaryProps> = ({
  info,
  className,
  variant = 'default'
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        {info.currentPage} / {info.totalPages}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn("space-y-2 text-sm", className)}>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            صفحة {info.currentPage} من {info.totalPages}
          </Badge>
          <Badge variant="secondary">
            {info.totalItems} عنصر إجمالي
          </Badge>
        </div>
        <div className="text-muted-foreground">
          عرض {info.startItem} - {info.endItem} ({info.itemsPerPage} لكل صفحة)
        </div>
      </div>
    );
  }

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      عرض {info.startItem.toLocaleString('ar')} إلى {info.endItem.toLocaleString('ar')} من {info.totalItems.toLocaleString('ar')} عنصر
    </div>
  );
};

export { EnhancedPagination, PaginationSummary, paginationVariants };