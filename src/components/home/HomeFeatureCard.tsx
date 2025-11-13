import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { UnifiedCard, UnifiedCardHeader, UnifiedCardTitle, UnifiedCardDescription, UnifiedCardContent } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';

interface HomeFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradientClass: string;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'luxury' | 'premium' | 'success';
  onClick: () => void;
  badge?: {
    color: string;
    pulse?: boolean;
  };
  children?: React.ReactNode;
}

export const HomeFeatureCard = ({
  title,
  description,
  icon: Icon,
  gradientClass,
  buttonText,
  buttonVariant,
  onClick,
  badge,
  children
}: HomeFeatureCardProps) => {
  return (
    <UnifiedCard variant="glass" hover="lift" onClick={onClick} className="group">
      <UnifiedCardHeader className="text-center">
        <div className={`mx-auto w-24 h-24 ${gradientClass} rounded-3xl flex items-center justify-center mb-6 shadow-soft interactive-scale-110 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-hover opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Icon className="h-12 w-12 text-primary-foreground relative z-10" />
          {badge && (
            <>
              <div className={`absolute -top-1 -right-1 w-4 h-4 bg-${badge.color} rounded-full ${badge.pulse ? 'animate-ping' : ''}`}></div>
              <div className={`absolute -top-1 -right-1 w-4 h-4 bg-${badge.color} rounded-full`}></div>
            </>
          )}
        </div>
        <UnifiedCardTitle className="text-2xl gradient-text premium-text">
          {title}
        </UnifiedCardTitle>
        <UnifiedCardDescription className="text-lg elegant-text">
          {description}
        </UnifiedCardDescription>
      </UnifiedCardHeader>
      <UnifiedCardContent className="text-center space-y-3">
        {children}
        <UnifiedButton 
          variant={buttonVariant}
          size="lg" 
          className="w-full"
        >
          {buttonText}
        </UnifiedButton>
      </UnifiedCardContent>
    </UnifiedCard>
  );
};
