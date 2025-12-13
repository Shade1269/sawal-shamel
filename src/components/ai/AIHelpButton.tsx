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
  size?: 'sm' | 'md';
}

export const AIHelpButton: React.FC<AIHelpButtonProps> = ({
  context,
  title,
  className,
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    if (explanation) return; // Already fetched
    
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

  const sizeClasses = size === 'sm' 
    ? 'h-5 w-5 p-0.5' 
    : 'h-6 w-6 p-1';

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            sizeClasses,
            'rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200',
            'hover:scale-110 active:scale-95',
            className
          )}
          title="مساعدة ذكية"
        >
          <Sparkles className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 bg-card border-border shadow-lg"
        side="top"
        align="start"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-foreground">مساعد AI</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {title && (
            <h4 className="font-semibold text-foreground text-sm">{title}</h4>
          )}
          
          <div className="text-sm text-muted-foreground leading-relaxed">
            {isLoading ? (
              <div className="flex items-center gap-2 py-4 justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>جاري التحليل...</span>
              </div>
            ) : error ? (
              <div className="text-destructive text-center py-2">{error}</div>
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
