// Utility functions for managing storefront customer sessions

export const getStorefrontSessionKey = (storeSlug: string): string => {
  return `sf:${storeSlug}:cust_sess`;
};

export const getStorefrontCartKey = (storeSlug: string): string => {
  return `cart:${storeSlug}`;
};

export const saveStorefrontSession = (storeSlug: string, sessionId: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(getStorefrontSessionKey(storeSlug), sessionId);
  }
};

export const getStorefrontSession = (storeSlug: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(getStorefrontSessionKey(storeSlug));
  }
  return null;
};

export const clearStorefrontSession = (storeSlug: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(getStorefrontSessionKey(storeSlug));
    localStorage.removeItem(getStorefrontCartKey(storeSlug));
  }
};

export const isStorefrontSessionValid = async (
  storeSlug: string, 
  sessionId: string,
  supabaseClient: any
): Promise<boolean> => {
  try {
    // Try to use the session - if it fails, session is invalid
    const { error } = await supabaseClient.rpc('get_store_orders_for_session', {
      p_store_id: sessionId, // This will fail if invalid
      p_session_id: sessionId
    });
    
    return !error;
  } catch {
    return false;
  }
};