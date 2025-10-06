/**
 * Privacy utility functions for masking sensitive customer data
 */

export const maskPhone = (phone: string | null | undefined): string => {
  if (!phone) return 'غير متوفر';
  
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 3) return '***';
  
  const lastThree = digits.slice(-3);
  const masked = '*'.repeat(Math.max(0, digits.length - 3));
  return `${masked}${lastThree}`;
};

export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return 'غير متوفر';
  
  const [username, domain] = email.split('@');
  if (!username || !domain) return '***@***';
  
  if (username.length <= 3) {
    return `***@${domain}`;
  }
  
  const firstTwo = username.slice(0, 2);
  const lastOne = username.slice(-1);
  const masked = '*'.repeat(Math.max(0, username.length - 3));
  
  return `${firstTwo}${masked}${lastOne}@${domain}`;
};

export const shouldShowFullCustomerData = (userRole: string | null | undefined): boolean => {
  return userRole === 'admin';
};
