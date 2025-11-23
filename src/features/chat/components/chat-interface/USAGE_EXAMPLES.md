# أمثلة الاستخدام - Usage Examples

## 📚 كيفية استخدام المكونات الجديدة

---

## 1️⃣ استخدام المكون الرئيسي

### الاستخدام الأساسي (كما هو حالياً)
```typescript
import ChatInterface from '@/features/chat/components/ChatInterface';

function ChatPage() {
  return <ChatInterface />;
}
```

---

## 2️⃣ استخدام Custom Hooks

### استخدام `useChatScroll`
```typescript
import { useChatScroll } from '@/features/chat/components/chat-interface';

function MyChat() {
  const {
    isAtBottom,
    hasNewMessages,
    unreadCount,
    scrollToBottom,
    messagesEndRef
  } = useChatScroll(messages, currentProfile, activeRoom);

  return (
    <div>
      {/* Messages */}
      <div ref={messagesEndRef} />

      {/* New Messages Button */}
      {hasNewMessages && !isAtBottom && (
        <button onClick={scrollToBottom}>
          {unreadCount} رسائل جديدة
        </button>
      )}
    </div>
  );
}
```

### استخدام `useMentions`
```typescript
import { useMentions } from '@/features/chat/components/chat-interface';

function MessageInput() {
  const {
    messageInputRef,
    showMentionList,
    filteredMembers,
    insertMention
  } = useMentions(activeRoom);

  return (
    <div>
      <textarea ref={messageInputRef} />

      {showMentionList && (
        <div>
          {filteredMembers.map(member => (
            <button onClick={() => insertMention(member.name)}>
              {member.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### استخدام `useChatAudio`
```typescript
import { useChatAudio } from '@/features/chat/components/chat-interface';

function VoiceMessage({ audioUrl, messageId }) {
  const { playingAudio, playAudio } = useChatAudio();

  return (
    <button onClick={() => playAudio(audioUrl, messageId)}>
      {playingAudio === messageId ? 'إيقاف' : 'تشغيل'}
    </button>
  );
}
```

---

## 3️⃣ استخدام مكونات UI منفصلة

### استخدام `ChatSidebar`
```typescript
import { ChatSidebar } from '@/features/chat/components/chat-interface';

function CustomChat() {
  return (
    <ChatSidebar
      channels={channels}
      activeRoom={activeRoom}
      currentProfile={profile}
      memberCounts={counts}
      collapsedRooms={false}
      showRoomsList={true}
      onRoomSelect={(roomId) => navigate(`/chat/${roomId}`)}
      onCollapseToggle={() => setCollapsed(!collapsed)}
      onProfileUpdate={setProfile}
      onLogout={handleLogout}
    />
  );
}
```

### استخدام `MessagesList`
```typescript
import { MessagesList } from '@/features/chat/components/chat-interface';
import { highlightMentions } from '@/features/chat/components/chat-interface';

function ChatMessages() {
  return (
    <MessagesList
      messages={messages}
      loading={loading}
      currentProfile={profile}
      activeRoom={room}
      playingAudio={audioId}
      typingUsers={typingUsers}
      messagesEndRef={endRef}
      scrollAreaRef={scrollRef}
      onScroll={handleScroll}
      onReply={handleReply}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onPin={handlePin}
      onUnpin={handleUnpin}
      onPlayAudio={playAudio}
      onUserClick={showProfile}
      highlightMentions={highlightMentions}
      canDeleteMessage={canDelete}
    />
  );
}
```

### استخدام `MessageInput`
```typescript
import { MessageInput } from '@/features/chat/components/chat-interface';

function ChatInput() {
  return (
    <MessageInput
      message={text}
      activeRoom={room}
      replyingTo={reply}
      showMentionList={showMentions}
      mentionQuery={query}
      filteredMembers={members}
      messageInputRef={inputRef}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onSend={sendMessage}
      onCancelReply={() => setReply(null)}
      onEmojiSelect={addEmoji}
      onFileUpload={uploadFile}
      onVoiceRecording={recordVoice}
      onMentionSelect={insertMention}
    />
  );
}
```

---

## 4️⃣ استخدام Helper Functions

### استخدام `highlightMentions`
```typescript
import { highlightMentions } from '@/features/chat/components/chat-interface';

function Message({ text }) {
  return (
    <p>{highlightMentions(text)}</p>
  );
}
```

### استخدام `canDeleteMessage`
```typescript
import { canDeleteMessage } from '@/features/chat/components/chat-interface';

function MessageActions({ message }) {
  const canDelete = canDeleteMessage(currentProfile, message.id, message.sender_id);

  return (
    <div>
      {canDelete && (
        <button onClick={() => handleDelete(message.id)}>
          حذف
        </button>
      )}
    </div>
  );
}
```

### استخدام `pinMessage` و `unpinMessage`
```typescript
import { pinMessage, unpinMessage } from '@/features/chat/components/chat-interface';

