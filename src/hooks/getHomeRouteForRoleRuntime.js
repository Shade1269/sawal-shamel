const normalizeRole = (role) => {
  if (!role) return null;
  if (typeof role !== 'string') return null;
  return role.toLowerCase();
};

export const getHomeRouteForRoleRuntime = (role) => {
  const normalizedRole = normalizeRole(role);

  if (!normalizedRole) {
    return '/';
  }

  if (normalizedRole === 'admin' || normalizedRole === 'moderator') {
    return '/admin/dashboard';
  }

  if (normalizedRole === 'affiliate' || normalizedRole === 'merchant' || normalizedRole === 'marketer') {
    return '/affiliate';
  }

  return '/';
};
