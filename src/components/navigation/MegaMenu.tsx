import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronRight, ExternalLink, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const megaMenuVariants = cva(
  "absolute left-0 top-full z-50 w-full min-w-[800px] shadow-luxury border border-border/50 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-background",
        glass: "glass-effect backdrop-blur-xl",
        luxury: "luxury-effect text-white",
        persian: "persian-effect text-white"
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
      },
      animation: {
        fade: "animate-fade-in",
        slide: "animate-slide-down", 
        scale: "animate-scale-in",
        persian: "animate-persian-float"
      }
    },
    defaultVariants: {
      variant: "glass",
      size: "md",
      animation: "fade"
    }
  }
);

export interface MegaMenuItem {
  id: string;
  title: string;
  description?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  featured?: boolean;
  external?: boolean;
  children?: MegaMenuItem[];
}

export interface MegaMenuSection {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: MegaMenuItem[];
  featured?: boolean;
}

export interface MegaMenuProps 
  extends VariantProps<typeof megaMenuVariants> {
  trigger: React.ReactNode;
  sections: MegaMenuSection[];
  className?: string;
  maxColumns?: number;
  showDescription?: boolean;
  featuredContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

const MegaMenu: React.FC<MegaMenuProps> = ({
  trigger,
  sections,
  variant,
  size,
  animation,
  className,
  maxColumns = 4,
  showDescription = true,
  featuredContent,
  footerContent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredSection(null);
    }, 150);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Calculate grid columns based on sections count
  const gridCols = Math.min(sections.length, maxColumns);
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3', 
    4: 'grid-cols-4',
  }[gridCols] || 'grid-cols-4';

  const renderMenuItem = (item: MegaMenuItem, depth: number = 0) => {
    const ItemComponent = item.href ? Link : 'div';
    const itemProps = item.href ? { to: item.href } : {};

    return (
      <div key={item.id} className={cn("group", depth > 0 && "ml-4")}>
        <ItemComponent
          {...itemProps}
          onClick={handleItemClick}
          className={cn(
            "flex items-center gap-2 p-2 rounded-md transition-colors cursor-pointer",
            "hover:bg-accent/50 group",
            item.featured && "bg-primary/10 border border-primary/20"
          )}
        >
          {item.icon && (
            <item.icon className={cn(
              "h-4 w-4 shrink-0",
              item.featured && "text-primary"
            )} />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium text-sm truncate",
                item.featured && "text-primary"
              )}>
                {item.title}
              </span>
              {item.badge && (
                <Badge 
                  variant={item.featured ? "default" : "secondary"} 
                  size="sm"
                >
                  {item.badge}
                </Badge>
              )}
              {item.featured && <Star className="h-3 w-3 text-primary fill-current" />}
              {item.external && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
            </div>
            {showDescription && item.description && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {item.description}
              </p>
            )}
          </div>
          {item.children && item.children.length > 0 && (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </ItemComponent>

        {/* Submenu */}
        {item.children && item.children.length > 0 && (
          <div className="mt-2 space-y-1">
            {item.children.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <div ref={triggerRef} className="cursor-pointer">
        {trigger}
      </div>

      {/* Mega Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={cn(megaMenuVariants({ variant, size, animation }), className)}
          style={{ minHeight: '400px' }}
        >
          <div className="grid gap-8 h-full">
            {/* Featured Content */}
            {featuredContent && (
              <div className="col-span-full">
                {featuredContent}
                <Separator className="mt-4" />
              </div>
            )}

            {/* Main Content Grid */}
            <div className={cn("grid gap-6", gridClasses)}>
              {sections.map((section) => (
                <div 
                  key={section.id}
                  className={cn(
                    "space-y-4 p-4 rounded-lg transition-all duration-200",
                    hoveredSection === section.id && "bg-accent/20 scale-105",
                    section.featured && "border border-primary/20 bg-primary/5"
                  )}
                  onMouseEnter={() => setHoveredSection(section.id)}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                    {section.icon && (
                      <section.icon className={cn(
                        "h-5 w-5",
                        section.featured && "text-primary"
                      )} />
                    )}
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-semibold text-base",
                        section.featured && "text-primary"
                      )}>
                        {section.title}
                      </h3>
                      {showDescription && section.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-hide">
                    {section.items.map(item => renderMenuItem(item))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Content */}
            {footerContent && (
              <div className="col-span-full border-t border-border/30 pt-4">
                {footerContent}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Predefined MegaMenu Trigger Components
const MegaMenuTrigger: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'luxury' | 'persian';
  showChevron?: boolean;
}> = ({ children, variant = 'default', showChevron = true }) => (
  <Button 
    variant="ghost" 
    className={cn(
      "h-auto p-2 font-medium transition-all duration-200 group",
      variant === 'luxury' && "hover:bg-luxury/10 hover:text-luxury",
      variant === 'persian' && "hover:bg-persian/10 hover:text-persian"
    )}
  >
    <span className="flex items-center gap-2">
      {children}
      {showChevron && (
        <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
      )}
    </span>
  </Button>
);

export { MegaMenu, MegaMenuTrigger, megaMenuVariants };