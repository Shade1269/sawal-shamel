import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

interface TabletDrawerProps {
  className?: string;
}

export function TabletDrawer({ className }: TabletDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("tablet-drawer", className)}>
      {/* Collapsed Sidebar - Always visible */}
      <div className="w-14 bg-card border-r flex flex-col items-center py-4 space-y-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 w-10 h-10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          
          <SheetContent 
            side="left" 
            className="p-0 w-64"
          >
            {/* Full Sidebar Content */}
            <div className="h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
                  منصة الأفيليت
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Sidebar Content */}
              <div className="flex-1">
                <AppSidebar />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Quick Action Icons - Always visible */}
        <div className="flex flex-col space-y-2">
          <Button variant="ghost" size="sm" className="p-2 w-10 h-10">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
          </Button>
          <Button variant="ghost" size="sm" className="p-2 w-10 h-10">
            <div className="w-2 h-2 bg-muted rounded-full"></div>
          </Button>
          <Button variant="ghost" size="sm" className="p-2 w-10 h-10">
            <div className="w-2 h-2 bg-muted rounded-full"></div>
          </Button>
        </div>
      </div>
    </div>
  );
}