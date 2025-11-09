/**
 * Phone Number Utilities
 * نظام موحد لمعالجة أرقام الهواتف في جميع أنحاء التطبيق
 */

export interface PhoneFormats {
  e164: string;      // +966512345678
  national: string;  // 0512345678
  sanitized: string; // 966512345678 (digits only)
}

/**
 * تطبيع رقم الهاتف إلى جميع الصيغ المطلوبة
 * Normalize phone number to all required formats
 */
export const normalizePhone = (phone: string): PhoneFormats => {
  // إزالة جميع الأحرف غير الرقمية
  const digits = phone.replace(/\D/g, '');
  
  if (!digits) {
    return { e164: '', national: '', sanitized: '' };
  }

  let e164: string;
  let national: string;

  // رقم يبدأ بـ 966 (كود السعودية)
  if (digits.startsWith('966')) {
    e164 = `+${digits}`;
    national = `0${digits.slice(3)}`;
  }
  // رقم يبدأ بـ 0 (صيغة وطنية)
  else if (digits.startsWith('0')) {
    const core = digits.slice(1);
    e164 = `+966${core}`;
    national = digits;
  }
  // رقم يبدأ بـ 5 وطوله 9 أرقام (رقم جوال سعودي بدون بادئة)
  else if (digits.startsWith('5') && digits.length === 9) {
    e164 = `+966${digits}`;
    national = `0${digits}`;
  }
  // رقم يبدأ بـ + (صيغة دولية)
  else if (phone.startsWith('+')) {
    e164 = phone;
    national = digits.startsWith('966') ? `0${digits.slice(3)}` : digits;
  }
  // حالة افتراضية
  else {
    e164 = digits.startsWith('+') ? digits : `+${digits}`;
    national = digits;
  }

  return {
    e164,
    national,
    sanitized: e164.replace(/\D/g, ''),
  };
};

/**
 * تطهير رقم الهاتف للتخزين (أرقام فقط)
 * Sanitize phone number for storage (digits only)
 */
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * تحقق من صحة رقم الهاتف السعودي
 * Validate Saudi phone number
 */
export const isValidSaudiPhone = (phone: string): boolean => {
  const digits = sanitizePhone(phone);
  
  // رقم سعودي صحيح يجب أن يبدأ بـ 966 أو 05 ويكون طوله مناسب
  if (digits.startsWith('966')) {
    return digits.length === 12; // 966 + 9 digits
  }
  
  if (digits.startsWith('05') || digits.startsWith('5')) {
    const cleanDigits = digits.startsWith('0') ? digits.slice(1) : digits;
    return cleanDigits.length === 9 && cleanDigits.startsWith('5');
  }
  
  return false;
};

/**
 * تنسيق رقم الهاتف للعرض
 * Format phone number for display
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const { national } = normalizePhone(phone);
  
  if (!national || national.length < 10) {
    return phone;
  }
  
  // تنسيق: 0512 345 678
  return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
};
