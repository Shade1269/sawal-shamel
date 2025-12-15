import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  Wand2,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  changes?: string[];
}

interface StoreDesignChatProps {
  storeId: string;
  storeName?: string;
}

const quickSuggestions = [
  { label: 'ثيم فاخر', prompt: 'أريد ثيم فاخر بألوان ذهبية' },
  { label: 'ثيم عصري', prompt: 'غير الثيم لعصري بألوان زرقاء' },
  { label: 'ثيم أنثوي', prompt: 'أريد ستايل أنثوي ناعم' },
  { label: 'ثيم بسيط', prompt: 'خلي التصميم minimal وبسيط' },
];

export const StoreDesignChat: React.FC<StoreDesignChatProps> = ({ storeId, storeName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `مرحباً! 👋 أنا مساعدك لتصميم متجرك "${storeName || 'الخاص بك'}". 

أقدر أساعدك في:
• تغيير الألوان والثيم
• تعديل البنر الرئيسي
• تغيير طريقة عرض المنتجات
• تخصيص شكل المتجر

جربي تقولي مثلاً: "أريد ثيم وردي فاخر" أو "غير لون البنر للأزرق" 🎨`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('store-design-brain', {
        body: {
          message: text,
          store_id: storeId,
          conversation_history: messages.slice(-10) // Last 10 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message || 'تم استلام طلبك',
        timestamp: new Date().toISOString(),
        changes: data.changes_applied
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.changes_applied?.length > 0) {
        toast.success('تم تطبيق التغييرات! أعد تحميل صفحة المتجر لرؤية النتيجة');
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'عذراً، حدث خطأ. جربي مرة ثانية 🙏',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('فشل في إرسال الرسالة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <span>مصمم المتجر الذكي</span>
          <Badge variant="secondary" className="mr-auto">AI</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  
                  {msg.changes && msg.changes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <p className="text-xs opacity-70 mb-1">التغييرات المطبقة:</p>
                      {msg.changes.map((change, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>{change}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">جاري التفكير...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick suggestions */}
        <div className="px-4 py-2 border-t border-border/30">
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => sendMessage(suggestion.prompt)}
                disabled={isLoading}
              >
                <Sparkles className="h-3 w-3 ml-1" />
                {suggestion.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتبي طلبك هنا... مثال: أريد ثيم وردي"
              className="flex-1"
              disabled={isLoading}
              dir="rtl"
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreDesignChat;
