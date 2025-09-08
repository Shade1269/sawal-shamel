import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, MessageCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resendVerification } = useAuth();
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

  const [whatsappOtpForm, setWhatsappOtpForm] = useState({
    phone: '',
    fullName: '',
    otp: '',
    countryCode: '+966',
    step: 'phone' as 'phone' | 'verify'
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

  const handleWhatsAppSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatsappOtpForm.phone || !whatsappOtpForm.fullName) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهاتف والاسم الكامل",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const fullPhoneNumber = whatsappOtpForm.phone.startsWith('+') 
        ? whatsappOtpForm.phone 
        : `${whatsappOtpForm.countryCode}${whatsappOtpForm.phone}`;

      const { data, error } = await supabase.functions.invoke('send-whatsapp-otp', {
        body: { phone: fullPhoneNumber }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "تم إرسال الرمز",
        description: "تم إرسال رمز التحقق إلى WhatsApp"
      });

      setWhatsappOtpForm(prev => ({ ...prev, step: 'verify' }));
    } catch (error: any) {
      console.error('Error sending WhatsApp OTP:', error);
      toast({
        title: "خطأ في إرسال الرمز",
        description: error.message || "حدث خطأ أثناء إرسال رمز التحقق",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatsappOtpForm.otp) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رمز التحقق",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const fullPhoneNumber = whatsappOtpForm.phone.startsWith('+') 
        ? whatsappOtpForm.phone 
        : `${whatsappOtpForm.countryCode}${whatsappOtpForm.phone}`;

      const { data, error } = await supabase.functions.invoke('verify-whatsapp-otp', {
        body: { 
          phone: fullPhoneNumber,
          code: whatsappOtpForm.otp,
          fullName: whatsappOtpForm.fullName
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        // If edge function returned a magic link, redirect to it to establish a session
        const actionLink = data?.authData?.properties?.action_link || data?.authData?.action_link;
        if (actionLink) {
          window.location.href = actionLink;
          return; // Stop further execution; browser will redirect
        }

        toast({
          title: "تم التحقق بنجاح",
          description: "مرحباً بك في دردشتي!"
        });
        navigate('/');
      } else {
        throw new Error(data.error || 'فشل في التحقق من الرمز');
      }
    } catch (error: any) {
      console.error('Error verifying WhatsApp OTP:', error);
      toast({
        title: "خطأ في التحقق",
        description: error.message || "رمز التحقق غير صحيح أو منتهي الصلاحية",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="signin" className="gap-2">
                <LogIn className="h-4 w-4" />
                تسجيل دخول
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-2">
                <UserPlus className="h-4 w-4" />
                حساب جديد
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                واتساب
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

            <TabsContent value="whatsapp" className="space-y-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-right">تسجيل عبر واتساب</CardTitle>
                <CardDescription className="text-right">
                  {whatsappOtpForm.step === 'phone' 
                    ? 'أدخل رقم هاتفك لإرسال رمز التحقق'
                    : 'أدخل رمز التحقق المرسل إلى واتساب'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {whatsappOtpForm.step === 'phone' ? (
                  <form onSubmit={handleWhatsAppSendOtp} className="space-y-4">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="whatsapp-fullname">الاسم الكامل</Label>
                      <Input
                        id="whatsapp-fullname"
                        type="text"
                        value={whatsappOtpForm.fullName}
                        onChange={(e) => setWhatsappOtpForm(prev => ({...prev, fullName: e.target.value}))}
                        placeholder="أدخل اسمك الكامل"
                        required
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2 text-right">
                      <Label htmlFor="whatsapp-phone">رقم الهاتف</Label>
                      <div className="flex gap-2">
                        <select 
                          value={whatsappOtpForm.countryCode}
                          onChange={(e) => setWhatsappOtpForm(prev => ({...prev, countryCode: e.target.value}))}
                          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+965">🇰🇼 +965</option>
                          <option value="+973">🇧🇭 +973</option>
                          <option value="+974">🇶🇦 +974</option>
                          <option value="+968">🇴🇲 +968</option>
                          <option value="+20">🇪🇬 +20</option>
                        </select>
                        <Input
                          id="whatsapp-phone"
                          type="tel"
                          value={whatsappOtpForm.phone}
                          onChange={(e) => setWhatsappOtpForm(prev => ({...prev, phone: e.target.value}))}
                          placeholder="501234567"
                          required
                          className="text-right flex-1"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      <MessageCircle className="ml-2 h-4 w-4" />
                      {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleWhatsAppVerifyOtp} className="space-y-4">
                    <div className="space-y-2 text-right">
                      <Label htmlFor="whatsapp-otp">رمز التحقق</Label>
                      <Input
                        id="whatsapp-otp"
                        type="text"
                        value={whatsappOtpForm.otp}
                        onChange={(e) => setWhatsappOtpForm(prev => ({...prev, otp: e.target.value}))}
                        placeholder="أدخل الرمز المكون من 6 أرقام"
                        required
                        className="text-right"
                        maxLength={6}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setWhatsappOtpForm(prev => ({...prev, step: 'phone', otp: ''}))}
                      >
                        رجوع
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1" 
                        disabled={isLoading}
                      >
                        <MessageCircle className="ml-2 h-4 w-4" />
                        {isLoading ? 'جاري التحقق...' : 'تحقق'}
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm"
                        onClick={() => {
                          setWhatsappOtpForm(prev => ({...prev, step: 'phone', otp: ''}));
                        }}
                      >
                        إعادة إرسال الرمز
                      </Button>
                    </div>
                  </form>
                )}

                <div className="text-center text-sm text-muted-foreground mt-4">
                  {whatsappOtpForm.step === 'phone' 
                    ? 'سيتم إرسال رمز التحقق إلى رقم واتساب الخاص بك'
                    : 'تحقق من رسائل واتساب لرؤية الرمز'
                  }
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;