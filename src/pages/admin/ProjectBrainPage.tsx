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
  Package,
  Store,
  Lightbulb,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ProjectBrainPage = () => {
  const { isThinking, report, chatHistory, think, askBrain, clearChat } = useProjectBrain();
  const [question, setQuestion] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const handleExportReport = () => {
    if (!report) return;

    const now = new Date().toLocaleString('ar-SA');
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير عقل المشروع - ${now}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; direction: rtl; max-width: 900px; margin: 0 auto; }
    h1 { color: #5A2647; border-bottom: 3px solid #5A2647; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    .health-score { font-size: 48px; font-weight: bold; color: ${report.health_score >= 80 ? '#22c55e' : report.health_score >= 50 ? '#eab308' : '#dc2626'}; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .stat-box { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #5A2647; }
    .stat-label { color: #666; font-size: 12px; }
    .action { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; }
    .action.critical { border-right: 4px solid #dc2626; background: #fef2f2; }
    .action.warning { border-right: 4px solid #eab308; background: #fffbeb; }
    .action.success { border-right: 4px solid #22c55e; background: #f0fdf4; }
    .action.info { border-right: 4px solid #3b82f6; background: #eff6ff; }
    .recommendation { background: #f0f9ff; border-right: 4px solid #5A2647; padding: 12px; margin: 8px 0; border-radius: 4px; }
    .summary { background: linear-gradient(135deg, #5A2647, #8B3A5C); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <h1>🧠 تقرير عقل المشروع</h1>
  <p>تاريخ التقرير: ${now}</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <div>نقاط الصحة</div>
    <div class="health-score">${report.health_score}/100</div>
  </div>

  <div class="summary">
    <h3 style="margin-top: 0;">📊 ملخص الذكاء الاصطناعي</h3>
    <p>${report.summary}</p>
  </div>

  <h2>📈 الإحصائيات</h2>
  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-number">${report.stats?.users?.total || 0}</div>
      <div class="stat-label">إجمالي المستخدمين</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${report.stats?.orders?.total || 0}</div>
      <div class="stat-label">إجمالي الطلبات</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${report.stats?.orders?.today || 0}</div>
      <div class="stat-label">طلبات اليوم</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${report.stats?.stores?.total || 0}</div>
      <div class="stat-label">المتاجر</div>
    </div>
  </div>

  ${report.actions.length > 0 ? `
  <h2>🎯 الإجراءات والتنبيهات (${report.actions.length})</h2>
  ${report.actions.map(action => `
    <div class="action ${action.severity}">
      <strong>${action.title}</strong>
      <p>${action.description}</p>
      ${action.auto_executed ? '<span style="color: #22c55e;">✓ تم تنفيذه تلقائياً</span>' : ''}
    </div>
  `).join('')}
  ` : ''}

  ${report.predictions?.length > 0 ? `
  <h2>🔮 التنبؤات</h2>
  ${report.predictions.map(pred => `
    <div class="action info">
      <strong>${pred.title}</strong>
      <p>${pred.description}</p>
      <p style="color: #5A2647;"><em>💡 ${pred.suggestion}</em></p>
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
    <p>تم إنشاء هذا التقرير تلقائياً بواسطة عقل المشروع</p>
    <p>منصة أطلانتس © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank')?.print();
  };

  const getActionIcon = (action: BrainAction) => {
    if (action.auto_executed) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (action.severity === 'critical') return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (action.severity === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <Activity className="h-5 w-5 text-blue-500" />;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-white">
              <Brain className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-foreground">عقل المشروع</h1>
              <p className="text-xs md:text-sm text-muted-foreground">مراقبة ذكية • تنبؤ • إصلاح تلقائي</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => think(false)} disabled={isThinking} size="sm" className="gap-1 md:gap-2 text-xs md:text-sm flex-1 md:flex-none">
              <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${isThinking ? 'animate-spin' : ''}`} />
              تحليل
            </Button>
            <Button onClick={() => think(true)} disabled={isThinking} variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm border-green-500 text-green-600 flex-1 md:flex-none">
              <Wrench className="h-3 w-3 md:h-4 md:w-4" />
              تحليل + إصلاح
            </Button>
            <Button onClick={handleExportReport} disabled={!report} variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm flex-1 md:flex-none">
              <Download className="h-3 w-3 md:h-4 md:w-4" />
              تصدير
            </Button>
          </div>
        </div>

        {/* Health Score & Stats */}
        {report && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
            <Card className="p-3 md:p-6 text-center col-span-2 md:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">نقاط الصحة</div>
              <div className={`text-3xl md:text-5xl font-bold ${getHealthColor(report.health_score)}`}>
                {report.health_score}
              </div>
              <Progress value={report.health_score} className="mt-2 md:mt-3" />
            </Card>

            <Card className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-blue-100">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold">{report.stats?.users?.total || 0}</div>
                <div className="text-xs md:text-sm text-muted-foreground">مستخدم</div>
              </div>
            </Card>

            <Card className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-green-100">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold">{report.stats?.orders?.today || 0}</div>
                <div className="text-xs md:text-sm text-muted-foreground">طلب اليوم</div>
              </div>
            </Card>

            <Card className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-purple-100">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold">{report.stats?.products?.total || 0}</div>
                <div className="text-xs md:text-sm text-muted-foreground">منتج</div>
              </div>
            </Card>

            <Card className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-orange-100">
                <Store className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold">{report.stats?.stores?.total || 0}</div>
                <div className="text-xs md:text-sm text-muted-foreground">متجر</div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-3 md:space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="gap-1 md:gap-2 text-xs md:text-sm py-2 px-1 md:px-3">
              <Eye className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">نظرة عامة</span>
              <span className="md:hidden">عامة</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-1 md:gap-2 text-xs md:text-sm py-2 px-1 md:px-3">
              <Activity className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">الإجراءات</span>
              <span className="md:hidden">إجراء</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-1 md:gap-2 text-xs md:text-sm py-2 px-1 md:px-3">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">التنبؤات</span>
              <span className="md:hidden">تنبؤ</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-1 md:gap-2 text-xs md:text-sm py-2 px-1 md:px-3">
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden md:inline">محادثة</span>
              <span className="md:hidden">دردشة</span>
            </TabsTrigger>
          </TabsList>

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
                           action.type === 'prediction' ? 'تنبؤ' : 'قرار'}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{action.description}</p>
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
                    ) : (
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-sm md:text-base">{pred.title}</div>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{pred.description}</p>
                      <p className="text-xs md:text-sm text-primary mt-2">💡 {pred.suggestion}</p>
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
              <div className="p-3 md:p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-sm md:text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <span className="hidden md:inline">محادثة مع عقل المشروع</span>
                  <span className="md:hidden">محادثة العقل</span>
                </h3>
                <Button variant="ghost" size="sm" onClick={clearChat} className="text-xs md:text-sm">مسح</Button>
              </div>

              <ScrollArea className="flex-1 p-3 md:p-4">
                <div className="space-y-3 md:space-y-4">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-muted-foreground py-6 md:py-8">
                      <Brain className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 md:mb-3 opacity-50" />
                      <p className="text-xs md:text-sm">اسألني أي شيء عن المشروع...</p>
                      <div className="mt-3 md:mt-4 flex flex-wrap gap-2 justify-center">
                        {['كم طلب اليوم؟', 'من أفضل مسوق؟', 'ما حالة المبيعات؟'].map(q => (
                          <Button
                            key={q}
                            variant="outline"
                            size="sm"
                            onClick={() => askBrain(q)}
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
                        <span>يفكر...</span>
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
                  placeholder="اسأل عقل المشروع..."
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
    </div>
  );
};

export default ProjectBrainPage;
