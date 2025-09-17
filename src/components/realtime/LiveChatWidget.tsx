import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Users, Headphones, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLiveChat } from '@/hooks/useLiveChat';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveChatWidgetProps {
  defaultRoom?: string;
  showUserList?: boolean;
  enableSupportRequests?: boolean;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  defaultRoom = 'general',
  showUserList = true,
  enableSupportRequests = true,
}) => {
  const { user } = useSupabaseAuth();
  const {
    messages,
    connectedUsers,
    isConnected,
    isTyping: currentUserTyping,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    requestSupport,
    currentRoom,
  } = useLiveChat();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [supportTitle, setSupportTitle] = useState('');
  const [supportDescription, setSupportDescription] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join default room when widget opens
  useEffect(() => {
    if (isOpen && !currentRoom && user?.id) {
      joinRoom(defaultRoom);
    }
  }, [isOpen, currentRoom, user?.id, joinRoom, defaultRoom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = () => {
    if (messageText.trim() && currentRoom) {
      sendMessage(messageText.trim());
      setMessageText('');
      stopTyping();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    
    // Handle typing indicators
    if (e.target.value && !currentUserTyping) {
      startTyping();
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSupportRequest = () => {
    if (supportTitle.trim() && supportDescription.trim()) {
      requestSupport(supportTitle.trim(), supportDescription.trim());
      setSupportTitle('');
      setSupportDescription('');
      setShowSupportDialog(false);
    }
  };

  const typingUsers = connectedUsers.filter(u => u.isTyping && u.userId !== user?.id);
  const onlineUsers = connectedUsers.filter(u => u.isOnline);

  // Chat bubble for closed state
  if (!isOpen) {
    return (
      <motion.div
        className="fixed bottom-6 left-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 relative"
        >
          <MessageCircle className="h-6 w-6" />
          {onlineUsers.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center">
              {onlineUsers.length}
            </Badge>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className={`w-80 shadow-xl border-2 ${isMinimized ? 'h-auto' : 'h-96'}`}>
        <CardHeader className="p-3 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <CardTitle className="text-sm">
                الدردشة المباشرة
              </CardTitle>
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
            
            <div className="flex items-center gap-1">
              {showUserList && onlineUsers.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {onlineUsers.length}
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => {
                  setIsOpen(false);
                  leaveRoom();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="p-0 flex flex-col h-80">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>مرحباً! ابدأ المحادثة</p>
                        {enableSupportRequests && (
                          <p className="text-xs mt-1">
                            أو اطلب المساعدة من الدعم الفني
                          </p>
                        )}
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${
                            message.user_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.user_id !== user?.id && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.user?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {message.user?.username?.charAt(0) || 'م'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                              message.user_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                                locale: ar,
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
                          <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span>
                          {typingUsers.length === 1 
                            ? 'شخص يكتب...'
                            : `${typingUsers.length} أشخاص يكتبون...`
                          }
                        </span>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-3 border-t bg-background/50">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={messageText}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 text-sm"
                      disabled={!isConnected || !currentRoom}
                    />
                    
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="h-10 w-10"
                      disabled={!messageText.trim() || !isConnected || !currentRoom}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    
                    {enableSupportRequests && (
                      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-10 w-10">
                            <Headphones className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>طلب دعم فني</DialogTitle>
                            <DialogDescription>
                              صف مشكلتك وسيتم التواصل معك قريباً
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="support-title">عنوان المشكلة</Label>
                              <Input
                                id="support-title"
                                value={supportTitle}
                                onChange={(e) => setSupportTitle(e.target.value)}
                                placeholder="مثال: مشكلة في الدفع"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="support-description">وصف المشكلة</Label>
                              <Textarea
                                id="support-description"
                                value={supportDescription}
                                onChange={(e) => setSupportDescription(e.target.value)}
                                placeholder="اشرح المشكلة بالتفصيل..."
                                rows={4}
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button
                              onClick={handleSupportRequest}
                              disabled={!supportTitle.trim() || !supportDescription.trim()}
                            >
                              إرسال طلب الدعم
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default LiveChatWidget;