import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { LogIn, UserPlus, MessageSquare, Mail, Sparkles } from 'lucide-react';
import SupabaseSMSAuth from './SupabaseSMSAuth';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import UsernameRegistration from './UsernameRegistration';
const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    signIn,
    signUp
  } = useSupabaseAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    role: 'affiliate' as 'affiliate' | 'merchant' | 'admin'
  });
  const [signUpStep, setSignUpStep] = useState<'details' | 'username'>('details');
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberMe');
    if (savedCredentials) {
      try {
        const {
          email,
          rememberMe
        } = JSON.parse(savedCredentials);
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
    if (!signInForm.email || !signInForm.password) return;
    setIsLoading(true);
    const result = await signIn(signInForm.email, signInForm.password);
    if (!result.error) {
      if (signInForm.rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify({
          email: signInForm.email,
          rememberMe: true
        }));
      } else {
        localStorage.removeItem('rememberMe');
      }
      navigate((result as any).redirect || '/');
    }
    setIsLoading(false);
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpForm.email || !signUpForm.password || !signUpForm.fullName) return;
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
        description: `مرحباً ${username}! تم إنشاء حسابك بنجاح`
      });
      navigate('/');
    }
    setIsLoading(false);
  };
  return <div className="min-h-screen bg-anaqati-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-anaqati-pink/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-anaqati-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-anaqati-burgundy/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-anaqati-pink-light px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-anaqati-burgundy" />
            <span className="text-sm font-medium text-anaqati-burgundy">منصة أناقتي</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-anaqati-burgundy mb-3">
            أناقتي
          </h1>
          <p className="text-anaqati-text-secondary text-lg">
            منصة التسوق الأنيقة للأزياء والموضة
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 h-0.5 bg-anaqati-burgundy/30 rounded-full" />
            <div className="w-2 h-2 bg-anaqati-gold rounded-full" />
            <div className="w-12 h-0.5 bg-anaqati-burgundy/30 rounded-full" />
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-anaqati-border shadow-anaqati p-6 md:p-8 text-primary-dark">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-anaqati-cream p-1 rounded-xl">
              <TabsTrigger value="signin" className="gap-2 data-[state=active]:bg-anaqati-burgundy data-[state=active]:text-white rounded-lg py-2.5 text-sm font-semibold transition-all">
                <LogIn className="h-4 w-4" />
                دخول
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-2 data-[state=active]:bg-anaqati-burgundy data-[state=active]:text-white rounded-lg py-2.5 text-sm font-semibold transition-all">
                <UserPlus className="h-4 w-4" />
                تسجيل
              </TabsTrigger>
              <TabsTrigger value="sms" className="gap-2 data-[state=active]:bg-anaqati-burgundy data-[state=active]:text-white rounded-lg py-2.5 text-sm font-semibold transition-all">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-anaqati-pink-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-anaqati-burgundy" />
                </div>
                <h2 className="text-2xl font-bold text-anaqati-text">مرحباً بعودتك</h2>
                <p className="text-anaqati-text-secondary text-sm mt-1">سجل دخولك للمتابعة</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2 text-right text-primary-dark">
                  <Label htmlFor="signin-email" className="text-anaqati-text font-semibold">
                    البريد الإلكتروني
                  </Label>
                  <Input id="signin-email" type="email" value={signInForm.email} onChange={e => setSignInForm(prev => ({
                  ...prev,
                  email: e.target.value
                }))} placeholder="أدخل بريدك الإلكتروني" required className="h-12 bg-anaqati-cream border-anaqati-border focus:border-anaqati-burgundy focus:ring-anaqati-burgundy/20 rounded-xl text-right text-foreground placeholder:text-muted-foreground" />
                </div>
                
                <div className="space-y-2 text-right text-primary-dark">
                  <Label htmlFor="signin-password" className="text-anaqati-text font-semibold">
                    كلمة المرور
                  </Label>
                  <Input id="signin-password" type="password" value={signInForm.password} onChange={e => setSignInForm(prev => ({
                  ...prev,
                  password: e.target.value
                }))} placeholder="أدخل كلمة المرور" required className="h-12 bg-anaqati-cream border-anaqati-border focus:border-anaqati-burgundy focus:ring-anaqati-burgundy/20 rounded-xl text-right text-foreground placeholder:text-muted-foreground" />
                </div>
                
                <div className="flex items-center gap-3 justify-end bg-anaqati-pink-light/50 p-4 rounded-xl">
                  <Label htmlFor="remember-me" className="text-sm font-medium text-anaqati-text cursor-pointer">
                    تذكرني
                  </Label>
                  <Checkbox id="remember-me" checked={signInForm.rememberMe} onCheckedChange={checked => setSignInForm(prev => ({
                  ...prev,
                  rememberMe: checked as boolean
                }))} className="data-[state=checked]:bg-anaqati-burgundy data-[state=checked]:border-anaqati-burgundy" />
                </div>

                <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl bg-[#5A2647] hover:bg-[#743366] !text-white shadow-anaqati" disabled={isLoading}>
                  <Mail className="ml-2 h-5 w-5" />
                  {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-anaqati-pink-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-anaqati-burgundy" />
                </div>
                <h2 className="text-2xl font-bold text-anaqati-text">
                  {signUpStep === 'details' ? 'إنشاء حساب جديد' : 'اختر اسم المستخدم'}
                </h2>
                <p className="text-anaqati-text-secondary text-sm mt-1">
                  {signUpStep === 'details' ? 'انضم إلى عالم الأناقة' : 'اسم فريد يميزك'}
                </p>
              </div>

              {signUpStep === 'details' ? <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2 text-right">
                    <Label className="text-anaqati-text font-semibold">الاسم الكامل</Label>
                    <Input type="text" value={signUpForm.fullName} onChange={e => setSignUpForm(prev => ({
                  ...prev,
                  fullName: e.target.value
                }))} placeholder="أدخل اسمك الكامل" required className="h-12 bg-anaqati-cream border-anaqati-border focus:border-anaqati-burgundy rounded-xl text-right text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div className="space-y-2 text-right">
                    <Label className="text-anaqati-text font-semibold">البريد الإلكتروني</Label>
                    <Input type="email" value={signUpForm.email} onChange={e => setSignUpForm(prev => ({
                  ...prev,
                  email: e.target.value
                }))} placeholder="أدخل بريدك الإلكتروني" required className="h-12 bg-anaqati-cream border-anaqati-border focus:border-anaqati-burgundy rounded-xl text-right text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div className="space-y-2 text-right">
                    <Label className="text-anaqati-text font-semibold">كلمة المرور</Label>
                    <Input type="password" value={signUpForm.password} onChange={e => setSignUpForm(prev => ({
                  ...prev,
                  password: e.target.value
                }))} placeholder="كلمة مرور قوية" required className="h-12 bg-anaqati-cream border-anaqati-border focus:border-anaqati-burgundy rounded-xl text-right text-foreground placeholder:text-muted-foreground" />
                  </div>

                  <div className="space-y-3 text-right">
                    <Label className="text-anaqati-text font-semibold">نوع الحساب</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setSignUpForm(prev => ({
                    ...prev,
                    role: 'affiliate'
                  }))} className={`p-4 rounded-xl border-2 transition-all ${signUpForm.role === 'affiliate' ? 'border-anaqati-burgundy bg-anaqati-pink-light' : 'border-anaqati-border bg-white hover:border-anaqati-burgundy/50'}`}>
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="font-bold text-anaqati-text text-sm">مسوق</div>
                        <div className="text-xs text-anaqati-text-secondary mt-1">ترويج وعمولات</div>
                      </button>
                      <button type="button" onClick={() => setSignUpForm(prev => ({
                    ...prev,
                    role: 'merchant'
                  }))} className={`p-4 rounded-xl border-2 transition-all ${signUpForm.role === 'merchant' ? 'border-anaqati-burgundy bg-anaqati-pink-light' : 'border-anaqati-border bg-white hover:border-anaqati-burgundy/50'}`}>
                        <div className="text-2xl mb-2">🏪</div>
                        <div className="font-bold text-anaqati-text text-sm">تاجر</div>
                        <div className="text-xs text-anaqati-text-secondary mt-1">بيع المنتجات</div>
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl bg-[#5A2647] hover:bg-[#743366] !text-white shadow-anaqati" disabled={isLoading}>
                    <UserPlus className="ml-2 h-5 w-5" />
                    متابعة
                  </Button>
                </form> : <div className="space-y-4">
                  <UsernameRegistration onUsernameSubmit={handleUsernameSubmit} isLoading={isLoading} />
                  <Button variant="outline" onClick={() => setSignUpStep('details')} className="w-full">
                    العودة
                  </Button>
                </div>}
            </TabsContent>

            {/* SMS Tab */}
            <TabsContent value="sms" className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-anaqati-pink-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-anaqati-burgundy" />
                </div>
                <h2 className="text-2xl font-bold text-anaqati-text">الدخول برسالة SMS</h2>
                <p className="text-anaqati-text-secondary text-sm mt-1">أدخل رقم هاتفك</p>
              </div>
              <SupabaseSMSAuth />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-anaqati-text-secondary text-sm mt-6">
          بتسجيلك، أنت توافق على{' '}
          <a href="/terms" className="text-anaqati-burgundy hover:underline">شروط الاستخدام</a>
          {' '}و{' '}
          <a href="/privacy" className="text-anaqati-burgundy hover:underline">سياسة الخصوصية</a>
        </p>
      </div>
    </div>;
};
export default AuthPage;