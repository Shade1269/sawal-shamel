export const getHomeRouteForRoleRuntime = (role) => {
  if (!role) {
    return '/dashboard';
  }

  if (role === 'admin') {
    return '/admin/dashboard';
  }

  if (role === 'merchant') {
    return '/merchant';
  }

  return '/affiliate';
};
