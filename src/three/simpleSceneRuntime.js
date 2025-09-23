export function describeSimpleSceneSurface({ enabled = true, webglAvailable }) {
  if (!enabled) {
    return "fallback";
  }

  return webglAvailable ? "canvas" : "fallback";
}

export function detectWebGLSupport() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  const contexts = ["webgl", "experimental-webgl"];

  return contexts.some((type) => {
    try {
      return Boolean(canvas.getContext?.(type));
    } catch (error) {
      console.warn("WebGL context detection failed", error);
      return false;
    }
  });
}
