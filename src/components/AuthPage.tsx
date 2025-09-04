import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, MessageCircle } from 'lucide-react';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resendVerification } = useAuth();

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });

  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSignIn called with:', { email: signInForm.email, password: '***' });
    
    if (!signInForm.email || !signInForm.password) {
      console.log('Missing email or password:', { email: signInForm.email, hasPassword: !!signInForm.password });
      return;
    }
    
    setIsLoading(true);
    const result = await signIn(signInForm.email, signInForm.password);
    console.log('SignIn result:', result);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSignUp called with:', { 
      email: signUpForm.email, 
      fullName: signUpForm.fullName, 
      password: '***' 
    });
    
    if (!signUpForm.email || !signUpForm.password || !signUpForm.fullName) {
      console.log('Missing signup fields:', { 
        email: signUpForm.email, 
        fullName: signUpForm.fullName, 
        hasPassword: !!signUpForm.password 
      });
      return;
    }
    
    setIsLoading(true);
    const result = await signUp(signUpForm.email, signUpForm.password, signUpForm.fullName);
    console.log('SignUp result:', result);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-12 w-12 text-primary ml-2" />
            <h1 className="text-4xl font-bold text-primary">دردشتي</h1>
          </div>
          <p className="text-muted-foreground">منصة الدردشة العربية الحديثة</p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin" className="gap-2">
                <LogIn className="h-4 w-4" />
                تسجيل دخول
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-2">
                <UserPlus className="h-4 w-4" />
                حساب جديد
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-right">مرحباً بعودتك</CardTitle>
                <CardDescription className="text-right">
                  سجل دخولك للمتابعة إلى الدردشة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="signin-email">البريد الإلكتروني</Label>
                     <Input
                       id="signin-email"
                       type="email"
                       value={signInForm.email}
                       onChange={(e) => {
                         console.log('Email input changed:', e.target.value);
                         setSignInForm(prev => ({...prev, email: e.target.value}));
                       }}
                       placeholder="أدخل بريدك الإلكتروني"
                       required
                       className="text-right"
                     />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="signin-password">كلمة المرور</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm(prev => ({...prev, password: e.target.value}))}
                      placeholder="أدخل كلمة المرور"
                      required
                      className="text-right"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'جاري التحقق...' : 'تسجيل دخول'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup" className="space-y-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-right">إنشاء حساب جديد</CardTitle>
                <CardDescription className="text-right">
                  أنشئ حسابك للانضمام إلى مجتمع الدردشة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="signup-name">الاسم الكامل</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signUpForm.fullName}
                      onChange={(e) => setSignUpForm(prev => ({...prev, fullName: e.target.value}))}
                      placeholder="أدخل اسمك الكامل"
                      required
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm(prev => ({...prev, email: e.target.value}))}
                      placeholder="أدخل بريدك الإلكتروني"
                      required
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="signup-password">كلمة المرور</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm(prev => ({...prev, password: e.target.value}))}
                      placeholder="أدخل كلمة مرور قوية"
                      required
                      className="text-right"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={async () => {
                      if (!signUpForm.email) {
                        console.log('Resend clicked without email');
                        return;
                      }
                      setIsLoading(true);
                      const result = await resendVerification(signUpForm.email);
                      console.log('Resend verification result:', result);
                      setIsLoading(false);
                    }}
                  >
                    لم يصلك البريد؟ أعد إرسال رابط التحقق
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;