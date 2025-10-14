import { getPool } from '../config/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { badRequest, unauthorized } from '../helpers/httpErrors.js';
import { signTokens, persistRefresh } from './token.service.js';

export async function register({ email, password, nom_affiche }){
  const pool = getPool();
  const [exists] = await pool.query('SELECT id_utilisateur FROM utilisateur WHERE email=:email', { email });
  if (exists.length) throw badRequest('Email déjà utilisé');

  const id = uuid();
  const hash = await bcrypt.hash(password, 10);
  // rôle par défaut "user"
  await pool.query(
    `INSERT INTO utilisateur (id_utilisateur,email,mot_de_passe_hash,nom_affiche,statut,id_role)
     VALUES (:id,:email,:hash,:nom,'active','user')`,
    { id, email, hash, nom: nom_affiche }
  );
  return await login({ email, password });
}

export async function login({ email, password }){
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT u.id_utilisateur, u.mot_de_passe_hash, r.id_role AS role
     FROM utilisateur u JOIN role r ON r.id_role=u.id_role WHERE u.email=:email`,
    { email }
  );
  if (!rows.length) throw unauthorized('Identifiants invalides');
  const u = rows[0];
  const ok = await bcrypt.compare(password, u.mot_de_passe_hash);
  if (!ok) throw unauthorized('Identifiants invalides');

  const { accessToken, refreshToken, jti } = signTokens({ sub:u.id_utilisateur, role:u.role });
  await persistRefresh({ jti, userId: u.id_utilisateur });
  return { accessToken, refreshToken };
}
