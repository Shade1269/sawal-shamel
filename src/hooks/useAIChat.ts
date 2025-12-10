import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseAIChatOptions {
  systemContext?: string;
  storeInfo?: {
    store_name?: string;
    bio?: string;
  };
  products?: any[];
}

export const useAIChat = (options: UseAIChatOptions = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    setError(null);
    
    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      abortControllerRef.current = new AbortController();

      // Prepare messages for API
      const apiMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: apiMessages,
          storeInfo: options.storeInfo,
          products: options.products,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'فشل في الاتصال بالمساعد الذكي');
      }

      // Handle streaming response
      const reader = response.data?.getReader?.();
      
      if (reader) {
        const decoder = new TextDecoder();
        let assistantContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setMessages(prev => 
                    prev.map(m => 
                      m.id === assistantId 
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  );
                }
              } catch {
                // Ignore parse errors for incomplete JSON
              }
            }
          }
        }
      } else if (typeof response.data === 'string') {
        // Non-streaming response
        setMessages(prev => 
          prev.map(m => 
            m.id === assistantId 
              ? { ...m, content: response.data }
              : m
          )
        );
      } else if (response.data?.error) {
        throw new Error(response.data.error);
      }

    } catch (err) {
      console.error('AI Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, options.storeInfo, options.products]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGeneration,
  };
};
