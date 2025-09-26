import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export interface ActionBarProps {
  onCreate?: () => void;
  onQuickAction?: () => void;
  createLabel?: string;
  quickActionLabel?: string;
}

export const ActionBar: React.FC<ActionBarProps> = React.memo(
  ({
    onCreate,
    onQuickAction,
    createLabel = 'إنشاء',
    quickActionLabel = 'جديد'
  }) => {
    const reduceMotion = usePrefersReducedMotion();
    const motionClass = reduceMotion ? 'transition-none' : 'transition-colors duration-200';

    return (
      <div className="flex items-center gap-2" data-component="action-bar">
        <Button
          size="sm"
          onClick={onCreate}
          className={`bg-[color:var(--primary)] text-[color:var(--primary-fg)] border border-[color:var(--glass-border)] shadow-[var(--shadow-glass-soft)] hover:bg-[color:var(--primary)]/90 ${motionClass}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          <span className="ml-2">{createLabel}</span>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onQuickAction}
          className={`border-[color:var(--glass-border)] bg-[color:var(--glass-bg)] text-[color:var(--glass-fg)] hover:bg-[color:var(--glass-bg-strong, var(--surface-2))] ${motionClass}`}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          <span className="ml-2">{quickActionLabel}</span>
        </Button>
      </div>
    );
  }
);

ActionBar.displayName = 'ActionBar';

export default ActionBar;
