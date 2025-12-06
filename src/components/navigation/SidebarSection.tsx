import { ReactNode, useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

/**
 * Accessible Sidebar Section Component
 * Compliant with WCAG 2.1 & WAI-ARIA 1.2 Standards
 *
 * Standards implemented:
 * - WCAG 2.1.1: Keyboard accessible (Tab, Enter, Space)
 * - WCAG 2.4.3: Logical focus order
 * - WCAG 2.4.7: Visible focus indicator
 * - WCAG 4.1.2: Name, Role, Value (aria-expanded, aria-controls)
 * - WAI-ARIA: Disclosure pattern for expandable sections
 *
 * Keyboard Support:
 * - Tab: Move focus to/from the section trigger
 * - Enter/Space: Toggle section open/closed
 */

interface SidebarSectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isCollapsed?: boolean;
  isExpanded?: boolean;
  onToggle?: (id: string) => void;
  color?: string;
  /** Accessible label for screen readers */
  "aria-label"?: string;
}

export function SidebarSection({
  id,
  title,
  icon,
  children,
  isCollapsed,
  isExpanded,
  onToggle,
  color,
  "aria-label": ariaLabel
}: SidebarSectionProps) {
  // Generate unique IDs for ARIA relationships
  const contentId = useId();
  const triggerId = useId();

  // Default to expanded if not explicitly set
  const [localExpanded, setLocalExpanded] = useState(true);
  const expanded = onToggle ? (isExpanded ?? true) : localExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle(id);
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  if (isCollapsed) {
    return (
      <div className="py-2" role="navigation" aria-label={ariaLabel || title}>
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
      <CollapsibleTrigger
        id={triggerId}
        className="w-full group"
        // WAI-ARIA: aria-expanded and aria-controls are managed by Radix
        aria-label={ariaLabel || `${expanded ? 'إغلاق' : 'فتح'} قسم ${title}`}
      >
        <div
          className={cn(
            // WCAG 2.5.5: Minimum touch target 44px
            "flex items-center gap-2 px-4 min-h-[44px] py-3 rounded-lg mx-2 transition-all duration-200",
            // Touch-friendly: prevent accidental zoom on double-tap
            "touch-manipulation",
            // Hover state - Desktop (pink background as per UX spec)
            "hover:bg-[hsl(var(--sidebar-hover))]",
            // Active state - Mobile touch
            "active:bg-[hsl(var(--sidebar-hover))] active:scale-[0.98]",
            // Focus visible indicator (WCAG 2.4.7)
            "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2",
            // Expanded state (pink background, maroon text)
            expanded && "bg-[hsl(0_60%_97%)] text-primary"
          )}
        >
          {icon && (
            <div
              className="flex-shrink-0"
              style={color ? { color: `hsl(${color})` } : undefined}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <span className={cn(
            "flex-1 text-right text-xs font-bold uppercase tracking-wider transition-colors",
            expanded
              ? "text-primary"
              : "text-[hsl(var(--sidebar-text-secondary))] group-hover:text-[hsl(var(--sidebar-text))]"
          )}>
            {title}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              expanded
                ? "rotate-180 text-primary"
                : "text-[hsl(var(--sidebar-text-secondary))]"
            )}
            aria-hidden="true"
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent
        id={contentId}
        className="animate-accordion-down"
        role="region"
        aria-labelledby={triggerId}
      >
        <nav className="space-y-0.5 pt-1" aria-label={`${title} قائمة فرعية`}>
          {children}
        </nav>
      </CollapsibleContent>
    </Collapsible>
  );
}