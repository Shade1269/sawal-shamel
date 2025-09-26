import type { CSSProperties } from "react";
import React, { forwardRef, useMemo } from "react";
import clsx from "clsx";

import { useTheme } from "@/hooks/useTheme";

type CardPadding = "none" | "xs" | "sm" | "md" | "lg";

const PADDING_MAP: Record<CardPadding, string> = {
  none: "0",
  xs: "var(--space-xs, 0.25rem)",
  sm: "var(--space-sm, 0.5rem)",
  md: "var(--space-md, 0.75rem)",
  lg: "var(--space-lg, 1rem)",
};

type CardVariant = "default" | "muted" | "outline" | "glass";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  shadow?: boolean;
  variant?: CardVariant;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padding = "md", shadow = true, variant = "default", interactive = false, className, style, children, ...rest },
  ref
) {
  const { themeConfig } = useTheme();
  const cardSettings = themeConfig.components?.card ?? {};
  const radiusKey = cardSettings.radius ?? "lg";

  const paddingValue = useMemo(() => PADDING_MAP[padding] ?? PADDING_MAP.md, [padding]);

  const styleVars: CSSVars = {
    "--kit-card-radius": `var(--radius-${radiusKey})`,
    "--kit-card-padding": paddingValue,
  };

  if (!shadow) {
    styleVars["--kit-card-shadow"] = "none";
  } else if (cardSettings.shadow) {
    styleVars["--kit-card-shadow"] = cardSettings.shadow;
  }

  return (
    <div
      ref={ref}
      {...rest}
      data-card="true"
      data-variant={variant !== "default" ? variant : undefined}
      data-interactive={interactive ? "true" : undefined}
      className={clsx("kit-card", className)}
      style={{ ...(styleVars as CSSProperties), ...style }}
    >
      {children}
    </div>
  );
});

export default Card;
export type { CardPadding, CardVariant };
