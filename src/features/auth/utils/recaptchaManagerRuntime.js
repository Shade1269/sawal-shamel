export const createRecaptchaManagerRuntime = ({
  createInstance,
  resetContainer,
  onClearError,
}) => {
  let current = null;

  const cleanup = () => {
    if (!current) {
      return;
    }

    try {
      current.clear();
    } catch (error) {
      if (typeof onClearError === 'function') {
        onClearError(error);
      }
    }

    current = null;
  };

  const initialize = async (forceReset = false) => {
    if (forceReset) {
      cleanup();
      if (typeof resetContainer === 'function') {
        await resetContainer();
      }
    }

    if (current) {
      return current;
    }

    current = await createInstance();
    return current;
  };

  const getCurrent = () => current;

  return {
    initialize,
    cleanup,
    getCurrent,
  };
};
