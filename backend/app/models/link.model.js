const { pool } = require('../config/db');

async function listLinksForProject(id_projet) {
  const [rows] = await pool.query(
    `SELECT * FROM lien_projet WHERE id_projet = ? ORDER BY libelle ASC`,
    [id_projet]
  );
  return rows;
}

async function addLink({ id_lien, libelle, url, type, id_projet }) {
  await pool.query(
    `INSERT INTO lien_projet (id_lien, libelle, url, type, id_projet)
     VALUES (?, ?, ?, ?, ?)`,
    [id_lien, libelle, url, type, id_projet]
  );
}

async function removeLink(id_lien) {
  await pool.query(`DELETE FROM lien_projet WHERE id_lien = ?`, [id_lien]);
}

module.exports = {
  listLinksForProject,
  addLink,
  removeLink,
};
