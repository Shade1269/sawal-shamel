import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { LogIn, UserPlus, Mail, MessageSquare } from 'lucide-react';
import FirebaseSMSAuth from '@/components/FirebaseSMSAuth';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useFirebaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberMe');
    if (savedCredentials) {
      try {
        const { email, rememberMe } = JSON.parse(savedCredentials);
        if (rememberMe) {
          setSignInForm(prev => ({
            ...prev,
            email,
            rememberMe: true
          }));
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
        localStorage.removeItem('rememberMe');
      }
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSignIn called');
    
    if (!signInForm.email || !signInForm.password) {
      console.log('Missing email or password');
      return;
    }
    
    setIsLoading(true);
    
    const result = await signIn(signInForm.email, signInForm.password, signInForm.rememberMe);
    
    console.log('SignIn result:', result);
    
    if (!result.error) {
      navigate('/');
    }
    
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
      console.log('Missing required fields');
      return;
    }
    
    setIsLoading(true);
    
    const result = await signUp(signUpForm.email, signUpForm.password, signUpForm.fullName);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold text-primary">دردشتي</h1>
          </div>
          <p className="text-muted-foreground">منصة الدردشة العربية الحديثة</p>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="signin" className="gap-2">
                <LogIn className="h-4 w-4" />
                تسجيل دخول
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-2">
                <UserPlus className="h-4 w-4" />
                حساب جديد
              </TabsTrigger>
              <TabsTrigger value="sms" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
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
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id="remember-me"
                      checked={signInForm.rememberMe}
                      onCheckedChange={(checked) => 
                        setSignInForm(prev => ({...prev, rememberMe: checked as boolean}))
                      }
                    />
                    <Label 
                      htmlFor="remember-me" 
                      className="text-sm font-normal cursor-pointer"
                    >
                      تذكرني (البقاء متصلاً)
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    <Mail className="ml-2 h-4 w-4" />
                    {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل دخول'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup" className="space-y-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-right">إنشاء حساب جديد</CardTitle>
                <CardDescription className="text-right">
                  أدخل بياناتك لإنشاء حساب جديد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="signup-fullname">الاسم الكامل</Label>
                    <Input
                      id="signup-fullname"
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

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    <Mail className="ml-2 h-4 w-4" />
                    {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    سيتم إرسال رابط التحقق إلى بريدك الإلكتروني
                  </div>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="sms" className="space-y-0">
              <FirebaseSMSAuth />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;