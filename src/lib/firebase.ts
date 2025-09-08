import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { supabase } from '@/integrations/supabase/client';

// Firebase configuration will be loaded from Supabase secrets
let firebaseConfig: any = null;
let app: any = null;
let auth: any = null;

// Initialize Firebase with config from Supabase
const initializeFirebase = async () => {
  if (app && auth) return { app, auth };

  try {
    const { data, error } = await supabase.functions.invoke('get-firebase-config');
    
    if (error) throw error;
    
    firebaseConfig = data.firebaseConfig;
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    return { app, auth };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Get Firebase auth instance
export const getFirebaseAuth = async () => {
  const { auth } = await initializeFirebase();
  return auth;
};

// Configure reCAPTCHA for SMS verification
export const setupRecaptcha = async (containerId: string) => {
  const authInstance = await getFirebaseAuth();
  
  // Clear any existing reCAPTCHA instance globally
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
      delete window.recaptchaVerifier;
    } catch (error) {
      console.log('Clearing existing reCAPTCHA:', error);
    }
  }
  
  // Clear the container HTML to ensure clean state
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container ${containerId} not found`);
  }
  container.innerHTML = ''; // Clear any existing content
  
  // Create fresh reCAPTCHA verifier
  window.recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
    'size': 'invisible',
    'callback': (response: any) => {
      console.log('reCAPTCHA solved successfully');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired, please try again');
    },
    'error-callback': (error: any) => {
      console.error('reCAPTCHA error:', error);
    }
  });
  
  return window.recaptchaVerifier;
};

// Send SMS OTP
export const sendSMSOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    const authInstance = await getFirebaseAuth();
    console.log('Attempting to send SMS to:', phoneNumber);
    const confirmationResult = await signInWithPhoneNumber(authInstance, phoneNumber, recaptchaVerifier);
    console.log('SMS sent successfully, confirmation result:', confirmationResult);
    return { success: true, confirmationResult };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      phoneNumber: phoneNumber
    });
    
    let errorMessage = error.message;
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'رقم الهاتف غير صحيح. تأكد من صيغة الرقم.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'تم تجاوز الحد المسموح من المحاولات. حاول مرة أخرى لاحقاً.';
    } else if (error.code === 'auth/quota-exceeded') {
      errorMessage = 'تم تجاوز حصة SMS اليومية في Firebase.';
    }
    
    return { success: false, error: errorMessage };
  }
};

// Verify SMS OTP
export const verifySMSOTP = async (confirmationResult: any, otp: string) => {
  try {
    const result = await confirmationResult.confirm(otp);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: error.message };
  }
};

// Declare global type for recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}