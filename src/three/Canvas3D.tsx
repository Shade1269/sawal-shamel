import React, { ReactNode, Suspense, useCallback, useEffect, useRef } from "react";
import { Canvas, CanvasProps } from "@react-three/fiber";

export type Canvas3DProps = Partial<CanvasProps> & {
  children?: ReactNode;
  fallback?: ReactNode;
  containerProps?: React.HTMLAttributes<HTMLDivElement> & {
    style?: React.CSSProperties;
  };
  CanvasComponent?: React.ComponentType<any>;
};

export function Canvas3D({
  children,
  fallback = null,
  containerProps = {},
  CanvasComponent = Canvas,
  ...canvasProps
}: Canvas3DProps) {
  const { className, style, ...restContainerProps } = containerProps;
  const cleanupRef = useRef<() => void>();
  const onCreatedProp = canvasProps.onCreated;

  const handleCreated = useCallback(
    (state: Parameters<NonNullable<CanvasProps['onCreated']>>[0]) => {
      if (typeof window !== "undefined") {
        const targetRatio = Math.min(1.5, window.devicePixelRatio || 1);
        state.gl.setPixelRatio(targetRatio);

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const applyMotionPreference = () => {
          if (mediaQuery.matches) {
            state.setFrameloop("demand");
          } else {
            state.setFrameloop("always");
            state.invalidate();
          }
        };

        applyMotionPreference();

        const handleVisibility = () => {
          if (document.hidden) {
            state.setFrameloop("demand");
          } else if (!mediaQuery.matches) {
            state.setFrameloop("always");
            state.invalidate();
          }
        };

        if (typeof mediaQuery.addEventListener === "function") {
          mediaQuery.addEventListener("change", applyMotionPreference);
        } else if (typeof mediaQuery.addListener === "function") {
          mediaQuery.addListener(applyMotionPreference);
        }
        document.addEventListener("visibilitychange", handleVisibility, { passive: true });

        cleanupRef.current = () => {
          if (typeof mediaQuery.removeEventListener === "function") {
            mediaQuery.removeEventListener("change", applyMotionPreference);
          } else if (typeof mediaQuery.removeListener === "function") {
            mediaQuery.removeListener(applyMotionPreference);
          }
          document.removeEventListener("visibilitychange", handleVisibility);
        };
      }

      onCreatedProp?.(state);
    },
    [onCreatedProp]
  );

  useEffect(() => () => {
    cleanupRef.current?.();
  }, []);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...(style ?? {}) }}
      {...restContainerProps}
    >
      <CanvasComponent {...{ ...canvasProps, onCreated: handleCreated }}>
        {children ? <Suspense fallback={fallback}>{children}</Suspense> : null}
      </CanvasComponent>
    </div>
  );
}

export default Canvas3D;
