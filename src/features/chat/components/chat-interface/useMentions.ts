import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook لإدارة الإشارات (@mentions)
 * Manages @ mentions functionality
 */
export function useMentions(activeRoom: string) {
  const [members, setMembers] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionList, setShowMentionList] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Load members for current channel (for @mentions)
  useEffect(() => {
    const loadMembers = async () => {
      if (!activeRoom) return;
      const { data, error } = await supabase
        .from('channel_members')
        .select('id, user:profiles!channel_members_user_id_fkey(id, full_name, avatar_url)')
        .eq('channel_id', activeRoom);
      if (!error) setMembers(data || []);
    };
    loadMembers();
  }, [activeRoom]);

  // Handle mention detection in message
  const handleMentionInput = (value: string, cursorPosition: number) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@([\p{L}\p{N}_\u0600-\u06FF ]*)$/u);

    if (match) {
      setMentionQuery(match[1] || '');
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
      setMentionQuery('');
    }
  };

  // Insert mention into message
  const insertMention = (name: string, message: string, setMessage: (msg: string) => void) => {
    const cursor = messageInputRef.current?.selectionStart ?? message.length;
    const textBefore = message.slice(0, cursor);
    const match = textBefore.match(/@([\p{L}\p{N}_\u0600-\u06FF ]*)$/u);

    if (match) {
      const start = cursor - match[0].length;
      const newText = message.slice(0, start) + '@' + name + ' ' + message.slice(cursor);
      setMessage(newText);
    } else {
      setMessage(message + '@' + name + ' ');
    }

    setShowMentionList(false);
    setMentionQuery('');
    setTimeout(() => messageInputRef.current?.focus(), 0);
  };

  // Filter members based on query
  const filteredMembers = members
    .filter(m => (m.user?.full_name || '').includes(mentionQuery))
    .slice(0, 6);

  return {
    members,
    mentionQuery,
    showMentionList,
    messageInputRef,
    handleMentionInput,
    insertMention,
    filteredMembers,
  };
}
