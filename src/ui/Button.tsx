import React, { forwardRef, useMemo } from "react";
import clsx from "clsx";
import { useTheme } from "@/hooks/useTheme";

const variantClasses = {
  solid:
    "border border-[color:var(--btn-border)] bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] hover:bg-[color:var(--btn-hover-bg)] active:bg-[color:var(--btn-active-bg)] disabled:bg-[color:var(--btn-disabled-bg)] disabled:text-[color:var(--btn-disabled-fg)] disabled:border-[color:var(--btn-disabled-border)]",
  outline:
    "border border-[color:var(--btn-border)] bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] hover:bg-[color:var(--btn-hover-bg)] active:bg-[color:var(--btn-active-bg)] disabled:bg-[color:var(--btn-disabled-bg)] disabled:text-[color:var(--btn-disabled-fg)] disabled:border-[color:var(--btn-disabled-border)]",
  ghost:
    "border border-[color:var(--btn-border)] bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] hover:bg-[color:var(--btn-hover-bg)] active:bg-[color:var(--btn-active-bg)] disabled:bg-[color:var(--btn-disabled-bg)] disabled:text-[color:var(--btn-disabled-fg)] disabled:border-[color:var(--btn-disabled-border)]",
};

const variantVariables = {
  solid: {
    "--btn-bg": "var(--primary)",
    "--btn-fg": "var(--primary-fg, var(--fg))",
    "--btn-border": "var(--primary)",
    "--btn-hover-bg": "var(--primary-hover, var(--primary))",
    "--btn-active-bg": "var(--primary-active, var(--primary))",
  },
  outline: {
    "--btn-bg": "var(--surface)",
    "--btn-fg": "var(--primary)",
    "--btn-border": "var(--primary)",
    "--btn-hover-bg": "var(--surface-hover, var(--surface))",
    "--btn-active-bg": "var(--surface-active, var(--surface))",
  },
  ghost: {
    "--btn-bg": "transparent",
    "--btn-fg": "var(--primary)",
    "--btn-border": "transparent",
    "--btn-hover-bg": "var(--surface-hover, rgba(255, 255, 255, 0.08))",
    "--btn-active-bg": "var(--surface-active, rgba(0, 0, 0, 0.12))",
  },
};

const sizeText = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export const Button = forwardRef(function Button(props, ref) {
  const {
    variant = "solid",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    className,
    style,
    disabled,
    children,
    ...rest
  } = props;

  const { themeConfig } = useTheme();
  const buttonSettings = themeConfig.components?.button ?? {};
  const radiusKey = buttonSettings.radius ?? "md";
  const baseHeight = buttonSettings.height ?? 44;
  const basePadding = buttonSettings.paddingX ?? "var(--space-lg)";

  const { height, paddingInline } = useMemo(() => {
    const computedHeight = {
      sm: Math.max(baseHeight - 8, 32),
      md: baseHeight,
      lg: baseHeight + 8,
    }[size];

    const computedPadding =
      size === "sm"
        ? `calc(${basePadding} * 0.75)`
        : size === "lg"
        ? `calc(${basePadding} * 1.25)`
        : basePadding;

    return { height: `${computedHeight}px`, paddingInline: computedPadding };
  }, [baseHeight, basePadding, size]);

  const isDisabled = disabled || loading;

  const content = loading
    ? React.createElement(
        "span",
        { className: "inline-flex items-center gap-2", style: { pointerEvents: "none" } },
        React.createElement("span", {
          className: "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
          "aria-hidden": "true",
        }),
        React.createElement("span", null, children)
      )
    : React.createElement(
        "span",
        { className: "inline-flex items-center gap-2" },
        leftIcon ? React.createElement("span", { className: "inline-flex items-center", "aria-hidden": "true" }, leftIcon) : null,
        React.createElement("span", null, children),
        rightIcon
          ? React.createElement("span", { className: "inline-flex items-center", "aria-hidden": "true" }, rightIcon)
          : null
      );

  return React.createElement(
    "button",
    {
      ref,
      type: rest.type ?? "button",
      ...rest,
      disabled: isDisabled,
      "data-variant": variant,
      "data-size": size,
      "data-loading": loading ? "true" : undefined,
      "aria-busy": loading || undefined,
      className: clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring,var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface,var(--bg))] disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeText[size],
        className
      ),
      style: {
        borderRadius: `var(--radius-${radiusKey})`,
        height,
        paddingInline,
        "--btn-disabled-bg": "var(--disabled-bg, rgba(255,255,255,0.08))",
        "--btn-disabled-fg": "var(--disabled-fg, rgba(255,255,255,0.45))",
        "--btn-disabled-border": "var(--disabled-border, transparent)",
        ...variantVariables[variant],
        ...style,
      },
    },
    content
  );
});

export default Button;
