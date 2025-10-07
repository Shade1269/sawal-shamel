import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useCustomerServiceChat } from '@/hooks/useCustomerServiceChat';

interface CustomerChatWidgetProps {
  storeId: string;
  storeName: string;
  customerProfileId?: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export const CustomerChatWidget: React.FC<CustomerChatWidgetProps> = ({
  storeId,
  storeName,
  customerProfileId,
  isAuthenticated,
  onAuthRequired
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentRoomId,
    messages,
    loading,
    initiateChatWithStore,
    sendMessage,
    startTyping,
    stopTyping
  } = useCustomerServiceChat({
    storeId,
    customerProfileId,
    isStoreOwner: false
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleOpen = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    setIsOpen(true);
    if (!currentRoomId) {
      await initiateChatWithStore();
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      await sendMessage(messageText.trim());
      setMessageText('');
      stopTyping();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (e.target.value.trim()) {
      startTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
          onClick={handleOpen}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          dir="rtl"
        >
          <MessageCircle className="h-6 w-6" />
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
      <Card className={`w-80 shadow-xl border-2 ${isMinimized ? 'h-auto' : 'h-96'}`} dir="rtl">
        <CardHeader className="p-3 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <CardTitle className="text-sm">{storeName}</CardTitle>
            </div>

            <div className="flex items-center gap-1">
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
                onClick={() => setIsOpen(false)}
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
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        جاري التحميل...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>مرحباً! كيف يمكننا مساعدتك؟</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${
                            message.sender_id === customerProfileId ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.sender_id !== customerProfileId && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.sender?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {message.sender?.full_name?.charAt(0) || 'م'}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                              message.sender_id === customerProfileId
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {format(new Date(message.created_at), 'HH:mm', { locale: ar })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-3 border-t bg-background/50">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={messageText}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 text-sm"
                      disabled={loading}
                    />

                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="h-10 w-10"
                      disabled={!messageText.trim() || loading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
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
