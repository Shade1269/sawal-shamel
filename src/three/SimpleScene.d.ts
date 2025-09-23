import type * as React from 'react';
import type { ThemeThree } from '@/themes/types';

export interface SimpleSceneProps {
  config: ThemeThree;
  enabled?: boolean;
  className?: string;
  accentColor?: string;
  CanvasComponent?: React.ComponentType<any>;
}

export declare const SimpleScene: React.MemoExoticComponent<
  React.FunctionComponent<SimpleSceneProps>
>;

export default SimpleScene;
