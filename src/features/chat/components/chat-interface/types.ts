/**
 * أنواع البيانات المستخدمة في واجهة الدردشة
 * Chat Interface Types
 */

export interface ChatProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  role?: 'admin' | 'moderator' | 'user';
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  channel_id: string;
  created_at: string;
  edited_at?: string;
  is_pinned?: boolean;
  pinned_at?: string;
  pinned_by?: string;
  message_type?: 'text' | 'image' | 'file' | 'voice';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reply_to?: any;
  sender?: ChatProfile;
}

export interface ChatChannel {
  id: string;
  name: string;
  description?: string;
  type?: 'public' | 'private';
  created_at?: string;
}

export interface ReplyingTo {
  id: string;
  content: string;
}

export interface TypingUser {
  user_id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  typing: boolean;
}

export interface MemberCount {
  [channelId: string]: number;
}

export interface ChatInterfaceProps {
  // Props if needed for future refactoring
}
