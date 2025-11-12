import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function ZohoCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('جاري معالجة التفويض من Zoho...');
  const [refreshToken, setRefreshToken] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setMessage(`خطأ من Zoho: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('لم يتم استلام رمز التفويض من Zoho');
        return;
      }

      try {
        // استدعاء Edge Function لتبادل الكود بـ Refresh Token
        const { data, error: invokeError } = await supabase.functions.invoke('zoho-callback', {
          body: { code }
        });

        if (invokeError) {
          throw invokeError;
        }

        if (data?.refresh_token) {
          setRefreshToken(data.refresh_token);
          setStatus('success');
          setMessage('تم الحصول على Refresh Token بنجاح! 🎉');
        } else {
          throw new Error('لم يتم استلام Refresh Token');
        }
      } catch (err: any) {
        console.error('Error:', err);
        setStatus('error');
        setMessage(err.message || 'حدث خطأ أثناء معالجة التفويض');
      }
    };

    handleCallback();
  }, [location]);

  const copyToken = () => {
    if (refreshToken) {
      navigator.clipboard.writeText(refreshToken);
      alert('✅ تم نسخ Refresh Token!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-premium flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Zoho Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-red-500 rounded-lg"></div>
            <div className="w-12 h-12 bg-green-500 rounded-lg"></div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg"></div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg"></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Zoho OAuth Callback
        </h1>

        {/* Status */}
        <div className="flex flex-col items-center gap-4">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
              <p className="text-lg text-gray-700">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600" />
              <p className="text-lg text-green-700 font-semibold">{message}</p>

              {/* Refresh Token Display */}
              <div className="w-full mt-6">
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                  <p className="font-bold text-green-800 mb-2">🔑 ZOHO_REFRESH_TOKEN:</p>
                  <div className="bg-white p-4 rounded border border-green-300 font-mono text-sm break-all">
                    {refreshToken}
                  </div>
                  <button
                    onClick={copyToken}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    📋 نسخ Refresh Token
                  </button>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="font-bold text-blue-800 mb-2">الخطوة التالية:</p>
                  <ol className="list-decimal list-inside text-blue-700 space-y-1">
                    <li>انسخ الـ Refresh Token أعلاه</li>
                    <li>ارجع للمحادثة مع Lovable</li>
                    <li>الصق الـ Token لإكمال إعداد تكامل Zoho</li>
                  </ol>
                </div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-600" />
              <p className="text-lg text-red-700 font-semibold">{message}</p>
              <p className="text-sm text-gray-600 mt-2">
                الرجاء المحاولة مرة أخرى أو التواصل مع الدعم
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
