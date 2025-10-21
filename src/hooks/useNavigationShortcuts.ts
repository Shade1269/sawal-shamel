import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFastAuth } from './useFastAuth';
import { toast } from '@/hooks/use-toast';

interface NavigationShortcut {
  keys: string[];
  action: () => void;
  description: string;
  category: string;
  roles?: string[];
}

export const useNavigationShortcuts = (
  onCommandPaletteToggle?: (open: boolean) => void
) => {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useFastAuth();
  const userRole = profile?.role;

  // Define shortcuts based on user role
  const getShortcuts = useCallback((): NavigationShortcut[] => {
    const baseShortcuts: NavigationShortcut[] = [
      {
        keys: ['cmd+k', 'ctrl+k'],
        action: () => onCommandPaletteToggle?.(true),
        description: 'فتح لوحة الأوامر',
        category: 'عام'
      },
      {
        keys: ['cmd+/', 'ctrl+/'],
        action: () => {
          toast({
            title: "اختصارات لوحة المفاتيح",
            description: "اضغط Cmd+K لفتح لوحة الأوامر"
          });
        },
        description: 'عرض المساعدة',
        category: 'عام'
      },
      {
        keys: ['esc'],
        action: () => window.history.back(),
        description: 'العودة للخلف',
        category: 'تنقل'
      },
      {
        keys: ['cmd+shift+p', 'ctrl+shift+p'],
        action: () => navigate('/profile'),
        description: 'الملف الشخصي',
        category: 'حساب'
      }
    ];

    // Admin shortcuts
    const adminShortcuts: NavigationShortcut[] = [
      {
        keys: ['cmd+shift+a', 'ctrl+shift+a'],
        action: () => navigate('/admin/dashboard'),
        description: 'لوحة الإدارة',
        category: 'إدارة',
        roles: ['admin']
      },
      {
        keys: ['cmd+shift+t', 'ctrl+shift+t'],
        action: () => navigate('/admin/analytics'),
        description: 'التحليلات',
        category: 'تقارير',
        roles: ['admin']
      },
      {
        keys: ['cmd+shift+o', 'ctrl+shift+o'],
        action: () => navigate('/admin/orders'),
        description: 'إدارة الطلبات',
        category: 'تجارة',
        roles: ['admin']
      },
      {
        keys: ['cmd+shift+i', 'ctrl+shift+i'],
        action: () => navigate('/admin/inventory'),
        description: 'إدارة المخزون',
        category: 'تجارة',
        roles: ['admin']
      }
    ];

    // Affiliate shortcuts
    const affiliateShortcuts: NavigationShortcut[] = [
      {
        keys: ['cmd+shift+d', 'ctrl+shift+d'],
        action: () => navigate('/affiliate'),
        description: 'لوحة المسوق',
        category: 'تسويق',
        roles: ['affiliate', 'marketer']
      },
      {
        keys: ['cmd+shift+r', 'ctrl+shift+r'],
        action: () => navigate('/affiliate/storefront'),
        description: 'واجهة المتجر',
        category: 'تسويق',
        roles: ['affiliate', 'marketer']
      },
      {
        keys: ['cmd+shift+e', 'ctrl+shift+e'],
        action: () => navigate('/affiliate/orders'),
        description: 'طلباتي',
        category: 'تسويق',
        roles: ['affiliate', 'marketer']
      },
      {
        keys: ['cmd+shift+c', 'ctrl+shift+c'],
        action: () => navigate('/affiliate/analytics'),
        description: 'التحليلات',
        category: 'مالية',
        roles: ['affiliate', 'marketer']
      }
    ];

    // Quick navigation shortcuts
    const quickShortcuts: NavigationShortcut[] = [
      {
        keys: ['cmd+1', 'ctrl+1'],
        action: () => {
          if (userRole === 'admin') navigate('/admin/dashboard');
          else if (userRole === 'affiliate' || userRole === 'marketer') navigate('/affiliate');
          else navigate('/');
        },
        description: 'الصفحة الرئيسية',
        category: 'تنقل سريع'
      },
      {
        keys: ['cmd+2', 'ctrl+2'],
        action: () => {
          if (userRole === 'admin') navigate('/admin/orders');
          else if (userRole === 'affiliate' || userRole === 'marketer') navigate('/affiliate/storefront');
        },
        description: 'الصفحة الثانية',
        category: 'تنقل سريع'
      },
      {
        keys: ['cmd+3', 'ctrl+3'],
        action: () => {
          if (userRole === 'admin') navigate('/admin/analytics');
          else if (userRole === 'affiliate' || userRole === 'marketer') navigate('/affiliate/orders');
        },
        description: 'الصفحة الثالثة',
        category: 'تنقل سريع'
      }
    ];

    let allShortcuts = [...baseShortcuts, ...quickShortcuts];
    
    if (userRole === 'admin') {
      allShortcuts.push(...adminShortcuts);
    } else if (userRole === 'affiliate') {
      allShortcuts.push(...affiliateShortcuts);
    }

    // Filter by role access
    return allShortcuts.filter(shortcut => 
      !shortcut.roles || shortcut.roles.includes(userRole || '')
    );
  }, [navigate, userRole, onCommandPaletteToggle]);

  const shortcuts = getShortcuts();

  // Normalize key combinations
  const normalizeKey = (key: string): string => {
    return key
      .toLowerCase()
      .replace('meta', 'cmd')
      .replace('control', 'ctrl')
      .replace('command', 'cmd');
  };

  // Check if key combination matches
  const matchesShortcut = (event: KeyboardEvent, shortcutKeys: string[]): boolean => {
    return shortcutKeys.some(combo => {
      const keys = combo.split('+').map(normalizeKey);
      const hasCmd = keys.includes('cmd') && (event.metaKey || event.ctrlKey);
      const hasShift = keys.includes('shift') && event.shiftKey;
      const hasAlt = keys.includes('alt') && event.altKey;
      const mainKey = keys.find(k => !['cmd', 'ctrl', 'shift', 'alt'].includes(k));
      
      if (keys.includes('esc')) {
        return event.key === 'Escape';
      }

      if (!mainKey) return false;

      const keyMatches = normalizeKey(event.key) === mainKey;
      const modifiersMatch = 
        (keys.includes('cmd') ? (event.metaKey || event.ctrlKey) : !event.metaKey && !event.ctrlKey) &&
        (keys.includes('shift') ? event.shiftKey : !event.shiftKey) &&
        (keys.includes('alt') ? event.altKey : !event.altKey);

      return keyMatches && modifiersMatch;
    });
  };

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if user is typing in an input field
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.getAttribute('role') === 'textbox'
    ) {
      // Only allow global shortcuts in input fields
      if (!event.metaKey && !event.ctrlKey) return;
    }

    // Find matching shortcut
    const matchedShortcut = shortcuts.find(shortcut => 
      matchesShortcut(event, shortcut.keys)
    );

    if (matchedShortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      // Check authentication for protected shortcuts
      if (matchedShortcut.roles && !isAuthenticated) {
        toast({
          title: "تسجيل الدخول مطلوب",
          description: "يجب تسجيل الدخول للوصول لهذه الميزة"
        });
        return;
      }
      
      matchedShortcut.action();
    }
  }, [shortcuts, isAuthenticated]);

  // Set up event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Get shortcuts for help display
  const getShortcutsByCategory = () => {
    const categories: Record<string, NavigationShortcut[]> = {};
    
    shortcuts.forEach(shortcut => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push(shortcut);
    });
    
    return categories;
  };

  return {
    shortcuts,
    getShortcutsByCategory,
    handleKeyDown
  };
};