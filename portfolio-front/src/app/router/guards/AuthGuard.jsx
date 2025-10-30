import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../store/auth.store';
import { ENV } from '../../../config/env';

export default function AuthGuard({ children }) {
  const isAuth = useAuth((s) => s.isAuthenticated());
  const location = useLocation();

  if (!isAuth) {
    return (
      <Navigate
        to={`/${ENV.adminSlug}/login`}
        replace
        state={{ from: location.pathname }}
      />
    );
  }
  return children;
}
