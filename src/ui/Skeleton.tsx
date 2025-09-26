import type { CSSProperties } from "react";
import React, { forwardRef } from "react";
import clsx from "clsx";

export type SkeletonVariant = "rect" | "text" | "circle" | "button";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  radius?: string;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = "rect", width, height, radius, className, style, ...rest },
  ref
) {
  const styleVars: CSSVars = {};

  if (width != null) {
    styleVars.width = typeof width === "number" ? `${width}px` : width;
  }

  if (height != null) {
    styleVars.height = typeof height === "number" ? `${height}px` : height;
  }

  if (radius) {
    styleVars["--kit-skeleton-radius"] = radius;
  }

  return (
    <div
      {...rest}
      ref={ref}
      data-variant={variant === "rect" ? undefined : variant}
      className={clsx("kit-skeleton", className)}
      style={{ ...(styleVars as CSSProperties), ...style }}
      aria-hidden="true"
    />
  );
});

export default Skeleton;
