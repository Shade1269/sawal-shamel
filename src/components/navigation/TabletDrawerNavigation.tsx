import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSmartNavigation } from './SmartNavigationProvider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Menu, ChevronRight, ChevronDown, X, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTouchFriendlySize } from '@/utils/deviceUtils';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export function TabletDrawerNavigation() {
  const { 
    state, 
    items: navigationItems, 
    isItemVisible,
    addToFavorites,
    removeFromFavorites
  } = useSmartNavigation();
  const device = useDeviceDetection();
  const touchSize = getTouchFriendlySize(device);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['main']));

  // Group navigation items
  const groupedItems = navigationItems.reduce((groups, item) => {
    if (!isItemVisible(item)) return groups;
    
    const group = item.group || 'main';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, typeof navigationItems>);

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

  return (
    <div className="w-14 bg-card border-r flex flex-col">
      {/* Collapsed Sidebar - Always visible */}
      <div className="flex flex-col items-center py-4 space-y-4">
        {/* Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 w-10 h-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          
          <SheetContent 
            side="left" 
            className="p-0 w-80 max-w-[85vw]"
          >
            {/* Header */}
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle className="text-right">التنقل</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-auto">
              {/* Favorites Section */}
              {state.favoritePages.length > 0 && (
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    المفضلة
                  </h3>
                  <div className="space-y-1">
                    {state.favoritePages.slice(0, 5).map((item) => {
                      const Icon = item.icon;
                      const isActive = state.currentPath === item.href;
                      
                      return (
                        <NavLink
                          key={item.id}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                            touchSize.buttonPadding,
                            isActive 
                              ? "text-primary bg-primary/10" 
                              : "text-foreground hover:bg-muted/50"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span className="flex-1 text-sm font-medium">{item.title}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Pages */}
              {state.recentPages.length > 0 && (
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    الصفحات الأخيرة
                  </h3>
                  <div className="space-y-1">
                    {state.recentPages.slice(0, 3).map((item) => {
                      const Icon = item.icon;
                      const isActive = state.currentPath === item.href;
                      
                      return (
                        <NavLink
                          key={item.id}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                            touchSize.buttonPadding,
                            isActive 
                              ? "text-primary bg-primary/10" 
                              : "text-foreground hover:bg-muted/50"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span className="flex-1 text-sm font-medium">{item.title}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Grouped Navigation */}
              <div className="p-4 space-y-4">
                {Object.entries(groupedItems).map(([groupName, items]) => (
                  <Collapsible
                    key={groupName}
                    open={expandedGroups.has(groupName)}
                    onOpenChange={() => toggleGroup(groupName)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-2 h-auto"
                      >
                        <span className="text-sm font-medium capitalize">
                          {groupName === 'main' ? 'الرئيسية' : groupName}
                        </span>
                        {expandedGroups.has(groupName) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-1 mt-2">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = state.currentPath === item.href;
                        const favorite = isFavorite(item.id);
                        
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-1"
                          >
                            <NavLink
                              to={item.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group flex-1",
                                touchSize.buttonPadding,
                                isActive 
                                  ? "text-primary bg-primary/10" 
                                  : "text-foreground hover:bg-muted/50"
                              )}
                            >
                              {Icon && <Icon className="h-4 w-4" />}
                              <div className="flex-1">
                                <div className="text-sm font-medium">{item.title}</div>
                                {item.description && (
                                  <div className="text-xs text-muted-foreground">{item.description}</div>
                                )}
                              </div>
                              {item.badge && item.badge > 0 && (
                                <Badge variant="secondary" className="h-5 text-xs">
                                  {item.badge > 9 ? '9+' : item.badge}
                                </Badge>
                              )}
                            </NavLink>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFavorite(item);
                              }}
                            >
                              <Star 
                                className={cn(
                                  "h-3 w-3",
                                  favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                )} 
                              />
                            </Button>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Quick Action Indicators */}
        <div className="flex flex-col space-y-2">
          {state.favoritePages.slice(0, 3).map((item, index) => {
            const Icon = item.icon;
            const isActive = state.currentPath === item.href;
            
            return (
              <NavLink
                key={item.id}
                to={item.href}
                className={cn(
                  "p-2 w-10 h-10 rounded-lg transition-colors flex items-center justify-center",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
                title={item.title}
              >
                {Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <div className="w-2 h-2 bg-current rounded-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}