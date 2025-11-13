import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';

const ResetPasswordPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast({
        title: 'الرجاء إدخال البريد الإلكتروني',
        variant: 'destructive'
      });
      return;
    }

    try {
      setStatus('loading');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (error) {
        throw error;
      }

      setStatus('success');
      toast({
        title: 'تم إرسال رابط استعادة كلمة المرور',
        description: 'تحقق من بريدك الإلكتروني لمتابعة عملية إعادة التعيين'
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      setStatus('idle');
      toast({
        title: 'تعذر إرسال رابط الاستعادة',
        description: error?.message ?? 'يرجى المحاولة مرة أخرى لاحقاً',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg-accent p-4">
      <Card className="w-full max-w-md shadow-xl backdrop-blur-sm bg-card/80">
        <CardHeader className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">استعادة كلمة المرور</CardTitle>
          <CardDescription>
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-11"
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارٍ الإرسال...
                </span>
              ) : status === 'success' ? (
                'تم إرسال الرابط'
              ) : (
                'إرسال رابط الاستعادة'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
