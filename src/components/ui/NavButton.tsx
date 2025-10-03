import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface NavButtonProps extends ButtonProps {
  to: string;
  onBeforeNavigate?: () => void;
}

export const NavButton: React.FC<React.PropsWithChildren<NavButtonProps>> = ({
  to,
  onBeforeNavigate,
  children,
  ...rest
}) => {
  const navigate = useNavigate();
  return (
    <Button
      {...rest}
      onClick={(event) => {
        onBeforeNavigate?.();
        if (typeof rest.onClick === 'function') {
          (rest.onClick as any)(event);
        }
        navigate(to);
      }}
    >
      {children}
    </Button>
  );
};

export default NavButton;
