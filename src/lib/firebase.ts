import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, Auth, ConfirmationResult } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { supabase } from '@/integrations/supabase/client';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Firebase configuration will be loaded from Supabase secrets
let firebaseConfig: FirebaseConfig | null = null;
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Initialize Firebase with config from Supabase
const initializeFirebase = async () => {
  if (app && auth && db) return { app, auth, db };

  try {
    const { data, error } = await supabase.functions.invoke('get-firebase-config');
    
    if (error) {
      console.warn('Firebase config not available:', error.message);
      return { app: null, auth: null, db: null };
    }
    
    firebaseConfig = data.firebaseConfig;
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    return { app, auth, db };
  } catch (error) {
    console.warn('Firebase initialization skipped:', error);
    return { app: null, auth: null, db: null };
  }
};

// Get Firebase auth instance
export const getFirebaseAuth = async () => {
  try {
    const { auth } = await initializeFirebase();
    return auth;
  } catch (error) {
    console.warn('Firebase auth not available');
    return null;
  }
};

// Get Firebase Firestore instance
export const getFirebaseFirestore = async () => {
  try {
    const { db } = await initializeFirebase();
    return db;
  } catch (error) {
    console.warn('Firebase Firestore not available');
    return null;
  }
};

// Get Firebase app instance
export const getFirebaseApp = async () => {
  try {
    const { app } = await initializeFirebase();
    return app;
  } catch (error) {
    console.warn('Firebase app not available');
    return null;
  }
};

// Configure reCAPTCHA for SMS verification
export const setupRecaptcha = async (containerId: string) => {
  const authInstance = await getFirebaseAuth();
  
  if (!authInstance) {
    throw new Error('Firebase auth not available');
  }
  
  // Force clear any existing reCAPTCHA instances
  if (window.recaptchaVerifier) {
    try {
      await window.recaptchaVerifier.clear();
      delete window.recaptchaVerifier;
    } catch {
      // Ignore clear errors
    }
  }

  // Clear any global reCAPTCHA state
  if (window.grecaptcha && window.grecaptcha.reset) {
    try {
      window.grecaptcha.reset();
    } catch {
      // Ignore reset errors
    }
  }
  
  // Clear the container completely
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container ${containerId} not found`);
  }
  container.innerHTML = '';
  
  // Force DOM update and wait
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    // Create completely fresh reCAPTCHA verifier
    window.recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
      'size': 'invisible',
      'callback': () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // reCAPTCHA expired
      },
      'error-callback': () => {
        // reCAPTCHA error
      }
    });

    return window.recaptchaVerifier;
  } catch (error) {
    throw error;
  }
};

// Send SMS OTP
export const sendSMSOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    const authInstance = await getFirebaseAuth();

    if (!authInstance) {
      return { success: false, error: 'خدمة Firebase غير متوفرة حالياً' };
    }

    const confirmationResult = await signInWithPhoneNumber(authInstance, phoneNumber, recaptchaVerifier);
    return { success: true, confirmationResult };
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    let errorMessage = firebaseError.message || 'حدث خطأ';
    if (firebaseError.code === 'auth/invalid-phone-number') {
      errorMessage = 'رقم الهاتف غير صحيح. تأكد من صيغة الرقم.';
    } else if (firebaseError.code === 'auth/too-many-requests') {
      errorMessage = 'تم تجاوز الحد المسموح من المحاولات. حاول مرة أخرى لاحقاً.';
    } else if (firebaseError.code === 'auth/quota-exceeded') {
      errorMessage = 'تم تجاوز حصة SMS اليومية في Firebase.';
    }

    return { success: false, error: errorMessage };
  }
};

// Verify SMS OTP
export const verifySMSOTP = async (confirmationResult: ConfirmationResult, otp: string) => {
  try {
    const result = await confirmationResult.confirm(otp);
    return { success: true, user: result.user };
  } catch (error) {
    const firebaseError = error as { message?: string };
    return { success: false, error: firebaseError.message || 'حدث خطأ' };
  }
};

interface RecaptchaParams {
  sitekey?: string;
  size?: 'invisible' | 'normal' | 'compact';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
}

// Declare global types
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    grecaptcha: {
      reset: () => void;
      render: (container: string | HTMLElement, params: RecaptchaParams) => void;
    };
  }
}