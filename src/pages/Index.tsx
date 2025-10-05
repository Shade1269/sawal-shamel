import React from 'react';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Floating Damascus decorative elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-persian opacity-12 rounded-full blur-2xl animate-persian-float pointer-events-none"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-luxury opacity-18 rounded-full blur-xl animate-persian-float pointer-events-none" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-primary opacity-10 rounded-full blur-3xl animate-persian-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-premium opacity-15 rounded-full blur-2xl animate-damascus-float pointer-events-none" style={{ animationDelay: '3s' }}></div>
        
        {/* Heritage arabesque patterns */}
        <div className="absolute top-0 left-0 w-full h-32 opacity-8 bg-gradient-to-r from-transparent via-persian to-transparent animate-heritage-wave pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 opacity-8 bg-gradient-to-r from-transparent via-primary to-transparent animate-heritage-wave pointer-events-none" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-persian bg-clip-text text-transparent">
          منصة أتلانتس للتجارة الإلكترونية
        </h1>
      </div>
    </div>
  );
};

export default Index;
