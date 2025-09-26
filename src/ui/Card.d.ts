import type * as React from 'react';

export type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'muted' | 'outline' | 'glass';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  shadow?: boolean;
  variant?: CardVariant;
  interactive?: boolean;
}

export declare const Card: React.ForwardRefExoticComponent<
  CardProps & React.RefAttributes<HTMLDivElement>
>;

export default Card;
