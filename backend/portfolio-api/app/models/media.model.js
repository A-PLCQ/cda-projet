const { pool } = require('../config/db');

async function listMediaForProject(id_projet) {
  const [rows] = await pool.query(
    `SELECT * FROM media WHERE id_projet = ? ORDER BY position_ ASC, date_creation ASC`,
    [id_projet]
  );
  return rows;
}

async function addMedia({ id_media, chemin, legende = null, type, position_, id_projet }) {
  await pool.query(
    `INSERT INTO media (id_media, chemin, legende, type, position_, id_projet)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id_media, chemin, legende, type, position_, id_projet]
  );
}

async function updateMedia(id_media, { legende, type, position_ }) {
  await pool.query(
    `UPDATE media
     SET legende = COALESCE(?, legende),
         type    = COALESCE(?, type),
         position_ = COALESCE(?, position_)
     WHERE id_media = ?`,
    [legende ?? null, type ?? null, position_ ?? null, id_media]
  );
}

async function removeMedia(id_media) {
  await pool.query(`DELETE FROM media WHERE id_media = ?`, [id_media]);
}

module.exports = {
  listMediaForProject,
  addMedia,
  updateMedia,
  removeMedia,
};
