/**
 * تنظيف الجلسات المنتهية الصلاحية من localStorage
 */

interface SessionData {
  expiresAt?: number;
  createdAt?: number;
  [key: string]: any;
}

/**
 * تنظيف جلسة واحدة إذا كانت منتهية
 */
export const cleanExpiredSession = (sessionKey: string): boolean => {
  try {
    const sessionData = localStorage.getItem(sessionKey);
    if (!sessionData) return false;

    const parsedData: SessionData = JSON.parse(sessionData);
    const currentTime = Date.now();
    
    // فحص انتهاء الصلاحية
    if (parsedData.expiresAt && currentTime > parsedData.expiresAt) {
      localStorage.removeItem(sessionKey);
      return true;
    }

    // فحص الجلسات القديمة جداً (أكثر من 30 يوم)
    if (parsedData.createdAt && (currentTime - parsedData.createdAt) > (30 * 24 * 60 * 60 * 1000)) {
      localStorage.removeItem(sessionKey);
      return true;
    }

    return false;
  } catch {
    // إذا كانت البيانات فاسدة، احذف الجلسة بأمان
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(sessionKey);
      }
    } catch {
      // تجاهل أخطاء التخزين (Safari Private Mode)
    }
    return true;
  }
};

/**
 * تنظيف جميع الجلسات المنتهية
 */
export const cleanupExpiredSessions = (): void => {
  const sessionKeys = [
    'customer_session',
    'store_session', 
    'otp_session',
    'cart_session',
    'checkout_session'
  ];

  let cleanedCount = 0;

  sessionKeys.forEach(key => {
    if (cleanExpiredSession(key)) {
      cleanedCount++;
    }
  });

  // تنظيف عام لجميع المفاتيح التي تحتوي على كلمة session
  try {
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.includes('session') || key.includes('temp_') || key.includes('_cache')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
              localStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch {
          // تجاهل الأخطاء للمفاتيح غير JSON
        }
      }
    });
  } catch {
    // Ignore localStorage cleanup errors
  }
};

/**
 * تحقق من صحة جلسة معينة
 */
export const isSessionValid = (sessionKey: string): boolean => {
  try {
    const sessionData = localStorage.getItem(sessionKey);
    if (!sessionData) return false;

    const parsedData: SessionData = JSON.parse(sessionData);
    const currentTime = Date.now();
    
    return !parsedData.expiresAt || currentTime <= parsedData.expiresAt;
  } catch {
    return false;
  }
};

/**
 * إنشاء جلسة جديدة مع انتهاء صلاحية
 */
export const createSession = (
  sessionKey: string, 
  data: any, 
  expiryMinutes: number = 60
): void => {
  const sessionData: SessionData = {
    ...data,
    createdAt: Date.now(),
    expiresAt: Date.now() + (expiryMinutes * 60 * 1000)
  };
  
  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(sessionKey, JSON.stringify(sessionData));
    }
  } catch {
    // تجاهل أخطاء التخزين
  }
};

/**
 * تحديث وقت انتهاء جلسة موجودة
 */
export const extendSession = (
  sessionKey: string, 
  additionalMinutes: number = 60
): boolean => {
  try {
    const sessionData = localStorage.getItem(sessionKey);
    if (!sessionData) return false;

    const parsedData: SessionData = JSON.parse(sessionData);
    parsedData.expiresAt = Date.now() + (additionalMinutes * 60 * 1000);
  
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem(sessionKey, JSON.stringify(parsedData));
      }
    } catch {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};