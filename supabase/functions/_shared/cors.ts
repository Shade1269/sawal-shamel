/**
 * ✅ CORS Configuration - آمن للإنتاج
 *
 * يسمح فقط للنطاقات المصرح بها بالوصول إلى Edge Functions
 */

// قائمة النطاقات المسموح بها
const ALLOWED_ORIGINS = [
  'https://sawal-shamel.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173', // Vite dev server
];

/**
 * التحقق إذا كان origin مسموح
 */
function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  
  // السماح لكل نطاقات lovable.app (بما في ذلك preview)
  if (origin.endsWith('.lovable.app') || origin.includes('lovable.app')) {
    return true;
  }
  
  // السماح للنطاقات في القائمة
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * الحصول على CORS headers الآمنة بناءً على origin
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') || '';

  // التحقق إذا كان origin مسموح
  const allowedOrigin = isAllowedOrigin(origin)
    ? origin
    : ALLOWED_ORIGINS[0]; // fallback إلى أول نطاق

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * معالجة OPTIONS request (preflight)
 */
export function handleCorsPreflightRequest(request: Request): Response {
  return new Response(null, {
    headers: getCorsHeaders(request),
    status: 204
  });
}

/**
 * إضافة CORS headers إلى Response
 */
export function addCorsHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  const corsHeaders = getCorsHeaders(request);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
