import React from 'react';
import NotificationManager from '../NotificationManager';
import ChannelMembership from '@/shared/components/ChannelMembership';
import type { ChatProfile } from './types';

/**
 * مكون القائمة الجانبية للمستخدمين
 * Users sidebar component
 */

interface UsersSidebarProps {
  activeRoom: string;
  currentProfile: ChatProfile | null;
}

export function UsersSidebar({ activeRoom, currentProfile }: UsersSidebarProps) {
  return (
    <div className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
      <NotificationManager className="p-4 border-b border-border" />
      <ChannelMembership
        channelId={activeRoom}
        currentProfile={currentProfile}
        className="h-full"
      />
    </div>
  );
}
