import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  User,
  Mail,
  Lock,
  Home,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create admin account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.full_name,
            role: 'admin'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile with admin role
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            auth_user_id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            role: 'admin',
            level: 'legendary',
            is_active: true
          });

        if (profileError) throw profileError;

        setSuccess(true);
        toast({
          title: "تم إنشاء حساب المدير",
          description: "تم إنشاء حساب المدير بنجاح",
        });

        // Reset form
        setFormData({ email: '', password: '', full_name: '' });
      }

    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message || "تعذر إنشاء حساب المدير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">اسم المدير</Label>
              <Input
                id="admin-name"
                type="text"
                placeholder="الاسم الكامل"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">البريد الإلكتروني</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                dir="ltr"
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-luxury hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Shield className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Crown className="ml-2 h-4 w-4" />
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

export default CreateAdmin;