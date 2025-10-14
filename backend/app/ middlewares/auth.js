import jwt from 'jsonwebtoken';
import { unauthorized } from '../helpers/httpErrors.js';

export function authOptional(req, _res, next){
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) {
    try { req.user = jwt.verify(h.slice(7), process.env.JWT_ACCESS_SECRET); } catch {}
  }
  next();
}

export function requireAuth(req, _res, next){
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) throw unauthorized('Token manquant');
  try { req.user = jwt.verify(h.slice(7), process.env.JWT_ACCESS_SECRET); next(); }
  catch { throw unauthorized('Token invalide/expiré'); }
}
