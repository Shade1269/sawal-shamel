export const resolveAffiliateHomeStateRuntime = ({ loading, isAuthorized, store }) => {
  if (loading) {
    return 'loading';
  }
  if (!isAuthorized) {
    return 'unauthorized';
  }
  if (!store) {
    return 'no-store';
  }
  return 'ready';
};

export const describeAffiliateHomeSectionsRuntime = (props) => {
  const state = resolveAffiliateHomeStateRuntime(props);
  if (state !== 'ready') {
    return { state, sections: [] };
  }
  return {
    state,
    sections: ['score', 'share', 'sales', 'orders'],
  };
};
