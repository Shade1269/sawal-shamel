import { useState, useCallback } from 'react';
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

export interface BrainReport {
  generated_at: string;
  summary: string;
  health_score: number;
  actions: BrainAction[];
  predictions: any[];
  stats: any;
  recommendations: string[];
}

export const useProjectBrain = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [report, setReport] = useState<BrainReport | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'brain'; content: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

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
          toast.success('🧠 التحليل اكتمل');
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

    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    setIsThinking(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('project-brain', {
        body: { action: 'question', question }
      });

      if (fnError) throw new Error(fnError.message);

      if (data?.success && data?.report) {
        setReport(data.report);
        setChatHistory(prev => [...prev, { role: 'brain', content: data.report.summary }]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطأ';
      setChatHistory(prev => [...prev, { role: 'brain', content: 'عذراً، حدث خطأ: ' + message }]);
    } finally {
      setIsThinking(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setChatHistory([]);
  }, []);

  return {
    isThinking,
    report,
    chatHistory,
    error,
    think,
    askBrain,
    clearChat
  };
};
