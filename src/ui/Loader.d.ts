import type * as React from 'react';

export type LoaderSize = 'sm' | 'md' | 'lg';
export type LoaderVariant = 'default' | 'glass';

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  subLabel?: React.ReactNode;
  size?: LoaderSize;
  variant?: LoaderVariant;
}

export declare const Loader: React.FC<LoaderProps>;

export default Loader;
