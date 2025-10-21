import * as React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export interface NavLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(({ to, ...rest }, ref) => (
  <Link ref={ref} to={to} {...rest} />
));

NavLink.displayName = 'NavLink';

export default NavLink;
