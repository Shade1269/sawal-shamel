import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, Loader2, Sparkles, Package, DollarSign, TrendingUp } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StoreStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSales: number;
  totalCommissions: number;
  pendingCommissions: number;
  productsCount: number;
}

interface MarketerBrainChatProps {
  storeId: string;
}

const MarketerBrainChat: React.FC<MarketerBrainChatProps> = ({ storeId }) => {
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();
      if (data) setProfileId(data.id);
    };
    fetchProfileId();
  }, [user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !storeId || !profileId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://uewuiiopkctdtaexmtxu.supabase.co/functions/v1/marketer-brain',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            message: userMessage.content,
            storeId,
            profileId
          })
        }
      );

      const data = await response.json();

      if (data.storeStats) {
        setStats(data.storeStats);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'عذراً، لم أتمكن من الرد.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    { icon: Package, text: 'كم طلب عندي؟', query: 'كم عدد الطلبات في متجري؟' },
    { icon: DollarSign, text: 'عمولاتي', query: 'كم عمولاتي الحالية؟' },
    { icon: TrendingUp, text: 'ملخص المبيعات', query: 'أعطني ملخص عن مبيعاتي' },
  ];

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          عقل متجرك الذكي
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-primary/10 p-2">
              <div className="font-bold text-primary">{stats.totalOrders}</div>
              <div className="text-muted-foreground">طلب</div>
            </div>
            <div className="rounded-lg bg-secondary/30 p-2">
              <div className="font-bold text-secondary-foreground">{stats.totalSales.toFixed(0)} ر.س</div>
              <div className="text-muted-foreground">مبيعات</div>
            </div>
            <div className="rounded-lg bg-accent/20 p-2">
              <div className="font-bold text-accent-foreground">{stats.totalCommissions.toFixed(0)} ر.س</div>
              <div className="text-muted-foreground">عمولات</div>
            </div>
          </div>
        )}

        {/* Quick Questions */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setInput(q.query);
                  setTimeout(() => sendMessage(), 100);
                }}
              >
                <q.icon className="h-3 w-3 ml-1" />
                {q.text}
              </Button>
            ))}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="h-[250px] rounded-lg border border-border/30 p-3" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <Sparkles className="mb-2 h-8 w-8 text-primary/50" />
              <p className="text-sm">مرحباً! أنا عقل متجرك الذكي</p>
              <p className="text-xs">اسأليني عن طلباتك، مبيعاتك، أو عمولاتك</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="اسألي عن متجرك..."
            className="flex-1 text-sm"
            disabled={isLoading || !profileId}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || !profileId}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketerBrainChat;
