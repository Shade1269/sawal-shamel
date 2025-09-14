import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AtlantisPointsService, AtlantisTTSService } from '@/lib/atlantisServices';
import { useAtlantisSystem } from '@/hooks/useAtlantisSystem';
import { useToast } from '@/hooks/use-toast';
import { 
  Play,
  Volume2,
  Star,
  Trophy,
  Users,
  Target,
  Loader2,
  RefreshCw,
  Settings
} from 'lucide-react';

export const AtlantisOnboarding = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [testAmount, setTestAmount] = useState('100');
  const { userLevel, fetchWeeklyLeaderboard, initializeUserLevel } = useAtlantisSystem();
  const { toast } = useToast();

  // Test functions for demonstration
  const testAddSalePoints = async () => {
    setIsLoading(true);
    try {
      const result = await AtlantisPointsService.addSalePoints(parseFloat(testAmount), {
        product_name: 'منتج تجريبي',
        order_id: 'TEST_' + Date.now()
      });
      
      if (result.success) {
        toast({
          title: "تم إضافة النقاط!",
          description: `تم إضافة ${result.points_added} نقطة من بيعة بقيمة ${testAmount} ر.س`,
        });
        
        if (result.level_changed) {
          await AtlantisTTSService.playLevelUpSound(result.new_level);
        }
        
        // Refresh data
        await initializeUserLevel();
        await fetchWeeklyLeaderboard();
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testAddCustomerPoints = async () => {
    setIsLoading(true);
    try {
      const result = await AtlantisPointsService.addNewCustomerPoints({
        customer_name: 'عميل تجريبي',
        source: 'مباشر'
      });
      
      if (result.success) {
        toast({
          title: "تم إضافة النقاط!",
          description: `تم إضافة ${result.points_added} نقطة لجلب عميل جديد`,
        });
        
        // Refresh data
        await initializeUserLevel();
        await fetchWeeklyLeaderboard();
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testTTS = async (text: string) => {
    setIsLoading(true);
    try {
      await AtlantisTTSService.playText(text);
      toast({
        title: "تم تشغيل الصوت",
        description: "تم تشغيل الرسالة الصوتية بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في الصوت",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onboardingSteps = [
    {
      title: "مرحباً بك في أتلانتس!",
      description: "نظام التحفيز والمنافسة للمسوقين",
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            أتلانتس هو نظام نقاط متقدم يساعدك على:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>كسب النقاط من كل عملية بيع</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>الانضمام للتحالفات والمنافسة</span>
            </li>
            <li className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span>المشاركة في التحديات الأسبوعية</span>
            </li>
            <li className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-purple-500" />
              <span>الوصول لمستويات أعلى ومكافآت أكبر</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "نظام النقاط التلقائي",
      description: "كيف تكسب النقاط تلقائياً",
      icon: <Star className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">من المبيعات</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  احصل على 10% من قيمة كل بيعة كنقاط
                </p>
                <div className="space-y-2">
                  <Label htmlFor="test-amount">مبلغ تجريبي (ر.س)</Label>
                  <Input
                    id="test-amount"
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    placeholder="100"
                  />
                  <Button 
                    onClick={testAddSalePoints}
                    disabled={isLoading}
                    className="w-full"
                    size="sm"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    تجربة إضافة نقاط البيع
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">من العملاء الجدد</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  احصل على 25 نقطة لكل عميل جديد
                </p>
                <Button 
                  onClick={testAddCustomerPoints}
                  disabled={isLoading}
                  className="w-full"
                  size="sm"
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  تجربة إضافة نقاط العميل
                </Button>
              </CardContent>
            </Card>
          </div>

          {userLevel && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">نقاطك الحالية</p>
                    <p className="text-2xl font-bold">{userLevel.total_points}</p>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    {userLevel.current_level === 'legendary' ? 'أسطوري' :
                     userLevel.current_level === 'gold' ? 'ذهبي' :
                     userLevel.current_level === 'silver' ? 'فضي' : 'برونزي'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    },
    {
      title: "التأثيرات الصوتية",
      description: "أصوات تفاعلية لتحسين التجربة",
      icon: <Volume2 className="h-8 w-8 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            يتضمن أتلانتس تأثيرات صوتية تفاعلية لتحسين تجربتك:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => testTTS("مرحباً بك في نظام أتلانتس للتحفيز والمنافسة")}
              disabled={isLoading}
              className="h-16 flex-col"
            >
              <Play className="h-5 w-5 mb-1" />
              ترحيب
            </Button>

            <Button
              variant="outline"
              onClick={() => testTTS("تهانينا! لقد حصلت على نقاط جديدة وتقدمت في المستوى")}
              disabled={isLoading}
              className="h-16 flex-col"
            >
              <Star className="h-5 w-5 mb-1" />
              ترقية مستوى
            </Button>

            <Button
              variant="outline"
              onClick={() => testTTS("إنجاز رائع! لقد حققت هدفاً جديداً في التحدي الأسبوعي")}
              disabled={isLoading}
              className="h-16 flex-col"
            >
              <Target className="h-5 w-5 mb-1" />
              إنجاز
            </Button>

            <Button
              variant="outline"
              onClick={() => testTTS("ممتاز! تقدمت في ترتيب أفضل المسوقين")}
              disabled={isLoading}
              className="h-16 flex-col"
            >
              <Trophy className="h-5 w-5 mb-1" />
              ترتيب أفضل
            </Button>
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">تنبيه</h4>
              </div>
              <p className="text-sm text-green-700">
                تأكد من تشغيل الصوت في متصفحك للحصول على أفضل تجربة تفاعلية
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const currentStepData = onboardingSteps[step - 1];

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStepData.icon}
            <div>
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>
          <Badge variant="outline">
            الخطوة {step} من {onboardingSteps.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentStepData.content}

        <Separator />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            السابق
          </Button>

          <div className="flex gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index + 1 === step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {step < onboardingSteps.length ? (
            <Button onClick={() => setStep(step + 1)}>
              التالي
            </Button>
          ) : (
            <Button onClick={() => window.location.href = '/atlantis'}>
              بدء استخدام أتلانتس
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};