import type * as React from 'react';

export type SkeletonVariant = 'rect' | 'text' | 'circle' | 'button';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  radius?: string;
}

export declare const Skeleton: React.ForwardRefExoticComponent<
  SkeletonProps & React.RefAttributes<HTMLDivElement>
>;

export default Skeleton;
