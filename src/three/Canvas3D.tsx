import React, { ReactNode, Suspense } from "react";
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

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...(style ?? {}) }}
      {...restContainerProps}
    >
      <CanvasComponent {...canvasProps}>
        {children ? <Suspense fallback={fallback}>{children}</Suspense> : null}
      </CanvasComponent>
    </div>
  );
}

export default Canvas3D;
