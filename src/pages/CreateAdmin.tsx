import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Shield, UserCheck, Home, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateAdminPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // إنشاء حساب جديد مع دور admin
      const { data, error } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: adminData.fullName,
            role: 'admin'
          }
        }
      });

      if (error) {
        toast({
          title: "خطأ في إنشاء حساب الأدمن",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم إنشاء حساب الأدمن بنجاح",
        description: "يمكنك الآن تسجيل الدخول كمدير",
      });

      setAdminData({ email: '', password: '', fullName: '' });
    } catch (error) {
      console.error('Admin creation error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في إنشاء حساب الأدمن",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-persian-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="flex justify-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-primary hover:bg-primary/10 gap-2 bg-white/80 backdrop-blur-sm"
          >
            <Home className="h-4 w-4" />
            العودة إلى الصفحة الرئيسية
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Card className="w-full shadow-luxury border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            إنشاء حساب مدير
          </CardTitle>
          <CardDescription>
            إنشاء أول حساب مدير للمنصة
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={createAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">اسم المدير</Label>
              <Input
                id="admin-name"
                type="text"
                placeholder="الاسم الكامل"
                value={adminData.fullName}
                onChange={(e) => setAdminData(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">البريد الإلكتروني</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={adminData.email}
                onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                required
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">كلمة المرور</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={adminData.password}
                onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                required
                dir="ltr"
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-luxury hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Shield className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <UserCheck className="ml-2 h-4 w-4" />
                  إنشاء حساب المدير
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">ملاحظة هامة:</h4>
            <p className="text-xs text-muted-foreground">
              بعد إنشاء حساب المدير، ستحتاج لتسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور للوصول لصفحة الإدارة.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default CreateAdminPage;