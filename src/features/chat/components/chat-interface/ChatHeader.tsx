import React from 'react';
import { Button } from '@/components/ui/button';
import { Hash, Bell, BellOff, Sun, Moon, Pin, Shield, Trash2, ArrowLeft } from 'lucide-react';
import MessageSearch from '../MessageSearch';
import UserProfileMenu from '@/shared/components/UserProfileMenu';
import type { ChatChannel, ChatMessage, ChatProfile } from './types';

/**
 * مكون رأس الدردشة
 * Chat header component
 */

interface ChatHeaderProps {
  channels: ChatChannel[];
  messages: ChatMessage[];
  activeRoom: string;
  currentProfile: ChatProfile | null;
  soundEnabled: boolean;
  isDarkMode: boolean;
  showRoomsList: boolean;
  onSoundToggle: () => void;
  onDarkModeToggle: () => void;
  onPinnedMessagesClick: () => void;
  onModerationClick: () => void;
  onClearMessages: () => void;
  onBackClick: () => void;
}

export function ChatHeader({
  channels,
  messages,
  activeRoom,
  currentProfile,
  soundEnabled,
  isDarkMode,
  showRoomsList,
  onSoundToggle,
  onDarkModeToggle,
  onPinnedMessagesClick,
  onModerationClick,
  onClearMessages,
  onBackClick,
}: ChatHeaderProps) {
  const activeChannel = channels.find(r => r.id === activeRoom);
  const isAdmin = currentProfile?.role === 'admin' || currentProfile?.role === 'moderator';

  return (
    <>
      {/* Mobile Header */}
      {!showRoomsList && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-[130] bg-card border-b border-border p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="h-8 w-8"
            aria-label="عودة للغرف"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Hash className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-bold arabic-text">
              {activeChannel?.name || 'غرفة الدردشة'}
            </h2>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onModerationClick}
              className="h-8 w-8 mr-auto"
              aria-label="لوحة الإشراف"
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:block bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold arabic-text">
                {activeChannel?.name || 'غرفة الدردشة'}
              </h2>
              <p className="text-sm text-muted-foreground arabic-text">غرفة نشطة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserProfileMenu />
            <Button
              variant="ghost"
              size="icon"
              onClick={onSoundToggle}
              className="h-8 w-8"
              aria-label="تبديل الصوت"
            >
              {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onDarkModeToggle}
              className="h-8 w-8"
              aria-label="تبديل الوضع"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <MessageSearch messages={messages} channels={channels} className="h-8 w-8" />
            {isAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onPinnedMessagesClick}
                  className="h-8 w-8"
                >
                  <Pin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onModerationClick}
                  className="h-8 w-8"
                >
                  <Shield className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearMessages}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  title="مسح جميع رسائل الغرفة"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
