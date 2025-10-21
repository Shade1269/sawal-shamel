import type { CSSProperties, ReactNode } from "react";
import React, { forwardRef } from "react";
import clsx from "clsx";

import { useTheme } from "@/hooks/useTheme";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "muted"
  | "outline"
  | "glass";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  pill?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "primary", leadingIcon, trailingIcon, pill = false, className, style, children, ...rest },
  ref
) {
  const { themeConfig } = useTheme();
  const badgeSettings = themeConfig.components?.badge ?? {};
  const radiusKey = badgeSettings.radius ?? "sm";

  const styleVars: CSSVars = {
    "--kit-badge-radius": pill ? "999px" : `var(--radius-${radiusKey})`,
  };

  return (
    <span
      ref={ref}
      {...rest}
      data-badge="true"
      data-variant={variant}
      className={clsx("kit-badge", className)}
      style={{ ...(styleVars as CSSProperties), ...style }}
    >
      {leadingIcon ? (
        <span aria-hidden="true">{leadingIcon}</span>
      ) : null}
      {children}
      {trailingIcon ? (
        <span aria-hidden="true">{trailingIcon}</span>
      ) : null}
    </span>
  );
});

export default Badge;
export type { BadgeVariant };
