import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartNavigation } from './SmartNavigationProvider';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  ArrowLeft, 
  ArrowRight, 
  Command,
  Star,
  Clock,
  Keyboard
} from 'lucide-react';

// Shortcut type defined for keyboard navigation

export function NavigationShortcuts() {
  const navigate = useNavigate();
  const { 
    state, 
    goBack, 
    goForward, 
    searchNavigation,
    items: navigationItems,
    isItemVisible
  } = useSmartNavigation();
  
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Shortcuts are registered via useEffect below

  // Register keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }

      // Navigation shortcuts
      if (e.altKey && e.key === 'ArrowLeft' && state.canGoBack) {
        e.preventDefault();
        goBack();
        return;
      }

      if (e.altKey && e.key === 'ArrowRight' && state.canGoForward) {
        e.preventDefault();
        goForward();
        return;
      }

      // Quick navigation shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'h':
            e.preventDefault();
            navigate('/');
            break;
          case 'd':
            e.preventDefault();
            navigate('/affiliate');
            break;
          case 'p':
            e.preventDefault();
            navigate('/affiliate/storefront');
            break;
          case 'o':
            e.preventDefault();
            navigate('/affiliate/orders');
            break;
        }
      }

      // Number key shortcuts (1-9 for quick navigation)
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        const visibleItems = navigationItems.filter(isItemVisible);
        if (visibleItems[index]) {
          e.preventDefault();
          navigate(visibleItems[index].href);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, goBack, goForward, state.canGoBack, state.canGoForward, navigationItems, isItemVisible]);

  // Search results
  const searchResults = searchQuery ? searchNavigation(searchQuery) : [];
  const visibleNavItems = navigationItems.filter(isItemVisible);

  const handleItemSelect = (href: string) => {
    navigate(href);
    setCommandOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput 
          placeholder="ابحث عن الصفحات والأوامر..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>لا توجد نتائج</CommandEmpty>
          
          {/* Quick Actions */}
          <CommandGroup heading="الإجراءات السريعة">
            <CommandItem onSelect={() => handleItemSelect('/')}>
              <Home className="mr-2 h-4 w-4" />
              <span>الصفحة الرئيسية</span>
              <Badge variant="outline" className="mr-auto">
                Ctrl+H
              </Badge>
            </CommandItem>
            
            {state.canGoBack && (
              <CommandItem onSelect={() => { goBack(); setCommandOpen(false); }}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>العودة للصفحة السابقة</span>
                <Badge variant="outline" className="mr-auto">
                  Alt+←
                </Badge>
              </CommandItem>
            )}
            
            {state.canGoForward && (
              <CommandItem onSelect={() => { goForward(); setCommandOpen(false); }}>
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>الانتقال للصفحة التالية</span>
                <Badge variant="outline" className="mr-auto">
                  Alt+→
                </Badge>
              </CommandItem>
            )}
          </CommandGroup>

          {/* Favorites */}
          {state.favoritePages.length > 0 && (
            <CommandGroup heading="المفضلة">
              {state.favoritePages.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem 
                    key={item.id}
                    onSelect={() => handleItemSelect(item.href)}
                  >
                    {Icon ? <Icon className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
                    <span>{item.title}</span>
                    {item.description && (
                      <span className="mr-2 text-sm text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Recent Pages */}
          {state.recentPages.length > 0 && (
            <CommandGroup heading="الصفحات الأخيرة">
              {state.recentPages.slice(0, 5).map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem 
                    key={item.id}
                    onSelect={() => handleItemSelect(item.href)}
                  >
                    {Icon ? <Icon className="mr-2 h-4 w-4" /> : <Clock className="mr-2 h-4 w-4" />}
                    <span>{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {/* Search Results or All Pages */}
          <CommandGroup heading={searchQuery ? "نتائج البحث" : "جميع الصفحات"}>
            {(searchResults.length > 0 ? searchResults : visibleNavItems.slice(0, 10)).map((item, index) => {
              const Icon = item.icon;
              return (
                <CommandItem 
                  key={item.id}
                  onSelect={() => handleItemSelect(item.href)}
                >
                  {Icon ? <Icon className="mr-2 h-4 w-4" /> : <div className="mr-2 h-4 w-4" />}
                  <span>{item.title}</span>
                  {item.description && (
                    <span className="mr-2 text-sm text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                  {!searchQuery && index < 9 && (
                    <Badge variant="outline" className="mr-auto">
                      Alt+{index + 1}
                    </Badge>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>

          {/* Keyboard Shortcuts Help */}
          <CommandGroup heading="اختصارات لوحة المفاتيح">
            <CommandItem onSelect={() => {}}>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Ctrl+K: فتح البحث السريع</span>
            </CommandItem>
            <CommandItem onSelect={() => {}}>
              <Command className="mr-2 h-4 w-4" />
              <span>Alt+1-9: الانتقال السريع للصفحات</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      
      {/* Floating shortcut indicator - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 right-4 z-40">
          <Badge 
            variant="outline" 
            className="bg-background/95 backdrop-blur-sm cursor-pointer hover:bg-accent"
            onClick={() => setCommandOpen(true)}
          >
            <Command className="h-3 w-3 mr-1" />
            Ctrl+K
          </Badge>
        </div>
      )}
    </>
  );
}