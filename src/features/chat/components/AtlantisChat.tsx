import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Send, 
  Hash, 
  Crown,
  Shield,
  Users,
  MoreVertical,
  Trash2,
  Reply,
  Heart,
  Smile,
  Pin,
  Copy,
  Edit3,
  ArrowLeft,
  Mic,
  Image,
  Paperclip
} from 'lucide-react';
import { useAtlantisChat } from '@/hooks/useAtlantisChat';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import EnhancedEmojiPicker from './EnhancedEmojiPicker';
import VoiceRecorder from './VoiceRecorder'; 
import { FileUpload } from '@/shared/components';

const AtlantisChat = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    messages,
    rooms,
    currentRoom,
    members,
    currentMember,
    currentProfile,
    loading,
    typingUsers,
    sendMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    startTyping,
    stopTyping,
    canDeleteMessage,
    canModerateRoom
  } = useAtlantisChat(roomId || '');

  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; sender: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // التمرير التلقائي للأسفل
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.trim() && startTyping) {
      startTyping();
    } else if (!value.trim() && stopTyping) {
      stopTyping();
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      await sendMessage(message.trim(), 'text', replyingTo?.id);
      setMessage('');
      setReplyingTo(null);
      
      if (stopTyping) {
        stopTyping();
      }
      
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReply = (messageId: string, content: string, senderName: string) => {
    setReplyingTo({ id: messageId, content, sender: senderName });
    messageInputRef.current?.focus();
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "تم النسخ",
      description: "تم نسخ محتوى الرسالة"
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    if (selectedMessage) {
      addReaction(selectedMessage, emoji);
      setSelectedMessage(null);
    } else {
      setMessage(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    try {
      // إنشاء FormData لرفع الملف الصوتي
      const formData = new FormData();
      const fileName = `voice_${Date.now()}.webm`;
      formData.append('file', audioBlob, fileName);

      // رفع الملف إلى Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(`voice/${fileName}`, audioBlob, {
          contentType: 'audio/webm',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading voice:', uploadError);
        toast({
          title: "خطأ في رفع الرسالة الصوتية",
          description: uploadError.message,
          variant: "destructive"
        });
        return;
      }

      // الحصول على رابط الملف
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(uploadData.path);

      // إرسال الرسالة مع رابط الملف الصوتي
      await sendMessage(`[رسالة صوتية] ${urlData.publicUrl}`, 'voice');
      
      toast({
        title: "تم إرسال الرسالة الصوتية",
        description: "تم رفع وإرسال الرسالة الصوتية بنجاح"
      });
      
    } catch (error) {
      console.error('Error handling voice recording:', error);
      toast({
        title: "خطأ في معالجة الرسالة الصوتية",
        description: "حدث خطأ أثناء معالجة الرسالة الصوتية",
        variant: "destructive"
      });
    } finally {
      setShowVoiceRecorder(false);
    }
  };

  const handleFileUpload = async (url: string, type: 'image' | 'file') => {
    const content = type === 'image' ? `[صورة] ${url}` : `[ملف] ${url}`;
    await sendMessage(content, type);
    setShowFileUpload(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-destructive" />;
      case 'moderator':
        return <Shield className="h-3 w-3 text-accent" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleNames = {
      owner: 'مالك',
      admin: 'مدير',
      moderator: 'مشرف',
      member: 'عضو'
    };
    
    const roleColors = {
      owner: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-destructive/10 text-destructive',
      moderator: 'bg-accent/10 text-accent-foreground',
      member: 'bg-muted text-muted-foreground'
    };

    return (
      <Badge className={`text-xs ${roleColors[role as keyof typeof roleColors] || roleColors.member}`}>
        {roleNames[role as keyof typeof roleNames] || role}
      </Badge>
    );
  };

  const getTypingUsers = () => {
    const typing = Object.values(typingUsers).filter((user: any) => 
      user.typing && user.user_id !== currentProfile?.id
    );
    
    if (typing.length === 0) return null;
    if (typing.length === 1) return `${typing[0].full_name} يكتب...`;
    if (typing.length === 2) return `${typing[0].full_name} و ${typing[1].full_name} يكتبان...`;
    return `${typing.length} أشخاص يكتبون...`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الدردشة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/atlantis')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                العودة لأتلانتس
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                  <Hash className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{currentRoom?.name || 'غرفة الدردشة'}</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentRoom?.description || 'دردشة أتلانتس'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Users className="h-4 w-4" />
                    {members.length} عضو
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>أعضاء الغرفة</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-3">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.user?.full_name?.charAt(0) || 'م'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">
                                {member.user?.full_name || 'مستخدم'}
                              </p>
                              {getRoleIcon(member.role)}
                            </div>
                            {getRoleBadge(member.role)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <Card className="h-[calc(100vh-200px)] flex flex-col bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 group ${
                      msg.sender_id === currentProfile?.id ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={msg.sender?.avatar_url || undefined} />
                      <AvatarFallback>
                        {msg.sender?.full_name?.charAt(0) || 'م'}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex-1 min-w-0 ${msg.sender_id === currentProfile?.id ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {msg.sender?.full_name || 'مستخدم'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.created_at), { 
                            addSuffix: true, 
                            locale: ar 
                          })}
                        </span>
                        {msg.is_edited && (
                          <Badge variant="secondary" className="text-xs">معدّل</Badge>
                        )}
                        {msg.is_pinned && (
                          <Pin className="h-3 w-3 text-primary" />
                        )}
                      </div>

                      {msg.reply_to && (
                        <div className="bg-muted/50 border-l-2 border-primary p-2 mb-2 rounded-r text-sm">
                          <span className="text-muted-foreground">
                            رد على {msg.reply_to.sender?.full_name}:
                          </span>
                          <p className="text-muted-foreground line-clamp-2">
                            {msg.reply_to.content}
                          </p>
                        </div>
                      )}

                      <div 
                        className={`p-3 rounded-lg max-w-xs ${
                          msg.sender_id === currentProfile?.id
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        
                        {Object.keys(msg.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(msg.reactions).map(([emoji, users]) => (
                              <Button
                                key={emoji}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => {
                                  if (users.includes(currentProfile?.id || '')) {
                                    removeReaction(msg.id, emoji);
                                  } else {
                                    addReaction(msg.id, emoji);
                                  }
                                }}
                              >
                                {emoji} {users.length}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* أفعال الرسالة */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReply(msg.id, msg.content, msg.sender?.full_name || 'مستخدم')}
                          >
                            <Reply className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMessage(msg.id);
                              setShowEmojiPicker(true);
                            }}
                          >
                            <Smile className="h-3 w-3" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCopyMessage(msg.content)}>
                                <Copy className="h-4 w-4 mr-2" />
                                نسخ
                              </DropdownMenuItem>
                              
                              {canDeleteMessage(msg) && (
                                <DropdownMenuItem 
                                  onClick={() => deleteMessage(msg.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  حذف
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* مؤشر الكتابة */}
                {getTypingUsers() && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>{getTypingUsers()}</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* منطقة الإدخال */}
          <div className="border-t p-4 bg-card/80">
            {replyingTo && (
              <div className="bg-muted/50 border-l-2 border-primary p-2 mb-3 rounded-r">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      رد على {replyingTo.sender}:
                    </span>
                    <p className="text-sm line-clamp-1">{replyingTo.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(true)}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVoiceRecorder(true)}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(true)}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              <Textarea
                ref={messageInputRef}
                value={message}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 min-h-[40px] max-h-32 resize-none"
                disabled={currentMember?.is_muted && currentMember.muted_until && new Date(currentMember.muted_until) > new Date()}
              />

              <Button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* نوافذ حوارية */}
      {showEmojiPicker && (
        <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>اختر رمز تعبيري</DialogTitle>
            </DialogHeader>
            <EnhancedEmojiPicker
              onEmojiSelect={handleEmojiSelect}
            />
          </DialogContent>
        </Dialog>
      )}

      {showVoiceRecorder && (
        <Dialog open={showVoiceRecorder} onOpenChange={setShowVoiceRecorder}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تسجيل رسالة صوتية</DialogTitle>
            </DialogHeader>
            <VoiceRecorder
              onRecordingComplete={handleVoiceRecording}
            />
          </DialogContent>
        </Dialog>
      )}

      {showFileUpload && (
        <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>رفع ملف</DialogTitle>
            </DialogHeader>
            <FileUpload
              onFileUpload={handleFileUpload}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AtlantisChat;