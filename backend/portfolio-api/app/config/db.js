// app/config/db.js
const mysql = require('mysql2/promise');
const { env } = require('./env');

const pool = mysql.createPool(env.DB);

(async () => {
  try {
    const [r] = await pool.query('SELECT 1');
    if (!r) console.warn('[DB] ping returned empty result');
    else console.log('[DB] connected');
  } catch (e) {
    console.error('[DB] connection error:', e.code || e.message);
  }
})();

module.exports = { pool };
