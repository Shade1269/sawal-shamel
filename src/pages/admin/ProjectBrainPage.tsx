import { useState, useEffect, useRef } from 'react';
import { useProjectBrain, BrainAction } from '@/hooks/useProjectBrain';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Send,
  RefreshCw,
  Wrench,
  Download,
  Sparkles,
  Clock,
  Users,
  ShoppingCart,
  
  Store,
  Lightbulb,
  Eye,
  Plus,
  Trash2,
  DollarSign,
  Shield,
  Zap,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  PlayCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ProjectBrainPage = () => {
  const { 
    isThinking, 
    report, 
    chatHistory, 
    conversations,
    currentConversationId,
    think, 
    askBrain, 
    clearChat, 
    createNewConversation,
    switchConversation,
    deleteConversation,
    getHealthStatus 
  } = useProjectBrain();
  const [question, setQuestion] = useState('');
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const healthStatus = getHealthStatus();

  useEffect(() => {
    think(false);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAsk = () => {
    if (question.trim()) {
      askBrain(question);
      setQuestion('');
    }
  };

  const executeAction = async (actionType: string, data?: any) => {
    setExecutingAction(actionType);
    try {
      const { data: result, error } = await supabase.functions.invoke('project-brain', {
        body: { execute_action: { type: actionType, data } }
      });
      
      if (error) throw error;
      
      toast.success(result?.result?.message || 'تم تنفيذ الإجراء بنجاح');
      // Refresh data
      think(false);
    } catch (error: any) {
      toast.error('فشل تنفيذ الإجراء', { description: error.message });
    } finally {
      setExecutingAction(null);
    }
  };

  const quickQuestions = [
    'كيف حال المنصة اليوم؟',
    'ما هي أهم المشاكل الحالية؟',
    'اقترح طرق لزيادة المبيعات',
    'حلل أداء التجار'
  ];

  const handleQuickQuestion = (q: string) => {
    setQuestion(q);
    askBrain(q);
  };

  const handleExportReport = () => {
    if (!report) return;

    const now = new Date().toLocaleString('ar-SA');
    const advAnalytics = report.advanced_analytics || {};
    const secReport = report.security_report || {};
    const perfReport = report.performance_report || {};
    const learnInsights = report.learning_insights || {};

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير عقل المشروع المتقدم - ${now}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: rtl; max-width: 1000px; margin: 0 auto; background: #f5f5f5; }
    .container { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h1 { color: #5A2647; border-bottom: 3px solid #5A2647; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; display: flex; align-items: center; gap: 8px; }
    .health-score { font-size: 64px; font-weight: bold; text-align: center; }
    .health-good { color: #22c55e; }
    .health-medium { color: #eab308; }
    .health-bad { color: #dc2626; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .stat-box { background: linear-gradient(135deg, #f8f8f8, #fff); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #eee; }
    .stat-number { font-size: 28px; font-weight: bold; color: #5A2647; }
    .stat-label { color: #666; font-size: 12px; margin-top: 5px; }
    .action { background: #fff; border: 1px solid #ddd; border-radius: 12px; padding: 16px; margin: 10px 0; }
    .action.critical { border-right: 5px solid #dc2626; background: #fef2f2; }
    .action.warning { border-right: 5px solid #eab308; background: #fffbeb; }
    .action.success { border-right: 5px solid #22c55e; background: #f0fdf4; }
    .action.info { border-right: 5px solid #3b82f6; background: #eff6ff; }
    .recommendation { background: linear-gradient(135deg, #f0f9ff, #fff); border-right: 4px solid #5A2647; padding: 14px; margin: 10px 0; border-radius: 8px; }
    .summary { background: linear-gradient(135deg, #5A2647, #8B3A5C); color: white; padding: 24px; border-radius: 16px; margin: 20px 0; }
    .analytics-section { background: #fafafa; padding: 20px; border-radius: 12px; margin: 15px 0; }
    .metric-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧠 تقرير عقل المشروع المتقدم</h1>
    <p>تاريخ التقرير: ${now}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div>نقاط الصحة الشاملة</div>
      <div class="health-score ${report.health_score >= 80 ? 'health-good' : report.health_score >= 50 ? 'health-medium' : 'health-bad'}">
        ${report.health_score}/100
      </div>
    </div>

    <div class="summary">
      <h3 style="margin-top: 0;">📊 ملخص الذكاء الاصطناعي</h3>
      <p>${report.summary}</p>
    </div>

    <h2>💰 تحليلات الإيرادات المتقدمة</h2>
    <div class="analytics-section">
      <div class="metric-row"><span>إيرادات اليوم</span><strong>${(advAnalytics.revenue?.today || 0).toLocaleString()} ريال</strong></div>
      <div class="metric-row"><span>إيرادات الأسبوع</span><strong>${(advAnalytics.revenue?.week || 0).toLocaleString()} ريال</strong></div>
      <div class="metric-row"><span>إيرادات الشهر</span><strong>${(advAnalytics.revenue?.month || 0).toLocaleString()} ريال</strong></div>
      <div class="metric-row"><span>معدل النمو</span><strong style="color: ${(advAnalytics.revenue?.growth || 0) >= 0 ? '#22c55e' : '#dc2626'}">${(advAnalytics.revenue?.growth || 0).toFixed(1)}%</strong></div>
    </div>

    <h2>👥 تحليل العملاء</h2>
    <div class="analytics-section">
      <div class="metric-row"><span>متوسط قيمة الطلب</span><strong>${(advAnalytics.customerValue?.avgOrderValue || 0).toLocaleString()} ريال</strong></div>
      <div class="metric-row"><span>نسبة العملاء المتكررين</span><strong>${(advAnalytics.customerValue?.repeatRate || 0).toFixed(1)}%</strong></div>
      <div class="metric-row"><span>قيمة العميل المتوقعة (CLV)</span><strong>${(advAnalytics.customerValue?.estimatedCLV || 0).toLocaleString()} ريال</strong></div>
    </div>

    <h2>🔐 تقرير الأمان</h2>
    <div class="analytics-section">
      <div class="metric-row"><span>نقاط الأمان</span><strong>${secReport.securityScore || 100}/100</strong></div>
      <div class="metric-row"><span>محاولات دخول مشبوهة</span><strong>${secReport.suspiciousLogins?.length || 0}</strong></div>
      <div class="metric-row"><span>طلبات سحب معلقة (مسوقين)</span><strong>${secReport.pendingWithdrawals || 0}</strong></div>
      <div class="metric-row"><span>طلبات سحب معلقة (تجار)</span><strong>${secReport.merchantPendingWithdrawals || 0}</strong></div>
    </div>

    <h2>⚡ تقرير الأداء</h2>
    <div class="analytics-section">
      <div class="metric-row"><span>نقاط الأداء</span><strong>${perfReport.performanceScore || 100}/100</strong></div>
      <div class="metric-row"><span>منتجات مخزون منخفض</span><strong>${perfReport.lowStockCount || 0}</strong></div>
      <div class="metric-row"><span>منتجات نافذة المخزون</span><strong>${perfReport.outOfStockCount || 0}</strong></div>
    </div>

    <h2>🎓 رؤى التعلم الذاتي</h2>
    <div class="analytics-section">
      <div class="metric-row"><span>أفضل يوم للمبيعات</span><strong>${learnInsights.bestDay?.[0] || '-'}</strong></div>
      <div class="metric-row"><span>أسوأ يوم للمبيعات</span><strong>${learnInsights.worstDay?.[0] || '-'}</strong></div>
      <div class="metric-row"><span>أنماط مكتشفة</span><strong>${learnInsights.patternsLearned || 0}</strong></div>
      <div class="metric-row"><span>ذكريات محفوظة</span><strong>${learnInsights.memoriesStored || 0}</strong></div>
    </div>

    ${report.actions.length > 0 ? `
    <h2>🎯 الإجراءات والتنبيهات (${report.actions.length})</h2>
    ${report.actions.map(action => `
      <div class="action ${action.severity}">
        <strong>${action.title}</strong>
        <p>${action.description}</p>
        ${action.auto_executed ? '<span style="color: #22c55e;">✓ تم تنفيذه تلقائياً</span>' : ''}
        ${action.actionable ? '<span style="color: #5A2647;">⚡ قابل للتنفيذ</span>' : ''}
      </div>
    `).join('')}
    ` : ''}

    ${report.recommendations?.length > 0 ? `
    <h2>💡 توصيات الذكاء الاصطناعي</h2>
    ${report.recommendations.map(rec => `
      <div class="recommendation">${rec}</div>
    `).join('')}
    ` : ''}

    <div class="footer">
      <p>🧠 تم إنشاء هذا التقرير المتقدم بواسطة عقل المشروع v2.0</p>
      <p>منصة أطلانتس © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank')?.print();
  };

  const getActionIcon = (action: BrainAction) => {
    if (action.auto_executed) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (action.type === 'security') return <Shield className="h-5 w-5 text-red-500" />;
    if (action.type === 'performance') return <Zap className="h-5 w-5 text-orange-500" />;
    if (action.type === 'learning') return <Target className="h-5 w-5 text-purple-500" />;
    if (action.severity === 'critical') return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (action.severity === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <Activity className="h-5 w-5 text-blue-500" />;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const advAnalytics = report?.advanced_analytics || {};
  const secReport = report?.security_report || {};
  const perfReport = report?.performance_report || {};
  const learnInsights = report?.learning_insights || {};

  return (
    <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white">
              <Brain className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                عقل المشروع v2.0
                {report && (
                  <Badge variant={healthStatus.color === 'green' ? 'default' : healthStatus.color === 'red' ? 'destructive' : 'secondary'}>
                    {healthStatus.emoji} {healthStatus.status}
                  </Badge>
                )}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                تحليلات متقدمة • مراقبة أمنية • تعلم ذاتي • إجراءات ذكية
              </p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => think(false)} disabled={isThinking} size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isThinking ? 'animate-spin' : ''}`} />
              تحليل شامل
            </Button>
            <Button onClick={() => think(true)} disabled={isThinking} variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm border-green-500 text-green-600">
              <Wrench className="h-3 w-3 md:h-4 md:w-4" />
              تحليل + إصلاح
            </Button>
            <Button onClick={handleExportReport} disabled={!report} variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
              <Download className="h-3 w-3 md:h-4 md:w-4" />
              تصدير متقدم
            </Button>
          </div>
        </div>

        {/* Health & Revenue Stats */}
        {report && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4">
            <Card className="p-3 md:p-4 text-center col-span-2 md:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-xs text-muted-foreground mb-1">نقاط الصحة</div>
              <div className={`text-3xl md:text-4xl font-bold ${getHealthColor(report.health_score)}`}>
                {report.health_score}
              </div>
              <Progress value={report.health_score} className="mt-2" />
            </Card>

            <Card className="p-3 md:p-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-100">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm md:text-lg font-bold">{(advAnalytics.revenue?.today || 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">إيرادات اليوم</div>
              </div>
            </Card>

            <Card className="p-3 md:p-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm md:text-lg font-bold">{report.stats?.orders?.today || 0}</div>
                <div className="text-xs text-muted-foreground">طلب اليوم</div>
              </div>
            </Card>

            <Card className="p-3 md:p-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm md:text-lg font-bold">{report.stats?.users?.total || 0}</div>
                <div className="text-xs text-muted-foreground">مستخدم</div>
              </div>
            </Card>

            <Card className="p-3 md:p-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100">
                <Store className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm md:text-lg font-bold">{report.stats?.stores?.total || 0}</div>
                <div className="text-xs text-muted-foreground">متجر</div>
              </div>
            </Card>

            <Card className="p-3 md:p-4 flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${(advAnalytics.revenue?.growth || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {(advAnalytics.revenue?.growth || 0) >= 0 
                  ? <ArrowUpRight className="h-4 w-4 text-green-600" />
                  : <ArrowDownRight className="h-4 w-4 text-red-600" />
                }
              </div>
              <div>
                <div className={`text-sm md:text-lg font-bold ${(advAnalytics.revenue?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(advAnalytics.revenue?.growth || 0).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">نمو الإيرادات</div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-3 md:space-y-4">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="gap-1 text-xs py-2 px-1">
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 text-xs py-2 px-1">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">تحليلات</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-1 text-xs py-2 px-1">
              <Activity className="h-3 w-3" />
              <span className="hidden sm:inline">إجراءات</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-1 text-xs py-2 px-1">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">تنبؤات</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1 text-xs py-2 px-1">
              <MessageCircle className="h-3 w-3" />
              <span className="hidden sm:inline">محادثة</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3 md:space-y-4">
            {report?.summary && (
              <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="flex items-start gap-2 md:gap-3">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">تحليل الذكاء الاصطناعي</h3>
                    <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-wrap">{report.summary}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Stats Row */}
            {report && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4 border-r-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">نقاط الأمان</span>
                  </div>
                  <div className="text-2xl font-bold">{secReport.securityScore || 100}</div>
                </Card>
                <Card className="p-4 border-r-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span className="text-xs text-muted-foreground">نقاط الأداء</span>
                  </div>
                  <div className="text-2xl font-bold">{perfReport.performanceScore || 100}</div>
                </Card>
                <Card className="p-4 border-r-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-muted-foreground">أنماط مكتشفة</span>
                  </div>
                  <div className="text-2xl font-bold">{learnInsights.patternsLearned || 0}</div>
                </Card>
                <Card className="p-4 border-r-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">ذكريات محفوظة</span>
                  </div>
                  <div className="text-2xl font-bold">{learnInsights.memoriesStored || 0}</div>
                </Card>
              </div>
            )}

            {report?.recommendations && report.recommendations.length > 0 && (
              <Card className="p-4 md:p-6">
                <h3 className="font-semibold text-sm md:text-base mb-3 md:mb-4 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                  توصيات العقل
                </h3>
                <div className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <div key={i} className="p-2 md:p-3 bg-yellow-50 border-r-4 border-yellow-400 rounded text-xs md:text-sm">
                      {rec}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {report && (
              <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                آخر تحديث: {format(new Date(report.generated_at), 'PPpp', { locale: ar })}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Revenue Analytics */}
              <Card className="p-4 md:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  تحليلات الإيرادات
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">إيرادات اليوم</span>
                    <span className="font-bold text-green-600">{(advAnalytics.revenue?.today || 0).toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">إيرادات الأسبوع</span>
                    <span className="font-bold">{(advAnalytics.revenue?.week || 0).toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">إيرادات الشهر</span>
                    <span className="font-bold">{(advAnalytics.revenue?.month || 0).toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">معدل النمو</span>
                    <span className={`font-bold ${(advAnalytics.revenue?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(advAnalytics.revenue?.growth || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>

              {/* Customer Analytics */}
              <Card className="p-4 md:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  تحليلات العملاء
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">متوسط قيمة الطلب</span>
                    <span className="font-bold">{(advAnalytics.customerValue?.avgOrderValue || 0).toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">إجمالي العملاء</span>
                    <span className="font-bold">{advAnalytics.customerValue?.totalCustomers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">العملاء المتكررين</span>
                    <span className="font-bold text-purple-600">{advAnalytics.customerValue?.repeatCustomers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">نسبة التكرار</span>
                    <span className="font-bold">{(advAnalytics.customerValue?.repeatRate || 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium">قيمة العميل المتوقعة (CLV)</span>
                    <span className="font-bold text-primary">{(advAnalytics.customerValue?.estimatedCLV || 0).toLocaleString()} ريال</span>
                  </div>
                </div>
              </Card>

              {/* Learning Insights */}
              <Card className="p-4 md:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  رؤى التعلم الذاتي
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-sm">أفضل يوم للمبيعات</span>
                    <span className="font-bold text-green-600">{learnInsights.bestDay?.[0] || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm">أسوأ يوم للمبيعات</span>
                    <span className="font-bold text-red-600">{learnInsights.worstDay?.[0] || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">حالات احتيال محتملة</span>
                    <span className={`font-bold ${(learnInsights.potentialFraudCases || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {learnInsights.potentialFraudCases || 0}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Security & Performance */}
              <Card className="p-4 md:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  الأمان والأداء
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">محاولات دخول مشبوهة</span>
                    <span className={`font-bold ${(secReport.suspiciousLogins?.length || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {secReport.suspiciousLogins?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">طلبات سحب معلقة</span>
                    <span className="font-bold">{(secReport.pendingWithdrawals || 0) + (secReport.merchantPendingWithdrawals || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">منتجات مخزون منخفض</span>
                    <span className={`font-bold ${(perfReport.lowStockCount || 0) > 5 ? 'text-orange-600' : ''}`}>
                      {perfReport.lowStockCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">منتجات نافذة المخزون</span>
                    <span className={`font-bold ${(perfReport.outOfStockCount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {perfReport.outOfStockCount || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-3 md:space-y-4">
            {report?.actions && report.actions.length > 0 ? (
              report.actions.map(action => (
                <Card key={action.id} className={`p-3 md:p-4 border-r-4 ${
                  action.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  action.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  action.severity === 'success' ? 'border-green-500 bg-green-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start gap-2 md:gap-3">
                    {getActionIcon(action)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm md:text-base">{action.title}</span>
                        <Badge variant={action.auto_executed ? 'default' : 'outline'} className="text-xs">
                          {action.type === 'auto_fix' ? 'إصلاح' :
                           action.type === 'monitoring' ? 'مراقبة' :
                           action.type === 'alert' ? 'تنبيه' :
                           action.type === 'security' ? 'أمان' :
                           action.type === 'performance' ? 'أداء' :
                           action.type === 'learning' ? 'تعلم' :
                           action.type === 'prediction' ? 'تنبؤ' : 'قرار'}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{action.description}</p>
                      
                      {/* Action Button */}
                      {action.actionable && action.action_type && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 gap-1"
                          onClick={() => executeAction(action.action_type!, action.data)}
                          disabled={executingAction === action.action_type}
                        >
                          <PlayCircle className="h-3 w-3" />
                          {executingAction === action.action_type ? 'جاري التنفيذ...' : 'تنفيذ الإجراء'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 md:p-8 text-center">
                <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-green-500 mx-auto mb-2 md:mb-3" />
                <h3 className="font-semibold text-sm md:text-base">لا توجد إجراءات مطلوبة</h3>
                <p className="text-xs md:text-sm text-muted-foreground">كل شيء يعمل بشكل سليم</p>
              </Card>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-3 md:space-y-4">
            {report?.predictions && report.predictions.length > 0 ? (
              report.predictions.map((pred, i) => (
                <Card key={i} className="p-3 md:p-4 border-r-4 border-purple-500 bg-purple-50">
                  <div className="flex items-start gap-2 md:gap-3">
                    {pred.type === 'sales_decline' ? (
                      <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
                    ) : pred.type === 'revenue_forecast' ? (
                      <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-sm md:text-base">{pred.title}</div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{pred.description}</p>
                      <p className="text-xs md:text-sm text-primary mt-2">💡 {pred.suggestion}</p>
                      {pred.predicted_impact && (
                        <p className="text-xs text-muted-foreground mt-1">📊 {pred.predicted_impact}</p>
                      )}
                      <Badge variant="outline" className="mt-2 text-xs">
                        ثقة: {(pred.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 md:p-8 text-center">
                <TrendingUp className="h-10 w-10 md:h-12 md:w-12 text-purple-500 mx-auto mb-2 md:mb-3" />
                <h3 className="font-semibold text-sm md:text-base">لا توجد تنبؤات حالياً</h3>
                <p className="text-xs md:text-sm text-muted-foreground">سيتم عرض التنبؤات عند اكتشاف أنماط مهمة</p>
              </Card>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-3 md:space-y-4">
            <Card className="h-[400px] md:h-[500px] flex flex-col">
              <div className="p-3 md:p-4 border-b flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Brain className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  
                  {conversations.length > 0 ? (
                    <Select 
                      value={currentConversationId || ''} 
                      onValueChange={switchConversation}
                    >
                      <SelectTrigger className="h-8 text-xs md:text-sm flex-1 max-w-[200px]">
                        <SelectValue placeholder="اختر محادثة" />
                      </SelectTrigger>
                      <SelectContent>
                        {conversations.map(conv => (
                          <SelectItem key={conv.id} value={conv.id} className="text-xs md:text-sm">
                            {conv.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm font-semibold truncate">محادثة العقل v2.0</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={createNewConversation}
                    className="h-8 w-8"
                    title="محادثة جديدة"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {currentConversationId && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteConversation(currentConversationId)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="حذف المحادثة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs md:text-sm">مسح</Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-3 md:p-4">
                <div className="space-y-3 md:space-y-4">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-muted-foreground py-6 md:py-8">
                      <Brain className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-50" />
                      <p className="text-xs md:text-sm">اسألني أي شيء عن المشروع...</p>
                      <p className="text-xs text-muted-foreground mt-2">🧠 عقل متطور مع تحليلات متقدمة وتعلم ذاتي</p>
                      <div className="mt-3 md:mt-4 flex flex-wrap gap-2 justify-center">
                        {quickQuestions.map(q => (
                          <Button
                            key={q}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickQuestion(q)}
                            className="text-xs"
                          >
                            {q}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] md:max-w-[80%] p-2 md:p-3 rounded-lg text-xs md:text-sm ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {msg.role === 'brain' && (
                          <Brain className="h-3 w-3 md:h-4 md:w-4 mb-1 inline-block ml-1" />
                        )}
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                      </div>
                    </div>
                  ))}

                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-2 md:p-3 rounded-lg flex items-center gap-2 text-xs md:text-sm">
                        <Brain className="h-3 w-3 md:h-4 md:w-4 animate-pulse" />
                        <span>يفكر ويحلل...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="p-3 md:p-4 border-t flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="اسأل عقل المشروع المتقدم..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  disabled={isThinking}
                  className="text-sm"
                />
                <Button onClick={handleAsk} disabled={isThinking || !question.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default ProjectBrainPage;
