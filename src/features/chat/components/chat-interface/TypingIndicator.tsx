import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { TypingUser, ChatProfile } from './types';

/**
 * مكون مؤشر الكتابة
 * Typing indicator component
 */

interface TypingIndicatorProps {
  typingUsers: Record<string, any>;
  currentProfile: ChatProfile | null;
}

export function TypingIndicator({ typingUsers, currentProfile }: TypingIndicatorProps) {
  if (!typingUsers || Object.keys(typingUsers).length === 0) {
    return null;
  }

  return (
    <>
      {Object.entries(typingUsers).map(([userId, userStates]) => {
        const typingUser = Array.isArray(userStates)
          ? userStates.find((state: any) => state.typing)
          : userStates;

        if (!typingUser?.typing || typingUser.user_id === currentProfile?.id) return null;

        const displayName =
          typingUser.full_name || typingUser.email?.split('@')[0] || 'مستخدم';

        return (
          <div key={userId} className="flex gap-3 message-appear">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={typingUser.avatar_url} alt="Profile" />
              <AvatarFallback className="text-sm">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted/80 dark:bg-muted rounded-2xl p-3 rounded-bl-sm shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm arabic-text font-medium text-muted-foreground">
                  {displayName} جاري الكتابة
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-primary rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-primary rounded-full typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
