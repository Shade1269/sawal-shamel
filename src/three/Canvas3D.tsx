import { ReactNode, Suspense } from "react";
import { Canvas, CanvasProps } from "@react-three/fiber";

type Canvas3DProps = {
  children?: ReactNode;
} & Partial<CanvasProps>;

export function Canvas3D({ children, ...canvasProps }: Canvas3DProps) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Canvas {...canvasProps}>{children ? <Suspense fallback={null}>{children}</Suspense> : null}</Canvas>
    </div>
  );
}

export default Canvas3D;
