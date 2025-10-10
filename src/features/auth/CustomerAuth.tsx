import { FormEvent, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function CustomerAuth() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (signInError) {
      setError(signInError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-glass rounded-2xl border border-white/10 backdrop-blur">
      <h1 className="text-2xl font-semibold mb-3">تسجيل الدخول للعميل</h1>
      <p className="text-sm text-muted-foreground mb-6">
        أدخل بريدك الإلكتروني لإستلام رابط تسجيل الدخول.
      </p>
      <form onSubmit={sendMagicLink} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border px-4 py-3 bg-background/60"
        />
        <button className="btn-primary w-full py-3 rounded-lg" type="submit">
          إرسال رابط الدخول
        </button>
      </form>
      {sent && <p className="mt-4 text-emerald-500">تم الإرسال! تفقد بريدك.</p>}
      {error && <p className="mt-4 text-rose-500">{error}</p>}
    </div>
  );
}
