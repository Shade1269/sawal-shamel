import { useState, useCallback, useRef } from 'react';
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

export const useProjectBrain = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [report, setReport] = useState<BrainReport | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);

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

    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsThinking(true);

    try {
      // Send full conversation history for context (learning from previous messages)
      const allMessages = [...chatHistory, userMessage];
      
      const { data, error: fnError } = await supabase.functions.invoke('project-brain', {
        body: { 
          action: 'question', 
          question,
          conversation_id: conversationIdRef.current,
          conversation_history: allMessages // Send history for learning
        }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.report) {
        setReport(data.report);
        
        // Save conversation ID for future reference
        if (data.conversation_id) {
          conversationIdRef.current = data.conversation_id;
        }
        
        const brainMessage: ChatMessage = {
          role: 'brain',
          content: data.report.summary,
          timestamp: new Date().toISOString()
        };
        
        setChatHistory(prev => [...prev, brainMessage]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ';
      const errorMessage: ChatMessage = {
        role: 'brain',
        content: 'عذراً، حدث خطأ في التفكير: ' + message,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  }, [chatHistory]);

  const clearChat = useCallback(() => {
    setChatHistory([]);
    conversationIdRef.current = null;
  }, []);

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
    getHealthStatus
  };
};
