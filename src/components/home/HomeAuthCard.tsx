import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, Sparkles } from 'lucide-react';
import { UnifiedButton } from '@/components/design-system';

interface HomeAuthCardProps {
  onNavigate: (path: string) => void;
}

export const HomeAuthCard: React.FC<HomeAuthCardProps> = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="text-center"
    >
      <div className="max-w-md mx-auto bg-card rounded-2xl border border-border/50 p-8">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-2">
          انضم إلى أتلانتس
        </h3>
        <p className="text-muted-foreground mb-6">
          سجل حساب جديد واستمتع بتجربة تسوق مميزة
        </p>

        <div className="space-y-3">
          <UnifiedButton 
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => onNavigate('/auth')}
          >
            <LogIn className="w-4 h-4 ml-2" />
            بدء رحلة التسوق
          </UnifiedButton>
          
          <UnifiedButton
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => onNavigate('/store/demo-store')}
          >
            جرب المتجر التجريبي
          </UnifiedButton>
        </div>

        {/* Features */}
        <div className="flex justify-center gap-6 mt-6 text-sm text-muted-foreground">
          <span>✓ تسوق آمن</span>
          <span>✓ شحن مجاني</span>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeAuthCard;
