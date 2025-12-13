import { useFastAuth } from '@/hooks/useFastAuth';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface WelcomeCardProps {
  storeName?: string;
  className?: string;
}

export function WelcomeCard({ storeName, className }: WelcomeCardProps) {
  const { profile } = useFastAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء الخير';
  };

  const displayName = profile?.full_name || 'مرحباً';

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 md:p-8",
      "bg-gradient-to-l from-primary via-primary/90 to-primary/80",
      "border border-primary/20",
      "shadow-xl shadow-primary/20",
      className
    )}>
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-4 left-4 w-32 h-32 border-2 border-white/30 rounded-full" />
        <div className="absolute bottom-4 right-4 w-48 h-48 border-2 border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-white/20 rounded-full" />
      </div>
      
      {/* Sparkle decoration */}
      <div className="absolute top-6 left-6">
        <Sparkles className="h-6 w-6 text-white/30 animate-pulse" />
      </div>
      
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-primary-foreground/80 text-sm font-medium">
            {getGreeting()} 👋
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
            {displayName}
          </h2>
          {storeName && (
            <p className="text-primary-foreground/70 text-sm">
              متجرك: <span className="font-semibold text-primary-foreground">{storeName}</span>
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
            asChild
          >
            <Link to="/affiliate/storefront">
              <span>معاينة المتجر</span>
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
