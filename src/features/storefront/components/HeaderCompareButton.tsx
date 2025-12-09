import React from 'react';
import { GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeaderCompareButtonProps {
  count: number;
  onClick: () => void;
  className?: string;
}

export const HeaderCompareButton: React.FC<HeaderCompareButtonProps> = ({
  count,
  onClick,
  className
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        'relative p-2.5 rounded-lg transition-colors hover:bg-secondary/50',
        className
      )}
    >
      <GitCompare className="w-6 h-6 text-foreground/70" />
      {count > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-500 text-white border-0"
        >
          {count > 4 ? '4' : count}
        </Badge>
      )}
    </Button>
  );
};
