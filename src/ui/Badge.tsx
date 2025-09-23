import React, { forwardRef, useMemo } from "react";
import clsx from "clsx";
import { useTheme } from "@/hooks/useTheme";
import { getContrastRatio } from "@/utils/color";

const pickReadableColor = (background, fallback, alt) => {
  const fallbackRatio = getContrastRatio(fallback, background);
  const altRatio = getContrastRatio(alt, background);
  return fallbackRatio >= altRatio ? fallback : alt;
};

export const Badge = forwardRef(function Badge(props, ref) {
  const { variant = "primary", className, style, children, ...rest } = props;
  const { themeConfig } = useTheme();

  const { background, foreground } = useMemo(() => {
    const colors = themeConfig.colors;
    if (variant === "muted") {
      return {
        background: colors.muted ?? colors.border ?? "#cccccc",
        foreground: colors.mutedFg ?? colors.fg,
      };
    }
    if (variant === "success") {
      const bg = colors.success ?? "#16a34a";
      return {
        background: bg,
        foreground: pickReadableColor(bg, colors.bg, colors.fg),
      };
    }
    if (variant === "warning") {
      const bg = colors.warning ?? "#f97316";
      return {
        background: bg,
        foreground: pickReadableColor(bg, colors.bg, colors.fg),
      };
    }
    if (variant === "danger") {
      const bg = colors.danger ?? "#ef4444";
      return {
        background: bg,
        foreground: pickReadableColor(bg, colors.bg, colors.fg),
      };
    }
    const primaryBg = colors.primary;
    return {
      background: primaryBg,
      foreground: colors.primaryFg ?? pickReadableColor(primaryBg, colors.fg, colors.bg),
    };
  }, [themeConfig, variant]);

  const badgeRadius = themeConfig.components?.badge?.radius ?? "sm";

  return React.createElement(
    "span",
    {
      ref,
      ...rest,
      "data-badge": true,
      "data-variant": variant,
      className: clsx(
        "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide",
        "px-[var(--space-sm)] py-[calc(var(--space-xs)/1.5)]",
        className
      ),
      style: {
        borderRadius: `var(--radius-${badgeRadius})`,
        backgroundColor: background,
        color: foreground,
        ...style,
      },
    },
    children
  );
});

export default Badge;
