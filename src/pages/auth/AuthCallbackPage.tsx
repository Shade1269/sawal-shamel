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
    // 1) استمع لحالة المصادقة أولاً لمنع فقدان الأحداث
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setState('success');
        setMessage('تم التحقق من الجلسة بنجاح. جارٍ توجيهك...');

        // لا تنفّذ استعلامات Supabase مباشرة داخل callback
        setTimeout(async () => {
          try {
            const authUser = session.user;
            let role: string | null = authUser?.user_metadata?.role ?? null;

            if (authUser?.id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('auth_user_id', authUser.id)
                .maybeSingle();
              role = profile?.role ?? role;
            }

            const redirect = getHomeRouteForRole(role as any);
            navigate(redirect, { replace: true });
          } catch (e) {
            console.error('Post-auth redirect error:', e);
            navigate('/', { replace: true });
          }
        }, 0);
      }
    });

    const completeSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const errorDescription = params.get('error_description') || params.get('error');
      const code = params.get('code');

      if (errorDescription) {
        setState('error');
        setMessage(errorDescription);
        return;
      }

      // 2) دعم تدفق Magic Link: رموز الوصول داخل الـ hash
      if (window.location.hash && window.location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        if (access_token && refresh_token) {
          try {
            await supabase.auth.setSession({ access_token, refresh_token });
            // تنظيف الرابط من الرموز
            window.history.replaceState({}, document.title, window.location.pathname);
            return; // سيتم متابعة التوجيه عبر onAuthStateChange
          } catch (e: any) {
            console.error('setSession failed:', e);
          }
        }
      }

      // 3) تدفق OAuth (code)
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          return; // سيتم متابعة التوجيه عبر onAuthStateChange
        } catch (error: any) {
          console.error('exchangeCodeForSession error:', error);
          setState('error');
          setMessage(error?.message ?? 'حدث خطأ أثناء إكمال تسجيل الدخول.');
          return;
        }
      }

      // 4) محاولة أخيرة: هل هناك جلسة محفوظة بالفعل؟
      const { data: sess } = await supabase.auth.getSession();
      if (sess.session) {
        setState('success');
        setMessage('تم التحقق من الجلسة بنجاح. جارٍ توجيهك...');
        return;
      }

      setState('error');
      setMessage('لم يتم العثور على رمز التحقق. الرجاء إعادة المحاولة.');
    };

    completeSignIn();

    return () => {
      subscription.unsubscribe();
    };
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
