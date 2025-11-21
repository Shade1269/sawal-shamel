import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedCard, UnifiedCardContent, UnifiedCardDescription, UnifiedCardHeader, UnifiedCardTitle } from '@/components/design-system';
import { UnifiedButton } from '@/components/design-system';
import { UnifiedInput } from '@/components/design-system';
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
      <UnifiedCard variant="glass" className="w-full max-w-md shadow-glow">
        <UnifiedCardHeader className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <UnifiedCardTitle className="text-2xl font-bold">استعادة كلمة المرور</UnifiedCardTitle>
          <UnifiedCardDescription>
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك
          </UnifiedCardDescription>
        </UnifiedCardHeader>
        <UnifiedCardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                البريد الإلكتروني
              </label>
              <UnifiedInput
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
            <UnifiedButton type="submit" fullWidth size="lg" disabled={status === 'loading'}>
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
            </UnifiedButton>
          </form>
        </UnifiedCardContent>
      </UnifiedCard>
    </div>
  );
};

export default ResetPasswordPage;
