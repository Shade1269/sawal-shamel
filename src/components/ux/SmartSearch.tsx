import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Clock,
  Zap,
  ArrowRight,
  Hash,
  FileText,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Star,
  Filter,
  Command,
  ArrowUpDown,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFastAuth } from '@/hooks/useFastAuth';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'pages' | 'users' | 'products' | 'orders' | 'settings' | 'help';
  url: string;
  icon: any;
  tags: string[];
  priority: number;
  lastAccessed?: Date;
  accessCount?: number;
}

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
}

const categoryIcons = {
  pages: FileText,
  users: Users,
  products: Package,
  orders: ShoppingCart,
  settings: Settings,
  help: Star
};

const categoryLabels = {
  pages: 'الصفحات',
  users: 'المستخدمين',
  products: 'المنتجات',
  orders: 'الطلبات',
  settings: 'الإعدادات',
  help: 'المساعدة'
};

export function SmartSearch({ isOpen, onClose, placeholder = "البحث في كل شيء..." }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { profile } = useFastAuth();
  const navigate = useNavigate();

  // قاعدة بيانات البحث المحاكية
  const searchDatabase = useMemo((): SearchResult[] => {
    const baseResults: SearchResult[] = [
      // الصفحات
      {
        id: '1',
        title: 'لوحة التحكم الرئيسية',
        description: 'نظرة عامة على الإحصائيات والأداء',
        category: 'pages',
        url: '/affiliate',
        icon: BarChart3,
        tags: ['dashboard', 'home', 'لوحة', 'رئيسية', 'إحصائيات'],
        priority: 10
      },
      {
        id: '2',
        title: 'واجهة المتجر',
        description: 'إدارة إعدادات المتجر وروابطه',
        category: 'pages',
        url: '/affiliate/storefront',
        icon: Package,
        tags: ['products', 'منتجات', 'إدارة', 'كتالوج'],
        priority: 9
      },
      {
        id: '3',
        title: 'إدارة الطلبات',
        description: 'متابعة ومعالجة الطلبات',
        category: 'pages',
        url: '/affiliate/orders',
        icon: ShoppingCart,
        tags: ['orders', 'طلبات', 'مبيعات', 'متابعة'],
        priority: 9
      },
      {
        id: '4',
        title: 'التحليلات والتقارير',
        description: 'تقارير مفصلة وتحليل البيانات',
        category: 'pages',
        url: '/affiliate/analytics',
        icon: BarChart3,
        tags: ['analytics', 'تحليلات', 'تقارير', 'بيانات'],
        priority: 8
      },
      {
        id: '5',
        title: 'الإعدادات العامة',
        description: 'إعدادات النظام والحساب',
        category: 'settings',
        url: '/settings',
        icon: Settings,
        tags: ['settings', 'إعدادات', 'نظام', 'حساب'],
        priority: 7
      },
      // المنتجات (مثال)
      {
        id: '10',
        title: 'iPhone 15 Pro',
        description: 'هاتف ذكي متطور من Apple',
        category: 'products',
        url: '/products/iphone-15-pro',
        icon: Package,
        tags: ['iphone', 'apple', 'هاتف', 'ذكي', 'جوال'],
        priority: 6
      },
      {
        id: '11',
        title: 'Samsung Galaxy S24',
        description: 'هاتف Android عالي الأداء',
        category: 'products',
        url: '/products/galaxy-s24',
        icon: Package,
        tags: ['samsung', 'galaxy', 'android', 'هاتف'],
        priority: 6
      },
      // المستخدمين
      {
        id: '20',
        title: 'العملاء النشطين',
        description: 'قائمة العملاء الذين تفاعلوا مؤخراً',
        category: 'users',
        url: '/customers/active',
        icon: Users,
        tags: ['customers', 'عملاء', 'نشطين', 'تفاعل'],
        priority: 5
      }
    ];

    // تخصيص النتائج حسب دور المستخدم
    if (profile?.role === 'admin') {
      baseResults.push(
        {
          id: '30',
          title: 'لوحة تحكم الإدارة',
          description: 'مؤشرات الأداء والأنشطة الأخيرة',
          category: 'pages',
          url: '/admin/dashboard',
          icon: Crown,
          tags: ['admin', 'dashboard', 'إدارة', 'لوحة'],
          priority: 10
        },
        {
          id: '31',
          title: 'طلبات العملاء',
          description: 'متابعة الطلبات ومعالجتها',
          category: 'orders',
          url: '/admin/orders',
          icon: ShoppingCart,
          tags: ['orders', 'طلبات', 'مبيعات', 'إدارة'],
          priority: 9
        },
        {
          id: '32',
          title: 'مركز المخزون',
          description: 'إدارة مستويات وتوفر المنتجات',
          category: 'products',
          url: '/admin/inventory',
          icon: Package,
          tags: ['inventory', 'مخزون', 'منتجات', 'مستودع'],
          priority: 8
        },
        {
          id: '33',
          title: 'تحليلات الإدارة',
          description: 'تقارير الأداء والتحليلات المالية',
          category: 'products',
          url: '/admin/analytics',
          icon: BarChart3,
          tags: ['analytics', 'تقارير', 'تحليلات', 'بيانات'],
          priority: 7
        }
      );
    }

    return baseResults;
  }, [profile?.role]);

  // البحث المتقدم
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // محاكاة تأخير البحث
    setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      const searchResults = searchDatabase
        .filter(item => {
          // البحث في العنوان والوصف والتاجز
          const searchFields = [
            item.title.toLowerCase(),
            item.description.toLowerCase(),
            ...item.tags.map(tag => tag.toLowerCase())
          ].join(' ');
          
          // البحث بالكلمات المفردة
          const queryWords = query.split(' ');
          return queryWords.some(word => searchFields.includes(word));
        })
        .filter(item => {
          // تطبيق الفلتر
          if (activeFilter === 'all') return true;
          return item.category === activeFilter;
        })
        .sort((a, b) => {
          // ترتيب حسب الأولوية والصلة
          const aRelevance = calculateRelevance(a, query);
          const bRelevance = calculateRelevance(b, query);
          
          if (aRelevance !== bRelevance) {
            return bRelevance - aRelevance;
          }
          
          return b.priority - a.priority;
        })
        .slice(0, 10); // أول 10 نتائج

      setResults(searchResults);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 200);
  }, [searchDatabase, activeFilter]);

  // حساب مدى الصلة
  const calculateRelevance = (item: SearchResult, query: string): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // مطابقة العنوان
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // مطابقة الوصف
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // مطابقة التاجز
    item.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        score += 3;
      }
    });
    
    // مكافأة للعناصر التي تم الوصول إليها مؤخراً
    if (item.lastAccessed) {
      const daysSinceAccess = (Date.now() - item.lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 1) score += 2;
      else if (daysSinceAccess < 7) score += 1;
    }
    
    return score;
  };

  // معالجة البحث
  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  // معالجة لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // التعامل مع النقر على النتيجة
  const handleResultClick = (result: SearchResult) => {
    // إضافة إلى البحثات الأخيرة
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
      return updated;
    });

    // في التطبيق الحقيقي، سيتم تسجيل الوصول في قاعدة البيانات

    navigate(result.url);
    onClose();
  };

  // تحميل البحثات الأخيرة
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // مسح البحث
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  };

  const filters = [
    { key: 'all', label: 'الكل', icon: Search },
    { key: 'pages', label: 'الصفحات', icon: FileText },
    { key: 'products', label: 'المنتجات', icon: Package },
    { key: 'users', label: 'المستخدمين', icon: Users },
    { key: 'orders', label: 'الطلبات', icon: ShoppingCart },
    { key: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="border-b">
          <div className="flex items-center gap-3 p-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="border-0 focus-visible:ring-0 text-lg"
              autoFocus
            />
            {query && (
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                <span className="sr-only">مسح</span>
                ✕
              </Button>
            )}
          </div>
          
          {/* الفلاتر */}
          <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
            {filters.map(filter => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.key}
                  variant={activeFilter === filter.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.key)}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <Icon className="h-3 w-3" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="max-h-96 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2">
              {/* النتائج */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    {results.map((result, index) => {
                      const Icon = result.icon;
                      const CategoryIcon = categoryIcons[result.category];
                      const isSelected = index === selectedIndex;
                      
                      return (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                          )}
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex-shrink-0">
                            <div className="p-2 rounded-md bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{result.title}</p>
                              <Badge variant="secondary" className="text-xs">
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {categoryLabels[result.category]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </p>
                            
                            {result.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {result.tags.slice(0, 3).map(tag => (
                                  <span 
                                    key={tag}
                                    className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* حالة التحميل */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    جاري البحث...
                  </div>
                </div>
              )}

              {/* لا توجد نتائج */}
              {!isLoading && query && results.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">لا توجد نتائج</h3>
                  <p className="text-sm text-muted-foreground">
                    لم نجد أي نتائج لـ "{query}"
                  </p>
                </div>
              )}

              {/* البحثات الأخيرة */}
              {!query && recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      البحثات الأخيرة
                    </span>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 w-full text-left"
                      onClick={() => setQuery(search)}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* نصائح البحث */}
              {!query && recentSearches.length === 0 && (
                <div className="space-y-3 px-2 py-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">نصائح البحث</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• ابحث عن الصفحات والمنتجات والطلبات</p>
                    <p>• استخدم الكلمات المفتاحية بالعربية أو الإنجليزية</p>
                    <p>• جرب الفلاتر لتضييق النتائج</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* شريط الاختصارات */}
        <div className="border-t bg-muted/30 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-background border rounded">↓</kbd>
                للتنقل
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded">Enter</kbd>
                للاختيار
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded">Esc</kbd>
                للإغلاق
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              بحث ذكي
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}