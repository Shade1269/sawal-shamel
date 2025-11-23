import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { useDarkMode } from '@/shared/components/DarkModeProvider';
import { useNotifications } from '@/hooks/useNotifications';
import { parseEmojiText } from '../EnhancedEmojiPicker';
import ModerationPanel from '../ModerationPanel';
import PinnedMessages from '../PinnedMessages';
import NotificationSound from '../NotificationSound';
import NotificationPrompt from '../NotificationPrompt';
import SimpleUserProfile from '../SimpleUserProfile';

// استيراد المكونات المقسمة
import {
  ChatSidebar,
  ChatHeader,
  MessagesList,
  MessageInput,
  NewMessageButton,
  UsersSidebar,
} from './index';

// استيراد الـ hooks المخصصة
import { useChatScroll } from './useChatScroll';
import { useMentions } from './useMentions';
import { useChatAudio } from './useChatAudio';
import { useChannelMembers } from './useChannelMembers';

// استيراد الوظائف المساعدة
import {
  highlightMentions,
  canDeleteMessage as canDelete,
  clearChannelMessages,
  pinMessage,
  unpinMessage,
  editMessage,
  uploadVoiceMessage,
} from './helpers';

import type { ChatProfile, ReplyingTo } from './types';

/**
 * المكون الرئيسي لواجهة الدردشة
 * Main Chat Interface Component
 */
