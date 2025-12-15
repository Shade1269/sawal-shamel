import { useState, useCallback, useRef, useEffect } from 'react';
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
  created_at: string;
  messages: ChatMessage[];
}

export const useProjectBrain = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [report, setReport] = useState<BrainReport | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('brain_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id);
          setChatHistory(parsed[0].messages || []);
          conversationIdRef.current = parsed[0].id;
        }
      } catch (e) {
        console.error('Failed to parse saved conversations');
      }
    }
  }, []);

  // Save conversations to localStorage
  const saveConversations = useCallback((convs: Conversation[]) => {
    localStorage.setItem('brain_conversations', JSON.stringify(convs));
    setConversations(convs);
  }, []);

  // Create new conversation
  const createNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
      title: 'محادثة جديدة',
      created_at: new Date().toISOString(),
      messages: []
    };
    const updated = [newConv, ...conversations];
    saveConversations(updated);
    setCurrentConversationId(newConv.id);
    setChatHistory([]);
    conversationIdRef.current = newConv.id;
    return newConv.id;
  }, [conversations, saveConversations]);

  // Switch conversation
  const switchConversation = useCallback((convId: string) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setCurrentConversationId(convId);
      setChatHistory(conv.messages);
      conversationIdRef.current = convId;
    }
  }, [conversations]);

  // Delete conversation
  const deleteConversation = useCallback((convId: string) => {
    const updated = conversations.filter(c => c.id !== convId);
    saveConversations(updated);
    if (currentConversationId === convId) {
      if (updated.length > 0) {
        setCurrentConversationId(updated[0].id);
        setChatHistory(updated[0].messages);
        conversationIdRef.current = updated[0].id;
      } else {
        setCurrentConversationId(null);
        setChatHistory([]);
        conversationIdRef.current = null;
      }
    }
  }, [conversations, currentConversationId, saveConversations]);

  // Update conversation messages
  const updateConversationMessages = useCallback((messages: ChatMessage[]) => {
    if (!currentConversationId) return;
    
    const updated = conversations.map(c => {
      if (c.id === currentConversationId) {
        // Update title from first user message if still default
        let title = c.title;
        if (title === 'محادثة جديدة' && messages.length > 0) {
          const firstUserMsg = messages.find(m => m.role === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
          }
        }
        return { ...c, messages, title };
      }
      return c;
    });
    saveConversations(updated);
  }, [currentConversationId, conversations, saveConversations]);

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

    // Create new conversation if none exists
    let convId = currentConversationId;
    if (!convId) {
      convId = createNewConversation();
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setIsThinking(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('project-brain', {
        body: { 
          action: 'question', 
          question,
          conversation_id: conversationIdRef.current,
          conversation_history: newHistory
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.report) {
        setReport(data.report);
        
        if (data.conversation_id) {
          conversationIdRef.current = data.conversation_id;
        }
        
        const brainMessage: ChatMessage = {
          role: 'brain',
          content: data.report.summary,
          timestamp: new Date().toISOString()
        };
        
        const finalHistory = [...newHistory, brainMessage];
        setChatHistory(finalHistory);
        updateConversationMessages(finalHistory);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ';
      const errorMessage: ChatMessage = {
        role: 'brain',
        content: 'عذراً، حدث خطأ في التفكير: ' + message,
        timestamp: new Date().toISOString()
      };
      const finalHistory = [...newHistory, errorMessage];
      setChatHistory(finalHistory);
      updateConversationMessages(finalHistory);
    } finally {
      setIsThinking(false);
    }
  }, [chatHistory, currentConversationId, createNewConversation, updateConversationMessages]);

  const clearChat = useCallback(() => {
    setChatHistory([]);
    conversationIdRef.current = null;
    if (currentConversationId) {
      updateConversationMessages([]);
    }
  }, [currentConversationId, updateConversationMessages]);

  const getHealthStatus = useCallback(() => {
    if (!report) return { status: 'unknown', color: 'gray' };
    
    const score = report.health_score;
    if (score >= 90) return { status: 'ممتاز', color: 'green', emoji: '🌟' };
    if (score >= 75) return { status: 'جيد جداً', color: 'emerald', emoji: '✨' };
    if (score >= 60) return { status: 'جيد', color: 'yellow', emoji: '👍' };
    if (score >= 40) return { status: 'يحتاج انتباه', color: 'orange', emoji: '⚠️' };
    return { status: 'حرج', color: 'red', emoji: '🚨' };
  }, [report]);

  // Read code structure and analyze
  const readCode = useCallback(async (action: 'get_structure' | 'analyze_component' | 'search_code' | 'get_tech_stack' | 'get_database_info', query?: string) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('brain-code-reader', {
        body: { action, query }
      });

      if (fnError) throw new Error(fnError.message);
      return data;
    } catch (err) {
      console.error('Code reading error:', err);
      return null;
    }
  }, []);

  return {
    isThinking,
    report,
    chatHistory,
    conversations,
    currentConversationId,
    error,
    think,
    askBrain,
    clearChat,
    createNewConversation,
    switchConversation,
    deleteConversation,
    getHealthStatus,
    readCode
  };
};