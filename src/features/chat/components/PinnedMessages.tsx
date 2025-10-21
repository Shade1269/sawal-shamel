import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Pin, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/hooks/useRealTimeChat';

interface PinnedMessagesProps {
  messages: Message[];
  onUnpin?: (messageId: string) => void;
  className?: string;
}

const PinnedMessages: React.FC<PinnedMessagesProps> = ({ messages, onUnpin, className }) => {
  const pinnedMessages = messages.filter(msg => msg.is_pinned);

  if (pinnedMessages.length === 0) {
    return (
      <div className={`p-4 text-center text-muted-foreground ${className}`}>
        <Pin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm arabic-text">لا توجد رسائل مثبتة</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Pin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold arabic-text">الرسائل المثبتة</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {pinnedMessages.length}
          </span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {pinnedMessages.map((msg) => (
            <div key={msg.id} className="group bg-accent/30 rounded-lg p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarImage src={msg.sender?.avatar_url} alt="Profile" />
                  <AvatarFallback className="text-xs">
                    {(msg.sender?.full_name || 'أ')[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium arabic-text">
                      {msg.sender?.full_name || 'مستخدم'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <p className="text-sm arabic-text leading-relaxed line-clamp-2">
                    {msg.content}
                  </p>
                </div>

                {onUnpin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUnpin(msg.id)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PinnedMessages;