import type { HTMLAttributes } from 'react';
import React from 'react';

export type VisuallyHiddenProps = HTMLAttributes<HTMLElement> & {
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = React.memo(
  ({
    as: Component = 'span',
    className = '',
    style,
    children,
    ...rest
  }) => {
    return (
      <Component
        className={`absolute w-px h-px p-0 m-[-1px] overflow-hidden whitespace-nowrap border-0 ${className}`}
        style={{
          position: 'absolute',
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          ...style,
        }}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';

export default VisuallyHidden;
