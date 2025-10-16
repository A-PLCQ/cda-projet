const { pool } = require('../config/db');
const { ok } = require('../helpers/response');
const { env } = require('../config/env');

exports.health = async (req, res) => {
  const [r] = await pool.query('SELECT 1 AS ok');
  return ok(res, {
    status: 'ok',
    db_ok: r?.[0]?.ok === 1,
    node: process.version,
    mode: env.NODE_ENV,
    db: env.DB.database,
    version: '1.0.0'
  });
};
