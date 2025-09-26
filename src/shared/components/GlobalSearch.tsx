import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { useFastAuth } from '@/hooks/useFastAuth';

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { profile } = useFastAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const searchItems = [
    // Common pages
    { title: 'الصفحة الرئيسية', url: '/', category: 'صفحات' },
    { title: 'الملف الشخصي', url: '/profile', category: 'صفحات' },
    { title: 'عربة التسوق', url: '/cart', category: 'تسوق' },
    { title: 'إتمام الطلب', url: '/checkout', category: 'تسوق' },
    { title: 'تأكيد الطلب', url: '/order/confirmation', category: 'تسوق' },

    // Analytics
    { title: 'لوحة تحليلات الإدارة', url: '/admin/analytics', category: 'تحليلات', roles: ['admin'] },
    { title: 'تحليلات المسوق', url: '/affiliate/analytics', category: 'تحليلات', roles: ['affiliate', 'marketer', 'admin'] },

    // Admin pages
    { title: 'لوحة الإدارة', url: '/admin/dashboard', category: 'إدارة', roles: ['admin'] },
    { title: 'إدارة الطلبات', url: '/admin/orders', category: 'إدارة', roles: ['admin'] },
    { title: 'إدارة المخزون', url: '/admin/inventory', category: 'إدارة', roles: ['admin'] },

    // Affiliate pages
    { title: 'لوحة المسوق', url: '/affiliate', category: 'تسويق', roles: ['affiliate', 'marketer', 'admin'] },
    { title: 'واجهة المتجر', url: '/affiliate/storefront', category: 'تسويق', roles: ['affiliate', 'marketer', 'admin'] },
    { title: 'طلبات المسوق', url: '/affiliate/orders', category: 'تسويق', roles: ['affiliate', 'marketer', 'admin'] },
  ];

  const filteredItems = searchItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.category.toLowerCase().includes(search.toLowerCase());
    
    const hasPermission = !item.roles || 
                         item.roles.includes(profile?.role || '') ||
                         profile?.role === 'admin';
    
    return matchesSearch && hasPermission;
  });

  const groupedItems = filteredItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, typeof filteredItems>);

  const handleSelect = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">بحث سريع...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="ابحث في النظام..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>لا توجد نتائج</CommandEmpty>
          {Object.entries(groupedItems).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.url}
                  value={item.title}
                  onSelect={() => handleSelect(item.url)}
                  className="cursor-pointer"
                >
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;