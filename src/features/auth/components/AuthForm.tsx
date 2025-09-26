import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFastAuth } from '@/hooks/useFastAuth';
import { Loader2, User, Users, ShoppingCart, Star } from 'lucide-react';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';

const AuthForm = () => {
  const { signIn, signUp, loading, isAuthenticated, profile } = useFastAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    role: 'affiliate' as 'affiliate' | 'marketer' | 'admin'
  });

  const { goToUserHome } = useSmartNavigation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      goToUserHome(profile?.role);
    }
    if (!isAuthenticated) {
      hasRedirectedRef.current = false;
    }
  }, [goToUserHome, isAuthenticated, loading, profile?.role]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn(signInData.email, signInData.password);
      if (!result?.error) {
        // سيتم التوجيه تلقائياً للداشبورد من useAuth
        console.log('تم تسجيل الدخول بنجاح');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signUp({
        email: signUpData.email,
        password: signUpData.password,
        fullName: signUpData.fullName,
        username: signUpData.username || signUpData.fullName,
        role: signUpData.role
      });
      if (!result?.error) {
        console.log('تم إنشاء الحساب بنجاح');
      }
    } catch (error) {
      console.error('خطأ في إنشاء الحساب:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-persian-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-persian-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-luxury">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            منصة الأفيليت
          </CardTitle>
          <CardDescription>
            منصة التسويق بالعمولة الرائدة في المملكة العربية السعودية
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password">كلمة المرور</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInData.password}
                    onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    dir="ltr"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">الاسم الكامل</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="اسمك الكامل"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-username">اسم المستخدم</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="اسم المستخدم الظاهر"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">كلمة المرور</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-role">نوع الحساب</Label>
                  <Select
                    value={signUpData.role}
                    onValueChange={(value: 'affiliate' | 'marketer' | 'admin') =>
                      setSignUpData(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع حسابك" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="affiliate">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          مسوق
                        </div>
                      </SelectItem>
                      <SelectItem value="marketer">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          مسوق محترف
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          مسؤول
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    'إنشاء حساب جديد'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;