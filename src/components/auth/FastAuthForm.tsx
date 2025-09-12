import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Store, Users, ShoppingCart, Mail, Lock, UserPlus, LogIn, Zap } from 'lucide-react';

interface AuthFormData {
  email: string;
  password: string;
  fullName?: string;
  role?: 'merchant' | 'affiliate' | 'customer';
}

const FastAuthForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    fullName: '',
    role: 'customer'
  });

  // Simple role options
  const roleOptions = useMemo(() => [
    { value: 'customer', label: 'عميل', icon: ShoppingCart },
    { value: 'affiliate', label: 'مسوق', icon: Users },
    { value: 'merchant', label: 'تاجر', icon: Store }
  ], []);

  // Update form data efficiently
  const updateField = useCallback((field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Fast sign in
  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      });

      if (error) {
        let message = 'خطأ في تسجيل الدخول';
        
        if (error.message === 'Invalid login credentials') {
          message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'يجب تأكيد البريد الإلكتروني أولاً';
        } else if (error.message.includes('too many requests')) {
          message = 'محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى';
        }

        toast({
          title: "فشل تسجيل الدخول",
          description: message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        toast({
          title: "مرحباً بعودتك! 🎉",
          description: "تم تسجيل الدخول بنجاح",
        });

        // Fast redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }

    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.password, toast]);

  // Fast sign up
  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.fullName) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "كلمة مرور ضعيفة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName.trim(),
            role: formData.role || 'customer'
          }
        }
      });

      if (error) {
        let message = 'خطأ في إنشاء الحساب';
        
        if (error.message.includes('already registered')) {
          message = 'هذا البريد مستخدم بالفعل. جرب تسجيل الدخول بدلاً من ذلك';
        } else if (error.message.includes('Password should be at least')) {
          message = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        } else if (error.message.includes('Invalid email')) {
          message = 'البريد الإلكتروني غير صالح';
        }

        toast({
          title: "فشل إنشاء الحساب",
          description: message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        toast({
          title: "مرحباً بك! 🎊",
          description: "تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول",
        });

        // Clear form
        setFormData({ email: '', password: '', fullName: '', role: 'customer' });
        
        // Switch to sign in tab after successful signup
        const signInTab = document.querySelector('[value="signin"]') as HTMLElement;
        signInTab?.click();
      }

    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [formData, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-semibold">
            تسجيل الدخول
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-6 pb-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
              <TabsTrigger value="signin" className="flex items-center gap-2 data-[state=active]:bg-background">
                <LogIn className="h-4 w-4" />
                دخول
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2 data-[state=active]:bg-background">
                <UserPlus className="h-4 w-4" />
                تسجيل
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    dir="ltr"
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    autoComplete="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    كلمة المرور
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                    dir="ltr"
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    autoComplete="current-password"
                  />
                </div>
                
                 <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الدخول...
                    </>
                  ) : (
                    'دخول'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    الاسم الكامل
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="اسمك الكامل"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    required
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    dir="ltr"
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    autoComplete="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    كلمة المرور
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    required
                    dir="ltr"
                    className="h-11 transition-all focus:ring-2 focus:ring-primary/20"
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">نوع الحساب</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'merchant' | 'affiliate' | 'customer') => 
                      updateField('role', value)
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="اختر نوع حسابك" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                 <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    'إنشاء حساب'
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

export default FastAuthForm;