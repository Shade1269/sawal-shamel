import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import FileUpload from '@/shared/components/FileUpload';
import VoiceRecorder from '../VoiceRecorder';
import EnhancedEmojiPicker from '../EnhancedEmojiPicker';
import { ReplyPreview } from './ReplyPreview';
import { MentionsList } from './MentionsList';
import type { ReplyingTo } from './types';

/**
 * مكون إدخال الرسالة
 * Message input component
 */

interface MessageInputProps {
  message: string;
  activeRoom: string;
  replyingTo: ReplyingTo | null;
  showMentionList: boolean;
  mentionQuery: string;
  filteredMembers: any[];
  messageInputRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onCancelReply: () => void;
  onEmojiSelect: (emoji: string) => void;
  onFileUpload: (url: string, type: 'image' | 'file') => void;
  onVoiceRecording: (blob: Blob) => void;
  onMentionSelect: (name: string) => void;
}

export function MessageInput({
  message,
  activeRoom,
  replyingTo,
  showMentionList,
  mentionQuery,
  filteredMembers,
  messageInputRef,
  onChange,
  onKeyDown,
  onSend,
  onCancelReply,
  onEmojiSelect,
  onFileUpload,
  onVoiceRecording,
  onMentionSelect,
}: MessageInputProps) {
  return (
    <div className="bg-card border-t border-border p-4 relative">
      {/* معاينة الرد */}
      <ReplyPreview replyingTo={replyingTo} onCancel={onCancelReply} />

      {/* قائمة الإشارات */}
      <MentionsList
        show={showMentionList}
        query={mentionQuery}
        members={filteredMembers}
        onSelect={onMentionSelect}
      />

      <div className="flex items-end gap-3">
        <div className="flex gap-1">
          <FileUpload onFileUpload={onFileUpload} accept="image/*" maxSize={5} />
          <VoiceRecorder onRecordingComplete={onVoiceRecording} />
          <EnhancedEmojiPicker onEmojiSelect={onEmojiSelect} />
        </div>
        <div className="flex-1 flex gap-2">
          <Textarea
            ref={messageInputRef}
            value={message}
            onChange={onChange}
            placeholder={replyingTo ? 'اكتب ردك هنا...' : 'اكتب رسالتك هنا...'}
            className="flex-1 arabic-text min-h-12 md:min-h-14 max-h-40 resize-none overflow-y-auto"
            onKeyDown={onKeyDown}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 320) + 'px';
            }}
            disabled={!activeRoom}
            rows={2}
          />
          <Button
            onClick={onSend}
            variant="hero"
            size="icon"
            className="shadow-soft self-end"
            disabled={!message.trim() || !activeRoom}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
