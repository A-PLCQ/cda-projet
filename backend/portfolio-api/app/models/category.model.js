const { pool } = require('../config/db');

async function listCategories() {
  const [rows] = await pool.query(`SELECT * FROM categorie ORDER BY nom ASC`);
  return rows;
}

async function getCategoryById(id_categorie) {
  const [rows] = await pool.query(`SELECT * FROM categorie WHERE id_categorie = ? LIMIT 1`, [id_categorie]);
  return rows[0] || null;
}

async function getCategoryBySlug(slug) {
  const [rows] = await pool.query(`SELECT * FROM categorie WHERE slug = ? LIMIT 1`, [slug]);
  return rows[0] || null;
}

async function createCategory({ id_categorie, nom, slug, description = null }) {
  await pool.query(
    `INSERT INTO categorie (id_categorie, nom, slug, description) VALUES (?, ?, ?, ?)`,
    [id_categorie, nom, slug, description]
  );
}

async function updateCategory(id_categorie, { nom, slug, description }) {
  await pool.query(
    `UPDATE categorie
     SET nom = COALESCE(?, nom),
         slug = COALESCE(?, slug),
         description = COALESCE(?, description)
     WHERE id_categorie = ?`,
    [nom ?? null, slug ?? null, description ?? null, id_categorie]
  );
}

async function deleteCategory(id_categorie) {
  // Contrainte FK: ON DELETE RESTRICT -> échoue si liée à un projet
  await pool.query(`DELETE FROM categorie WHERE id_categorie = ?`, [id_categorie]);
}

module.exports = {
  listCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
