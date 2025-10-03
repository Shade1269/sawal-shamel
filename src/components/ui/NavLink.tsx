import * as React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Routes } from '@/routes';

export interface NavLinkProps extends Omit<LinkProps, 'to'> {
  to: keyof typeof Routes;
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, ...rest }, ref) => (
    <Link ref={ref} to={Routes[to]} {...rest} />
  )
);

NavLink.displayName = 'NavLink';

export default NavLink;
