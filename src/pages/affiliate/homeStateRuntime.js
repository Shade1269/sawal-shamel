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

  const sections = ['score', 'share'];

  if (Array.isArray(props.topProducts) && props.topProducts.length > 0) {
    sections.push('product-share');
  }

  sections.push('sales', 'orders');

  return {
    state,
    sections,
  };
};
