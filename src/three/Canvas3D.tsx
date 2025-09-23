import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

export function Canvas3D(props) {
  const {
    children,
    fallback = null,
    containerProps = {},
    CanvasComponent = Canvas,
    ...canvasProps
  } = props ?? {};
  const { className, style, ...restContainerProps } = containerProps;

  return React.createElement(
    "div",
    {
      className,
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
        ...(style ?? {}),
      },
      ...restContainerProps,
    },
    React.createElement(
      CanvasComponent,
      canvasProps,
      children
        ? React.createElement(Suspense, { fallback }, children)
        : null
    )
  );
}

export default Canvas3D;
