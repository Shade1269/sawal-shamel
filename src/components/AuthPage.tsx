import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail } from 'lucide-react';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resendVerification } = useAuth();
  const navigate = useNavigate();

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    countryCode: '+966', // السعودية افتراضي
    verifyMethod: 'email' // 'email' or 'phone'
  });

  // قائمة الدول العربية مع أرقامها
  const arabCountries = [
    { code: '+966', name: 'السعودية', flag: '🇸🇦' },
    { code: '+971', name: 'الإمارات', flag: '🇦🇪' },
    { code: '+974', name: 'قطر', flag: '🇶🇦' },
    { code: '+965', name: 'الكويت', flag: '🇰🇼' },
    { code: '+973', name: 'البحرين', flag: '🇧🇭' },
    { code: '+968', name: 'عُمان', flag: '🇴🇲' },
    { code: '+962', name: 'الأردن', flag: '🇯🇴' },
    { code: '+961', name: 'لبنان', flag: '🇱🇧' },
    { code: '+963', name: 'سوريا', flag: '🇸🇾' },
    { code: '+964', name: 'العراق', flag: '🇮🇶' },
    { code: '+20', name: 'مصر', flag: '🇪🇬' },
    { code: '+212', name: 'المغرب', flag: '🇲🇦' },
    { code: '+213', name: 'الجزائر', flag: '🇩🇿' },
    { code: '+216', name: 'تونس', flag: '🇹🇳' },
    { code: '+218', name: 'ليبيا', flag: '🇱🇾' },
    { code: '+249', name: 'السودان', flag: '🇸🇩' },
    { code: '+967', name: 'اليمن', flag: '🇾🇪' }
  ];

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
    console.log('handleSignIn called with:', { email: signInForm.email, password: '***' });
    
    if (!signInForm.email || !signInForm.password) {
      console.log('Missing email or password:', { email: signInForm.email, hasPassword: !!signInForm.password });
      return;
    }
    
    setIsLoading(true);
    const result = await signIn(signInForm.email, signInForm.password, signInForm.rememberMe);
    console.log('SignIn result:', result);
    
    if (!result.error) {
      // التوجيه مباشرة لصفحة الدردشة بعد نجاح تسجيل الدخول
      navigate('/chat');
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
    
    // التحقق من المطلوبات حسب نوع التحقق
    const isEmailMethod = signUpForm.verifyMethod === 'email';
    const isPhoneMethod = signUpForm.verifyMethod === 'phone';
    
    if (!signUpForm.password || !signUpForm.fullName) {
      console.log('Missing required fields');
      return;
    }
    
    if (isEmailMethod && !signUpForm.email) {
      console.log('Missing email for email verification');
      return;
    }
    
    if (isPhoneMethod && !signUpForm.phone) {
      console.log('Missing phone for phone verification');
      return;
    }
    
    setIsLoading(true);
    // تجميع رقم الجوال الكامل مع رمز الدولة
    const fullPhoneNumber = isPhoneMethod ? `${signUpForm.countryCode}${signUpForm.phone}` : '';
    
    const result = await signUp(
      signUpForm.email, 
      signUpForm.password, 
      signUpForm.fullName,
      signUpForm.verifyMethod,
      fullPhoneNumber
    );
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
                   
                   <div className="space-y-3 text-right">
                     <Label>طريقة التحقق</Label>
                     <RadioGroup 
                       value={signUpForm.verifyMethod} 
                       onValueChange={(value) => setSignUpForm(prev => ({...prev, verifyMethod: value}))}
                       className="flex gap-6 justify-center"
                     >
                       <div className="flex items-center space-x-2 space-x-reverse">
                         <RadioGroupItem value="email" id="verify-email" />
                         <Label htmlFor="verify-email" className="flex items-center gap-2 cursor-pointer">
                           <Mail className="h-4 w-4" />
                           البريد الإلكتروني
                         </Label>
                       </div>
                       <div className="flex items-center space-x-2 space-x-reverse">
                         <RadioGroupItem value="phone" id="verify-phone" />
                         <Label htmlFor="verify-phone" className="flex items-center gap-2 cursor-pointer">
                           <Phone className="h-4 w-4" />
                           رقم الجوال
                         </Label>
                       </div>
                     </RadioGroup>
                   </div>
                   {signUpForm.verifyMethod === 'email' && (
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
                   )}
                   
                   {signUpForm.verifyMethod === 'phone' && (
                     <div className="space-y-2 text-right">
                       <Label htmlFor="signup-phone">رقم الجوال</Label>
                       <div className="flex gap-2">
                         <Select 
                           value={signUpForm.countryCode} 
                           onValueChange={(value) => setSignUpForm(prev => ({...prev, countryCode: value}))}
                         >
                           <SelectTrigger className="w-[140px]">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-background border border-border shadow-lg z-50">
                             {arabCountries.map((country) => (
                               <SelectItem 
                                 key={country.code} 
                                 value={country.code}
                                 className="text-right cursor-pointer hover:bg-accent"
                               >
                                 <div className="flex items-center gap-2">
                                   <span>{country.flag}</span>
                                   <span>{country.code}</span>
                                   <span className="text-sm text-muted-foreground">{country.name}</span>
                                 </div>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                         <Input
                           id="signup-phone"
                           type="tel"
                           value={signUpForm.phone}
                           onChange={(e) => {
                             // إزالة الأصفار في البداية تلقائياً
                             const value = e.target.value.replace(/^0+/, '');
                             setSignUpForm(prev => ({...prev, phone: value}));
                           }}
                           placeholder="xxxxxxxxx"
                           required
                           className="text-right flex-1"
                         />
                       </div>
                       <div className="text-xs text-muted-foreground text-right">
                         أدخل الرقم بدون الصفر في البداية
                       </div>
                     </div>
                   )}
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
                   {signUpForm.verifyMethod === 'email' && (
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
                   )}
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