import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { UnifiedButton } from '@/components/design-system';

interface HomeFeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradientClass?: string;
  buttonText: string;
  buttonVariant?: 'primary' | 'secondary' | 'luxury' | 'premium' | 'success' | 'outline' | 'ghost';
  onClick: () => void;
  badge?: {
    color: 'success' | 'warning' | 'danger' | 'info' | string;
    pulse?: boolean;
  };
  children?: React.ReactNode;
}

export const HomeFeatureCard = ({
  title,
  description,
  icon: Icon,
  buttonText,
  buttonVariant = 'primary',
  onClick,
  badge,
  children
}: HomeFeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-card rounded-xl border border-border/50 p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    >
      {/* Icon Container */}
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors relative">
        <Icon className="w-7 h-7 text-primary" />
        {badge && (
          <span 
            className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-${badge.color} ${badge.pulse ? 'animate-pulse' : ''}`}
          />
        )}
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>

      {children}

      {/* Action Button */}
      <UnifiedButton
        variant={buttonVariant}
        size="sm"
        onClick={onClick}
        className="w-full mt-4"
      >
        {buttonText}
      </UnifiedButton>
    </motion.div>
  );
};

export default HomeFeatureCard;
