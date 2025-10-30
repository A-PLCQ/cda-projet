const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { pool } = require('../config/db');
const { env } = require('../config/env');
const { ok, created, noContent } = require('../helpers/response');

/* ----------------------------- helpers tokens ----------------------------- */

async function hash(str) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(str, salt);
}

function signAccessToken(user) {
  // OPTION A : rôle TECHNIQUE dans le JWT (admin|editor|user)
  const payload = {
    sub: user.id_utilisateur,
    email: user.email,
    role: (user.id_role || 'user').toLowerCase(),
  };
  return jwt.sign(payload, env.JWT.accessSecret, { expiresIn: env.JWT.accessExpires });
}

// convertit "30d" -> 30 (jours). Si échec, 30 par défaut.
function refreshDays() {
  const raw = String(env.JWT.refreshExpires || '30d');
  const m = /^(\d+)\s*d/.exec(raw);
  return m ? Number(m[1]) : 30;
}

async function issueRefreshToken(id_utilisateur, meta = {}) {
  const jti = uuid();
  const refresh_token = uuid();                 // opaque côté client
  const token_hash = await hash(refresh_token); // stocké en base

  await pool.query(
    `INSERT INTO refresh_token
       (jti, id_utilisateur, token_hash, expires_at, revoked, client_type, created_at, last_used_at, user_agent, ip)
     VALUES
       (?,   ?,              ?,          DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY), 0,      ?,           UTC_TIMESTAMP(), NULL,         ?,         ?)`,
    [jti, id_utilisateur, token_hash, refreshDays(), meta.client_type || null, meta.user_agent || null, meta.ip || null]
  );

  return { jti, refresh_token };
}

async function verifyRefreshToken(id_utilisateur, refresh_token) {
  const [rows] = await pool.query(
    `SELECT jti, token_hash, expires_at, revoked
       FROM refresh_token
      WHERE id_utilisateur = ?
        AND revoked = 0
        AND expires_at > UTC_TIMESTAMP()
      ORDER BY created_at DESC
      LIMIT 10`,
    [id_utilisateur]
  );

  for (const row of rows) {
    const ok = await bcrypt.compare(refresh_token, row.token_hash);
    if (ok) return row;
  }
  return null;
}

async function revokeByJti(jti) {
  await pool.query(
    `UPDATE refresh_token
        SET revoked = 1, last_used_at = UTC_TIMESTAMP()
      WHERE jti = ? AND revoked = 0`,
    [jti]
  );
}

