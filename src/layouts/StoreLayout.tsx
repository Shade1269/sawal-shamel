import { ReactNode } from 'react';
import { CustomerAuthProvider } from '@/contexts/CustomerAuthContext';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';

interface StoreLayoutProps {
  children: ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
  return (
    <CustomerAuthProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <StoreHeader />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
        
        <StoreFooter />
      </div>
    </CustomerAuthProvider>
  );
};

export default StoreLayout;