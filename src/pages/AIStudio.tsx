import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  AIContentGenerator,
  AIImageGenerator,
  AIAnalyticsDashboard,
  UnifiedAIAssistant,
  AIVideoGenerator,
  AITextToSpeech,
  AIImageEditor,
  AIImageSearch
} from '@/components/ai';
import {
  Sparkles,
  FileText,
  ImageIcon,
  Brain,
  MessageSquare,
  ArrowRight,
  Video,
  Volume2,
  Palette,
  Search,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function AIStudio() {
  const navigate = useNavigate();
  const [showAssistant, setShowAssistant] = useState(false);

  const tabs = [
    { value: 'content', label: 'توليد المحتوى', icon: FileText },
    { value: 'images', label: 'توليد الصور', icon: ImageIcon },
    { value: 'video', label: 'توليد الفيديو', icon: Video, isNew: true },
    { value: 'tts', label: 'توليد الصوت', icon: Volume2, isNew: true },
    { value: 'editor', label: 'محرر الصور', icon: Palette, isNew: true },
    { value: 'search', label: 'البحث بالصور', icon: Search, isNew: true },
    { value: 'analytics', label: 'التحليلات', icon: Brain },
    { value: 'assistant', label: 'المساعد', icon: MessageSquare },
  ];

  return (
    <>
      <Helmet>
        <title>استوديو الذكاء الاصطناعي | AI Studio</title>
        <meta name="description" content="استخدم أدوات الذكاء الاصطناعي لتوليد المحتوى والصور والفيديو والصوت وتحليل البيانات" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/60 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">استوديو الذكاء الاصطناعي</h1>
                    <Badge variant="secondary" className="text-xs">
                      محسّن
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">8 أدوات ذكية لتطوير أعمالك</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowRight className="h-4 w-4 ml-2" />
                رجوع
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="content" className="space-y-6">
            {/* Scrollable Tabs */}
            <ScrollArea className="w-full">
              <TabsList className="inline-flex h-auto p-1 w-max min-w-full justify-start">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex flex-col gap-1 py-3 px-4 min-w-[100px] relative"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs whitespace-nowrap">{tab.label}</span>
                      {tab.isNew && (
                        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          جديد
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* توليد المحتوى */}
              <TabsContent value="content" className="mt-6">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">مولد المحتوى الذكي</h2>
                    <p className="text-muted-foreground">
                      أنشئ أوصاف منتجات، منشورات سوشيال ميديا، رسائل تسويقية والمزيد
                    </p>
                  </div>
                  <AIContentGenerator />
                </div>
              </TabsContent>

              {/* توليد الصور */}
              <TabsContent value="images" className="mt-6">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">مولد الصور الذكي</h2>
                    <p className="text-muted-foreground">
                      أنشئ صور منتجات احترافية، بانرات إعلانية، وصور سوشيال ميديا
                    </p>
                  </div>
                  <AIImageGenerator />
                </div>
              </TabsContent>

              {/* توليد الفيديو - جديد */}
              <TabsContent value="video" className="mt-6">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">مولد الفيديو الذكي</h2>
                      <Badge className="bg-green-500">جديد</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      أنشئ سكربتات فيديو احترافية لمنتجاتك بأنماط متعددة
                    </p>
                  </div>
                  <AIVideoGenerator />
                </div>
              </TabsContent>

              {/* توليد الصوت - جديد */}
              <TabsContent value="tts" className="mt-6">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">توليد الصوت (TTS)</h2>
                      <Badge className="bg-green-500">جديد</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      حوّل النص إلى صوت عربي احترافي بلهجات وأصوات مختلفة
                    </p>
                  </div>
                  <AITextToSpeech />
                </div>
              </TabsContent>

              {/* محرر الصور - جديد */}
              <TabsContent value="editor" className="mt-6">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">محرر الصور الذكي</h2>
                      <Badge className="bg-green-500">جديد</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      عدّل صور منتجاتك: إزالة الخلفية، تحسين الجودة، إضافة نصوص والمزيد
                    </p>
                  </div>
                  <AIImageEditor />
                </div>
              </TabsContent>

              {/* البحث بالصور - جديد */}
              <TabsContent value="search" className="mt-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">البحث بالصور</h2>
                      <Badge className="bg-green-500">جديد</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      ابحث عن منتجات مشابهة بمجرد رفع صورة
                    </p>
                  </div>
                  <AIImageSearch />
                </div>
              </TabsContent>

              {/* التحليلات */}
              <TabsContent value="analytics" className="mt-6">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">التحليلات الذكية</h2>
                    <p className="text-muted-foreground">
                      احصل على تحليلات متقدمة وتوقعات وتوصيات مخصصة لنمو أعمالك
                    </p>
                  </div>
                  <AIAnalyticsDashboard />
                </div>
              </TabsContent>

              {/* المساعد */}
              <TabsContent value="assistant" className="mt-6">
                <div className="max-w-2xl mx-auto h-[600px]">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">المساعد الذكي</h2>
                    <p className="text-muted-foreground">
                      تحدث مع المساعد الذكي للحصول على المساعدة في أي شيء
                    </p>
                  </div>
                  <UnifiedAIAssistant context="marketer" />
                </div>
              </TabsContent>
            </motion.div>
          </Tabs>

          {/* Features Grid */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">ما يمكنك فعله</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FileText,
                  title: 'أوصاف المنتجات',
                  description: 'اكتب أوصاف جذابة ومقنعة لمنتجاتك تلقائياً'
                },
                {
                  icon: ImageIcon,
                  title: 'صور احترافية',
                  description: 'أنشئ صور منتجات وبانرات إعلانية بجودة عالية'
                },
                {
                  icon: Video,
                  title: 'فيديوهات تسويقية',
                  description: 'أنشئ سكربتات فيديو احترافية لمنتجاتك',
                  isNew: true
                },
                {
                  icon: Volume2,
                  title: 'صوت عربي',
                  description: 'حوّل النص إلى صوت بلهجات عربية متعددة',
                  isNew: true
                },
                {
                  icon: Palette,
                  title: 'تعديل الصور',
                  description: 'إزالة الخلفية، تحسين الجودة، والمزيد',
                  isNew: true
                },
                {
                  icon: Search,
                  title: 'بحث بالصور',
                  description: 'ابحث عن منتجات مشابهة باستخدام صورة',
                  isNew: true
                },
                {
                  icon: Brain,
                  title: 'تحليل البيانات',
                  description: 'احصل على رؤى وتوصيات ذكية لتحسين أدائك'
                },
                {
                  icon: Target,
                  title: 'توصيات شخصية',
                  description: 'توصيات منتجات ذكية لكل عميل',
                  isNew: true
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow relative"
                >
                  {feature.isNew && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                      جديد
                    </span>
                  )}
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        {/* Floating Assistant Button */}
        {!showAssistant && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed bottom-6 left-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
            onClick={() => setShowAssistant(true)}
          >
            <MessageSquare className="h-6 w-6" />
          </motion.button>
        )}

        {/* Floating Assistant */}
        {showAssistant && (
          <UnifiedAIAssistant
            context="marketer"
            floating
            onClose={() => setShowAssistant(false)}
          />
        )}
      </div>
    </>
  );
}
