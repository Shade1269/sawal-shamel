import type * as React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted'
  | 'outline'
  | 'glass';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  pill?: boolean;
}

export declare const Badge: React.ForwardRefExoticComponent<
  BadgeProps & React.RefAttributes<HTMLSpanElement>
>;

export default Badge;
