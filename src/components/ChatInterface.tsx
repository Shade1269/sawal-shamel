import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Paperclip, 
  Image, 
  Video, 
  Smile,
  Users,
  Hash,
  Lock,
  Crown,
  Shield,
  MoreVertical,
  LogOut,
  Trash2,
  Play,
  Pause,
  ArrowRight,
  Settings,
  Pin,
  Search
} from 'lucide-react';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUpload from './FileUpload';
import VoiceRecorder from './VoiceRecorder';
import UserProfile from './UserProfile';
import UserActionsMenu from './UserActionsMenu';
import ModerationPanel from './ModerationPanel';
import EnhancedEmojiPicker, { parseEmojiText } from './EnhancedEmojiPicker';
import EnhancedMessageActions from './EnhancedMessageActions';
import MessageStatus from './MessageStatus';
import ThreadReply from './ThreadReply';
import ProfileSettings from './ProfileSettings';
import ChannelMembership from './ChannelMembership';
import NotificationSound from './NotificationSound';
import MessageSearch from './MessageSearch';
import PinnedMessages from './PinnedMessages';
import { supabase } from '@/integrations/supabase/client';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState('');
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showRoomsList, setShowRoomsList] = useState(true);
  const [collapsedRooms, setCollapsedRooms] = useState(false);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{id: string, content: string} | null>(null);
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { messages, channels, loading, currentProfile: hookProfile, sendMessage: sendMsg, deleteMessage } = useRealTimeChat(activeRoom);

  // Update current profile when hook profile changes
  useEffect(() => {
    if (hookProfile) {
      setCurrentProfile(hookProfile);
    }
  }, [hookProfile]);

  // Auto-scroll to bottom and handle new message notifications
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Check for new messages and play sound
      const latestMessage = messages[messages.length - 1];
      const isOwnMessage = currentProfile && latestMessage.sender_id === currentProfile.id;
      
      if (!isOwnMessage && latestMessage.created_at) {
        const messageTime = new Date(latestMessage.created_at).getTime();
        const now = Date.now();
        
        // If message is less than 5 seconds old, it's likely new
        if (now - messageTime < 5000) {
          setNewMessageAlert(true);
          // Reset alert after 3 seconds
          setTimeout(() => setNewMessageAlert(false), 3000);
        }
      }
    }
  }, [messages, currentProfile]);

  // Set default active room to first available channel
  useEffect(() => {
    if (channels.length > 0 && !activeRoom) {
      setActiveRoom(channels[0].id);
      // On mobile, hide rooms list when entering a room
      if (window.innerWidth < 768) {
        setShowRoomsList(false);
      }
    }
  }, [channels, activeRoom]);

  const sendMessage = async () => {
    if (message.trim() && activeRoom) {
      let finalContent = parseEmojiText(message.trim());
      
      // إضافة الرد إذا كان موجود
      if (replyingTo) {
        finalContent = `[رد على: ${replyingTo.content.substring(0, 50)}...] ${finalContent}`;
      }
      
      await sendMsg(finalContent);
      setMessage('');
      setReplyingTo(null);
      
      // Focus back on input
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const handleReply = (messageId: string, originalContent: string) => {
    setReplyingTo({ id: messageId, content: originalContent });
    // Focus on textarea
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error editing message:', error);
        toast({
          title: "خطأ في التعديل",
          description: "فشل في تعديل الرسالة",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    // Focus back on textarea
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const handleEmojiSend = async (emoji: string) => {
    if (activeRoom) {
      await sendMsg(emoji);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_pinned: true,
          pinned_at: new Date().toISOString(),
          pinned_by: currentProfile?.id
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error pinning message:', error);
        toast({
          title: "خطأ في التثبيت",
          description: "فشل في تثبيت الرسالة",
          variant: "destructive"
        });
      } else {
        toast({
          title: "تم التثبيت",
          description: "تم تثبيت الرسالة بنجاح"
        });
      }
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  };

  const handleUnpinMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_pinned: false,
          pinned_at: null,
          pinned_by: null
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error unpinning message:', error);
        toast({
          title: "خطأ في إلغاء التثبيت",
          description: "فشل في إلغاء تثبيت الرسالة",
          variant: "destructive"
        });
      } else {
        toast({
          title: "تم إلغاء التثبيت",
          description: "تم إلغاء تثبيت الرسالة بنجاح"
        });
      }
    } catch (error) {
      console.error('Error unpinning message:', error);
    }
  };

  const canDeleteMessage = (messageId: string, senderId: string) => {
    // User can delete their own messages, or if they're an admin/moderator
    return currentProfile && (
      currentProfile.id === senderId || 
      currentProfile.role === 'admin' || 
      currentProfile.role === 'moderator'
    );
  };

  const handleFileUpload = async (url: string, type: 'image' | 'file') => {
    if (activeRoom) {
      const content = type === 'image' ? `[صورة] ${url}` : `[ملف] ${url}`;
      await sendMsg(content, type);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    if (!activeRoom) return;

    try {
      // Upload audio file to storage
      const fileName = `voice_${Date.now()}.webm`;
      const filePath = `voice/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, audioBlob);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Send voice message
      await sendMsg(`[رسالة صوتية] ${data.publicUrl}`, 'voice');
    } catch (error) {
      console.error('Error uploading voice message:', error);
    }
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setCurrentProfile(updatedProfile);
  };

  const playAudio = (url: string, messageId: string) => {
    if (playingAudio === messageId) {
      // Stop current audio
      const audio = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio) {
        const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }
      
      // Play new audio
      const audio = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
      if (audio) {
        audio.play();
        setPlayingAudio(messageId);
        audio.onended = () => setPlayingAudio(null);
      }
    }
  };

  const renderMessageContent = (msg: any) => {
    const content = msg.content;
    
    // Handle reply messages
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
    
    // Handle image messages
    if (content.startsWith('[صورة]') || msg.message_type === 'image') {
      const imageUrl = content.replace('[صورة] ', '');
      return (
        <div className="space-y-2">
          {msg.reply_to && <ThreadReply replyToMessage={msg.reply_to} />}
          <img 
            src={imageUrl} 
            alt="مشاركة صورة" 
            className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(imageUrl, '_blank')}
          />
        </div>
      );
    }
    
    // Handle voice messages
    if (content.startsWith('[رسالة صوتية]') || msg.message_type === 'voice') {
      const audioUrl = content.replace('[رسالة صوتية] ', '');
      return (
        <div className="space-y-2">
          {msg.reply_to && <ThreadReply replyToMessage={msg.reply_to} />}
          <div className="flex items-center gap-2 bg-accent/20 rounded-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => playAudio(audioUrl, msg.id)}
              className="h-8 w-8 p-0"
            >
              {playingAudio === msg.id ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm arabic-text">رسالة صوتية</span>
            <audio id={`audio-${msg.id}`} preload="metadata">
              <source src={audioUrl} type="audio/webm" />
            </audio>
          </div>
        </div>
      );
    }
    
    // Handle file messages - IMPROVED
    if (content.startsWith('[ملف]') || msg.message_type === 'file') {
      const fileUrl = content.replace('[ملف] ', '');
      const fileName = fileUrl.split('/').pop()?.split('?')[0] || 'ملف غير معروف';
      const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
      
      return (
        <div className="space-y-2">
          {msg.reply_to && <ThreadReply replyToMessage={msg.reply_to} />}
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
    
    // Default text message
    return (
      <div className="space-y-2">
        {msg.reply_to && <ThreadReply replyToMessage={msg.reply_to} />}
        <p className="arabic-text leading-relaxed">{content}</p>
      </div>
    );
  };

  return (
    <div className="h-screen bg-chat-bg rtl flex" dir="rtl">
      {/* Mobile Back Button & Header */}
      {!showRoomsList && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-[130] bg-card border-b border-border p-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowRoomsList(true)}
            className="h-8 w-8"
            aria-label="عودة للغرف"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Hash className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-bold arabic-text">
              {channels.find(r => r.id === activeRoom)?.name || 'غرفة الدردشة'}
            </h2>
          </div>
          {(currentProfile?.role === 'admin' || currentProfile?.role === 'moderator') && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowModerationPanel(true)}
              className="h-8 w-8 mr-auto"
              aria-label="لوحة الإشراف"
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Sidebar - Rooms */}
      <div className={`${collapsedRooms ? 'w-6' : 'w-80'} transition-all duration-300 bg-card border-l border-border flex-col ${showRoomsList ? 'flex' : 'hidden'} md:flex relative`}>
        {/* Collapse Toggle */}
        <button
          aria-label={collapsedRooms ? 'Expand rooms' : 'Collapse rooms'}
          className="absolute -left-3 top-20 z-[90] bg-card border border-border rounded-full w-6 h-6 flex items-center justify-center shadow-soft hover-scale"
          onClick={() => setCollapsedRooms(v => !v)}
        >
          <span className="text-xs">{collapsedRooms ? '⟵' : '⟶'}</span>
        </button>
        {/* Header */}
        <div className={`p-4 border-b border-border ${collapsedRooms ? 'opacity-0 pointer-events-none h-0 p-0 border-0' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-bold text-lg arabic-text">دردشة عربية</h2>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="z-[100] bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/80 shadow-lg border border-border">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {currentProfile && (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentProfile.avatar_url} alt="Profile" />
                <AvatarFallback className="text-sm">
                  {(currentProfile.full_name || 'أ')[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium arabic-text">{currentProfile.full_name || 'مستخدم'}</span>
              <div className="w-2 h-2 bg-status-online rounded-full mr-auto"></div>
              {currentProfile && (
                <ProfileSettings
                  profile={currentProfile}
                  onProfileUpdate={handleProfileUpdate}
                />
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
                  onClick={() => {
                    setActiveRoom(room.id);
                    // On mobile, hide rooms list when selecting a room
                    if (window.innerWidth < 768) {
                      setShowRoomsList(false);
                    }
                  }}
                  className={`w-full text-right p-3 rounded-lg transition-colors arabic-text ${
                    activeRoom === room.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {room.type === 'private' ? 
                      <Lock className="h-4 w-4 text-muted-foreground" /> :
                      <Hash className="h-4 w-4 text-muted-foreground" />
                    }
                    <div className="flex-1">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {room.description || 'غرفة دردشة'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!showRoomsList ? 'pt-16 md:pt-0' : ''}`}>
        {/* Chat Header - Desktop Only */}
        <div className="hidden md:block bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold arabic-text">
                  {channels.find(r => r.id === activeRoom)?.name || 'غرفة الدردشة'}
                </h2>
                <p className="text-sm text-muted-foreground arabic-text">
                  غرفة نشطة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageSearch 
                messages={messages}
                channels={channels}
                className="h-8 w-8"
              />
              {(currentProfile?.role === 'admin' || currentProfile?.role === 'moderator') && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowPinnedMessages(true)}
                    className="h-8 w-8"
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowModerationPanel(true)}
                    className="h-8 w-8"
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 chat-scrollbar">
          {loading ? (
            <div className="text-center p-4 text-muted-foreground">
              جاري تحميل الرسائل...
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = currentProfile && msg.sender_id === currentProfile.id;
                const senderName = msg.sender?.full_name || 'مستخدم';
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 message-appear group ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={msg.sender?.avatar_url} alt="Profile" />
                      <AvatarFallback className="text-sm">
                        {senderName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-left' : 'text-right'} group relative`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium arabic-text">{senderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString('ar-SA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {msg.edited_at && (
                          <span className="text-xs text-muted-foreground">(معدّلة)</span>
                        )}
                        <div className="mr-auto flex items-center gap-1">
                          <EnhancedMessageActions
                            message={msg}
                            currentProfile={currentProfile}
                            onReply={handleReply}
                            onEdit={handleEditMessage}
                            onDelete={deleteMessage}
                            onPin={handlePinMessage}
                            onUnpin={handleUnpinMessage}
                            isOwnMessage={isOwn}
                          />
                          {!isOwn && msg.sender && (
                            <UserActionsMenu
                              user={{
                                id: msg.sender.id,
                                full_name: msg.sender.full_name || 'مستخدم',
                                email: msg.sender.email || ''
                              }}
                              currentProfile={currentProfile}
                              activeChannelId={activeRoom}
                              isOwnMessage={isOwn}
                            />
                          )}
                          {isOwn && (
                            <MessageStatus status={msg.status} className="ml-1" />
                          )}
                        </div>
                      </div>
                      <div className={`p-3 rounded-2xl shadow-soft relative transition-all hover:shadow-md ${
                        isOwn 
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-white rounded-br-sm ml-auto' 
                          : 'bg-white dark:bg-card rounded-bl-sm border border-border/50'
                      }`}>
                        {msg.is_pinned && (
                          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Pin className="h-3 w-3" />
                          </div>
                        )}
                        
                        {renderMessageContent(msg)}
                        
                        {canDeleteMessage(msg.id, msg.sender_id) && (
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded text-xs hover:bg-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Notification Sound */}
        <NotificationSound 
          enabled={true} 
          onNewMessage={newMessageAlert} 
        />

        {/* Message Input */}
        <div className="bg-card border-t border-border p-4">
          {/* Reply Preview */}
          {replyingTo && (
            <div className="mb-3 p-2 bg-accent/20 rounded-lg border-r-2 border-primary">
              <div className="flex items-center justify-between">
                <div className="text-sm arabic-text">
                  <span className="text-muted-foreground">رد على: </span>
                  <span>{replyingTo.content.substring(0, 50)}...</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <div className="flex gap-1">
              <FileUpload
                onFileUpload={handleFileUpload}
                accept="image/*"
                maxSize={5}
              />
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
              />
              <EnhancedEmojiPicker 
                onEmojiSelect={handleEmojiSelect}
              />
            </div>
            <div className="flex-1 flex gap-2">
              <Textarea
                ref={messageInputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={replyingTo ? "اكتب ردك هنا..." : "اكتب رسالتك هنا..."}
                className="flex-1 arabic-text min-h-12 md:min-h-14 max-h-40 resize-none overflow-y-auto"
                onKeyDown={handleKeyDown}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 320) + 'px';
                }}
                disabled={!activeRoom}
                rows={2}
              />
              <Button 
                onClick={sendMessage}
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
        {/* Rooms list (content) - hidden when collapsed) */}
        {!collapsedRooms && (
          <div className="flex-1 overflow-auto">
            {/* Search and pinned */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowPinnedMessages(true)}>
                  <Pin className="h-4 w-4 ml-1" /> المثبتة
                </Button>
                <div className="ml-auto">
                  <MessageSearch messages={messages} />
                </div>
              </div>
            </div>

            {/* Channels list */}
            <div className="p-2 space-y-1">
              {channels.map((room) => (
                <Button
                  key={room.id}
                  variant={activeRoom === room.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start arabic-text"
                  onClick={() => setActiveRoom(room.id)}
                >
                  <Hash className="h-4 w-4 ml-2" /> {room.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;