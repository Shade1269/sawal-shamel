export type RecaptchaLike = {
  clear: () => void;
};

export type RecaptchaManagerOptions<T extends RecaptchaLike> = {
  createInstance: () => Promise<T>;
  resetContainer?: () => Promise<void>;
  onClearError?: (error: unknown) => void;
};

export type RecaptchaManager<T extends RecaptchaLike> = {
  initialize: (forceReset?: boolean) => Promise<T>;
  cleanup: () => void;
  getCurrent: () => T | null;
};

export function createRecaptchaManagerRuntime<T extends RecaptchaLike>(
  options: RecaptchaManagerOptions<T>
): RecaptchaManager<T>;
