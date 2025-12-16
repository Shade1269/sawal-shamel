import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Search, Filter } from 'lucide-react';

interface InventoryFiltersProps {
  warehouses: Array<{ id: string; name: string; code: string }>;
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  warehouse: string;
  lowStock: boolean;
  expired: boolean;
  status: 'all' | 'available' | 'reserved' | 'out_of_stock';
}

export function InventoryFilters({ warehouses, onFiltersChange }: InventoryFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    warehouse: 'all',
    lowStock: false,
    expired: false,
    status: 'all',
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      warehouse: 'all',
      lowStock: false,
      expired: false,
      status: 'all',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value.length > 0;
    if (key === 'warehouse') return value !== 'all';
    if (key === 'status') return value !== 'all';
    return value === true;
  }).length;

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      <div className="flex flex-wrap gap-4">
        {/* البحث */}
        <div className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بكود المنتج أو الاسم..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* تصفية المخزن */}
        <Select value={filters.warehouse} onValueChange={(value) => handleFilterChange('warehouse', value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="جميع المستودعات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المستودعات</SelectItem>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>
                {warehouse.name} ({warehouse.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* حالة المخزون */}
        <Select value={filters.status} onValueChange={(value: any) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="جميع الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="available">متاح</SelectItem>
            <SelectItem value="reserved">محجوز</SelectItem>
            <SelectItem value="out_of_stock">نفد المخزون</SelectItem>
          </SelectContent>
        </Select>

        {/* مرشحات سريعة */}
        <div className="flex gap-2">
          <Button
            variant={filters.lowStock ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('lowStock', !filters.lowStock)}
          >
            <Filter className="h-4 w-4 mr-1" />
            مخزون منخفض
          </Button>
          <Button
            variant={filters.expired ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange('expired', !filters.expired)}
          >
            <Filter className="h-4 w-4 mr-1" />
            منتهي الصلاحية
          </Button>
        </div>

        {/* مسح المرشحات */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            مسح الكل ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* عرض المرشحات النشطة */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              البحث: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('search', '')}
              />
            </Badge>
          )}
          {filters.warehouse !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              المخزن: {warehouses.find(w => w.id === filters.warehouse)?.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('warehouse', 'all')}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              الحالة: {filters.status === 'available' ? 'متاح' : filters.status === 'reserved' ? 'محجوز' : 'نفد المخزون'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('status', 'all')}
              />
            </Badge>
          )}
          {filters.lowStock && (
            <Badge variant="secondary" className="gap-1">
              مخزون منخفض
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('lowStock', false)}
              />
            </Badge>
          )}
          {filters.expired && (
            <Badge variant="secondary" className="gap-1">
              منتهي الصلاحية
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterChange('expired', false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}