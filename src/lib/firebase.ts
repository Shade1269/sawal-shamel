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
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
      'size': 'invisible',
      'callback': (response: any) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
  }
  return window.recaptchaVerifier;
};

// Send SMS OTP
export const sendSMSOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    const authInstance = await getFirebaseAuth();
    const confirmationResult = await signInWithPhoneNumber(authInstance, phoneNumber, recaptchaVerifier);
    return { success: true, confirmationResult };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
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