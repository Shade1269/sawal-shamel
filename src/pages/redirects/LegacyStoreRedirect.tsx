import { Navigate, useParams } from "react-router-dom";

const LegacyStoreRedirect = () => {
  const { slug = "" } = useParams<{ slug?: string }>();
  if (!slug) {
    return <Navigate to="/" replace />;
  }
  return <Navigate to={`/${slug}`} replace />;
};

export default LegacyStoreRedirect;
