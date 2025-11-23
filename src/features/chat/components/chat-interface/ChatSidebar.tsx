import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Hash,
  Lock,
  Users,
  MoreVertical,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProfileSettings from '@/shared/components/ProfileSettings';
import UserProfileMenu from '@/shared/components/UserProfileMenu';
import type { ChatChannel, ChatProfile, MemberCount } from './types';

/**
 * مكون قائمة الغرف الجانبية
 * Sidebar component showing chat rooms
 */

interface ChatSidebarProps {
  channels: ChatChannel[];
  activeRoom: string;
  currentProfile: ChatProfile | null;
  memberCounts: MemberCount;
  collapsedRooms: boolean;
  showRoomsList: boolean;
  onRoomSelect: (roomId: string) => void;
  onCollapseToggle: () => void;
  onProfileUpdate: (profile: ChatProfile) => void;
  onLogout: () => void;
}

export function ChatSidebar({
  channels,
  activeRoom,
  currentProfile,
  memberCounts,
  collapsedRooms,
  showRoomsList,
  onRoomSelect,
  onCollapseToggle,
  onProfileUpdate,
  onLogout,
}: ChatSidebarProps) {
  return (
    <div
      className={`${collapsedRooms ? 'w-6' : 'w-80'} transition-all duration-300 bg-card border-l border-border flex-col ${
        showRoomsList ? 'flex' : 'hidden'
      } md:flex relative`}
    >
      {/* Collapse Toggle */}
      <button
        aria-label={collapsedRooms ? 'Expand rooms' : 'Collapse rooms'}
        className="absolute -left-3 top-20 z-[90] bg-card border border-border rounded-full w-6 h-6 flex items-center justify-center shadow-soft hover-scale"
        onClick={onCollapseToggle}
      >
        <span className="text-xs">{collapsedRooms ? '⟵' : '⟶'}</span>
      </button>

      {/* Header */}
      <div
        className={`p-4 border-b border-border ${
          collapsedRooms ? 'opacity-0 pointer-events-none h-0 p-0 border-0' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-bold text-lg arabic-text">دردشة عربية</h2>
          </div>
          <div className="flex items-center gap-2">
            <UserProfileMenu />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="z-[100] bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/80 shadow-lg border border-border"
              >
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {currentProfile && (
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentProfile.avatar_url} alt="Profile" />
              <AvatarFallback className="text-sm">
                {(currentProfile.full_name || 'أ')[0]}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium arabic-text">
              {currentProfile.full_name || 'مستخدم'}
            </span>
            <div className="w-2 h-2 bg-status-online rounded-full mr-auto"></div>
            {currentProfile && (
              <ProfileSettings profile={currentProfile} onProfileUpdate={onProfileUpdate} />
            )}
          </div>
        )}
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-muted-foreground arabic-text">الغرف</h3>
          </div>
        </div>

        <ScrollArea className="px-2">
          <div className="space-y-1">
            {channels.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                className={`w-full text-right p-3 rounded-lg transition-colors arabic-text ${
                  activeRoom === room.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  {room.type === 'private' ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{room.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {room.description || 'غرفة دردشة'}
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {memberCounts[room.id] ?? 0}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
