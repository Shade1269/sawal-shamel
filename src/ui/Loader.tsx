import type { CSSProperties, ReactNode } from "react";
import React from "react";
import clsx from "clsx";

export type LoaderSize = "sm" | "md" | "lg";
export type LoaderVariant = "default" | "glass";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const SIZE_MAP: Record<LoaderSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  subLabel?: ReactNode;
  size?: LoaderSize;
  variant?: LoaderVariant;
}

export const Loader: React.FC<LoaderProps> = ({
  label,
  subLabel,
  size = "md",
  variant = "default",
  className,
  style,
  ...rest
}) => {
  const pixelSize = SIZE_MAP[size];
  const styleVars: CSSVars = {
    "--kit-spinner-size": `${pixelSize}px`,
  };

  return (
    <div
      {...rest}
      className={clsx("kit-loader", className)}
      data-variant={variant === "default" ? undefined : variant}
      role="status"
      aria-live="polite"
      style={{ ...(styleVars as CSSProperties), ...style }}
    >
      <span className="kit-spinner" aria-hidden="true" />
      {label ? <span>{label}</span> : null}
      {subLabel ? <small className="text-muted-foreground">{subLabel}</small> : null}
    </div>
  );
};

export default Loader;
