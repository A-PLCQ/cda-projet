import { forbidden } from '../helpers/httpErrors.js';
export default function requireRole(...roles){
  return (req, _res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) throw forbidden('Accès refusé');
    next();
  };
}
