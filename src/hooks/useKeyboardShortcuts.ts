import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'interface' | 'custom';
  global?: boolean; // يعمل في كل الصفحات
}

interface KeyboardShortcutsProps {
  onSearchOpen?: () => void;
  onCommandPaletteOpen?: () => void;
  onSettingsOpen?: () => void;
  onNotificationsOpen?: () => void;
  customShortcuts?: ShortcutConfig[];
}

export function useKeyboardShortcuts({
  onSearchOpen,
  onCommandPaletteOpen,
  onSettingsOpen, 
  onNotificationsOpen,
  customShortcuts = []
}: KeyboardShortcutsProps = {}) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [shortcuts, setShortcuts] = useState<ShortcutConfig[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // تعريف الاختصارات الافتراضية
  const defaultShortcuts: ShortcutConfig[] = [
    // Navigation
    {
      key: 'h',
      ctrlKey: true,
      description: 'الانتقال للصفحة الرئيسية',
      action: () => navigate('/'),
      category: 'navigation',
      global: true
    },
    {
      key: 'p',
      ctrlKey: true,
      description: 'واجهة المتجر للمسوق',
      action: () => navigate('/affiliate/storefront'),
      category: 'navigation',
      global: true
    },
    {
      key: 'o',
      ctrlKey: true,
      description: 'متابعة الطلبات',
      action: () => navigate('/affiliate/orders'),
      category: 'navigation',
      global: true
    },
    {
      key: 'a',
      ctrlKey: true,
      description: 'لوحة التحليلات',
      action: () => navigate('/affiliate/analytics'),
      category: 'navigation',
      global: true
    },
    {
      key: 's',
      ctrlKey: true,
      description: 'الإعدادات',
      action: () => {
        if (onSettingsOpen) {
          onSettingsOpen();
        } else {
          navigate('/settings');
        }
      },
      category: 'navigation',
      global: true
    },

    // Search & Interface
    {
      key: 'k',
      ctrlKey: true,
      description: 'فتح البحث الذكي',
      action: () => {
        if (onSearchOpen) {
          onSearchOpen();
        } else {
          toast({
            title: "البحث الذكي",
            description: "استخدم Ctrl+K لفتح البحث"
          });
        }
      },
      category: 'interface',
      global: true
    },
    {
      key: 'j',
      ctrlKey: true,
      description: 'فتح لوحة الأوامر',
      action: () => {
        if (onCommandPaletteOpen) {
          onCommandPaletteOpen();
        } else {
          toast({
            title: "لوحة الأوامر",
            description: "استخدم Ctrl+J لفتح لوحة الأوامر"
          });
        }
      },
      category: 'interface',
      global: true
    },
    {
      key: 'n',
      ctrlKey: true,
      description: 'الإشعارات',
      action: () => {
        if (onNotificationsOpen) {
          onNotificationsOpen();
        } else {
          toast({
            title: "الإشعارات",
            description: "استخدم Ctrl+N لفتح الإشعارات"
          });
        }
      },
      category: 'interface',
      global: true
    },

    // Quick Actions
    {
      key: 'r',
      ctrlKey: true,
      description: 'تحديث الصفحة',
      action: () => {
        window.location.reload();
      },
      category: 'actions',
      global: true
    },
    {
      key: 'Enter',
      ctrlKey: true,
      description: 'حفظ (إذا كان متاح)',
      action: () => {
        // البحث عن أزرار الحفظ وتنفيذها
        const saveButtons = document.querySelectorAll('[data-save-button], button[type="submit"]');
        if (saveButtons.length > 0) {
          (saveButtons[0] as HTMLButtonElement).click();
        } else {
          toast({
            title: "لا يوجد إجراء للحفظ",
            description: "لا توجد عناصر قابلة للحفظ في هذه الصفحة"
          });
        }
      },
      category: 'actions',
      global: true
    },

    // Interface Controls
    {
      key: '/',
      description: 'عرض اختصارات المفاتيح',
      action: () => {
        showShortcutsHelp();
      },
      category: 'interface',
      global: true
    },
    {
      key: 'Escape',
      description: 'إغلاق النوافذ المنبثقة',
      action: () => {
        // إغلاق أي dialog أو modal مفتوح
        const closeButtons = document.querySelectorAll('[data-close-button], [aria-label="Close"]');
        if (closeButtons.length > 0) {
          (closeButtons[0] as HTMLButtonElement).click();
        }
        
        // إزالة focus من العناصر النشطة
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      },
      category: 'interface',
      global: true
    },

    // Development shortcuts (only in development)
    ...(process.env.NODE_ENV === 'development' ? [
      {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        description: 'فتح أدوات المطور',
        action: () => {
          // فتح أدوات المطور (إذا كانت متاحة)
          // يمكن إضافة أدوات التطوير هنا
        },
        category: 'custom' as const,
        global: true
      }
    ] : [])
  ];

  // دمج الاختصارات
  useEffect(() => {
    const allShortcuts = [...defaultShortcuts, ...customShortcuts];
    setShortcuts(allShortcuts);
  }, [customShortcuts]);

  // عرض مساعدة الاختصارات
  const showShortcutsHelp = useCallback(() => {
    const shortcutGroups = shortcuts.reduce((groups, shortcut) => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = [];
      }
      groups[shortcut.category].push(shortcut);
      return groups;
    }, {} as Record<string, ShortcutConfig[]>);

    const categoryLabels = {
      navigation: 'التنقل',
      actions: 'الإجراءات',
      interface: 'الواجهة',
      custom: 'مخصص'
    };

    let helpText = 'اختصارات المفاتيح المتاحة:\n\n';
    
    Object.entries(shortcutGroups).forEach(([category, categoryShortcuts]) => {
      helpText += `${categoryLabels[category as keyof typeof categoryLabels] || category}:\n`;
      categoryShortcuts.forEach(shortcut => {
        const keys = [];
        if (shortcut.ctrlKey) keys.push('Ctrl');
        if (shortcut.shiftKey) keys.push('Shift');
        if (shortcut.altKey) keys.push('Alt');
        if (shortcut.metaKey) keys.push('Meta');
        keys.push(shortcut.key.toUpperCase());
        
        helpText += `  ${keys.join(' + ')}: ${shortcut.description}\n`;
      });
      helpText += '\n';
    });

    // عرض التوست
    toast({
      title: "اختصارات المفاتيح",
      description: "اضغط '/' لعرض قائمة الاختصارات المتاحة"
    });
  }, [shortcuts, toast]);

  // معالجة ضغط المفاتيح
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // تجاهل الاختصارات إذا كان المستخدم يكتب في input أو textarea
    const activeElement = document.activeElement;
    const isInputActive = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    );

    // السماح ببعض الاختصارات حتى لو كان input نشط
    const allowedInInput = ['Escape', '/', 'F1'];
    if (isInputActive && !allowedInInput.includes(event.key)) {
      return;
    }

    // البحث عن الاختصار المطابق
    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.metaKey === event.metaKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        matchingShortcut.action();
      } catch (error) {
        console.error('Error executing shortcut:', error);
        toast({
          title: "خطأ في الاختصار",
          description: "حدث خطأ أثناء تنفيذ الاختصار",
          variant: "destructive"
        });
      }
    }
  }, [isEnabled, shortcuts, toast]);

  // تسجيل مستمع الأحداث
  useEffect(() => {
    if (!isEnabled) return;

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, isEnabled]);

  // إضافة اختصار جديد
  const addShortcut = useCallback((shortcut: ShortcutConfig) => {
    setShortcuts(prev => [...prev, shortcut]);
  }, []);

  // إزالة اختصار
  const removeShortcut = useCallback((key: string, modifiers: Partial<Pick<ShortcutConfig, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>> = {}) => {
    setShortcuts(prev => prev.filter(s => 
      !(s.key === key && 
        !!s.ctrlKey === !!modifiers.ctrlKey &&
        !!s.altKey === !!modifiers.altKey &&
        !!s.shiftKey === !!modifiers.shiftKey &&
        !!s.metaKey === !!modifiers.metaKey)
    ));
  }, []);

  // تفعيل/إلغاء تفعيل الاختصارات
  const toggleShortcuts = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    
    toast({
      title: enabled ? "تم تفعيل الاختصارات" : "تم إلغاء تفعيل الاختصارات",
      description: enabled ? "اضغط '/' لعرض قائمة الاختصارات" : "تم إيقاف جميع اختصارات المفاتيح"
    });
  }, [toast]);

  // الحصول على اختصار معين
  const getShortcut = useCallback((key: string, modifiers: Partial<Pick<ShortcutConfig, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>> = {}) => {
    return shortcuts.find(s => 
      s.key === key && 
      !!s.ctrlKey === !!modifiers.ctrlKey &&
      !!s.altKey === !!modifiers.altKey &&
      !!s.shiftKey === !!modifiers.shiftKey &&
      !!s.metaKey === !!modifiers.metaKey
    );
  }, [shortcuts]);

  // تنفيذ اختصار برمجياً
  const executeShortcut = useCallback((key: string, modifiers: Partial<Pick<ShortcutConfig, 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey'>> = {}) => {
    const shortcut = getShortcut(key, modifiers);
    if (shortcut) {
      shortcut.action();
      return true;
    }
    return false;
  }, [getShortcut]);

  return {
    shortcuts,
    isEnabled,
    addShortcut,
    removeShortcut,
    toggleShortcuts,
    getShortcut,
    executeShortcut,
    showShortcutsHelp
  };
}