const { pool } = require('../config/db');

// -- SELECTs
async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT u.id_utilisateur, u.email, u.mot_de_passe_hash, u.nom_affiche, u.statut,
            u.date_creation, u.date_maj, u.id_role, r.nom AS role_nom
     FROM utilisateur u
     JOIN role r ON r.id_role = u.id_role
     WHERE u.email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id_utilisateur) {
  const [rows] = await pool.query(
    `SELECT u.id_utilisateur, u.email, u.nom_affiche, u.statut,
            u.date_creation, u.date_maj, u.id_role, r.nom AS role_nom
     FROM utilisateur u
     JOIN role r ON r.id_role = u.id_role
     WHERE u.id_utilisateur = ? LIMIT 1`,
    [id_utilisateur]
  );
  return rows[0] || null;
}

// -- INSERT/UPDATE
async function createUser({ id_utilisateur, email, mot_de_passe_hash, nom_affiche, id_role, statut = null }) {
  await pool.query(
    `INSERT INTO utilisateur (id_utilisateur, email, mot_de_passe_hash, nom_affiche, id_role, statut)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id_utilisateur, email, mot_de_passe_hash, nom_affiche, id_role, statut]
  );
}

async function updateUserProfile({ id_utilisateur, nom_affiche, statut, id_role }) {
  await pool.query(
    `UPDATE utilisateur
     SET nom_affiche = COALESCE(?, nom_affiche),
         statut      = COALESCE(?, statut),
         id_role     = COALESCE(?, id_role)
     WHERE id_utilisateur = ?`,
    [nom_affiche, statut, id_role, id_utilisateur]
  );
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUserProfile,
};
