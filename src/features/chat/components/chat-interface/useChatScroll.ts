import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, ChatProfile } from './types';

/**
 * Custom hook لإدارة التمرير والرسائل الجديدة
 * Manages scroll position and new message notifications
 */
export function useChatScroll(
  messages: ChatMessage[],
  currentProfile: ChatProfile | null,
  activeRoom: string
) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom and handle new message notifications
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const isOwnMessage = currentProfile && latestMessage.sender_id === currentProfile.id;

      if (isOwnMessage || isAtBottom) {
        // Auto-scroll to bottom for own messages or when user is at bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // User is not at bottom and received a new message
        if (!isOwnMessage && latestMessage.created_at) {
          const messageTime = new Date(latestMessage.created_at).getTime();
          const now = Date.now();

          if (now - messageTime < 5000) {
            setHasNewMessages(true);
            setUnreadCount(prev => prev + 1);
          }
        }
      }
    }
  }, [messages, currentProfile, isAtBottom]);

  // Handle scroll events to detect if user is at bottom
  const handleScroll = (event: any) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const isAtBottomNow = scrollHeight - scrollTop - clientHeight < 50;

    setIsAtBottom(isAtBottomNow);

    if (isAtBottomNow && hasNewMessages) {
      setHasNewMessages(false);
      setUnreadCount(0);
    }
  };

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessages(false);
    setUnreadCount(0);
    setIsAtBottom(true);
  };

  // Reset new message state when changing rooms
  useEffect(() => {
    setHasNewMessages(false);
    setUnreadCount(0);
    setIsAtBottom(true);
  }, [activeRoom]);

  return {
    isAtBottom,
    hasNewMessages,
    unreadCount,
    messagesEndRef,
    scrollAreaRef,
    handleScroll,
    scrollToBottom,
  };
}
