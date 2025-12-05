import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, ImageIcon, Brain, MessageSquare, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'content',
      title: 'توليد محتوى',
      description: 'أوصاف منتجات ومنشورات',
      icon: FileText,
      color: 'from-info to-info/80',
      path: '/ai-studio?tab=content'
    },
    {
      id: 'images',
      title: 'توليد صور',
      description: 'صور منتجات وبانرات',
      icon: ImageIcon,
      color: 'from-premium to-premium/80',
      path: '/ai-studio?tab=images'
    },
    {
      id: 'analytics',
      title: 'تحليلات ذكية',
      description: 'تحليل الأداء والتوقعات',
      icon: Brain,
      color: 'from-success to-success/80',
      path: '/ai-studio?tab=analytics'
    },
    {
      id: 'assistant',
      title: 'المساعد الذكي',
      description: 'دردشة ومساعدة فورية',
      icon: MessageSquare,
      color: 'from-warning to-warning/80',
      path: '/ai-studio?tab=assistant'
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">أدوات الذكاء الاصطناعي</h3>
              <p className="text-xs text-muted-foreground">طور أعمالك بالـ AI</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/ai-studio')}
          >
            استوديو AI
            <ArrowLeft className="h-4 w-4 mr-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(action.path)}
              className="group p-4 rounded-xl bg-card border hover:border-primary/50 hover:shadow-md transition-all text-right"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h4 className="font-medium text-sm mb-1">{action.title}</h4>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
