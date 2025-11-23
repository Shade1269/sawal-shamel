import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

/**
 * مكون زر الرسائل الجديدة
 * New messages scroll button component
 */

interface NewMessageButtonProps {
  hasNewMessages: boolean;
  isAtBottom: boolean;
  unreadCount: number;
  onScrollToBottom: () => void;
}

export function NewMessageButton({
  hasNewMessages,
  isAtBottom,
  unreadCount,
  onScrollToBottom,
}: NewMessageButtonProps) {
  if (!hasNewMessages || isAtBottom) {
    return null;
  }

  return (
    <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <Button
        onClick={onScrollToBottom}
        variant="secondary"
        className="bg-primary/90 text-white hover:bg-primary shadow-lg rounded-full px-4 py-2 flex items-center gap-2 hover-scale"
      >
        <span className="arabic-text text-sm">
          {unreadCount > 0 ? `${unreadCount} رسالة جديدة` : 'رسالة جديدة'}
        </span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </Button>
    </div>
  );
}
