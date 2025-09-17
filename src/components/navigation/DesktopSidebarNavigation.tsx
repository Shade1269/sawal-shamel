import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSmartNavigation } from './SmartNavigationProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ChevronRight, 
  ChevronDown, 
  Star, 
  Clock, 
  Pin,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface DesktopSidebarNavigationProps {
  className?: string;
  compact?: boolean;
}

export function DesktopSidebarNavigation({ className, compact = false }: DesktopSidebarNavigationProps) {
  const { 
    state, 
    items: navigationItems, 
    isItemVisible,
    addToFavorites,
    removeFromFavorites,
    searchNavigation
  } = useSmartNavigation();
  
  const device = useDeviceDetection();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['main']));
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set());
  
  // Determine if sidebar should be compact
  const isCompact = compact || device.screenSize === 'sm';

  // Filter and group navigation items
  const visibleItems = navigationItems.filter(isItemVisible);
  const groupedItems = visibleItems.reduce((groups, item) => {
    const group = item.group || 'main';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, typeof navigationItems>);

  const searchResults = searchQuery ? searchNavigation(searchQuery) : [];

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const isFavorite = (itemId: string) => {
    return state.favoritePages.some(fav => fav.id === itemId);
  };

  const toggleFavorite = (item: any) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  const togglePin = (itemId: string) => {
    const newPinned = new Set(pinnedItems);
    if (newPinned.has(itemId)) {
      newPinned.delete(itemId);
    } else {
      newPinned.add(itemId);
    }
    setPinnedItems(newPinned);
  };

  const renderNavigationItem = (item: any, level: number = 0) => {
    const Icon = item.icon;
    const isActive = state.currentPath === item.href;
    const favorite = isFavorite(item.id);
    const pinned = pinnedItems.has(item.id);

    return (
      <div key={item.id} className="group">
        <div className="flex items-center">
          <NavLink
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 flex-1",
              "hover:bg-accent hover:text-accent-foreground",
              level > 0 && "ml-4",
              isActive && "bg-accent text-accent-foreground font-medium",
              isCompact && "justify-center px-2"
            )}
          >
            {Icon && (
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                isActive && "text-primary"
              )} />
            )}
            
            {!isCompact && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {item.badge && item.badge > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                  
                  {pinned && (
                    <Pin className="h-3 w-3 text-primary" />
                  )}
                </div>
              </>
            )}
          </NavLink>
          
          {!isCompact && (
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleFavorite(item)}
                  >
                    <Star 
                      className={cn(
                        "h-3 w-3",
                        favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      )} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => togglePin(item.id)}
                  >
                    <Pin 
                      className={cn(
                        "h-3 w-3",
                        pinned ? "text-primary" : "text-muted-foreground"
                      )} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {pinned ? 'إلغاء التثبيت' : 'تثبيت'}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
        
        {/* Child items */}
        {item.children && item.children.length > 0 && !isCompact && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((child: any) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Search Bar */}
      {!isCompact && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="البحث في الصفحات..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && !isCompact && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">نتائج البحث</h3>
            <div className="space-y-1">
              {searchResults.map(item => renderNavigationItem(item))}
            </div>
          </div>
        )}

        {/* Pinned Items */}
        {pinnedItems.size > 0 && !isCompact && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Pin className="h-4 w-4" />
              المثبتة
            </h3>
            <div className="space-y-1">
              {visibleItems
                .filter(item => pinnedItems.has(item.id))
                .map(item => renderNavigationItem(item))}
            </div>
          </div>
        )}

        {/* Favorites */}
        {state.favoritePages.length > 0 && !isCompact && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              المفضلة
            </h3>
            <div className="space-y-1">
              {state.favoritePages.slice(0, 5).map(item => renderNavigationItem(item))}
            </div>
          </div>
        )}

        {/* Recent Pages */}
        {state.recentPages.length > 0 && !isCompact && (
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              الصفحات الأخيرة
            </h3>
            <div className="space-y-1">
              {state.recentPages.slice(0, 3).map(item => renderNavigationItem(item))}
            </div>
          </div>
        )}
        
        {/* Main Navigation */}
        <div className="p-4 space-y-4">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName}>
              {!isCompact && items.length > 0 && (
                <Collapsible
                  open={expandedGroups.has(groupName)}
                  onOpenChange={() => toggleGroup(groupName)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-2 h-auto mb-2"
                    >
                      <span className="text-sm font-medium text-muted-foreground capitalize">
                        {groupName === 'main' ? 'الرئيسية' : groupName}
                      </span>
                      {expandedGroups.has(groupName) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-1">
                    {items.map(item => renderNavigationItem(item))}
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {isCompact && (
                <div className="space-y-2">
                  {items.slice(0, 8).map(item => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        {renderNavigationItem(item)}
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div>
                          <div className="font-medium">{item.title}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}