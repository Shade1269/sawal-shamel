import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function DashboardHeader({ 
  title, 
  subtitle, 
  icon, 
  children,
  className 
}: DashboardHeaderProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl p-6 mb-6",
      "bg-gradient-to-l from-primary/10 via-secondary/5 to-transparent",
      "border border-border/50",
      className
    )}>
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-primary/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
