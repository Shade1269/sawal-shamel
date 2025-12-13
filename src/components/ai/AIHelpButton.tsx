import React, { useState } from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AIHelpButtonProps {
  context: string;
  title?: string;
  className?: string;
}

export const AIHelpButton: React.FC<AIHelpButtonProps> = ({
  context,
  title,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    if (explanation) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-context-helper', {
        body: { context, title }
      });

      if (fnError) throw fnError;
      
      setExplanation(data?.explanation || 'لا توجد معلومات متاحة');
    } catch (err) {
      console.error('AI Help error:', err);
      setError('حدث خطأ في جلب المساعدة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !explanation) {
      fetchExplanation();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center justify-center',
            'h-4 w-4 rounded-full',
            'opacity-30 hover:opacity-100',
            'text-primary/70 hover:text-primary',
            'transition-all duration-300 ease-out',
            'hover:scale-125 hover:bg-primary/10',
            'focus:opacity-100 focus:outline-none',
            className
          )}
          title="مساعدة ذكية"
        >
          <Sparkles className="h-2.5 w-2.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-3 bg-card/95 backdrop-blur-sm border-border/50 shadow-xl rounded-xl"
        side="top"
        align="start"
        sideOffset={8}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-xs text-primary">مساعد AI</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 opacity-50 hover:opacity-100"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          </div>
          
          {title && (
            <h4 className="font-semibold text-foreground text-xs">{title}</h4>
          )}
          
          <div className="text-xs text-muted-foreground leading-relaxed">
            {isLoading ? (
              <div className="flex items-center gap-2 py-3 justify-center">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-xs">جاري التحليل...</span>
              </div>
            ) : error ? (
              <div className="text-destructive text-center py-2 text-xs">{error}</div>
            ) : (
              <p className="whitespace-pre-wrap">{explanation}</p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AIHelpButton;
