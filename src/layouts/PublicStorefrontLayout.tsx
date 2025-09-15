import React from 'react';

interface PublicStorefrontLayoutProps {
  children: React.ReactNode;
}

export const PublicStorefrontLayout = ({ children }: PublicStorefrontLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Clean layout with no auth components */}
      <main className="w-full">
        {children}
      </main>
      
      {/* Simple footer for storefront */}
      <footer className="bg-muted/50 border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 منصة الأفلييت الذكية - جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
};