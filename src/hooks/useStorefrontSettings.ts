import { useCallback, useEffect, useMemo, useState } from "react";

export interface StorefrontSettings {
  storeName: string;
  shortDescription: string;
  logoUrl: string;
  accentColor: string;
  useThemeHero: boolean;
}

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  storeName: "",
  shortDescription: "",
  logoUrl: "",
  accentColor: "var(--accent)",
  useThemeHero: true,
};

const STORAGE_PREFIX = "storefront-settings:";

const hasStorage = () =>
  typeof globalThis !== "undefined" && typeof globalThis.localStorage !== "undefined";

export const readStorefrontSettings = (slug: string): StorefrontSettings | null => {
  if (!slug || !hasStorage()) return null;
  const raw = globalThis.localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STOREFRONT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn("Failed to parse storefront settings for", slug, error);
    return { ...DEFAULT_STOREFRONT_SETTINGS };
  }
};

export const writeStorefrontSettings = (slug: string, settings: StorefrontSettings) => {
  if (!slug || !hasStorage()) return;
  globalThis.localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(settings));
};

export const clearStorefrontSettings = (slug: string) => {
  if (!slug || !hasStorage()) return;
  globalThis.localStorage.removeItem(`${STORAGE_PREFIX}${slug}`);
};

interface StorefrontSettingsOptions {
  initialSettings?: Partial<StorefrontSettings>;
  persist?: boolean;
}

export const useStorefrontSettings = (
  slug: string,
  options: StorefrontSettingsOptions = {}
) => {
  const persist = options.persist ?? true;
  const baseSettings = useMemo(
    () => ({ ...DEFAULT_STOREFRONT_SETTINGS, ...(options.initialSettings ?? {}) }),
    [options.initialSettings]
  );
  const [settings, setSettings] = useState<StorefrontSettings>(baseSettings);

  useEffect(() => {
    const nextBase = { ...DEFAULT_STOREFRONT_SETTINGS, ...(options.initialSettings ?? {}) };
    if (!slug || !persist) {
      setSettings(nextBase);
      return;
    }

    const stored = readStorefrontSettings(slug);
    setSettings(stored ? { ...nextBase, ...stored } : nextBase);
  }, [slug, persist, options.initialSettings]);

  const updateSettings = useCallback(
    (partial: Partial<StorefrontSettings>) => {
      setSettings((current) => {
        const next = { ...current, ...partial };
        if (persist && slug) {
          writeStorefrontSettings(slug, next);
        }
        return next;
      });
    },
    [persist, slug]
  );

  const resetSettings = useCallback(() => {
    setSettings(baseSettings);
    if (persist && slug) {
      if (options.initialSettings) {
        writeStorefrontSettings(slug, { ...DEFAULT_STOREFRONT_SETTINGS, ...options.initialSettings });
      } else {
        clearStorefrontSettings(slug);
      }
    }
  }, [baseSettings, persist, slug, options.initialSettings]);

  return { settings, updateSettings, resetSettings };
};

export type { StorefrontSettingsOptions };