/* --------------------------------- SCHEMAS -------------------------------- */

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nom_affiche: z.string().min(2),
  // id_role est VARCHAR dans ta BDD
  role: z.enum(['admin','editor','user']).optional().default('user'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const RefreshSchema = z.object({
  id_utilisateur: z.string().uuid(),
  refresh_token: z.string().min(8),
});

const LogoutSchema = z.object({
  jti: z.string().uuid(),
});

/* -------------------------------- register -------------------------------- */

exports.register = async (req, res, next) => {
  try {
    const body = await RegisterSchema.parseAsync(req.body);

    // email unique ?
    const [exists] = await pool.query(
      'SELECT id_utilisateur FROM utilisateur WHERE email = ? LIMIT 1',
      [body.email]
    );
    if (exists.length) {
      return res.status(409).json({ error: { message: 'Email already registered' } });
    }

    const id_utilisateur = uuid();
    const mot_de_passe_hash = await hash(body.password);

    // INSERT utilisateur (mot_de_passe_hash + id_role VARCHAR)
    await pool.query(
      `INSERT INTO utilisateur
        (id_utilisateur, email, mot_de_passe_hash, nom_affiche, statut, date_creation, id_role)
       VALUES
        (?, ?, ?, ?, 'actif', UTC_TIMESTAMP(), ?)`,
      [id_utilisateur, body.email, mot_de_passe_hash, body.nom_affiche, body.role]
    );

    // relire l’utilisateur + role_nom (optional)
    const [rows] = await pool.query(
      `SELECT u.id_utilisateur, u.email, u.nom_affiche, u.id_role, r.nom AS role_nom
         FROM utilisateur u
    LEFT JOIN role r ON r.id_role = u.id_role
        WHERE u.id_utilisateur = ?`,
      [id_utilisateur]
    );
    const u = rows[0];

    const access_token = signAccessToken(u);
    const { jti, refresh_token } = await issueRefreshToken(u.id_utilisateur, {
      client_type: 'web',
      user_agent: req.headers['user-agent'] || null,
      ip: req.ip || null,
    });

    return created(res, {
      user: {
        id_utilisateur: u.id_utilisateur,
        email: u.email,
        role: u.id_role,                 // code technique
        role_nom: u.role_nom || u.id_role,
        nom_affiche: u.nom_affiche,
      },
      access_token,
      refresh_token,
      jti,
    });
  } catch (e) { next(e); }
};

/* ---------------------------------- login --------------------------------- */

exports.login = async (req, res, next) => {
  try {
    const body = await LoginSchema.parseAsync(req.body);

    const [rows] = await pool.query(
      `SELECT u.id_utilisateur, u.email, u.mot_de_passe_hash, u.nom_affiche, u.id_role, r.nom AS role_nom
         FROM utilisateur u
    LEFT JOIN role r ON r.id_role = u.id_role
        WHERE u.email = ? LIMIT 1`,
      [body.email]
    );
    const u = rows[0];
    if (!u) return res.status(401).json({ error: { message: 'Invalid credentials' } });

    const match = await bcrypt.compare(body.password, u.mot_de_passe_hash || '');
    if (!match) return res.status(401).json({ error: { message: 'Invalid credentials' } });

    const access_token = signAccessToken(u);
    const { jti, refresh_token } = await issueRefreshToken(u.id_utilisateur, {
      client_type: 'web',
      user_agent: req.headers['user-agent'] || null,
      ip: req.ip || null,
    });

    return ok(res, {
      user: {
        id_utilisateur: u.id_utilisateur,
        email: u.email,
        role: u.id_role,                 // code technique
        role_nom: u.role_nom || u.id_role,
        nom_affiche: u.nom_affiche,
      },
      access_token,
      refresh_token,
      jti,
    });
  } catch (e) { next(e); }
};

/* --------------------------------- refresh -------------------------------- */

exports.refresh = async (req, res, next) => {
  try {
    const { id_utilisateur, refresh_token } = await RefreshSchema.parseAsync(req.body);

    const row = await verifyRefreshToken(id_utilisateur, refresh_token);
    if (!row) return res.status(401).json({ error: { message: 'Invalid refresh token' } });

    // relecture de l'utilisateur pour regénérer un access token frais
    const [rows] = await pool.query(
      `SELECT u.id_utilisateur, u.email, u.nom_affiche, u.id_role, r.nom AS role_nom
         FROM utilisateur u
    LEFT JOIN role r ON r.id_role = u.id_role
        WHERE u.id_utilisateur = ?`,
      [id_utilisateur]
    );
    const u = rows[0];
    if (!u) return res.status(401).json({ error: { message: 'User not found' } });

    const access_token = signAccessToken(u);

    // trace facultative
    await pool.query(
      `UPDATE refresh_token
          SET last_used_at = UTC_TIMESTAMP(), user_agent = COALESCE(user_agent, ?), ip = COALESCE(ip, ?)
        WHERE jti = ?`,
      [req.headers['user-agent'] || null, req.ip || null, row.jti]
    );

    return ok(res, { access_token });
  } catch (e) { next(e); }
};

/* ---------------------------------- logout -------------------------------- */

exports.logout = async (req, res, next) => {
  try {
    const { jti } = await LogoutSchema.parseAsync(req.body);
    await revokeByJti(jti);
    return noContent(res);
  } catch (e) { next(e); }
};
