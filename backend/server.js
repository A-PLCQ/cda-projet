// Boot robuste pour diagnostiquer facilement en prod (cPanel/Passenger)
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

// ---- Chargement .env (supporte DOTENV_CONFIG_PATH) ----
import dotenv from 'dotenv';
if (process.env.DOTENV_CONFIG_PATH && fs.existsSync(process.env.DOTENV_CONFIG_PATH)) {
  dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });
} else {
  dotenv.config(); // tente .env local si présent
}

// ---- App & CORS (autorise localhost + domaine) ----
const app = express();
const allowed = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://a-plcq.com',
  'https://www.a-plcq.com'
];
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

// ---- MySQL pool ----
let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      namedPlaceholders: true,
      connectionLimit: 10
    });
  }
  return pool;
}

// ---- Routes de test / health ----
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await getPool().query('SELECT 1 AS ok');
    res.json({
      ok: true,
      env: {
        node: process.version,
        db: process.env.DB_NAME
      },
      db_ok: rows?.[0]?.ok === 1
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---- Route projets minimale (pour vérifier la BDD) ----
app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await getPool().query('SELECT * FROM projet ORDER BY date_creation DESC');
    res.json({ ok: true, data: rows });
  } catch (e) {
    // Si la table n’existe pas ou BDD KO, on renvoie l’erreur
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---- Static uploads (si besoin) ----
const up = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(up)) {
  try { fs.mkdirSync(up, { recursive: true }); } catch {}
}
app.use('/uploads', express.static(up));

// ---- Start ----
const port = Number(process.env.PORT || 8888);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
