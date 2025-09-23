import React, { forwardRef, useMemo } from "react";
import clsx from "clsx";
import { useTheme } from "@/hooks/useTheme";
import { getContrastRatio } from "@/utils/color";

function pickBestVariable(backgroundHex, candidates) {
  if (!backgroundHex) {
    return candidates[0]?.var ?? "var(--fg)";
  }

  let best = { var: candidates[0]?.var ?? "var(--fg)", ratio: -Infinity };
  for (const candidate of candidates) {
    if (!candidate?.hex) {
      continue;
    }
    const ratio = getContrastRatio(candidate.hex, backgroundHex);
    if (Number.isFinite(ratio) && ratio > best.ratio) {
      best = { var: candidate.var, ratio };
    }
  }
  return best.var;
}

export const Badge = forwardRef(function Badge(props, ref) {
  const { variant = "primary", className, style, children, ...rest } = props;
  const { themeConfig } = useTheme();

  const tokens = useMemo(() => {
    const colors = themeConfig.colors;
    const fallback = (value, hex) => ({ var: value, hex });

    const variants = {
      primary: {
        bgVar: "var(--primary)",
        bgHex: colors.primary,
        fg: pickBestVariable(colors.primary, [
          fallback("var(--primary-fg, var(--fg))", colors.primaryFg ?? colors.fg),
          fallback("var(--fg)", colors.fg),
          fallback("var(--bg)", colors.bg),
        ]),
      },
      success: {
        bgVar: "var(--success)",
        bgHex: colors.success ?? "#22c55e",
        fg: pickBestVariable(colors.success ?? "#22c55e", [
          fallback("var(--success-fg, var(--bg))", colors.successFg ?? colors.bg),
          fallback("var(--fg)", colors.fg),
          fallback("var(--bg)", colors.bg),
        ]),
      },
      warning: {
        bgVar: "var(--warning)",
        bgHex: colors.warning ?? "#f59e0b",
        fg: pickBestVariable(colors.warning ?? "#f59e0b", [
          fallback("var(--warning-fg, var(--fg))", colors.warningFg ?? colors.fg),
          fallback("var(--fg)", colors.fg),
          fallback("var(--bg)", colors.bg),
        ]),
      },
      danger: {
        bgVar: "var(--danger)",
        bgHex: colors.danger ?? "#ef4444",
        fg: pickBestVariable(colors.danger ?? "#ef4444", [
          fallback("var(--danger-fg, var(--fg))", colors.dangerFg ?? colors.fg),
          fallback("var(--fg)", colors.fg),
          fallback("var(--bg)", colors.bg),
        ]),
      },
      muted: {
        bgVar: "var(--muted, var(--surface))",
        bgHex: colors.muted ?? colors.surface ?? colors.border ?? "#6b7280",
        fg: pickBestVariable(colors.muted ?? colors.surface ?? colors.border ?? "#6b7280", [
          fallback("var(--muted-fg, var(--surface-fg, var(--fg)))", colors.mutedFg ?? colors.fg),
          fallback("var(--fg)", colors.fg),
          fallback("var(--bg)", colors.bg),
        ]),
      },
    };

    return variants[variant] ?? variants.primary;
  }, [themeConfig, variant]);

  const badgeRadius = themeConfig.components?.badge?.radius ?? "sm";
  const borderColor = variant === "muted" ? "var(--surface-border, var(--border))" : "transparent";

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
        backgroundColor: tokens.bgVar,
        color: tokens.fg,
        border: `1px solid ${borderColor}`,
        ...style,
      },
    },
    children
  );
});

export default Badge;
