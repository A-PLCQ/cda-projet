const { pool } = require('../config/db');

// ----- LIST/COUNT avec filtres -----
async function listProjects({ limit, offset, q, categorie_slug, statut, mise_en_avant, sort = 'date_creation', order = 'DESC' }) {
  const where = [];
  const params = [];

  if (q) {
    where.push(`(p.titre LIKE ? OR p.extrait LIKE ? OR p.description LIKE ?)`);
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (statut) {
    where.push(`p.statut = ?`);
    params.push(statut);
  }
  if (typeof mise_en_avant !== 'undefined' && mise_en_avant !== null) {
    where.push(`p.est_mis_en_avant = ?`);
    params.push(mise_en_avant ? 1 : 0);
  }
  if (categorie_slug) {
    where.push(`EXISTS (
      SELECT 1 FROM APPARTIENT_A a
      JOIN categorie c ON c.id_categorie = a.id_categorie
      WHERE a.id_projet = p.id_projet AND c.slug = ?
    )`);
    params.push(categorie_slug);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = `ORDER BY p.${['date_creation','date_maj','titre','client','est_mis_en_avant'].includes(sort) ? sort : 'date_creation'} ${order === 'ASC' ? 'ASC' : 'DESC'}`;

  const [rows] = await pool.query(
    `SELECT p.*
     FROM projet p
     ${whereSql}
     ${orderSql}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return rows;
}

async function countProjects({ q, categorie_slug, statut, mise_en_avant }) {
  const where = [];
  const params = [];

  if (q) {
    where.push(`(p.titre LIKE ? OR p.extrait LIKE ? OR p.description LIKE ?)`);
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (statut) {
    where.push(`p.statut = ?`);
    params.push(statut);
  }
  if (typeof mise_en_avant !== 'undefined' && mise_en_avant !== null) {
    where.push(`p.est_mis_en_avant = ?`);
    params.push(mise_en_avant ? 1 : 0);
  }
  if (categorie_slug) {
    where.push(`EXISTS (
      SELECT 1 FROM APPARTIENT_A a
      JOIN categorie c ON c.id_categorie = a.id_categorie
      WHERE a.id_projet = p.id_projet AND c.slug = ?
    )`);
    params.push(categorie_slug);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM projet p ${whereSql}`,
    params
  );
  return total;
}

// ----- GET -----
async function getProjectById(id_projet) {
  const [rows] = await pool.query(`SELECT * FROM projet WHERE id_projet = ? LIMIT 1`, [id_projet]);
  return rows[0] || null;
}

async function getProjectBySlug(slug) {
  const [rows] = await pool.query(`SELECT * FROM projet WHERE slug = ? LIMIT 1`, [slug]);
  return rows[0] || null;
}

// ----- CREATE/UPDATE/DELETE -----
async function createProject(p) {
  await pool.query(
    `INSERT INTO projet
      (id_projet, titre, slug, extrait, description, client, date_debut, date_fin, statut, est_mis_en_avant, id_utilisateur)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.id_projet, p.titre, p.slug, p.extrait || null, p.description || null, p.client || null,
      p.date_debut || null, p.date_fin || null, p.statut, p.est_mis_en_avant ? 1 : 0, p.id_utilisateur
    ]
  );
}

async function updateProject(id_projet, patch) {
  // on ne met à jour que les champs fournis (COALESCE)
  await pool.query(
    `UPDATE projet SET
       titre            = COALESCE(?, titre),
       slug             = COALESCE(?, slug),
       extrait          = COALESCE(?, extrait),
       description      = COALESCE(?, description),
       client           = COALESCE(?, client),
       date_debut       = COALESCE(?, date_debut),
       date_fin         = COALESCE(?, date_fin),
       statut           = COALESCE(?, statut),
       est_mis_en_avant = COALESCE(?, est_mis_en_avant)
     WHERE id_projet = ?`,
    [
      patch.titre ?? null,
      patch.slug ?? null,
      patch.extrait ?? null,
      patch.description ?? null,
      patch.client ?? null,
      patch.date_debut ?? null,
      patch.date_fin ?? null,
      patch.statut ?? null,
      typeof patch.est_mis_en_avant === 'boolean' ? (patch.est_mis_en_avant ? 1 : 0) : null,
      id_projet
    ]
  );
}

async function deleteProject(id_projet) {
  // CASCADE sur media / liens / appartenance via contraintes
  await pool.query(`DELETE FROM projet WHERE id_projet = ?`, [id_projet]);
}

// ----- CATEGORIES <-> PROJET -----
async function setProjectCategories(id_projet, ids_categorie) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM APPARTIENT_A WHERE id_projet = ?`, [id_projet]);
    if (ids_categorie?.length) {
      const values = ids_categorie.map((id) => [id_projet, id]);
      await conn.query(`INSERT INTO APPARTIENT_A (id_projet, id_categorie) VALUES ?`, [values]);
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function getProjectCategories(id_projet) {
  const [rows] = await pool.query(
    `SELECT c.*
     FROM APPARTIENT_A a
     JOIN categorie c ON c.id_categorie = a.id_categorie
     WHERE a.id_projet = ?
     ORDER BY c.nom ASC`,
    [id_projet]
  );
  return rows;
}

module.exports = {
  listProjects,
  countProjects,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  setProjectCategories,
  getProjectCategories,
};
