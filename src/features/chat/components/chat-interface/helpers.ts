import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ChatProfile } from './types';

/**
 * وظائف مساعدة لواجهة الدردشة
 * Helper functions for chat interface
 */

// تسليط الضوء على الإشارات في النص
export function highlightMentions(text: string): React.ReactNode {
  const parts = text.split(/(@[\p{L}\p{N}_\u0600-\u06FF ]{1,50})/u);
  return parts.map((part, i) =>
    part.startsWith('@')
      ? React.createElement(
          'span',
          { key: i, className: 'bg-primary/10 text-primary font-semibold px-1 rounded' },
          part
        )
      : React.createElement('span', { key: i }, part)
  );
}

// التحقق من إمكانية حذف الرسالة
export function canDeleteMessage(
  currentProfile: ChatProfile | null,
  messageId: string,
  senderId: string
): boolean {
  return !!(
    currentProfile &&
    (currentProfile.id === senderId ||
      currentProfile.role === 'admin' ||
      currentProfile.role === 'moderator')
  );
}

// مسح جميع رسائل القناة
export async function clearChannelMessages(
  activeRoom: string,
  currentProfile: ChatProfile | null,
  session: any,
  setMessages: (messages: any[]) => void,
  onSuccess: () => void,
  onError: () => void
): Promise<void> {
  if (
    !activeRoom ||
    !currentProfile ||
    (currentProfile.role !== 'admin' && currentProfile.role !== 'moderator')
  ) {
    return;
  }

  const confirmed = window.confirm(
    'هل أنت متأكد من حذف جميع رسائل هذه الغرفة؟ هذا الإجراء لا يمكن التراجع عنه.'
  );
  if (!confirmed) return;

  try {
    const { data, error } = await supabase.functions.invoke('admin-actions', {
      body: {
        action: 'clear_channel_messages',
        channel_id: activeRoom,
      },
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
      },
    });

    if (error) {
      console.error('Error clearing messages:', error);
      onError();
    } else {
      // Clear messages from UI immediately
      if (setMessages) {
        setMessages([]);
      }
      onSuccess();
    }
  } catch (error) {
    console.error('Error clearing messages:', error);
    onError();
  }
}

// تثبيت رسالة
export async function pinMessage(
  messageId: string,
  currentProfile: ChatProfile | null,
  onSuccess: () => void,
  onError: () => void
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_pinned: true,
        pinned_at: new Date().toISOString(),
        pinned_by: currentProfile?.id,
      })
      .eq('id', messageId);

    if (error) {
      console.error('Error pinning message:', error);
      onError();
    } else {
      onSuccess();
    }
  } catch (error) {
    console.error('Error pinning message:', error);
  }
}

// إلغاء تثبيت رسالة
export async function unpinMessage(
  messageId: string,
  onSuccess: () => void,
  onError: () => void
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        is_pinned: false,
        pinned_at: null,
        pinned_by: null,
      })
      .eq('id', messageId);

    if (error) {
      console.error('Error unpinning message:', error);
      onError();
    } else {
      onSuccess();
    }
  } catch (error) {
    console.error('Error unpinning message:', error);
  }
}

// تعديل رسالة
export async function editMessage(
  messageId: string,
  newContent: string,
  onError: () => void
): Promise<void> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        content: newContent,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (error) {
      console.error('Error editing message:', error);
      onError();
    }
  } catch (error) {
    console.error('Error editing message:', error);
  }
}

// رفع ملف صوتي
export async function uploadVoiceMessage(
  audioBlob: Blob,
  activeRoom: string,
  sendMsg: (content: string, type: string) => Promise<void>
): Promise<void> {
  if (!activeRoom) return;

  try {
    const fileName = `voice_${Date.now()}.webm`;
    const filePath = `voice/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, audioBlob);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);

    await sendMsg(`[رسالة صوتية] ${data.publicUrl}`, 'voice');
  } catch (error) {
    console.error('Error uploading voice message:', error);
  }
}
