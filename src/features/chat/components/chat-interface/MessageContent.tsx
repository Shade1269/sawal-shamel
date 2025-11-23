import React from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Play, Pause } from 'lucide-react';
import ThreadReply from '../ThreadReply';
import type { ChatMessage } from './types';

/**
 * مكون عرض محتوى الرسالة
 * Message content renderer component
 */

interface MessageContentProps {
  message: ChatMessage;
  playingAudio: string | null;
  onPlayAudio: (url: string, messageId: string) => void;
  highlightMentions: (text: string) => React.ReactNode;
}

export function MessageContent({
  message,
  playingAudio,
  onPlayAudio,
  highlightMentions,
}: MessageContentProps) {
  const content = message.content;

  // معالجة الرسائل المقتبسة (Reply messages)
  if (content.includes('[رد على:')) {
    const parts = content.split('] ');
    const replyPart = parts[0] + ']';
    const actualContent = parts.slice(1).join('] ');

    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground bg-accent/20 p-2 rounded border-r-2 border-primary">
          {replyPart}
        </div>
        <p className="arabic-text leading-relaxed">{actualContent}</p>
      </div>
    );
  }

  // معالجة الصور (Image messages)
  if (content.startsWith('[صورة]') || message.message_type === 'image') {
    const imageUrl = content.replace('[صورة] ', '');
    return (
      <div className="space-y-2">
        {message.reply_to && <ThreadReply replyToMessage={message.reply_to} />}
        <img
          src={imageUrl}
          alt="مشاركة صورة"
          className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(imageUrl, '_blank')}
        />
      </div>
    );
  }

  // معالجة الرسائل الصوتية (Voice messages)
  if (content.startsWith('[رسالة صوتية]') || message.message_type === 'voice') {
    const audioUrl = content.replace('[رسالة صوتية] ', '');
    return (
      <div className="space-y-2">
        {message.reply_to && <ThreadReply replyToMessage={message.reply_to} />}
        <div className="flex items-center gap-2 bg-accent/20 rounded-lg p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPlayAudio(audioUrl, message.id)}
            className="h-8 w-8 p-0"
          >
            {playingAudio === message.id ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm arabic-text">رسالة صوتية</span>
          <audio id={`audio-${message.id}`} preload="metadata">
            <source src={audioUrl} type="audio/webm" />
          </audio>
        </div>
      </div>
    );
  }

  // معالجة الملفات (File messages)
  if (content.startsWith('[ملف]') || message.message_type === 'file') {
    const fileUrl = content.replace('[ملف] ', '');
    const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'ملف غير معروف';
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

    return (
      <div className="space-y-2">
        {message.reply_to && <ThreadReply replyToMessage={message.reply_to} />}
        <div className="flex items-center gap-3 bg-accent/20 rounded-lg p-3 max-w-sm">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Paperclip className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium arabic-text truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground uppercase">{fileExt} ملف</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(fileUrl, '_blank')}
            className="text-primary hover:text-primary/80"
          >
            تحميل
          </Button>
        </div>
      </div>
    );
  }

  // رسالة نصية عادية (Default text message)
  return (
    <div className="space-y-2">
      {message.reply_to && <ThreadReply replyToMessage={message.reply_to} />}
      <p className="arabic-text leading-relaxed">{highlightMentions(content)}</p>
    </div>
  );
}
