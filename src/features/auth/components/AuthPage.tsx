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
    <div className="min-h-screen gradient-bg-accent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 gradient-overlay"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-hero opacity-8 rounded-full blur-3xl animate-persian-float"></div>
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-luxury opacity-12 rounded-full blur-2xl animate-persian-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-ocean opacity-5 rounded-full blur-3xl animate-persian-float" style={{ animationDelay: '4s' }}></div>
      
      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-persian-float"></div>
      <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-luxury/40 rounded-full animate-persian-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-premium/50 rounded-full animate-persian-float" style={{ animationDelay: '3s' }}></div>
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="relative group">
              <h1 className="text-7xl md:text-8xl font-black bg-gradient-hero bg-clip-text text-transparent heading-ar tracking-tight">
                أتلانتس
              </h1>
              <div className="absolute -inset-2 bg-gradient-hero opacity-20 blur-xl rounded-lg group-hover:opacity-30 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 bg-gradient-hero opacity-10 blur-lg rounded-lg"></div>
            </div>
          </div>
          <p className="text-2xl md:text-3xl text-muted-foreground/90 font-medium elegant-text mb-4">
            منصة أتلانتس للتجارة الإلكترونية الفاخرة
          </p>
          <p className="text-lg text-muted-foreground/70 premium-text mb-6">
            انضم إلى عالم التسوق الرقمي المتميز
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-1 bg-gradient-hero rounded-full"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-16 h-1 bg-gradient-luxury rounded-full"></div>
          </div>
        </div>

        <EnhancedCard variant="glass" className="backdrop-blur-xl bg-card/70 border border-white/30 shadow-luxury animate-slide-up hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <Tabs defaultValue="signin" className="w-full">
            <div className="px-8 pt-8">
              <TabsList className="grid w-full grid-cols-3 mb-10 gradient-bg-muted backdrop-blur-sm p-1.5 rounded-2xl border border-white/20 shadow-soft">
                <TabsTrigger value="signin" className="gap-2 data-[state=active]:bg-gradient-ocean data-[state=active]:text-white data-[state=active]:shadow-ocean transition-all duration-500 rounded-xl py-3 font-bold text-sm group">
                  <LogIn className="h-4 w-4 group-data-[state=active]:scale-110 transition-transform duration-300" />
                تسجيل دخول
              </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2 data-[state=active]:bg-gradient-sunset data-[state=active]:text-white data-[state=active]:shadow-sunset transition-all duration-500 rounded-xl py-3 font-bold text-sm group">
                  <UserPlus className="h-4 w-4 group-data-[state=active]:scale-110 transition-transform duration-300" />
                حساب جديد
              </TabsTrigger>
                <TabsTrigger value="sms" className="gap-2 data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-purple transition-all duration-500 rounded-xl py-3 font-bold text-sm group">
                  <MessageSquare className="h-4 w-4 group-data-[state=active]:scale-110 transition-transform duration-300" />
                SMS
              </TabsTrigger>
            </TabsList>
            </div>

            <TabsContent value="signin" className="space-y-0">
              <EnhancedCardHeader className="pb-8 text-center px-8">
                <div className="mx-auto w-20 h-20 bg-gradient-ocean rounded-2xl flex items-center justify-center mb-6 shadow-ocean">
                  <LogIn className="h-10 w-10 text-white" />
                </div>
                <EnhancedCardTitle className="text-4xl font-bold bg-gradient-ocean bg-clip-text text-transparent premium-text">مرحباً بعودتك</EnhancedCardTitle>
                <EnhancedCardDescription className="text-xl text-muted-foreground/90 mt-3 elegant-text">
                  سجل دخولك لمتابعة رحلة التسوق الفاخرة
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-8 px-8 pb-8">
                <form onSubmit={handleSignIn} className="space-y-8">
                  <div className="space-y-4 text-right">
                    <Label htmlFor="signin-email" className="text-lg font-bold text-foreground premium-text">البريد الإلكتروني</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm(prev => ({...prev, email: e.target.value}))}
                      placeholder="أدخل بريدك الإلكتروني"
                      required
                      className="text-right h-14 bg-background/60 border-border/60 focus:border-ocean/60 focus:bg-background transition-all duration-500 rounded-2xl text-lg px-6 shadow-soft hover:shadow-glow"
                    />
                  </div>
                  
                  <div className="space-y-4 text-right">
                    <Label htmlFor="signin-password" className="text-lg font-bold text-foreground premium-text">كلمة المرور</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm(prev => ({...prev, password: e.target.value}))}
                      placeholder="أدخل كلمة المرور"
                      required
                      className="text-right h-14 bg-background/60 border-border/60 focus:border-ocean/60 focus:bg-background transition-all duration-500 rounded-2xl text-lg px-6 shadow-soft hover:shadow-glow"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-4 space-x-reverse justify-end p-6 gradient-bg-primary rounded-2xl border border-ocean/20 shadow-soft">
                    <Checkbox 
                      id="remember-me"
                      checked={signInForm.rememberMe}
                      onCheckedChange={(checked) => 
                        setSignInForm(prev => ({...prev, rememberMe: checked as boolean}))
                      }
                      className="data-[state=checked]:bg-ocean data-[state=checked]:border-ocean w-5 h-5"
                    />
                    <Label 
                      htmlFor="remember-me" 
                      className="text-lg font-semibold cursor-pointer premium-text"
                    >
                      تذكرني (البقاء متصلاً)
                    </Label>
                  </div>

                  <EnhancedButton 
                    type="submit" 
                    variant="premium"
                    size="xl"
                    className="w-full h-16 text-xl font-bold rounded-2xl mt-10 shadow-ocean hover:shadow-2xl" 
                    disabled={isLoading}
                    animation="glow"
                  >
                    <Mail className="ml-3 h-6 w-6" />
                    {isLoading ? 'جاري تسجيل الدخول...' : 'دخول إلى أتلانتس'}
                  </EnhancedButton>
                </form>
              </EnhancedCardContent>
            </TabsContent>

            <TabsContent value="signup" className="space-y-0">
              <EnhancedCardHeader className="pb-8 text-center px-8">
                <div className="mx-auto w-20 h-20 bg-gradient-sunset rounded-2xl flex items-center justify-center mb-6 shadow-sunset">
                  <UserPlus className="h-10 w-10 text-white" />
                </div>
                <EnhancedCardTitle className="text-4xl font-bold bg-gradient-sunset bg-clip-text text-transparent premium-text">
                  {signUpStep === 'details' ? 'انضم إلى أتلانتس' : 'اختر اسم المستخدم'}
                </EnhancedCardTitle>
                <EnhancedCardDescription className="text-xl text-muted-foreground/90 mt-3 elegant-text">
                  {signUpStep === 'details' 
                    ? 'ابدأ رحلة التجارة الإلكترونية المميزة'
                    : 'اختر اسم المستخدم الذي سيظهر في حسابك'
                  }
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-8 px-8 pb-8">
                {signUpStep === 'details' ? (
                  <form onSubmit={handleSignUp} className="space-y-8">
                    <div className="space-y-4 text-right">
                      <Label htmlFor="signup-fullname" className="text-lg font-bold text-foreground premium-text">الاسم الكامل</Label>
                      <Input
                        id="signup-fullname"
                        type="text"
                        value={signUpForm.fullName}
                        onChange={(e) => setSignUpForm(prev => ({...prev, fullName: e.target.value}))}
                        placeholder="أدخل اسمك الكامل"
                        required
                        className="text-right h-14 bg-background/60 border-border/60 focus:border-sunset/60 focus:bg-background transition-all duration-500 rounded-2xl text-lg px-6 shadow-soft hover:shadow-glow"
                      />
                    </div>

                    <div className="space-y-4 text-right">
                      <Label htmlFor="signup-email" className="text-lg font-bold text-foreground premium-text">البريد الإلكتروني</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm(prev => ({...prev, email: e.target.value}))}
                        placeholder="أدخل بريدك الإلكتروني"
                        required
                        className="text-right h-14 bg-background/60 border-border/60 focus:border-sunset/60 focus:bg-background transition-all duration-500 rounded-2xl text-lg px-6 shadow-soft hover:shadow-glow"
                      />
                    </div>

                    <div className="space-y-4 text-right">
                      <Label htmlFor="signup-password" className="text-lg font-bold text-foreground premium-text">كلمة المرور</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm(prev => ({...prev, password: e.target.value}))}
                        placeholder="أدخل كلمة مرور قوية"
                        required
                        className="text-right h-14 bg-background/60 border-border/60 focus:border-sunset/60 focus:bg-background transition-all duration-500 rounded-2xl text-lg px-6 shadow-soft hover:shadow-glow"
                      />
                    </div>

                    <div className="space-y-6 text-right">
                      <Label className="text-lg font-bold text-foreground premium-text">نوع الحساب</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setSignUpForm(prev => ({...prev, role: 'affiliate'}))}
                          className={`p-6 rounded-2xl border-2 transition-all duration-500 group hover:scale-105 ${
                            signUpForm.role === 'affiliate'
                              ? 'border-sunset gradient-card-accent shadow-sunset'
                              : 'border-border hover:border-sunset/50 gradient-card-muted'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🎯</div>
                            <div className="font-bold text-base premium-text">مسوق</div>
                            <div className="text-sm text-muted-foreground mt-2 elegant-text">ترويج المنتجات وكسب العمولات</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignUpForm(prev => ({...prev, role: 'merchant'}))}
                          className={`p-6 rounded-2xl border-2 transition-all duration-500 group hover:scale-105 ${
                            signUpForm.role === 'merchant'
                              ? 'border-sunset gradient-card-accent shadow-sunset'
                              : 'border-border hover:border-sunset/50 gradient-card-muted'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🏪</div>
                            <div className="font-bold text-base premium-text">تاجر</div>
                            <div className="text-sm text-muted-foreground mt-2 elegant-text">عرض وبيع المنتجات</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <EnhancedButton 
                      type="submit" 
                      variant="luxury"
                      size="xl"
                      className="w-full h-16 text-xl font-bold rounded-2xl mt-10 shadow-sunset hover:shadow-2xl" 
                      disabled={isLoading}
                      animation="glow"
                    >
                      <Mail className="ml-3 h-6 w-6" />
                      {isLoading ? 'جاري المعالجة...' : 'متابعة التسجيل'}
                    </EnhancedButton>

                    <div className="text-center text-lg text-muted-foreground/80 gradient-info p-6 rounded-2xl shadow-soft elegant-text">
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
              </EnhancedCardContent>
            </TabsContent>

            <TabsContent value="sms" className="space-y-0">
              <EnhancedCardHeader className="pb-8 text-center px-8">
                <div className="mx-auto w-20 h-20 bg-gradient-purple rounded-2xl flex items-center justify-center mb-6 shadow-purple">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <EnhancedCardTitle className="text-4xl font-bold bg-gradient-purple bg-clip-text text-transparent premium-text">تسجيل دخول بـ SMS</EnhancedCardTitle>
                <EnhancedCardDescription className="text-xl text-muted-foreground/90 mt-3 elegant-text">
                  سجل دخولك باستخدام رقم هاتفك المحمول
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent className="px-8 pb-8">
              <SupabaseSMSAuth />
              </EnhancedCardContent>
            </TabsContent>
          </Tabs>
        </EnhancedCard>
      </div>
    </div>
  );
};

export default AuthPage;