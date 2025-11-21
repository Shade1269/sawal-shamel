import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateAffiliateStore } from '@/features/affiliate/components/CreateAffiliateStore';
import { AffiliateStoreManager } from '@/features/affiliate/components/AffiliateStoreManager';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Settings, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreThemeSelector } from '@/components/store/StoreThemeSelector';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/shared/components/DarkModeProvider';

const StoreSetup = () => {
  const navigate = useNavigate();
  const { store, isLoading } = useAffiliateStore();
  const { isDarkMode } = useDarkMode();

  // إذا كان لدى المستخدم متجر، انتقل مباشرة لصفحة الإعدادات
  useEffect(() => {
    if (store) {
      navigate('/affiliate/store/settings', { replace: true });
    }
  }, [store, navigate]);

  const handleStoreCreated = () => {
    // الانتقال لصفحة الإعدادات بعد إنشاء المتجر
    navigate('/affiliate/store/settings');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className={`transition-colors duration-500 ${
            isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
          }`}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن لدى المستخدم متجر، عرض شاشة إنشاء المتجر
  if (!store) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${
        isDarkMode 
          ? 'gradient-bg-muted'
          : 'gradient-bg-primary'
      }`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-10 w-10 text-primary" />
              </div>
              <h1 className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>إنشاء متجرك الإلكتروني</h1>
              <p className={`transition-colors duration-500 ${
                isDarkMode ? 'text-muted-foreground' : 'text-slate-600'
              }`}>
                ابدئي رحلتك في التسويق بالعمولة من خلال إنشاء متجرك الخاص
              </p>
            </div>
            
            <CreateAffiliateStore onStoreCreated={handleStoreCreated} />
          </div>
        </div>
      </div>
    );
  }

  // هذا الجزء لن يتم الوصول إليه لأن المستخدم سينتقل لصفحة الإعدادات
  return null;
};

export default StoreSetup;