const ChatInterface = () => {
  // State management
  const [message, setMessage] = useState('');
  const [currentProfile, setCurrentProfile] = useState<ChatProfile | null>(null);
  const [showRoomsList, setShowRoomsList] = useState(true);
  const [collapsedRooms, setCollapsedRooms] = useState(false);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mentionAlert, setMentionAlert] = useState(false);

  // Hooks
  const { user, session } = useSupabaseAuth();
  const { toast } = useToast();
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const activeRoom = channelId || '';
  const {
    messages,
    channels,
    loading,
    currentProfile: hookProfile,
    sendMessage: sendMsg,
    deleteMessage,
    setMessages,
    typingUsers,
    startTyping,
    stopTyping,
  } = useRealTimeChat(activeRoom);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const notifications = useNotifications(user?.id);

  // Custom hooks
  const {
    isAtBottom,
    hasNewMessages,
    unreadCount,
    messagesEndRef,
    scrollAreaRef,
    handleScroll,
    scrollToBottom,
  } = useChatScroll(messages, currentProfile, activeRoom);

  const {
    mentionQuery,
    showMentionList,
    messageInputRef,
    handleMentionInput,
    insertMention,
    filteredMembers,
  } = useMentions(activeRoom);

  const { playingAudio, playAudio } = useChatAudio();
  const memberCounts = useChannelMembers(channels);

  // Update current profile when hook profile changes
  useEffect(() => {
    if (hookProfile) {
      setCurrentProfile(hookProfile);
    }
  }, [hookProfile]);

  // Initialize sound setting
  useEffect(() => {
    const stored = localStorage.getItem('soundEnabled');
    setSoundEnabled(stored === 'true');
  }, []);

  // Handle new message alerts and mentions
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const isOwnMessage = currentProfile && latestMessage.sender_id === currentProfile.id;

      if (!isOwnMessage && latestMessage.created_at) {
        const messageTime = new Date(latestMessage.created_at).getTime();
        const now = Date.now();

        if (now - messageTime < 5000) {
          setNewMessageAlert(true);
          setTimeout(() => setNewMessageAlert(false), 2000);

          // Show notification for new messages
          notifications.showInAppNotification(
            `رسالة جديدة من ${latestMessage.sender?.full_name || 'مستخدم'}`,
            latestMessage.content.substring(0, 50) +
              (latestMessage.content.length > 50 ? '...' : ''),
            { channel: activeRoom }
          );
        }

        // Mention alert
        const fullName = currentProfile?.full_name;
        if (
          fullName &&
          typeof latestMessage.content === 'string' &&
          latestMessage.content.includes('@' + fullName)
        ) {
          setMentionAlert(true);
          setTimeout(() => setMentionAlert(false), 2000);

          notifications.showInAppNotification(
            `تم ذكرك في رسالة`,
            `${latestMessage.sender?.full_name || 'مستخدم'}: ${latestMessage.content.substring(0, 50)}`,
            { channel: activeRoom }
          );
        }
      }
    }
  }, [messages, currentProfile, activeRoom]);

  // Set default active room
  useEffect(() => {
    if (channels.length > 0 && !activeRoom) {
      navigate(`/chat/${channels[0].id}`);
      if (window.innerWidth < 768) {
        setShowRoomsList(false);
      }
    }
  }, [channels, activeRoom, navigate]);

  // Handler functions
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && startTyping) {
      startTyping();
    } else if (!value.trim() && stopTyping) {
      stopTyping();
    }

    const cursor = e.target.selectionStart ?? value.length;
    handleMentionInput(value, cursor);
  };

  const sendMessage = async () => {
    if (message.trim() && activeRoom) {
      let finalContent = parseEmojiText(message.trim());

      if (replyingTo) {
        finalContent = `[رد على: ${replyingTo.content.substring(0, 50)}...] ${finalContent}`;
      }

      if (stopTyping) {
        stopTyping();
      }

      await sendMsg(finalContent);
      setMessage('');
      setReplyingTo(null);

      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReply = (messageId: string, originalContent: string) => {
    setReplyingTo({ id: messageId, content: originalContent });
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    await editMessage(messageId, newContent, () => {
      toast({
        title: 'خطأ في التعديل',
        description: 'فشل في تعديل الرسالة',
        variant: 'destructive',
      });
    });
  };

  const handlePinMessage = async (messageId: string) => {
    await pinMessage(
      messageId,
      currentProfile,
      () => {
        toast({ title: 'تم التثبيت', description: 'تم تثبيت الرسالة بنجاح' });
      },
      () => {
        toast({
          title: 'خطأ في التثبيت',
          description: 'فشل في تثبيت الرسالة',
          variant: 'destructive',
        });
      }
    );
  };

  const handleUnpinMessage = async (messageId: string) => {
    await unpinMessage(
      messageId,
      () => {
        toast({ title: 'تم إلغاء التثبيت', description: 'تم إلغاء تثبيت الرسالة بنجاح' });
      },
      () => {
        toast({
          title: 'خطأ في إلغاء التثبيت',
          description: 'فشل في إلغاء تثبيت الرسالة',
          variant: 'destructive',
        });
      }
    );
  };

  const handleClearChannelMessages = async () => {
    await clearChannelMessages(
      activeRoom,
      currentProfile,
      session,
      setMessages,
      () => {
        toast({ title: 'تم مسح الرسائل', description: 'تم مسح جميع رسائل الغرفة بنجاح' });
      },
      () => {
        toast({
          title: 'خطأ في مسح الرسائل',
          description: 'حدث خطأ أثناء مسح الرسائل',
          variant: 'destructive',
        });
      }
    );
  };

  const handleFileUpload = async (url: string, type: 'image' | 'file') => {
    if (activeRoom) {
      const content = type === 'image' ? `[صورة] ${url}` : `[ملف] ${url}`;
      await sendMsg(content, type);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    await uploadVoiceMessage(audioBlob, activeRoom, sendMsg);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const handleMentionSelect = (name: string) => {
    insertMention(name, message, setMessage);
  };

  const handleUserClick = (profile: ChatProfile) => {
    setSelectedUserProfile(profile);
    setShowUserProfile(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: 'تم تسجيل الخروج' });
      navigate('/');
    } catch (e) {
      toast({
        title: 'خطأ في تسجيل الخروج',
        description: 'حاول مرة أخرى',
        variant: 'destructive',
      });
    }
  };

  const handleRoomSelect = (roomId: string) => {
    navigate(`/chat/${roomId}`);
    if (window.innerWidth < 768) {
      setShowRoomsList(false);
    }
  };

  const canDeleteMessage = (messageId: string, senderId: string) => {
    return canDelete(currentProfile, messageId, senderId);
  };

  return (
    <div className="h-screen bg-chat-bg rtl flex" dir="rtl">
      {/* Sidebar - Rooms */}
      <ChatSidebar
        channels={channels}
        activeRoom={activeRoom}
        currentProfile={currentProfile}
        memberCounts={memberCounts}
        collapsedRooms={collapsedRooms}
        showRoomsList={showRoomsList}
        onRoomSelect={handleRoomSelect}
        onCollapseToggle={() => setCollapsedRooms((v) => !v)}
        onProfileUpdate={setCurrentProfile}
        onLogout={handleLogout}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!showRoomsList ? 'pt-16 md:pt-0' : ''}`}>
        {/* Chat Header */}
        <ChatHeader
          channels={channels}
          messages={messages}
          activeRoom={activeRoom}
          currentProfile={currentProfile}
          soundEnabled={soundEnabled}
          isDarkMode={isDarkMode}
          showRoomsList={showRoomsList}
          onSoundToggle={() => {
            const v = !soundEnabled;
            setSoundEnabled(v);
            localStorage.setItem('soundEnabled', String(v));
            if (v) {
              setNewMessageAlert(true);
              setTimeout(() => setNewMessageAlert(false), 200);
            }
          }}
          onDarkModeToggle={toggleDarkMode}
          onPinnedMessagesClick={() => setShowPinnedMessages(true)}
          onModerationClick={() => setShowModerationPanel(true)}
          onClearMessages={handleClearChannelMessages}
          onBackClick={() => navigate('/chat')}
        />

        {/* Messages Area */}
        <MessagesList
          messages={messages}
          loading={loading}
          currentProfile={currentProfile}
          activeRoom={activeRoom}
          playingAudio={playingAudio}
          typingUsers={typingUsers}
          messagesEndRef={messagesEndRef}
          scrollAreaRef={scrollAreaRef}
          onScroll={handleScroll}
          onReply={handleReply}
          onEdit={handleEditMessage}
          onDelete={deleteMessage}
          onPin={handlePinMessage}
          onUnpin={handleUnpinMessage}
          onPlayAudio={playAudio}
          onUserClick={handleUserClick}
          highlightMentions={highlightMentions}
          canDeleteMessage={canDeleteMessage}
        />

        {/* New Messages Notification */}
        <NewMessageButton
          hasNewMessages={hasNewMessages}
          isAtBottom={isAtBottom}
          unreadCount={unreadCount}
          onScrollToBottom={scrollToBottom}
        />

        {/* Notification Sound */}
        <NotificationSound
          enabled={soundEnabled}
          onNewMessage={newMessageAlert}
          onMention={mentionAlert}
        />

        {/* Message Input */}
        <MessageInput
          message={message}
          activeRoom={activeRoom}
          replyingTo={replyingTo}
          showMentionList={showMentionList}
          mentionQuery={mentionQuery}
          filteredMembers={filteredMembers}
          messageInputRef={messageInputRef}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          onSend={sendMessage}
          onCancelReply={() => setReplyingTo(null)}
          onEmojiSelect={handleEmojiSelect}
          onFileUpload={handleFileUpload}
          onVoiceRecording={handleVoiceRecording}
          onMentionSelect={handleMentionSelect}
        />
      </div>

      {/* Users Sidebar */}
      <UsersSidebar activeRoom={activeRoom} currentProfile={currentProfile} />

      {/* Moderation Panel Dialog */}
      <Dialog open={showModerationPanel} onOpenChange={setShowModerationPanel}>
        <DialogContent className="sm:max-w-md rtl z-[110]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="arabic-text">لوحة الإشراف</DialogTitle>
          </DialogHeader>
          <ModerationPanel
            currentProfile={currentProfile}
            activeChannelId={activeRoom}
            onClose={() => setShowModerationPanel(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Pinned Messages Dialog */}
      <Dialog open={showPinnedMessages} onOpenChange={setShowPinnedMessages}>
        <DialogContent className="sm:max-w-lg rtl z-[120]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="arabic-text flex items-center gap-2">
              <span>الرسائل المثبتة</span>
            </DialogTitle>
          </DialogHeader>
          <PinnedMessages
            messages={messages}
            onUnpin={handleUnpinMessage}
            className="max-h-96"
          />
        </DialogContent>
      </Dialog>

      {/* User Profile Dialog */}
      <SimpleUserProfile
        user={selectedUserProfile}
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setSelectedUserProfile(null);
        }}
      />

      {/* Notification Prompt */}
      <NotificationPrompt />
    </div>
  );
};

export default ChatInterface;
