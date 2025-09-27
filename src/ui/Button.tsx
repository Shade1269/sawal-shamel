import type { CSSProperties, ReactNode } from "react";
import React, { forwardRef, useMemo } from "react";
import clsx from "clsx";

import { useTheme } from "@/hooks/useTheme";

type ButtonVariant =
  | "default"
  | "solid"
  | "outline"
  | "ghost"
  | "subtle"
  | "secondary"
  | "glass"
  | "danger"
  | "success"
  | "link";

type ButtonSize = "sm" | "md" | "lg" | "icon";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

const SIZE_MAP: Record<ButtonSize, { fontSize: string; paddingScale: number; heightOffset: number; gapScale: number }> = {
  sm: {
    fontSize: "var(--font-size-sm, 0.875rem)",
    paddingScale: 0.85,
    heightOffset: -8,
    gapScale: 0.85,
  },
  md: {
    fontSize: "var(--font-size-md, 1rem)",
    paddingScale: 1,
    heightOffset: 0,
    gapScale: 1,
  },
  lg: {
    fontSize: "var(--font-size-lg, 1.125rem)",
    paddingScale: 1.2,
    heightOffset: 8,
    gapScale: 1.1,
  },
  icon: {
    fontSize: "var(--font-size-md, 1rem)",
    paddingScale: 0,
    heightOffset: 0,
    gapScale: 0,
  },
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "solid",
    size = "md",
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    className,
    style,
    disabled,
    fullWidth,
    children,
    type: typeProp,
    ...rest
  },
  ref
) {
  const { themeConfig } = useTheme();
  const buttonSettings = themeConfig.components?.button ?? {};
  const radiusKey = buttonSettings.radius ?? "md";
  const baseHeight = typeof buttonSettings.height === "number" ? buttonSettings.height : 44;
  const basePadding = buttonSettings.paddingX ?? "var(--space-lg, 1rem)";
  const sizeConfig = SIZE_MAP[size] ?? SIZE_MAP.md;

  const { height, paddingInline, gap } = useMemo(() => {
    const computedHeight = Math.max(32, Math.round(baseHeight + sizeConfig.heightOffset));
    const computedPadding =
      sizeConfig.paddingScale === 1
        ? basePadding
        : `calc(${basePadding} * ${sizeConfig.paddingScale})`;
    const computedGap =
      sizeConfig.gapScale === 1
        ? undefined
        : `calc(var(--space-sm, 0.5rem) * ${sizeConfig.gapScale})`;

    return {
      height: `${computedHeight}px`,
      paddingInline: computedPadding,
      gap: computedGap,
    };
  }, [baseHeight, basePadding, sizeConfig]);

  const styleVars: CSSVars = {
    "--kit-button-radius": `var(--radius-${radiusKey})`,
    "--kit-button-height": height,
    "--kit-button-padding-inline": paddingInline,
    "--kit-button-font-size": sizeConfig.fontSize,
  };

  if (gap) {
    styleVars["--kit-button-gap"] = gap;
  }

  if (buttonSettings.shadow) {
    styleVars["--kit-button-shadow"] = buttonSettings.shadow;
  }

  const isDisabled = disabled || loading;
  const contentLabel = loading && loadingText != null ? loadingText : children;

  return (
    <button
      ref={ref}
      type={typeProp ?? "button"}
      {...rest}
      disabled={isDisabled}
      data-variant={variant}
      data-size={size}
      data-loading={loading ? "true" : undefined}
      data-disabled={isDisabled ? "true" : undefined}
      data-fullwidth={fullWidth ? "true" : undefined}
      data-focus-ring="true"
      aria-busy={loading || undefined}
      className={clsx("kit-button", className)}
      style={{ ...(styleVars as CSSProperties), ...style }}
    >
      <span className="kit-button__content" aria-live={loading ? "polite" : undefined}>
        {loading ? (
          <span className="kit-button__spinner" aria-hidden="true" />
        ) : (
          leftIcon && (
            <span className="kit-button__icon" aria-hidden="true">
              {leftIcon}
            </span>
          )
        )}
        <span>{contentLabel}</span>
        {!loading && rightIcon ? (
          <span className="kit-button__icon" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </span>
    </button>
  );
});

export default Button;
export type { ButtonVariant, ButtonSize };
