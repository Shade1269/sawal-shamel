import { getHomeRouteForRoleRuntime } from './getHomeRouteForRoleRuntime';
import type { FastUserProfile } from './useFastAuth';

export type Role = FastUserProfile['role'];

export const getHomeRouteForRole = (role?: Role | null) => {
  return getHomeRouteForRoleRuntime(role);
};
