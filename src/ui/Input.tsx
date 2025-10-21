import type { CSSProperties, ReactNode } from "react";
import React, { forwardRef } from "react";
import clsx from "clsx";

import { useTheme } from "@/hooks/useTheme";

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, leadingIcon, trailingIcon, className, style, ...rest },
  ref
) {
  const { themeConfig } = useTheme();
  const inputSettings = themeConfig.components?.input ?? {};
  const radiusKey = inputSettings.radius ?? "md";

  const styleVars: CSSVars = {
    "--kit-input-radius": `var(--radius-${radiusKey})`,
  };

  if (leadingIcon) {
    styleVars["--kit-input-padding-start"] = "calc(var(--space-md, 0.75rem) + var(--space-lg, 1rem))";
  }

  if (trailingIcon) {
    styleVars["--kit-input-padding-end"] = "calc(var(--space-md, 0.75rem) + var(--space-lg, 1rem))";
  }

  return (
    <div className="kit-input-wrapper">
      {leadingIcon ? (
        <span className="kit-input__icon" data-side="start" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}

      <input
        ref={ref}
        {...rest}
        data-invalid={invalid ? "true" : undefined}
        data-focus-ring="true"
        aria-invalid={invalid || undefined}
        className={clsx("kit-input", className)}
        style={{ ...(styleVars as CSSProperties), ...style }}
      />

      {trailingIcon ? (
        <span className="kit-input__icon" data-side="end" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </div>
  );
});

export default Input;
