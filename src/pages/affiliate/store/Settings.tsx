import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAffiliateStore } from '@/hooks/useAffiliateStore';
import { AffiliateStoreManager } from '@/features/affiliate/components/AffiliateStoreManager';
import { useDarkMode } from '@/shared/components/DarkModeProvider';

const AffiliateStoreSettingsPage = () => {
  const { store, isLoading, updateStore } = useAffiliateStore();
  const { isDarkMode } = useDarkMode();

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

  if (!store) {
    return <Navigate to="/affiliate/store/setup" replace />;
  }

  return (
    <div data-page="store-settings" className="min-h-screen">
      <AffiliateStoreManager
        store={store}
        onUpdateStore={(data) => updateStore({ storeId: store.id, updates: data })}
      />
    </div>
  );
};

export default AffiliateStoreSettingsPage;