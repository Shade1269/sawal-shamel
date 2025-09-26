import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFastAuth } from "@/hooks/useFastAuth";
import { useTheme } from "@/hooks/useTheme";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type UserPreferenceLanguage = "ar" | "en";

export type UserPreferences = {
  themeId: string;
  language: UserPreferenceLanguage;
  reducedMotion: boolean;
};

export type UserSession = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
  trusted: boolean;
};

export type UserSecurityState = {
  twoFactorEnabled: boolean;
  sessions: UserSession[];
};

export type UnifiedProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  joinedAt?: string;
  initials: string;
};

export type UserProfileHookValue = {
  isLoading: boolean;
  profile: UnifiedProfile;
  preferences: UserPreferences;
  security: UserSecurityState;
  updatePreferences: (update: Partial<UserPreferences>) => void;
  toggleTwoFactor: () => void;
  revokeSession: (sessionId: string) => void;
  trustSession: (sessionId: string, trusted: boolean) => void;
  resetSessions: () => void;
};

const PREFERENCES_KEY = "sawal::profile:preferences";
const SECURITY_KEY = "sawal::profile:security";
const memoryStorage = new Map<string, string>();

const defaultSessions: UserSession[] = [
  {
    id: "session-primary",
    device: "iPhone 15 Pro",
    location: "الرياض، السعودية",
    lastActive: "قبل 5 دقائق",
    current: true,
    trusted: true,
  },
  {
    id: "session-office",
    device: "MacBook Air M3",
    location: "جدة، السعودية",
    lastActive: "اليوم 09:20 ص",
    current: false,
    trusted: true,
  },
  {
    id: "session-tablet",
    device: "iPad Mini",
    location: "دبي، الإمارات",
    lastActive: "أمس 08:12 م",
    current: false,
    trusted: false,
  },
];

const defaultSecurity: UserSecurityState = {
  twoFactorEnabled: true,
  sessions: defaultSessions,
};

const defaultPreferences: UserPreferences = {
  themeId: "default",
  language: "ar",
  reducedMotion: false,
};

const getStorage = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStorage.set(key, value);
    },
    removeItem: (key: string) => {
      memoryStorage.delete(key);
    },
  } as Pick<Storage, "getItem" | "setItem" | "removeItem">;
};

function readState<T>(key: string): T | null {
  const storage = getStorage();
  const raw = storage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[useUserProfile] Failed to parse state for ${key}`, error);
    return null;
  }
}

function writeState<T>(key: string, value: T) {
  const storage = getStorage();
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[useUserProfile] Failed to persist state for ${key}`, error);
  }
}

function normalizeProfile(profile: ReturnType<typeof useFastAuth>['profile'], fallbackEmail?: string | null): UnifiedProfile {
  const fullName = profile?.full_name ?? "ضيف منصة أناقتي";
  const email = profile?.email ?? fallbackEmail ?? "guest@anaqti.sa";
  const role = profile?.role ?? "affiliate";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "أ";

  return {
    id: profile?.id ?? "guest-profile",
    name: fullName,
    email,
    role,
    avatarUrl: profile?.avatar_url,
    joinedAt: profile?.created_at,
    initials,
  };
}

export function useUserProfile(): UserProfileHookValue {
  const fastAuth = useFastAuth();
  const { themeId, setThemeId } = useTheme();
  const systemReducedMotion = usePrefersReducedMotion();
  const storedPreferences = useRef<UserPreferences | null>(null);
  const storedSecurity = useRef<UserSecurityState | null>(null);

  if (storedPreferences.current === null) {
    storedPreferences.current = readState<UserPreferences>(PREFERENCES_KEY);
  }
  if (storedSecurity.current === null) {
    storedSecurity.current = readState<UserSecurityState>(SECURITY_KEY);
  }

  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const initial = storedPreferences.current ?? {
      ...defaultPreferences,
      themeId,
    };
    return { ...initial };
  });
  const [security, setSecurity] = useState<UserSecurityState>(
    () => storedSecurity.current ?? defaultSecurity
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 220);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    writeState(PREFERENCES_KEY, preferences);
  }, [preferences]);

  useEffect(() => {
    writeState(SECURITY_KEY, security);
  }, [security]);

  useEffect(() => {
    if (preferences.themeId && preferences.themeId !== themeId) {
      setThemeId(preferences.themeId);
    }
  }, [preferences.themeId, setThemeId, themeId]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = preferences.language;
      if (preferences.reducedMotion) {
        document.documentElement.setAttribute("data-reduced-motion", "true");
      } else {
        document.documentElement.removeAttribute("data-reduced-motion");
      }
    }
  }, [preferences.language, preferences.reducedMotion]);

  const hasCustomReducedMotion = storedPreferences.current?.reducedMotion != null;
  useEffect(() => {
    if (!hasCustomReducedMotion && systemReducedMotion) {
      setPreferences((current) => ({
        ...current,
        reducedMotion: true,
      }));
    }
  }, [systemReducedMotion, hasCustomReducedMotion]);

  const profile = useMemo(
    () => normalizeProfile(fastAuth.profile, fastAuth.user?.email),
    [fastAuth.profile, fastAuth.user?.email]
  );

  const updatePreferences = useCallback((update: Partial<UserPreferences>) => {
    setPreferences((current) => ({
      ...current,
      ...update,
    }));
  }, []);

  const toggleTwoFactor = useCallback(() => {
    setSecurity((current) => ({
      ...current,
      twoFactorEnabled: !current.twoFactorEnabled,
    }));
  }, []);

  const revokeSession = useCallback((sessionId: string) => {
    setSecurity((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              current: false,
              trusted: false,
              lastActive: "تم إنهاء الجلسة",
            }
          : session
      ),
    }));
  }, []);

  const trustSession = useCallback((sessionId: string, trusted: boolean) => {
    setSecurity((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === sessionId ? { ...session, trusted } : session
      ),
    }));
  }, []);

  const resetSessions = useCallback(() => {
    setSecurity(defaultSecurity);
  }, []);

  return {
    isLoading,
    profile,
    preferences,
    security,
    updatePreferences,
    toggleTwoFactor,
    revokeSession,
    trustSession,
    resetSessions,
  };
}

export default useUserProfile;
