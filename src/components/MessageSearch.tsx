import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User, Hash, X, Filter } from 'lucide-react';
import { Message } from '@/hooks/useRealTimeChat';

interface MessageSearchProps {
  messages: Message[];
  channels: any[];
  onJumpToMessage?: (messageId: string) => void;
  className?: string;
}

const MessageSearch: React.FC<MessageSearchProps> = ({
  messages,
  channels,
  onJumpToMessage,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // فلترة الرسائل بناءً على البحث
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return [];

    return messages.filter(message => {
      const matchesQuery = message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          message.sender?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesChannel = selectedChannel === 'all' || message.channel_id === selectedChannel;
      
      const matchesDate = !selectedDate || 
                         new Date(message.created_at).toDateString() === new Date(selectedDate).toDateString();

      return matchesQuery && matchesChannel && matchesDate;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [messages, searchQuery, selectedChannel, selectedDate]);

  // تسليط الضوء على النص المطابق
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedChannel('all');
    setSelectedDate('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl rtl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="arabic-text flex items-center gap-2">
            <Search className="h-5 w-5" />
            البحث في الرسائل
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* شريط البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث في الرسائل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 arabic-text"
            />
          </div>

          {/* فلاتر */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm arabic-text flex items-center gap-2">
                <Filter className="h-4 w-4" />
                تصفية النتائج
                {(selectedChannel !== 'all' || selectedDate) && (
                  <Button size="sm" variant="ghost" onClick={clearFilters} className="h-6 px-2">
                    <X className="h-3 w-3 ml-1" />
                    مسح
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium arabic-text">القناة</label>
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm arabic-text"
                  >
                    <option value="all">جميع القنوات</option>
                    {channels.map(channel => (
                      <option key={channel.id} value={channel.id}>{channel.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium arabic-text">التاريخ</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* النتائج */}
          <div className="min-h-[300px]">
            {searchQuery.trim() && (
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground arabic-text">
                  {filteredMessages.length} نتيجة
                </span>
              </div>
            )}

            <ScrollArea className="h-[300px]">
              {!searchQuery.trim() ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Search className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm arabic-text">اكتب للبحث في الرسائل</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Search className="h-12 w-12 mb-3 opacity-50" />
                  <p className="text-sm arabic-text">لا توجد نتائج مطابقة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMessages.map((message) => (
                    <Card key={message.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={message.sender?.avatar_url} alt="Profile" />
                            <AvatarFallback className="text-xs">
                              {(message.sender?.full_name || 'أ')[0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium arabic-text">
                                {message.sender?.full_name || 'مستخدم'}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                <Hash className="h-2 w-2 ml-1" />
                                {channels.find(c => c.id === message.channel_id)?.name}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.created_at).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            
                            <p className="text-sm arabic-text leading-relaxed">
                              {highlightText(message.content, searchQuery)}
                            </p>
                            
                            {onJumpToMessage && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="mt-2 h-6 px-2 text-xs"
                                onClick={() => {
                                  onJumpToMessage(message.id);
                                  setOpen(false);
                                }}
                              >
                                الانتقال للرسالة
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSearch;