import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreadReplyProps {
  replyToMessage?: {
    id: string;
    content: string;
    sender?: {
      full_name?: string;
    };
  };
  onRemove?: () => void;
  className?: string;
}

const ThreadReply: React.FC<ThreadReplyProps> = ({ replyToMessage, onRemove, className }) => {
  if (!replyToMessage) return null;

  return (
    <div className={cn("bg-accent/20 border-r-2 border-primary rounded-lg p-3 mb-3", className)}>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary arabic-text">
          رد على {replyToMessage.sender?.full_name || 'مستخدم'}
        </span>
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 w-6 p-0 mr-auto"
          >
            ×
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground arabic-text truncate">
          {replyToMessage.content.length > 50 
            ? `${replyToMessage.content.substring(0, 50)}...` 
            : replyToMessage.content
          }
        </p>
      </div>
    </div>
  );
};

export default ThreadReply;