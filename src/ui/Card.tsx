import React, { forwardRef } from "react";
import clsx from "clsx";
import { useTheme } from "@/hooks/useTheme";

export const Card = forwardRef(function Card(props, ref) {
  const { padding = "md", shadow = true, className, style, children, ...rest } = props;
  const { themeConfig } = useTheme();
  const cardSettings = themeConfig.components?.card ?? {};
  const radiusKey = cardSettings.radius ?? "lg";
  const boxShadow = shadow ? cardSettings.shadow ?? "var(--shadow-card)" : undefined;
  const paddingValue = padding === "none" ? "0" : `var(--space-${padding})`;

  return React.createElement(
    "div",
    {
      ref,
      ...rest,
      "data-card": true,
      className: clsx(
        "bg-[color:var(--surface,var(--bg))] text-[color:var(--surface-fg,var(--fg))]",
        className
      ),
      style: {
        borderRadius: `var(--radius-${radiusKey})`,
        boxShadow,
        padding: paddingValue,
        border: "1px solid var(--surface-border, var(--border))",
        ...style,
      },
    },
    children
  );
});

export default Card;
