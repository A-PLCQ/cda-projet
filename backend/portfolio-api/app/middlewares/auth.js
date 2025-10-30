// app/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Extrait "Bearer <token>" de l'en-tête Authorization
 */
function getBearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

/**
 * Middleware: exige un access token JWT valide.
 * Charge l'utilisateur décodé dans req.user ( { sub, email, role } ).
 */
function authRequired(req, res, next) {
  const token = getBearer(req);
  if (!token) {
    return res.status(401).json({ error: { message: 'Missing token' } });
  }
  try {
    const payload = jwt.verify(token, env.JWT.accessSecret);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}

/**
 * Middleware d’auto-auth optionnelle (utile pour GET publics, mais on veut l’utilisateur s'il est loggé)
 */
function authOptional(req, res, next) {
  const token = getBearer(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.JWT.accessSecret);
    req.user = payload;
  } catch {
    // ignore token invalid -> reste anonyme
  }
  return next();
}

/**
 * RBAC : exige l’un des rôles indiqués
 * ex: requireRole('admin','editor')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Forbidden' } });
    }
    return next();
  };
}

module.exports = { authRequired, authOptional, requireRole };
