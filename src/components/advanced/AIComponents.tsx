import React, { useState, useEffect } from 'react';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardDescription as CardDescription, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Sparkles, 
  Search, 
  MessageSquare, 
  FileText, 
  Wand2, 
  Lightbulb,
  Zap,
  RefreshCw,
  Copy,
  Download,
  Eye,
  Settings,
  Loader2
} from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { useSmartSearch, useContentGeneration } from '@/hooks/useAIComponents';
import { useToast } from '@/hooks/use-toast';

interface AIComponentsProps {
  className?: string;
  mode?: 'full' | 'search' | 'content' | 'chat';
}

export const AIComponents: React.FC<AIComponentsProps> = ({
  className,
  mode = 'full'
}) => {
  const { toast } = useToast();
  
  // Smart Search Hook
  const {
    query,
    results,
    suggestions,
    isLoading: searchLoading,
    error: searchError,
    updateQuery,
    clearResults
  } = useSmartSearch({
    enabled: true,
    minChars: 2,
    debounceMs: 300,
    maxSuggestions: 5
  });

  // Content Generation Hook
  const {
    content,
    isGenerating,
    error: contentError,
    history,
    generateContent,
    enhanceContent,
    clearContent,
    setContent
  } = useContentGeneration({
    enabled: true,
    maxLength: 1000,
    tone: 'professional',
    language: 'ar'
  });

  const [activeTab, setActiveTab] = useState('search');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [contentPrompt, setContentPrompt] = useState('');
  const [selectedTone, setSelectedTone] = useState<'formal' | 'casual' | 'professional' | 'friendly'>('professional');

  // نسخ المحتوى إلى الحافظة
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ",
        description: "تم نسخ المحتوى إلى الحافظة",
      });
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "تعذر نسخ المحتوى",
        variant: "destructive"
      });
    }
  };

  // تصدير المحتوى
  const exportContent = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-content-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!aiEnabled) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <Brain className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">المكونات الذكية متوقفة</h3>
        <p className="text-muted-foreground mb-4">يرجى تفعيل المكونات الذكية للاستفادة من قوة الذكاء الاصطناعي</p>
        <Button onClick={() => setAiEnabled(true)}>
          <Zap className="w-4 h-4 mr-2" />
          تفعيل الذكاء الاصطناعي
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-foreground">المكونات الذكية</h2>
          <p className="text-sm sm:text-base text-muted-foreground">أدوات مدعومة بالذكاء الاصطناعي لتحسين الإنتاجية</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="ai-enabled"
              checked={aiEnabled}
              onCheckedChange={setAiEnabled}
            />
            <Label htmlFor="ai-enabled" className="text-sm">تفعيل الذكاء الاصطناعي</Label>
          </div>
          
          <Badge className="bg-gradient-premium text-primary-foreground text-xs">
            <Brain className="w-3 h-3 mr-1" />
            AI مدعوم
          </Badge>
        </div>
      </div>

      {/* AI Status */}
      <EnhancedCard variant="gradient" className="border-premium/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-premium/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-premium animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-foreground">نظام الذكاء الاصطناعي نشط</p>
              <p className="text-sm text-muted-foreground">
                جاهز لمساعدتك في البحث وتوليد المحتوى
              </p>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {(mode === 'full' || mode === 'search') && (
          <Button
            variant={activeTab === 'search' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <Search className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">البحث الذكي</span>
            <span className="sm:hidden">بحث</span>
          </Button>
        )}
        {(mode === 'full' || mode === 'content') && (
          <Button
            variant={activeTab === 'content' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('content')}
            className="flex items-center gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">توليد المحتوى</span>
            <span className="sm:hidden">محتوى</span>
          </Button>
        )}
        {mode === 'full' && (
          <Button
            variant={activeTab === 'chat' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2 text-xs sm:text-sm"
            size="sm"
          >
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">المحادثة الذكية</span>
            <span className="sm:hidden">محادثة</span>
          </Button>
        )}
      </div>

      {/* Smart Search */}
      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  البحث الذكي المتقدم
                </CardTitle>
                <CardDescription>
                  بحث مدعوم بالذكاء الاصطناعي مع اقتراحات ذكية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => updateQuery(e.target.value)}
                    placeholder="ابحث عن أي شيء..."
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                  )}
                </div>

                {searchError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-sm text-destructive">{searchError}</p>
                  </div>
                )}

                {/* Search Results */}
                {results.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">نتائج البحث</Label>
                    {results.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{result.title}</h4>
                            <p className="text-sm text-muted-foreground">{result.type}</p>
                          </div>
                          <Badge variant="secondary">
                            {(result.relevance * 100).toFixed(0)}% مطابقة
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearResults}
                    disabled={!query && results.length === 0}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">مسح</span>
                  </Button>
                </div>
              </CardContent>
            </EnhancedCard>
          </div>

          <div className="space-y-4">
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  اقتراحات ذكية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuery(suggestion)}
                      className="w-full justify-start text-right h-auto p-2"
                    >
                      <Sparkles className="w-3 h-3 ml-2 flex-shrink-0" />
                      <span className="truncate">{suggestion}</span>
                    </Button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    ابدأ بكتابة استعلام للحصول على اقتراحات ذكية
                  </p>
                )}
              </CardContent>
            </EnhancedCard>
          </div>
        </div>
      )}

      {/* Content Generation */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-4">
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  مولد المحتوى الذكي
                </CardTitle>
                <CardDescription>
                  إنشاء محتوى احترافي باستخدام الذكاء الاصطناعي
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content-prompt">وصف المحتوى المطلوب</Label>
                  <Textarea
                    id="content-prompt"
                    value={contentPrompt}
                    onChange={(e) => setContentPrompt(e.target.value)}
                    placeholder="اكتب وصفاً للمحتوى الذي تريد توليده..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">نبرة المحتوى</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'formal', label: 'رسمي' },
                      { value: 'casual', label: 'عادي' },
                      { value: 'professional', label: 'مهني' },
                      { value: 'friendly', label: 'ودود' }
                    ].map((tone) => (
                      <Button
                        key={tone.value}
                        variant={selectedTone === tone.value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTone(tone.value as any)}
                        className="text-xs sm:text-sm py-1 px-2"
                      >
                        {tone.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => generateContent(contentPrompt, { tone: selectedTone })}
                    disabled={!contentPrompt.trim() || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري التوليد...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        توليد المحتوى
                      </>
                    )}
                  </Button>
                </div>

                {contentError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-sm text-destructive">{contentError}</p>
                  </div>
                )}
              </CardContent>
            </EnhancedCard>
          </div>

          <div className="space-y-4">
            <EnhancedCard variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    المحتوى المولد
                  </div>
                  {content && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={exportContent}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content ? (
                  <>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={10}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enhanceContent(content)}
                        disabled={isGenerating}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        تحسين
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearContent}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        مسح
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>سيظهر المحتوى المولد هنا</p>
                    <p className="text-sm">ابدأ بكتابة وصف للمحتوى المطلوب</p>
                  </div>
                )}
              </CardContent>
            </EnhancedCard>

            {/* Content History */}
            {history.length > 0 && (
              <EnhancedCard variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    سجل المحتوى
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {history.slice(0, 3).map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => setContent(item)}
                      className="w-full justify-start text-right h-auto p-2"
                    >
                      <FileText className="w-3 h-3 ml-2 flex-shrink-0" />
                      <span className="truncate text-xs">
                        {item.substring(0, 60)}...
                      </span>
                    </Button>
                  ))}
                </CardContent>
              </EnhancedCard>
            )}
          </div>
        </div>
      )}

      {/* AI Chat (Placeholder for future implementation) */}
      {activeTab === 'chat' && (
        <EnhancedCard variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              المحادثة الذكية
            </CardTitle>
            <CardDescription>محادثة تفاعلية مع مساعد ذكي (قريباً)</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">المحادثة الذكية</h3>
            <p className="text-muted-foreground mb-4">
              ستتمكن قريباً من المحادثة المباشرة مع المساعد الذكي
            </p>
            <Button disabled>
              <Settings className="w-4 h-4 mr-2" />
              قيد التطوير
            </Button>
          </CardContent>
        </EnhancedCard>
      )}
    </div>
  );
};

export default AIComponents;