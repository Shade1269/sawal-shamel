import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage, ChatProfile } from './types';

/**
 * مكون قائمة الرسائل
 * Messages list component
 */

interface MessagesListProps {
  messages: ChatMessage[];
  loading: boolean;
  currentProfile: ChatProfile | null;
  activeRoom: string;
  playingAudio: string | null;
  typingUsers: Record<string, any>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  onScroll: (event: any) => void;
  onReply: (messageId: string, content: string) => void;
  onEdit: (messageId: string, newContent: string) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
  onPlayAudio: (url: string, messageId: string) => void;
  onUserClick: (profile: ChatProfile) => void;
  highlightMentions: (text: string) => React.ReactNode;
  canDeleteMessage: (messageId: string, senderId: string) => boolean;
}

export function MessagesList({
  messages,
  loading,
  currentProfile,
  activeRoom,
  playingAudio,
  typingUsers,
  messagesEndRef,
  scrollAreaRef,
  onScroll,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
  onPlayAudio,
  onUserClick,
  highlightMentions,
  canDeleteMessage,
}: MessagesListProps) {
  return (
    <ScrollArea className="flex-1 p-4 chat-scrollbar" ref={scrollAreaRef} onScroll={onScroll}>
      {loading ? (
        <div className="text-center p-4 text-muted-foreground">جاري تحميل الرسائل...</div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              currentProfile={currentProfile}
              activeRoom={activeRoom}
              playingAudio={playingAudio}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onPin={onPin}
              onUnpin={onUnpin}
              onPlayAudio={onPlayAudio}
              onUserClick={onUserClick}
              highlightMentions={highlightMentions}
              canDeleteMessage={canDeleteMessage}
            />
          ))}

          {/* مؤشرات الكتابة */}
          <TypingIndicator typingUsers={typingUsers} currentProfile={currentProfile} />

          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
}
