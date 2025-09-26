import type * as React from 'react';

export type ToolbarJustify = 'start' | 'between' | 'end';

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  ariaLabel: string;
  justify?: ToolbarJustify;
}

export interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ToolbarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export declare const Toolbar: React.ForwardRefExoticComponent<
  ToolbarProps & React.RefAttributes<HTMLDivElement>
>;
export declare const ToolbarGroup: React.ForwardRefExoticComponent<
  ToolbarGroupProps & React.RefAttributes<HTMLDivElement>
>;
export declare const ToolbarSeparator: React.ForwardRefExoticComponent<
  ToolbarSeparatorProps & React.RefAttributes<HTMLDivElement>
>;

export default Toolbar;
