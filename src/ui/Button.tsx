import React, { forwardRef, useMemo } from "react";
import clsx from "clsx";
import { useTheme } from "@/hooks/useTheme";

const variantClasses = {
  solid: "bg-[color:var(--primary)] text-[color:var(--primary-fg)] hover:opacity-90 focus-visible:ring-[color:var(--primary)]",
  outline:
    "border border-[color:var(--primary)] text-[color:var(--primary)] bg-transparent hover:bg-[color:var(--primary)]/10 focus-visible:ring-[color:var(--primary)]",
  ghost:
    "bg-transparent text-[color:var(--primary)] hover:bg-[color:var(--muted)]/40 focus-visible:ring-[color:var(--primary)]",
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
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeText[size],
        className
      ),
      style: {
        borderRadius: `var(--radius-${radiusKey})`,
        height,
        paddingInline,
        ...style,
      },
    },
    content
  );
});

export default Button;
