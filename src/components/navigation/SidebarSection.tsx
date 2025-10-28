import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SidebarSectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isCollapsed?: boolean;
  isExpanded?: boolean;
  onToggle?: (id: string) => void;
  color?: string;
}

export function SidebarSection({
  id,
  title,
  icon,
  children,
  isCollapsed,
  isExpanded = true,
  onToggle,
  color
}: SidebarSectionProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const expanded = onToggle ? isExpanded : localExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle(id);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  if (isCollapsed) {
    return (
      <div className="py-2">
        {children}
      </div>
    );
  }

  return (
    <Collapsible
      open={expanded}
      onOpenChange={handleToggle}
      className="py-2"
    >
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center gap-2 px-4 py-2 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg mx-2 transition-colors">
          {icon && (
            <div 
              className="flex-shrink-0"
              style={color ? { color: `hsl(${color})` } : undefined}
            >
              {icon}
            </div>
          )}
          <span className="flex-1 text-right text-xs font-bold uppercase tracking-wider text-[hsl(var(--sidebar-text-secondary))] group-hover:text-[hsl(var(--sidebar-text))] transition-colors">
            {title}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[hsl(var(--sidebar-text-secondary))] transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="animate-accordion-down">
        <div className="space-y-0.5 pt-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}