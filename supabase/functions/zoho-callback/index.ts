import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // قراءة البيانات من body (عند الاستدعاء من الصفحة)
    const body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const code = body.code || url.searchParams.get('code');
    const error = body.error || url.searchParams.get('error');

    // التحقق من وجود خطأ من Zoho
    if (error) {
      console.error('Zoho OAuth Error:', error);
      return new Response(
        `<html><body style="font-family: Arial; padding: 40px;">
          <h1 style="color: red;">❌ خطأ في التفويض</h1>
          <p>حدث خطأ من Zoho: <strong>${error}</strong></p>
          <p>الرجاء المحاولة مرة أخرى.</p>
        </body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    // التحقق من وجود code
    if (!code) {
      return new Response(
        `<html><body style="font-family: Arial; padding: 40px;">
          <h1 style="color: orange;">⚠️ كود التفويض مفقود</h1>
          <p>لم يتم استلام رمز التفويض من Zoho.</p>
        </body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    console.log('Received authorization code:', code);

    // جلب البيانات من Secrets
    const clientId = Deno.env.get('ZOHO_CLIENT_ID');
    const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('Zoho credentials not configured in secrets');
    }

    // استبدال الـ code بـ access token و refresh token
    const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
    const redirectUri = `${url.origin}${url.pathname}`;
    
    const tokenParams = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    console.log('Requesting tokens from Zoho...');
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString()
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return new Response(
        `<html><body style="font-family: Arial; padding: 40px;">
          <h1 style="color: red;">❌ فشل الحصول على Token</h1>
          <p>حدث خطأ أثناء تبادل الكود بـ Token:</p>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${JSON.stringify(tokenData, null, 2)}</pre>
        </body></html>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
      );
    }

    console.log('Token exchange successful');

    // عرض الـ refresh token بشكل واضح
    return new Response(
      `<html>
        <head>
          <title>Zoho OAuth Success</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 15px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              max-width: 600px;
            }
            h1 { color: #10b981; margin-top: 0; }
            .token-box {
              background: #f0fdf4;
              border: 2px solid #10b981;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              word-break: break-all;
              font-family: monospace;
              font-size: 14px;
            }
            .label {
              font-weight: bold;
              color: #059669;
              margin-bottom: 10px;
            }
            .copy-btn {
              background: #10b981;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              margin-top: 10px;
            }
            .copy-btn:hover {
              background: #059669;
            }
            .info {
              background: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              margin-top: 20px;
              border-radius: 5px;
            }
            .expires {
              color: #f59e0b;
              font-size: 13px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ تم التفويض بنجاح!</h1>
            <p>تم الحصول على Refresh Token من Zoho Books:</p>
            
            <div class="label">🔑 ZOHO_REFRESH_TOKEN:</div>
            <div class="token-box" id="refreshToken">${tokenData.refresh_token}</div>
            <button class="copy-btn" onclick="copyToken()">📋 نسخ Refresh Token</button>
            
            <div class="info">
              <strong>الخطوة التالية:</strong>
              <ol>
                <li>انسخ الـ Refresh Token أعلاه</li>
                <li>ارجع للمحادثة وقل "جاهز" أو الصق الـ Token</li>
                <li>سنضيفه كـ Secret ونكمل إعداد التكامل</li>
              </ol>
            </div>
            
            <div class="expires">
              ⏰ Access Token صالح لمدة: ${Math.round(tokenData.expires_in / 3600)} ساعة
            </div>
          </div>
          
          <script>
            function copyToken() {
              const token = document.getElementById('refreshToken').textContent;
              navigator.clipboard.writeText(token).then(() => {
                alert('✅ تم نسخ Refresh Token بنجاح!');
              });
            }
          </script>
        </body>
      </html>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/html' } }
    );

  } catch (error) {
    console.error('Error in zoho-callback:', error);
    return new Response(
      `<html><body style="font-family: Arial; padding: 40px;">
        <h1 style="color: red;">❌ خطأ</h1>
        <p>${error.message}</p>
      </body></html>`,
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
      }
    );
  }
});
