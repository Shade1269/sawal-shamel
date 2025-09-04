import React, { useState, useEffect } from 'react';
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
  Pause
} from 'lucide-react';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FileUpload from './FileUpload';
import VoiceRecorder from './VoiceRecorder';
import UserProfile from './UserProfile';
import { supabase } from '@/integrations/supabase/client';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState('');
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { messages, channels, loading, currentProfile: hookProfile, sendMessage: sendMsg, deleteMessage } = useRealTimeChat(activeRoom);

  // Update current profile when hook profile changes
  useEffect(() => {
    if (hookProfile) {
      setCurrentProfile(hookProfile);
    }
  }, [hookProfile]);

  // Set default active room to first available channel
  useEffect(() => {
    if (channels.length > 0 && !activeRoom) {
      setActiveRoom(channels[0].id);
    }
  }, [channels, activeRoom]);

  const sendMessage = async () => {
    if (message.trim() && activeRoom) {
      await sendMsg(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const canDeleteMessage = (messageId: string, senderId: string) => {
    // User can delete their own messages, or if they're an admin
    return currentProfile && (currentProfile.id === senderId || currentProfile.role === 'admin');
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
    
    // Handle image messages
    if (content.startsWith('[صورة]') || msg.message_type === 'image') {
      const imageUrl = content.replace('[صورة] ', '');
      return (
        <div className="space-y-2">
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
      );
    }
    
    // Handle file messages
    if (content.startsWith('[ملف]') || msg.message_type === 'file') {
      const fileUrl = content.replace('[ملف] ', '');
      const fileName = fileUrl.split('/').pop() || 'ملف';
      return (
        <div className="flex items-center gap-2 bg-accent/20 rounded-lg p-2">
          <Paperclip className="h-4 w-4" />
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm arabic-text hover:underline"
          >
            {fileName}
          </a>
        </div>
      );
    }
    
    // Default text message
    return <p className="arabic-text leading-relaxed">{content}</p>;
  };

  return (
    <div className="h-screen bg-chat-bg rtl flex" dir="rtl">
      {/* Sidebar - Rooms */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
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
              <DropdownMenuContent align="start">
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
              <UserProfile 
                profile={currentProfile} 
                onProfileUpdate={handleProfileUpdate}
              />
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
                  onClick={() => setActiveRoom(room.id)}
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
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-card border-b border-border p-4">
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
              <Badge variant="secondary" className="arabic-text">
                <Users className="h-3 w-3 ml-1" />
                متصل
              </Badge>
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
                const senderName = msg.sender?.full_name || msg.sender?.email?.split('@')[0] || 'مستخدم';
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 message-appear ${isOwn ? 'flex-row-reverse' : ''}`}
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
                      </div>
                      <div className={`p-3 rounded-2xl shadow-soft relative ${
                        isOwn 
                          ? 'bg-chat-sent text-white rounded-br-sm' 
                          : 'bg-chat-received rounded-bl-sm'
                      }`}>
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

        {/* Message Input */}
        <div className="bg-card border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <FileUpload
                onFileUpload={handleFileUpload}
                accept="image/*"
                maxSize={5}
              />
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
              />
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
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
                className="shadow-soft"
                disabled={!message.trim() || !activeRoom}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold arabic-text">الأعضاء المتصلون</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {currentProfile && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentProfile.avatar_url} alt="Profile" />
                  <AvatarFallback className="text-sm">
                    {(currentProfile.full_name || 'أ')[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate arabic-text">{currentProfile.full_name || 'أنت'}</div>
                  <div className="w-2 h-2 rounded-full bg-status-online"></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ChatInterface;