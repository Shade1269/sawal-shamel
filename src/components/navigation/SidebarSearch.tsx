import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SidebarSearchProps {
  value: string;
  onChange: (value: string) => void;
  isCollapsed?: boolean;
}

export function SidebarSearch({ value, onChange, isCollapsed }: SidebarSearchProps) {
  if (isCollapsed) return null;

  return (
    <div className="relative px-3 py-2">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--sidebar-text-secondary))]" />
        <Input
          type="text"
          placeholder="بحث في القوائم..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 pl-10 bg-[hsl(var(--sidebar-hover))] border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-text))] placeholder:text-[hsl(var(--sidebar-text-secondary))] focus-visible:ring-[hsl(var(--sidebar-active))]"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--sidebar-text-secondary))] hover:text-[hsl(var(--sidebar-text))] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}