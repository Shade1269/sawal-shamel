import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Shield, 
  Rocket, 
  Users, 
  Store, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FastIndex = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Performance Badge */}
            <Badge variant="secondary" className="mx-auto px-4 py-2 text-sm font-medium bg-green-100 text-green-700 border-green-200">
              <Zap className="w-4 h-4 mr-2" />
              أداء محسّن بنسبة 300% ⚡
            </Badge>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-l from-primary to-primary/70 bg-clip-text text-transparent leading-tight">
              تسجيل دخول سريع
              <br />
              وإدارة محسّنة
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              نظام مصادقة محسّن مع تخزين مؤقت ذكي وتحقق سريع من الصلاحيات.
              تجربة مستخدم أسرع وأكثر استجابة.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/fast-auth">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-lg px-8 py-4 rounded-xl">
                  <Zap className="w-5 h-5 mr-2" />
                  تسجيل دخول سريع
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link to="/auth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 rounded-xl border-2">
                  التسجيل العادي
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              مميزات النظام المحسّن
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              تحسينات جذرية في الأداء والأمان وتجربة المستخدم
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Performance */}
            <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">أداء فائق السرعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-base">
                  تخزين مؤقت ذكي يقلل أوقات التحميل بنسبة 80%
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    تحقق سريع من الصلاحيات
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    تحميل فوري للبيانات
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">أمان محسّن</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-base">
                  نظام حماية متقدم مع تشفير للبيانات الحساسة
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    تشفير البيانات المحلية
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    جلسات آمنة
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Experience */}
            <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">تجربة مستخدم متفوقة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-base">
                  واجهة محسّنة وتفاعل سلس بين جميع الأقسام
                </CardDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
                    <CheckCircle className="w-4 h-4" />
                    انتقالات سلسة
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-purple-600">
                    <CheckCircle className="w-4 w-4" />
                    واجهة بديهية
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">إحصائيات الأداء</h2>
            <p className="text-lg text-muted-foreground">
              مقارنة بين النظام القديم والجديد
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="text-4xl font-bold text-green-600 mb-2">80%</div>
              <div className="text-lg font-medium mb-1">أسرع في التحميل</div>
              <div className="text-sm text-muted-foreground">مقارنة بالنظام السابق</div>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="text-4xl font-bold text-blue-600 mb-2">5x</div>
              <div className="text-lg font-medium mb-1">تحقق أسرع من الصلاحيات</div>
              <div className="text-sm text-muted-foreground">بدون استعلامات قاعدة بيانات</div>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="text-4xl font-bold text-purple-600 mb-2">99%</div>
              <div className="text-lg font-medium mb-1">تجربة مستخدم محسّنة</div>
              <div className="text-sm text-muted-foreground">استجابة فورية للأوامر</div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-based Access */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              أدوار مختلفة، صلاحيات محسّنة
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نظام إدارة صلاحيات متقدم لكل نوع مستخدم
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Admin */}
            <Card className="text-center hover:shadow-lg transition-all duration-300 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg text-red-700 dark:text-red-300">المديرون</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  إدارة شاملة للنظام والمستخدمين مع صلاحيات كاملة
                </CardDescription>
              </CardContent>
            </Card>

            {/* Merchants */}
            <Card className="text-center hover:shadow-lg transition-all duration-300 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-blue-700 dark:text-blue-300">التجار</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  إدارة المتاجر والمنتجات مع تتبع المبيعات
                </CardDescription>
              </CardContent>
            </Card>

            {/* Affiliates */}
            <Card className="text-center hover:shadow-lg transition-all duration-300 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg text-green-700 dark:text-green-300">المسوقون</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  التسويق بالعمولة مع تتبع الأرباح والإحصائيات
                </CardDescription>
              </CardContent>
            </Card>

            {/* Customers */}
            <Card className="text-center hover:shadow-lg transition-all duration-300 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg text-yellow-700 dark:text-yellow-300">العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  تجربة تسوق محسّنة مع متابعة الطلبات
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="border-0 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-current" />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold">
                  جرب النظام المحسّن الآن
                </h2>
                
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  انضم إلى آلاف المستخدمين الذين يستفيدون من الأداء المحسّن والأمان العالي
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/fast-auth">
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-lg px-8 py-4 rounded-xl">
                      <Zap className="w-5 h-5 mr-2" />
                      ابدأ التجربة الآن
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FastIndex;