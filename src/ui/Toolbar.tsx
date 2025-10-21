import React, { forwardRef } from "react";
import clsx from "clsx";

export type ToolbarJustify = "start" | "between" | "end";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  ariaLabel: string;
  justify?: ToolbarJustify;
}

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { ariaLabel, justify = "start", className, children, ...rest },
  ref
) {
  return (
    <div
      {...rest}
      ref={ref}
      role="toolbar"
      aria-label={ariaLabel}
      className={clsx("kit-toolbar", className)}
      data-justify={justify === "start" ? undefined : justify}
    >
      {children}
    </div>
  );
});

export interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(function ToolbarGroup(
  { className, ...rest },
  ref
) {
  return <div {...rest} ref={ref} className={clsx("kit-toolbar__group", className)} />;
});

export interface ToolbarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(function ToolbarSeparator(
  { className, ...rest },
  ref
) {
  return <div {...rest} ref={ref} role="separator" className={clsx("kit-toolbar__separator", className)} />;
});

export default Toolbar;
