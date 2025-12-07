import React from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';

const tableVariants = cva(
  "w-full caption-bottom text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-collapse",
        striped: "border-collapse [&_tbody_tr:nth-child(odd)]:bg-muted/50",
        bordered: "border border-border rounded-lg overflow-hidden",
        minimal: "border-collapse border-spacing-0"
      },
      size: {
        sm: "[&_th]:px-2 [&_th]:py-2 [&_td]:px-2 [&_td]:py-2 text-xs",
        default: "[&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3",
        lg: "[&_th]:px-6 [&_th]:py-4 [&_td]:px-6 [&_td]:py-4"
      },
      responsive: {
        true: "overflow-x-auto",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      responsive: true
    }
  }
);

interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  responsive?: {
    hideOnMobile?: boolean;
    hideOnTablet?: boolean;
    priority?: number; // Higher priority shows first on mobile
  };
}

interface EnhancedTableProps<T = any> 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tableVariants> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T, index: number) => void;
  rowActions?: {
    view?: (record: T) => void;
    edit?: (record: T) => void;
    delete?: (record: T) => void;
    custom?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: (record: T) => void;
      variant?: 'default' | 'destructive' | 'secondary';
    }>;
  };
  // Mobile card layout options
  mobileCardTitle?: (record: T) => string;
  mobileCardSubtitle?: (record: T) => string;
  mobileCardContent?: (record: T) => React.ReactNode;
}

export function EnhancedTable<T = any>({
  data,
  columns,
  loading = false,
  emptyText = "لا توجد بيانات",
  onRowClick,
  rowActions,
  mobileCardTitle,
  mobileCardSubtitle,
  mobileCardContent,
  variant,
  size,
  responsive,
  className,
  ...props
}: EnhancedTableProps<T>) {
  const device = useDeviceDetection();

  // Filter columns based on device responsiveness
  const visibleColumns = columns.filter(col => {
    if (device.isMobile && col.responsive?.hideOnMobile) return false;
    if (device.isTablet && col.responsive?.hideOnTablet) return false;
    return true;
  });

  // Sort columns by priority for mobile
  const sortedColumns = device.isMobile 
    ? visibleColumns.sort((a, b) => (b.responsive?.priority || 0) - (a.responsive?.priority || 0))
    : visibleColumns;

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{emptyText}</p>
        </CardContent>
      </Card>
    );
  }

  // Mobile Card Layout
  if (device.isMobile && (mobileCardTitle || mobileCardContent)) {
    return (
      <div className="space-y-4" {...props}>
        {data.map((record, index) => (
          <Card 
            key={index}
            className={cn(
              "transition-all duration-200",
              onRowClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
              className
            )}
            onClick={() => onRowClick?.(record, index)}
          >
            <CardHeader className="pb-2">
              {mobileCardTitle && (
                <CardTitle className="text-base">{mobileCardTitle(record)}</CardTitle>
              )}
              {mobileCardSubtitle && (
                <p className="text-sm text-muted-foreground">{mobileCardSubtitle(record)}</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {mobileCardContent ? (
                mobileCardContent(record)
              ) : (
                <div className="space-y-2">
                  {sortedColumns.slice(0, 3).map(col => {
                    const value = col.dataIndex ? record[col.dataIndex] : null;
                  const displayValue = col.render ? col.render(value, record, index) : String(value || '');
                    
                    return (
                      <div key={col.key} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{col.title}:</span>
                        <span className="text-sm font-medium">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {rowActions && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  {rowActions.view && (
                    <Button size="sm" variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      rowActions.view!(record);
                    }}>
                      <Eye className="w-4 h-4" />
                      عرض
                    </Button>
                  )}
                  {rowActions.edit && (
                    <Button size="sm" variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      rowActions.edit!(record);
                    }}>
                      <Edit className="w-4 h-4" />
                      تعديل
                    </Button>
                  )}
                  {rowActions.delete && (
                    <Button size="sm" variant="destructive" onClick={(e) => {
                      e.stopPropagation();
                      rowActions.delete!(record);
                    }}>
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop/Tablet Table Layout
  return (
    <div className={cn("rounded-md border", className)} {...props}>
      <ScrollArea className="h-full">
        <table className={cn(tableVariants({ variant, size, responsive }))}>
          <thead className="[&_tr]:border-b bg-muted/50">
            <tr>
              {sortedColumns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    "font-medium text-muted-foreground",
                    col.align === 'center' && "text-center",
                    col.align === 'right' && "text-right"
                  )}
                  style={{ width: col.width }}
                >
                  {col.title}
                </th>
              ))}
              {rowActions && <th className="text-center">الإجراءات</th>}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {data.map((record, index) => (
              <tr
                key={index}
                className={cn(
                  "border-b transition-colors",
                  onRowClick && "hover:bg-muted/50 cursor-pointer"
                )}
                onClick={() => onRowClick?.(record, index)}
              >
                {sortedColumns.map(col => {
                  const value = col.dataIndex ? record[col.dataIndex] : null;
                  const displayValue = col.render ? col.render(value, record, index) : String(value || '');
                  
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        col.align === 'center' && "text-center",
                        col.align === 'right' && "text-right"
                      )}
                    >
                      {displayValue}
                    </td>
                  );
                })}
                {rowActions && (
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {rowActions.view && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            rowActions.view!(record);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {rowActions.edit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            rowActions.edit!(record);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {rowActions.delete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            rowActions.delete!(record);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                      {rowActions.custom && (
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

export type { TableColumn, EnhancedTableProps };
export { tableVariants };