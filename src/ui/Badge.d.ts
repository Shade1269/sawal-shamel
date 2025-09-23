import type * as React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export declare const Badge: React.ForwardRefExoticComponent<
  BadgeProps & React.RefAttributes<HTMLSpanElement>
>;

export default Badge;
