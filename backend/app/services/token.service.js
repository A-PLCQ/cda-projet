import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { getPool } from '../config/db.js';
import bcrypt from 'bcrypt';

export function signTokens(payload){
  const jti = uuid();
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES });
  const refreshToken = jwt.sign({ ...payload, jti }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES });
  return { accessToken, refreshToken, jti };
}

export async function persistRefresh({ jti, userId }){
  const pool = getPool();
  const hash = await bcrypt.hash(jti, 10);
  await pool.query(
    `INSERT INTO refresh_token (jti,id_utilisateur,token_hash,expires_at,revoked)
     VALUES (:jti,:uid,:hash, DATE_ADD(NOW(), INTERVAL 30 DAY), 0)`,
    { jti, uid:userId, hash }
  );
}

export async function rotateRefresh(oldToken){
  const payload = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET);
  const pool = getPool();
  const [rows] = await pool.query(`SELECT token_hash, revoked FROM refresh_token WHERE jti=:jti`, { jti: payload.jti });
  if (!rows.length || rows[0].revoked) throw new Error('Refresh invalide');
  // (optionnel) vérifier que hash(jti) correspond
  const { accessToken, refreshToken, jti } = signTokens({ sub:payload.sub, role:payload.role });
  await persistRefresh({ jti, userId: payload.sub });
  await pool.query(`UPDATE refresh_token SET revoked=1, last_used_at=NOW() WHERE jti=:jti`, { jti: payload.jti });
  return { accessToken, refreshToken };
}