function PinButton({ messageId, isPinned }) {
  const handlePin = async () => {
    if (isPinned) {
      await unpinMessage(
        messageId,
        () => toast.success('تم إلغاء التثبيت'),
        () => toast.error('فشل إلغاء التثبيت')
      );
    } else {
      await pinMessage(
        messageId,
        currentProfile,
        () => toast.success('تم التثبيت'),
        () => toast.error('فشل التثبيت')
      );
    }
  };

  return (
    <button onClick={handlePin}>
      {isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
    </button>
  );
}
```

---

## 5️⃣ إنشاء مكون دردشة مخصص

### مثال: دردشة مبسطة
```typescript
import {
  ChatHeader,
  MessagesList,
  MessageInput,
  useChatScroll,
  useMentions,
  highlightMentions,
  canDeleteMessage as canDelete
} from '@/features/chat/components/chat-interface';

function SimpleChatRoom() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const {
    scrollToBottom,
    messagesEndRef,
    scrollAreaRef,
    handleScroll
  } = useChatScroll(messages, profile, roomId);

  const {
    messageInputRef,
    showMentionList,
    filteredMembers,
    handleMentionInput,
    insertMention
  } = useMentions(roomId);

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader
        channels={channels}
        messages={messages}
        activeRoom={roomId}
        currentProfile={profile}
        soundEnabled={true}
        isDarkMode={false}
        showRoomsList={true}
        onSoundToggle={() => {}}
        onDarkModeToggle={() => {}}
        onPinnedMessagesClick={() => {}}
        onModerationClick={() => {}}
        onClearMessages={() => {}}
        onBackClick={() => {}}
      />

      <MessagesList
        messages={messages}
        loading={false}
        currentProfile={profile}
        activeRoom={roomId}
        playingAudio={null}
        typingUsers={{}}
        messagesEndRef={messagesEndRef}
        scrollAreaRef={scrollAreaRef}
        onScroll={handleScroll}
        onReply={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onPin={() => {}}
        onUnpin={() => {}}
        onPlayAudio={() => {}}
        onUserClick={() => {}}
        highlightMentions={highlightMentions}
        canDeleteMessage={canDelete}
      />

      <MessageInput
        message={message}
        activeRoom={roomId}
        replyingTo={null}
        showMentionList={showMentionList}
        mentionQuery=""
        filteredMembers={filteredMembers}
        messageInputRef={messageInputRef}
        onChange={(e) => {
          setMessage(e.target.value);
          handleMentionInput(e.target.value, e.target.selectionStart || 0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        onSend={sendMessage}
        onCancelReply={() => {}}
        onEmojiSelect={(emoji) => setMessage(m => m + emoji)}
        onFileUpload={() => {}}
        onVoiceRecording={() => {}}
        onMentionSelect={(name) => insertMention(name, message, setMessage)}
      />
    </div>
  );
}
```

---

## 6️⃣ اختبار المكونات

### اختبار `useChatScroll`
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useChatScroll } from '@/features/chat/components/chat-interface';

describe('useChatScroll', () => {
  it('should scroll to bottom on new message', () => {
    const messages = [{ id: '1', content: 'Hello' }];
    const { result } = renderHook(() =>
      useChatScroll(messages, profile, 'room1')
    );

    expect(result.current.isAtBottom).toBe(true);

    act(() => {
      result.current.scrollToBottom();
    });

    expect(result.current.hasNewMessages).toBe(false);
  });
});
```

### اختبار `MessageItem`
```typescript
import { render, screen } from '@testing-library/react';
import { MessageItem } from '@/features/chat/components/chat-interface';

describe('MessageItem', () => {
  it('renders message content correctly', () => {
    const message = {
      id: '1',
      content: 'مرحباً',
      sender_id: 'user1',
      created_at: new Date().toISOString()
    };

    render(
      <MessageItem
        message={message}
        currentProfile={profile}
        activeRoom="room1"
        playingAudio={null}
        onReply={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onPin={() => {}}
        onUnpin={() => {}}
        onPlayAudio={() => {}}
        onUserClick={() => {}}
        highlightMentions={(text) => text}
        canDeleteMessage={() => true}
      />
    );

    expect(screen.getByText('مرحباً')).toBeInTheDocument();
  });
});
```

---

## 🎯 نصائح الاستخدام

### ✅ Do's
- استخدم `named imports` للمكونات المحددة
- استخدم `types` المصدرة من `types.ts`
- استخدم `helpers` للوظائف المشتركة
- استخدم `custom hooks` لإعادة استخدام المنطق

### ❌ Don'ts
- لا تعدل ملفات المكونات مباشرة
- لا تستخدم `default imports` للمكونات الفرعية
- لا تكرر المنطق الموجود في `helpers`
- لا تتجاهل `types` في TypeScript

---

## 📖 مراجع إضافية

- راجع `/chat-interface/README.md` للدليل الشامل
- راجع `/chat-interface/STRUCTURE.txt` للهيكل المرئي
- راجع `/chat-interface/SUMMARY.md` للملخص الكامل

---

**ملاحظة:** جميع المكونات تدعم RTL/LTR تلقائياً وتستخدم Semantic Tokens.
