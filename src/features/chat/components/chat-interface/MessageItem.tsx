import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pin, Trash2 } from 'lucide-react';
import EnhancedMessageActions from '../EnhancedMessageActions';
import MessageStatus from '../MessageStatus';
import UserActionsMenu from '@/shared/components/UserActionsMenu';
import { MessageContent } from './MessageContent';
import type { ChatMessage, ChatProfile } from './types';

/**
 * مكون عنصر الرسالة الواحدة
 * Single message item component
 */

interface MessageItemProps {
  message: ChatMessage;
  currentProfile: ChatProfile | null;
  activeRoom: string;
  playingAudio: string | null;
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

export function MessageItem({
  message,
  currentProfile,
  activeRoom,
  playingAudio,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
  onPlayAudio,
  onUserClick,
  highlightMentions,
  canDeleteMessage,
}: MessageItemProps) {
  const isOwn = currentProfile && message.sender_id === currentProfile.id;
  const senderName =
    message.sender?.full_name || message.sender?.email?.split('@')[0] || 'مستخدم';

  const handleAvatarClick = () => {
    if (message.sender && !isOwn) {
      onUserClick({
        ...message.sender,
        created_at: new Date().toISOString(),
        role: 'user',
      });
    }
  };

  const handleNameClick = () => {
    if (message.sender && !isOwn) {
      onUserClick({
        ...message.sender,
        created_at: new Date().toISOString(),
        role: 'user',
      });
    }
  };

  return (
    <div key={message.id} className={`flex gap-3 message-appear group ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar
        className={`w-8 h-8 flex-shrink-0 ${
          !isOwn ? 'cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all' : ''
        }`}
        onClick={handleAvatarClick}
      >
        <AvatarImage src={message.sender?.avatar_url} alt="Profile" />
        <AvatarFallback className="text-sm">{senderName[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-left' : 'text-right'} group relative`}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-sm font-medium arabic-text ${
              !isOwn ? 'cursor-pointer hover:text-primary transition-colors' : ''
            }`}
            onClick={handleNameClick}
          >
            {senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString('ar-SA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.edited_at && <span className="text-xs text-muted-foreground">(معدّلة)</span>}
          <div className="mr-auto flex items-center gap-1">
            <EnhancedMessageActions
              message={message}
              currentProfile={currentProfile}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onPin={onPin}
              onUnpin={onUnpin}
              isOwnMessage={isOwn}
            />
            {!isOwn && message.sender && (
              <UserActionsMenu
                user={{
                  id: message.sender.id,
                  full_name: message.sender.full_name || 'مستخدم',
                  email: message.sender.email || '',
                }}
                currentProfile={currentProfile}
                activeChannelId={activeRoom}
                isOwnMessage={isOwn}
              />
            )}
            {isOwn && <MessageStatus status={message.status} className="ml-1" />}
          </div>
        </div>
        <div
          className={`p-3 rounded-2xl shadow-soft relative transition-all hover:shadow-md ${
            isOwn
              ? 'gradient-btn-primary text-white rounded-br-sm ml-auto'
              : 'bg-white dark:bg-card rounded-bl-sm border border-border/50'
          }`}
        >
          {message.is_pinned && (
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Pin className="h-3 w-3" />
            </div>
          )}

          <MessageContent
            message={message}
            playingAudio={playingAudio}
            onPlayAudio={onPlayAudio}
            highlightMentions={highlightMentions}
          />

          {canDeleteMessage(message.id, message.sender_id) && (
            <button
              onClick={() => onDelete(message.id)}
              className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground p-1 rounded text-xs hover:bg-destructive/90"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
