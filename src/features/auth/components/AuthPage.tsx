import React, { useState, useEffect } from 'react';
import { 
  EnhancedButton,
  EnhancedCard,
  EnhancedCardContent,
  EnhancedCardDescription,
  EnhancedCardHeader,
  EnhancedCardTitle,
  ResponsiveLayout,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/index';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { LogIn, UserPlus, Mail, MessageSquare } from 'lucide-react';
import SupabaseSMSAuth from './SupabaseSMSAuth';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import UsernameRegistration from './UsernameRegistration';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useSupabaseAuth();
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
    username: '',
    role: 'affiliate' as 'affiliate' | 'merchant' | 'admin',
  });

  const [signUpStep, setSignUpStep] = useState<'details' | 'username'>('details');

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
    
    if (!signInForm.email || !signInForm.password) {
      return;
    }
    
    setIsLoading(true);
    
    const result = await signIn(signInForm.email, signInForm.password);
    
    if (!result.error) {
      // حفظ "تذكرني" قبل التوجيه
      if (signInForm.rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify({
          email: signInForm.email,
          rememberMe: true
        }));
      } else {
        localStorage.removeItem('rememberMe');
      }
      // التوجيه حسب الدور إن وجد، وإلا للصفحة الرئيسية
      navigate((result as any).redirect || '/');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpForm.email || !signUpForm.password || !signUpForm.fullName) {
      return;
    }
    
    // انتقل لخطوة اسم المستخدم
    setSignUpStep('username');
  };

  const handleUsernameSubmit = async (username: string) => {
    setIsLoading(true);
    
    const result = await signUp({
      email: signUpForm.email,
      password: signUpForm.password,
      fullName: signUpForm.fullName,
      username,
      role: signUpForm.role || 'affiliate'
    });
    
    if (!result.error) {
      toast({
        title: 'تم إنشاء الحساب بنجاح!',
        description: `مرحباً ${username}! تم إنشاء حسابك بنجاح`,
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-hero opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-luxury opacity-15 rounded-full blur-2xl"></div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <h1 className="text-6xl font-black bg-gradient-persian bg-clip-text text-transparent">أتلانتس</h1>
              <div className="absolute -inset-1 bg-gradient-persian opacity-20 blur-lg rounded-lg"></div>
            </div>
          </div>
          <p className="text-xl text-muted-foreground font-medium">منصة أتلانتس للتجارة الإلكترونية الفاخرة</p>
          <div className="w-24 h-1 bg-gradient-persian mx-auto mt-4 rounded-full"></div>
        </div>

        <Card className="backdrop-blur-xl bg-card/60 border border-white/20 shadow-luxury animate-slide-up">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/30 backdrop-blur-sm p-1.5 rounded-2xl border border-border/30">
              <TabsTrigger value="signin" className="gap-2 data-[state=active]:bg-gradient-persian data-[state=active]:text-primary-foreground data-[state=active]:shadow-persian transition-all duration-400 rounded-xl py-3.5 font-bold text-sm">
                <LogIn className="h-4 w-4" />
                تسجيل دخول
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-2 data-[state=active]:bg-gradient-commerce data-[state=active]:text-primary-foreground data-[state=active]:shadow-luxury transition-all duration-400 rounded-xl py-3.5 font-bold text-sm">
                <UserPlus className="h-4 w-4" />
                حساب جديد
              </TabsTrigger>
              <TabsTrigger value="sms" className="gap-2 data-[state=active]:bg-gradient-premium data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft transition-all duration-400 rounded-xl py-3.5 font-bold text-sm">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-0">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-3xl font-bold bg-gradient-persian bg-clip-text text-transparent">مرحباً بعودتك</CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">
                  سجل دخولك لمتابعة رحلة التسوق الفاخرة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-3 text-right">
                    <Label htmlFor="signin-email" className="text-base font-semibold text-foreground">البريد الإلكتروني</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm(prev => ({...prev, email: e.target.value}))}
                      placeholder="أدخل بريدك الإلكتروني"
                      required
                      className="text-right h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-3 text-right">
                    <Label htmlFor="signin-password" className="text-base font-semibold text-foreground">كلمة المرور</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm(prev => ({...prev, password: e.target.value}))}
                      placeholder="أدخل كلمة المرور"
                      required
                      className="text-right h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-300 rounded-xl"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3 space-x-reverse justify-end p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-border/30">
                    <Checkbox 
                      id="remember-me"
                      checked={signInForm.rememberMe}
                      onCheckedChange={(checked) => 
                        setSignInForm(prev => ({...prev, rememberMe: checked as boolean}))
                      }
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label 
                      htmlFor="remember-me" 
                      className="text-base font-medium cursor-pointer"
                    >
                      تذكرني (البقاء متصلاً)
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    variant="persian"
                    size="lg"
                    className="w-full h-14 text-lg font-bold rounded-xl mt-8" 
                    disabled={isLoading}
                  >
                    <Mail className="ml-2 h-5 w-5" />
                    {isLoading ? 'جاري تسجيل الدخول...' : 'دخول إلى أتلانتس'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup" className="space-y-0">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-3xl font-bold bg-gradient-commerce bg-clip-text text-transparent">
                  {signUpStep === 'details' ? 'انضم إلى أتلانتس' : 'اختر اسم المستخدم'}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">
                  {signUpStep === 'details' 
                    ? 'ابدأ رحلة التجارة الإلكترونية المميزة'
                    : 'اختر اسم المستخدم الذي سيظهر في حسابك'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {signUpStep === 'details' ? (
                  <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="space-y-3 text-right">
                      <Label htmlFor="signup-fullname" className="text-base font-semibold text-foreground">الاسم الكامل</Label>
                      <Input
                        id="signup-fullname"
                        type="text"
                        value={signUpForm.fullName}
                        onChange={(e) => setSignUpForm(prev => ({...prev, fullName: e.target.value}))}
                        placeholder="أدخل اسمك الكامل"
                        required
                        className="text-right h-12 bg-background/50 border-border/50 focus:border-accent/50 focus:bg-background transition-all duration-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-3 text-right">
                      <Label htmlFor="signup-email" className="text-base font-semibold text-foreground">البريد الإلكتروني</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm(prev => ({...prev, email: e.target.value}))}
                        placeholder="أدخل بريدك الإلكتروني"
                        required
                        className="text-right h-12 bg-background/50 border-border/50 focus:border-accent/50 focus:bg-background transition-all duration-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-3 text-right">
                      <Label htmlFor="signup-password" className="text-base font-semibold text-foreground">كلمة المرور</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm(prev => ({...prev, password: e.target.value}))}
                        placeholder="أدخل كلمة مرور قوية"
                        required
                        className="text-right h-12 bg-background/50 border-border/50 focus:border-accent/50 focus:bg-background transition-all duration-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-3 text-right">
                      <Label className="text-base font-semibold text-foreground">نوع الحساب</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSignUpForm(prev => ({...prev, role: 'affiliate'}))}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            signUpForm.role === 'affiliate'
                              ? 'border-primary bg-primary/10 shadow-lg'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">🎯</div>
                            <div className="font-bold text-sm">مسوق</div>
                            <div className="text-xs text-muted-foreground mt-1">ترويج المنتجات وكسب العمولات</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignUpForm(prev => ({...prev, role: 'merchant'}))}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            signUpForm.role === 'merchant'
                              ? 'border-accent bg-accent/10 shadow-lg'
                              : 'border-border hover:border-accent/50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">🏪</div>
                            <div className="font-bold text-sm">تاجر</div>
                            <div className="text-xs text-muted-foreground mt-1">عرض وبيع المنتجات</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      variant="commerce"
                      size="lg"
                      className="w-full h-14 text-lg font-bold rounded-xl mt-8" 
                      disabled={isLoading}
                    >
                      <Mail className="ml-2 h-5 w-5" />
                      {isLoading ? 'جاري المعالجة...' : 'متابعة التسجيل'}
                    </Button>

                    <div className="text-center text-base text-muted-foreground bg-gradient-to-r from-muted via-background to-muted p-4 rounded-xl border border-border/30">
                      ستحتاج لاختيار اسم المستخدم في الخطوة التالية
                    </div>
                  </form>
                ) : (
                    <div className="space-y-6">
                      <UsernameRegistration
                        onUsernameSubmit={handleUsernameSubmit}
                        isLoading={isLoading}
                      />
                      <div className="text-center">
                        <Button 
                          type="button" 
                          variant="glass" 
                          size="sm" 
                          onClick={() => setSignUpStep('details')}
                          disabled={isLoading}
                          className="px-6 py-2 rounded-lg"
                        >
                          رجوع للخطوة السابقة
                        </Button>
                      </div>
                    </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="sms" className="space-y-0">
              <SupabaseSMSAuth />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;