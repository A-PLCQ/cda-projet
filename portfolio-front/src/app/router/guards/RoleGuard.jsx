import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../store/auth.store';
import { ENV } from '../../../config/env';

export default function RoleGuard({ children, allow = ['admin', 'editor'] }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to={`/${ENV.adminSlug}/login`} replace />;
  if (!allow.includes(user.role)) return <div className="p-6">Accès refusé</div>;
  return children;
}
