import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdvancedThemeStudioButtonProps {
  storeId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const AdvancedThemeStudioButton: React.FC<AdvancedThemeStudioButtonProps> = ({
  storeId,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const url = storeId 
      ? `/theme-studio?storeId=${storeId}`
      : '/theme-studio';
    navigate(url);
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={`bg-gradient-premium hover:opacity-90 transition-opacity ${className}`}
    >
      <Sparkles className="w-4 h-4 mr-2" />
      الاستوديو المتقدم
    </Button>
  );
};