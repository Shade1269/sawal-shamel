import React, { forwardRef } from "react";
import clsx from "clsx";
import { useTheme } from "@/hooks/useTheme";

export const Input = forwardRef(function Input(props, ref) {
  const { invalid = false, className, style, ...rest } = props;
  const { themeConfig } = useTheme();
  const inputSettings = themeConfig.components?.input ?? {};
  const radiusKey = inputSettings.radius ?? "md";

  return React.createElement("input", {
    ref,
    ...rest,
    "data-invalid": invalid ? "true" : undefined,
    "aria-invalid": invalid || undefined,
    className: clsx(
      "w-full border bg-[color:var(--bg)] text-[color:var(--fg)] placeholder:text-[color:var(--muted-fg)]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2",
      invalid
        ? "border-[color:var(--danger)] focus-visible:ring-[color:var(--danger)]"
        : "border-[color:var(--border)]",
      className
    ),
    style: {
      borderRadius: `var(--radius-${radiusKey})`,
      paddingInline: "var(--space-sm)",
      paddingBlock: "calc(var(--space-xs) + 2px)",
      ...style,
    },
  });
});

export default Input;
