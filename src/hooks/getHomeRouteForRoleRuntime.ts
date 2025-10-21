import type { FastUserProfile } from './useFastAuth';

export type Role = FastUserProfile['role'];

export const getHomeRouteForRoleRuntime = (role?: Role | null): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'moderator':
      return '/admin/dashboard';
    case 'affiliate':
      return '/affiliate';
    case 'marketer':
      return '/affiliate';
    case 'merchant':
      return '/merchant';
    case 'customer':
      return '/';
    default:
      return '/';
  }
};
