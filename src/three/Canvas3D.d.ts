import type * as React from 'react';
import type { CanvasProps } from '@react-three/fiber';

export interface Canvas3DProps extends Partial<CanvasProps> {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  containerProps?: React.HTMLAttributes<HTMLDivElement> & {
    style?: React.CSSProperties;
  };
  CanvasComponent?: React.ComponentType<any>;
}

export declare function Canvas3D(props: Canvas3DProps): React.ReactElement;
export default Canvas3D;
