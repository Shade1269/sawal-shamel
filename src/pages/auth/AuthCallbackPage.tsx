import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getHomeRouteForRole } from '@/hooks/getHomeRouteForRole';

type CallbackState = 'pending' | 'success' | 'error';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>('pending');
  const [message, setMessage] = useState<string>('جاري التحقق من الجلسة...');

  useEffect(() => {
    const completeSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const errorDescription = params.get('error_description') || params.get('error');
      const code = params.get('code');

      if (errorDescription) {
        setState('error');
        setMessage(errorDescription);
        return;
      }

      if (!code) {
        setState('error');
        setMessage('لم يتم العثور على رمز التحقق. الرجاء إعادة المحاولة.');
        return;
      }

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }

        const authUser = data.user;
        let role: string | null = authUser?.user_metadata?.role ?? null;

        if (authUser?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('auth_user_id', authUser.id)
            .maybeSingle();

          role = profile?.role ?? role;
        }

        setState('success');
        setMessage('تم التحقق من الجلسة بنجاح. جارٍ توجيهك...');

        const redirect = getHomeRouteForRole(role as any);
        navigate(redirect, { replace: true });
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setState('error');
        setMessage(error?.message ?? 'حدث خطأ أثناء إكمال تسجيل الدخول.');
      }
    };

    completeSignIn();
  }, [navigate]);

  const handleBackHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-xl backdrop-blur-sm bg-card/80 text-right">
        <CardHeader className="space-y-3 text-center">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${state === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            {state === 'pending' ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {state === 'error' ? 'تعذر إكمال تسجيل الدخول' : 'تأكيد الجلسة'}
          </CardTitle>
          <CardDescription className="leading-relaxed">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {state !== 'pending' && (
            <Button onClick={handleBackHome} variant={state === 'error' ? 'destructive' : 'default'}>
              العودة للرئيسية
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
