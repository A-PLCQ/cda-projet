const { pool } = require('../config/db');

/**
 * saveRefreshToken : enregistre un refresh token hashé
 * @param {object} p { jti, id_utilisateur, token_hash, expires_at, client_type, user_agent, ip }
 */
async function saveRefreshToken(p) {
  await pool.query(
    `INSERT INTO refresh_token
      (jti, id_utilisateur, token_hash, expires_at, revoked, client_type, created_at, last_used_at, user_agent, ip)
     VALUES (?, ?, ?, ?, 0, ?, NOW(), NULL, ?, ?)`,
    [p.jti, p.id_utilisateur, p.token_hash, p.expires_at, p.client_type || null, p.user_agent || null, p.ip || null]
  );
}

/**
 * findValidToken : retrouve un RT valide pour un user + hash
 */
async function findValidToken({ id_utilisateur, token_hash }) {
  const [rows] = await pool.query(
    `SELECT * FROM refresh_token
     WHERE id_utilisateur = ? AND token_hash = ? AND revoked = 0 AND expires_at > NOW()
     LIMIT 1`,
    [id_utilisateur, token_hash]
  );
  return rows[0] || null;
}

async function revokeByJti(jti) {
  await pool.query(`UPDATE refresh_token SET revoked = 1 WHERE jti = ?`, [jti]);
}

async function revokeAllForUser(id_utilisateur) {
  await pool.query(`UPDATE refresh_token SET revoked = 1 WHERE id_utilisateur = ?`, [id_utilisateur]);
}

async function touchLastUsed(jti) {
  await pool.query(`UPDATE refresh_token SET last_used_at = NOW() WHERE jti = ?`, [jti]);
}

module.exports = {
  saveRefreshToken,
  findValidToken,
  revokeByJti,
  revokeAllForUser,
  touchLastUsed,
};
