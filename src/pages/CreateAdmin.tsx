import { useState } from 'react';
import { UnifiedButton, UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Shield, 
  CheckCircle,
  Home,
  ArrowRight
} from 'lucide-react';
import { useSmartNavigation } from '@/hooks/useSmartNavigation';
import { useFastAuth } from '@/hooks/useFastAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/utils/domains';

const CreateAdmin = () => {
  const { goToUserHome } = useSmartNavigation();
  const { profile } = useFastAuth();
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
          emailRedirectTo: `${getBaseUrl()}/`,
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
          title: "تم إنشاء الحساب بنجاح",
          description: "تم إرسال رسالة التأكيد إلى البريد الإلكتروني. يرجى مراجعة البريد الإلكتروني للتفعيل.",
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
          <UnifiedButton
            variant="ghost"
            onClick={() => goToUserHome(profile?.role)}
            className="text-primary hover:bg-primary/10 gap-2 bg-white/80 backdrop-blur-sm"
          >
            <Home className="h-4 w-4" />
            العودة إلى الصفحة الرئيسية
            <ArrowRight className="h-4 w-4" />
          </UnifiedButton>
        </div>
        
        <UnifiedCard variant="glass-strong" className="w-full shadow-luxury border-0 bg-card/50 backdrop-blur-sm">
        <UnifiedCardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-luxury rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <UnifiedCardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            إنشاء حساب مدير
          </UnifiedCardTitle>
          <UnifiedCardDescription>
            إنشاء أول حساب مدير للمنصة
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        
        <UnifiedCardContent>
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
            
            <UnifiedButton 
              type="submit" 
              variant="luxury"
              fullWidth
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
            </UnifiedButton>
          </form>

          {success && (
            <Alert className="mt-4 border-success/50 bg-success/10">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                <strong>تم إنشاء الحساب بنجاح!</strong>
                <br />
                تم إرسال رسالة تأكيد إلى بريدك الإلكتروني <strong>{formData.email}</strong>
                <br />
                يرجى فتح البريد الإلكتروني والضغط على رابط التفعيل لتفعيل حسابك.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">ملاحظة هامة:</h4>
            <p className="text-xs text-muted-foreground">
              بعد إنشاء حساب المدير، ستحتاج لتسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور للوصول لصفحة الإدارة.
            </p>
          </div>
        </UnifiedCardContent>
      </UnifiedCard>
      </div>
    </div>
  );
};

export default CreateAdmin;