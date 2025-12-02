import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  AIContentGenerator, 
  AIImageGenerator, 
  AIAnalyticsDashboard,
  UnifiedAIAssistant 
} from '@/components/ai';
import { 
  Sparkles, 
  FileText, 
  ImageIcon, 
  Brain, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AIStudio() {
  const navigate = useNavigate();
  const [showAssistant, setShowAssistant] = useState(false);

  return (
    <>
      <Helmet>
        <title>استوديو الذكاء الاصطناعي | AI Studio</title>
        <meta name="description" content="استخدم أدوات الذكاء الاصطناعي لتوليد المحتوى والصور وتحليل البيانات" />
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
                  <h1 className="text-xl font-bold">استوديو الذكاء الاصطناعي</h1>
                  <p className="text-sm text-muted-foreground">أدوات ذكية لتطوير أعمالك</p>
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
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-auto p-1">
              <TabsTrigger value="content" className="flex flex-col gap-1 py-3">
                <FileText className="h-5 w-5" />
                <span className="text-xs">توليد المحتوى</span>
              </TabsTrigger>
              <TabsTrigger value="images" className="flex flex-col gap-1 py-3">
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs">توليد الصور</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex flex-col gap-1 py-3">
                <Brain className="h-5 w-5" />
                <span className="text-xs">التحليلات</span>
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex flex-col gap-1 py-3">
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">المساعد</span>
              </TabsTrigger>
            </TabsList>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
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
                  icon: Brain,
                  title: 'تحليل البيانات',
                  description: 'احصل على رؤى وتوصيات ذكية لتحسين أدائك'
                },
                {
                  icon: MessageSquare,
                  title: 'دعم فوري',
                  description: 'تواصل مع المساعد الذكي للحصول على مساعدة فورية'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
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
