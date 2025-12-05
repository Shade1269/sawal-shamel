import { useNavigate } from 'react-router-dom';
import { UnifiedCard as Card, UnifiedCardContent as CardContent, UnifiedCardHeader as CardHeader, UnifiedCardTitle as CardTitle } from '@/components/design-system';
import { UnifiedButton as Button } from '@/components/design-system';
import { UnifiedBadge as Badge } from '@/components/design-system';
import { AtlantisOnboarding } from '@/features/chat/components/AtlantisOnboarding';
import { BackButton } from '@/components/ui/back-button';
import { 
  BookOpen, 
  GraduationCap, 
  Lightbulb,
  PlayCircle
} from 'lucide-react';

const AtlantisGuide = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-persian-bg">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <BackButton fallbackRoute="/affiliate" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-info rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-info bg-clip-text text-transparent">
                  دليل أتلانتس
                </h1>
                <p className="text-muted-foreground">
                  تعلم كيفية استخدام نظام التحفيز والمنافسة
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Message */}
          <Card className="gradient-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Lightbulb className="h-6 w-6" />
                مرحباً بك في دليل أتلانتس!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                هذا الدليل التفاعلي سيساعدك على فهم جميع ميزات نظام أتلانتس وكيفية الاستفادة منها بأفضل شكل ممكن.
              </p>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  اتبع الخطوات أدناه للبدء
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Onboarding */}
          <AtlantisOnboarding />

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                نصائح سريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-success/10 rounded-lg">
                  <h4 className="font-semibold text-success mb-2">💡 زيادة النقاط</h4>
                  <p className="text-sm text-success/80">
                    ركز على بيع المنتجات عالية القيمة وجلب عملاء جدد للحصول على أكبر عدد نقاط
                  </p>
                </div>

                <div className="p-4 bg-info/10 rounded-lg">
                  <h4 className="font-semibold text-info mb-2">🤝 التحالفات</h4>
                  <p className="text-sm text-info/80">
                    انضم لتحالف نشط أو أنشئ تحالفك الخاص عند الوصول للمستوى الفضي
                  </p>
                </div>

                <div className="p-4 bg-premium/10 rounded-lg">
                  <h4 className="font-semibold text-premium mb-2">🏆 التحديات</h4>
                  <p className="text-sm text-premium/80">
                    شارك في التحديات الأسبوعية للحصول على نقاط إضافية ومكافآت خاصة
                  </p>
                </div>

                <div className="p-4 bg-warning/10 rounded-lg">
                  <h4 className="font-semibold text-warning mb-2">📈 المستويات</h4>
                  <p className="text-sm text-warning/80">
                    كل مستوى جديد يفتح مميزات أكثر ونسب عمولة أعلى
                  </p>
                </div>

                <div className="p-4 bg-destructive/10 rounded-lg">
                  <h4 className="font-semibold text-destructive mb-2">🎯 الترتيب</h4>
                  <p className="text-sm text-destructive/80">
                    تابع ترتيبك في لوحة المتصدرين وحاول الوصول للمراكز الأولى
                  </p>
                </div>

                <div className="p-4 bg-info/10 rounded-lg">
                  <h4 className="font-semibold text-info mb-2">🔊 الأصوات</h4>
                  <p className="text-sm text-info/80">
                    فعّل الأصوات للحصول على تجربة تفاعلية أفضل وتنبيهات فورية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation to Main System */}
          <div className="text-center">
            <Card className="inline-block">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">جاهز للبدء؟</h3>
                <Button 
                  onClick={() => navigate('/atlantis')}
                  size="lg"
                  className="bg-gradient-premium hover:opacity-90"
                >
                  دخول نظام أتلانتس
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlantisGuide;