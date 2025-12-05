import React, { useState } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { MessageCircle, Send, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useCustomerServiceChat } from '@/hooks/useCustomerServiceChat';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface StoreOwnerChatPanelProps {
  storeId: string;
}

export const StoreOwnerChatPanel: React.FC<StoreOwnerChatPanelProps> = ({ storeId }) => {
  const { user } = useSupabaseAuth();
  const [messageText, setMessageText] = useState('');
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const {
    currentRoomId,
    messages,
    rooms,
    loading,
    loadMessages,
    sendMessage,
    setCurrentRoomId
  } = useCustomerServiceChat({
    storeId,
    isStoreOwner: true
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        if (data) setCurrentProfileId(data.id);
      }
    };
    fetchProfile();
  }, [user]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectRoom = async (roomId: string) => {
    setCurrentRoomId(roomId);
    await loadMessages(roomId);
  };

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      await sendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]" dir="rtl">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            المحادثات ({rooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {rooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد محادثات حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {rooms.map((room: any) => (
                  <motion.button
                    key={room.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSelectRoom(room.id)}
                    className={`w-full p-3 rounded-lg text-right transition-colors ${
                      currentRoomId === room.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {room.profiles?.full_name?.charAt(0) || 'ع'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {room.profiles?.full_name || 'عميل'}
                        </p>
                        <p className="text-xs opacity-70">
                          {format(new Date(room.last_message_at), 'dd MMM, HH:mm', { locale: ar })}
                        </p>
                      </div>
                      {room.unread_count > 0 && (
                        <Badge className="bg-destructive">
                          {room.unread_count}
                        </Badge>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {currentRoomId ? 'المحادثة' : 'اختر محادثة'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {currentRoomId ? (
            <div className="flex flex-col h-[500px]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender?.id === currentProfileId;
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {message.sender?.full_name?.charAt(0) || 'ع'}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isOwnMessage
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
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب رسالتك..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || loading}
                  >
                    <Send className="h-4 w-4 ml-2" />
                    إرسال
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>اختر محادثة لعرض الرسائل</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
