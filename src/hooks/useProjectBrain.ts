import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BrainAction {
  id: string;
  type: 'monitoring' | 'prediction' | 'auto_fix' | 'decision' | 'alert';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  data?: any;
  timestamp: string;
  auto_executed?: boolean;
}

export interface BrainPrediction {
  type: string;
  title: string;
  description: string;
  confidence: number;
  suggestion: string;
  predicted_impact?: string;
}

export interface BrainStats {
  users: {
    total: number;
    active_week: number;
    growth_rate: number;
  };
  orders: {
    total: number;
    today: number;
    week: number;
    month: number;
    pending: number;
    delivered: number;
    avg_daily: number;
    today_progress: number;
  };
  products: { total: number };
  stores: { total: number };
  memory: {
    total_memories: number;
    active_patterns: number;
  };
}

export interface BrainReport {
  generated_at: string;
  summary: string;
  health_score: number;
  actions: BrainAction[];
  predictions: BrainPrediction[];
  stats: BrainStats;
  recommendations: string[];
  personality?: string;
}

export interface ChatMessage {
  role: 'user' | 'brain';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const useProjectBrain = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [report, setReport] = useState<BrainReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Conversation management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  // Get current conversation's messages
  const chatHistory = conversations.find(c => c.id === activeConversationId)?.messages || [];

  // Load all conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const { data, error } = await supabase
        .from('brain_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const loaded: Conversation[] = (data || []).map(conv => ({
        id: conv.id,
        title: conv.context_summary || 'محادثة جديدة',
        messages: Array.isArray(conv.messages) ? (conv.messages as unknown as ChatMessage[]) : [],
        created_at: conv.session_start,
        updated_at: conv.last_message_at,
        is_active: conv.is_active || false
      }));

      setConversations(loaded);
      
      // Auto-select first conversation if exists and none selected
      if (loaded.length > 0 && !activeConversationId) {
        setActiveConversationId(loaded[0].id);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [activeConversationId]);

  const createNewConversation = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('brain_conversations')
        .insert({
          messages: [],
          context_summary: 'محادثة جديدة',
          is_active: true,
          session_start: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const newConv: Conversation = {
        id: data.id,
        title: 'محادثة جديدة',
        messages: [],
        created_at: data.session_start,
        updated_at: data.last_message_at,
        is_active: true
      };

      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      
      return newConv.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast.error('فشل في إنشاء محادثة جديدة');
      return null;
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('brain_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (activeConversationId === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        setActiveConversationId(remaining[0]?.id || null);
      }

      toast.success('تم حذف المحادثة');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      toast.error('فشل في حذف المحادثة');
    }
  }, [activeConversationId, conversations]);

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  const think = useCallback(async (autoFix = false) => {
    setIsThinking(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('project-brain', {
        body: { action: 'full_scan', auto_fix: autoFix }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.report) {
        setReport(data.report);
        
        const criticalCount = data.report.actions.filter((a: BrainAction) => a.severity === 'critical').length;
        const autoFixCount = data.report.actions.filter((a: BrainAction) => a.auto_executed).length;
        
        if (criticalCount > 0) {
          toast.error(`🧠 اكتشف العقل ${criticalCount} مشكلة حرجة!`);
        } else if (autoFixCount > 0) {
          toast.success(`🧠 قام العقل بإصلاح ${autoFixCount} مشكلة تلقائياً`);
        } else {
          toast.success('🧠 التحليل اكتمل بنجاح');
        }
      } else {
        throw new Error(data?.error || 'فشل التحليل');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ غير معروف';
      setError(message);
      toast.error('فشل في تشغيل العقل: ' + message);
    } finally {
      setIsThinking(false);
    }
  }, []);

  const askBrain = useCallback(async (question: string) => {
    if (!question.trim()) return;

    let convId = activeConversationId;
    
    // Create new conversation if none exists
    if (!convId) {
      convId = await createNewConversation();
      if (!convId) return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    // Optimistically update local state
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage],
          updated_at: new Date().toISOString()
        };
      }
      return conv;
    }));

    setIsThinking(true);

    try {
      // Get current conversation messages for context
      const currentConv = conversations.find(c => c.id === convId);
      const existingMessages = currentConv?.messages || [];
      const allMessages = [...existingMessages, userMessage];

      const { data, error: fnError } = await supabase.functions.invoke('project-brain', {
        body: { 
          action: 'question', 
          question,
          conversation_id: convId,
          conversation_history: allMessages
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.report) {
        setReport(data.report);
        
        const brainMessage: ChatMessage = {
          role: 'brain',
          content: data.report.summary,
          timestamp: new Date().toISOString()
        };

        const updatedMessages = [...allMessages, brainMessage];
        
        // Update local state
        setConversations(prev => prev.map(conv => {
          if (conv.id === convId) {
            // Generate title from first message
            const title = allMessages.length === 1 
              ? question.substring(0, 50) + (question.length > 50 ? '...' : '')
              : conv.title;
            return {
              ...conv,
              title,
              messages: updatedMessages,
              updated_at: new Date().toISOString()
            };
          }
          return conv;
        }));

        // Save to database
        await supabase
          .from('brain_conversations')
          .update({
            messages: updatedMessages as unknown as any,
            context_summary: allMessages.length === 1 
              ? question.substring(0, 100) 
              : conversations.find(c => c.id === convId)?.title,
            last_message_at: new Date().toISOString()
          })
          .eq('id', convId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ';
      const errorMessage: ChatMessage = {
        role: 'brain',
        content: 'عذراً، حدث خطأ في التفكير: ' + message,
        timestamp: new Date().toISOString()
      };
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === convId) {
          return {
            ...conv,
            messages: [...conv.messages, errorMessage],
            updated_at: new Date().toISOString()
          };
        }
        return conv;
      }));
    } finally {
      setIsThinking(false);
    }
  }, [activeConversationId, conversations, createNewConversation]);

  const clearChat = useCallback(async () => {
    if (!activeConversationId) return;
    
    try {
      await supabase
        .from('brain_conversations')
        .update({
          messages: [],
          last_message_at: new Date().toISOString()
        })
        .eq('id', activeConversationId);

      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages: [],
            updated_at: new Date().toISOString()
          };
        }
        return conv;
      }));
    } catch (err) {
      console.error('Error clearing chat:', err);
    }
  }, [activeConversationId]);

  const getHealthStatus = useCallback(() => {
    if (!report) return { status: 'unknown', color: 'gray' };
    
    const score = report.health_score;
    if (score >= 90) return { status: 'ممتاز', color: 'green', emoji: '🌟' };
    if (score >= 75) return { status: 'جيد جداً', color: 'emerald', emoji: '✨' };
    if (score >= 60) return { status: 'جيد', color: 'yellow', emoji: '👍' };
    if (score >= 40) return { status: 'يحتاج انتباه', color: 'orange', emoji: '⚠️' };
    return { status: 'حرج', color: 'red', emoji: '🚨' };
  }, [report]);

  return {
    isThinking,
    report,
    chatHistory,
    error,
    think,
    askBrain,
    clearChat,
    getHealthStatus,
    // New conversation management
    conversations,
    activeConversationId,
    isLoadingConversations,
    createNewConversation,
    deleteConversation,
    selectConversation,
    loadConversations
  };
};
