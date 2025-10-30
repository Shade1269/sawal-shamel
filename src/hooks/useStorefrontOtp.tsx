import { useState, useEffect } from 'react';

interface StorefrontOtpParams {
  storeSlug: string;
  storeId?: string;
}

interface StorefrontSession {
  sessionId: string | null;
  phone: string | null;
  storeId: string | null;
  verifiedAt: string | null;
  expiresAt: string | null;
}

export const useStorefrontOtp = ({ storeSlug, storeId }: StorefrontOtpParams) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<StorefrontSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = () => {
      if (!storeId) {
        setIsLoading(false);
        return;
      }

      try {
        const storedSession = localStorage.getItem(`customer_session_${storeId}`);
        if (!storedSession) {
          setIsLoading(false);
          return;
        }

        const parsed: StorefrontSession = JSON.parse(storedSession);
        
        // التحقق من صلاحية الجلسة
        if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          setSessionId(parsed.sessionId);
          setSession(parsed);
        } else {
          // الجلسة منتهية - إزالتها
          localStorage.removeItem(`customer_session_${storeId}`);
        }
      } catch (error) {
        console.error('Error loading storefront session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [storeId]);

  return { sessionId, session, isLoading };
};
